<template>
  <div>
    <p class="text-gray-600">Visualice y analice reportes de su negocio.</p>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

useSeoMeta({
  title: 'Reportes - InstalarPro Back Office',
  description: 'Visualice y analice reportes de su negocio.',
  robots: 'noindex, nofollow'
})
</script>