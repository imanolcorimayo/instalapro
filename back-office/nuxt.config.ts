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
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'es' },
      meta: [
        { name: 'robots', content: 'noindex, nofollow' }, // Back office should not be indexed
        { name: 'author', content: 'InstalarPro' },
        { name: 'description', content: 'Panel de administración para técnicos de aire acondicionado. Gestión de clientes, agenda y presupuestos.' }
      ]
    }
  },
  devtools: { enabled: true }
})
