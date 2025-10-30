#!/usr/bin/env node
import admin from 'firebase-admin'
import serviceAccount from '../service-account.json' with { type: 'json' }

const {
  TEST_USER_UID = 'instalapro-demo-user',
  TEST_USER_EMAIL = 'demo.tech@instalapro.com',
  TEST_USER_PASSWORD = 'demotech271025',
  TEST_USER_NAME = 'InstalaPro Demo',
  TEST_TECHNICIAN_SLUG = 'instalapro-demo',
  TEST_TECHNICIAN_DOC_ID = TEST_TECHNICIAN_SLUG || 'instalapro-demo'
} = process.env

const now = new Date()

const initializeFirebase = () => {
  if (admin.apps.length > 0) {
    return admin.app()
  }

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
    // Check if user exists
    await admin.auth().getUser(TEST_USER_UID)

    // Update password to ensure it matches env variable
    await admin.auth().updateUser(TEST_USER_UID, {
      password: TEST_USER_PASSWORD,
      displayName: TEST_USER_NAME,
      emailVerified: true
    })
    console.log(`✅ Test user ${TEST_USER_UID} already exists (password updated)`)
  } catch {
    // User doesn't exist, create new one
    await admin.auth().createUser({
      uid: TEST_USER_UID,
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
      displayName: TEST_USER_NAME,
      emailVerified: true,
      photoURL: 'https://avatars.githubusercontent.com/u/000000?v=4'
    })
    console.log(`✨ Created Firebase Auth user ${TEST_USER_UID} with email/password`)
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

const addHoursToDate = (date, hours, minutes = 0) => {
  const result = new Date(date)
  result.setHours(hours, minutes, 0, 0)
  return result
}

const seedJobs = async () => {
  const today = new Date()
  const jobs = [
    // Today's jobs
    {
      id: 'job-today-morning-maintenance',
      clientId: 'client-matias-gomez',
      clientName: 'Matías Gómez',
      clientPhone: '+54 9 11 4222-8899',
      clientEmail: 'matias.gomez@example.com',
      serviceType: 'Mantenimiento preventivo',
      serviceTypeId: 'svc-maintenance',
      description: 'Chequeo de rutina y limpieza de filtros.',
      address: 'Calle Los Pinos 450, San Isidro',
      scheduledDate: toTimestamp(addHoursToDate(today, 9, 0)),
      estimatedDuration: 90,
      status: 'in_progress',
      price: 45000,
      notes: 'Cliente en casa desde las 8:30.',
      source: 'booking'
    },
    {
      id: 'job-today-afternoon-install',
      clientId: 'client-lorena-alvarez',
      clientName: 'Lorena Álvarez',
      clientPhone: '+54 9 11 6011-2233',
      clientEmail: 'lorena.alvarez@example.com',
      serviceType: 'Instalación Split 3000 frigorías',
      serviceTypeId: 'svc-standard-install',
      description: 'Instalación de equipo nuevo en dormitorio principal.',
      address: 'Av. Callao 123, CABA',
      scheduledDate: toTimestamp(addHoursToDate(today, 14, 0)),
      estimatedDuration: 120,
      status: 'confirmed',
      price: 85000,
      notes: 'Llevar materiales de instalación.',
      source: 'back_office'
    },
    {
      id: 'job-today-evening-repair',
      clientId: 'client-empresa-frio',
      clientName: 'FríoMax S.R.L.',
      clientPhone: '+54 11 4788-1122',
      clientEmail: 'mantenimiento@friomax.com',
      serviceType: 'Reparación urgente 24 hs',
      serviceTypeId: 'svc-urgent-repair',
      description: 'Revisión de equipo que no enfría correctamente.',
      address: 'Parque Industrial Tigre, nave 5',
      scheduledDate: toTimestamp(addHoursToDate(today, 18, 0)),
      estimatedDuration: 120,
      status: 'confirmed',
      price: 125000,
      notes: 'Verificar presión de gas refrigerante.',
      source: 'booking'
    },

    // Tomorrow's jobs
    {
      id: 'job-tomorrow-morning-install',
      clientId: 'client-lorena-alvarez',
      clientName: 'Lorena Álvarez',
      clientPhone: '+54 9 11 6011-2233',
      clientEmail: 'lorena.alvarez@example.com',
      serviceType: 'Instalación Split 3000 frigorías',
      serviceTypeId: 'svc-standard-install',
      description: 'Reemplazo de equipo existente. Requiere retiro del equipo viejo.',
      address: 'Av. Callao 123, CABA',
      scheduledDate: toTimestamp(addHoursToDate(addDays(today, 1), 10, 0)),
      estimatedDuration: 150,
      status: 'confirmed',
      price: 165000,
      notes: 'Llevar escalera extensible. Usuario estará presente.',
      source: 'booking'
    },
    {
      id: 'job-tomorrow-afternoon-maintenance',
      clientId: 'client-matias-gomez',
      clientName: 'Matías Gómez',
      clientPhone: '+54 9 11 4222-8899',
      clientEmail: 'matias.gomez@example.com',
      serviceType: 'Mantenimiento preventivo',
      serviceTypeId: 'svc-maintenance',
      description: 'Mantenimiento anual programado.',
      address: 'Calle Los Pinos 450, San Isidro',
      scheduledDate: toTimestamp(addHoursToDate(addDays(today, 1), 16, 0)),
      estimatedDuration: 90,
      status: 'pending',
      price: 45000,
      notes: 'Cliente solicita verificar ruidos extraños.',
      source: 'back_office'
    },

    // Day after tomorrow
    {
      id: 'job-day2-urgent',
      clientId: 'client-empresa-frio',
      clientName: 'FríoMax S.R.L.',
      clientPhone: '+54 11 4788-1122',
      clientEmail: 'mantenimiento@friomax.com',
      serviceType: 'Reparación urgente 24 hs',
      serviceTypeId: 'svc-urgent-repair',
      description: 'Equipo industrial con falla E4. Ambiente crítico.',
      address: 'Parque Industrial Tigre, nave 5',
      scheduledDate: toTimestamp(addHoursToDate(addDays(today, 2), 8, 0)),
      estimatedDuration: 180,
      status: 'confirmed',
      price: 210000,
      notes: 'Ingresar por portón 3. Tiempo máximo de espera 30 minutos.',
      source: 'back_office'
    },
    {
      id: 'job-day2-afternoon-install',
      clientId: 'client-lorena-alvarez',
      clientName: 'Lorena Álvarez',
      clientPhone: '+54 9 11 6011-2233',
      clientEmail: 'lorena.alvarez@example.com',
      serviceType: 'Instalación Split 3000 frigorías',
      serviceTypeId: 'svc-standard-install',
      description: 'Instalación en segundo dormitorio.',
      address: 'Av. Callao 123, CABA',
      scheduledDate: toTimestamp(addHoursToDate(addDays(today, 2), 15, 0)),
      estimatedDuration: 120,
      status: 'confirmed',
      price: 85000,
      notes: 'Coordinar con trabajo anterior.',
      source: 'booking'
    },

    // 3 days from now
    {
      id: 'job-day3-maintenance',
      clientId: 'client-empresa-frio',
      clientName: 'FríoMax S.R.L.',
      clientPhone: '+54 11 4788-1122',
      clientEmail: 'mantenimiento@friomax.com',
      serviceType: 'Mantenimiento preventivo',
      serviceTypeId: 'svc-maintenance',
      description: 'Mantenimiento preventivo mensual contratado.',
      address: 'Parque Industrial Tigre, nave 5',
      scheduledDate: toTimestamp(addHoursToDate(addDays(today, 3), 11, 0)),
      estimatedDuration: 90,
      status: 'confirmed',
      price: 45000,
      notes: 'Revisar todos los equipos del sector A.',
      source: 'back_office'
    },

    // Past jobs (completed and cancelled)
    {
      id: 'job-past-completed-1',
      clientId: 'client-matias-gomez',
      clientName: 'Matías Gómez',
      clientPhone: '+54 9 11 4222-8899',
      clientEmail: 'matias.gomez@example.com',
      serviceType: 'Mantenimiento preventivo',
      serviceTypeId: 'svc-maintenance',
      description: 'Chequeo pre verano y limpieza general.',
      address: 'Calle Los Pinos 450, San Isidro',
      scheduledDate: toTimestamp(addHoursToDate(addDays(today, -5), 10, 0)),
      estimatedDuration: 90,
      status: 'completed',
      price: 45000,
      notes: 'Equipo en planta baja, acceso sencillo.',
      source: 'back_office'
    },
    {
      id: 'job-past-completed-2',
      clientId: 'client-empresa-frio',
      clientName: 'FríoMax S.R.L.',
      clientPhone: '+54 11 4788-1122',
      clientEmail: 'mantenimiento@friomax.com',
      serviceType: 'Reparación urgente 24 hs',
      serviceTypeId: 'svc-urgent-repair',
      description: 'Reparación de compresor defectuoso.',
      address: 'Parque Industrial Tigre, nave 5',
      scheduledDate: toTimestamp(addHoursToDate(addDays(today, -3), 14, 0)),
      estimatedDuration: 180,
      status: 'completed',
      price: 125000,
      notes: 'Se reemplazó compresor y se recargó gas.',
      source: 'booking'
    },
    {
      id: 'job-past-cancelled',
      clientId: 'client-lorena-alvarez',
      clientName: 'Lorena Álvarez',
      clientPhone: '+54 9 11 6011-2233',
      clientEmail: 'lorena.alvarez@example.com',
      serviceType: 'Instalación Split 3000 frigorías',
      serviceTypeId: 'svc-standard-install',
      description: 'Instalación cancelada por el cliente.',
      address: 'Av. Callao 123, CABA',
      scheduledDate: toTimestamp(addHoursToDate(addDays(today, -2), 16, 0)),
      estimatedDuration: 120,
      status: 'cancelled',
      price: 0,
      notes: 'Cliente pospuso para el próximo mes.',
      source: 'booking'
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
    console.log('   • Email:', TEST_USER_EMAIL)
    console.log('   • Password:', TEST_USER_PASSWORD)
    console.log('   • Booking URL slug:', TEST_TECHNICIAN_SLUG)
    console.log('\n💡 Make sure your .env has the same TEST_USER_EMAIL and TEST_USER_PASSWORD values!')
  } catch (error) {
    console.error('❌ Failed to seed test data:', error)
    process.exitCode = 1
  }
}

main()
