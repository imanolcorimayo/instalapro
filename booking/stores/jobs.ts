import { defineStore } from 'pinia'
import { JobSchema } from '~/utils/odm/schemas/jobSchema'
import { SlotAvailabilitySchema } from '~/utils/odm/schemas/slotAvailabilitySchema'
import type { CreateResult } from '~/utils/odm/types'

// Job interface matching back-office structure
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
  userUid: string // Technician's userUid
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

export const useJobsStore = defineStore('jobs', () => {
  // ==========================================
  // STATE
  // ==========================================

  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  // Schema instances for data operations
  const jobSchema = new JobSchema()
  const slotSchema = new SlotAvailabilitySchema()

  // ==========================================
  // ACTIONS
  // ==========================================

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
        source: jobData.source || 'client_booking',
        isActive: true
      }

      const result: CreateResult = await jobSchema.create(dataWithDefaults)

      if (result.success && result.data) {
        const newJob = result.data as Job

        // Close time slots for the booked period
        await closeTimeSlots(newJob.userUid, newJob.scheduledDate, newJob.estimatedDuration)

        return newJob.id
      } else {
        throw new Error(result.error || 'Failed to create job')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al crear reserva'
      console.error('Error creating job:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const resetError = () => {
    error.value = null
  }

  // ==========================================
  // HELPER FUNCTIONS
  // ==========================================

  // Close time slots when a job is created
  const closeTimeSlots = async (userUid: string, scheduledDate: Date | any, estimatedDuration: number) => {
    try {
      // Convert to Date if it's a Firestore Timestamp
      let date: Date
      if (scheduledDate && typeof scheduledDate.toDate === 'function') {
        date = scheduledDate.toDate()
      } else if (scheduledDate instanceof Date) {
        date = scheduledDate
      } else {
        console.error('Invalid scheduledDate format:', scheduledDate)
        return
      }

      // Format date as YYYY-MM-DD
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const dateStr = `${year}-${month}-${day}`

      // Calculate hours to close based on start time and duration
      const startHour = date.getHours()
      const durationHours = Math.ceil(estimatedDuration / 60) // Convert minutes to hours, round up
      const hoursToClose: number[] = []

      for (let i = 0; i < durationHours; i++) {
        const hour = startHour + i
        if (hour >= 6 && hour <= 22) { // Only within working hours
          hoursToClose.push(hour)
        }
      }

      if (hoursToClose.length === 0) {
        console.warn('No valid hours to close for this job')
        return
      }

      // Close the slots
      const closeResult = await slotSchema.closeSlotsByDateAndHours(dateStr, hoursToClose, userUid)

      if (!closeResult.success) {
        console.error('Failed to close time slots:', closeResult.error)
      } else {
        console.log(`Closed ${closeResult.closedCount} time slot(s) for job`)
      }
    } catch (err) {
      console.error('Error closing time slots:', err)
      // Don't throw - slot closing failure shouldn't prevent job creation
    }
  }

  // ==========================================
  // RETURN STORE INTERFACE
  // ==========================================

  return {
    // State
    loading,
    error,

    // Actions
    createJob,
    resetError
  }
})
