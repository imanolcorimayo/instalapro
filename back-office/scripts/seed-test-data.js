#!/usr/bin/env node
import admin from 'firebase-admin'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const {
  TEST_USER_UID = 'instalapro-demo-user',
  TEST_USER_EMAIL = 'demo.tech@instalapro.com',
  TEST_USER_NAME = 'InstalaPro Demo',
  TEST_TECHNICIAN_SLUG = 'instalapro-demo',
  TEST_TECHNICIAN_DOC_ID = TEST_TECHNICIAN_SLUG || 'instalapro-demo'
} = process.env

const now = new Date()

const parseServiceAccount = () => {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT

  if (raw && raw.trim()) {
    const trimmed = raw.trim()

    const tryParse = (value) => {
      try {
        return JSON.parse(value)
      } catch {
        return null
      }
    }

    const parsed = tryParse(trimmed)
    if (parsed) {
      return parsed
    }

    try {
      const decoded = Buffer.from(trimmed, 'base64').toString('utf8')
      const decodedParsed = tryParse(decoded)
      if (decodedParsed) {
        return decodedParsed
      }
    } catch (error) {
      console.error('Failed to decode FIREBASE_SERVICE_ACCOUNT as base64:', error)
    }

    throw new Error('FIREBASE_SERVICE_ACCOUNT is not valid JSON or base64-encoded JSON')
  }

  const candidates = [
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
    join(__dirname, 'service-account.json'),
    join(process.cwd(), 'scripts', 'service-account.json'),
    join(process.cwd(), 'service-account.json')
  ].filter(Boolean)

  for (const candidate of candidates) {
    if (candidate && existsSync(candidate)) {
      const fileContent = readFileSync(candidate, 'utf8')
      return JSON.parse(fileContent)
    }
  }

  throw new Error(
    'Provide Firebase service account credentials via FIREBASE_SERVICE_ACCOUNT (JSON/base64) or FIREBASE_SERVICE_ACCOUNT_PATH'
  )
}

const initializeFirebase = () => {
  if (admin.apps.length > 0) {
    return admin.app()
  }

  const serviceAccount = parseServiceAccount()

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  })

  return admin.app()
}

const db = () => admin.firestore()

const timestampNow = admin.firestore.Timestamp.now
const toTimestamp = (date) => admin.firestore.Timestamp.fromDate(date)

const addDays = (base, amount) => {
  const result = new Date(base)
  result.setDate(result.getDate() + amount)
  return result
}

