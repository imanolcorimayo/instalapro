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
      v-if="techniciansStore.loading"
      class="flex items-center justify-center py-12"
    >
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
        <p class="text-gray-500">Cargando configuración...</p>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="techniciansStore.error"
      class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
    >
      <div class="flex">
        <IconAlertCircleOutline class="w-5 h-5 text-red-400 mt-0.5" />
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">
            Error
          </h3>
          <p class="text-sm text-red-700 mt-1">
            {{ techniciansStore.error }}
          </p>
          <button
            @click="techniciansStore.clearError"
            class="text-sm text-red-600 underline mt-2"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>

    <!-- Profile Setup Banner -->
    <div
      v-else-if="!techniciansStore.technician"
      class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6"
    >
      <div class="flex items-start">
        <IconInformationOutline class="w-6 h-6 text-blue-600 mt-1" />
        <div class="ml-4 flex-1">
          <h3 class="text-lg font-semibold text-blue-900 mb-2">
            ¡Bienvenido a InstalarPro!
          </h3>
          <p class="text-blue-800 mb-4">
            Para comenzar a usar la plataforma, necesitas completar tu perfil profesional.
            Esta información será utilizada para gestionar tu negocio y generar tu página de reservas personalizada.
          </p>
          <button
            @click="openSetupModal"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Completar Perfil
          </button>
        </div>
      </div>
    </div>

    <!-- Account Deactivated Banner -->
    <div
      v-else-if="techniciansStore.technician && techniciansStore.isAccountDeactivated"
      class="bg-red-50 border border-red-200 rounded-lg p-6 mb-6"
    >
      <div class="flex items-start">
        <IconAccountCancel class="w-6 h-6 text-red-600 mt-1" />
        <div class="ml-4 flex-1">
          <h3 class="text-lg font-semibold text-red-900 mb-2">
            Cuenta Desactivada
          </h3>
          <p class="text-red-800 mb-2">
            Tu cuenta fue desactivada el {{ formatDeactivationDate }}.
          </p>
          <p class="text-red-700 text-sm mb-4">
            Mientras tu cuenta esté desactivada, tu perfil estará oculto y no recibirás nuevas reservas.
          </p>
          <button
            @click="handleReactivateAccount"
            :disabled="isReactivating"
            class="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {{ isReactivating ? 'Reactivando...' : 'Reactivar Cuenta' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Incomplete Profile Banner -->
    <div
      v-else-if="techniciansStore.technician && !techniciansStore.hasRequiredInfo"
      class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6"
    >
      <div class="flex items-start">
        <IconAlertOutline class="w-6 h-6 text-yellow-600 mt-1" />
        <div class="ml-4 flex-1">
          <h3 class="text-lg font-semibold text-yellow-900 mb-2">
            Información Requerida Faltante
          </h3>
          <p class="text-yellow-800 mb-4">
            Tu perfil necesita información básica (nombre y teléfono) para funcionar correctamente.
          </p>
          <button
            @click="openEditProfileModal"
            class="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors"
          >
            Completar Ahora
          </button>
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
            v-if="techniciansStore.technician"
            class="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Nombre Completo
              </label>
              <p class="text-gray-900">
                {{ techniciansStore.technician.name }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <p class="text-gray-900">
                {{ techniciansStore.technician.phone }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Email Principal
              </label>
              <p class="text-gray-900">
                {{ techniciansStore.technician.email }}
                <span class="text-xs text-gray-500 ml-2">(desde cuenta Google)</span>
              </p>
            </div>
            <div v-if="techniciansStore.technician.secondaryEmail">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Email Secundario
              </label>
              <p class="text-gray-900">
                {{ techniciansStore.technician.secondaryEmail }}
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
              @click="openCloseAccountModal"
              class="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors border border-red-200 flex items-center"
            >
              <IconAccountCancel class="w-4 h-4 mr-2" />
              Desactivar cuenta
            </button>
          </div>
        </div>
      </div>

      <!-- Service Types Section -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">
            Tipos de Servicio
          </h2>
          <p class="text-sm text-gray-600 mt-1">
            Configura los servicios que ofreces con sus precios y duraciones
          </p>
        </div>
        <div class="px-6 py-4">
          <!-- Service Types List -->
          <div v-if="serviceTypesStore.loading" class="text-center py-4">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2" />
            <p class="text-sm text-gray-500">Cargando servicios...</p>
          </div>
          
          <div v-else-if="serviceTypesStore.activeServiceTypes.length === 0" class="text-center py-8">
            <IconToolbox class="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              No tienes servicios configurados
            </h3>
            <p class="text-gray-600 mb-4">
              Agrega los tipos de servicio que ofreces para agilizar la creación de trabajos
            </p>
            <button
              @click="openNewServiceModal"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Agregar Primer Servicio
            </button>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="service in serviceTypesStore.activeServiceTypes"
              :key="service.id"
              class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div class="flex-1">
                <div class="flex items-center gap-3">
                  <h4 class="font-medium text-gray-900">{{ service.name }}</h4>
                  <span class="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                    {{ service.category }}
                  </span>
                </div>
                <p v-if="service.description" class="text-sm text-gray-600 mt-1">
                  {{ service.description }}
                </p>
                <div class="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span class="flex items-center gap-1">
                    <IconCurrencyUsd class="w-4 h-4" />
                    ${{ service.basePrice.toLocaleString() }}
                  </span>
                  <span class="flex items-center gap-1">
                    <IconClock class="w-4 h-4" />
                    {{ Math.round(service.estimatedDuration / 60) }}h {{ service.estimatedDuration % 60 }}min
                  </span>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button
                  @click="editService(service)"
                  class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Editar servicio"
                >
                  <IconPencil class="w-4 h-4" />
                </button>
                <button
                  @click="deleteService(service)"
                  class="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar servicio"
                >
                  <IconDelete class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div v-if="serviceTypesStore.activeServiceTypes.length > 0" class="mt-4 pt-4 border-t border-gray-200">
            <button
              @click="openNewServiceModal"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <IconPlus class="w-4 h-4" />
              Agregar Servicio
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
              v-model="currentForm.name"
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
              v-model="currentForm.phone"
              type="tel"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="+54 11 1234-5678"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Email Principal
            </label>
            <input
              :value="authStore.userEmail"
              type="email"
              disabled
              class="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
              placeholder="correo@ejemplo.com"
            />
            <p class="text-xs text-gray-500 mt-1">
              Este email viene de tu cuenta de Google y no se puede cambiar
            </p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Email Secundario (Opcional)
            </label>
            <input
              v-model="currentForm.secondaryEmail"
              type="email"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="otro@ejemplo.com"
            />
            <p class="text-xs text-gray-500 mt-1">
              Email adicional para recibir notificaciones
            </p>
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

    <!-- Close Account Modal -->
    <ModalStructure
      ref="closeAccountModalRef"
      title="Desactivar cuenta"
      @on-close="closeCloseAccountModal"
    >
      <div class="space-y-4">
        <div class="flex items-start space-x-3">
          <IconAccountCancel class="w-6 h-6 text-red-500 mt-1" />
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              ¿Estás seguro que deseas desactivar tu cuenta?
            </h3>
            <p class="text-sm text-gray-600 mb-4">
              Esta acción marcará tu cuenta como inactiva. Podrás reactivarla más tarde contactando a soporte.
            </p>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• Tu perfil será ocultado</li>
              <li>• No recibirás nuevas reservas</li>
              <li>• Tus datos se mantendrán seguros</li>
            </ul>
          </div>
        </div>
        
        <div class="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            @click="closeCloseAccountModal"
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            @click="handleCloseAccount"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            :disabled="isClosingAccount"
          >
            {{ isClosingAccount ? 'Desactivando...' : 'Desactivar cuenta' }}
          </button>
        </div>
      </div>
    </ModalStructure>

    <!-- Service Type Modal -->
    <ModalStructure
      ref="serviceModalRef"
      :title="editingService ? 'Editar Servicio' : 'Nuevo Servicio'"
      @on-close="closeServiceModal"
    >
      <form @submit.prevent="saveService" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Servicio *
            </label>
            <input
              v-model="serviceForm.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="ej. Instalación de Split 3500 BTU"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Categoría *
            </label>
            <input
              v-model="serviceForm.category"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="ej. Instalación, Mantenimiento, Reparación"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Precio Base *
            </label>
            <div class="relative">
              <span class="absolute left-3 top-2 text-gray-500">$</span>
              <input
                v-model="serviceForm.basePrice"
                type="number"
                min="0"
                step="100"
                required
                class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Duración (minutos) *
            </label>
            <input
              v-model="serviceForm.estimatedDuration"
              type="number"
              min="15"
              max="480"
              step="15"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="120"
            />
            <p class="text-xs text-gray-500 mt-1">
              Entre 15 minutos y 8 horas ({{ Math.round((serviceForm.estimatedDuration || 0) / 60) }}h {{ (serviceForm.estimatedDuration || 0) % 60 }}min)
            </p>
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Descripción (Opcional)
            </label>
            <textarea
              v-model="serviceForm.description"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Descripción detallada del servicio..."
            />
          </div>
        </div>

        <div class="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            @click="closeServiceModal"
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            :disabled="isSavingService"
          >
            {{ isSavingService ? 'Guardando...' : editingService ? 'Actualizar' : 'Crear Servicio' }}
          </button>
        </div>
      </form>
    </ModalStructure>
  </div>
</template>

<script setup>
// Icons
import IconAlertCircleOutline from '~icons/mdi/alert-circle-outline'
import IconInformationOutline from '~icons/mdi/information-outline'
import IconAlertOutline from '~icons/mdi/alert-outline'
import IconPencil from '~icons/mdi/pencil'
import IconAccountCancel from '~icons/mdi/account-cancel'
import IconToolbox from '~icons/mdi/toolbox'
import IconCurrencyUsd from '~icons/mdi/currency-usd'
import IconClock from '~icons/mdi/clock-outline'
import IconDelete from '~icons/mdi/delete'
import IconPlus from '~icons/mdi/plus'

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

const techniciansStore = useTechniciansStore()
const serviceTypesStore = useServiceTypesStore()
const authStore = useAuthStore()

// ==========================================
// REFS & REACTIVE DATA
// ==========================================

const editProfileModalRef = ref()
const closeAccountModalRef = ref()
const serviceModalRef = ref()
const isLoading = ref(false)
const isClosingAccount = ref(false)
const isReactivating = ref(false)
const isSavingService = ref(false)
const editingService = ref(null)

// Form for editing/creating profile
const editForm = reactive({
  name: '',
  phone: '',
  secondaryEmail: ''
})

// Form for initial setup
const setupForm = reactive({
  name: '',
  phone: '',
  secondaryEmail: ''
})

// Form for service types
const serviceForm = reactive({
  name: '',
  description: '',
  basePrice: '',
  estimatedDuration: 120,
  category: ''
})

// ==========================================
// COMPUTED PROPERTIES
// ==========================================

const currentForm = computed(() => {
  return techniciansStore.technician ? editForm : setupForm
})

const formatDeactivationDate = computed(() => {
  if (!techniciansStore.deactivationDate) return ''
  
  const date = new Date(techniciansStore.deactivationDate)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})

// ==========================================
// METHODS - MODAL MANAGEMENT
// ==========================================

const openSetupModal = () => {
  // Reset setup form
  setupForm.name = ''
  setupForm.phone = ''
  setupForm.secondaryEmail = ''
  
  if (editProfileModalRef.value) {
    editProfileModalRef.value.showModal()
  }
}

const openEditProfileModal = () => {
  if (techniciansStore.technician) {
    // Pre-fill form with current data
    editForm.name = techniciansStore.technician.name || ''
    editForm.phone = techniciansStore.technician.phone || ''
    editForm.secondaryEmail = techniciansStore.technician.secondaryEmail || ''
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

const openCloseAccountModal = () => {
  if (closeAccountModalRef.value) {
    closeAccountModalRef.value.showModal()
  }
}

const closeCloseAccountModal = () => {
  if (closeAccountModalRef.value) {
    closeAccountModalRef.value.closeModal()
  }
}

// ==========================================
// METHODS - FORM HANDLERS
// ==========================================

const saveProfile = async () => {
  try {
    isLoading.value = true
    
    const isSetup = !techniciansStore.technician
    let success = false

    if (isSetup) {
      // Creating new technician profile
      success = await techniciansStore.createTechnician({
        name: setupForm.name,
        phone: setupForm.phone,
        secondaryEmail: setupForm.secondaryEmail || undefined
      })
    } else {
      // Updating existing profile
      success = await techniciansStore.updateProfile({
        name: editForm.name,
        phone: editForm.phone,
        secondaryEmail: editForm.secondaryEmail || undefined
      })
    }
    
    if (success) {
      closeEditProfileModal()
      // Toast notification would go here
      console.log('Perfil guardado correctamente')
    }
    
  } catch (error) {
    console.error('Error saving profile:', error)
    // Toast error notification would go here
  } finally {
    isLoading.value = false
  }
}

const handleCloseAccount = async () => {
  try {
    isClosingAccount.value = true
    
    const success = await techniciansStore.closeAccount()
    
    if (success) {
      closeCloseAccountModal()
      console.log('Cuenta desactivada correctamente')
      // Toast notification would go here
    }
    
  } catch (error) {
    console.error('Error closing account:', error)
    // Toast error notification would go here
  } finally {
    isClosingAccount.value = false
  }
}

const handleReactivateAccount = async () => {
  try {
    isReactivating.value = true
    
    const success = await techniciansStore.reactivateAccount()
    
    if (success) {
      console.log('Cuenta reactivada correctamente')
      // Toast notification would go here
    }
    
  } catch (error) {
    console.error('Error reactivating account:', error)
    // Toast error notification would go here
  } finally {
    isReactivating.value = false
  }
}

// ==========================================
// METHODS - SERVICE TYPES
// ==========================================

const openNewServiceModal = () => {
  editingService.value = null
  serviceForm.name = ''
  serviceForm.description = ''
  serviceForm.basePrice = ''
  serviceForm.estimatedDuration = 120
  serviceForm.category = ''
  
  if (serviceModalRef.value) {
    serviceModalRef.value.showModal()
  }
}

const editService = (service) => {
  editingService.value = service
  serviceForm.name = service.name
  serviceForm.description = service.description || ''
  serviceForm.basePrice = service.basePrice.toString()
  serviceForm.estimatedDuration = service.estimatedDuration
  serviceForm.category = service.category
  
  if (serviceModalRef.value) {
    serviceModalRef.value.showModal()
  }
}

const closeServiceModal = () => {
  editingService.value = null
  if (serviceModalRef.value) {
    serviceModalRef.value.closeModal()
  }
}

const saveService = async () => {
  try {
    isSavingService.value = true
    
    const serviceData = {
      name: serviceForm.name.trim(),
      description: serviceForm.description.trim() || undefined,
      basePrice: parseFloat(serviceForm.basePrice),
      estimatedDuration: parseInt(serviceForm.estimatedDuration),
      category: serviceForm.category.trim()
    }
    
    let success = false
    
    if (editingService.value) {
      // Updating existing service
      success = await serviceTypesStore.updateServiceType(editingService.value.id, serviceData)
    } else {
      // Creating new service
      success = await serviceTypesStore.createServiceType(serviceData)
    }
    
    if (success) {
      closeServiceModal()
      console.log('Servicio guardado correctamente')
    }
    
  } catch (error) {
    console.error('Error saving service:', error)
  } finally {
    isSavingService.value = false
  }
}

const deleteService = async (service) => {
  if (!confirm(`¿Estás seguro de eliminar el servicio "${service.name}"?`)) {
    return
  }
  
  try {
    const success = await serviceTypesStore.deleteServiceType(service.id)
    
    if (success) {
      console.log('Servicio eliminado correctamente')
    }
    
  } catch (error) {
    console.error('Error deleting service:', error)
  }
}

// ==========================================
// LIFECYCLE
// ==========================================

onMounted(async () => {
  // Initialize technicians store
  await techniciansStore.initialize()
  // Initialize service types store
  await serviceTypesStore.initialize()
})
</script>