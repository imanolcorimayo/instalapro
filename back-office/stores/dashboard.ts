import { defineStore } from 'pinia'
import { useJobsStore } from '~/stores/jobs'
import { useClientsStore } from '~/stores/clients'
import { useSlotAvailabilityStore } from '~/stores/slotAvailability'
import { nowInBuenosAires, toBuenosAires } from '~/utils/timezone'
import type { Job } from '~/stores/jobs'
import type { Client } from '~/stores/clients'
import type { SlotAvailability } from '~/stores/slotAvailability'

export interface RecentActivity {
  id: string
  type: 'job' | 'client' | 'slot'
  action: string
  description: string
  timestamp: Date
  icon: string
  color: string
}

export interface DashboardKPIs {
  // Today's metrics
  jobsToday: number
  nextJob: Job | null
  pendingJobs: number
  availableHoursToday: number

  // Week metrics
  jobsThisWeek: number
  revenueThisWeek: number
  availableHoursThisWeek: number

  // Monthly metrics
  revenueThisMonth: number
  completedJobsGrowth: number // percentage vs last month

  // Business insights
  newClientsThisMonth: number
  recentActivity: RecentActivity[]
}

export const useDashboardStore = defineStore('dashboard', () => {
  // ==========================================
  // STATE
  // ==========================================

  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)
  const initialized = ref<boolean>(false)

  // Store references
  const jobsStore = useJobsStore()
  const clientsStore = useClientsStore()
  const slotsStore = useSlotAvailabilityStore()

  // ==========================================
  // COMPUTED KPIs
  // ==========================================

  const jobsToday = computed((): number => {
    return jobsStore.todaysJobs.length
  })

  const nextJob = computed((): Job | null => {
    const now = nowInBuenosAires()
    const upcoming = jobsStore.upcomingJobs

    if (upcoming.length === 0) return null

    // Find the next job that hasn't started yet
    return upcoming.find(job => {
      const jobDate = job.scheduledDate.toDate ? job.scheduledDate.toDate() : job.scheduledDate
      return toBuenosAires(jobDate).isAfter(now)
    }) || upcoming[0]
  })

  const pendingJobs = computed((): number => {
    return jobsStore.jobs.filter(job =>
      job.status === 'pending' && job.isActive !== false
    ).length
  })

  const availableHoursToday = computed((): number => {
    const today = nowInBuenosAires().format('YYYY-MM-DD')
    return slotsStore.getAvailableHoursForDate(today).length
  })

  const jobsThisWeek = computed((): number => {
    const weekStart = nowInBuenosAires().startOf('week')
    const weekEnd = nowInBuenosAires().endOf('week')

    return jobsStore.jobs.filter(job => {
      if (!job.scheduledDate || job.isActive === false) return false

      const jobDate = job.scheduledDate.toDate ? job.scheduledDate.toDate() : job.scheduledDate
      const jobDayjs = toBuenosAires(jobDate)

      return jobDayjs.isAfter(weekStart) && jobDayjs.isBefore(weekEnd)
    }).length
  })

  const revenueThisWeek = computed((): number => {
    const weekStart = nowInBuenosAires().startOf('week')
    const weekEnd = nowInBuenosAires().endOf('week')

    return jobsStore.jobs
      .filter(job => {
        if (job.status !== 'completed' || job.isActive === false) return false
        if (!job.scheduledDate) return false

        const jobDate = job.scheduledDate.toDate ? job.scheduledDate.toDate() : job.scheduledDate
        const jobDayjs = toBuenosAires(jobDate)

        return jobDayjs.isAfter(weekStart) && jobDayjs.isBefore(weekEnd)
      })
      .reduce((sum, job) => sum + (job.price || 0), 0)
  })

  const availableHoursThisWeek = computed((): number => {
    const weekStart = nowInBuenosAires().startOf('week')
    const weekEnd = nowInBuenosAires().endOf('week')

    return slotsStore.slots.filter(slot => {
      if (!slot.isAvailable) return false

      const slotDate = toBuenosAires(slot.date)
      return slotDate.isAfter(weekStart) && slotDate.isBefore(weekEnd)
    }).length
  })

  const revenueThisMonth = computed((): number => {
    const monthStart = nowInBuenosAires().startOf('month')
    const monthEnd = nowInBuenosAires().endOf('month')

    return jobsStore.jobs
      .filter(job => {
        if (job.status !== 'completed' || job.isActive === false) return false
        if (!job.scheduledDate) return false

        const jobDate = job.scheduledDate.toDate ? job.scheduledDate.toDate() : job.scheduledDate
        const jobDayjs = toBuenosAires(jobDate)

        return jobDayjs.isAfter(monthStart) && jobDayjs.isBefore(monthEnd)
      })
      .reduce((sum, job) => sum + (job.price || 0), 0)
  })

  const jobsThisMonth = computed((): number => {
    const thisMonthStart = nowInBuenosAires().startOf('month')
    const thisMonthEnd = nowInBuenosAires().endOf('month')

    return jobsStore.jobs.filter(job => {
      if (job.isActive === false) return false
      if (!job.scheduledDate) return false

      const jobDate = job.scheduledDate.toDate ? job.scheduledDate.toDate() : job.scheduledDate
      const jobDayjs = toBuenosAires(jobDate)

      return jobDayjs.isAfter(thisMonthStart) && jobDayjs.isBefore(thisMonthEnd)
    }).length
  })

  const jobsLastMonth = computed((): number => {
    const lastMonthStart = nowInBuenosAires().subtract(1, 'month').startOf('month')
    const lastMonthEnd = nowInBuenosAires().subtract(1, 'month').endOf('month')

    return jobsStore.jobs.filter(job => {
      if (job.isActive === false) return false
      if (!job.scheduledDate) return false

      const jobDate = job.scheduledDate.toDate ? job.scheduledDate.toDate() : job.scheduledDate
      const jobDayjs = toBuenosAires(jobDate)

      return jobDayjs.isAfter(lastMonthStart) && jobDayjs.isBefore(lastMonthEnd)
    }).length
  })

  const newClientsThisMonth = computed((): number => {
    const monthStart = nowInBuenosAires().startOf('month')

    return clientsStore.clients.filter(client => {
      if (client.isActive === false) return false
      if (!client.createdAt) return false

      const createdDate = toBuenosAires(client.createdAt)
      return createdDate.isAfter(monthStart)
    }).length
  })

  const recentActivity = computed((): RecentActivity[] => {
    const activities: RecentActivity[] = []

    // Collect all activities from jobs
    jobsStore.jobs.forEach(job => {
      if (job.updatedAt) {
        activities.push({
          id: job.id,
          type: 'job',
          action: getJobActionLabel(job.status),
          description: `${job.clientName} - ${job.serviceType}`,
          timestamp: job.updatedAt,
          icon: getJobIcon(job.status),
          color: getJobColor(job.status)
        })
      }
    })

    // Collect all activities from clients
    clientsStore.clients.forEach(client => {
      if (client.updatedAt) {
        activities.push({
          id: client.id,
          type: 'client',
          action: 'Cliente actualizado',
          description: client.name,
          timestamp: client.updatedAt,
          icon: 'mdi:account',
          color: 'blue'
        })
      }
    })

    // Sort by most recent and take top 10
    return activities
      .sort((a, b) => {
        const dateA = new Date(a.timestamp).getTime()
        const dateB = new Date(b.timestamp).getTime()
        return dateB - dateA
      })
      .slice(0, 10)
  })

  // ==========================================
  // HELPER METHODS
  // ==========================================

  const getJobActionLabel = (status: string): string => {
    const labels = {
      pending: 'Trabajo pendiente',
      confirmed: 'Trabajo confirmado',
      in_progress: 'Trabajo en progreso',
      completed: 'Trabajo completado',
      cancelled: 'Trabajo cancelado'
    }
    return labels[status] || 'Trabajo actualizado'
  }

  const getJobIcon = (status: string): string => {
    const icons = {
      pending: 'mdi:clock-outline',
      confirmed: 'mdi:check-circle',
      in_progress: 'mdi:progress-clock',
      completed: 'mdi:check-all',
      cancelled: 'mdi:close-circle'
    }
    return icons[status] || 'mdi:file-document'
  }

  const getJobColor = (status: string): string => {
    const colors = {
      pending: 'yellow',
      confirmed: 'blue',
      in_progress: 'orange',
      completed: 'green',
      cancelled: 'red'
    }
    return colors[status] || 'gray'
  }

  // ==========================================
  // DATA OPERATIONS
  // ==========================================

  const loadData = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      // Load data from all stores for the last 2 months
      await Promise.all([
        jobsStore.initialize(),
        clientsStore.initialize(),
        slotsStore.initialize()
      ])
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar datos del dashboard'
      console.error('Error loading dashboard data:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // ==========================================
  // INITIALIZATION
  // ==========================================

  const initialize = async (): Promise<void> => {
    if (initialized.value) return

    try {
      await loadData()
      initialized.value = true
    } catch (err) {
      console.error('Error initializing dashboard store:', err)
      // Don't throw here, let the component handle the error state
    }
  }

  const cleanup = (): void => {
    initialized.value = false
  }

  // ==========================================
  // RETURN STORE INTERFACE
  // ==========================================

  return {
    // State
    loading: readonly(loading),
    error: readonly(error),

    // KPIs
    jobsToday,
    nextJob,
    pendingJobs,
    availableHoursToday,
    jobsThisWeek,
    revenueThisWeek,
    availableHoursThisWeek,
    revenueThisMonth,
    jobsThisMonth,
    jobsLastMonth,
    newClientsThisMonth,
    recentActivity,

    // Methods
    loadData,
    initialize,
    cleanup
  }
})
