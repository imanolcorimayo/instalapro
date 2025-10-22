import { defineStore } from 'pinia'
import { SlotAvailabilitySchema } from '~/utils/odm/schemas/slotAvailabilitySchema'
import type { FetchResult, CreateResult, UpdateResult, DeleteResult, DocumentWithId } from '~/utils/odm/types'
import { nowInBuenosAires, toBuenosAires, startOfWeekInBuenosAires, endOfWeekInBuenosAires } from '~/utils/timezone'
import type { Unsubscribe } from 'firebase/firestore'

// Define SlotAvailability interface based on the schema
export interface SlotAvailability {
  id: string
  userUid: string
  date: string // YYYY-MM-DD
  hour: number // 6-22
  isAvailable: boolean
  isManual: boolean // true = manually set, false = auto-closed by job
  createdAt: Date
  updatedAt: Date
}

export interface SlotAvailabilityCreateInput {
  date: string
  hour: number
  isAvailable: boolean
  isManual?: boolean
}

export interface SlotAvailabilityUpdateInput {
  isAvailable?: boolean
  isManual?: boolean
}

export const useSlotAvailabilityStore = defineStore('slotAvailability', () => {
  // ==========================================
  // STATE
  // ==========================================
  
  const slots = ref<SlotAvailability[]>([])
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)
  const initialized = ref<boolean>(false)
  
  // Cache to avoid multiple calls to storage/Firestore
  const slotsCache = new Map<string, SlotAvailability>()
  
  // Schema instance for data operations
  const slotSchema = new SlotAvailabilitySchema()
  
  // Real-time subscription
  let unsubscribe: Unsubscribe | null = null

  // ==========================================
  // GETTERS
  // ==========================================

  const getSlotById = computed(() => (id: string): SlotAvailability | null => {
    // Try cache first
    if (slotsCache.has(id)) {
      return slotsCache.get(id) || null
    }
    
    // Fallback to reactive array
    return slots.value.find(slot => slot.id === id) || null
  })

  const totalSlots = computed(() => slots.value.length)

  const availableSlots = computed(() => 
    slots.value.filter(slot => slot.isAvailable === true)
  )

  // ==========================================
  // CACHE MANAGEMENT
  // ==========================================

  const updateCache = (slot: SlotAvailability): void => {
    const cacheKey = `${slot.date}-${slot.hour}`
    slotsCache.set(cacheKey, slot)
  }

  const removeFromCache = (date: string, hour: number): void => {
    const cacheKey = `${date}-${hour}`
    slotsCache.delete(cacheKey)
  }

  const refreshCache = (): void => {
    slotsCache.clear()
    slots.value.forEach(slot => {
      const cacheKey = `${slot.date}-${slot.hour}`
      slotsCache.set(cacheKey, slot)
    })
  }

  // ==========================================
  // CORE BUSINESS LOGIC
  // ==========================================

  /**
   * Get slot availability for a specific date and hour
   * Returns true only if record exists AND isAvailable = true
   */
  const getSlotAvailability = (date: string, hour: number): boolean => {
    const cacheKey = `${date}-${hour}`
    const slot = slotsCache.get(cacheKey)
    
    if (slot) {
      return slot.isAvailable
    }
    
    // If no record exists, slot is unavailable
    return false
  }

  /**
   * Get slot status for UI rendering
   * Returns: 'available', 'manual_closed', 'auto_closed', 'not_set'
   */
  const getSlotStatus = (date: string, hour: number): 'available' | 'manual_closed' | 'auto_closed' | 'not_set' => {
    const cacheKey = `${date}-${hour}`
    const slot = slotsCache.get(cacheKey)
    
    if (!slot) {
      return 'not_set'
    }
    
    if (slot.isAvailable) {
      return 'available'
    }
    
    return slot.isManual ? 'manual_closed' : 'auto_closed'
  }

  /**
   * Get all slots for a specific date
   */
  const getSlotsForDate = (date: string): SlotAvailability[] => {
    return slots.value.filter(slot => slot.date === date)
      .sort((a, b) => a.hour - b.hour)
  }

  /**
   * Get available hours for a specific date
   */
  const getAvailableHoursForDate = (date: string): number[] => {
    return slots.value
      .filter(slot => slot.date === date && slot.isAvailable)
      .map(slot => slot.hour)
      .sort((a, b) => a - b)
  }

  // ==========================================
  // DATA OPERATIONS
  // ==========================================

  const loadSlotsByDateRange = async (startDate: string, endDate: string): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const result: FetchResult<SlotAvailability> = await slotSchema.findByDateRange(startDate, endDate) as FetchResult<SlotAvailability>

      if (result.success && result.data) {
        // Filter out existing slots for this date range and add new ones
        slots.value = slots.value.filter(slot => 
          slot.date < startDate || slot.date > endDate
        )
        slots.value.push(...result.data)
        
        refreshCache()
      } else {
        throw new Error(result.error || 'Failed to load slot availability')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar disponibilidad de horarios'
      console.error('Error loading slot availability:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const toggleSlotAvailability = async (date: string, hour: number): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const cacheKey = `${date}-${hour}`
      const existingSlot = slotsCache.get(cacheKey)

      if (existingSlot) {
        // Update existing slot
        const newAvailability = !existingSlot.isAvailable
        
        const result: UpdateResult = await slotSchema.update(existingSlot.id, {
          isAvailable: newAvailability,
          isManual: true
        })
        
        if (result.success) {
          // Update local state
          existingSlot.isAvailable = newAvailability
          existingSlot.isManual = true
          existingSlot.updatedAt = new Date()
          updateCache(existingSlot)
          
          // Update reactive array
          const slotIndex = slots.value.findIndex(s => s.id === existingSlot.id)
          if (slotIndex !== -1) {
            slots.value[slotIndex] = { ...existingSlot }
          }
        } else {
          throw new Error(result.error || 'Failed to update slot availability')
        }
      } else {
        // Create new slot (default to available when manually created)
        const slotData: SlotAvailabilityCreateInput = {
          date,
          hour,
          isAvailable: true,
          isManual: true
        }

        const result: CreateResult = await slotSchema.create(slotData)
        
        if (result.success && result.data) {
          const newSlot = result.data as SlotAvailability
          slots.value.push(newSlot)
          updateCache(newSlot)
        } else {
          throw new Error(result.error || 'Failed to create slot availability')
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cambiar disponibilidad'
      console.error('Error toggling slot availability:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Auto-close slot when a job is created
   * Called from jobs store when new job is created
   */
  const autoCloseSlot = async (date: string, hour: number): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const cacheKey = `${date}-${hour}`
      const existingSlot = slotsCache.get(cacheKey)

      if (existingSlot) {
        // Update existing slot to unavailable
        const result: UpdateResult = await slotSchema.update(existingSlot.id, {
          isAvailable: false,
          isManual: false
        })
        
        if (result.success) {
          existingSlot.isAvailable = false
          existingSlot.isManual = false
          existingSlot.updatedAt = new Date()
          updateCache(existingSlot)
          
          // Update reactive array
          const slotIndex = slots.value.findIndex(s => s.id === existingSlot.id)
          if (slotIndex !== -1) {
            slots.value[slotIndex] = { ...existingSlot }
          }
        }
      } else {
        // Create new unavailable slot
        const slotData: SlotAvailabilityCreateInput = {
          date,
          hour,
          isAvailable: false,
          isManual: false
        }

        const result: CreateResult = await slotSchema.create(slotData)
        
        if (result.success && result.data) {
          const newSlot = result.data as SlotAvailability
          slots.value.push(newSlot)
          updateCache(newSlot)
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cerrar horario automáticamente'
      console.error('Error auto-closing slot:', err)
      // Don't throw here as this is called from job creation
    } finally {
      loading.value = false
    }
  }

  /**
   * Open all available slots for a specific day (6AM to 10PM)
   */
  const openAllSlotsForDay = async (date: string): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const promises = []

      // Create all slots from 6 to 22 as available
      for (let hour = 6; hour <= 22; hour++) {
        const cacheKey = `${date}-${hour}`
        const existingSlot = slotsCache.get(cacheKey)

        if (existingSlot) {
          // Update existing slot if it's not auto-closed by a job
          if (existingSlot.isManual) {
            promises.push(
              slotSchema.update(existingSlot.id, {
                isAvailable: true,
                isManual: true
              })
            )
          }
        } else {
          // Create new available slot
          const slotData: SlotAvailabilityCreateInput = {
            date,
            hour,
            isAvailable: true,
            isManual: true
          }
          promises.push(slotSchema.create(slotData))
        }
      }

      // Execute all operations
      const results = await Promise.all(promises)

      // Update local state
      let successCount = 0
      results.forEach((result, index) => {
        if (result.success) {
          successCount++
          const hour = 6 + index
          const cacheKey = `${date}-${hour}`

          if (result.data) {
            // New slot created
            const newSlot = result.data as SlotAvailability
            slots.value.push(newSlot)
            updateCache(newSlot)
          } else {
            // Existing slot updated
            const existingSlot = slotsCache.get(cacheKey)
            if (existingSlot && existingSlot.isManual) {
              existingSlot.isAvailable = true
              existingSlot.updatedAt = new Date()
              updateCache(existingSlot)

              // Update reactive array
              const slotIndex = slots.value.findIndex(s => s.id === existingSlot.id)
              if (slotIndex !== -1) {
                slots.value[slotIndex] = { ...existingSlot }
              }
            }
          }
        }
      })

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al abrir horarios del día'
      console.error('Error opening all slots for day:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Close all manually controlled slots for a specific day (6AM to 10PM)
   */
  const closeAllSlotsForDay = async (date: string): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const promises = []

      // Close all slots from 6 to 22 that are manually controlled
      for (let hour = 6; hour <= 22; hour++) {
        const cacheKey = `${date}-${hour}`
        const existingSlot = slotsCache.get(cacheKey)

        if (existingSlot && existingSlot.isManual) {
          // Update existing manual slot to closed
          promises.push(
            slotSchema.update(existingSlot.id, {
              isAvailable: false,
              isManual: true
            })
          )
        } else if (!existingSlot) {
          // Create new closed slot
          const slotData: SlotAvailabilityCreateInput = {
            date,
            hour,
            isAvailable: false,
            isManual: true
          }
          promises.push(slotSchema.create(slotData))
        }
      }

      // Execute all operations
      const results = await Promise.all(promises)

      // Update local state
      let successCount = 0
      results.forEach((result, index) => {
        if (result.success) {
          successCount++
          const hour = 6 + index
          const cacheKey = `${date}-${hour}`

          if (result.data) {
            // New slot created
            const newSlot = result.data as SlotAvailability
            slots.value.push(newSlot)
            updateCache(newSlot)
          } else {
            // Existing slot updated
            const existingSlot = slotsCache.get(cacheKey)
            if (existingSlot && existingSlot.isManual) {
              existingSlot.isAvailable = false
              existingSlot.updatedAt = new Date()
              updateCache(existingSlot)

              // Update reactive array
              const slotIndex = slots.value.findIndex(s => s.id === existingSlot.id)
              if (slotIndex !== -1) {
                slots.value[slotIndex] = { ...existingSlot }
              }
            }
          }
        }
      })

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cerrar horarios del día'
      console.error('Error closing all slots for day:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Auto-close multiple slots for a job spanning multiple hours
   * Called from jobs store when new job is created with duration > 60 minutes
   */
  const autoCloseSlotsForDuration = async (date: string, startHour: number, durationMinutes: number): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      // Calculate how many hour slots are affected
      const hoursAffected = Math.ceil(durationMinutes / 60)
      const promises = []

      // Close all affected slots
      for (let i = 0; i < hoursAffected; i++) {
        const hour = startHour + i
        if (hour >= 6 && hour <= 22) { // Only close valid working hours
          const cacheKey = `${date}-${hour}`
          const existingSlot = slotsCache.get(cacheKey)

          if (existingSlot) {
            // Update existing slot to unavailable
            promises.push(
              slotSchema.update(existingSlot.id, {
                isAvailable: false,
                isManual: false
              }).then(result => ({ result, hour, existing: existingSlot }))
            )
          } else {
            // Create new unavailable slot
            const slotData: SlotAvailabilityCreateInput = {
              date,
              hour,
              isAvailable: false,
              isManual: false
            }
            promises.push(
              slotSchema.create(slotData).then(result => ({ result, hour, existing: null }))
            )
          }
        }
      }

      // Execute all operations
      const results = await Promise.all(promises)

      // Update local state
      results.forEach(({ result, hour, existing }) => {
        if (result.success) {
          if (existing) {
            // Updated existing slot
            existing.isAvailable = false
            existing.isManual = false
            existing.updatedAt = new Date()
            updateCache(existing)

            // Update reactive array
            const slotIndex = slots.value.findIndex(s => s.id === existing.id)
            if (slotIndex !== -1) {
              slots.value[slotIndex] = { ...existing }
            }
          } else if (result.data) {
            // Created new slot
            const newSlot = result.data as SlotAvailability
            slots.value.push(newSlot)
            updateCache(newSlot)
          }
        }
      })

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cerrar horarios automáticamente'
      console.error('Error auto-closing slots for duration:', err)
      // Don't throw here as this is called from job creation
    } finally {
      loading.value = false
    }
  }

  /**
   * Reopen multiple auto-closed slots when a multi-hour job is deleted
   */
  const removeAutoClosedSlotsForDuration = async (date: string, startHour: number, durationMinutes: number): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      // Calculate how many hour slots are affected
      const hoursAffected = Math.ceil(durationMinutes / 60)
      const promises = []

      // Reopen all affected slots
      for (let i = 0; i < hoursAffected; i++) {
        const hour = startHour + i
        if (hour >= 6 && hour <= 22) { // Only process valid working hours
          const cacheKey = `${date}-${hour}`
          const existingSlot = slotsCache.get(cacheKey)

          if (existingSlot && !existingSlot.isManual && !existingSlot.isAvailable) {
            // This slot was auto-closed, reopen it
            promises.push(
              slotSchema.update(existingSlot.id, {
                isAvailable: true,
                isManual: false
              }).then(result => ({ result, hour, slot: existingSlot }))
            )
          }
        }
      }

      // Execute all operations
      const results = await Promise.all(promises)

      // Update local state
      results.forEach(({ result, hour, slot }) => {
        if (result.success) {
          slot.isAvailable = true
          slot.updatedAt = new Date()
          updateCache(slot)

          // Update reactive array
          const slotIndex = slots.value.findIndex(s => s.id === slot.id)
          if (slotIndex !== -1) {
            slots.value[slotIndex] = { ...slot }
          }
        }
      })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al restaurar horarios'
      console.error('Error reopening auto-closed slots:', err)
      // Don't throw here as this is called from job deletion
    } finally {
      loading.value = false
    }
  }

  /**
   * Reopen auto-closed slot when job is deleted
   * Only reopens if slot was auto-closed (isManual = false)
   */
  const removeAutoClosedSlot = async (date: string, hour: number): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const cacheKey = `${date}-${hour}`
      const existingSlot = slotsCache.get(cacheKey)

      if (existingSlot && !existingSlot.isManual && !existingSlot.isAvailable) {
        // This slot was auto-closed, reopen it
        const result: UpdateResult = await slotSchema.update(existingSlot.id, {
          isAvailable: true,
          isManual: false
        })

        if (result.success) {
          // Update local state
          existingSlot.isAvailable = true
          existingSlot.updatedAt = new Date()
          updateCache(existingSlot)

          // Update reactive array
          const slotIndex = slots.value.findIndex(s => s.id === existingSlot.id)
          if (slotIndex !== -1) {
            slots.value[slotIndex] = { ...existingSlot }
          }
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al restaurar horario'
      console.error('Error reopening auto-closed slot:', err)
      // Don't throw here as this is called from job deletion
    } finally {
      loading.value = false
    }
  }

  // ==========================================
  // WEEK MANAGEMENT
  // ==========================================

  const loadWeekSlots = async (weekStart: any): Promise<void> => {
    const startDate = weekStart.format('YYYY-MM-DD')
    const endDate = weekStart.add(6, 'day').format('YYYY-MM-DD')
    
    await loadSlotsByDateRange(startDate, endDate)
  }

  const getCurrentWeekSlots = async (): Promise<void> => {
    const weekStart = startOfWeekInBuenosAires()
    await loadWeekSlots(weekStart)
  }

  // ==========================================
  // REAL-TIME SUBSCRIPTION
  // ==========================================

  const subscribeToSlots = (): void => {
    if (unsubscribe) {
      unsubscribe()
    }

    unsubscribe = slotSchema.subscribeToCollection(
      (documents: DocumentWithId[]) => {
        slots.value = documents as SlotAvailability[]
        refreshCache()
        console.log('Slot availability updated via real-time subscription:', documents.length)
      }
    )
  }

  const unsubscribeFromSlots = (): void => {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  const clearError = (): void => {
    error.value = null
  }

  const getSlotStats = () => {
    const allSlots = slots.value
    const availableCount = allSlots.filter(slot => slot.isAvailable).length
    const manuallyClosedCount = allSlots.filter(slot => !slot.isAvailable && slot.isManual).length
    const autoClosedCount = allSlots.filter(slot => !slot.isAvailable && !slot.isManual).length

    return {
      totalSlots: allSlots.length,
      availableSlots: availableCount,
      manuallyClosedSlots: manuallyClosedCount,
      autoClosedSlots: autoClosedCount
    }
  }

  // ==========================================
  // INITIALIZATION
  // ==========================================

  const initialize = async (): Promise<void> => {
    if (initialized.value) return
    
    try {
      await getCurrentWeekSlots()
      subscribeToSlots()
      initialized.value = true
    } catch (err) {
      console.error('Error initializing slot availability store:', err)
      // Don't throw here, let the component handle the error state
    }
  }

  const cleanup = (): void => {
    unsubscribeFromSlots()
    slotsCache.clear()
    initialized.value = false
    slots.value = []
  }

  // ==========================================
  // RETURN STORE INTERFACE
  // ==========================================

  return {
    // State
    slots: readonly(slots),
    loading: readonly(loading),
    error: readonly(error),

    // Getters
    getSlotById,
    totalSlots,
    availableSlots,

    // Core Business Logic
    getSlotAvailability,
    getSlotStatus,
    getSlotsForDate,
    getAvailableHoursForDate,

    // Data Operations
    loadSlotsByDateRange,
    toggleSlotAvailability,
    openAllSlotsForDay,
    closeAllSlotsForDay,
    autoCloseSlot,
    autoCloseSlotsForDuration,
    removeAutoClosedSlot,
    removeAutoClosedSlotsForDuration,

    // Week Management
    loadWeekSlots,
    getCurrentWeekSlots,

    // Real-time Subscription
    subscribeToSlots,
    unsubscribeFromSlots,

    // Utility Methods
    clearError,
    getSlotStats,

    // Lifecycle
    initialize,
    cleanup
  }
})