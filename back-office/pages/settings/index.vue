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
          <div class="mt-6 flex items-center justify-between">
            <button
              type="button"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
              @click="openEditProfileModal"
            >
              <IconPencil class="w-4 h-4 mr-2" />
              Editar Perfil
            </button>
            <button
              type="button"
              class="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors border border-red-200"
            >
              Cerrar Cuenta
            </button>
          </div>
        </div>
      </div>



    </div>

    <!-- Edit Profile Modal -->
    <ModalStructure
      ref="editProfileModalRef"
      title="Editar Perfil"
      @on-close="closeEditProfileModal"
    >
      <form @submit.prevent="saveProfile" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Nombre Completo *
            </label>
            <input
              v-model="editForm.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ingrese su nombre completo"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Teléfono *
            </label>
            <input
              v-model="editForm.phone"
              type="tel"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="+54 11 1234-5678"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              v-model="editForm.email"
              type="email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="correo@ejemplo.com"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp *
            </label>
            <input
              v-model="editForm.whatsappNumber"
              type="tel"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="+54 9 11 1234-5678"
            />
          </div>
        </div>
        
        <div class="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            @click="closeEditProfileModal"
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            :disabled="isLoading"
          >
            {{ isLoading ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </div>
      </form>
    </ModalStructure>
  </div>
</template>

<script setup>
// Icons
import IconAlertCircleOutline from '~icons/mdi/alert-circle-outline'
import IconPencil from '~icons/mdi/pencil'

// ==========================================
// PAGE METADATA
// ==========================================

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

// ==========================================
// COMPOSABLES
// ==========================================

const technicianStore = useTechnicianStore()

// ==========================================
// REFS & REACTIVE DATA
// ==========================================

const editProfileModalRef = ref()
const isLoading = ref(false)

const editForm = reactive({
  name: '',
  phone: '',
  email: '',
  whatsappNumber: ''
})

// ==========================================
// METHODS
// ==========================================

const openEditProfileModal = () => {
  if (technicianStore.technician) {
    // Pre-fill form with current data
    editForm.name = technicianStore.technician.name || ''
    editForm.phone = technicianStore.technician.phone || ''
    editForm.email = technicianStore.technician.email || ''
    editForm.whatsappNumber = technicianStore.technician.whatsappNumber || ''
  }
  
  if (editProfileModalRef.value) {
    editProfileModalRef.value.showModal()
  }
}

const closeEditProfileModal = () => {
  if (editProfileModalRef.value) {
    editProfileModalRef.value.closeModal()
  }
}

const saveProfile = async () => {
  try {
    isLoading.value = true
    
    // TODO: Implement update functionality when users collection is ready
    // For now, we'll just close the modal
    console.log('Profile data to save:', editForm)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    closeEditProfileModal()
    
    // Show success message
    // toast.success('Perfil actualizado correctamente')
    
  } catch (error) {
    console.error('Error saving profile:', error)
    // toast.error('Error al actualizar el perfil')
  } finally {
    isLoading.value = false
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