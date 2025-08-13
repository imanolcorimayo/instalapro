import { defineStore } from 'pinia'
import { 
  nowInBuenosAires,
  toBuenosAires,
  startOfDayInBuenosAires,
  endOfDayInBuenosAires,
  isTodayInBuenosAires,
  formatInBuenosAires,
  startOfWeekInBuenosAires
} from '~/utils/timezone'
import type { 
  Job,
  JobCreateInput,
  JobUpdateInput,
  TimeSlot,
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

// Simplified slot generation options
const createDefaultSlotOptions = (): SlotGenerationOptions => ({
  slotDuration: 120, // 2 hour default slots (more realistic for AC work)
  bufferTime: 30, // 30 minutes between appointments
  advanceBookingDays: 14, // Generate slots 2 weeks ahead (reduced complexity)
  minBookingNotice: 4 // Minimum 4 hours notice
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
  const initialized = ref<boolean>(false)

  // ==========================================
  // GETTERS - SIMPLIFIED
  // ==========================================

  const upcomingJobs = computed(() => {
    const now = nowInBuenosAires()
    return jobs.value
      .filter(job => toBuenosAires(job.scheduledDate).isAfter(now))
      .sort((a, b) => toBuenosAires(a.scheduledDate).diff(toBuenosAires(b.scheduledDate)))
  })

  const todaysJobs = computed(() => {
    return jobs.value.filter(job => isTodayInBuenosAires(job.scheduledDate))
  })

  const availableSlotsForDate = computed(() => (date: string) => {
    return timeSlots.value
      .filter(slot => slot.date === date && slot.status === 'available')
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  })

  // ==========================================
  // ACTIONS - DATA PERSISTENCE (FIXED)
  // ==========================================

  const saveToLocalStorage = () => {
    try {
      // Save jobs with consistent timezone handling
      localStorage.setItem(
        STORAGE_KEYS.JOBS, 
        JSON.stringify(jobs.value.map(job => ({
          ...job,
          scheduledDate: toBuenosAires(job.scheduledDate).toISOString(),
          createdAt: toBuenosAires(job.createdAt).toISOString(),
          updatedAt: toBuenosAires(job.updatedAt).toISOString()
        })))
      )

      // Save time slots
      localStorage.setItem(
        STORAGE_KEYS.TIME_SLOTS,
        JSON.stringify(timeSlots.value.map(slot => ({
          ...slot,
          createdAt: toBuenosAires(slot.createdAt).toISOString(),
          updatedAt: toBuenosAires(slot.updatedAt).toISOString()
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
          scheduledDate: toBuenosAires(job.scheduledDate),
          createdAt: toBuenosAires(job.createdAt),
          updatedAt: toBuenosAires(job.updatedAt)
        }))
      }

      // Load time slots
      const storedSlots = localStorage.getItem(STORAGE_KEYS.TIME_SLOTS)
      if (storedSlots) {
        const parsedSlots = JSON.parse(storedSlots)
        timeSlots.value = parsedSlots.map((slot: any) => ({
          ...slot,
          createdAt: toBuenosAires(slot.createdAt),
          updatedAt: toBuenosAires(slot.updatedAt)
        }))
      }

      // Load slot options
      const storedOptions = localStorage.getItem(STORAGE_KEYS.SLOT_OPTIONS)
      if (storedOptions) {
        slotOptions.value = JSON.parse(storedOptions)
      }
    } catch (err) {
      console.error('Error loading schedule from localStorage:', err)
      // Reset to defaults on error
      jobs.value = []
      timeSlots.value = []
      slotOptions.value = createDefaultSlotOptions()
    }
  }

  // ==========================================
  // ACTIONS - TIME SLOT GENERATION (FIXED)
  // ==========================================

  const clearAllSlots = (technicianId: string): void => {
    timeSlots.value = timeSlots.value.filter(slot => 
      slot.technicianId !== technicianId || slot.status === 'booked'
    )
  }

  const generateTimeSlots = async (
    availability: WeeklyAvailability,
    technicianId: string
  ): Promise<void> => {
    if (loading.value) return // Prevent concurrent generations
    
    loading.value = true
    error.value = null

    try {
      // Clear existing available slots (keep booked ones)
      clearAllSlots(technicianId)

      const startDate = nowInBuenosAires().startOf('day')
      const endDate = startDate.add(slotOptions.value.advanceBookingDays, 'day')
      
      const newSlots: TimeSlot[] = []
      let currentDate = startDate

      while (currentDate.isBefore(endDate)) {
        const dayOfWeek = getDayOfWeekFromDate(currentDate)
        const daySchedule = availability[dayOfWeek]

        if (daySchedule.enabled) {
          const daySlots = generateSlotsForDay(currentDate, daySchedule, technicianId)
          newSlots.push(...daySlots)
        }

        currentDate = currentDate.add(1, 'day')
      }

      timeSlots.value.push(...newSlots)
      saveToLocalStorage()
    } catch (err) {
      error.value = 'Error generando los horarios disponibles'
      console.error('Error generating time slots:', err)
    } finally {
      loading.value = false
    }
  }

  const generateSlotsForDay = (dateMoment: any, daySchedule: DaySchedule, technicianId: string): TimeSlot[] => {
    const slots: TimeSlot[] = []
    const dateString = formatInBuenosAires(dateMoment, 'YYYY-MM-DD')
    
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
      
      // Skip past slots
      const slotDateTime = dateMoment.hour(Math.floor(currentMinutes / 60)).minute(currentMinutes % 60)
      const isPastSlot = slotDateTime.isBefore(nowInBuenosAires())
      
      if (!isPastSlot) {
        const slot: TimeSlot = {
          id: `slot_${technicianId}_${dateString}_${slotStart}`,
          date: dateString,
          startTime: slotStart,
          endTime: slotEnd,
          duration: slotOptions.value.slotDuration,
          status: isBreakTime ? 'break' : 'available',
          technicianId,
          serviceTypes: [],
          createdAt: nowInBuenosAires(),
          updatedAt: nowInBuenosAires()
        }
        
        slots.push(slot)
      }
      
      currentMinutes += slotOptions.value.slotDuration + slotOptions.value.bufferTime
    }
    
    return slots
  }

  // ==========================================
  // ACTIONS - JOB MANAGEMENT (SIMPLIFIED)
  // ==========================================

  const createJob = async (input: JobCreateInput): Promise<Job> => {
    loading.value = true
    error.value = null

    try {
      const now = nowInBuenosAires()
      const newJob: Job = {
        id: `job_${nowInBuenosAires().valueOf()}`,
        ...input,
        scheduledDate: toBuenosAires(input.scheduledDate),
        status: 'pending',
        paid: false,
        createdAt: now,
        updatedAt: now
      }

      jobs.value.push(newJob)
      
      // Book the corresponding time slot
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
    const jobIndex = jobs.value.findIndex(job => job.id === jobId)
    if (jobIndex === -1) {
      throw new Error('Trabajo no encontrado')
    }

    const oldJob = jobs.value[jobIndex]
    
    jobs.value[jobIndex] = {
      ...oldJob,
      ...updates,
      updatedAt: nowInBuenosAires()
    }

    // Update time slot booking if schedule changed
    if (updates.scheduledDate) {
      await updateTimeSlotBooking(oldJob, jobs.value[jobIndex])
    }

    saveToLocalStorage()
  }

  const deleteJob = async (jobId: string): Promise<void> => {
    const jobIndex = jobs.value.findIndex(job => job.id === jobId)
    if (jobIndex === -1) {
      throw new Error('Trabajo no encontrado')
    }

    const job = jobs.value[jobIndex]
    
    // Free up the time slot
    await freeTimeSlotFromJob(job)
    
    jobs.value.splice(jobIndex, 1)
    saveToLocalStorage()
  }

  // ==========================================
  // ACTIONS - TIME SLOT MANAGEMENT (SIMPLIFIED)
  // ==========================================

  const bookTimeSlotForJob = async (job: Job): Promise<void> => {
    const dateString = formatInBuenosAires(job.scheduledDate, 'YYYY-MM-DD')
    const timeString = formatInBuenosAires(job.scheduledDate, 'HH:mm')
    
    const slot = timeSlots.value.find(slot => 
      slot.date === dateString && 
      slot.startTime === timeString &&
      slot.status === 'available'
    )
    
    if (slot) {
      slot.status = 'booked'
      slot.jobId = job.id
      slot.updatedAt = nowInBuenosAires().toDate()
    }
  }

  const freeTimeSlotFromJob = async (job: Job): Promise<void> => {
    const slot = timeSlots.value.find(slot => slot.jobId === job.id)
    
    if (slot) {
      slot.status = 'available'
      slot.jobId = undefined
      slot.updatedAt = nowInBuenosAires().toDate()
    }
  }

  const updateTimeSlotBooking = async (oldJob: Job, newJob: Job): Promise<void> => {
    await freeTimeSlotFromJob(oldJob)
    await bookTimeSlotForJob(newJob)
  }

  // ==========================================
  // ACTIONS - SCHEDULE VIEWS (SIMPLIFIED)
  // ==========================================

  const getScheduleDay = (date: string, technicianId: string): ScheduleDay => {
    const daySlots = timeSlots.value.filter(slot => 
      slot.date === date && slot.technicianId === technicianId
    )
    
    const dayOfWeek = getDayOfWeekFromDate(toBuenosAires(date + 'T00:00:00'))
    
    return {
      date,
      dayOfWeek,
      isAvailable: daySlots.length > 0,
      timeSlots: daySlots.sort((a, b) => a.startTime.localeCompare(b.startTime)),
      totalSlots: daySlots.length,
      availableSlots: daySlots.filter(s => s.status === 'available').length,
      bookedSlots: daySlots.filter(s => s.status === 'booked').length,
      blockedSlots: daySlots.filter(s => s.status === 'blocked').length
    }
  }

  const getScheduleWeek = (startDate: string, technicianId: string): ScheduleWeek => {
    const start = toBuenosAires(startDate)
    const end = start.add(6, 'day')
    
    const days: ScheduleDay[] = []
    let currentDate = start
    
    for (let i = 0; i < 7; i++) {
      const dateString = formatInBuenosAires(currentDate, 'YYYY-MM-DD')
      days.push(getScheduleDay(dateString, technicianId))
      currentDate = currentDate.add(1, 'day')
    }
    
    const totalAvailableSlots = days.reduce((sum, day) => sum + day.availableSlots, 0)
    const totalBookedSlots = days.reduce((sum, day) => sum + day.bookedSlots, 0)
    
    return {
      startDate: formatInBuenosAires(start, 'YYYY-MM-DD'),
      endDate: formatInBuenosAires(end, 'YYYY-MM-DD'),
      days,
      totalAvailableHours: totalAvailableSlots * (slotOptions.value.slotDuration / 60),
      utilization: totalAvailableSlots > 0 ? (totalBookedSlots / totalAvailableSlots) * 100 : 0
    }
  }

  // ==========================================
  // UTILITY FUNCTIONS
  // ==========================================

  const getDayOfWeekFromDate = (date: any): DayOfWeek => {
    const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    return days[toBuenosAires(date).day()]
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

  // ==========================================
  // INITIALIZATION (SIMPLIFIED)
  // ==========================================

  const initialize = async (): Promise<void> => {
    if (initialized.value) return
    
    loading.value = true
    try {
      loadFromLocalStorage()
      initialized.value = true
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
    jobs: readonly(jobs),
    timeSlots: readonly(timeSlots),
    blockedSlots: readonly(blockedSlots),
    slotOptions: readonly(slotOptions),
    loading: readonly(loading),
    error: readonly(error),

    // Getters
    upcomingJobs,
    todaysJobs,
    availableSlotsForDate,

    // Actions - Time slot generation
    generateTimeSlots,
    clearAllSlots,

    // Actions - Job management
    createJob,
    updateJob,
    deleteJob,

    // Actions - Schedule views
    getScheduleDay,
    getScheduleWeek,

    // Initialization
    initialize
  }
})