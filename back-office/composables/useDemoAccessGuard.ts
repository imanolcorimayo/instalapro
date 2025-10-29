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

  const isDemoUser = computed(() => authStore.isTestUser)

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

  const continueWithGoogle = async () => {
    if (!process.client) {
      return
    }

    closeUpgradeModal({ preserveActionLabel: true })
    info('Redirigiendo al inicio de sesión para continuar con Google...')

    try {
      await authStore.signOut()
    } catch (error) {
      console.error('Error signing out from demo mode:', error)
    } finally {
      // Ensure navigation to sign-in page even if signOut throws
      router.push('/sign-in')
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
