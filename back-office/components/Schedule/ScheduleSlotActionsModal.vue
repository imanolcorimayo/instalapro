<template>
  <ModalStructure
    ref="modalRef"
    :title="modalTitle"
    modal-class="max-w-lg"
    @on-close="handleModalClose"
  >
    <!-- Modal Content -->
    <div
      v-if="currentSlot"
      class="space-y-6"
    >
      <!-- Slot Information -->
      <div class="bg-gray-50 rounded-lg p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ formatSlotTime(currentSlot) }}
          </h3>
          <span :class="['px-3 py-1 text-sm font-medium rounded-full', getSlotStatusClasses(currentSlot.status)]">
            {{ getSlotStatusLabel(currentSlot.status) }}
          </span>
        </div>
        
        <div class="text-sm text-gray-600 space-y-1">
          <p>
            <span class="font-medium">Fecha:</span>
            {{ formatSlotDate(currentSlot.date) }}
          </p>
          <p>
            <span class="font-medium">Duración:</span>
            {{ currentSlot.duration }} minutos
          </p>
          <p
            v-if="currentSlot.jobId"
            class="flex items-center"
          >
            <span class="font-medium mr-2">Cliente:</span>
            {{ getJobForSlot(currentSlot)?.clientName || 'Desconocido' }}
          </p>
        </div>
      </div>

      <!-- Available Slot Actions -->
      <div
        v-if="currentSlot.status === 'available'"
        class="space-y-4"
      >
        <h4 class="text-sm font-medium text-gray-900">
          Acciones Disponibles
        </h4>
        
        <div class="grid grid-cols-2 gap-3">
          <button
            type="button"
            class="flex flex-col items-center p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-colors"
            @click="handleBookSlot"
          >
            <IconCalendarPlus
              class="w-8 h-8 text-green-600 mb-2"
            />
            <span class="text-sm font-medium text-green-700">
              Agendar Trabajo
            </span>
          </button>
          
          <button
            type="button"
            class="flex flex-col items-center p-4 border-2 border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            @click="showBlockForm"
          >
            <IconBlockHelper
              class="w-8 h-8 text-red-600 mb-2"
            />
            <span class="text-sm font-medium text-red-700">
              Bloquear Horario
            </span>
          </button>
        </div>
      </div>

      <!-- Booked Slot Actions -->
      <div
        v-else-if="currentSlot.status === 'booked'"
        class="space-y-4"
      >
        <h4 class="text-sm font-medium text-gray-900">
          Trabajo Agendado
        </h4>
        
        <div
          v-if="getJobForSlot(currentSlot)"
          class="bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <div class="flex items-start justify-between">
            <div>
              <p class="font-medium text-blue-900">
                {{ getJobForSlot(currentSlot)?.clientName }}
              </p>
              <p class="text-sm text-blue-700">
                {{ getJobForSlot(currentSlot)?.serviceType }}
              </p>
              <p class="text-xs text-blue-600 mt-1">
                ${{ getJobForSlot(currentSlot)?.price.toLocaleString() }}
              </p>
            </div>
            <button
              type="button"
              class="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded hover:bg-blue-200 transition-colors"
              @click="handleEditJob"
            >
              Ver Detalles
            </button>
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-3">
          <button
            type="button"
            class="flex flex-col items-center p-3 border-2 border-yellow-200 rounded-lg hover:bg-yellow-50 transition-colors"
            @click="handleRescheduleJob"
          >
            <IconCalendarEdit
              class="w-6 h-6 text-yellow-600 mb-1"
            />
            <span class="text-xs font-medium text-yellow-700">
              Reprogramar
            </span>
          </button>
          
          <button
            type="button"
            class="flex flex-col items-center p-3 border-2 border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            @click="handleCancelJob"
          >
            <IconCalendarRemove
              class="w-6 h-6 text-red-600 mb-1"
            />
            <span class="text-xs font-medium text-red-700">
              Cancelar
            </span>
          </button>
        </div>
      </div>

      <!-- Blocked Slot Actions -->
      <div
        v-else-if="currentSlot.status === 'blocked'"
        class="space-y-4"
      >
        <h4 class="text-sm font-medium text-gray-900">
          Horario Bloqueado
        </h4>
        
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-sm text-red-700">
            <span class="font-medium">Razón:</span>
            {{ getBlockedReason(currentSlot) }}
          </p>
        </div>
        
        <button
          type="button"
          class="w-full flex items-center justify-center p-3 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-colors"
          @click="handleUnblockSlot"
        >
          <IconCheckCircle
            class="w-5 h-5 text-green-600 mr-2"
          />
          <span class="text-sm font-medium text-green-700">
            Desbloquear Horario
          </span>
        </button>
      </div>

      <!-- Break Time Info -->
      <div
        v-else-if="currentSlot.status === 'break'"
        class="space-y-4"
      >
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <IconCoffeeOutline
            class="w-12 h-12 text-gray-500 mx-auto mb-2"
          />
          <h4 class="text-sm font-medium text-gray-900 mb-1">
            Tiempo de Descanso
          </h4>
          <p class="text-xs text-gray-600">
            Este horario está configurado como tiempo de descanso en tu disponibilidad.
          </p>
        </div>
      </div>

      <!-- Block Form -->
      <div
        v-if="showBlockingForm"
        class="space-y-4 border-t border-gray-200 pt-4"
      >
        <h4 class="text-sm font-medium text-gray-900">
          Bloquear Horario
        </h4>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Razón del Bloqueo
          </label>
          <select
            v-model="blockForm.reason"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Seleccionar razón...</option>
            <option value="personal">Compromiso Personal</option>
            <option value="maintenance">Mantenimiento de Equipos</option>
            <option value="travel">Tiempo de Viaje</option>
            <option value="sick">Enfermedad</option>
            <option value="vacation">Vacaciones</option>
            <option value="other">Otro</option>
          </select>
        </div>
        
        <div v-if="blockForm.reason === 'other'">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Especificar Razón
          </label>
          <input
            v-model="blockForm.customReason"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe la razón..."
          />
        </div>
        
        <div class="flex items-center">
          <input
            v-model="blockForm.recurring"
            type="checkbox"
            class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label class="ml-2 text-sm text-gray-700">
            Bloquear este horario todas las semanas
          </label>
        </div>
      </div>
    </div>

    <!-- Modal Footer -->
    <template #footer>
      <div class="flex items-center justify-between w-full">
        <div>
          <button
            v-if="showBlockingForm"
            type="button"
            class="text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
            @click="cancelBlockForm"
          >
            ← Volver
          </button>
        </div>

        <div class="flex items-center space-x-3">
          <button
            v-if="showBlockingForm"
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            @click="cancelBlockForm"
          >
            Cancelar
          </button>
          
          <button
            v-if="showBlockingForm"
            type="button"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            :disabled="isSubmitting || !blockForm.reason"
            @click="handleConfirmBlock"
          >
            <span v-if="isSubmitting">Bloqueando...</span>
            <span v-else>Bloquear Horario</span>
          </button>
          
          <button
            v-if="!showBlockingForm"
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            @click="handleClose"
          >
            Cerrar
          </button>
        </div>
      </div>
    </template>
  </ModalStructure>
