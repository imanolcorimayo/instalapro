export default defineNuxtPlugin(() => {
  const authStore = useAuthStore()

  // Initialize auth listener on app start to persist login state
  authStore.initializeAuthListener()
})