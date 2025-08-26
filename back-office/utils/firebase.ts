import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getAnalytics, type Analytics } from 'firebase/analytics'
import { getAuth, type Auth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, type User, setPersistence, browserLocalPersistence } from 'firebase/auth'

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
let auth: Auth | null = null

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

// Get Auth instance
export const getAuthInstance = (): Auth => {
  if (auth) {
    return auth
  }

  const app = initializeFirebase()
  auth = getAuth(app)
  
  // Ensure persistence is set to local storage (this is the default, but being explicit)
  if (typeof window !== 'undefined') {
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.warn('Failed to set auth persistence:', error)
    })
  }
  
  return auth
}

// Initialize Google Auth Provider
export const getGoogleProvider = (): GoogleAuthProvider => {
  const provider = new GoogleAuthProvider()
  provider.addScope('email')
  provider.addScope('profile')
  return provider
}

// Sign in with Google
export const signInWithGoogle = async (): Promise<User | null> => {
  try {
    const auth = getAuthInstance()
    const provider = getGoogleProvider()
    const result = await signInWithPopup(auth, provider)
    return result.user
  } catch (error) {
    console.error('Error signing in with Google:', error)
    throw error
  }
}

// Sign out
export const signOutUser = async (): Promise<void> => {
  try {
    const auth = getAuthInstance()
    await signOut(auth)
  } catch (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

// Get current user
export const getCurrentUser = (): User | null => {
  const auth = getAuthInstance()
  return auth.currentUser
}

// Listen to auth state changes
export const onAuthStateChange = (callback: (user: User | null) => void): (() => void) => {
  const auth = getAuthInstance()
  return onAuthStateChanged(auth, callback)
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