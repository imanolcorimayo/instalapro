<template>
  <div class="max-w-4xl mx-auto">
    <!-- Page Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">
        Configuración
      </h1>
      <p class="text-gray-600">
        Gestiona tu perfil, horarios de atención y servicios
      </p>
    </div>

    <!-- Loading State -->
    <div
      v-if="technicianStore.loading"
      class="flex items-center justify-center py-12"
    >
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
        <p class="text-gray-500">Cargando configuración...</p>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="technicianStore.error"
      class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
    >
      <div class="flex">
        <IconAlertCircleOutline class="w-5 h-5 text-red-400 mt-0.5" />
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">
            Error
          </h3>
          <p class="text-sm text-red-700 mt-1">
            {{ technicianStore.error }}
          </p>
        </div>
      </div>
    </div>

    <!-- Settings Sections -->
    <div
      v-else
      class="space-y-6"
    >
      <!-- Profile Section -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">
            Información Personal
          </h2>
          <p class="text-sm text-gray-600 mt-1">
            Datos básicos de tu perfil profesional
          </p>
        </div>
        <div class="px-6 py-4">
          <div
            v-if="technicianStore.technician"
            class="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Nombre Completo
              </label>
              <p class="text-gray-900">
                {{ technicianStore.technician.name }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <p class="text-gray-900">
                {{ technicianStore.technician.phone }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <p class="text-gray-900">
                {{ technicianStore.technician.email }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp
              </label>
              <p class="text-gray-900">
                {{ technicianStore.technician.whatsappNumber }}
              </p>
            </div>
          </div>
          <div class="mt-4">
            <button
              type="button"
              class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Editar Perfil
            </button>
          </div>
        </div>
      </div>

      <!-- Availability Section -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">
                Horarios de Atención
              </h2>
              <p class="text-sm text-gray-600 mt-1">
                Configura cuándo estás disponible para recibir trabajos
              </p>
            </div>
            <button
              type="button"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
              @click="openAvailabilityModal"
            >
              <IconPencil class="w-4 h-4 mr-2" />
              Editar Horarios
            </button>
          </div>
        </div>
        <div class="px-6 py-4">
          <SettingsAvailabilityGrid />
        </div>
      </div>

      <!-- Services Section -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">
                Servicios Ofrecidos
              </h2>
              <p class="text-sm text-gray-600 mt-1">
                Los servicios que ofreces a tus clientes
              </p>
            </div>
            <button
              type="button"
              class="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center"
            >
              <IconPlus class="w-4 h-4 mr-2" />
              Nuevo Servicio
            </button>
          </div>
        </div>
        <div class="px-6 py-4">
          <div
            v-if="technicianStore.activeServices.length > 0"
            class="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div
              v-for="service in technicianStore.activeServices"
              :key="service.id"
              class="border border-gray-200 rounded-lg p-4"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h3 class="font-medium text-gray-900">
                    {{ service.name }}
                  </h3>
                  <p class="text-sm text-gray-600 mt-1">
                    {{ service.description }}
                  </p>
                  <div class="flex items-center mt-2 text-sm text-gray-500">
                    <IconCurrencyUsd class="w-4 h-4 mr-1" />
                    ${{ service.basePrice.toLocaleString() }}
                    <span class="mx-2">•</span>
                    <IconClockOutline class="w-4 h-4 mr-1" />
                    {{ service.estimatedDuration }}min
                  </div>
                </div>
                <button
                  type="button"
                  class="text-gray-400 hover:text-gray-600 p-1"
                >
                  <IconDotsVertical class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <div
            v-else
            class="text-center py-8"
          >
            <IconTools class="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              No hay servicios configurados
            </h3>
            <p class="text-gray-600 mb-4">
              Agrega los servicios que ofreces para que tus clientes puedan contratarte
            </p>
            <button
              type="button"
              class="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Agregar Primer Servicio
            </button>
          </div>
        </div>
      </div>

      <!-- Booking Page Section -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">
            Página de Reservas
          </h2>
          <p class="text-sm text-gray-600 mt-1">
            Tu enlace personalizado para que clientes agenden citas
          </p>
        </div>
        <div class="px-6 py-4">
          <div
            v-if="technicianStore.technician"
            class="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200"
          >
            <div class="flex-1">
              <p class="text-sm font-medium text-blue-900 mb-1">
                Tu enlace de reservas:
              </p>
              <p class="text-blue-700 font-mono text-sm">
                {{ technicianStore.technician.bookingUrl }}
              </p>
            </div>
            <div class="flex items-center space-x-2">
              <button
                type="button"
                class="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <IconContentCopy class="w-4 h-4" />
              </button>
              <button
                type="button"
                class="bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
              >
                <IconWhatsapp class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Availability Management Modal -->
    <SettingsAvailabilityModal
      ref="availabilityModalRef"
    />
  </div>
</template>

<script setup lang="ts">
// Icons
import IconAlertCircleOutline from '~icons/mdi/alert-circle-outline'
import IconPencil from '~icons/mdi/pencil'
import IconPlus from '~icons/mdi/plus'
import IconCurrencyUsd from '~icons/mdi/currency-usd'
import IconClockOutline from '~icons/mdi/clock-outline'
import IconDotsVertical from '~icons/mdi/dots-vertical'
import IconTools from '~icons/mdi/tools'
import IconContentCopy from '~icons/mdi/content-copy'
import IconWhatsapp from '~icons/mdi/whatsapp'

// ==========================================
// PAGE METADATA
// ==========================================

definePageMeta({
  layout: 'default'
})

// ==========================================
// COMPOSABLES
// ==========================================

const technicianStore = useTechnicianStore()

// ==========================================
// REFS
// ==========================================

const availabilityModalRef = ref()

// ==========================================
// METHODS
// ==========================================

const openAvailabilityModal = (): void => {
  if (availabilityModalRef.value) {
    availabilityModalRef.value.showModal()
  }
}

// ==========================================
// LIFECYCLE
// ==========================================

onMounted(async () => {
  // Ensure technician data is loaded
  if (!technicianStore.technician) {
    await technicianStore.initialize()
  }
})
</script>