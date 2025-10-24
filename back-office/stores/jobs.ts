import { defineStore } from 'pinia'
import { JobSchema } from '~/utils/odm/schemas/jobSchema'
import type { FetchResult, CreateResult, UpdateResult, DeleteResult, DocumentWithId } from '~/utils/odm/types'
import { nowInBuenosAires, toBuenosAires } from '~/utils/timezone'
import type { Unsubscribe } from 'firebase/firestore'

// Define Job interface based on the schema
export interface Job {
  id: string
  userUid: string
  clientId?: string
  clientName: string
  clientPhone: string
  clientEmail?: string
  serviceType: string
  description: string
  address: string
  scheduledDate: Date
  estimatedDuration: number
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  price: number
  notes: string
  source: 'back_office' | 'client_booking' | 'phone'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  createdBy?: string
  archivedAt?: Date
}

export interface JobCreateInput {
  clientId?: string
  clientName: string
  clientPhone: string
  clientEmail?: string
  serviceType: string
  description?: string
  address: string
  scheduledDate: Date
  estimatedDuration: number
  price?: number
  notes?: string
  status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  source?: 'back_office' | 'client_booking' | 'phone'
}

export interface JobUpdateInput {
  clientId?: string
  clientName?: string
  clientPhone?: string
  clientEmail?: string
  serviceType?: string
  description?: string
  address?: string
  scheduledDate?: Date
  estimatedDuration?: number
  status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  price?: number
  notes?: string
}

export interface TimeOverlapResult {
  hasOverlap: boolean
  conflictJob?: Job
  conflictTime?: string
}

