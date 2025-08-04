import { defineStore } from 'pinia'
import type { 
  Job,
  JobCreateInput,
  JobUpdateInput,
  TimeSlot,
  TimeSlotCreateInput,
  TimeSlotUpdateInput,
  ScheduleDay,
  ScheduleWeek,
  BlockedTimeSlot,
  SlotGenerationOptions,
  DayOfWeek,
  WeeklyAvailability,
  DaySchedule
} from '~/types'

// LocalStorage keys following project conventions
const STORAGE_KEYS = {
  JOBS: 'instalapro_schedule_jobs',
  TIME_SLOTS: 'instalapro_schedule_timeslots',
  BLOCKED_SLOTS: 'instalapro_schedule_blocked',
  SLOT_OPTIONS: 'instalapro_schedule_options'
} as const

// Default slot generation options
const createDefaultSlotOptions = (): SlotGenerationOptions => ({
  slotDuration: 60, // 1 hour default slots
  bufferTime: 15, // 15 minutes between appointments
  advanceBookingDays: 30, // Generate slots 30 days ahead
  minBookingNotice: 2 // Minimum 2 hours notice
})

export const useScheduleStore = defineStore('schedule', () => {
  // ==========================================
  // STATE
  // ==========================================
  
  const jobs = ref<Job[]>([])
  const timeSlots = ref<TimeSlot[]>([])
  const blockedSlots = ref<BlockedTimeSlot[]>([])
  const slotOptions = ref<SlotGenerationOptions>(createDefaultSlotOptions())
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  // ==========================================
  // GETTERS
  // ==========================================

  const upcomingJobs = computed(() => {
    const now = new Date()
    return jobs.value
      .filter(job => new Date(job.scheduledDate) >= now)
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
  })

  const todaysJobs = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return jobs.value.filter(job => 
      job.scheduledDate.toISOString().split('T')[0] === today
    )
  })

  const availableSlotsForDate = computed(() => (date: string) => {
    return timeSlots.value.filter(slot => 
      slot.date === date && slot.status === 'available'
    )
  })

  const bookedSlotsForDate = computed(() => (date: string) => {
    return timeSlots.value.filter(slot => 
      slot.date === date && slot.status === 'booked'
    )
  })

  // ==========================================
  // ACTIONS - DATA PERSISTENCE
  // ==========================================

  const saveToLocalStorage = () => {
    try {
      // Save jobs
      localStorage.setItem(
        STORAGE_KEYS.JOBS, 
        JSON.stringify(jobs.value.map(job => ({
          ...job,
          scheduledDate: job.scheduledDate.toISOString(),
          createdAt: job.createdAt.toISOString(),
          updatedAt: job.updatedAt.toISOString()
        })))
      )

      // Save time slots
      localStorage.setItem(
        STORAGE_KEYS.TIME_SLOTS,
        JSON.stringify(timeSlots.value.map(slot => ({
          ...slot,
          createdAt: slot.createdAt.toISOString(),
          updatedAt: slot.updatedAt.toISOString()
        })))
      )

      // Save blocked slots
      localStorage.setItem(
        STORAGE_KEYS.BLOCKED_SLOTS,
        JSON.stringify(blockedSlots.value.map(blocked => ({
          ...blocked,
          createdAt: blocked.createdAt.toISOString(),
          updatedAt: blocked.updatedAt.toISOString()
        })))
      )

      // Save slot options
      localStorage.setItem(STORAGE_KEYS.SLOT_OPTIONS, JSON.stringify(slotOptions.value))
    } catch (err) {
      console.error('Error saving schedule to localStorage:', err)
      error.value = 'Error guardando los datos de la agenda'
    }
  }

  const loadFromLocalStorage = () => {
    try {
      // Load jobs
      const storedJobs = localStorage.getItem(STORAGE_KEYS.JOBS)
      if (storedJobs) {
        const parsedJobs = JSON.parse(storedJobs)
        jobs.value = parsedJobs.map((job: any) => ({
          ...job,
          scheduledDate: new Date(job.scheduledDate),
          createdAt: new Date(job.createdAt),
          updatedAt: new Date(job.updatedAt)
        }))
      }

      // Load time slots
      const storedSlots = localStorage.getItem(STORAGE_KEYS.TIME_SLOTS)
      if (storedSlots) {
        const parsedSlots = JSON.parse(storedSlots)
        timeSlots.value = parsedSlots.map((slot: any) => ({
          ...slot,
          createdAt: new Date(slot.createdAt),
          updatedAt: new Date(slot.updatedAt)
        }))
      }

      // Load blocked slots
      const storedBlocked = localStorage.getItem(STORAGE_KEYS.BLOCKED_SLOTS)
      if (storedBlocked) {
        const parsedBlocked = JSON.parse(storedBlocked)
        blockedSlots.value = parsedBlocked.map((blocked: any) => ({
          ...blocked,
          createdAt: new Date(blocked.createdAt),
          updatedAt: new Date(blocked.updatedAt)
        }))
      }

      // Load slot options
      const storedOptions = localStorage.getItem(STORAGE_KEYS.SLOT_OPTIONS)
      if (storedOptions) {
        slotOptions.value = JSON.parse(storedOptions)
      }
    } catch (err) {
      console.error('Error loading schedule from localStorage:', err)
    }
  }

  // ==========================================
  // ACTIONS - TIME SLOT GENERATION
  // ==========================================

  const regenerateSlotsFromAvailability = async (
    availability: WeeklyAvailability,
    technicianId: string
  ): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      // Only regenerate future slots to preserve existing bookings
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      
      const endDate = new Date(Date.now() + slotOptions.value.advanceBookingDays * 24 * 60 * 60 * 1000)

      // Remove only future available slots (preserve booked ones)
      const futureDateStrings = getDatesInRange(tomorrow, endDate)
      timeSlots.value = timeSlots.value.filter(slot => 
        !futureDateStrings.includes(slot.date) || 
        slot.technicianId !== technicianId ||
        slot.status === 'booked'
      )

      // Generate new slots for future dates
      await generateTimeSlots(availability, technicianId, tomorrow, endDate)
    } catch (err) {
      error.value = 'Error regenerando los horarios'
      console.error('Error regenerating slots from availability:', err)
    } finally {
      loading.value = false
    }
  }

  const generateTimeSlots = async (
    availability: WeeklyAvailability,
    technicianId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const start = startDate || new Date()
      const end = endDate || new Date(Date.now() + slotOptions.value.advanceBookingDays * 24 * 60 * 60 * 1000)

      const newSlots: TimeSlot[] = []
      const currentDate = new Date(start)

      while (currentDate <= end) {
        const dayOfWeek = getDayOfWeekFromDate(currentDate)
        const daySchedule = availability[dayOfWeek]

        if (daySchedule.enabled) {
          const daySlots = generateSlotsForDay(currentDate, daySchedule, technicianId)
          newSlots.push(...daySlots)
        }

        currentDate.setDate(currentDate.getDate() + 1)
      }

      // Remove old slots and add new ones
      const dateRange = getDatesInRange(start, end)
      timeSlots.value = timeSlots.value.filter(slot => 
        !dateRange.includes(slot.date) || slot.technicianId !== technicianId
      )
      
      timeSlots.value.push(...newSlots)
      saveToLocalStorage()
    } catch (err) {
      error.value = 'Error generando los horarios disponibles'
      console.error('Error generating time slots:', err)
    } finally {
      loading.value = false
    }
  }

  const generateSlotsForDay = (date: Date, daySchedule: DaySchedule, technicianId: string): TimeSlot[] => {
    const slots: TimeSlot[] = []
    const dateString = date.toISOString().split('T')[0]
    
    // Parse working hours
    const startMinutes = parseTimeToMinutes(daySchedule.startTime)
    const endMinutes = parseTimeToMinutes(daySchedule.endTime)
    
    // Parse break time if exists
    let breakStartMinutes: number | null = null
    let breakEndMinutes: number | null = null
    
    if (daySchedule.breakStart && daySchedule.breakEnd) {
      breakStartMinutes = parseTimeToMinutes(daySchedule.breakStart)
      breakEndMinutes = parseTimeToMinutes(daySchedule.breakEnd)
    }

    // Generate slots
    let currentMinutes = startMinutes
    
    while (currentMinutes + slotOptions.value.slotDuration <= endMinutes) {
      const slotStart = formatMinutesToTime(currentMinutes)
      const slotEnd = formatMinutesToTime(currentMinutes + slotOptions.value.slotDuration)
      
      // Check if slot overlaps with break time
      const isBreakTime = breakStartMinutes !== null && breakEndMinutes !== null &&
        currentMinutes < breakEndMinutes && (currentMinutes + slotOptions.value.slotDuration) > breakStartMinutes
      
      const slot: TimeSlot = {
        id: `slot_${technicianId}_${dateString}_${slotStart}`,
        date: dateString,
        startTime: slotStart,
        endTime: slotEnd,
        duration: slotOptions.value.slotDuration,
        status: isBreakTime ? 'break' : 'available',
        technicianId,
        serviceTypes: [], // Will be populated based on service requirements
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      slots.push(slot)
      currentMinutes += slotOptions.value.slotDuration + slotOptions.value.bufferTime
    }
    
    return slots
  }

  // ==========================================
  // ACTIONS - JOB MANAGEMENT
  // ==========================================

  const createJob = async (input: JobCreateInput): Promise<Job> => {
    loading.value = true
    error.value = null

    try {
      const now = new Date()
      const newJob: Job = {
        id: `job_${Date.now()}`,
        ...input,
        status: 'pending',
        paid: false,
        createdAt: now,
        updatedAt: now
      }

      jobs.value.push(newJob)
      
      // Book the corresponding time slot if it exists
      await bookTimeSlotForJob(newJob)
      
      saveToLocalStorage()
      return newJob
    } catch (err) {
      error.value = 'Error creando el trabajo'
      console.error('Error creating job:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateJob = async (jobId: string, updates: JobUpdateInput): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const jobIndex = jobs.value.findIndex(job => job.id === jobId)
      if (jobIndex === -1) {
        throw new Error('Trabajo no encontrado')
      }

      const oldJob = jobs.value[jobIndex]
      
      jobs.value[jobIndex] = {
        ...oldJob,
        ...updates,
        updatedAt: new Date()
      }

      // Update time slot booking if schedule changed
      if (updates.scheduledDate) {
        await updateTimeSlotBooking(oldJob, jobs.value[jobIndex])
      }

      saveToLocalStorage()
    } catch (err) {
      error.value = 'Error actualizando el trabajo'
      console.error('Error updating job:', err)
    } finally {
      loading.value = false
    }
  }

  const deleteJob = async (jobId: string): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const jobIndex = jobs.value.findIndex(job => job.id === jobId)
      if (jobIndex === -1) {
        throw new Error('Trabajo no encontrado')
      }

      const job = jobs.value[jobIndex]
      
      // Free up the time slot
      await freeTimeSlotFromJob(job)
      
      jobs.value.splice(jobIndex, 1)
      saveToLocalStorage()
    } catch (err) {
      error.value = 'Error eliminando el trabajo'
      console.error('Error deleting job:', err)
    } finally {
      loading.value = false
    }
  }

  // ==========================================
  // ACTIONS - TIME SLOT MANAGEMENT
  // ==========================================

  const bookTimeSlotForJob = async (job: Job): Promise<void> => {
    const dateString = job.scheduledDate.toISOString().split('T')[0]
    const timeString = job.scheduledDate.toTimeString().substring(0, 5)
    
    const slot = timeSlots.value.find(slot => 
      slot.date === dateString && 
      slot.startTime === timeString &&
      slot.status === 'available'
    )
    
    if (slot) {
      slot.status = 'booked'
      slot.jobId = job.id
      slot.updatedAt = new Date()
    }
  }

  const freeTimeSlotFromJob = async (job: Job): Promise<void> => {
    const slot = timeSlots.value.find(slot => slot.jobId === job.id)
    
    if (slot) {
      slot.status = 'available'
      slot.jobId = undefined
      slot.updatedAt = new Date()
    }
  }

  const updateTimeSlotBooking = async (oldJob: Job, newJob: Job): Promise<void> => {
    // Free old slot
    await freeTimeSlotFromJob(oldJob)
    
    // Book new slot
    await bookTimeSlotForJob(newJob)
  }

  const blockTimeSlot = async (slotId: string, reason: string): Promise<void> => {
    const slot = timeSlots.value.find(s => s.id === slotId)
    if (slot && slot.status === 'available') {
      slot.status = 'blocked'
      slot.updatedAt = new Date()
      
      // Create blocked slot record
      const blockedSlot: BlockedTimeSlot = {
        id: `blocked_${Date.now()}`,
        technicianId: slot.technicianId,
        startDate: slot.date,
        endDate: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        reason,
        isRecurring: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      blockedSlots.value.push(blockedSlot)
      saveToLocalStorage()
    }
  }

  const unblockTimeSlot = async (slotId: string): Promise<void> => {
    const slot = timeSlots.value.find(s => s.id === slotId)
    if (slot && slot.status === 'blocked') {
      slot.status = 'available'
      slot.updatedAt = new Date()
      
      // Remove blocked slot record
      blockedSlots.value = blockedSlots.value.filter(blocked => 
        !(blocked.startDate === slot.date && 
          blocked.startTime === slot.startTime && 
          blocked.technicianId === slot.technicianId)
      )
      
      saveToLocalStorage()
    }
  }

  // ==========================================
  // ACTIONS - SCHEDULE VIEWS
  // ==========================================

  const getScheduleDay = (date: string, technicianId: string): ScheduleDay => {
    const daySlots = timeSlots.value.filter(slot => 
      slot.date === date && slot.technicianId === technicianId
    )
    
    const dayOfWeek = getDayOfWeekFromDate(new Date(date))
    
    return {
      date,
      dayOfWeek,
      isAvailable: daySlots.length > 0,
      timeSlots: daySlots,
      totalSlots: daySlots.length,
      availableSlots: daySlots.filter(s => s.status === 'available').length,
      bookedSlots: daySlots.filter(s => s.status === 'booked').length,
      blockedSlots: daySlots.filter(s => s.status === 'blocked').length
    }
  }

  const getScheduleWeek = (startDate: string, technicianId: string): ScheduleWeek => {
    const start = new Date(startDate)
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    
    const days: ScheduleDay[] = []
    const currentDate = new Date(start)
    
    while (currentDate <= end) {
      const dateString = currentDate.toISOString().split('T')[0]
      days.push(getScheduleDay(dateString, technicianId))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    const totalAvailableSlots = days.reduce((sum, day) => sum + day.availableSlots, 0)
    const totalBookedSlots = days.reduce((sum, day) => sum + day.bookedSlots, 0)
    
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      days,
      totalAvailableHours: totalAvailableSlots * (slotOptions.value.slotDuration / 60),
      utilization: totalAvailableSlots > 0 ? (totalBookedSlots / totalAvailableSlots) * 100 : 0
    }
  }

  // ==========================================
  // UTILITY FUNCTIONS
  // ==========================================

  const getDayOfWeekFromDate = (date: Date): DayOfWeek => {
    const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    return days[date.getDay()]
  }

  const parseTimeToMinutes = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number)
    return hours * 60 + minutes
  }

  const formatMinutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }

  const getDatesInRange = (start: Date, end: Date): string[] => {
    const dates: string[] = []
    const currentDate = new Date(start)
    
    while (currentDate <= end) {
      dates.push(currentDate.toISOString().split('T')[0])
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return dates
  }

  // ==========================================
  // INITIALIZATION
  // ==========================================

  const initialize = async (): Promise<void> => {
    loading.value = true
    try {
      loadFromLocalStorage()
    } catch (err) {
      error.value = 'Error cargando los datos de la agenda'
      console.error('Error initializing schedule store:', err)
    } finally {
      loading.value = false
    }
  }

  // Return store interface
  return {
    // State
    jobs,
    timeSlots,
    blockedSlots,
    slotOptions,
    loading,
    error,

    // Getters
    upcomingJobs,
    todaysJobs,
    availableSlotsForDate,
    bookedSlotsForDate,

    // Actions - Time slot generation
    generateTimeSlots,
    regenerateSlotsFromAvailability,

    // Actions - Job management
    createJob,
    updateJob,
    deleteJob,

    // Actions - Time slot management
    blockTimeSlot,
    unblockTimeSlot,

    // Actions - Schedule views
    getScheduleDay,
    getScheduleWeek,

    // Initialization
    initialize
  }
})