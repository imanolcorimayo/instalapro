export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()

  // Only run on client side
  if (process.client) {
    // If user is authenticated and trying to access sign-in page, redirect to dashboard
    if (authStore.isAuthenticated && to.path === '/sign-in') {
      return navigateTo('/')
    }
  }
})