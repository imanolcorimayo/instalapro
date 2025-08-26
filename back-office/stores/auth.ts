import { defineStore } from 'pinia'
import { type User } from 'firebase/auth'
import { signInWithGoogle, signOutUser, onAuthStateChange } from '@/utils/firebase'

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

      try {
        const user = await signInWithGoogle()
        // Don't set this.user here - let the auth listener handle it
        // Don't set loading to false - let the auth listener handle it
        return user
      } catch (error: any) {
        console.error('Sign in error:', error)
        this.error = error.message || 'Error al iniciar sesión con Google'
        throw error
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