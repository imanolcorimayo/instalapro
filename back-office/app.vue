<template>
  <div>
    <!-- Show loading spinner only while auth is being initialized -->
    <div v-if="!authStore.initialized && $route.path !== '/sign-in'" class="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div class="text-center">
        <div class="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-600">Cargando...</p>
      </div>
    </div>
    
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
const authStore = useAuthStore()
</script>
