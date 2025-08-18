<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p class="text-gray-600">Cargando información del técnico...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex items-center justify-center min-h-screen p-4">
      <div class="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div class="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="text-white text-3xl">⚠️</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-800 mb-4">Técnico no encontrado</h1>
        <p class="text-gray-600 mb-6">{{ error }}</p>
        <a 
          href="https://instalapro.com" 
          class="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          Buscar Técnicos
        </a>
      </div>
    </div>

    <!-- Booking Interface -->
    <div v-else>
      <!-- Technician Header -->
      <div class="bg-white shadow-sm border-b">
        <div class="max-w-lg mx-auto p-4">
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <span class="text-white text-2xl">👤</span>
            </div>
            <div class="flex-1">
              <h1 class="text-xl font-bold text-gray-800">{{ technician.name }}</h1>
              <p class="text-sm text-gray-600">Técnico en Aire Acondicionado</p>
              <div class="flex items-center mt-1">
                <span class="text-yellow-500 text-sm">⭐</span>
                <span class="text-sm text-gray-600 ml-1">4.8 • 127 trabajos</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="bg-white border-b">
        <div class="max-w-lg mx-auto p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                1
              </div>
              <span class="ml-2 text-sm font-medium text-blue-600">Servicio</span>
            </div>
            <div class="flex-1 mx-4 h-1 bg-gray-200 rounded">
              <div class="h-1 bg-blue-600 rounded" :style="{ width: progressWidth }"></div>
            </div>
            <div class="flex items-center">
              <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-sm">
                2
              </div>
              <span class="ml-2 text-sm text-gray-500">Confirmar</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Service Selection -->
      <div class="max-w-lg mx-auto p-4">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Selecciona el servicio</h2>
        
        <div class="space-y-3">
          <!-- Installation Service -->
          <div class="bg-white border-2 border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors">
            <div class="flex items-start space-x-3">
              <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mt-1">
                <span class="text-white text-lg">❄️</span>
              </div>
              <div class="flex-1">
                <h3 class="font-semibold text-gray-800">Instalación Split</h3>
                <p class="text-sm text-gray-600 mt-1">Instalación completa de aire acondicionado split</p>
                <div class="flex items-center justify-between mt-2">
                  <span class="text-blue-600 font-semibold">$15,000 - $25,000</span>
                  <span class="text-sm text-gray-500">3 horas</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Maintenance Service -->
          <div class="bg-white border-2 border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors">
            <div class="flex items-start space-x-3">
              <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mt-1">
                <span class="text-white text-lg">🔧</span>
              </div>
              <div class="flex-1">
                <h3 class="font-semibold text-gray-800">Service y Mantenimiento</h3>
                <p class="text-sm text-gray-600 mt-1">Limpieza, carga de gas y revisión general</p>
                <div class="flex items-center justify-between mt-2">
                  <span class="text-blue-600 font-semibold">$3,000 - $5,000</span>
                  <span class="text-sm text-gray-500">1.5 horas</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Repair Service -->
          <div class="bg-white border-2 border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors">
            <div class="flex items-start space-x-3">
              <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mt-1">
                <span class="text-white text-lg">🔨</span>
              </div>
              <div class="flex-1">
                <h3 class="font-semibold text-gray-800">Reparación</h3>
                <p class="text-sm text-gray-600 mt-1">Diagnóstico y reparación de fallas</p>
                <div class="flex items-center justify-between mt-2">
                  <span class="text-blue-600 font-semibold">$2,500 - $8,000</span>
                  <span class="text-sm text-gray-500">1-2 horas</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- WhatsApp Contact -->
      <div class="fixed bottom-4 right-4">
        <button class="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-colors">
          <span class="text-2xl">📱</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const technicianSlug = route.params.technician

// Reactive state
const loading = ref(true)
const error = ref(null)
const technician = ref(null)
const progressWidth = ref('33%')

// Mock technician data - will be replaced with real data from store
const mockTechnician = {
  name: 'Carlos Rodriguez',
  phone: '+54 11 1234-5678',
  rating: 4.8,
  completedJobs: 127,
  responseTime: '15 min',
  serviceArea: ['CABA', 'Zona Norte']
}

// Load technician data
onMounted(async () => {
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // In real implementation, this would fetch from store or API
    if (technicianSlug === 'carlos-rodriguez') {
      technician.value = mockTechnician
    } else {
      error.value = 'El técnico solicitado no está disponible o el enlace es incorrecto.'
    }
  } catch (err) {
    error.value = 'Error al cargar la información del técnico.'
  } finally {
    loading.value = false
  }
})

// SEO Meta
useSeoMeta({
  title: () => technician.value ? `Reservar con ${technician.value.name} - InstalarPro` : 'Reservar Cita - InstalarPro',
  description: () => technician.value ? `Agenda tu cita de aire acondicionado con ${technician.value.name}. Instalación, reparación y mantenimiento profesional.` : 'Agenda tu cita de aire acondicionado',
  ogTitle: () => technician.value ? `${technician.value.name} - Técnico de Aire Acondicionado` : 'Reservar Cita',
  ogDescription: 'Sistema de reservas online para técnicos especializados en aire acondicionado.'
})
</script>