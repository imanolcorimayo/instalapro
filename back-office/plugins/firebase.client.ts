import { initializeFirebase, getAnalyticsInstance, isFirebaseConfigured } from '~/utils/firebase'

export default defineNuxtPlugin(async () => {
  // Check if Firebase is properly configured
  if (!isFirebaseConfigured()) {
    console.warn('Firebase is not properly configured. Please check your environment variables.')
    return
  }

  try {
    // Initialize Firebase app
    const app = initializeFirebase()
    console.log('Firebase initialized successfully', app.name)

    // Initialize Analytics (optional)
    const analytics = getAnalyticsInstance()
    if (analytics) {
      console.log('Firebase Analytics initialized')
    }

    // Make Firebase app available globally if needed
    return {
      provide: {
        firebase: app
      }
    }
  } catch (error) {
    console.error('Firebase initialization failed:', error)
  }
})