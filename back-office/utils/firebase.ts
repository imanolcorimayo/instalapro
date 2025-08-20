import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getAnalytics, type Analytics } from 'firebase/analytics'

// Firebase configuration interface
interface FirebaseConfig {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

// Get Firebase configuration from environment variables
export const getFirebaseConfig = (): FirebaseConfig => {
  const config = useRuntimeConfig()
  
  return {
    apiKey: config.public.firebaseApiKey,
    authDomain: config.public.firebaseAuthDomain,
    projectId: config.public.firebaseProjectId,
    storageBucket: config.public.firebaseStorageBucket,
    messagingSenderId: config.public.firebaseMessagingSenderId,
    appId: config.public.firebaseAppId,
  }
}

// Initialize Firebase app
let firebaseApp: FirebaseApp | null = null
let firestore: Firestore | null = null
let analytics: Analytics | null = null

export const initializeFirebase = (): FirebaseApp => {
  if (firebaseApp) {
    return firebaseApp
  }

  const config = getFirebaseConfig()
  firebaseApp = initializeApp(config)
  
  return firebaseApp
}

// Get Firestore instance
export const getFirestoreInstance = (): Firestore => {
  if (firestore) {
    return firestore
  }

  const app = initializeFirebase()
  firestore = getFirestore(app)
  
  return firestore
}

// Get Analytics instance (client-side only)
export const getAnalyticsInstance = (): Analytics | null => {
  if (typeof window === 'undefined') {
    return null // Server-side, analytics not available
  }

  if (analytics) {
    return analytics
  }

  try {
    const app = initializeFirebase()
    analytics = getAnalytics(app)
    return analytics
  } catch (error) {
    console.warn('Analytics initialization failed:', error)
    return null
  }
}

// Utility function to check if Firebase is properly configured
export const isFirebaseConfigured = (): boolean => {
  try {
    const config = getFirebaseConfig()
    return !!(
      config.apiKey &&
      config.authDomain &&
      config.projectId &&
      config.storageBucket &&
      config.messagingSenderId &&
      config.appId
    )
  } catch {
    return false
  }
}