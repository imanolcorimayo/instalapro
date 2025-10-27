export default defineNuxtConfig({
  compatibilityDate: '2025-08-03',
  ssr: true, // SEO for technician pages
  modules: [
    '@vueuse/nuxt',
    'unplugin-icons/nuxt',
    'dayjs-nuxt',
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt'
  ],
  runtimeConfig: {
    public: {
      firebaseApiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID,
      environment: process.env.NUXT_PUBLIC_ENVIRONMENT || 'development',
      testTechnicianSlug: process.env.NUXT_PUBLIC_TEST_TECHNICIAN_SLUG || ''
    }
  },
  dayjs: {
    locales: ['es'],
    plugins: ['timezone', 'utc', 'relativeTime', 'localizedFormat'],
    defaultLocale: 'es',
    defaultTimezone: 'America/Buenos_Aires'
  },
  // Proper icon configuration
  components: {
    global: true,
    dirs: ['~/components']
  },
  // Icon configuration for unplugin-icons
  vite: {
    plugins: [],
    optimizeDeps: {
      include: ['@iconify/json']
    }
  },
  app: {
    head: {
      htmlAttrs: { lang: 'es' },
      meta: [
        { name: 'robots', content: 'index, follow' },
        { name: 'author', content: 'InstalaPro' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' }
      ]
    }
  },
  devtools: { enabled: true }
})