export const useJobsStore = defineStore('jobs', () => {
  // ==========================================
  // STATE
  // ==========================================
  
  const jobs = ref<Job[]>([])
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)
  const initialized = ref<boolean>(false)
  
  // Reactive today date - update this when needed
  const todayDate = ref<string>('')
  
  // Cache to avoid multiple calls to storage/Firestore
  const jobsCache = new Map<string, Job>()
  
  // Schema instance for data operations
  const jobSchema = new JobSchema()
  
  // Real-time subscription
  let unsubscribe: Unsubscribe | null = null

  // ==========================================
  // GETTERS
  // ==========================================

  const getJobById = computed(() => (id: string): Job | null => {
    // Try cache first
    if (jobsCache.has(id)) {
      return jobsCache.get(id) || null
    }
    
    // Fallback to reactive array
    return jobs.value.find(job => job.id === id) || null
  })

  const totalJobs = computed(() => jobs.value.length)

  const activeJobs = computed(() => 
    jobs.value.filter(job => job.isActive !== false)
  )

  const upcomingJobs = computed(() => {
    const now = nowInBuenosAires()
    return activeJobs.value.filter(job => {
      if (!job.scheduledDate) return false

      // Handle both Date objects and Firestore Timestamps
      const actualDate = job.scheduledDate.toDate ? job.scheduledDate.toDate() : job.scheduledDate
      const jobDate = toBuenosAires(actualDate)
      return jobDate.isAfter(now) && ['pending', 'confirmed', 'in_progress'].includes(job.status)
    }).sort((a, b) => {
      const dateA = a.scheduledDate.toDate ? a.scheduledDate.toDate() : a.scheduledDate
      const dateB = b.scheduledDate.toDate ? b.scheduledDate.toDate() : b.scheduledDate
      return toBuenosAires(dateA).diff(toBuenosAires(dateB))
    })
  })

  const todaysJobs = computed(() => {
    // Use reactive today date, fallback to now if not set
    const today = todayDate.value || nowInBuenosAires().format('YYYY-MM-DD')
    return activeJobs.value.filter(job => {
      if (!job.scheduledDate) return false
      
      // Handle both Date objects and Firestore Timestamps consistently
      let jobDate: string
      if (job.scheduledDate.toDate) {
        // Firestore Timestamp
        jobDate = toBuenosAires(job.scheduledDate.toDate()).format('YYYY-MM-DD')
      } else {
        // Regular Date object
        jobDate = toBuenosAires(job.scheduledDate).format('YYYY-MM-DD')
      }
      
      return jobDate === today
    }).sort((a, b) => {
      const dateA = a.scheduledDate.toDate ? a.scheduledDate.toDate() : a.scheduledDate
      const dateB = b.scheduledDate.toDate ? b.scheduledDate.toDate() : b.scheduledDate
      return toBuenosAires(dateA).diff(toBuenosAires(dateB))
    })
  })

  // ==========================================
  // CACHE MANAGEMENT
  // ==========================================

  const updateCache = (job: Job): void => {
    jobsCache.set(job.id, job)
  }

  const removeFromCache = (jobId: string): void => {
    jobsCache.delete(jobId)
  }

  const refreshCache = (): void => {
    jobsCache.clear()
    jobs.value.forEach(job => {
      jobsCache.set(job.id, job)
    })
  }

  // ==========================================
  // DATA OPERATIONS
  // ==========================================

  const loadJobs = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const result: FetchResult<Job> = await jobSchema.find() as FetchResult<Job>;

      if (result.success && result.data) {
        jobs.value = result.data
        refreshCache()
      } else {
        throw new Error(result.error || 'Failed to load jobs')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar trabajos'
      console.error('Error loading jobs:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createJob = async (jobData: JobCreateInput): Promise<string> => {
    loading.value = true
    error.value = null

    try {
      // Prepare data with defaults
      const dataWithDefaults = {
        ...jobData,
        description: jobData.description || `${jobData.serviceType} - ${jobData.clientName}`,
        price: jobData.price || 0,
        notes: jobData.notes || '',
        status: jobData.status || 'pending',
        source: jobData.source || 'back_office',
        isActive: true
      }

      const result: CreateResult = await jobSchema.create(dataWithDefaults)
      
      if (result.success && result.data) {
        const newJob = result.data as Job
        jobs.value.unshift(newJob) // Add to beginning for chronological order
        updateCache(newJob)
        return newJob.id
      } else {
        throw new Error(result.error || 'Failed to create job')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al crear trabajo'
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
      const result: UpdateResult = await jobSchema.update(jobId, updates)
      
      if (result.success) {
        // Update local state
        const jobIndex = jobs.value.findIndex(job => job.id === jobId)
        if (jobIndex !== -1) {
          jobs.value[jobIndex] = {
            ...jobs.value[jobIndex],
            ...updates,
            updatedAt: new Date()
          } as Job
          updateCache(jobs.value[jobIndex])
        }
      } else {
        throw new Error(result.error || 'Failed to update job')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al actualizar trabajo'
      console.error('Error updating job:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteJob = async (jobId: string): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const result: DeleteResult = await jobSchema.delete(jobId)
      
      if (result.success) {
        // Remove from local state
        jobs.value = jobs.value.filter(job => job.id !== jobId)
        removeFromCache(jobId)
      } else {
        throw new Error(result.error || 'Failed to delete job')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al eliminar trabajo'
      console.error('Error deleting job:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // ==========================================
  // BUSINESS LOGIC - SCHEDULE MANAGEMENT
  // ==========================================

  const getDayJobs = (date: string): Job[] => {
    return activeJobs.value.filter(job => {
      if (!job.scheduledDate) return false
      
      // Handle both Date objects and Firestore Timestamps
      let jobDate: string
      if (job.scheduledDate.toDate) {
        // Firestore Timestamp
        jobDate = toBuenosAires(job.scheduledDate.toDate()).format('YYYY-MM-DD')
      } else {
        // Regular Date object
        jobDate = toBuenosAires(job.scheduledDate).format('YYYY-MM-DD')
      }
      
      return jobDate === date
    }).sort((a, b) => {
      const dateA = a.scheduledDate.toDate ? a.scheduledDate.toDate() : a.scheduledDate
      const dateB = b.scheduledDate.toDate ? b.scheduledDate.toDate() : b.scheduledDate
      return toBuenosAires(dateA).diff(toBuenosAires(dateB))
    })
  }

  const getHourJobs = (date: string, hour: number): Job[] => {
    return activeJobs.value.filter(job => {
      if (!job.scheduledDate) return false
      
      const actualDate = job.scheduledDate.toDate ? job.scheduledDate.toDate() : job.scheduledDate
      const jobDate = toBuenosAires(actualDate)
      return jobDate.format('YYYY-MM-DD') === date && jobDate.hour() === hour
    })
  }

  const checkTimeOverlap = (newJobStart: Date, newJobDuration: number, excludeJobId?: string): TimeOverlapResult => {
    const newStart = toBuenosAires(newJobStart)
    const newEnd = newStart.add(newJobDuration, 'minute')
    const newDate = newStart.format('YYYY-MM-DD')
    
    const dayJobs = activeJobs.value.filter(job => {
      if (excludeJobId && job.id === excludeJobId) return false
      if (!job.scheduledDate) return false
      
      const actualDate = job.scheduledDate.toDate ? job.scheduledDate.toDate() : job.scheduledDate
      const jobDate = toBuenosAires(actualDate).format('YYYY-MM-DD')
      return jobDate === newDate
    })
    
    for (const job of dayJobs) {
      const actualDate = job.scheduledDate.toDate ? job.scheduledDate.toDate() : job.scheduledDate
      const jobStart = toBuenosAires(actualDate)
      const jobEnd = jobStart.add(job.estimatedDuration || 120, 'minute')
      
      // Check if times overlap
      if (newStart.isBefore(jobEnd) && newEnd.isAfter(jobStart)) {
        return {
          hasOverlap: true,
          conflictJob: job,
          conflictTime: `${jobStart.format('HH:mm')} - ${jobEnd.format('HH:mm')}`
        }
      }
    }
    
    return { hasOverlap: false }
  }

  // ==========================================
  // BUSINESS LOGIC - TIMELINE POSITIONING
  // ==========================================

  const getWeeklyTimelineJobPosition = (job: Job) => {
    const actualDate = job.scheduledDate.toDate ? job.scheduledDate.toDate() : job.scheduledDate
    const jobStart = toBuenosAires(actualDate)
    const durationMinutes = job.estimatedDuration || 120
    
    const startHour = jobStart.hour()
    const startMinute = jobStart.minute()

    // Calculate position relative to working hours (6 AM = hour 0, 10 PM = hour 16)
    const hourFromStart = startHour - 6 // 6 AM is our starting hour
    const hourHeight = 64 // Each hour row is h-16 (64px)

    // Position calculations
    const topPosition = (hourFromStart * hourHeight) + (startMinute / 60 * hourHeight)
    const jobHeight = Math.max((durationMinutes / 60) * hourHeight, 32) // Minimum height of 32px

    return {
      top: `${topPosition}px`,
      height: `${jobHeight}px`
    }
  }

  const getDayViewJobPosition = (job: Job) => {
    const actualDate = job.scheduledDate.toDate ? job.scheduledDate.toDate() : job.scheduledDate
    const jobStart = toBuenosAires(actualDate)
    const durationMinutes = job.estimatedDuration || 120

    const startHour = jobStart.hour()
    const startMinute = jobStart.minute()

    // Calculate position relative to working hours (6 AM = hour 0, 10 PM = hour 16)
    const hourFromStart = startHour - 6 // 6 AM is our starting hour
    const hourHeight = 64 // Each hour row is h-16 (64px)

    // Position calculations
    const topPosition = (hourFromStart * hourHeight) + (startMinute / 60 * hourHeight)
    const jobHeight = (durationMinutes / 60) * hourHeight

    return {
      top: `${topPosition}px`,
      height: `${jobHeight}px`
    }
  }

  // ==========================================
  // BUSINESS LOGIC - JOB STATUS & VALIDATION
  // ==========================================

  const isJobInFuture = (job: Job): boolean => {
    if (!job.scheduledDate) return false
    
    const actualDate = job.scheduledDate.toDate ? job.scheduledDate.toDate() : job.scheduledDate
    const jobDateTime = toBuenosAires(actualDate)
    const now = nowInBuenosAires()
    
    return jobDateTime.isAfter(now)
  }

  const getJobStatusColor = (status: string): string => {
    const colors = {
      pending: 'bg-yellow-50 border-yellow-300 hover:bg-yellow-100',
      confirmed: 'bg-blue-50 border-blue-300 hover:bg-blue-100',
      in_progress: 'bg-orange-50 border-orange-300 hover:bg-orange-100',
      completed: 'bg-green-50 border-green-300 hover:bg-green-100',
      cancelled: 'bg-red-50 border-red-300 hover:bg-red-100'
    }
    return colors[status] || colors.pending
  }

  const formatJobTime = (scheduledDate: Date, duration: number): string => {
    const actualDate = scheduledDate.toDate ? scheduledDate.toDate() : scheduledDate
    const start = toBuenosAires(actualDate)
    const end = start.add(duration, 'minute')
    return `${start.format('HH:mm')} - ${end.format('HH:mm')}`
  }

  // ==========================================
  // QUERY METHODS
  // ==========================================

  const getJobsByClient = (clientId: string): Job[] => {
    if (!clientId) return []
    
    return activeJobs.value.filter(job => job.clientId === clientId)
      .sort((a, b) => toBuenosAires(b.scheduledDate).diff(toBuenosAires(a.scheduledDate)))
  }

  const getJobsByDateRange = (startDate: string, endDate: string): Job[] => {
    return activeJobs.value.filter(job => {
      if (!job.scheduledDate) return false
      
      const actualDate = job.scheduledDate.toDate ? job.scheduledDate.toDate() : job.scheduledDate
      const jobDate = toBuenosAires(actualDate).format('YYYY-MM-DD')
      
      return jobDate >= startDate && jobDate <= endDate
    }).sort((a, b) => toBuenosAires(a.scheduledDate).diff(toBuenosAires(b.scheduledDate)))
  }

  const getJobsByStatus = (status: string): Job[] => {
    return activeJobs.value.filter(job => job.status === status)
      .sort((a, b) => toBuenosAires(a.scheduledDate).diff(toBuenosAires(b.scheduledDate)))
  }

  // ==========================================
  // REAL-TIME SUBSCRIPTION
  // ==========================================

  const subscribeToJobs = (): void => {
    if (unsubscribe) {
      unsubscribe()
    }

    unsubscribe = jobSchema.subscribeToCollection(
      (documents: DocumentWithId[]) => {
        jobs.value = documents as Job[]
        refreshCache()
        console.log('Jobs updated via real-time subscription:', documents.length)
      }
    )
  }

  const unsubscribeFromJobs = (): void => {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
  }

  // ==========================================
  // STATISTICS
  // ==========================================

  const getJobStats = () => {
    const allJobs = activeJobs.value
    const completedJobs = allJobs.filter(job => job.status === 'completed')
    const totalRevenue = completedJobs.reduce((sum, job) => sum + (job.price || 0), 0)
    const averageJobValue = completedJobs.length > 0 ? totalRevenue / completedJobs.length : 0

    return {
      totalJobs: allJobs.length,
      completedJobs: completedJobs.length,
      totalRevenue,
      averageJobValue,
      pendingJobs: allJobs.filter(job => job.status === 'pending').length,
      upcomingJobs: upcomingJobs.value.length
    }
  }

  // ==========================================
  // INITIALIZATION
  // ==========================================

  const initialize = async (): Promise<void> => {
    if (initialized.value) return
    
    try {
      // Set today's date for reactive computations
      todayDate.value = nowInBuenosAires().format('YYYY-MM-DD')
      
      await loadJobs()
      subscribeToJobs()
      initialized.value = true
    } catch (err) {
      console.error('Error initializing jobs store:', err)
      // Don't throw here, let the component handle the error state
    }
  }

  const updateTodayDate = (): void => {
    todayDate.value = nowInBuenosAires().format('YYYY-MM-DD')
  }

  const cleanup = (): void => {
    unsubscribeFromJobs()
    jobsCache.clear()
    initialized.value = false
    todayDate.value = ''
  }

  // ==========================================
  // RETURN STORE INTERFACE
  // ==========================================

  return {
    // State
    jobs: readonly(jobs),
    loading: readonly(loading),
    error: readonly(error),

    // Getters
    getJobById,
    totalJobs,
    activeJobs,
    upcomingJobs,
    todaysJobs,

    // Data Operations
    loadJobs,
    createJob,
    updateJob,
    deleteJob,

    // Schedule Management
    getDayJobs,
    getHourJobs,
    checkTimeOverlap,

    // Timeline Positioning
    getWeeklyTimelineJobPosition,
    getDayViewJobPosition,

    // Job Status & Validation
    isJobInFuture,
    getJobStatusColor,
    formatJobTime,

    // Query Methods
    getJobsByClient,
    getJobsByDateRange,
    getJobsByStatus,

    // Real-time Subscription
    subscribeToJobs,
    unsubscribeFromJobs,

    // Statistics
    getJobStats,

    // Lifecycle
    initialize,
    cleanup,
    updateTodayDate
  }
})