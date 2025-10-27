import { defineStore } from 'pinia'
import { type User } from 'firebase/auth'
import { ofetch } from 'ofetch'
import { signInWithGoogle, signOutUser, onAuthStateChange, signInWithCustomFirebaseToken } from '@/utils/firebase'

interface AuthState {
  user: User | null
  loading: boolean
  initialized: boolean
  error: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    loading: false, // Start with loading false to avoid hydration mismatch
    initialized: false, // Track if auth state has been initialized
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    userEmail: (state) => state.user?.email || null,
    userName: (state) => state.user?.displayName || state.user?.email || null,
    userPhoto: (state) => state.user?.photoURL || null,
  },

  actions: {
    async signInWithGoogle() {
      this.error = null
      this.loading = true

      try {
        const user = await signInWithGoogle()
        // Don't set this.user here - let the auth listener handle it
        return user
      } catch (error: any) {
        console.error('Sign in error:', error)
        this.error = error.message || 'Error al iniciar sesión con Google'
        throw error
      } finally {
        this.loading = false
      }
    },

    async signInWithAccessCode(code: string) {
      this.error = null
      this.loading = true

      try {
        const response = await ofetch<{ token?: string }>('/api/test-access', {
          method: 'POST',
          body: { code }
        })

        if (!response?.token) {
          throw new Error('No recibimos el token de acceso de prueba')
        }

        await signInWithCustomFirebaseToken(response.token)
      } catch (error: any) {
        console.error('Test access sign in error:', error)
        const message =
          error?.data?.message ||
          error?.statusMessage ||
          error?.message ||
          'Error al validar el código de acceso'

        this.error = message
        throw error
      } finally {
        this.loading = false
      }
    },

    async signOut() {
      this.error = null

      try {
        await signOutUser()
        // Don't set this.user to null here - let the auth listener handle it
        
        // Navigate to sign-in page after sign out
        if (process.client) {
          await navigateTo('/sign-in')
        }
      } catch (error: any) {
        console.error('Sign out error:', error)
        this.error = error.message || 'Error al cerrar sesión'
        throw error
      }
    },

    initializeAuthListener() {
      if (process.client) {
        return onAuthStateChange((user) => {
          this.user = user
          this.initialized = true // Mark as initialized once we get the first auth state
        })
      }
    },

    clearError() {
      this.error = null
    }
  }
})
