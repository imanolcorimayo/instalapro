<template>
  <ModalStructure
    ref="modalRef"
    :title="modalTitle"
    modal-class="max-w-3xl"
    @on-close="handleModalClose"
  >
    <!-- Modal Content -->
    <div
      v-if="currentJob"
      class="space-y-6"
    >
      <!-- Job Status Header -->
      <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div class="flex items-center">
          <Icon
            :name="getJobStatusIcon(currentJob.status)"
            :class="['w-6 h-6 mr-3', getJobStatusIconColor(currentJob.status)]"
          />
          <div>
            <h3 class="text-lg font-semibold text-gray-900">
              {{ currentJob.clientName }}
            </h3>
            <p class="text-sm text-gray-600">
              {{ formatJobDateTime(currentJob.scheduledDate) }}
            </p>
          </div>
        </div>
        
        <div class="flex items-center space-x-3">
          <select
            v-model="editForm.status"
            :class="[
              'px-3 py-1 text-sm font-medium rounded-full border-0',
              getJobStatusClasses(editForm.status)
            ]"
            :disabled="!isEditing"
            @change="handleStatusChange"
          >
            <option value="pending">Pendiente</option>
            <option value="confirmed">Confirmado</option>
            <option value="in_progress">En Proceso</option>
            <option value="completed">Completado</option>
            <option value="cancelled">Cancelado</option>
          </select>
          
          <button
            v-if="!isEditing"
            type="button"
            class="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded hover:bg-blue-200 transition-colors"
            @click="startEditing"
          >
            Editar
          </button>
        </div>
      </div>

      <!-- Job Details -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Client Information -->
        <div class="space-y-4">
          <h4 class="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">
            Información del Cliente
          </h4>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              v-if="isEditing"
              v-model="editForm.clientName"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p
              v-else
              class="text-gray-900"
            >
              {{ currentJob.clientName }}
            </p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Teléfono
            </label>
            <div class="flex items-center space-x-2">
              <input
                v-if="isEditing"
                v-model="editForm.clientPhone"
                type="tel"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p
                v-else
                class="flex-1 text-gray-900"
              >
                {{ currentJob.clientPhone }}
              </p>
              <button
                type="button"
                class="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                @click="openWhatsApp(currentJob.clientPhone)"
              >
                <Icon
                  name="mdi:whatsapp"
                  class="w-5 h-5"
                />
              </button>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Dirección
            </label>
            <textarea
              v-if="isEditing"
              v-model="editForm.address"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p
              v-else
              class="text-gray-900"
            >
              {{ currentJob.address }}
            </p>
          </div>
        </div>

        <!-- Service Information -->
        <div class="space-y-4">
          <h4 class="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">
            Información del Servicio
          </h4>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Servicio
            </label>
            <input
              v-if="isEditing"
              v-model="editForm.serviceType"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p
              v-else
              class="text-gray-900"
            >
              {{ currentJob.serviceType }}
            </p>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Precio
              </label>
              <input
                v-if="isEditing"
                v-model.number="editForm.price"
                type="number"
                min="0"
                step="100"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p
                v-else
                class="text-gray-900 font-semibold"
              >
                ${{ currentJob.price.toLocaleString() }}
              </p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Duración
              </label>
              <input
                v-if="isEditing"
                v-model.number="editForm.estimatedDuration"
                type="number"
                min="30"
                step="30"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p
                v-else
                class="text-gray-900"
              >
                {{ currentJob.estimatedDuration }} minutos
              </p>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Pagado
            </label>
            <div class="flex items-center">
              <input
                v-model="editForm.paid"
                type="checkbox"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                :disabled="!isEditing"
              />
              <span class="ml-2 text-sm text-gray-700">
                {{ editForm.paid ? 'Sí' : 'No' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Schedule Information -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 class="text-sm font-medium text-blue-900 mb-3">
          Información de Agenda
        </h4>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-blue-800 mb-1">
              Fecha y Hora
            </label>
            <input
              v-if="isEditing"
              v-model="editForm.scheduledDateTime"
              type="datetime-local"
              class="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p
              v-else
              class="text-blue-900 font-medium"
            >
              {{ formatJobDateTime(currentJob.scheduledDate) }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-blue-800 mb-1">
              Estado del Slot
            </label>
            <p :class="['font-medium', getSlotStatusColor()]">
              {{ getSlotStatusText() }}
            </p>
          </div>
        </div>
      </div>

      <!-- Description and Notes -->
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Descripción del Trabajo
          </label>
          <textarea
            v-if="isEditing"
            v-model="editForm.description"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p
            v-else
            class="text-gray-900 bg-gray-50 p-3 rounded-md"
          >
            {{ currentJob.description || 'Sin descripción' }}
          </p>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Notas Internas
          </label>
          <textarea
            v-if="isEditing"
            v-model="editForm.notes"
            rows="2"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p
            v-else
            class="text-gray-900 bg-gray-50 p-3 rounded-md"
          >
            {{ currentJob.notes || 'Sin notas' }}
          </p>
        </div>
      </div>

      <!-- Job History -->
      <div class="bg-gray-50 rounded-lg p-4">
        <h4 class="text-sm font-medium text-gray-900 mb-3">
          Historial
        </h4>
        <div class="text-sm text-gray-600 space-y-1">
          <p>
            <span class="font-medium">Creado:</span>
            {{ formatDate(currentJob.createdAt) }}
          </p>
          <p>
            <span class="font-medium">Última actualización:</span>
            {{ formatDate(currentJob.updatedAt) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Modal Footer -->
    <template #footer>
      <div class="flex items-center justify-between w-full">
        <!-- Delete Action -->
        <button
          v-if="!isEditing"
          type="button"
          class="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
          @click="handleDelete"
        >
          Eliminar Trabajo
        </button>
        <div v-else />

        <!-- Main Actions -->
        <div class="flex items-center space-x-3">
          <button
            v-if="isEditing"
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            @click="cancelEditing"
          >
            Cancelar
          </button>
          
          <button
            v-if="isEditing"
            type="button"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            :disabled="isSubmitting"
            @click="handleSave"
          >
            <span v-if="isSubmitting">Guardando...</span>
            <span v-else>Guardar Cambios</span>
          </button>
          
          <button
            v-if="!isEditing"
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            @click="handleClose"
          >
            Cerrar
          </button>
        </div>
      </div>
    </template>

    <!-- Confirmation Dialogs -->
    <ModalStructure
      ref="deleteConfirmModalRef"
      title="Confirmar Eliminación"
      modal-class="max-w-md"
    >
      <div class="text-center py-4">
        <Icon
          name="mdi:alert-circle-outline"
          class="w-12 h-12 text-red-500 mx-auto mb-4"
        />
        <h3 class="text-lg font-semibold text-gray-900 mb-2">
          ¿Eliminar trabajo?
        </h3>
        <p class="text-gray-600">
          Esta acción no se puede deshacer. El trabajo será eliminado permanentemente.
        </p>
      </div>
      
      <template #footer>
        <div class="flex items-center justify-end space-x-3 w-full">
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            @click="cancelDelete"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            :disabled="isDeleting"
            @click="confirmDelete"
          >
            <span v-if="isDeleting">Eliminando...</span>
            <span v-else>Eliminar</span>
          </button>
        </div>
      </template>
    </ModalStructure>
  </ModalStructure>
</template>

<script setup lang="ts">
import type { Job, JobUpdateInput } from '~/types'

// ==========================================
// EMITS
// ==========================================

interface Emits {
  (e: 'job-updated', job: Job): void
  (e: 'job-deleted', jobId: string): void
}

const emit = defineEmits<Emits>()

// ==========================================
// COMPOSABLES
// ==========================================

const scheduleStore = useScheduleStore()

// ==========================================
// REFS
// ==========================================

const modalRef = ref()
const deleteConfirmModalRef = ref()

// ==========================================
// STATE
// ==========================================

const currentJob = ref<Job | null>(null)
const isEditing = ref<boolean>(false)
const isSubmitting = ref<boolean>(false)
const isDeleting = ref<boolean>(false)

const editForm = ref({
  clientName: '',
  clientPhone: '',
  address: '',
  serviceType: '',
  description: '',
  price: 0,
  estimatedDuration: 180,
  status: 'pending' as Job['status'],
  paid: false,
  notes: '',
  scheduledDateTime: ''
})

// ==========================================
// COMPUTED
// ==========================================

const modalTitle = computed(() => {
  if (!currentJob.value) return 'Detalles del Trabajo'
  return isEditing.value ? 'Editar Trabajo' : 'Detalles del Trabajo'
})

// ==========================================
// METHODS
// ==========================================

const showModal = (job: Job): void => {
  currentJob.value = job
  loadJobToForm()
  isEditing.value = false
  modalRef.value?.showModal()
}

const loadJobToForm = (): void => {
  if (!currentJob.value) return
  
  editForm.value = {
    clientName: currentJob.value.clientName,
    clientPhone: currentJob.value.clientPhone,
    address: currentJob.value.address,
    serviceType: currentJob.value.serviceType,
    description: currentJob.value.description,
    price: currentJob.value.price,
    estimatedDuration: currentJob.value.estimatedDuration,
    status: currentJob.value.status,
    paid: currentJob.value.paid,
    notes: currentJob.value.notes,
    scheduledDateTime: formatDateTimeForInput(currentJob.value.scheduledDate)
  }
}

const startEditing = (): void => {
  isEditing.value = true
}

const cancelEditing = (): void => {
  isEditing.value = false
  loadJobToForm() // Reset form
}

const handleSave = async (): Promise<void> => {
  if (!currentJob.value) return
  
  isSubmitting.value = true
  
  try {
    const updates: JobUpdateInput = {
      clientName: editForm.value.clientName,
      clientPhone: editForm.value.clientPhone,
      address: editForm.value.address,
      serviceType: editForm.value.serviceType,
      description: editForm.value.description,
      price: editForm.value.price,
      estimatedDuration: editForm.value.estimatedDuration,
      status: editForm.value.status,
      paid: editForm.value.paid,
      notes: editForm.value.notes
    }
    
    // Handle datetime change
    if (editForm.value.scheduledDateTime) {
      updates.scheduledDate = new Date(editForm.value.scheduledDateTime)
    }
    
    await scheduleStore.updateJob(currentJob.value.id, updates)
    
    // Update current job reference
    const updatedJob = scheduleStore.jobs.find(j => j.id === currentJob.value?.id)
    if (updatedJob) {
      currentJob.value = updatedJob
      emit('job-updated', updatedJob)
    }
    
    isEditing.value = false
  } catch (error) {
    console.error('Error updating job:', error)
  } finally {
    isSubmitting.value = false
  }
}

const handleDelete = (): void => {
  deleteConfirmModalRef.value?.showModal()
}

const confirmDelete = async (): Promise<void> => {
  if (!currentJob.value) return
  
  isDeleting.value = true
  
  try {
    await scheduleStore.deleteJob(currentJob.value.id)
    emit('job-deleted', currentJob.value.id)
    
    deleteConfirmModalRef.value?.closeModal()
    modalRef.value?.closeModal()
  } catch (error) {
    console.error('Error deleting job:', error)
  } finally {
    isDeleting.value = false
  }
}

const cancelDelete = (): void => {
  deleteConfirmModalRef.value?.closeModal()
}

const handleClose = (): void => {
  modalRef.value?.closeModal()
}

const handleModalClose = (): void => {
  currentJob.value = null
  isEditing.value = false
  isSubmitting.value = false
}

const handleStatusChange = (): void => {
  // Could trigger additional logic based on status change
}

const openWhatsApp = (phone: string): void => {
  const cleanPhone = phone.replace(/\D/g, '')
  window.open(`https://wa.me/${cleanPhone}`, '_blank')
}

const formatJobDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const formatDateTimeForInput = (date: Date): string => {
  return date.toISOString().slice(0, 16)
}

const getJobStatusIcon = (status: string): string => {
  const icons = {
    pending: 'mdi:clock-outline',
    confirmed: 'mdi:calendar-check',
    in_progress: 'mdi:progress-clock',
    completed: 'mdi:check-circle',
    cancelled: 'mdi:cancel'
  }
  return icons[status as keyof typeof icons] || 'mdi:help-circle'
}

const getJobStatusIconColor = (status: string): string => {
  const colors = {
    pending: 'text-yellow-500',
    confirmed: 'text-blue-500',
    in_progress: 'text-purple-500',
    completed: 'text-green-500',
    cancelled: 'text-red-500'
  }
  return colors[status as keyof typeof colors] || 'text-gray-500'
}

const getJobStatusClasses = (status: string): string => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

const getSlotStatusColor = (): string => {
  // This would check the actual time slot status
  // For now, return based on job status
  if (!currentJob.value) return 'text-gray-500'
  
  switch (currentJob.value.status) {
    case 'completed':
    case 'cancelled':
      return 'text-gray-500'
    default:
      return 'text-blue-600'
  }
}

const getSlotStatusText = (): string => {
  if (!currentJob.value) return 'Sin información'
  
  switch (currentJob.value.status) {
    case 'completed':
      return 'Trabajo completado'
    case 'cancelled':
      return 'Trabajo cancelado'
    default:
      return 'Slot reservado'
  }
}

// ==========================================
// EXPOSE METHODS
// ==========================================

defineExpose({
  showModal
})
</script>