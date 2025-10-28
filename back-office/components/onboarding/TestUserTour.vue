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

const STORAGE_KEY = 'instalapro_backoffice_test_tour_seen'

const driverInstance = shallowRef(null)
const isLaunching = ref(false)
const autoLaunchAttempts = ref(0)

// Retry auto-launch a few times to cover slower dashboard renders after SPA navigation
const MAX_AUTO_LAUNCH_ATTEMPTS = 6
const AUTO_LAUNCH_RETRY_DELAY = 1400

let autoLaunchRetryId = null

const shouldShowLauncher = computed(() => process.client && authStore.isTestUser)

const ensureDriver = async () => {
  const module = await import('driver.js')
  return module.driver
}

const waitForElements = (selectors, timeout = 8000, interval = 120) => {
  if (!process.client) {
    return Promise.resolve(false)
  }

  return new Promise((resolve) => {
    const start = performance.now()

    const check = () => {
      const missing = selectors.some((selector) => !document.querySelector(selector))

      if (!missing) {
        resolve(true)
        return
      }

      if (performance.now() - start >= timeout) {
        resolve(false)
        return
      }

      window.setTimeout(check, interval)
    }

    check()
  })
}

const buildSteps = () => {
  if (!process.client) {
    return []
  }

  const definitions = [
    {
      selector: '[data-tour-id="sidebar-navigation"]',
      title: 'Menú principal',
      description: 'Desde aquí podés navegar el panel principal, agenda, clientes, reportes y configuración.'
    },
    {
      selector: '[data-tour-id="topbar"]',
      title: 'Barra superior',
      description: 'Siempre vas a ver el título de la sección actual y, en móvil, podés abrir el menú desde acá.',
      side: 'bottom'
    },
    {
      selector: '[data-tour-id="dashboard-today"]',
      title: 'Resumen del día',
      description: 'Controlá tus trabajos, pendientes y próximos turnos con estos indicadores rápidos.',
      side: 'top'
    },
    {
      selector: '[data-tour-id="dashboard-week"]',
      title: 'Resumen de la semana',
      description: 'Compará tus trabajos confirmados, ingresos y horas disponibles para los próximos días.',
      side: 'top'
    },
    {
      selector: '[data-tour-id="dashboard-month"]',
      title: 'Resumen del mes',
      description: 'Controlá la evolución mensual de tus ingresos, trabajos realizados y nuevos clientes.',
      side: 'top'
    },
    {
      selector: '[data-tour-id="dashboard-quick-actions"]',
      title: 'Acciones rápidas',
      description: 'Creá un nuevo trabajo, abrí la agenda o cargá un cliente en un solo click.',
      side: 'top'
    },
    {
      selector: '[data-tour-id="dashboard-recent-activity"]',
      title: 'Actividad en vivo',
      description: 'Seguimiento cronológico de lo último que sucedió con tus clientes y servicios.',
      side: 'top'
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
          side: item.side || 'right',
          align: 'start'
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
      '[data-tour-id="sidebar-navigation"]',
      '[data-tour-id="topbar"]'
    ]

    if (route.path === '/') {
      selectors.push(
        '[data-tour-id="dashboard-today"]',
        '[data-tour-id="dashboard-week"]',
        '[data-tour-id="dashboard-month"]',
        '[data-tour-id="dashboard-quick-actions"]',
        '[data-tour-id="dashboard-recent-activity"]'
      )
    }

    const ready = await waitForElements(selectors)

    if (!ready) {
      return false
    }

    if (driverInstance.value) {
      driverInstance.value.destroy()
      driverInstance.value = null
    }

    const createDriver = await ensureDriver()
    const steps = buildSteps()

    if (!steps.length) {
      return false
    }

    driverInstance.value = createDriver({
      showProgress: true,
      animate: true,
      allowClose: true,
      overlayOpacity: 0.45,
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      doneBtnText: 'Listo',
      closeBtnText: 'Cerrar',
      steps
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

  if (!authStore.initialized || !authStore.isTestUser || route.path !== '/' || hasSeenTour) {
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

  if (process.client) {
    if (autoLaunchRetryId !== null) {
      window.clearTimeout(autoLaunchRetryId)
      autoLaunchRetryId = null
    }
  }
})
</script>
