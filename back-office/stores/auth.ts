import { defineStore } from 'pinia'
import { type User } from 'firebase/auth'
import { signInWithGoogle, signOutUser, onAuthStateChange, signInWithEmailPassword } from '@/utils/firebase'

interface AuthState {
  user: User | null
  loading: boolean
  initialized: boolean
  error: string | null
  isTestUser: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    loading: false, // Start with loading false to avoid hydration mismatch
    initialized: false, // Track if auth state has been initialized
    error: null,
    isTestUser: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    userEmail: (state) => state.user?.email || null,
    userName: (state) => state.user?.displayName || state.user?.email || null,
    userPhoto: (state) => state.user?.photoURL || null
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
        const config = useRuntimeConfig()
        const expectedCode = config.public.testAccessCode as string | undefined

        if (!expectedCode) {
          throw new Error('El acceso de prueba no está configurado')
        }

        if (code.trim() !== expectedCode.trim()) {
          throw new Error('El código ingresado no es válido')
        }

        const testUserEmail = config.public.testUserEmail as string | undefined
        const testUserPassword = config.public.testUserPassword as string | undefined

        if (!testUserEmail || !testUserPassword) {
          throw new Error('Las credenciales de prueba no están configuradas')
        }

        await signInWithEmailPassword(testUserEmail, testUserPassword)

        // Store test user flag in localStorage
        if (process.client) {
          localStorage.setItem('instalapro_isTestUser', 'true')
        }

        this.isTestUser = true
      } catch (error: any) {
        console.error('Test access sign in error:', error)
        const message = error?.message || 'Error al validar el código de acceso'
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

        // Clear test user flag from localStorage
        if (process.client) {
          localStorage.removeItem('instalapro_isTestUser')
        }

        this.isTestUser = false

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

          if (user) {
            // Check localStorage for test user flag instead of custom claims
            this.isTestUser = localStorage.getItem('instalapro_isTestUser') === 'true'
          } else {
            this.isTestUser = false
          }

          this.initialized = true // Mark as initialized once we get the first auth state
        })
      }
    },

    clearError() {
      this.error = null
    }
  }
})
