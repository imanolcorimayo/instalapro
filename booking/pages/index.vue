<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
      <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <span class="text-white text-3xl">📅</span>
      </div>
      
      <h1 class="text-2xl font-bold text-gray-800 mb-4">
        Página de Reservas
      </h1>
      
      <p class="text-gray-600 mb-6">
        Para reservar una cita, necesitas el enlace específico de tu técnico.
      </p>
      
      <div class="bg-blue-50 p-4 rounded-lg mb-6">
        <p class="text-sm text-blue-800">
          <strong>Formato del enlace:</strong><br>
          agenda.instalapro.com/<span class="font-mono bg-blue-200 px-1 rounded">nombre-tecnico</span>
        </p>
      </div>
      
      <a 
        href="https://instalapro.com" 
        class="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
      >
        Ir a InstalaPro.com
      </a>
    </div>
  </div>
</template>

<script setup>
// SEO Meta for booking index
useSeoMeta({
  title: 'Reservar Cita - InstalaPro',
  description: 'Sistema de reservas para técnicos de aire acondicionado. Agenda tu cita de manera fácil y rápida.',
  robots: 'noindex, nofollow' // Don't index the generic booking page
})
</script>