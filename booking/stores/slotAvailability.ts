import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SlotAvailability } from '~/types'
import { SlotAvailabilitySchema } from '~/utils/odm/schemas/slotAvailabilitySchema'

export const useSlotAvailabilityStore = defineStore('slotAvailability', () => {
  const slotAvailabilitySchema = new SlotAvailabilitySchema()

  // State
  const availableSlots = ref<SlotAvailability[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  const loadAvailableSlots = async (startDate: string, endDate: string, userUid: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    console.log('[SlotAvailabilityStore] Loading slots:', { startDate, endDate, userUid })

    try {
      const result = await slotAvailabilitySchema.findAvailableSlots(startDate, endDate, userUid)

      console.log('[SlotAvailabilityStore] Schema result:', result)

      if (result.success && result.data) {
        availableSlots.value = result.data as SlotAvailability[]
        console.log('[SlotAvailabilityStore] Stored slots:', availableSlots.value.length, 'slots')
        return true
      }

      error.value = result.error || 'No se pudieron cargar los horarios disponibles'
      console.log('[SlotAvailabilityStore] Error:', error.value)
      return false
    } catch (err) {
      error.value = 'Error al cargar horarios disponibles'
      console.error('[SlotAvailabilityStore] Error loading available slots:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const loadSlotsByDate = async (date: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const result = await slotAvailabilitySchema.findByDate(date)

      if (result.success && result.data) {
        availableSlots.value = result.data as SlotAvailability[]
        return true
      }

      error.value = result.error || 'No se pudieron cargar los horarios para esta fecha'
      return false
    } catch (err) {
      error.value = 'Error al cargar horarios'
      console.error('Error loading slots by date:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // Helper methods
  const getAvailableHoursForDate = (date: string): number[] => {
    return availableSlots.value
      .filter(slot => slot.date === date && slot.isAvailable)
      .map(slot => slot.hour)
      .sort((a, b) => a - b)
  }

  const isSlotAvailable = (date: string, hour: number): boolean => {
    return availableSlots.value.some(
      slot => slot.date === date && slot.hour === hour && slot.isAvailable
    )
  }

  const getSlotsByTimeOfDay = (date: string) => {
    const hours = getAvailableHoursForDate(date)

    return {
      morning: hours.filter(h => h >= 6 && h < 12),   // 6 AM - 11:59 AM
      afternoon: hours.filter(h => h >= 12 && h < 18), // 12 PM - 5:59 PM
      evening: hours.filter(h => h >= 18 && h <= 22)   // 6 PM - 10 PM
    }
  }

  const clearSlots = () => {
    availableSlots.value = []
    error.value = null
  }

  return {
    // State
    availableSlots,
    loading,
    error,

    // Actions
    loadAvailableSlots,
    loadSlotsByDate,
    clearSlots,

    // Helpers
    getAvailableHoursForDate,
    isSlotAvailable,
    getSlotsByTimeOfDay
  }
})
