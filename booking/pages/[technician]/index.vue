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
              <h1 class="text-xl font-bold text-gray-800">{{ techniciansStore.technician.businessName || techniciansStore.technician.name }}</h1>
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
        class="max-w-lg mx-auto p-4 pb-28"
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
          <!-- Regular Services -->
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
                  <span class="text-lg font-semibold text-blue-600">${{ formatPrice(service.basePrice) }}</span>
                  <div class="flex items-center gap-1.5 text-sm text-gray-500">
                    <IconClock class="w-4 h-4" />
                    <span>{{ formatDuration(service.estimatedDuration) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </button>

          <!-- Consulta General Option -->
          <button
            @click="openConsultationModal"
            class="w-full text-left p-5 rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 hover:border-purple-300 hover:shadow-sm transition-all duration-200"
          >
            <div class="flex items-start gap-4">
              <div class="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 bg-purple-600 text-white">
                <IconHelpCircle class="w-5 h-5" />
              </div>

              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-gray-900 text-base mb-1">Consulta General</h3>
                <p class="text-sm text-gray-600 leading-relaxed">
                  ¿No encontrás lo que buscás? Describí tu necesidad y te ayudamos a encontrar la mejor solución.
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- Step 2: Date and Time Selection -->
      <div
        v-else-if="bookingStore.currentStep === 2"
        class="max-w-lg mx-auto p-4 pb-28"
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
              <p class="text-blue-600 font-semibold">${{ formatPrice(bookingStore.selectedService?.basePrice) }}</p>
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

      <!-- Step 3: Client Information -->
      <div v-else-if="bookingStore.currentStep === 3" class="max-w-lg mx-auto p-4 pb-28">
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
              <span class="text-blue-600 font-semibold">${{ formatPrice(bookingStore.selectedService?.basePrice) }}</span>
              <span class="text-sm text-gray-500">{{ formatDuration(bookingStore.selectedService?.estimatedDuration || 0) }}</span>
            </div>
          </div>

          <!-- Date & Time -->
          <div>
            <p class="text-xs text-gray-500">Fecha y hora</p>
            <p class="font-semibold text-gray-800">{{ formatBookingDateTime }}</p>
          </div>
        </div>

        <!-- Client Information Form -->
        <div class="bg-white border border-gray-200 rounded-lg p-4">
          <h3 class="text-sm font-medium text-gray-600 mb-4">Tus datos</h3>

          <form @submit.prevent class="space-y-4">
            <!-- Email Field -->
            <div>
              <label for="client-email" class="block text-sm font-medium text-gray-700 mb-1">
                Email <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <input
                  id="client-email"
                  v-model="bookingStore.clientInfo.email"
                  @blur="handleEmailBlur"
                  type="email"
                  class="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="tu@email.com"
                  required
                />
                <div v-if="clientsStore.loading" class="absolute right-3 top-1/2 -translate-y-1/2">
                  <div class="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              </div>
              <p v-if="emailError" class="text-xs text-red-500 mt-1">{{ emailError }}</p>
              <p v-else-if="clientFound" class="text-xs text-green-600 mt-1 flex items-center gap-1">
                <IconCheck class="w-4 h-4" />
                Cliente encontrado - datos precargados
              </p>
            </div>

            <!-- Name Field -->
            <div>
              <label for="client-name" class="block text-sm font-medium text-gray-700 mb-1">
                Nombre <span class="text-red-500">*</span>
              </label>
              <input
                id="client-name"
                v-model="bookingStore.clientInfo.name"
                type="text"
                class="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Tu nombre"
                required
              />
            </div>

            <!-- Phone Field -->
            <div>
              <label for="client-phone" class="block text-sm font-medium text-gray-700 mb-1">
                Teléfono <span class="text-red-500">*</span>
              </label>
              <input
                id="client-phone"
                v-model="bookingStore.clientInfo.phone"
                type="tel"
                class="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="+54 9 11 1234-5678"
                required
              />
            </div>

            <!-- Address Field -->
            <div>
              <label for="client-address" class="block text-sm font-medium text-gray-700 mb-1">
                Dirección <span class="text-red-500">*</span>
              </label>
              <input
                id="client-address"
                v-model="bookingStore.clientInfo.address"
                type="text"
                class="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Calle, número, piso, depto"
                required
              />
            </div>

            <!-- Notes Field -->
            <div>
              <label for="client-notes" class="block text-sm font-medium text-gray-700 mb-1">
                Notas adicionales
              </label>
              <textarea
                id="client-notes"
                v-model="bookingStore.clientInfo.notes"
                rows="3"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                placeholder="Ej: Piso 2, timbre A, horario preferido..."
              ></textarea>
            </div>
          </form>
        </div>
      </div>

      <!-- Continue Button (Primary FAB) - Centered Bottom -->
      <transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="translate-y-8 opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="translate-y-8 opacity-0"
      >
        <button
          v-if="showContinueButton"
          @click="handleContinue"
          :disabled="isContinueButtonDisabled"
          :class="[
            'fixed bottom-6 left-1/2 -translate-x-1/2 h-14 px-6 rounded-full shadow-lg transition-all duration-200 text-white font-light flex items-center gap-2 z-50 whitespace-nowrap',
            isContinueButtonDisabled
              ? 'bg-gray-400 cursor-not-allowed opacity-60'
              : 'bg-blue-600 hover:bg-blue-700 hover:shadow-xl hover:scale-105'
          ]"
        >
          <span>{{ continueButtonText }}</span>
          <IconChevronRight class="w-5 h-5" />
        </button>
      </transition>

      <!-- WhatsApp Button (Secondary FAB) - Bottom Right -->
      <a
        v-if="techniciansStore.technician.phone"
        :href="whatsappUrl"
        target="_blank"
        class="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-green-500 hover:bg-green-600 hover:scale-105 flex items-center justify-center z-50"
      >
        <IconWhatsapp class="w-7 h-7 text-white" />
      </a>
    </div>

    <!-- Success Confirmation Modal -->
    <div
      v-if="showSuccessModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      @click.self="closeSuccessModal"
    >
      <div class="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full max-h-[75vh] overflow-y-auto">
        <!-- Success Icon -->
        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <IconCheckCircle class="w-12 h-12 text-green-600" />
        </div>

        <!-- Success Message -->
        <h2 class="text-2xl font-bold text-gray-800 text-center mb-3">
          {{ isConsultationSuccess ? '¡Consulta enviada!' : '¡Reserva confirmada!' }}
        </h2>
        <p class="text-gray-600 text-center mb-6">
          {{ isConsultationSuccess
            ? 'Tu consulta ha sido enviada exitosamente. El técnico la revisará y se comunicará contigo pronto para coordinar.'
            : 'Tu cita ha sido agendada exitosamente. El técnico recibirá la notificación y confirmará tu reserva pronto.'
          }}
        </p>

        <!-- Booking Summary -->
        <div class="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
          <div v-if="!isConsultationSuccess">
            <p class="text-xs text-gray-500 mb-1">Servicio</p>
            <p class="font-semibold text-gray-800">{{ bookingStore.selectedService?.name }}</p>
          </div>

          <div v-if="!isConsultationSuccess">
            <p class="text-xs text-gray-500 mb-1">Fecha y hora</p>
            <p class="font-semibold text-gray-800">{{ formatBookingDateTime }}</p>
          </div>

          <div v-if="!isConsultationSuccess">
            <p class="text-xs text-gray-500 mb-1">Dirección</p>
            <p class="font-semibold text-gray-800">{{ bookingStore.clientInfo.address }}</p>
          </div>

          <div>
            <p class="text-xs text-gray-500 mb-1">Técnico</p>
            <p class="font-semibold text-gray-800">{{ techniciansStore.technician?.businessName || techniciansStore.technician?.name }}</p>
          </div>
        </div>

        <!-- Important Note -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p class="text-sm text-blue-800">
            <strong>Importante:</strong> {{ isConsultationSuccess
              ? 'El técnico revisará tu consulta y se comunicará contigo a la brevedad.'
              : 'El técnico se comunicará contigo para confirmar la cita.'
            }}
          </p>
        </div>

        <!-- Actions -->
        <div class="space-y-3">
          <button
            @click="closeSuccessModal"
            class="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            {{ isConsultationSuccess ? 'Enviar otra consulta' : 'Agendar otra cita' }}
          </button>

          <a
            :href="isConsultationSuccess ? whatsappUrlConsultation : whatsappUrlWithBooking"
            target="_blank"
            class="w-full h-12 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <IconWhatsapp class="w-5 h-5" />
            Contactar al técnico
          </a>
        </div>
      </div>
    </div>

    <!-- Consultation Modal -->
    <ConsultationModal
      :show="showConsultationModal"
      :technician-user-uid="techniciansStore.technician?.userUid || ''"
      @close="closeConsultationModal"
      @submitted="handleConsultationSubmitted"
    />
  </div>
</template>

<script setup>
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
import IconCheckCircle from '~icons/mdi/check-circle'
import IconChevronLeft from '~icons/mdi/chevron-left'
import IconChevronRight from '~icons/mdi/chevron-right'
import IconHelpCircle from '~icons/mdi/help-circle-outline'

// Utils
import { formatPrice } from '@/utils'

// Stores
const techniciansStore = useTechniciansStore()
const serviceTypesStore = useServiceTypesStore()
const bookingStore = useBookingStore()
const clientsStore = useClientsStore()
const jobsStore = useJobsStore()

// Route
const route = useRoute()
const technicianSlug = route.params.technician

// Cookie for email persistence
const emailCookie = useCookie('booking_client_email')

// Client lookup state
const clientFound = ref(false)
const emailError = ref(null)

// Booking submission state
const showSuccessModal = ref(false)
const submittingBooking = ref(false)
const isConsultationSuccess = ref(false)

// Consultation modal state
const showConsultationModal = ref(false)

// Handle email blur - lookup client
const handleEmailBlur = async () => {
  const email = bookingStore.clientInfo.email.trim()

  // Reset state
  clientFound.value = false
  emailError.value = null

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email) {
    return
  }

  if (!emailRegex.test(email)) {
    emailError.value = 'Email inválido'
    return
  }

  // Save email to cookie
  emailCookie.value = email

  // Lookup client
  if (techniciansStore.technician?.userUid) {
    const client = await clientsStore.findClientByEmail(email, techniciansStore.technician.userUid)

    if (client) {
      // Client found - pre-populate form (keep original name from DB)
      clientFound.value = true
      bookingStore.updateClientInfo({
        name: client.name,
        phone: client.phone,
        address: client.address,
        notes: client.notes || ''
      })
    }
  }
}

