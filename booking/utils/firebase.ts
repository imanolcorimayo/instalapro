import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getFirestore, type Firestore } from 'firebase/firestore'

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
