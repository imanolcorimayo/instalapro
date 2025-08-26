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
  }
})