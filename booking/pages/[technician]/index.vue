<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading State -->
    <div v-if="techniciansStore.loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p class="text-gray-600">Cargando información del técnico...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="techniciansStore.error" class="flex items-center justify-center min-h-screen p-4">
      <div class="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div class="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <IconAlertCircle class="w-10 h-10 text-white" />
        </div>
        <h1 class="text-2xl font-bold text-gray-800 mb-4">Técnico no encontrado</h1>
        <p class="text-gray-600 mb-6">{{ techniciansStore.error }}</p>
        <a
          href="https://instalapro.com"
          class="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          Buscar Técnicos
        </a>
      </div>
    </div>

    <!-- Booking Interface -->
    <div v-else-if="techniciansStore.technician">
      <!-- Technician Header -->
      <div class="bg-white shadow-sm border-b">
        <div class="max-w-lg mx-auto p-4">
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <IconAccount class="w-10 h-10 text-white" />
            </div>
            <div class="flex-1">
              <h1 class="text-xl font-bold text-gray-800">{{ techniciansStore.technician.name }}</h1>
              <p class="text-sm text-gray-600">Técnico en Aire Acondicionado</p>
              <div class="flex items-center mt-1">
                <IconPhone class="w-4 h-4 text-gray-500 mr-1" />
                <span class="text-sm text-gray-600">{{ techniciansStore.technician.phone }}</span>
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

        <!-- Loading Services -->
        <div v-if="serviceTypesStore.loading" class="text-center py-8">
          <div class="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p class="text-gray-500 text-sm">Cargando servicios...</p>
        </div>

        <!-- No Services -->
        <div v-else-if="serviceTypesStore.activeServiceTypes.length === 0" class="bg-white rounded-lg p-8 text-center">
          <IconToolbox class="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p class="text-gray-600">Este técnico aún no ha configurado sus servicios.</p>
          <p class="text-gray-500 text-sm mt-2">Por favor, contacta directamente por WhatsApp.</p>
        </div>

        <!-- Service List -->
        <div v-else class="space-y-3">
          <div
            v-for="service in serviceTypesStore.activeServiceTypes"
            :key="service.id"
            class="bg-white border-2 border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors"
          >
            <div class="flex items-start space-x-3">
              <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <IconSnowflake v-if="service.category === 'Instalación'" class="w-6 h-6 text-white" />
                <IconWrench v-else-if="service.category === 'Mantenimiento'" class="w-6 h-6 text-white" />
                <IconHammerWrench v-else-if="service.category === 'Reparación'" class="w-6 h-6 text-white" />
                <IconClipboardText v-else-if="service.category === 'Consultoría'" class="w-6 h-6 text-white" />
                <IconToolbox v-else class="w-6 h-6 text-white" />
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-gray-800">{{ service.name }}</h3>
                <p v-if="service.description" class="text-sm text-gray-600 mt-1">{{ service.description }}</p>
                <div class="flex items-center justify-between mt-2">
                  <span class="text-blue-600 font-semibold">${{ service.basePrice.toLocaleString() }}</span>
                  <span class="text-sm text-gray-500 flex items-center">
                    <IconClock class="w-4 h-4 mr-1" />
                    {{ formatDuration(service.estimatedDuration) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- WhatsApp Contact -->
      <a
        v-if="techniciansStore.technician.phone"
        :href="whatsappUrl"
        target="_blank"
        class="fixed bottom-4 right-4 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-colors flex items-center justify-center"
      >
        <IconWhatsapp class="w-7 h-7" />
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
// Icons
import IconAlertCircle from '~icons/mdi/alert-circle'
import IconAccount from '~icons/mdi/account-circle'
import IconPhone from '~icons/mdi/phone'
import IconSnowflake from '~icons/mdi/snowflake'
import IconWrench from '~icons/mdi/wrench'
import IconHammerWrench from '~icons/mdi/hammer-wrench'
import IconClipboardText from '~icons/mdi/clipboard-text-outline'
import IconToolbox from '~icons/mdi/toolbox-outline'
import IconClock from '~icons/mdi/clock-outline'
import IconWhatsapp from '~icons/mdi/whatsapp'

// Stores
const techniciansStore = useTechniciansStore()
const serviceTypesStore = useServiceTypesStore()

// Route
const route = useRoute()
const technicianSlug = route.params.technician as string

// Progress bar
const progressWidth = ref('33%')

// Helper: Format duration from minutes to readable format
const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}min`
  } else if (hours > 0) {
    return `${hours}h`
  } else {
    return `${mins}min`
  }
}

// WhatsApp URL
const whatsappUrl = computed(() => {
  if (!techniciansStore.technician?.phone) return '#'
  const phone = techniciansStore.technician.phone.replace(/[^0-9]/g, '')
  const message = encodeURIComponent(`Hola ${techniciansStore.technician.name}, me gustaría solicitar información sobre tus servicios.`)
  return `https://wa.me/${phone}?text=${message}`
})

// Load technician data
onMounted(async () => {
  if (!technicianSlug) {
    techniciansStore.error = 'URL inválida'
    return
  }

  // Load technician by slug
  const success = await techniciansStore.loadTechnicianBySlug(technicianSlug)

  if (success && techniciansStore.technician) {
    // Load service types for this technician
    await serviceTypesStore.loadServiceTypesByTechnicianUserUid(techniciansStore.technician.userUid)
  }
})

// SEO Meta
useSeoMeta({
  title: () => techniciansStore.technician ? `Reservar con ${techniciansStore.technician.name} - InstalarPro` : 'Reservar Cita - InstalarPro',
  description: () => techniciansStore.technician ? `Agenda tu cita de aire acondicionado con ${techniciansStore.technician.name}. Instalación, reparación y mantenimiento profesional.` : 'Agenda tu cita de aire acondicionado',
  ogTitle: () => techniciansStore.technician ? `${techniciansStore.technician.name} - Técnico de Aire Acondicionado` : 'Reservar Cita',
  ogDescription: 'Sistema de reservas online para técnicos especializados en aire acondicionado.'
})
</script>