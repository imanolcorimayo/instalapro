import { defineStore } from 'pinia'
import type { Client } from '~/types'
import { ClientsSchema } from '~/utils/odm/schemas/clientSchema'

export const useClientsStore = defineStore('clients', () => {
  // ==========================================
  // SCHEMA & STATE
  // ==========================================

  const clientsSchema = new ClientsSchema()
  const client = ref<Client | null>(null)
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  // ==========================================
  // ACTIONS
  // ==========================================

  const findClientByEmail = async (email: string, technicianUserUid: string): Promise<Client | null> => {
    loading.value = true
    error.value = null
    client.value = null

    try {
      const result = await clientsSchema.findByEmailAndTechnicianUid(email, technicianUserUid)

      if (!result.success) {
        error.value = result.error || 'Error buscando cliente'
        return null
      }

      if (result.data && result.data.length > 0) {
        client.value = result.data[0] as Client
        return client.value
      }

      // No client found with this email
      return null
    } catch (err: any) {
      error.value = err.message || 'Error al buscar cliente'
      console.error('Error finding client by email:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const clearClient = () => {
    client.value = null
    error.value = null
  }

  const resetStore = () => {
    client.value = null
    loading.value = false
    error.value = null
  }

  // Return store interface
  return {
    // State
    client,
    loading,
    error,

    // Actions
    findClientByEmail,
    clearClient,
    resetStore
  }
})