// Load email from cookie and trigger lookup on mount of step 3
const loadEmailFromCookie = async () => {
  if (emailCookie.value && bookingStore.currentStep === 3) {
    bookingStore.updateClientInfo({ email: emailCookie.value })
    await handleEmailBlur()
  }
}

// Watch for step 3 to load email from cookie
watch(() => bookingStore.currentStep, async (newStep) => {
  if (newStep === 3 && emailCookie.value && !bookingStore.clientInfo.email) {
    await loadEmailFromCookie()
  }
})

// Helper: Format duration from minutes to readable format
const formatDuration = (minutes) => {
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
const selectService = (service) => {
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
  } else if (bookingStore.currentStep === 3) {
    return true // Always show in step 3, but may be disabled
  }
  return false
})

const isContinueButtonDisabled = computed(() => {
  if (bookingStore.currentStep === 3) {
    return !bookingStore.canSubmitBooking() || submittingBooking.value
  }
  return false
})

const continueButtonText = computed(() => {
  if (bookingStore.currentStep === 1) {
    return 'Continuar'
  } else if (bookingStore.currentStep === 2) {
    return 'Continuar'
  } else if (bookingStore.currentStep === 3) {
    return submittingBooking.value ? 'Enviando...' : 'Confirmar reserva'
  }
  return 'Continuar'
})

