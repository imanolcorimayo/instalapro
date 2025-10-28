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
const MOBILE_BREAKPOINT_QUERY = '(max-width: 1023px)'
const SIDEBAR_ANIMATION_DELAY = 340

const isMobileScreen = ref(false)
let mobileMediaQuery = null
let shouldCloseSidebarAfterTour = false
let shouldReopenSidebarAfterTour = false
let initialSidebarOpen = false

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

const wait = (ms) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })

const handleMobileMediaChange = (event) => {
  if (!event || typeof event.matches !== 'boolean') {
    return
  }

  isMobileScreen.value = event.matches
}

const setupMobileDetection = () => {
  if (!process.client) {
    return
  }

  mobileMediaQuery = window.matchMedia(MOBILE_BREAKPOINT_QUERY)
  handleMobileMediaChange(mobileMediaQuery)

  if (typeof mobileMediaQuery.addEventListener === 'function') {
    mobileMediaQuery.addEventListener('change', handleMobileMediaChange)
  } else if (typeof mobileMediaQuery.addListener === 'function') {
    mobileMediaQuery.addListener(handleMobileMediaChange)
  }
}

const teardownMobileDetection = () => {
  if (!mobileMediaQuery) {
    return
  }

  if (typeof mobileMediaQuery.removeEventListener === 'function') {
    mobileMediaQuery.removeEventListener('change', handleMobileMediaChange)
  } else if (typeof mobileMediaQuery.removeListener === 'function') {
    mobileMediaQuery.removeListener(handleMobileMediaChange)
  }

  mobileMediaQuery = null
}

const getSidebarWrapper = () => {
  if (!process.client) {
    return null
  }

  return document.querySelector('.fixed.inset-y-0.left-0')
}

const isSidebarOpen = () => {
  const sidebar = getSidebarWrapper()

  if (!sidebar) {
    return false
  }

  return !sidebar.classList.contains('-translate-x-full')
}

const isElementInsideSidebar = (element) => {
  if (!element) {
    return false
  }

  return Boolean(element.closest('[data-tour-id="sidebar-navigation"]'))
}

const openSidebarMenu = async () => {
  if (!process.client) {
    return false
  }

  const openButton = document.querySelector('[data-tour-id="topbar"] button.lg\\:hidden')

  if (!openButton) {
    return false
  }

  openButton.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  await wait(SIDEBAR_ANIMATION_DELAY)

  return true
}

const closeSidebarMenu = async () => {
  if (!process.client) {
    return
  }

  if (!isSidebarOpen()) {
    return
  }

  const sidebar = getSidebarWrapper()
  const closeButton = sidebar?.querySelector('button.lg\\:hidden')

  if (closeButton) {
    closeButton.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  } else {
    const overlay = document.querySelector('.fixed.inset-0.z-40.lg\\:hidden .bg-black.bg-opacity-50')
    overlay?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  }

  await wait(SIDEBAR_ANIMATION_DELAY)
}

const ensureSidebarVisibleForTour = async () => {
  if (!process.client || !isMobileScreen.value) {
    return false
  }

  if (isSidebarOpen()) {
    return false
  }

  const opened = await openSidebarMenu()
  return opened && isSidebarOpen()
}

const restoreSidebarState = async () => {
  if (!process.client) {
    return
  }

  if (shouldReopenSidebarAfterTour && !isSidebarOpen()) {
    await openSidebarMenu()
  } else if (shouldCloseSidebarAfterTour && isSidebarOpen()) {
    await closeSidebarMenu()
  }

  shouldCloseSidebarAfterTour = false
  shouldReopenSidebarAfterTour = false
}

if (process.client) {
  setupMobileDetection()
}

