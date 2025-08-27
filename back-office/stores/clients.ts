import { defineStore } from 'pinia'
import { ClientSchema } from '~/utils/odm/schemas/clientSchema'
import type { FetchResult, CreateResult, UpdateResult, DeleteResult } from '~/utils/odm/types'

// Define Client interface based on the schema
export interface Client {
  id: string
  name: string
  phone: string
  address: string
  email?: string
  serviceHistory: JobHistory[]
  totalJobs: number
  totalSpent: number
  preferredServiceTypes: string[]
  notes: string
  userUid: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  createdBy?: string
  archivedAt?: Date
}

export interface JobHistory {
  jobId: string
  date: Date
  serviceType: string
  description: string
  price: number
  status: string
}

export interface ClientCreateInput {
  name: string
  phone: string
  address: string
  email?: string
  notes?: string
  totalJobs?: number
  totalSpent?: number
}

export interface ClientUpdateInput {
  name?: string
  phone?: string
  address?: string
  email?: string
  notes?: string
  preferredServiceTypes?: string[]
}

export const useClientsStore = defineStore('clients', () => {
  // ==========================================
  // STATE
  // ==========================================
  
  const clients = ref<Client[]>([])
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)
  const initialized = ref<boolean>(false)
  
  // Cache to avoid multiple calls to storage/Firestore
  const clientsCache = new Map<string, Client>()
  
  // Schema instance for data operations
  const clientSchema = new ClientSchema()

  // ==========================================
  // GETTERS
  // ==========================================

  const getClientById = computed(() => (id: string): Client | null => {
    // Try cache first
    if (clientsCache.has(id)) {
      return clientsCache.get(id) || null
    }
    
    // Fallback to reactive array
    return clients.value.find(client => client.id === id) || null
  })

  const totalClients = computed(() => clients.value.length)

  const activeClients = computed(() => 
    clients.value.filter(client => client.isActive !== false)
  )

  // ==========================================
  // ACTIONS - CACHE MANAGEMENT
  // ==========================================

  const updateCache = (client: Client): void => {
    clientsCache.set(client.id, client)
  }

  const removeFromCache = (clientId: string): void => {
    clientsCache.delete(clientId)
  }

  const refreshCache = (): void => {
    clientsCache.clear()
    clients.value.forEach(client => {
      clientsCache.set(client.id, client)
    })
  }

  // ==========================================
  // ACTIONS - DATA OPERATIONS
  // ==========================================

  const loadClients = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const result: FetchResult<Client> = await clientSchema.find()

      console.log('Loaded clients:', result);
      
      if (result.success && result.data) {
        clients.value = result.data
        refreshCache()
      } else {
        throw new Error(result.error || 'Failed to load clients')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar clientes'
      console.error('Error loading clients:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createClient = async (clientData: ClientCreateInput): Promise<string> => {
    loading.value = true
    error.value = null

    try {
      // Prepare data with defaults
      const dataWithDefaults = {
        ...clientData,
        serviceHistory: [],
        totalJobs: clientData.totalJobs || 0,
        totalSpent: clientData.totalSpent || 0,
        preferredServiceTypes: [],
        notes: clientData.notes || '',
        isActive: true
      }

      const result: CreateResult = await clientSchema.create(dataWithDefaults)
      
      if (result.success && result.data) {
        const newClient = result.data as Client
        clients.value.push(newClient)
        updateCache(newClient)
        return newClient.id
      } else {
        throw new Error(result.error || 'Failed to create client')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al crear cliente'
      console.error('Error creating client:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateClient = async (clientId: string, updates: ClientUpdateInput): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const result: UpdateResult = await clientSchema.update(clientId, updates)
      
      if (result.success) {
        // Update local state
        const clientIndex = clients.value.findIndex(client => client.id === clientId)
        if (clientIndex !== -1) {
          clients.value[clientIndex] = {
            ...clients.value[clientIndex],
            ...updates,
            updatedAt: new Date()
          }
          updateCache(clients.value[clientIndex])
        }
      } else {
        throw new Error(result.error || 'Failed to update client')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al actualizar cliente'
      console.error('Error updating client:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteClient = async (clientId: string): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const result: DeleteResult = await clientSchema.delete(clientId)
      
      if (result.success) {
        // Remove from local state
        clients.value = clients.value.filter(client => client.id !== clientId)
        removeFromCache(clientId)
      } else {
        throw new Error(result.error || 'Failed to delete client')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al eliminar cliente'
      console.error('Error deleting client:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // ==========================================
  // ACTIONS - SPECIALIZED CLIENT OPERATIONS
  // ==========================================

  const updateServiceHistory = async (clientId: string, jobHistoryEntry: JobHistory): Promise<void> => {
    try {
      const client = getClientById.value(clientId)
      if (!client) {
        throw new Error('Client not found')
      }
      
      const updatedHistory = [...(client.serviceHistory || []), jobHistoryEntry]
      const newTotalJobs = updatedHistory.length
      const newTotalSpent = updatedHistory.reduce((sum, entry) => sum + (entry.price || 0), 0)
      
      await updateClient(clientId, {
        serviceHistory: updatedHistory,
        totalJobs: newTotalJobs,
        totalSpent: newTotalSpent
      })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al actualizar historial de servicios'
      throw err
    }
  }
  
  const updatePreferredServices = async (clientId: string, serviceTypes: string[]): Promise<void> => {
    try {
      await updateClient(clientId, { preferredServiceTypes: serviceTypes })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al actualizar servicios preferidos'
      throw err
    }
  }

  const addNote = async (clientId: string, note: string): Promise<void> => {
    try {
      const client = getClientById.value(clientId)
      if (!client) {
        throw new Error('Client not found')
      }
      
      const existingNotes = client.notes || ''
      const timestamp = new Date().toLocaleDateString('es-AR')
      const updatedNotes = existingNotes 
        ? `${existingNotes}\n\n[${timestamp}] ${note}`
        : `[${timestamp}] ${note}`
      
      await updateClient(clientId, { notes: updatedNotes })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al agregar nota'
      throw err
    }
  }

  const searchClients = async (query: string): Promise<Client[]> => {
    if (!query.trim()) {
      return activeClients.value
    }

    // For complex search, filter in-memory for now
    // TODO: Implement Firestore full-text search or Algolia integration
    const searchTerm = query.toLowerCase().trim()
    return activeClients.value.filter(client =>
      client.name.toLowerCase().includes(searchTerm) ||
      client.phone.includes(searchTerm) ||
      client.address.toLowerCase().includes(searchTerm) ||
      (client.email && client.email.toLowerCase().includes(searchTerm))
    )
  }
  
  // Statistics and business logic methods (moved from schema)
  const getClientStats = async () => {
    try {
      await loadClients() // Ensure we have latest data
      
      const allClients = activeClients.value
      const totalClients = allClients.length
      const totalRevenue = allClients.reduce((sum, client) => sum + (client.totalSpent || 0), 0)
      const totalJobs = allClients.reduce((sum, client) => sum + (client.totalJobs || 0), 0)
      const averageRevenuePerClient = totalClients > 0 ? totalRevenue / totalClients : 0

      return {
        totalClients,
        totalRevenue,
        totalJobs,
        averageRevenuePerClient
      }
    } catch (err) {
      console.error('Error calculating client stats:', err)
      throw new Error('Failed to calculate client statistics')
    }
  }
  
  const getTopClients = async (limit: number = 10): Promise<Client[]> => {
    await loadClients() // Ensure we have latest data
    return [...activeClients.value]
      .sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0))
      .slice(0, limit)
  }
  
  const getFrequentClients = async (limit: number = 10): Promise<Client[]> => {
    await loadClients() // Ensure we have latest data
    return [...activeClients.value]
      .sort((a, b) => (b.totalJobs || 0) - (a.totalJobs || 0))
      .slice(0, limit)
  }
  
  const getRecentClients = async (limit: number = 10): Promise<Client[]> => {
    await loadClients() // Ensure we have latest data
    return [...activeClients.value]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
  }

  // ==========================================
  // ACTIONS - HELPER FUNCTIONS
  // ==========================================

  const refreshClientData = async (clientId: string): Promise<void> => {
    try {
      const result = await clientSchema.findById(clientId)
      
      if (result.success && result.data) {
        const updatedClient = result.data as Client
        const clientIndex = clients.value.findIndex(client => client.id === clientId)
        
        if (clientIndex !== -1) {
          clients.value[clientIndex] = updatedClient
          updateCache(updatedClient)
        }
      }
    } catch (err) {
      console.error('Error refreshing client data:', err)
    }
  }

  const initialize = async (): Promise<void> => {
    if (initialized.value) return
    
    try {
      await loadClients()
      initialized.value = true
    } catch (err) {
      console.error('Error initializing clients store:', err)
      // Don't throw here, let the component handle the error state
    }
  }

  // ==========================================
  // RETURN STORE INTERFACE
  // ==========================================

  return {
    // State
    clients: readonly(clients),
    loading: readonly(loading),
    error: readonly(error),

    // Getters
    getClientById,
    totalClients,
    activeClients,

    // Actions
    loadClients,
    createClient,
    updateClient,
    deleteClient,
    updateServiceHistory,
    updatePreferredServices,
    addNote,
    searchClients,
    initialize,
    
    // Statistics and business logic
    getClientStats,
    getTopClients,
    getFrequentClients,
    getRecentClients
  }
})