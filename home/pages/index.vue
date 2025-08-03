<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <section class="bg-blue-600 text-white py-20">
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-4xl md:text-6xl font-bold mb-6">
          Lleva tu Negocio de Aire Acondicionado al Siguiente Nivel
        </h1>
        <p class="text-xl mb-8 max-w-2xl mx-auto">
          Gestiona clientes, agenda trabajos y genera presupuestos profesionales. 
          Todo lo que necesitas para hacer crecer tu negocio.
        </p>
        <div class="space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center">
          <button class="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
            Prueba Gratis por 30 Días
          </button>
          <button class="w-full md:w-auto bg-transparent border-2 border-white hover:bg-white hover:text-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
            Ver Demo en Vivo
          </button>
        </div>
      </div>
    </section>

    <!-- Services Section -->
    <section class="py-16">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12">Herramientas que Transformarán tu Negocio</h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <!-- Schedule Management -->
          <div class="bg-white p-6 rounded-lg shadow-md text-center">
            <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-white text-2xl">📅</span>
            </div>
            <h3 class="text-xl font-semibold mb-2">Gestión de Agenda</h3>
            <p class="text-gray-600 mb-4">Organiza todos tus trabajos en un calendario intuitivo</p>
            <ul class="text-sm text-gray-500 text-left">
              <li>• Calendario semanal/mensual</li>
              <li>• Estados de trabajo</li>
              <li>• Recordatorios automáticos</li>
            </ul>
          </div>

          <!-- Client Database -->
          <div class="bg-white p-6 rounded-lg shadow-md text-center">
            <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-white text-2xl">👥</span>
            </div>
            <h3 class="text-xl font-semibold mb-2">Base de Clientes</h3>
            <p class="text-gray-600 mb-4">Mantén toda la información de tus clientes organizada</p>
            <ul class="text-sm text-gray-500 text-left">
              <li>• Historial de servicios</li>
              <li>• Datos de contacto</li>
              <li>• Integración WhatsApp</li>
            </ul>
          </div>

          <!-- Quote System -->
          <div class="bg-white p-6 rounded-lg shadow-md text-center">
            <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-white text-2xl">📋</span>
            </div>
            <h3 class="text-xl font-semibold mb-2">Presupuestos Profesionales</h3>
            <p class="text-gray-600 mb-4">Crea y envía presupuestos profesionales en minutos</p>
            <ul class="text-sm text-gray-500 text-left">
              <li>• Plantillas predefinidas</li>
              <li>• Export PDF</li>
              <li>• Envío por WhatsApp</li>
            </ul>
          </div>

          <!-- Booking Page -->
          <div class="bg-white p-6 rounded-lg shadow-md text-center">
            <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-white text-2xl">🌐</span>
            </div>
            <h3 class="text-xl font-semibold mb-2">Página de Reservas</h3>
            <p class="text-gray-600 mb-4">Tu propia página web para que clientes reserven citas</p>
            <ul class="text-sm text-gray-500 text-left">
              <li>• URL personalizada</li>
              <li>• Disponibilidad en tiempo real</li>
              <li>• Confirmación automática</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="bg-gray-100 py-16">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-3xl font-bold mb-6">¿Listo para hacer crecer tu negocio?</h2>
        <p class="text-xl text-gray-600 mb-8">
          Únete a cientos de técnicos que ya están usando InstalarPro para gestionar su negocio
        </p>
        <button class="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
          <span class="inline-block mr-2 text-xl">🚀</span>
          Empezar Prueba Gratuita
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
// SEO Meta
useSeoMeta({
  title: 'InstalarPro - Software de Gestión para Técnicos de Aire Acondicionado',
  description: 'Plataforma completa para técnicos de aire acondicionado. Gestiona clientes, agenda trabajos y genera presupuestos profesionales. Prueba gratis 30 días.',
  ogTitle: 'InstalarPro - Gestión Digital para Técnicos',
  ogDescription: 'Herramientas profesionales para hacer crecer tu negocio de aire acondicionado. Agenda, clientes, presupuestos y página de reservas.',
  ogImage: '/og-image.jpg',
  twitterCard: 'summary_large_image'
})
</script>