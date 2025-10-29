<template>
  <ClientOnly>
    <button
      v-if="shouldShowLauncher"
      type="button"
      class="fixed bottom-5 right-5 z-[60] inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-600/40 transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
      @click="startTour(true)"
    >
      <IconHelpCircleOutline class="h-5 w-5" />
      Guía rápida
    </button>
  </ClientOnly>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import IconHelpCircleOutline from '~icons/mdi/help-circle-outline'

const authStore = useAuthStore()
const route = useRoute()

const STORAGE_KEY = 'instalapro_backoffice_tour_configuracion_seen'
const MAX_AUTO_LAUNCH_ATTEMPTS = 6
const AUTO_LAUNCH_RETRY_DELAY = 1400

// Local state (not shared)
const driverInstance = shallowRef(null)
const isLaunching = ref(false)
const autoLaunchAttempts = ref(0)

let autoLaunchRetryId = null

// Get utilities from composable
const { isMobileScreen, waitForElements, teardownMobileDetection } = useTestTour()

const shouldShowLauncher = computed(() => process.client && authStore.isTestUser)

const ensureDriver = async () => {
  const module = await import('driver.js')
  return module.driver
}

const STEP_DEFINITIONS = [
  {
    selectors: [
      '[data-tour-id="settings-profile-card"]',
      '[data-tour-id="settings-profile-banner"]',
      '[data-tour-id="settings-profile-incomplete"]',
      '[data-tour-id="settings-account-deactivated"]'
    ],
    title: 'Información Personal',
    description: 'Configurá tu perfil profesional con tus datos de contacto y nombre de negocio.',
    side: 'bottom',
    mobileSide: 'bottom',
    mobileAlign: 'center'
  },
  {
    selectors: ['[data-tour-id="settings-booking-url"]'],
    title: 'URL de Reservas',
    description: 'Personalizá tu link único para compartir con clientes y recibir reservas online.',
    side: 'bottom',
    mobileSide: 'bottom',
    mobileAlign: 'center'
  },
  {
    selectors: ['[data-tour-id="settings-services-card"]'],
    title: 'Tipos de Servicio',
    description: 'Agregá los servicios que ofrecés con sus precios y duraciones estimadas.',
    side: 'bottom',
    mobileSide: 'bottom',
    mobileAlign: 'center'
  },
  {
    selectors: ['[data-tour-id="settings-quick-access"]'],
    title: 'Acceso Rápido',
    description: 'Revisá tu disponibilidad semanal y accedé directamente a la gestión de agenda.',
    side: 'bottom',
    mobileSide: 'bottom',
    mobileAlign: 'center'
  }
]

const buildSteps = () => {
  if (!process.client) {
    return []
  }

  return STEP_DEFINITIONS.reduce((steps, definition) => {
    const targetElement = definition.selectors
      .map((selector) => (selector ? document.querySelector(selector) : null))
      .find(Boolean)

    if (targetElement) {
      steps.push({
        element: targetElement,
        popover: {
          title: definition.title,
          description: definition.description,
          side: isMobileScreen.value ? definition.mobileSide || definition.side || 'bottom' : definition.side || 'right',
          align: isMobileScreen.value ? definition.mobileAlign || 'center' : 'start'
        }
      })
    }

    return steps
  }, [])
}

const startTour = async (force = false) => {
  if (!process.client) return false
  if (isLaunching.value) return false
  if (!force && localStorage.getItem(STORAGE_KEY) === '1') return false

  isLaunching.value = true

  try {
    const selectors = STEP_DEFINITIONS.map((definition) => definition.selectors)

    const ready = await waitForElements(selectors)

    if (!ready) {
      return false
    }

    if (driverInstance.value) {
      driverInstance.value.destroy()
      driverInstance.value = null
    }

    const steps = buildSteps()

    if (!steps.length) {
      return false
    }

    const createDriver = await ensureDriver()

    driverInstance.value = createDriver({
      showProgress: true,
      animate: true,
      allowClose: true,
      overlayOpacity: 0.45,
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      doneBtnText: 'Listo',
      closeBtnText: 'Cerrar',
      steps,
      onHighlighted: (element) => {
        element?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        })
      }
    })

    driverInstance.value.drive()

    localStorage.setItem(STORAGE_KEY, '1')

    return true
  } catch (error) {
    console.error('No se pudo iniciar la guía interactiva:', error)
    return false
  } finally {
    isLaunching.value = false
  }
}

const scheduleAutoLaunchRetry = () => {
  if (!process.client) return

  if (autoLaunchRetryId !== null) {
    window.clearTimeout(autoLaunchRetryId)
  }
  autoLaunchRetryId = window.setTimeout(() => {
    void tryAutoLaunch()
  }, AUTO_LAUNCH_RETRY_DELAY)
}

const tryAutoLaunch = async () => {
  if (!process.client) return

  const hasSeenTour = localStorage.getItem(STORAGE_KEY) === '1'

  if (!authStore.initialized || !authStore.isTestUser || route.path !== '/settings' || hasSeenTour) {
    autoLaunchAttempts.value = 0
    return
  }

  if (isLaunching.value) return
  if (autoLaunchAttempts.value >= MAX_AUTO_LAUNCH_ATTEMPTS) return

  autoLaunchAttempts.value += 1

  const launched = await startTour(false)

  if (launched) {
    autoLaunchAttempts.value = 0
    if (process.client && autoLaunchRetryId !== null) {
      window.clearTimeout(autoLaunchRetryId)
      autoLaunchRetryId = null
    }
    return
  }

  scheduleAutoLaunchRetry()
}

watch(
  () => [authStore.initialized, authStore.isTestUser, route.path],
  () => {
    if (!process.client) return
    void tryAutoLaunch()
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  if (driverInstance.value) {
    driverInstance.value.destroy()
    driverInstance.value = null
  }

  if (process.client && autoLaunchRetryId !== null) {
    window.clearTimeout(autoLaunchRetryId)
    autoLaunchRetryId = null
  }

  teardownMobileDetection()
})
</script>