</template>

<script setup>
import IconCalendarPlus from '~icons/mdi/calendar-plus'
import IconBlockHelper from '~icons/mdi/block-helper'
import IconCalendarEdit from '~icons/mdi/calendar-edit'
import IconCalendarRemove from '~icons/mdi/calendar-remove'
import IconCheckCircle from '~icons/mdi/check-circle'
import IconCoffeeOutline from '~icons/mdi/coffee-outline'
import { toBuenosAires } from '~/utils/timezone'

// ==========================================
// EMITS
// ==========================================

const emit = defineEmits(['slot-booked', 'slot-blocked', 'job-selected'])

// ==========================================
// COMPOSABLES
// ==========================================

const scheduleStore = useScheduleStore()

// ==========================================
// REFS
// ==========================================

const modalRef = ref()

// ==========================================
// STATE
// ==========================================

const currentSlot = ref(null)
const showBlockingForm = ref(false)
const isSubmitting = ref(false)

const blockForm = ref({
  reason: '',
  customReason: '',
  recurring: false
})

// ==========================================
// COMPUTED
// ==========================================

const modalTitle = computed(() => {
  if (!currentSlot.value) return 'Gestionar Horario'
  
  if (showBlockingForm.value) {
    return 'Bloquear Horario'
  }
  
  switch (currentSlot.value.status) {
    case 'available':
      return 'Horario Disponible'
    case 'booked':
      return 'Trabajo Agendado'
    case 'blocked':
      return 'Horario Bloqueado'
    case 'break':
      return 'Tiempo de Descanso'
    default:
      return 'Gestionar Horario'
  }
})

