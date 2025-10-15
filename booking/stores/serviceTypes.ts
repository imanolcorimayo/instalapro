import { defineStore } from 'pinia'
import type { ServiceType } from '~/types'
import { ServiceTypesSchema } from '~/utils/odm/schemas/serviceTypeSchema'

export const useServiceTypesStore = defineStore('serviceTypes', () => {
  // ==========================================
  // SCHEMA & STATE
  // ==========================================

  const serviceTypesSchema = new ServiceTypesSchema()
  const serviceTypes = ref<ServiceType[]>([])
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  // ==========================================
  // GETTERS
  // ==========================================

  const activeServiceTypes = computed(() => {
    return serviceTypes.value.filter(st => st.isActive !== false)
  })

  // ==========================================
  // ACTIONS
  // ==========================================

  const loadServiceTypesByTechnicianUserUid = async (userUid: string): Promise<boolean> => {
    loading.value = true
    error.value = null
    serviceTypes.value = []

    try {
      const result = await serviceTypesSchema.findByTechnicianUserUid(userUid)

      if (!result.success) {
        error.value = result.error || 'Error cargando servicios'
        return false
      }

      if (result.data) {
        serviceTypes.value = result.data as ServiceType[]
        return true
      }

      // No service types found (this is okay, technician might not have configured services yet)
      return true
    } catch (err: any) {
      error.value = err.message || 'Error al cargar los servicios'
      console.error('Error loading service types:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const resetStore = () => {
    serviceTypes.value = []
    loading.value = false
    error.value = null
  }

  // Return store interface
  return {
    // State
    serviceTypes,
    loading,
    error,

    // Getters
    activeServiceTypes,

    // Actions
    loadServiceTypesByTechnicianUserUid,
    clearError,
    resetStore
  }
})
