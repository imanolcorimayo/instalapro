export default defineNuxtConfig({
  compatibilityDate: '2025-08-03',
  ssr: true, // Server-side rendering for SEO
  nitro: {
    prerender: {
      routes: ['/sitemap.xml', '/robots.txt']
    }
  },
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
        { name: 'author', content: 'InstalaPro' },
        { name: 'description', content: 'Técnicos especializados en aire acondicionado. Instalación, mantenimiento y reparación. Servicio rápido y confiable en toda Argentina.' }
      ]
    }
  },
  devtools: { enabled: true }
})