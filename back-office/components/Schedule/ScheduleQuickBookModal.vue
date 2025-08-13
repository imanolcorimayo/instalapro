<template>
  <ModalStructure
    ref="modalRef"
    title="Nuevo Trabajo"
    modal-class="max-w-2xl"
    @on-close="handleModalClose"
  >
    <!-- Modal Content -->
    <form @submit.prevent="handleSubmit">
      <div class="space-y-6">
        <!-- Date and Time Selection -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 class="text-sm font-medium text-blue-900 mb-3">
            Fecha y Hora
          </h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Fecha
              </label>
              <input
                v-model="form.date"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                :min="minDate"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Hora
              </label>
              <select
                v-model="form.time"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Seleccionar hora...</option>
                <option
                  v-for="slot in availableSlots"
                  :key="slot.id"
                  :value="slot.startTime"
                >
                  {{ slot.startTime }} - {{ slot.endTime }} ({{ slot.duration }}min)
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Client Information -->
        <div>
          <h3 class="text-sm font-medium text-gray-900 mb-3">
            Información del Cliente
          </h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Cliente *
              </label>
              <input
                v-model="form.clientName"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Juan Pérez"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Teléfono *
              </label>
              <input
                v-model="form.clientPhone"
                type="tel"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: +54 9 11 1234-5678"
                required
              />
            </div>
          </div>
          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Dirección *
            </label>
            <input
              v-model="form.address"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: Av. Corrientes 1234, CABA"
              required
            />
          </div>
        </div>

        <!-- Service Information -->
        <div>
          <h3 class="text-sm font-medium text-gray-900 mb-3">
            Información del Servicio
          </h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Servicio *
              </label>
              <select
                v-model="form.serviceType"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                @change="handleServiceChange"
              >
                <option value="">Seleccionar servicio...</option>
                <option
                  v-for="service in availableServices"
                  :key="service.id"
                  :value="service.name"
                >
                  {{ service.name }} - ${{ service.basePrice.toLocaleString() }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Precio Estimado *
              </label>
              <input
                v-model.number="form.price"
                type="number"
                min="0"
                step="100"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: 25000"
                required
              />
            </div>
          </div>
          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Duración Estimada (minutos)
            </label>
            <input
              v-model.number="form.estimatedDuration"
              type="number"
              min="30"
              step="30"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: 180"
            />
          </div>
          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Descripción del Trabajo
            </label>
            <textarea
              v-model="form.description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Descripción detallada del trabajo a realizar..."
            />
          </div>
          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Notas Adicionales
            </label>
            <textarea
              v-model="form.notes"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Notas internas, instrucciones especiales..."
            />
          </div>
        </div>

        <!-- Slot Conflict Warning -->
        <div
          v-if="hasSlotConflict"
          class="bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <div class="flex">
            <IconAlertCircleOutline
              class="w-5 h-5 text-red-400 mt-0.5 mr-3"
            />
            <div>
              <h4 class="text-sm font-medium text-red-800">
                Conflicto de Horario
              </h4>
              <p class="text-sm text-red-700 mt-1">
                El horario seleccionado ya está ocupado o no está disponible. Por favor selecciona otro horario.
              </p>
            </div>
          </div>
        </div>
      </div>
    </form>

    <!-- Modal Footer -->
    <template #footer>
      <div class="flex items-center justify-between w-full">
        <!-- Client Actions -->
        <div class="flex items-center space-x-3">
          <label class="flex items-center">
            <input
              v-model="form.createClient"
              type="checkbox"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span class="ml-2 text-sm text-gray-600">
              Crear cliente en la base de datos
            </span>
          </label>
        </div>

        <!-- Main Actions -->
        <div class="flex items-center space-x-3">
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            @click="handleCancel"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            :disabled="isSubmitting || hasSlotConflict"
            @click="handleSubmit"
          >
            <span v-if="isSubmitting">Creando...</span>
            <span v-else>Crear Trabajo</span>
          </button>
        </div>
      </div>
    </template>
  </ModalStructure>
</template>

<script setup lang="ts">
import IconAlertCircleOutline from '~icons/mdi/alert-circle-outline'
import type { Job, JobCreateInput, TimeSlot, TechnicianService } from '~/types'
import { parseTimeInBuenosAires, formatInBuenosAires, nowInBuenosAires } from '~/utils/timezone'

// ==========================================
// PROPS & EMITS
// ==========================================

interface Props {
  technicianId: string
}

interface Emits {
  (e: 'job-created', job: Job): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// ==========================================
// COMPOSABLES
// ==========================================

const scheduleStore = useScheduleStore()
const technicianStore = useTechnicianStore()

// ==========================================
// REFS
// ==========================================

const modalRef = ref()

// ==========================================
// STATE
// ==========================================

const isSubmitting = ref<boolean>(false)
const selectedDate = ref<string>('')
const selectedTime = ref<string>('')

const form = ref({
  date: '',
  time: '',
  clientName: '',
  clientPhone: '',
  address: '',
  serviceType: '',
  description: '',
  price: 0,
  estimatedDuration: 180,
  notes: '',
  createClient: true
})

// ==========================================
// COMPUTED
// ==========================================

const minDate = computed(() => {
  return formatInBuenosAires(nowInBuenosAires(), 'YYYY-MM-DD')
})

const availableSlots = computed((): TimeSlot[] => {
  if (!form.value.date) return []
  
  return scheduleStore.availableSlotsForDate(form.value.date)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
})

const availableServices = computed((): TechnicianService[] => {
  return technicianStore.activeServices || []
})

const hasSlotConflict = computed(() => {
  if (!form.value.date || !form.value.time) return false
  
  const slot = availableSlots.value.find(s => s.startTime === form.value.time)
  return !slot || slot.status !== 'available'
})

// ==========================================
// METHODS
// ==========================================

const showModal = (date?: string, time?: string): void => {
  // Reset form
  resetForm()
  
  // Set initial values
  if (date) {
    form.value.date = date
    selectedDate.value = date
  } else {
    form.value.date = formatInBuenosAires(nowInBuenosAires(), 'YYYY-MM-DD')
  }
  
  if (time) {
    form.value.time = time
    selectedTime.value = time
  }
  
  modalRef.value?.showModal()
}

const resetForm = (): void => {
  form.value = {
    date: '',
    time: '',
    clientName: '',
    clientPhone: '',
    address: '',
    serviceType: '',
    description: '',
    price: 0,
    estimatedDuration: 180,
    notes: '',
    createClient: true
  }
}

const handleServiceChange = (): void => {
  const selectedService = availableServices.value.find(
    service => service.name === form.value.serviceType
  )
  
  if (selectedService) {
    form.value.price = selectedService.basePrice
    form.value.estimatedDuration = selectedService.estimatedDuration
    form.value.description = selectedService.description
  }
}

const validateForm = (): boolean => {
  if (!form.value.date || !form.value.time) {
    console.error('Fecha y hora son requeridos')
    return false
  }
  
  if (!form.value.clientName || !form.value.clientPhone || !form.value.address) {
    console.error('Información del cliente es requerida')
    return false
  }
  
  if (!form.value.serviceType || !form.value.price) {
    console.error('Información del servicio es requerida')
    return false
  }
  
  if (hasSlotConflict.value) {
    console.error('Conflicto de horario')
    return false
  }
  
  return true
}

const handleSubmit = async (): Promise<void> => {
  if (!validateForm()) return
  
  isSubmitting.value = true
  
  try {
    // Create scheduled date from form data using Buenos Aires timezone
    const scheduledDate = parseTimeInBuenosAires(form.value.time, form.value.date).toDate()
    
    // Prepare job data
    const jobData: JobCreateInput = {
      clientId: form.value.createClient ? `client_${Date.now()}` : '',
      clientName: form.value.clientName,
      clientPhone: form.value.clientPhone,
      serviceType: form.value.serviceType,
      description: form.value.description || form.value.serviceType,
      address: form.value.address,
      scheduledDate,
      estimatedDuration: form.value.estimatedDuration,
      price: form.value.price,
      notes: form.value.notes
    }
    
    // Create job
    const createdJob = await scheduleStore.createJob(jobData)
    
    // TODO: Create client if requested
    if (form.value.createClient) {
      // This would be handled by a client store when implemented
      console.log('Cliente a crear:', {
        name: form.value.clientName,
        phone: form.value.clientPhone,
        address: form.value.address
      })
    }
    
    emit('job-created', createdJob)
    modalRef.value?.closeModal()
  } catch (error) {
    console.error('Error creating job:', error)
  } finally {
    isSubmitting.value = false
  }
}

const handleCancel = (): void => {
  modalRef.value?.closeModal()
}

const handleModalClose = (): void => {
  isSubmitting.value = false
}

// ==========================================
// WATCHERS
// ==========================================

watch(
  () => form.value.date,
  (newDate) => {
    // Clear selected time when date changes
    if (newDate !== selectedDate.value) {
      form.value.time = ''
      selectedTime.value = ''
    }
  }
)

// ==========================================
// EXPOSE METHODS
// ==========================================

defineExpose({
  showModal
})
</script>