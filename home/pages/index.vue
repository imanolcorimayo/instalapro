<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <section class="bg-blue-600 text-white py-20">
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-4xl md:text-6xl font-bold mb-6">
          Técnicos Especializados en Aire Acondicionado
        </h1>
        <p class="text-xl mb-8 max-w-2xl mx-auto">
          Instalación, mantenimiento y reparación con garantía total. 
          Servicio rápido y confiable en toda Argentina.
        </p>
        <div class="space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center">
          <button class="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
            Solicitar Presupuesto Gratis
          </button>
          <button class="w-full md:w-auto bg-transparent border-2 border-white hover:bg-white hover:text-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
            Ver Técnicos Disponibles
          </button>
        </div>
      </div>
    </section>

    <!-- Services Section -->
    <section class="py-16">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12">Nuestros Servicios</h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <!-- Installation -->
          <div class="bg-white p-6 rounded-lg shadow-md text-center">
            <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-white text-2xl">❄️</span>
            </div>
            <h3 class="text-xl font-semibold mb-2">Instalación</h3>
            <p class="text-gray-600 mb-4">Instalación profesional de equipos nuevos</p>
            <p class="text-blue-600 font-bold">Desde $15,000</p>
          </div>

          <!-- Maintenance -->
          <div class="bg-white p-6 rounded-lg shadow-md text-center">
            <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-white text-2xl">🔧</span>
            </div>
            <h3 class="text-xl font-semibold mb-2">Mantenimiento</h3>
            <p class="text-gray-600 mb-4">Service preventivo y limpieza</p>
            <p class="text-blue-600 font-bold">Desde $3,000</p>
          </div>

          <!-- Repair -->
          <div class="bg-white p-6 rounded-lg shadow-md text-center">
            <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-white text-2xl">🔨</span>
            </div>
            <h3 class="text-xl font-semibold mb-2">Reparación</h3>
            <p class="text-gray-600 mb-4">Diagnóstico y reparación de fallas</p>
            <p class="text-blue-600 font-bold">Desde $2,500</p>
          </div>

          <!-- Consultation -->
          <div class="bg-white p-6 rounded-lg shadow-md text-center">
            <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-white text-2xl">📋</span>
            </div>
            <h3 class="text-xl font-semibold mb-2">Consultoría</h3>
            <p class="text-gray-600 mb-4">Asesoramiento técnico especializado</p>
            <p class="text-blue-600 font-bold">Desde $1,500</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="bg-gray-100 py-16">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-3xl font-bold mb-6">¿Necesitas un técnico ahora?</h2>
        <p class="text-xl text-gray-600 mb-8">
          Contáctanos y te conectamos con el técnico más cercano
        </p>
        <button class="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
          <span class="inline-block mr-2 text-xl">📱</span>
          Contactar por WhatsApp
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
// SEO Meta
useSeoMeta({
  title: 'InstalarPro - Técnicos Especializados en Aire Acondicionado',
  description: 'Instalación, mantenimiento y reparación de aire acondicionado. Técnicos certificados con garantía total. Servicio rápido en toda Argentina.',
  ogTitle: 'InstalarPro - Técnicos de Aire Acondicionado',
  ogDescription: 'Servicio profesional de aire acondicionado. Instalación, reparación y mantenimiento con garantía.',
  ogImage: '/og-image.jpg',
  twitterCard: 'summary_large_image'
})
</script>