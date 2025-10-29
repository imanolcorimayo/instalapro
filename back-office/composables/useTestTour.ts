import { ref } from 'vue'

/**
 * Composable for shared test tour utility functions
 * Each tour component manages its own state (driverInstance, isLaunching, etc.)
 * This composable only provides reusable utility functions
 */
export const useTestTour = () => {
  const MOBILE_BREAKPOINT_QUERY = '(max-width: 1023px)'
  const SIDEBAR_ANIMATION_DELAY = 340

  const isMobileScreen = ref(false)
  let mobileMediaQuery = null

  /**
   * Handle media query changes for mobile detection
   */
  const handleMobileMediaChange = (event) => {
    if (!event || typeof event.matches !== 'boolean') {
      return
    }
    isMobileScreen.value = event.matches
  }

  /**
   * Set up mobile screen detection
   */
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

  /**
   * Clean up mobile detection listeners
   */
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

  /**
   * Wait for specific elements to appear in the DOM
   */
  const waitForElements = (selectors, timeout = 8000, interval = 120) => {
    if (!process.client) {
      return Promise.resolve(false)
    }

    const selectorGroups = selectors
      .map((entry) => {
        if (Array.isArray(entry)) {
          return entry.filter(Boolean)
        }
        return [entry].filter(Boolean)
      })
      .filter((group) => group.length > 0)

    if (!selectorGroups.length) {
      return Promise.resolve(true)
    }

    return new Promise((resolve) => {
      const start = performance.now()

      const check = () => {
        const missing = selectorGroups.some((group) =>
          !group.some((selector) => document.querySelector(selector))
        )

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

  /**
   * Wait for a specific duration
   */
  const wait = (ms) =>
    new Promise((resolve) => {
      window.setTimeout(resolve, ms)
    })

  /**
   * Get sidebar wrapper element
   */
  const getSidebarWrapper = () => {
    if (!process.client) {
      return null
    }
    return document.querySelector('.fixed.inset-y-0.left-0')
  }

  /**
   * Check if sidebar is currently open
   */
  const isSidebarOpen = () => {
    const sidebar = getSidebarWrapper()
    if (!sidebar) {
      return false
    }
    return !sidebar.classList.contains('-translate-x-full')
  }

  /**
   * Check if element is inside the sidebar
   */
  const isElementInsideSidebar = (element) => {
    if (!element) {
      return false
    }
    return Boolean(element.closest('[data-tour-id="sidebar-navigation"]'))
  }

  /**
   * Open the sidebar menu (mobile)
   */
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

  /**
   * Close the sidebar menu (mobile)
   */
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

  // Initialize mobile detection
  if (process.client) {
    setupMobileDetection()
  }

  return {
    // Mobile detection
    isMobileScreen,
    setupMobileDetection,
    teardownMobileDetection,

    // Element utilities
    waitForElements,
    wait,

    // Sidebar utilities
    getSidebarWrapper,
    isSidebarOpen,
    isElementInsideSidebar,
    openSidebarMenu,
    closeSidebarMenu,

    // Constants
    SIDEBAR_ANIMATION_DELAY
  }
}
