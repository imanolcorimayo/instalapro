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
        :disabled="isGoogleSigningIn || isSubmittingAccessCode"
        class="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg text-base font-medium hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div v-if="isGoogleSigningIn" class="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        <IconGoogle v-else class="w-5 h-5" />
        <span>{{ isGoogleSigningIn ? 'Iniciando sesión...' : 'Continuar con Google' }}</span>
      </button>

      <!-- Test Access Code -->
      <div v-if="testAccessEnabled" class="mt-8 border-t border-gray-100 pt-6">
        <p class="text-sm font-medium text-gray-700 mb-3">
          ¿Recibiste un código de acceso para pruebas?
        </p>
        <div class="space-y-3">
          <div>
            <input
              v-model="testCode"
              type="text"
              inputmode="text"
              autocomplete="one-time-code"
              placeholder="Ingresa tu código de prueba"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              :disabled="isSubmittingAccessCode || isGoogleSigningIn"
            />
            <p v-if="codeError" class="mt-2 text-sm text-red-600">
              {{ codeError }}
            </p>
          </div>

          <button
            @click="handleAccessCodeSignIn"
            :disabled="isSubmittingAccessCode || isGoogleSigningIn"
            class="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg text-base font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div v-if="isSubmittingAccessCode" class="w-5 h-5 border-2 border-blue-200 border-t-white rounded-full animate-spin"></div>
            <span>{{ isSubmittingAccessCode ? 'Verificando...' : 'Usar código de prueba' }}</span>
          </button>
        </div>
        <p class="mt-3 text-xs text-gray-500">
          Esto habilita datos de demostración para explorar el panel y el flujo de reservas.
        </p>
      </div>

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
import { computed, ref, watch } from 'vue'
// Icons
import IconAirConditioner from '~icons/mdi/air-conditioner'
import IconGoogle from '~icons/logos/google-icon'

definePageMeta({
  layout: false,
  middleware: 'guest'
})

const authStore = useAuthStore()
const { $toast } = useNuxtApp()
const runtimeConfig = useRuntimeConfig()

const testAccessEnabled = computed(() => runtimeConfig.public.testAccessEnabled)
const testCode = ref('')
const codeError = ref('')
const isSubmittingAccessCode = ref(false)
const isGoogleSigningIn = ref(false)

watch(testCode, () => {
  if (codeError.value) {
    codeError.value = ''
  }
})

const handleGoogleSignIn = async () => {
  if (isGoogleSigningIn.value || isSubmittingAccessCode.value) {
    return
  }

  isGoogleSigningIn.value = true

  try {
    authStore.clearError()
    await authStore.signInWithGoogle()
    
    $toast.success('¡Sesión iniciada correctamente!')
    
    // Redirect to dashboard after successful sign in
    await navigateTo('/')
  } catch (error) {
    console.error('Sign in failed:', error)
    $toast.error('Error al iniciar sesión. Por favor, intenta de nuevo.')
  } finally {
    isGoogleSigningIn.value = false
  }
}

const handleAccessCodeSignIn = async () => {
  if (!testAccessEnabled.value || isGoogleSigningIn.value) {
    return
  }

  const trimmedCode = testCode.value.trim()

  if (!trimmedCode) {
    codeError.value = 'Ingresa el código que te compartimos para acceder.'
    return
  }

  codeError.value = ''
  authStore.clearError()
  isSubmittingAccessCode.value = true

  try {
    await authStore.signInWithAccessCode(trimmedCode)
    $toast.success('Modo demo activado correctamente')
    testCode.value = ''
    await navigateTo('/')
  } catch (error) {
    console.error('Test access sign in failed:', error)
    if (authStore.error) {
      $toast.error(authStore.error)
    } else {
      $toast.error('No pudimos validar el código. Intenta nuevamente.')
    }
  } finally {
    isSubmittingAccessCode.value = false
  }
}

</script>
