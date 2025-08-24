import { defineStore } from 'pinia'
import { SettingsSchema } from '~/utils/odm/schemas/settingsSchema'

// User settings interfaces
export interface UserSettings {
  id: string
  userUid: string
  fullName: string
  phone: string
  email: string
  createdAt: Date
  updatedAt: Date
  archivedAt?: Date
}

export interface UserSettingsCreateInput {
  fullName: string
  phone: string
  email: string
}

export interface UserSettingsUpdateInput {
  fullName?: string
  phone?: string
  email?: string
}

// Default userId for MVP phase
const DEFAULT_USER_ID = 'user_instalapro_mvp_001'

// LocalStorage key for userId
const USER_ID_STORAGE_KEY = 'instalapro_user_id'

// Settings schema instance
const settingsSchema = new SettingsSchema()

export const useSettingsStore = defineStore('settings', () => {
  // ==========================================
  // STATE
  // ==========================================
  
  const userSettings = ref<UserSettings | null>(null)
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)
  const userId = ref<string>(DEFAULT_USER_ID)

  // ==========================================
  // GETTERS
  // ==========================================

  const isAccountArchived = computed(() => {
    return !!userSettings.value?.archivedAt
  })

  const hasCompleteProfile = computed(() => {
    if (!userSettings.value) return false
    return !!(userSettings.value.fullName && userSettings.value.phone && userSettings.value.email)
  })

  // ==========================================
  // ACTIONS - USER ID MANAGEMENT
  // ==========================================

  const getUserId = (): string => {
    try {
      const stored = localStorage.getItem(USER_ID_STORAGE_KEY)
      return stored || DEFAULT_USER_ID
    } catch (err) {
      console.warn('Error loading userId from localStorage, using default:', err)
      return DEFAULT_USER_ID
    }
  }

  const setUserId = (newUserId: string): void => {
    try {
      userId.value = newUserId
      localStorage.setItem(USER_ID_STORAGE_KEY, newUserId)
    } catch (err) {
      console.error('Error saving userId to localStorage:', err)
      error.value = 'Error guardando el ID de usuario'
    }
  }

  // ==========================================
  // ACTIONS - DATA OPERATIONS
  // ==========================================

  const loadUserSettings = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const currentUserId = getUserId()
      userId.value = currentUserId

      // Try to find existing settings for this user
      const result = await settingsSchema.findByUserUid(currentUserId)
      
      if (result.success && result.data && result.data.length > 0) {
        userSettings.value = result.data[0] as UserSettings
      } else {
        userSettings.value = null
      }
    } catch (err) {
      error.value = 'Error cargando la configuración del usuario'
      console.error('Error loading user settings:', err)
    } finally {
      loading.value = false
    }
  }

  const createUserSettings = async (input: UserSettingsCreateInput): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const currentUserId = getUserId()
      const now = new Date()
      const settingsId = `settings_${Date.now()}`
      
      const newSettings = {
        id: settingsId,
        userUid: currentUserId,
        fullName: input.fullName,
        phone: input.phone,
        email: input.email,
        createdAt: now,
        updatedAt: now
      }

      const result = await settingsSchema.create(newSettings)
      
      if (result.success) {
        userSettings.value = newSettings as UserSettings
      } else {
        throw new Error(result.error || 'Error creating user settings')
      }
    } catch (err) {
      error.value = 'Error creando la configuración del usuario'
      console.error('Error creating user settings:', err)
    } finally {
      loading.value = false
    }
  }

  const updateUserSettings = async (updates: UserSettingsUpdateInput): Promise<void> => {
    if (!userSettings.value) {
      error.value = 'No hay configuración de usuario para actualizar'
      return
    }

    loading.value = true
    error.value = null

    try {
      const updatedData = {
        ...updates,
        updatedAt: new Date()
      }

      const result = await settingsSchema.update(userSettings.value.id, updatedData)
      
      if (result.success) {
        userSettings.value = {
          ...userSettings.value,
          ...updatedData
        } as UserSettings
      } else {
        throw new Error(result.error || 'Error updating user settings')
      }
    } catch (err) {
      error.value = 'Error actualizando la configuración del usuario'
      console.error('Error updating user settings:', err)
    } finally {
      loading.value = false
    }
  }

  const archiveAccount = async (): Promise<void> => {
    if (!userSettings.value) {
      error.value = 'No hay configuración de usuario para archivar'
      return
    }

    loading.value = true
    error.value = null

    try {
      const result = await settingsSchema.archiveAccount(userSettings.value.userUid)
      
      if (result.success) {
        userSettings.value = {
          ...userSettings.value,
          archivedAt: new Date()
        }
      } else {
        throw new Error(result.error || 'Error archiving account')
      }
    } catch (err) {
      error.value = 'Error archivando la cuenta'
      console.error('Error archiving account:', err)
    } finally {
      loading.value = false
    }
  }

  const unarchiveAccount = async (): Promise<void> => {
    if (!userSettings.value) {
      error.value = 'No hay configuración de usuario para desarchivar'
      return
    }

    loading.value = true
    error.value = null

    try {
      const result = await settingsSchema.update(userSettings.value.id, { 
        archivedAt: undefined,
        updatedAt: new Date()
      })
      
      if (result.success) {
        userSettings.value = {
          ...userSettings.value,
          archivedAt: undefined,
          updatedAt: new Date()
        }
      } else {
        throw new Error(result.error || 'Error unarchiving account')
      }
    } catch (err) {
      error.value = 'Error desarchivando la cuenta'
      console.error('Error unarchiving account:', err)
    } finally {
      loading.value = false
    }
  }

  // ==========================================
  // ACTIONS - INITIALIZATION
  // ==========================================

  const initialize = async (): Promise<void> => {
    await loadUserSettings()
  }

  // Return store interface
  return {
    // State
    userSettings,
    loading,
    error,
    userId,

    // Getters
    isAccountArchived,
    hasCompleteProfile,

    // Actions
    getUserId,
    setUserId,
    loadUserSettings,
    createUserSettings,
    updateUserSettings,
    archiveAccount,
    unarchiveAccount,
    initialize
  }
})