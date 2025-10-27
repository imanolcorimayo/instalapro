import admin from 'firebase-admin'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

interface FirebaseAdminConfig {
  firebaseServiceAccount?: string | Record<string, any>
}

let firebaseAdminApp: admin.app.App | null = null

const parseServiceAccount = (raw: string | Record<string, any> | undefined) => {
  if (!raw) {
    return null
  }

  if (typeof raw === 'object') {
    return raw
  }

  const trimmed = raw.trim()
  if (!trimmed) {
    return null
  }

  const tryParseJson = (value: string) => {
    try {
      return JSON.parse(value)
    } catch {
      return null
    }
  }

  const directParse = tryParseJson(trimmed)
  if (directParse) {
    return directParse
  }

  try {
    const decoded = Buffer.from(trimmed, 'base64').toString('utf8')
    const decodedParse = tryParseJson(decoded)
    if (decodedParse) {
      return decodedParse
    }
  } catch (error) {
    console.error('Failed to decode base64 Firebase service account:', error)
  }

  throw new Error('Invalid Firebase service account JSON provided')
}

const loadServiceAccountFromFile = () => {
  const potentialPaths = [
    join(process.cwd(), 'scripts', 'service-account.json'),
    join(process.cwd(), 'server', 'service-account.json')
  ]

  for (const path of potentialPaths) {
    if (existsSync(path)) {
      const raw = readFileSync(path, 'utf8')
      return JSON.parse(raw)
    }
  }

  return null
}

const getServiceAccount = (config: FirebaseAdminConfig) => {
  const fromConfig = parseServiceAccount(config.firebaseServiceAccount)
  if (fromConfig) {
    return fromConfig
  }

  const fromFile = loadServiceAccountFromFile()
  if (fromFile) {
    return fromFile
  }

  throw new Error('Firebase service account credentials are not configured')
}

export const getFirebaseAdminApp = (config: FirebaseAdminConfig) => {
  if (firebaseAdminApp) {
    return firebaseAdminApp
  }

  if (admin.apps.length > 0) {
    firebaseAdminApp = admin.apps[0]!
    return firebaseAdminApp
  }

  const serviceAccount = getServiceAccount(config)

  firebaseAdminApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
  })

  return firebaseAdminApp
}

export const getFirebaseAdminAuth = (config: FirebaseAdminConfig) => {
  const app = getFirebaseAdminApp(config)
  return admin.auth(app)
}
