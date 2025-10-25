import type { Timestamp } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { WalletSchema } from '~/utils/odm/schemas/walletSchema'
import type { FetchResult, CreateResult, UpdateResult, DeleteResult } from '~/utils/odm/types'

// Define Wallet interface based on the schema
export interface Wallet {
  id: string
  userUid: string
  clientId?: string
  jobId?: string
  movementType: 'income' | 'outcome'
  amount: number
  date: Date
  category: string
  notes: string
  createdAt: Date
  createdBy?: string
  updatedAt: Date
  deletedAt?: Date | null
}

export interface WalletCreateInput {
  clientId?: string
  jobId?: string
  amount: number
  date: Date
  category: string
  notes?: string
}

export interface WalletUpdateInput {
  clientId?: string
  jobId?: string
  amount?: number
  date?: Date
  category?: string
  notes?: string
}

export const useWalletsStore = defineStore('wallets', () => {
  // ==========================================
  // STATE
  // ==========================================

  const wallets = ref<Wallet[]>([])
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)
  const initialized = ref<boolean>(false)

  // Cache to avoid multiple calls to storage/Firestore
  const walletsCache = new Map<string, Wallet>()

  // Schema instance for data operations
  const walletSchema = new WalletSchema()

  // ==========================================
  // GETTERS
  // ==========================================

  const getWalletById = computed(() => (id: string): Wallet | null => {
    // Try cache first
    if (walletsCache.has(id)) {
      return walletsCache.get(id) || null
    }

    // Fallback to reactive array
    return wallets.value.find(wallet => wallet.id === id) || null
  })

  const totalWallets = computed(() => wallets.value.length)

  const activeWallets = computed(() =>
    wallets.value.filter(wallet => !wallet.deletedAt)
  )

  const totalExpenses = computed(() =>
    activeWallets.value
      .filter(wallet => wallet.movementType === 'outcome')
      .reduce((sum, wallet) => sum + wallet.amount, 0)
  )

  // ==========================================
  // ACTIONS - CACHE MANAGEMENT
  // ==========================================

  const updateCache = (wallet: Wallet): void => {
    walletsCache.set(wallet.id, wallet)
  }

  const removeFromCache = (walletId: string): void => {
    walletsCache.delete(walletId)
  }

  const refreshCache = (): void => {
    walletsCache.clear()
    wallets.value.forEach(wallet => {
      walletsCache.set(wallet.id, wallet)
    })
  }

  // ==========================================
  // ACTIONS - DATA OPERATIONS
  // ==========================================

  const loadWallets = async (): Promise<void> => {
    loading.value = true
    error.value = null

    const { $dayjs } = useNuxtApp()

    try {
      const result: FetchResult<Wallet> = await walletSchema.findActiveWallets() as FetchResult<Wallet>


      if (result.success && result.data) {
        wallets.value = result.data

        // Convert date strings to Date objects
        wallets.value = wallets.value.map((wallet: any) => ({
          ...wallet,
          date: wallet.date.toDate(),
          createdAt: wallet.createdAt.toDate(),
          updatedAt: wallet.updatedAt.toDate(),
          deletedAt: wallet.deletedAt ? wallet.deletedAt.toDate() : undefined
        }))

        refreshCache()
      } else {
        throw new Error(result.error || 'Failed to load wallets')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar gastos'
      console.error('Error loading wallets:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createWallet = async (walletData: WalletCreateInput): Promise<Wallet> => {
    loading.value = true
    error.value = null

    try {
      // Enforce 'outcome' only policy for first version
      const dataWithDefaults = {
        ...walletData,
        movementType: 'outcome' as const,
        notes: walletData.notes || '',
        deletedAt: null
      }

      const result: CreateResult = await walletSchema.create(dataWithDefaults)

      if (result.success && result.data) {
        const newWallet = result.data as Wallet
        wallets.value.push(newWallet)
        updateCache(newWallet)
        return newWallet
      } else {
        throw new Error(result.error || 'Failed to create wallet entry')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al crear gasto'
      console.error('Error creating wallet:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateWallet = async (walletId: string, updates: WalletUpdateInput): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const result: UpdateResult = await walletSchema.update(walletId, updates)

      if (result.success) {
        // Update local state
        const walletIndex = wallets.value.findIndex(wallet => wallet.id === walletId)
        if (walletIndex !== -1) {
          wallets.value[walletIndex] = {
            ...wallets.value[walletIndex],
            ...updates,
            updatedAt: new Date()
          } as Wallet
          updateCache(wallets.value[walletIndex])
        }
      } else {
        throw new Error(result.error || 'Failed to update wallet entry')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al actualizar gasto'
      console.error('Error updating wallet:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteWallet = async (walletId: string): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      // Use soft delete
      const result: UpdateResult = await walletSchema.softDelete(walletId)

      if (result.success) {
        // Update local state
        const walletIndex = wallets.value.findIndex(wallet => wallet.id === walletId)
        if (walletIndex !== -1) {
          wallets.value[walletIndex] = {
            ...wallets.value[walletIndex],
            deletedAt: new Date(),
            updatedAt: new Date()
          }
          updateCache(wallets.value[walletIndex])
        }
      } else {
        throw new Error(result.error || 'Failed to delete wallet entry')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al eliminar gasto'
      console.error('Error deleting wallet:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const restoreWallet = async (walletId: string): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const result: UpdateResult = await walletSchema.restore(walletId)

      if (result.success) {
        // Update local state
        const walletIndex = wallets.value.findIndex(wallet => wallet.id === walletId)
        if (walletIndex !== -1) {
          wallets.value[walletIndex] = {
            ...wallets.value[walletIndex],
            deletedAt: undefined,
            updatedAt: new Date()
          }
          updateCache(wallets.value[walletIndex])
        }
      } else {
        throw new Error(result.error || 'Failed to restore wallet entry')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al restaurar gasto'
      console.error('Error restoring wallet:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // ==========================================
  // ACTIONS - SPECIALIZED WALLET OPERATIONS
  // ==========================================

  const getWalletsByDateRange = async (startDate: Date, endDate: Date): Promise<Wallet[]> => {
    try {
      const result = await walletSchema.findByDateRange(startDate, endDate)

      if (result.success && result.data) {
        return result.data as Wallet[]
      }
      return []
    } catch (err) {
      console.error('Error getting wallets by date range:', err)
      return []
    }
  }

  const getWalletsByCategory = async (category: string): Promise<Wallet[]> => {
    try {
      const result = await walletSchema.findByCategory(category)

      if (result.success && result.data) {
        return result.data as Wallet[]
      }
      return []
    } catch (err) {
      console.error('Error getting wallets by category:', err)
      return []
    }
  }

  const getWalletsByClient = async (clientId: string): Promise<Wallet[]> => {
    try {
      const result = await walletSchema.findByClientId(clientId)

      if (result.success && result.data) {
        return result.data as Wallet[]
      }
      return []
    } catch (err) {
      console.error('Error getting wallets by client:', err)
      return []
    }
  }

  const getWalletsByJob = async (jobId: string): Promise<Wallet[]> => {
    try {
      const result = await walletSchema.findByJobId(jobId)

      if (result.success && result.data) {
        return result.data as Wallet[]
      }
      return []
    } catch (err) {
      console.error('Error getting wallets by job:', err)
      return []
    }
  }

  const getTotalExpensesByDateRange = async (startDate: Date, endDate: Date): Promise<number> => {
    const wallets = await getWalletsByDateRange(startDate, endDate)
    return wallets
      .filter(wallet => wallet.movementType === 'outcome')
      .reduce((sum, wallet) => sum + wallet.amount, 0)
  }

  const getExpensesByCategory = async (): Promise<{ category: string; total: number; count: number }[]> => {
    await loadWallets() // Ensure we have latest data

    const categoryMap = new Map<string, { total: number; count: number }>()

    activeWallets.value
      .filter(wallet => wallet.movementType === 'outcome')
      .forEach(wallet => {
        const existing = categoryMap.get(wallet.category) || { total: 0, count: 0 }
        categoryMap.set(wallet.category, {
          total: existing.total + wallet.amount,
          count: existing.count + 1
        })
      })

    return Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      total: data.total,
      count: data.count
    }))
  }

  // ==========================================
  // ACTIONS - HELPER FUNCTIONS
  // ==========================================

  const initialize = async (): Promise<void> => {
    if (initialized.value) return

    try {
      await loadWallets()
      initialized.value = true
    } catch (err) {
      console.error('Error initializing wallets store:', err)
      // Don't throw here, let the component handle the error state
    }
  }

  // ==========================================
  // RETURN STORE INTERFACE
  // ==========================================

  return {
    // State
    wallets: readonly(wallets),
    loading: readonly(loading),
    error: readonly(error),

    // Getters
    getWalletById,
    totalWallets,
    activeWallets,
    totalExpenses,

    // Actions
    loadWallets,
    createWallet,
    updateWallet,
    deleteWallet,
    restoreWallet,
    getWalletsByDateRange,
    getWalletsByCategory,
    getWalletsByClient,
    getWalletsByJob,
    getTotalExpensesByDateRange,
    getExpensesByCategory,
    initialize
  }
})
