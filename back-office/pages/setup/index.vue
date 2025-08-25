<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Configuración Inicial</h1>
    <p class="text-gray-600">Configure su perfil y servicios.</p>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

useSeoMeta({
  title: 'Configuración - InstalarPro Back Office',
  description: 'Configure su perfil de técnico y servicios disponibles.',
  robots: 'noindex, nofollow'
})
</script>