const buildSteps = () => {
  if (!process.client) {
    return []
  }

  const definitions = [
    {
      selector: '[data-tour-id="sidebar-navigation"]',
      title: 'Menú principal',
      description: 'Desde aquí podés navegar por todas las secciones de tu back office.',
      side: 'right',
      mobileSide: 'bottom',
      mobileAlign: 'center'
    },
    {
      selector: '[data-tour-id="menu-panel-principal"]',
      title: 'Panel Principal',
      description: 'Tu vista general con métricas del día, semana y mes en un solo lugar.',
      side: 'right',
      mobileSide: 'bottom',
      mobileAlign: 'center'
    },
    {
      selector: '[data-tour-id="menu-configuracion"]',
      title: 'Configuración',
      description: 'Configurá tu perfil, servicios, horarios disponibles y preferencias.',
      side: 'right',
      mobileSide: 'bottom',
      mobileAlign: 'center'
    },
    {
      selector: '[data-tour-id="menu-agenda"]',
      title: 'Agenda',
      description: 'Gestioná tus turnos, citas y trabajos programados día a día.',
      side: 'right',
      mobileSide: 'bottom',
      mobileAlign: 'center'
    },
    {
      selector: '[data-tour-id="menu-clientes"]',
      title: 'Clientes',
      description: 'Tu base de datos de clientes con historial de servicios y contactos.',
      side: 'right',
      mobileSide: 'bottom',
      mobileAlign: 'center'
    },
    {
      selector: '[data-tour-id="menu-reportes"]',
      title: 'Reportes',
      description: 'Visualizá tus ingresos, trabajos completados y estadísticas del negocio.',
      side: 'right',
      mobileSide: 'bottom',
      mobileAlign: 'center'
    },
    {
      selector: '[data-tour-id="dashboard-today"]',
      title: 'Resumen del día',
      description: 'Controlá tus trabajos, pendientes y próximos turnos de hoy.',
      side: 'top',
      mobileSide: 'bottom',
      mobileAlign: 'center'
    },
    {
      selector: '[data-tour-id="dashboard-week-month"]',
      title: 'Resumen semanal y mensual',
      description: 'Compará tus trabajos confirmados, ingresos y evolución a corto y largo plazo.',
      side: 'top',
      mobileSide: 'bottom',
      mobileAlign: 'center'
    },
    {
      selector: '[data-tour-id="dashboard-actions-activity"]',
      title: 'Acciones y actividad',
      description: 'Creá trabajos rápidamente y seguí la actividad reciente con tus clientes.',
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
    initialSidebarOpen = isSidebarOpen()
    shouldCloseSidebarAfterTour = false
    shouldReopenSidebarAfterTour = false

    const selectors = [
      '[data-tour-id="sidebar-navigation"]',
      '[data-tour-id="menu-panel-principal"]',
      '[data-tour-id="menu-configuracion"]',
      '[data-tour-id="menu-agenda"]',
      '[data-tour-id="menu-clientes"]',
      '[data-tour-id="menu-reportes"]'
    ]

    if (route.path === '/') {
      selectors.push(
        '[data-tour-id="dashboard-today"]',
        '[data-tour-id="dashboard-week-month"]',
        '[data-tour-id="dashboard-actions-activity"]'
      )
    }

    const ready = await waitForElements(selectors)

    if (!ready) {
      return false
    }

    if (driverInstance.value) {
      await restoreSidebarState()
      driverInstance.value.destroy()
      driverInstance.value = null
    }

    const forcedSidebarOpen = await ensureSidebarVisibleForTour()
    shouldCloseSidebarAfterTour = forcedSidebarOpen

    const createDriver = await ensureDriver()
    const steps = buildSteps()

    if (!steps.length) {
      await restoreSidebarState()
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
      steps,
      onHighlighted: async (element) => {
        if (isMobileScreen.value) {
          const insideSidebar = isElementInsideSidebar(element)

          if (insideSidebar && !isSidebarOpen()) {
            shouldCloseSidebarAfterTour = shouldCloseSidebarAfterTour || !initialSidebarOpen
            shouldReopenSidebarAfterTour = shouldReopenSidebarAfterTour || initialSidebarOpen
            await openSidebarMenu()
          } else if (!insideSidebar && isSidebarOpen()) {
            shouldReopenSidebarAfterTour = shouldReopenSidebarAfterTour || initialSidebarOpen
            await closeSidebarMenu()
          }
        }

        element?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        })
      },
      onReset: () => {
        void restoreSidebarState()
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

    void restoreSidebarState()
  }

  teardownMobileDetection()
})
</script>
