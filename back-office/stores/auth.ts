import { defineStore } from 'pinia'
import { type User } from 'firebase/auth'
import { signInWithGoogle, signOutUser, onAuthStateChange } from '@/utils/firebase'

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    loading: false,
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
      this.loading = true
      this.error = null

      try {
        const user = await signInWithGoogle()
        this.user = user
        return user
      } catch (error: any) {
        console.error('Sign in error:', error)
        this.error = error.message || 'Error al iniciar sesión con Google'
        throw error
      } finally {
        this.loading = false
      }
    },

    async signOut() {
      this.loading = true
      this.error = null

      try {
        await signOutUser()
        this.user = null
        
        // Navigate to sign-in page after sign out
        if (process.client) {
          await navigateTo('/sign-in')
        }
      } catch (error: any) {
        console.error('Sign out error:', error)
        this.error = error.message || 'Error al cerrar sesión'
        throw error
      } finally {
        this.loading = false
      }
    },

    initializeAuthListener() {
      if (process.client) {
        onAuthStateChange((user) => {
          this.user = user
        })
      }
    },

    clearError() {
      this.error = null
    }
  }
})