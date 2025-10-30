import { computed, readonly } from 'vue'

interface DemoUpgradeState {
  isOpen: boolean
  actionLabel: string | null
}

const useBookingDemoState = () =>
  useState<DemoUpgradeState>('booking-demo-upgrade-state', () => ({
    isOpen: false,
    actionLabel: null
  }))

const TEST_SLUG_FALLBACK = 'instalapro-demo'

export const useBookingDemoAccess = () => {
  const route = useRoute()
  const config = useRuntimeConfig()
  const demoState = useBookingDemoState()

  const demoSlug = computed(() => {
    const configured = config.public.testTechnicianSlug
    return configured && configured.trim().length > 0 ? configured.trim() : TEST_SLUG_FALLBACK
  })

  const currentSlug = computed(() => {
    const param = route.params.technician
    return Array.isArray(param) ? param[0] : param
  })

  const isDemoUser = computed(() => currentSlug.value === demoSlug.value)

  const openUpgradeModal = (actionLabel?: string) => {
    if (!isDemoUser.value) {
      return
    }

    demoState.value.isOpen = true
    demoState.value.actionLabel = actionLabel || null
  }

  const closeUpgradeModal = (options?: { preserveActionLabel?: boolean }) => {
    demoState.value.isOpen = false
    if (!options?.preserveActionLabel) {
      demoState.value.actionLabel = null
    }
  }

  const resetUpgradeMessage = () => {
    demoState.value.actionLabel = null
  }

  const requireFullAccount = (actionLabel?: string) => {
    if (!isDemoUser.value) {
      return false
    }

    openUpgradeModal(actionLabel)
    return true
  }

  const continueWithGoogle = () => {
    if (!process.client) {
      return
    }

    closeUpgradeModal({ preserveActionLabel: true })

    const loginUrl = 'https://instalapro-back-office.web.app'

    if (window?.open) {
      window.open(loginUrl, '_blank', 'noopener')
    } else {
      window.location.href = loginUrl
    }
  }

  return {
    isDemoUser,
    demoState: readonly(demoState),
    openUpgradeModal,
    closeUpgradeModal,
    resetUpgradeMessage,
    requireFullAccount,
    continueWithGoogle
  }
}
