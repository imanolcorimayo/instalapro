export default defineNuxtConfig({
  compatibilityDate: '2025-08-03',
  ssr: true, // SEO for technician pages
  modules: [
    '@vueuse/nuxt', 
    'unplugin-icons/nuxt',
    'dayjs-nuxt',
    '@nuxtjs/tailwindcss'
  ],
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
        { name: 'author', content: 'InstalarPro' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' }
      ]
    }
  },
  devtools: { enabled: true }
})