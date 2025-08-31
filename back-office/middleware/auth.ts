export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()

  // Only run on client side
  if (process.client) {
    // Wait for auth state to be initialized
    while (!authStore.initialized) {
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    
    // If user is not authenticated, redirect to sign-in page
    if (!authStore.isAuthenticated) {
      return navigateTo('/sign-in')
    }

    // User is authenticated, now check if they have a technician profile
    const techniciansStore = useTechniciansStore()
    
    // Wait for technician store to be initialized
    if (!techniciansStore.initialized) {
      await techniciansStore.initialize()
    }

    // If user doesn't have a technician profile and is not on settings page, redirect to settings
    if (!techniciansStore.technician && to.path !== '/settings') {
      return navigateTo('/settings')
    }
  }
})