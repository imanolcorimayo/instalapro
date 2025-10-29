<template>
  <ClientOnly>
    <button
      v-if="shouldShowLauncher"
      type="button"
      class="fixed bottom-5 right-5 z-[40] inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-600/40 transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
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

const STORAGE_KEY = 'instalapro_backoffice_tour_reportes_seen'
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

const buildSteps = () => {
  if (!process.client) {
    return []
  }

  const definitions = [
    {
      selector: '[data-tour-id="reports-demo-toggle"]',
      title: 'Modo Demo',
      description: 'Probá la sección con datos de ejemplo para entender cómo funcionan los reportes.',
      side: 'bottom',
      mobileSide: 'bottom',
      mobileAlign: 'center'
    },
    {
      selector: '[data-tour-id="reports-week-selector"]',
      title: 'Selección de Semana',
      description: 'Navegá entre semanas para revisar el desempeño financiero de tu negocio.',
      side: 'bottom',
      mobileSide: 'bottom',
      mobileAlign: 'center'
    },
    {
      selector: '[data-tour-id="reports-tab-navigation"]',
      title: 'Pestañas de Reporte',
      description: 'Alterna entre resumen general, detalle de trabajos y movimientos financieros.',
      side: 'bottom',
      mobileSide: 'bottom',
      mobileAlign: 'center'
    },
    {
      selector: '[data-tour-id="reports-kpi-cards"]',
      title: 'Indicadores Clave',
      description: 'Visualizá balance, ingresos y gastos semanales con comparación vs semana anterior.',
      side: 'top',
      mobileSide: 'bottom',
      mobileAlign: 'center'
    },
    {
      selector: '[data-tour-id="reports-trend-chart"]',
      title: 'Gráfico de Tendencias',
      description: 'Seguí la evolución de tus ingresos y gastos en las últimas 8 semanas.',
      side: 'top',
      mobileSide: 'bottom',
      mobileAlign: 'center'
    }
  ]

  return definitions.reduce((steps, item) => {
    const element = document.querySelector(item.selector)
    if (element) {
      steps.push({
        element,
        popover: {
          title: item.title,
          description: item.description,
          side: isMobileScreen.value ? item.mobileSide || item.side || 'bottom' : item.side || 'right',
          align: isMobileScreen.value ? item.mobileAlign || 'center' : 'start'
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
    const selectors = [
      '[data-tour-id="reports-demo-toggle"]',
      '[data-tour-id="reports-week-selector"]',
      '[data-tour-id="reports-tab-navigation"]',
      '[data-tour-id="reports-kpi-cards"]'
    ]

    const ready = await waitForElements(selectors, 8000)

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

  if (!authStore.initialized || !authStore.isTestUser || route.path !== '/reportes' || hasSeenTour) {
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
