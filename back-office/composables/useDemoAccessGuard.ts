import { computed, readonly } from 'vue'

interface DemoUpgradeState {
  isOpen: boolean
  actionLabel: string | null
}

const useDemoUpgradeState = () =>
  useState<DemoUpgradeState>('demo-upgrade-state', () => ({
    isOpen: false,
    actionLabel: null
  }))

export const useDemoAccessGuard = () => {
  const authStore = useAuthStore()
  const router = useRouter()
  const demoState = useDemoUpgradeState()
  const { info } = useToast()

  // Check if user is in demo/test mode
  const isDemoUser = computed(() => authStore.isTestUser)

  // Check if user was auto-logged into demo account (guest exploring)
  const isAutoDemo = computed(() => {
    if (!process.client) return false
    return localStorage.getItem('instalapro_auto_demo') === 'true'
  })

  // Check if user is a guest (auto-logged into demo for exploration)
  // This replaces the old "not authenticated" guest mode
  const isGuestMode = computed(() => {
    if (!process.client) return false
    // Guest mode = auto-demo user (logged into test account automatically)
    return isAutoDemo.value
  })

  // Check if user has active subscription (for authenticated non-demo users)
  const hasActiveSubscription = computed(() => {
    // Demo users don't need subscription
    if (isDemoUser.value) return true
    // Guests don't have subscription
    if (isGuestMode.value) return false
    // Check subscription store
    try {
      const subscriptionStore = useSubscriptionStore()
      return subscriptionStore.hasActiveSubscription
    } catch {
      return false
    }
  })

  // Determine if user needs to upgrade (guest, demo, or no subscription)
  const needsUpgrade = computed(() => {
    return isGuestMode.value || isDemoUser.value || !hasActiveSubscription.value
  })

  const openUpgradeModal = (actionLabel?: string) => {
    // Open modal for guests, demo users, or users without subscription
    if (!needsUpgrade.value) {
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
    // Block action if user needs to upgrade
    if (!needsUpgrade.value) {
      return false
    }

    openUpgradeModal(actionLabel)
    return true
  }

  const continueWithGoogle = async () => {
    if (!process.client) {
      return
    }

    closeUpgradeModal({ preserveActionLabel: true })
    info('Redirigiendo al inicio de sesión para continuar con Google...')

    try {
      // Clear auto-demo flag so user can create their own account
      localStorage.removeItem('instalapro_auto_demo')
      localStorage.removeItem('instalapro_isTestUser')

      if (authStore.isAuthenticated) {
        await authStore.signOut()
      }
    } catch (error) {
      console.error('Error signing out from demo mode:', error)
    } finally {
      // Navigate to subscription page
      router.push('/suscripcion')
    }
  }

  const redirectToSubscription = () => {
    closeUpgradeModal({ preserveActionLabel: true })
    router.push('/suscripcion')
  }

  return {
    isDemoUser,
    isGuestMode,
    isAutoDemo,
    hasActiveSubscription,
    needsUpgrade,
    demoState: readonly(demoState),
    openUpgradeModal,
    closeUpgradeModal,
    resetUpgradeMessage,
    requireFullAccount,
    continueWithGoogle,
    redirectToSubscription
  }
}