// ==========================================
// METHODS
// ==========================================

const showModal = (slot) => {
  currentSlot.value = slot
  showBlockingForm.value = false
  resetBlockForm()
  modalRef.value?.showModal()
}

const resetBlockForm = () => {
  blockForm.value = {
    reason: '',
    customReason: '',
    recurring: false
  }
}

const showBlockForm = () => {
  showBlockingForm.value = true
}

const cancelBlockForm = () => {
  showBlockingForm.value = false
  resetBlockForm()
}

const handleBookSlot = () => {
  if (!currentSlot.value) return
  emit('slot-booked', currentSlot.value)
  modalRef.value?.closeModal()
}

const handleConfirmBlock = async () => {
  if (!currentSlot.value || !blockForm.value.reason) return
  
  isSubmitting.value = true
  
  try {
    const reason = blockForm.value.reason === 'other' 
      ? blockForm.value.customReason 
      : getReasonLabel(blockForm.value.reason)
    
    await scheduleStore.blockTimeSlot(currentSlot.value.id, reason)
    
    emit('slot-blocked', currentSlot.value)
    modalRef.value?.closeModal()
  } catch (error) {
    console.error('Error blocking slot:', error)
  } finally {
    isSubmitting.value = false
  }
}

const handleUnblockSlot = async () => {
  if (!currentSlot.value) return
  
  isSubmitting.value = true
  
  try {
    await scheduleStore.unblockTimeSlot(currentSlot.value.id)
    modalRef.value?.closeModal()
  } catch (error) {
    console.error('Error unblocking slot:', error)
  } finally {
    isSubmitting.value = false
  }
}

const handleEditJob = () => {
  if (!currentSlot.value?.jobId) return
  
  const job = getJobForSlot(currentSlot.value)
  if (job) {
    emit('job-selected', job)
    modalRef.value?.closeModal()
  }
}

const handleRescheduleJob = () => {
  // This would open a reschedule modal
  console.log('Reschedule job:', currentSlot.value?.jobId)
}

const handleCancelJob = () => {
  // This would cancel the job and free the slot
  console.log('Cancel job:', currentSlot.value?.jobId)
}

const handleClose = () => {
  modalRef.value?.closeModal()
}

const handleModalClose = () => {
  currentSlot.value = null
  showBlockingForm.value = false
  isSubmitting.value = false
  resetBlockForm()
}

const formatSlotTime = (slot) => {
  return `${slot.startTime} - ${slot.endTime}`
}

const formatSlotDate = (dateString) => {
  const date = toBuenosAires(dateString + 'T00:00:00')
  return date.format('dddd, D [de] MMMM [de] YYYY')
}

const getSlotStatusClasses = (status) => {
  switch (status) {
    case 'available':
      return 'bg-green-100 text-green-800'
    case 'booked':
      return 'bg-blue-100 text-blue-800'
    case 'blocked':
      return 'bg-red-100 text-red-800'
    case 'break':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getSlotStatusLabel = (status) => {
  const labels = {
    available: 'Disponible',
    booked: 'Agendado',
    blocked: 'Bloqueado',
    break: 'Descanso'
  }
  return labels[status] || status
}

const getJobForSlot = (slot) => {
  if (!slot.jobId) return undefined
  return scheduleStore.jobs.find(job => job.id === slot.jobId)
}

const getBlockedReason = (slot) => {
  const blockedSlot = scheduleStore.blockedSlots.find(blocked => 
    blocked.startDate === slot.date && 
    blocked.startTime === slot.startTime &&
    blocked.technicianId === slot.technicianId
  )
  return blockedSlot?.reason || 'Sin razón especificada'
}

const getReasonLabel = (reason) => {
  const labels = {
    personal: 'Compromiso Personal',
    maintenance: 'Mantenimiento de Equipos',
    travel: 'Tiempo de Viaje',
    sick: 'Enfermedad',
    vacation: 'Vacaciones',
    other: 'Otro'
  }
  return labels[reason] || reason
}

// ==========================================
// EXPOSE METHODS
// ==========================================

defineExpose({
  showModal
})
</script>