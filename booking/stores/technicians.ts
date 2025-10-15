import { defineStore } from 'pinia'
import type { Technician } from '~/types'
import { TechniciansSchema } from '~/utils/odm/schemas/technicianSchema'

export const useTechniciansStore = defineStore('technicians', () => {
  // ==========================================
  // SCHEMA & STATE
  // ==========================================

  const techniciansSchema = new TechniciansSchema()
  const technician = ref<Technician | null>(null)
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  // ==========================================
  // ACTIONS
  // ==========================================

  const loadTechnicianBySlug = async (slug: string): Promise<boolean> => {
    loading.value = true
    error.value = null
    technician.value = null

    try {
      const result = await techniciansSchema.findBySlug(slug)

      if (!result.success) {
        error.value = result.error || 'Error cargando técnico'
        return false
      }

      if (result.data && result.data.length > 0) {
        technician.value = result.data[0] as Technician
        return true
      }

      // No technician found with this slug
      error.value = 'El técnico solicitado no está disponible o el enlace es incorrecto.'
      return false
    } catch (err: any) {
      error.value = err.message || 'Error al cargar la información del técnico'
      console.error('Error loading technician by slug:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const resetStore = () => {
    technician.value = null
    loading.value = false
    error.value = null
  }

  // Return store interface
  return {
    // State
    technician,
    loading,
    error,

    // Actions
    loadTechnicianBySlug,
    clearError,
    resetStore
  }
})
