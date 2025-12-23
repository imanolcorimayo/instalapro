<template>
  <ModalStructure
    ref="modalRef"
    :close-on-backdrop-click="false"
    modal-class="max-w-md"
    modal-namespace="demo-upgrade-modal"
    :title="modalTitle"
    @on-close="handleModalClosed"
  >
    <div class="flex flex-col gap-4">
      <!-- Guest Mode Info (auto-demo user) -->
      <div v-if="isGuestMode" class="rounded-xl bg-indigo-50 border border-indigo-100 p-4 flex items-start gap-3">
        <IconAccountCircle class="h-6 w-6 text-indigo-500 flex-shrink-0" />
        <div class="space-y-1">
          <p class="text-sm text-indigo-800 font-medium">
            Estás navegando como invitado
          </p>
          <p class="text-sm text-indigo-700">
            Para usar InstalaPro necesitás crear una cuenta y suscribirte.
          </p>
        </div>
      </div>

      <!-- Demo Mode Info (test user with access code) -->
      <div v-else-if="isDemoUser" class="rounded-xl bg-blue-50 border border-blue-100 p-4 flex items-start gap-3">
        <IconLightbulb class="h-6 w-6 text-blue-500 flex-shrink-0" />
        <div class="space-y-1">
          <p class="text-sm text-blue-800 font-medium">
            Estás navegando con datos de ejemplo.
          </p>
          <p class="text-sm text-blue-700">
            Todo lo que ves es una vista previa preparada para que explores sin riesgo.
          </p>
        </div>
      </div>

      <!-- Authenticated user without subscription -->
      <div v-else class="rounded-xl bg-amber-50 border border-amber-100 p-4 flex items-start gap-3">
        <IconCreditCardOff class="h-6 w-6 text-amber-500 flex-shrink-0" />
        <div class="space-y-1">
          <p class="text-sm text-amber-800 font-medium">
            Suscripción requerida
          </p>
          <p class="text-sm text-amber-700">
            Para usar todas las funcionalidades de InstalaPro necesitás una suscripción activa.
          </p>
        </div>
      </div>

      <!-- Action message -->
      <div class="space-y-3 text-sm text-gray-600 leading-relaxed">
        <p v-if="demoState.actionLabel">
          Para <span class="font-medium text-gray-800">{{ demoState.actionLabel }}</span> necesitás {{ actionRequirement }}.
        </p>
        <p v-else>
          {{ defaultActionMessage }}
        </p>
      </div>

      <!-- Subscription Price Info -->
      <div class="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-4 text-white">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-blue-100">Plan Mensual</p>
            <p class="text-2xl font-bold">$10.000</p>
          </div>
          <div class="text-right">
            <p class="text-xs text-blue-200">por mes</p>
            <p class="text-xs text-blue-200">Facturación automática</p>
          </div>
        </div>
      </div>

      <!-- Features mini list -->
      <div class="grid grid-cols-2 gap-2 text-xs text-gray-600">
        <div class="flex items-center gap-1">
          <IconCheck class="h-3.5 w-3.5 text-green-500" />
          <span>Agenda ilimitada</span>
        </div>
        <div class="flex items-center gap-1">
          <IconCheck class="h-3.5 w-3.5 text-green-500" />
          <span>Gestión de clientes</span>
        </div>
        <div class="flex items-center gap-1">
          <IconCheck class="h-3.5 w-3.5 text-green-500" />
          <span>Reportes</span>
        </div>
        <div class="flex items-center gap-1">
          <IconCheck class="h-3.5 w-3.5 text-green-500" />
          <span>Soporte prioritario</span>
        </div>
      </div>

      <!-- CTA Buttons -->
      <div class="flex flex-col gap-2">
        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-white font-medium shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          @click="handleSubscribe"
        >
          <IconGoogle v-if="isGuestMode || isDemoUser" class="h-5 w-5" />
          <IconCreditCard v-else class="h-5 w-5" />
          {{ ctaButtonText }}
        </button>
        <button
          type="button"
          class="text-sm text-gray-500 hover:text-gray-700 underline transition"
          @click="handleKeepExploring"
        >
          Seguir explorando
        </button>
      </div>

      <!-- Security note -->
      <p class="text-center text-xs text-gray-400">
        Pago seguro con Mercado Pago
      </p>
    </div>
  </ModalStructure>
</template>

<script setup>
import IconLightbulb from '~icons/mdi/lightbulb-on-outline'
import IconAccountCircle from '~icons/mdi/account-circle-outline'
import IconCreditCardOff from '~icons/mdi/credit-card-off-outline'
import IconCreditCard from '~icons/mdi/credit-card-outline'
import IconGoogle from '~icons/logos/google-icon'
import IconCheck from '~icons/mdi/check'

const modalRef = ref(null)
const router = useRouter()
const authStore = useAuthStore()
const { $toast } = useNuxtApp()

const { demoState, closeUpgradeModal, resetUpgradeMessage, isGuestMode, isDemoUser } = useDemoAccessGuard()

const modalTitle = computed(() => {
  if (isGuestMode.value || isDemoUser.value) {
    return 'Modo demo activo'
  }
  // Authenticated user without subscription
  return 'Suscribite a InstalaPro'
})

const actionRequirement = computed(() => {
  if (isGuestMode.value) {
    return 'crear una cuenta y suscribirte'
  }
  if (isDemoUser.value) {
    return 'ingresar con tu cuenta de Google'
  }
  return 'activar tu suscripción'
})

const defaultActionMessage = computed(() => {
  if (isGuestMode.value) {
    return 'Para usar estas herramientas con tus propios datos, creá tu cuenta y suscribite.'
  }
  if (isDemoUser.value) {
    return 'Para usar estas herramientas con tus propios datos, ingresá con Google.'
  }
  return 'Para continuar usando InstalaPro, activá tu suscripción.'
})

const ctaButtonText = computed(() => {
  if (isGuestMode.value) {
    return 'Crear cuenta y suscribirme'
  }
  if (isDemoUser.value) {
    return 'Conectar con Google y suscribirme'
  }
  return 'Activar suscripción'
})

watch(
  () => demoState.value.isOpen,
  (isOpen) => {
    if (!modalRef.value) {
      return
    }

    if (isOpen) {
      modalRef.value.showModal()
    } else {
      modalRef.value.closeModal()
    }
  }
)

const handleKeepExploring = () => {
  closeUpgradeModal({ preserveActionLabel: true })
}

const handleSubscribe = async () => {
  closeUpgradeModal({ preserveActionLabel: true })

  if (isGuestMode.value) {
    // Guest user needs to sign in first, then go to subscription
    $toast.info('Redirigiendo para crear tu cuenta...')
    router.push('/suscripcion')
  } else if (isDemoUser.value) {
    // Demo user needs to sign out and then sign in with real account
    try {
      await authStore.signOut()
      router.push('/suscripcion')
    } catch (error) {
      console.error('Error signing out:', error)
      router.push('/suscripcion')
    }
  } else {
    // Authenticated user without subscription, go directly to subscription page
    router.push('/suscripcion')
  }
}

const handleModalClosed = () => {
  closeUpgradeModal({ preserveActionLabel: true })
  resetUpgradeMessage()
}
</script>
