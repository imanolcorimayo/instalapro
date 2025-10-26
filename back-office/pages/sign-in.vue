<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
      <!-- Logo and Title -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <IconAirConditioner class="w-8 h-8 text-white" />
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">InstalaPro</h1>
        <p class="text-gray-600">Panel de administración para técnicos</p>
      </div>

      <!-- Error Message -->
      <div v-if="authStore.error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-red-700 text-sm">{{ authStore.error }}</p>
      </div>

      <!-- Sign in button -->
      <button
        @click="handleGoogleSignIn"
        :disabled="authStore.loading"
        class="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg text-base font-medium hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div v-if="authStore.loading" class="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        <IconGoogle v-else class="w-5 h-5" />
        <span>{{ authStore.loading ? 'Iniciando sesión...' : 'Continuar con Google' }}</span>
      </button>

      <!-- Footer -->
      <div class="mt-8 text-center">
        <p class="text-sm text-gray-500">
          Solo para técnicos registrados en InstalaPro
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Icons
import IconAirConditioner from '~icons/mdi/air-conditioner'
import IconGoogle from '~icons/logos/google-icon'

definePageMeta({
  layout: false,
  middleware: 'guest'
})

const authStore = useAuthStore()
const { $toast } = useNuxtApp()

const handleGoogleSignIn = async () => {
  try {
    authStore.clearError()
    await authStore.signInWithGoogle()
    
    $toast.success('¡Sesión iniciada correctamente!')
    
    // Redirect to dashboard after successful sign in
    await navigateTo('/')
  } catch (error) {
    console.error('Sign in failed:', error)
    $toast.error('Error al iniciar sesión. Por favor, intenta de nuevo.')
  }
}

</script>