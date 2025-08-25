export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()

  // Only run on client side
  if (process.client) {
    // If user is not authenticated, redirect to sign-in page
    if (!authStore.isAuthenticated) {
      return navigateTo('/sign-in')
    }
  }
})