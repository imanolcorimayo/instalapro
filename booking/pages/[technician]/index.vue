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
              <div
                :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold',
                  bookingStore.currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                ]"
              >
                1
              </div>
              <span
                :class="[
                  'ml-2 text-sm font-medium',
                  bookingStore.currentStep >= 1 ? 'text-blue-600' : 'text-gray-500'
                ]"
              >
                Servicio
              </span>
            </div>
            <div class="flex-1 mx-4 h-1 bg-gray-200 rounded">
              <div class="h-1 bg-blue-600 rounded transition-all duration-300" :style="{ width: bookingStore.currentStep >= 2 ? '100%' : '33%' }"></div>
            </div>
            <div class="flex items-center">
              <div
                :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold',
                  bookingStore.currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                ]"
              >
                2
              </div>
              <span
                :class="[
                  'ml-2 text-sm font-medium',
                  bookingStore.currentStep >= 2 ? 'text-blue-600' : 'text-gray-500'
                ]"
              >
                Fecha/Hora
              </span>
            </div>
            <div class="flex-1 mx-4 h-1 bg-gray-200 rounded">
              <div class="h-1 bg-blue-600 rounded transition-all duration-300" :style="{ width: bookingStore.canProceedToStep3() ? '100%' : '0%' }"></div>
            </div>
            <div class="flex items-center">
              <div
                :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold',
                  bookingStore.currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                ]"
              >
                3
              </div>
              <span
                :class="[
                  'ml-2 text-sm font-medium',
                  bookingStore.currentStep >= 3 ? 'text-blue-600' : 'text-gray-500'
                ]"
              >
                Confirmar
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 1: Service Selection -->
      <div
        v-if="bookingStore.currentStep === 1"
        :class="[
          'max-w-lg mx-auto p-4',
          showContinueButton ? 'pb-24' : ''
        ]"
      >
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
            @click="selectService(service)"
            :class="[
              'bg-white border-2 rounded-lg p-4 cursor-pointer transition-all',
              bookingStore.selectedService?.id === service.id
                ? 'border-blue-600 shadow-md'
                : 'border-gray-200 hover:border-blue-500'
            ]"
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
                <div class="flex items-start justify-between">
                  <h3 class="font-semibold text-gray-800">{{ service.name }}</h3>
                  <IconCheckCircle
                    v-if="bookingStore.selectedService?.id === service.id"
                    class="w-6 h-6 text-blue-600 flex-shrink-0 ml-2"
                  />
                </div>
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

      <!-- Step 2: Date and Time Selection -->
      <div
        v-else-if="bookingStore.currentStep === 2"
        :class="[
          'max-w-lg mx-auto p-4',
          showContinueButton ? 'pb-24' : ''
        ]"
      >
        <!-- Back button -->
        <button
          @click="goBackToStep1"
          class="flex items-center text-blue-600 hover:text-blue-700 mb-4 transition-colors"
        >
          <IconChevronLeft class="w-5 h-5 mr-1" />
          <span>Cambiar servicio</span>
        </button>

        <!-- Selected service summary -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-blue-600 font-medium">Servicio seleccionado:</p>
              <p class="text-gray-800 font-semibold">{{ bookingStore.selectedService?.name }}</p>
            </div>
            <div class="text-right">
              <p class="text-blue-600 font-semibold">${{ bookingStore.selectedService?.basePrice.toLocaleString() }}</p>
              <p class="text-xs text-gray-600">{{ formatDuration(bookingStore.selectedService?.estimatedDuration || 0) }}</p>
            </div>
          </div>
        </div>

        <!-- Date/Time Selector Component -->
        <DateTimeSelector
          v-if="techniciansStore.technician"
          :technician-user-uid="techniciansStore.technician.userUid"
        />
      </div>

      <!-- Step 3: Confirmation (placeholder for now) -->
      <div v-else-if="bookingStore.currentStep === 3" class="max-w-lg mx-auto p-4">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Confirmar reserva</h2>
        <p class="text-gray-600">Step 3 - Placeholder</p>
      </div>

      <!-- Sticky Continue Button -->
      <transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="translate-y-full opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="translate-y-full opacity-0"
      >
        <div
          v-if="showContinueButton"
          class="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4"
        >
          <div class="max-w-lg mx-auto">
            <button
              @click="handleContinue"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center"
            >
              <span>{{ continueButtonText }}</span>
              <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </transition>

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
import IconCheckCircle from '~icons/mdi/check-circle'
import IconChevronLeft from '~icons/mdi/chevron-left'

// Stores
const techniciansStore = useTechniciansStore()
const serviceTypesStore = useServiceTypesStore()
const bookingStore = useBookingStore()

// Route
const route = useRoute()
const technicianSlug = route.params.technician as string

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

// Service selection handler
const selectService = (service: any) => {
  bookingStore.selectService(service)
}

// Continue to step 2
const continueToStep2 = () => {
  bookingStore.nextStep()
}

// Go back to step 1
const goBackToStep1 = () => {
  bookingStore.previousStep()
}

// Continue button logic
const showContinueButton = computed(() => {
  if (bookingStore.currentStep === 1) {
    return bookingStore.canProceedToStep2()
  } else if (bookingStore.currentStep === 2) {
    return bookingStore.canProceedToStep3()
  }
  return false
})

const continueButtonText = computed(() => {
  if (bookingStore.currentStep === 1) {
    return 'Continuar'
  } else if (bookingStore.currentStep === 2) {
    return 'Confirmar reserva'
  }
  return 'Continuar'
})

const handleContinue = () => {
  if (bookingStore.currentStep === 1) {
    continueToStep2()
  } else if (bookingStore.currentStep === 2) {
    bookingStore.nextStep()
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