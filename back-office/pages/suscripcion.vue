<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div class="max-w-lg w-full">
      <!-- Success State - Subscription Active -->
      <div v-if="subscriptionStore.hasActiveSubscription" class="bg-white rounded-xl shadow-lg p-8">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <IconCheckCircle class="w-8 h-8 text-green-600" />
          </div>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">Suscripción Activa</h1>
          <p class="text-gray-600">Tu suscripción está activa y al día</p>
        </div>

        <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div class="flex items-center gap-3">
            <IconCreditCard class="w-5 h-5 text-green-600" />
            <div>
              <p class="text-sm font-medium text-green-800">Plan Mensual</p>
              <p class="text-xs text-green-700">{{ subscriptionStore.formattedPrice }}/mes</p>
            </div>
          </div>
        </div>

        <button
          @click="navigateTo('/')"
          class="w-full bg-blue-600 text-white px-6 py-3 rounded-lg text-base font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
        >
          Ir al Panel Principal
        </button>
      </div>

      <!-- Pending State - Waiting for confirmation -->
      <div v-else-if="showPendingConfirmation" class="bg-white rounded-xl shadow-lg p-8">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <IconClockOutline class="w-8 h-8 text-amber-600 animate-pulse" />
          </div>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">Procesando tu Suscripción</h1>
          <p class="text-gray-600">Estamos confirmando tu pago con Mercado Pago</p>
        </div>

        <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div class="flex items-start gap-3">
            <IconInformation class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div class="text-sm text-amber-800">
              <p class="font-medium mb-1">Esto puede demorar unos segundos</p>
              <p>Una vez confirmado, podrás acceder a todas las funcionalidades de InstalaPro.</p>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-center gap-2 text-gray-500 mb-6">
          <div class="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          <span class="text-sm">Verificando estado...</span>
        </div>

        <button
          @click="checkSubscriptionStatus"
          :disabled="isChecking"
          class="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg text-base font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition disabled:opacity-50"
        >
          {{ isChecking ? 'Verificando...' : 'Verificar manualmente' }}
        </button>
      </div>

      <!-- Default State - Show subscription offer -->
      <div v-else class="bg-white rounded-xl shadow-lg p-8">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <IconAirConditioner class="w-8 h-8 text-white" />
          </div>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">InstalaPro</h1>
          <p class="text-gray-600">Tu herramienta de gestión para técnicos</p>
        </div>

        <!-- Price Card -->
        <div class="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 mb-6 text-white">
          <div class="flex items-baseline justify-center gap-1 mb-2">
            <span class="text-4xl font-bold">{{ subscriptionStore.formattedPrice }}</span>
            <span class="text-blue-200">/mes</span>
          </div>
          <p class="text-center text-blue-100 text-sm">Facturación mensual automática</p>
        </div>

        <!-- Features List -->
        <div class="space-y-3 mb-6">
          <div class="flex items-center gap-3">
            <IconCheck class="w-5 h-5 text-green-500 flex-shrink-0" />
            <span class="text-gray-700">Agenda de trabajos ilimitados</span>
          </div>
          <div class="flex items-center gap-3">
            <IconCheck class="w-5 h-5 text-green-500 flex-shrink-0" />
            <span class="text-gray-700">Gestión de clientes</span>
          </div>
          <div class="flex items-center gap-3">
            <IconCheck class="w-5 h-5 text-green-500 flex-shrink-0" />
            <span class="text-gray-700">Reportes y estadísticas</span>
          </div>
          <div class="flex items-center gap-3">
            <IconCheck class="w-5 h-5 text-green-500 flex-shrink-0" />
            <span class="text-gray-700">Soporte prioritario</span>
          </div>
        </div>

        <!-- Auth check before subscribe (not authenticated OR auto-demo user) -->
        <div v-if="needsGoogleSignIn" class="space-y-3">
          <p class="text-center text-sm text-gray-600 mb-4">
            {{ isAutoDemo ? 'Estás explorando en modo demo. Para suscribirte, ingresá con tu cuenta de Google' : 'Para suscribirte, primero necesitás iniciar sesión' }}
          </p>
          <button
            @click="handleGoogleSignIn"
            :disabled="isSigningIn"
            class="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg text-base font-medium hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50"
          >
            <div v-if="isSigningIn" class="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            <IconGoogle v-else class="w-5 h-5" />
            <span>{{ isSigningIn ? 'Iniciando sesión...' : 'Continuar con Google' }}</span>
          </button>
        </div>

        <!-- Subscribe button (authenticated real users, not demo) -->
        <div v-else class="space-y-3">
          <button
            @click="handleSubscribe"
            :disabled="isRedirecting"
            class="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg text-base font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50"
          >
            <div v-if="isRedirecting" class="w-5 h-5 border-2 border-blue-200 border-t-white rounded-full animate-spin"></div>
            <IconCreditCard v-else class="w-5 h-5" />
            <span>{{ isRedirecting ? 'Redirigiendo...' : 'Suscribirme ahora' }}</span>
          </button>
          <p class="text-center text-xs text-gray-500">
            Serás redirigido a Mercado Pago para completar el pago
          </p>
        </div>

        <!-- Security badges -->
        <div class="mt-6 pt-6 border-t border-gray-100">
          <div class="flex items-center justify-center gap-4 text-gray-400">
            <div class="flex items-center gap-1">
              <IconShieldCheck class="w-4 h-4" />
              <span class="text-xs">Pago seguro</span>
            </div>
            <div class="flex items-center gap-1">
              <IconLock class="w-4 h-4" />
              <span class="text-xs">SSL</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Back link -->
      <div class="text-center mt-4">
        <NuxtLink
          to="/"
          class="text-sm text-gray-600 hover:text-gray-900 underline"
        >
          Volver al panel
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useSubscriptionStore } from '~/stores/subscription'