const formatDateKey = (date) => {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

const upsertDocument = async (collection, docId, data) => {
  const ref = db().collection(collection).doc(docId)
  const snapshot = await ref.get()
  const existing = snapshot.exists ? snapshot.data() : {}

  const createdAt = data.createdAt ?? existing?.createdAt ?? timestampNow()
  const updatedAt = data.updatedAt ?? timestampNow()

  await ref.set(
    {
      ...data,
      createdAt,
      updatedAt
    },
    { merge: true }
  )
}

const ensureTestUser = async () => {
  try {
    await admin.auth().getUser(TEST_USER_UID)
    console.log(`✅ Test user ${TEST_USER_UID} already exists`)
  } catch {
    await admin.auth().createUser({
      uid: TEST_USER_UID,
      email: TEST_USER_EMAIL,
      displayName: TEST_USER_NAME,
      emailVerified: true,
      photoURL: 'https://avatars.githubusercontent.com/u/000000?v=4'
    })
    console.log(`✨ Created Firebase Auth user ${TEST_USER_UID}`)
  }
}

const seedTechnicianProfile = async () => {
  const technicianDoc = {
    userUid: TEST_USER_UID,
    name: 'Equipo InstalaPro',
    businessName: 'InstalaPro Servicios Demo',
    phone: '+54 9 11 5555-0000',
    email: TEST_USER_EMAIL,
    secondaryEmail: 'support@instalapro.com',
    urlSlug: TEST_TECHNICIAN_SLUG,
    isActive: true,
    createdBy: TEST_USER_UID
  }

  await upsertDocument('technicians', TEST_TECHNICIAN_DOC_ID, technicianDoc)
  console.log(`🔧 Technician profile seeded (${TEST_TECHNICIAN_DOC_ID})`)
}

const seedServiceTypes = async () => {
  const baseServices = [
    {
      id: 'svc-standard-install',
      name: 'Instalación Split 3000 frigorías',
      description: 'Incluye materiales básicos, hasta 3 metros de cañería y prueba de funcionamiento.',
      basePrice: 85000,
      estimatedDuration: 120,
      category: 'Instalación'
    },
    {
      id: 'svc-maintenance',
      name: 'Mantenimiento preventivo',
      description: 'Limpieza de filtros, chequeo de gas, control eléctrico y puesta a punto.',
      basePrice: 45000,
      estimatedDuration: 90,
      category: 'Mantenimiento'
    },
    {
      id: 'svc-urgent-repair',
      name: 'Reparación urgente 24 hs',
      description: 'Diagnóstico y reparación express para urgencias con disponibilidad prioritaria.',
      basePrice: 125000,
      estimatedDuration: 120,
      category: 'Reparación'
    }
  ]

  await Promise.all(
    baseServices.map((service) =>
      upsertDocument('serviceTypes', service.id, {
        ...service,
        userUid: TEST_USER_UID,
        isActive: true,
        createdBy: TEST_USER_UID
      })
    )
  )

  console.log(`🛠️  Seeded ${baseServices.length} service types`)
}

const seedClients = async () => {
  const clients = [
    {
      id: 'client-lorena-alvarez',
      name: 'Lorena Álvarez',
      phone: '+54 9 11 6011-2233',
      address: 'Av. Callao 123, CABA',
      email: 'lorena.alvarez@example.com',
      totalJobs: 3,
      totalSpent: 245000,
      notes: 'Prefiere turnos por la mañana. Casa con acceso por escalera.'
    },
    {
      id: 'client-matias-gomez',
      name: 'Matías Gómez',
      phone: '+54 9 11 4222-8899',
      address: 'Calle Los Pinos 450, San Isidro',
      email: 'matias.gomez@example.com',
      totalJobs: 1,
      totalSpent: 90000,
      notes: 'Equipo inverter reciente. Tiene garantía extendida.'
    },
    {
      id: 'client-empresa-frio',
      name: 'FríoMax S.R.L.',
      phone: '+54 11 4788-1122',
      address: 'Parque Industrial Tigre, nave 5',
      email: 'mantenimiento@friomax.com',
      totalJobs: 6,
      totalSpent: 560000,
      notes: 'Contrato corporativo. Facturación mensual.'
    }
  ]

  await Promise.all(
    clients.map((client) =>
      upsertDocument('clients', client.id, {
        ...client,
        userUid: TEST_USER_UID,
        isActive: true,
        createdBy: TEST_USER_UID
      })
    )
  )

  console.log(`👥 Seeded ${clients.length} clients`)
}

const seedJobs = async () => {
  const today = new Date()
  const jobs = [
    {
      id: 'job-upcoming-install',
      clientId: 'client-lorena-alvarez',
      clientName: 'Lorena Álvarez',
      clientPhone: '+54 9 11 6011-2233',
      clientEmail: 'lorena.alvarez@example.com',
      serviceType: 'Instalación Split 3000 frigorías',
      serviceTypeId: 'svc-standard-install',
      description: 'Reemplazo de equipo existente. Requiere retiro del equipo viejo.',
      address: 'Av. Callao 123, CABA',
      scheduledDate: toTimestamp(addDays(today, 2)),
      estimatedDuration: 150,
      status: 'confirmed',
      price: 165000,
      notes: 'Llevar escalera extensible. Usuario estará presente.',
      source: 'booking'
    },
    {
      id: 'job-completed-maintenance',
      clientId: 'client-matias-gomez',
      clientName: 'Matías Gómez',
      clientPhone: '+54 9 11 4222-8899',
      clientEmail: 'matias.gomez@example.com',
      serviceType: 'Mantenimiento preventivo',
      serviceTypeId: 'svc-maintenance',
      description: 'Chequeo pre verano y limpieza general.',
      address: 'Calle Los Pinos 450, San Isidro',
      scheduledDate: toTimestamp(addDays(today, -10)),
      estimatedDuration: 90,
      status: 'completed',
      price: 47000,
      notes: 'Equipo en planta baja, acceso sencillo.',
      source: 'back_office'
    },
    {
      id: 'job-pending-urgent',
      clientId: 'client-empresa-frio',
      clientName: 'FríoMax S.R.L.',
      clientPhone: '+54 11 4788-1122',
      clientEmail: 'mantenimiento@friomax.com',
      serviceType: 'Reparación urgente 24 hs',
      serviceTypeId: 'svc-urgent-repair',
      description: 'Equipo industrial con falla E4. Ambiente crítico.',
      address: 'Parque Industrial Tigre, nave 5',
      scheduledDate: toTimestamp(addDays(today, 1)),
      estimatedDuration: 180,
      status: 'pending',
      price: 210000,
      notes: 'Ingresar por portón 3. Tiempo máximo de espera 30 minutos.',
      source: 'back_office'
    }
  ].map((job) => ({
    ...job,
    userUid: TEST_USER_UID,
    isActive: true,
    isCustomService: false,
    createdBy: TEST_USER_UID
  }))

  await Promise.all(
    jobs.map((job) => upsertDocument('jobs', job.id, job))
  )

  console.log(`📅 Seeded ${jobs.length} jobs`)
}

const seedSlotAvailability = async () => {
  const baseDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const daysToSeed = [1, 2, 3, 4, 5]
  const hours = [
    { hour: 9, isAvailable: true },
    { hour: 11, isAvailable: false },
    { hour: 14, isAvailable: true },
    { hour: 16, isAvailable: true }
  ]

  const operations = []

  for (const dayOffset of daysToSeed) {
    const date = addDays(baseDate, dayOffset)
    const formattedDate = formatDateKey(date)

    for (const { hour, isAvailable } of hours) {
      const id = `${TEST_USER_UID}-${formattedDate}-${hour}`
      operations.push(
        upsertDocument('slotAvailability', id, {
          userUid: TEST_USER_UID,
          date: formattedDate,
          hour,
          isAvailable,
          isManual: !isAvailable
        })
      )
    }
  }

  await Promise.all(operations)
  console.log(`⏰ Seeded availability for ${daysToSeed.length} days (${operations.length} slots)`)
}

const main = async () => {
  try {
    initializeFirebase()
    console.log('🚀 Connected to Firebase project:', admin.app().options.projectId)

    await ensureTestUser()
    await seedTechnicianProfile()
    await seedServiceTypes()
    await seedClients()
    await seedJobs()
    await seedSlotAvailability()

    console.log('\n🎉 Test dataset ready!')
    console.log('   • UID:', TEST_USER_UID)
    console.log('   • Booking URL slug:', TEST_TECHNICIAN_SLUG)
  } catch (error) {
    console.error('❌ Failed to seed test data:', error)
    process.exitCode = 1
  }
}

main()
