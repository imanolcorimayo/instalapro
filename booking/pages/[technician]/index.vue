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
        <div class="max-w-lg mx-auto px-3 py-4 sm:px-4">
          <div class="flex items-center justify-between">
            <!-- Step 1 -->
            <div class="flex items-center flex-shrink-0">
              <div
                :class="[
                  'w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold',
                  bookingStore.currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                ]"
              >
                1
              </div>
              <span
                :class="[
                  'ml-1.5 sm:ml-2 text-xs sm:text-sm font-medium whitespace-nowrap',
                  bookingStore.currentStep >= 1 ? 'text-blue-600' : 'text-gray-500'
                ]"
              >
                <span class="hidden xs:inline">Servicio</span>
                <span class="xs:hidden">Serv.</span>
              </span>
            </div>

            <!-- Progress Bar 1-2 -->
            <div class="flex-1 mx-2 sm:mx-3 h-1 bg-gray-200 rounded min-w-0">
              <div class="h-1 bg-blue-600 rounded transition-all duration-300" :style="{ width: bookingStore.currentStep >= 2 ? '100%' : '33%' }"></div>
            </div>

            <!-- Step 2 -->
            <div class="flex items-center flex-shrink-0">
              <div
                :class="[
                  'w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold',
                  bookingStore.currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                ]"
              >
                2
              </div>
              <span
                :class="[
                  'ml-1.5 sm:ml-2 text-xs sm:text-sm font-medium whitespace-nowrap',
                  bookingStore.currentStep >= 2 ? 'text-blue-600' : 'text-gray-500'
                ]"
              >
                <span class="hidden xs:inline">Fecha/Hora</span>
                <span class="xs:hidden">Fecha</span>
              </span>
            </div>

            <!-- Progress Bar 2-3 -->
            <div class="flex-1 mx-2 sm:mx-3 h-1 bg-gray-200 rounded min-w-0">
              <div class="h-1 bg-blue-600 rounded transition-all duration-300" :style="{ width: bookingStore.canProceedToStep3() ? '100%' : '0%' }"></div>
            </div>

            <!-- Step 3 -->
            <div class="flex items-center flex-shrink-0">
              <div
                :class="[
                  'w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold',
                  bookingStore.currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                ]"
              >
                3
              </div>
              <span
                :class="[
                  'ml-1.5 sm:ml-2 text-xs sm:text-sm font-medium whitespace-nowrap',
                  bookingStore.currentStep >= 3 ? 'text-blue-600' : 'text-gray-500'
                ]"
              >
                <span class="hidden xs:inline">Confirmar</span>
                <span class="xs:hidden">Conf.</span>
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
          showContinueButton ? 'pb-28' : ''
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
          <button
            v-for="service in serviceTypesStore.activeServiceTypes"
            :key="service.id"
            @click="selectService(service)"
            :class="[
              'w-full text-left p-5 rounded-xl border-2 transition-all duration-200',
              bookingStore.selectedService?.id === service.id
                ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
            ]"
          >
            <div class="flex items-start gap-4">
              <div
                :class="[
                  'w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-colors',
                  bookingStore.selectedService?.id === service.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-100 text-blue-600'
                ]"
              >
                <IconSnowflake v-if="service.category === 'Instalación'" class="w-5 h-5" />
                <IconWrench v-else-if="service.category === 'Mantenimiento'" class="w-5 h-5" />
                <IconHammerWrench v-else-if="service.category === 'Reparación'" class="w-5 h-5" />
                <IconClipboardText v-else-if="service.category === 'Consultoría'" class="w-5 h-5" />
                <IconToolbox v-else class="w-5 h-5" />
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-3 mb-1">
                  <h3 class="font-semibold text-gray-900 text-base">{{ service.name }}</h3>
                  <transition
                    enter-active-class="transition-all duration-200 ease-out"
                    enter-from-class="scale-0 opacity-0"
                    enter-to-class="scale-100 opacity-100"
                    leave-active-class="transition-all duration-200 ease-in"
                    leave-from-class="scale-100 opacity-100"
                    leave-to-class="scale-0 opacity-0"
                  >
                    <div
                      v-if="bookingStore.selectedService?.id === service.id"
                      class="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0"
                    >
                      <IconCheck class="w-4 h-4 text-white" />
                    </div>
                  </transition>
                </div>

                <p v-if="service.description" class="text-sm text-gray-600 mb-3 leading-relaxed">{{ service.description }}</p>

                <div class="flex items-center justify-between gap-4">
                  <span class="text-lg font-semibold text-blue-600">${{ service.basePrice.toLocaleString() }}</span>
                  <div class="flex items-center gap-1.5 text-sm text-gray-500">
                    <IconClock class="w-4 h-4" />
                    <span>{{ formatDuration(service.estimatedDuration) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- Step 2: Date and Time Selection -->
      <div
        v-else-if="bookingStore.currentStep === 2"
        :class="[
          'max-w-lg mx-auto p-4',
          showContinueButton ? 'pb-28' : ''
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
        <!-- Back button -->
        <button
          @click="goBackToStep2"
          class="flex items-center text-blue-600 hover:text-blue-700 mb-4 transition-colors"
        >
          <IconChevronLeft class="w-5 h-5 mr-1" />
          <span>Cambiar fecha/hora</span>
        </button>

        <h2 class="text-lg font-semibold text-gray-800 mb-4">Confirmar reserva</h2>

        <!-- Booking Summary -->
        <div class="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <h3 class="text-sm font-medium text-gray-600 mb-3">Resumen de tu reserva</h3>

          <!-- Service -->
          <div class="mb-4">
            <p class="text-xs text-gray-500">Servicio</p>
            <p class="font-semibold text-gray-800">{{ bookingStore.selectedService?.name }}</p>
            <div class="flex items-center justify-between mt-1">
              <span class="text-blue-600 font-semibold">${{ bookingStore.selectedService?.basePrice.toLocaleString() }}</span>
              <span class="text-sm text-gray-500">{{ formatDuration(bookingStore.selectedService?.estimatedDuration || 0) }}</span>
            </div>
          </div>

          <!-- Date & Time -->
          <div>
            <p class="text-xs text-gray-500">Fecha y hora</p>
            <p class="font-semibold text-gray-800">{{ formatBookingDateTime }}</p>
          </div>
        </div>

        <p class="text-gray-600">Formulario de datos del cliente - Por implementar</p>
      </div>

      <!-- Continue Button - Sticky Bottom Bar -->
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
          class="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg z-40"
        >
          <div class="max-w-lg mx-auto p-4">
            <button
              @click="handleContinue"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <span>{{ continueButtonText }}</span>
              <IconChevronRight class="w-5 h-5" />
            </button>
          </div>
        </div>
      </transition>

      <!-- WhatsApp FAB -->
      <a
        v-if="techniciansStore.technician.phone"
        :href="whatsappUrl"
        target="_blank"
        class="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-green-500 hover:bg-green-600 flex items-center justify-center z-50"
      >
        <IconWhatsapp class="w-7 h-7 text-white" />
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
import IconCheck from '~icons/mdi/check'
import IconChevronLeft from '~icons/mdi/chevron-left'
import IconChevronRight from '~icons/mdi/chevron-right'

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

// Go back to step 2
const goBackToStep2 = () => {
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

// Format booking date and time for display
const formatBookingDateTime = computed(() => {
  if (!bookingStore.selectedDate || bookingStore.selectedHour === null) return ''

  // Parse date
  const [year, month, day] = bookingStore.selectedDate.split('-')
  const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))

  // Format date in Spanish
  const dateFormatter = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  const formattedDate = dateFormatter.format(dateObj)

  // Format time
  const hour = bookingStore.selectedHour
  const period = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour

  return `${formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)} - ${displayHour}:00 ${period}`
})

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