export default defineNuxtConfig({
  compatibilityDate: '2025-08-03',
  ssr: true,
  modules: [
    '@vueuse/nuxt', 
    'unplugin-icons/nuxt',
    'dayjs-nuxt',
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt'
  ],
  runtimeConfig: {
    testAccessCode: process.env.NUXT_TEST_ACCESS_CODE,
    testUserUid: process.env.NUXT_TEST_USER_UID,
    firebaseServiceAccount: process.env.NUXT_FIREBASE_SERVICE_ACCOUNT,
    public: {
      firebaseApiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID,
      environment: process.env.NUXT_PUBLIC_ENVIRONMENT || 'development',
      testAccessEnabled: process.env.NUXT_PUBLIC_TEST_ACCESS_ENABLED === 'true',
      testTechnicianSlug: process.env.NUXT_PUBLIC_TEST_TECHNICIAN_SLUG || ''
    }
  },
  dayjs: {
    locales: ['es'],
    plugins: ['timezone', 'utc', 'relativeTime', 'localizedFormat'],
    defaultLocale: 'es',
    defaultTimezone: 'America/Buenos_Aires'
  },
  components: {
    global: true,
    dirs: ['~/components']
  },
  vite: {
    plugins: [],
    optimizeDeps: {
      include: ['@iconify/json']
    }
  },
  build: {
    transpile: ['@iconify/vue']
  },
  css: [
    '~/assets/css/main.css',
    'driver.js/dist/driver.css'
  ],
  app: {
    head: {
      htmlAttrs: { lang: 'es' },
      meta: [
        { name: 'robots', content: 'noindex, nofollow' }, // Back office should not be indexed
        { name: 'author', content: 'InstalaPro' },
        { name: 'description', content: 'Panel de administración para técnicos de aire acondicionado. Gestión de clientes, agenda y presupuestos.' }
      ]
    }
  },
  devtools: { enabled: true }
})