// Icons
import IconAirConditioner from '~icons/mdi/air-conditioner'
import IconCheck from '~icons/mdi/check'
import IconCheckCircle from '~icons/mdi/check-circle'
import IconCreditCard from '~icons/mdi/credit-card-outline'
import IconClockOutline from '~icons/mdi/clock-outline'
import IconInformation from '~icons/mdi/information-outline'
import IconGoogle from '~icons/logos/google-icon'
import IconShieldCheck from '~icons/mdi/shield-check-outline'
import IconLock from '~icons/mdi/lock-outline'

definePageMeta({
  layout: false
  // No middleware - subscription page must be accessible to everyone
})

useSeoMeta({
  title: 'Suscripción - InstalaPro',
  description: 'Suscribite a InstalaPro y accedé a todas las herramientas para gestionar tu negocio de aire acondicionado',
  robots: 'noindex, nofollow'
})

// ==========================================
// STORES
// ==========================================

const authStore = useAuthStore()
const subscriptionStore = useSubscriptionStore()
const { $toast } = useNuxtApp()
const route = useRoute()

// ==========================================
// STATE
// ==========================================

const isSigningIn = ref(false)
const isRedirecting = ref(false)
const isChecking = ref(false)
const showPendingConfirmation = ref(false)

// ==========================================
// COMPUTED
// ==========================================

// Check if user was auto-logged into demo account
const isAutoDemo = computed(() => {
  if (!process.client) return false
  return localStorage.getItem('instalapro_auto_demo') === 'true'
})

// Check if user needs to sign in with Google (not authenticated OR is auto-demo)
const needsGoogleSignIn = computed(() => {
  return !authStore.isAuthenticated || isAutoDemo.value
})

// Check if returning from MercadoPago
const isReturningFromMP = computed(() => {
  // Check for common MP return params or if explicitly set
  return route.query.status === 'pending' ||
         route.query.status === 'approved' ||
         route.query.preapproval_id !== undefined ||
         route.query.from === 'mp'
})

// ==========================================
// METHODS
// ==========================================

const handleGoogleSignIn = async () => {
  if (isSigningIn.value) return

  isSigningIn.value = true

  try {
    // If user is auto-demo, sign out first and clear flags
    if (isAutoDemo.value && authStore.isAuthenticated) {
      localStorage.removeItem('instalapro_auto_demo')
      localStorage.removeItem('instalapro_isTestUser')
      await authStore.signOut()
    }

    authStore.clearError()
    await authStore.signInWithGoogle()
    $toast.success('Sesión iniciada correctamente')

    // Initialize subscription store after login
    await subscriptionStore.initialize()
  } catch (error) {
    console.error('Sign in failed:', error)
    $toast.error('Error al iniciar sesión. Por favor, intenta de nuevo.')
  } finally {
    isSigningIn.value = false
  }
}

const handleSubscribe = () => {
  if (isRedirecting.value) return

  isRedirecting.value = true
  $toast.info('Redirigiendo a Mercado Pago...')

  // Small delay for UX
  setTimeout(() => {
    subscriptionStore.redirectToMercadoPago()
  }, 500)
}

const checkSubscriptionStatus = async () => {
  if (isChecking.value) return

  isChecking.value = true

  try {
    await subscriptionStore.loadSubscription()

    if (subscriptionStore.hasActiveSubscription) {
      $toast.success('Suscripción confirmada')
      showPendingConfirmation.value = false
    } else if (subscriptionStore.isPendingSubscription) {
      $toast.info('Tu suscripción aún está siendo procesada')
    } else {
      $toast.info('No encontramos una suscripción activa')
    }
  } catch (error) {
    console.error('Error checking subscription:', error)
    $toast.error('Error al verificar el estado')
  } finally {
    isChecking.value = false
  }
}

// ==========================================
// LIFECYCLE
// ==========================================

let checkInterval = null

onMounted(async () => {
  // Initialize subscription store if authenticated
  if (authStore.isAuthenticated) {
    await subscriptionStore.initialize()
  }

  // If returning from MP, show pending state
  if (isReturningFromMP.value && authStore.isAuthenticated) {
    showPendingConfirmation.value = true

    // Poll for subscription status every 3 seconds
    checkInterval = setInterval(async () => {
      await subscriptionStore.loadSubscription()

      if (subscriptionStore.hasActiveSubscription) {
        showPendingConfirmation.value = false
        $toast.success('Tu suscripción fue activada correctamente')
        clearInterval(checkInterval)
      }
    }, 3000)

    // Stop polling after 2 minutes
    setTimeout(() => {
      if (checkInterval) {
        clearInterval(checkInterval)
      }
    }, 120000)
  }
})

onUnmounted(() => {
  if (checkInterval) {
    clearInterval(checkInterval)
  }
})
</script>