const handleContinue = () => {
  if (bookingStore.currentStep === 1) {
    continueToStep2()
  } else if (bookingStore.currentStep === 2) {
    bookingStore.nextStep()
  } else if (bookingStore.currentStep === 3) {
    handleSubmitBooking()
  }
}

// Submit booking (create client + job)
const handleSubmitBooking = async () => {
  if (!bookingStore.canSubmitBooking()) {
    return
  }

  if (!techniciansStore.technician || !bookingStore.selectedService || !bookingStore.selectedDate || bookingStore.selectedHour === null) {
    return
  }

  submittingBooking.value = true

  try {
    const technicianUserUid = techniciansStore.technician.userUid
    const clientEmail = bookingStore.clientInfo.email.trim().toLowerCase()

    // Step 1: Create or update client
    let clientId;

    // Check if client already exists
    const existingClient = await clientsStore.findClientByEmail(clientEmail, technicianUserUid)

    if (existingClient) {
      // Update existing client with latest info
      clientId = existingClient.id
      // Note: Could add update logic here if needed
    } else {
      // Create new client
      const { ClientsSchema } = await import('~/utils/odm/schemas/clientSchema')
      const clientsSchema = new ClientsSchema()

      const clientData = {
        userUid: technicianUserUid,
        name: bookingStore.clientInfo.name.trim(),
        email: clientEmail,
        phone: bookingStore.clientInfo.phone.trim(),
        address: bookingStore.clientInfo.address.trim(),
        notes: bookingStore.clientInfo.notes.trim()
      }

      const clientResult = await clientsSchema.create(clientData)

      if (!clientResult.success) {
        throw new Error(clientResult.error || 'Error al crear cliente')
      }

      clientId = clientResult.data?.id
    }

    // Step 2: Create job
    const [year, month, day] = bookingStore.selectedDate.split('-')
    const scheduledDate = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      bookingStore.selectedHour,
      0,
      0
    )

    const jobData = {
      userUid: technicianUserUid,
      clientId: clientId,
      clientName: bookingStore.clientInfo.name.trim(),
      clientPhone: bookingStore.clientInfo.phone.trim(),
      clientEmail: clientEmail,
      serviceType: bookingStore.selectedService.name,
      description: `${bookingStore.selectedService.name} - Reserva desde agenda online`,
      address: bookingStore.clientInfo.address.trim(),
      scheduledDate: scheduledDate,
      estimatedDuration: bookingStore.selectedService.estimatedDuration,
      price: bookingStore.selectedService.basePrice,
      notes: bookingStore.clientInfo.notes.trim(),
      status: 'pending',
      source: 'client_booking'
    }

    await jobsStore.createJob(jobData)

    // Success - show confirmation
    isConsultationSuccess.value = false
    showSuccessModal.value = true
  } catch (err) {
    console.error('Error submitting booking:', err)
    alert('Error al crear la reserva. Por favor, intenta nuevamente o contacta al técnico por WhatsApp.')
  } finally {
    submittingBooking.value = false
  }
}

