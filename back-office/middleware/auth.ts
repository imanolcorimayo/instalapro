export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()

  // Only run on client side
  if (process.client) {
    // Wait for auth state to be initialized
    while (!authStore.initialized) {
      await new Promise(resolve => setTimeout(resolve, 50))
    }

    // If user is not authenticated, auto-login to test account for demo experience
    // This allows guests to explore with real demo data
    if (!authStore.isAuthenticated) {
      try {
        const config = useRuntimeConfig()
        const testUserEmail = config.public.testUserEmail as string | undefined
        const testUserPassword = config.public.testUserPassword as string | undefined

        if (testUserEmail && testUserPassword) {
          // Import the sign-in function
          const { signInWithEmailPassword } = await import('@/utils/firebase')
          await signInWithEmailPassword(testUserEmail, testUserPassword)

          // Mark as guest/demo user in localStorage
          localStorage.setItem('instalapro_isTestUser', 'true')
          localStorage.setItem('instalapro_auto_demo', 'true')
          authStore.isTestUser = true

          // Wait for auth state to update
          while (!authStore.isAuthenticated) {
            await new Promise(resolve => setTimeout(resolve, 50))
          }
        } else {
          // No test credentials configured, redirect to sign-in
          return navigateTo('/sign-in')
        }
      } catch (error) {
        console.error('Error auto-signing into demo account:', error)
        return navigateTo('/sign-in')
      }
    }

    // Check subscription status for authenticated non-demo users
    // Skip subscription check for now - will be enabled when MP webhook is ready
    // if (!authStore.isTestUser) {
    //   try {
    //     const subscriptionStore = useSubscriptionStore()
    //
    //     // Initialize subscription store if not initialized
    //     if (!subscriptionStore.initialized) {
    //       await subscriptionStore.initialize()
    //     }
    //
    //     // If user doesn't have active subscription and not on subscription page, redirect
    //     if (!subscriptionStore.hasActiveSubscription && to.path !== '/suscripcion' && to.path !== '/settings') {
    //       return navigateTo('/suscripcion')
    //     }
    //   } catch (error) {
    //     console.error('Error checking subscription status:', error)
    //     // Allow access on error - don't block users due to subscription check errors
    //   }
    // }

    // User is authenticated, now check if they have a technician profile
    const techniciansStore = useTechniciansStore()

    // Wait for technician store to be initialized
    if (!techniciansStore.initialized) {
      await techniciansStore.initialize()
    }

    // If user doesn't have a technician profile and is not on settings page, redirect to settings
    if (!techniciansStore.technician && to.path !== '/settings' && to.path !== '/suscripcion') {
      return navigateTo('/settings')
    }
  }
})