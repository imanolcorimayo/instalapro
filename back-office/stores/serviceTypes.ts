import { defineStore } from 'pinia'
import type { 
  ServiceType, 
  ServiceTypeCreateInput, 
  ServiceTypeUpdateInput
} from '~/types'
import { ServiceTypesSchema } from '~/utils/odm/schemas/serviceTypeSchema'

export const useServiceTypesStore = defineStore('serviceTypes', () => {
  // ==========================================
  // SCHEMA & STATE
  // ==========================================
  
  const serviceTypesSchema = new ServiceTypesSchema()
  const serviceTypes = ref<ServiceType[]>([])
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)
  const initialized = ref<boolean>(false)

  // ==========================================
  // GETTERS
  // ==========================================

  const activeServiceTypes = computed(() => {
    return serviceTypes.value.filter(service => service.isActive !== false)
  })

  const serviceTypesByCategory = computed(() => {
    const grouped: Record<string, ServiceType[]> = {}
    activeServiceTypes.value.forEach(service => {
      if (!grouped[service.category]) {
        grouped[service.category] = []
      }
      grouped[service.category]?.push(service)
    })
    return grouped
  })

  const getServiceByName = computed(() => {
    return (name: string) => {
      return activeServiceTypes.value.find(service => service.name === name)
    }
  })

  // ==========================================
  // ACTIONS - CRUD OPERATIONS
  // ==========================================

  const createServiceType = async (input: ServiceTypeCreateInput): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const authStore = useAuthStore()
      if (!authStore.user) {
        throw new Error('Usuario no autenticado')
      }

      // Check if service with same name already exists
      const existingService = await serviceTypesSchema.findByName(authStore.user.uid, input.name)
      if (existingService.success && existingService.data && existingService.data.length > 0) {
        throw new Error('Ya existe un servicio con ese nombre')
      }

      const serviceData = {
        userUid: authStore.user.uid,
        name: input.name.trim(),
        description: input.description?.trim() || '',
        basePrice: input.basePrice,
        estimatedDuration: input.estimatedDuration,
        category: input.category.trim(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: authStore.user.uid
      }

      const result = await serviceTypesSchema.create(serviceData)
      
      if (!result.success) {
        throw new Error(result.error || 'Error creando tipo de servicio')
      }

      // Update local state
      const newService = result.data as ServiceType
      serviceTypes.value.push(newService)
      
      return true
    } catch (err: any) {
      error.value = err.message || 'Error creando el tipo de servicio'
      console.error('Error creating service type:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const updateServiceType = async (id: string, updates: ServiceTypeUpdateInput): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const result = await serviceTypesSchema.update(id, {
        ...updates,
        updatedAt: new Date()
      })
      
      if (!result.success) {
        throw new Error(result.error || 'Error actualizando tipo de servicio')
      }

      // Update local state
      const index = serviceTypes.value.findIndex(service => service.id === id)
      if (index !== -1) {
        serviceTypes.value[index] = {
          ...serviceTypes.value[index],
          ...updates,
          updatedAt: new Date()
        } as ServiceType
      }
      
      return true
    } catch (err: any) {
      error.value = err.message || 'Error actualizando el tipo de servicio'
      console.error('Error updating service type:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const deleteServiceType = async (id: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const result = await serviceTypesSchema.delete(id)
      
      if (!result.success) {
        throw new Error(result.error || 'Error eliminando tipo de servicio')
      }

      // Update local state
      serviceTypes.value = serviceTypes.value.filter(service => service.id !== id)
      
      return true
    } catch (err: any) {
      error.value = err.message || 'Error eliminando el tipo de servicio'
      console.error('Error deleting service type:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const deactivateServiceType = async (id: string): Promise<boolean> => {
    return await updateServiceType(id, { isActive: false })
  }

  const reactivateServiceType = async (id: string): Promise<boolean> => {
    return await updateServiceType(id, { isActive: true })
  }

  const loadServiceTypes = async (): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const authStore = useAuthStore()
      if (!authStore.user) {
        throw new Error('Usuario no autenticado')
      }

      const result = await serviceTypesSchema.findActiveServices(authStore.user.uid)
      
      if (!result.success) {
        throw new Error(result.error || 'Error cargando tipos de servicio')
      }

      serviceTypes.value = result.data as ServiceType[] || []
      initialized.value = true
      return true
    } catch (err: any) {
      error.value = err.message || 'Error cargando tipos de servicio'
      console.error('Error loading service types:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // ==========================================
  // INITIALIZATION & UTILITY
  // ==========================================

  const initialize = async (): Promise<void> => {
    if (initialized.value) return
    
    const authStore = useAuthStore()
    
    if (!authStore.user) {
      console.warn('No authenticated user found during service types store initialization')
      initialized.value = true
      return
    }

    await loadServiceTypes()
  }

  const resetStore = () => {
    serviceTypes.value = []
    loading.value = false
    error.value = null
    initialized.value = false
  }

  const clearError = () => {
    error.value = null
  }

  // ==========================================
  // REAL-TIME SUBSCRIPTIONS
  // ==========================================

  let unsubscribe: (() => void) | null = null

  const subscribeToServiceTypes = () => {
    const authStore = useAuthStore()
    if (!authStore.user) return

    // Subscribe to real-time updates for this user's service types
    unsubscribe = serviceTypesSchema.subscribeToCollection((documents) => {
      serviceTypes.value = documents.filter(doc => 
        doc.userUid === authStore.user?.uid && doc.isActive !== false
      ) as ServiceType[]
    }, {
      where: [{ field: 'userUid', operator: '==', value: authStore.user.uid }]
    })
  }

  const unsubscribeFromServiceTypes = () => {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
  }

  // Return store interface
  return {
    // State
    serviceTypes,
    loading,
    error,
    initialized,

    // Getters
    activeServiceTypes,
    serviceTypesByCategory,
    getServiceByName,

    // Actions
    createServiceType,
    updateServiceType,
    deleteServiceType,
    deactivateServiceType,
    reactivateServiceType,
    loadServiceTypes,
    initialize,
    resetStore,
    clearError,

    // Subscriptions
    subscribeToServiceTypes,
    unsubscribeFromServiceTypes
  }
})