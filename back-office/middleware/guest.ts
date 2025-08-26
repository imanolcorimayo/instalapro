export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()

  // Only run on client side
  if (process.client) {
    // Wait for auth state to be initialized
    while (!authStore.initialized) {
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    
    // If user is authenticated and trying to access sign-in page, redirect to dashboard
    if (authStore.isAuthenticated && to.path === '/sign-in') {
      return navigateTo('/')
    }
  }
})