// Close success modal and reset booking
const closeSuccessModal = () => {
  showSuccessModal.value = false
  isConsultationSuccess.value = false
  bookingStore.resetBooking()
  clientsStore.clearClient()
}

// Open consultation modal
const openConsultationModal = () => {
  showConsultationModal.value = true
}

// Close consultation modal
const closeConsultationModal = () => {
  showConsultationModal.value = false
}

// Handle consultation submission success
const handleConsultationSubmitted = () => {
  isConsultationSuccess.value = true
  showSuccessModal.value = true
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

// WhatsApp URL (generic - for floating button during booking)
const whatsappUrl = computed(() => {
  if (!techniciansStore.technician?.phone) return '#'
  const phone = techniciansStore.technician.phone.replace(/[^0-9]/g, '')
  const displayName = techniciansStore.technician.businessName || techniciansStore.technician.name
  const message = encodeURIComponent(`Hola ${displayName}, me gustaría solicitar información sobre tus servicios.`)
  return `https://wa.me/${phone}?text=${message}`
})

// WhatsApp URL with booking details (for success modal)
const whatsappUrlWithBooking = computed(() => {
  if (!techniciansStore.technician?.phone) return '#'
  const phone = techniciansStore.technician.phone.replace(/[^0-9]/g, '')
  const displayName = techniciansStore.technician.businessName || techniciansStore.technician.name

  // Build message with booking details
  const serviceName = bookingStore.selectedService?.name || ''
  const dateTime = formatBookingDateTime.value
  const address = bookingStore.clientInfo.address
  const clientName = bookingStore.clientInfo.name

  const message = encodeURIComponent(
    `Hola ${displayName}, acabo de confirmar mi reserva:\n\n` +
    `👤 ${clientName}\n` +
    `🔧 ${serviceName}\n` +
    `📅 ${dateTime}\n` +
    `📍 ${address}\n\n` +
    `Quedo atento a tu confirmación.`
  )

  return `https://wa.me/${phone}?text=${message}`
})

// WhatsApp URL for consultation follow-up (for success modal after consultation)
const whatsappUrlConsultation = computed(() => {
  if (!techniciansStore.technician?.phone) return '#'
  const phone = techniciansStore.technician.phone.replace(/[^0-9]/g, '')
  const displayName = techniciansStore.technician.businessName || techniciansStore.technician.name

  const message = encodeURIComponent(
    `Hola ${displayName}, acabo de enviarte una consulta desde tu página de reservas. Quedo atento a tu respuesta.`
  )

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
  title: () => {
    if (!techniciansStore.technician) return 'Reservar Cita - InstalaPro'
    const displayName = techniciansStore.technician.businessName || techniciansStore.technician.name
    return `Reservar con ${displayName} - InstalaPro`
  },
  description: () => {
    if (!techniciansStore.technician) return 'Agenda tu cita de aire acondicionado'
    const displayName = techniciansStore.technician.businessName || techniciansStore.technician.name
    return `Agenda tu cita de aire acondicionado con ${displayName}. Instalación, reparación y mantenimiento profesional.`
  },
  ogTitle: () => {
    if (!techniciansStore.technician) return 'Reservar Cita'
    const displayName = techniciansStore.technician.businessName || techniciansStore.technician.name
    return `${displayName} - Técnico de Aire Acondicionado`
  },
  ogDescription: 'Sistema de reservas online para técnicos especializados en aire acondicionado.'
})
</script>