<template>
  <div>
    <p class="text-gray-600">Cree y gestione presupuestos para sus clientes.</p>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

useSeoMeta({
  title: 'Presupuestos - InstalarPro Back Office',
  description: 'Cree y gestione presupuestos profesionales para sus clientes.',
  robots: 'noindex, nofollow'
})
</script>