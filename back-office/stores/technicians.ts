import { defineStore } from 'pinia'
import type { 
  Technician, 
  TechnicianCreateInput, 
  TechnicianUpdateInput
} from '~/types'
import { TechniciansSchema } from '~/utils/odm/schemas/technicianSchema'

export const useTechniciansStore = defineStore('technicians', () => {
  // ==========================================
  // SCHEMA & STATE
  // ==========================================
  
  const techniciansSchema = new TechniciansSchema()
  const technician = ref<Technician | null>(null)
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)
  const initialized = ref<boolean>(false)

  // ==========================================
  // GETTERS
  // ==========================================

  const isProfileComplete = computed(() => {
    return hasRequiredInfo.value
  })

  const hasRequiredInfo = computed(() => {
    if (!technician.value) return false
    return !!(technician.value.name && technician.value.phone && technician.value.email)
  })

  const profileCompletionPercentage = computed(() => {
    if (!technician.value) return 0
    
    let completedFields = 0
    const totalFields = 3 // name, phone, email, profileSetupComplete
    
    if (technician.value.name) completedFields++
    if (technician.value.phone) completedFields++
    if (technician.value.email) completedFields++
    
    return Math.round((completedFields / totalFields) * 100)
  })

  const isAccountDeactivated = computed(() => {
    return technician.value?.isActive === false
  })

  const deactivationDate = computed(() => {
    return technician.value?.deactivatedAt
  })

  // ==========================================
  // ACTIONS - CRUD OPERATIONS
  // ==========================================

  const createTechnician = async (input: TechnicianCreateInput): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const authStore = useAuthStore()
      if (!authStore.user) {
        throw new Error('Usuario no autenticado')
      }

      const technicianData = {
        name: input.name,
        phone: input.phone,
        email: authStore.user.email || '',
        secondaryEmail: input.secondaryEmail
      }

      const result = await techniciansSchema.create(technicianData)
      
      if (!result.success) {
        throw new Error(result.error || 'Error creando perfil del técnico')
      }

      // Update local state
      technician.value = result.data as Technician
      initialized.value = true
      
      return true
    } catch (err: any) {
      error.value = err.message || 'Error creando el perfil del técnico'
      console.error('Error creating technician:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const updateTechnician = async (updates: TechnicianUpdateInput): Promise<boolean> => {
    if (!technician.value) {
      error.value = 'No hay técnico para actualizar'
      return false
    }

    loading.value = true
    error.value = null

    try {
      const result = await techniciansSchema.update(technician.value.id, updates)
      
      if (!result.success) {
        throw new Error(result.error || 'Error actualizando perfil del técnico')
      }

      // Update local state
      technician.value = {
        ...technician.value,
        ...updates
      }
      
      return true
    } catch (err: any) {
      error.value = err.message || 'Error actualizando el perfil del técnico'
      console.error('Error updating technician:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const loadTechnicianByUserUid = async (userUid: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const result = await techniciansSchema.findByUserUid(userUid)
      
      if (!result.success) {
        // No technician found - this is not an error, just means user needs to create profile
        technician.value = null
        initialized.value = true
        return false
      }

      if (result.data && result.data.length > 0) {
        technician.value = result.data[0] as Technician
        initialized.value = true
        return true
      }

      // No technician found
      technician.value = null
      initialized.value = true
      return false
    } catch (err: any) {
      error.value = err.message || 'Error cargando el perfil del técnico'
      console.error('Error loading technician:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // ==========================================
  // ACTIONS - PROFILE MANAGEMENT
  // ==========================================


  const closeAccount = async (): Promise<boolean> => {
    if (!technician.value) {
      error.value = 'No hay técnico para desactivar cuenta'
      return false
    }

    loading.value = true
    error.value = null

    try {
      const result = await techniciansSchema.closeAccount(technician.value.id)
      
      if (!result.success) {
        throw new Error(result.error || 'Error desactivando la cuenta')
      }

      // Update local state
      technician.value = {
        ...technician.value,
        isActive: false,
        deactivatedAt: new Date()
      }
      
      return true
    } catch (err: any) {
      error.value = err.message || 'Error desactivando la cuenta'
      console.error('Error closing account:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const reactivateAccount = async (): Promise<boolean> => {
    if (!technician.value) {
      error.value = 'No hay técnico para reactivar cuenta'
      return false
    }

    loading.value = true
    error.value = null

    try {
      const result = await techniciansSchema.reopenAccount(technician.value.id)
      
      if (!result.success) {
        throw new Error(result.error || 'Error reactivando la cuenta')
      }

      // Update local state
      technician.value = {
        ...technician.value,
        isActive: true,
        deactivatedAt: undefined
      }
      
      return true
    } catch (err: any) {
      error.value = err.message || 'Error reactivando la cuenta'
      console.error('Error reactivating account:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const updateProfile = async (profileData: {
    name?: string;
    phone?: string;
    secondaryEmail?: string;
  }): Promise<boolean> => {
    if (!technician.value) {
      error.value = 'No hay técnico para actualizar'
      return false
    }

    return await updateTechnician(profileData)
  }

  // ==========================================
  // INITIALIZATION
  // ==========================================

  const initialize = async (): Promise<void> => {
    const authStore = useAuthStore()
    
    if (!authStore.user) {
      console.warn('No authenticated user found during technicians store initialization')
      initialized.value = true
      return
    }

    await loadTechnicianByUserUid(authStore.user.uid)
  }

  const resetStore = () => {
    technician.value = null
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

  const subscribeToTechnician = () => {
    const authStore = useAuthStore()
    if (!authStore.user) return

    // Subscribe to real-time updates for this user's technician
    unsubscribe = techniciansSchema.subscribeToCollection((documents) => {
      const userTechnician = documents.find(doc => doc.userUid === authStore.user?.uid)
      if (userTechnician) {
        technician.value = userTechnician as Technician
      }
    }, {
      where: [{ field: 'userUid', operator: '==', value: authStore.user.uid }],
      limit: 1
    })
  }

  const unsubscribeFromTechnician = () => {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
  }

  // Return store interface
  return {
    // State
    technician,
    loading,
    error,
    initialized,

    // Getters
    isProfileComplete,
    hasRequiredInfo,
    profileCompletionPercentage,
    isAccountDeactivated,
    deactivationDate,

    // Actions
    createTechnician,
    updateTechnician,
    loadTechnicianByUserUid,
    initialize,
    resetStore,
    clearError,

    // Profile management
    closeAccount,
    reactivateAccount,
    updateProfile,

    // Subscriptions
    subscribeToTechnician,
    unsubscribeFromTechnician
  }
})