<template>
  <div class="max-w-4xl mx-auto p-6">
    <div class="bg-white rounded-lg shadow-md p-6">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Firebase Integration Test</h1>
      
      <!-- Connection Status -->
      <div class="mb-6">
        <div class="flex items-center gap-3">
          <IconCheckCircle 
            v-if="isConfigured"
            class="w-6 h-6 text-green-500"
          />
          <IconAlertCircle 
            v-else
            class="w-6 h-6 text-red-500"
          />
          <span :class="isConfigured ? 'text-green-700' : 'text-red-700'" class="font-medium">
            Firebase {{ isConfigured ? 'Configured' : 'Not Configured' }}
          </span>
        </div>
        
        <div v-if="!isConfigured" class="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <p class="text-red-700 text-sm">
            Please update your .env file with your Firebase configuration values.
          </p>
        </div>
      </div>

      <!-- Test Technician Form -->
      <div v-if="isConfigured" class="space-y-6">
        <div class="border-t pt-6">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">Test Technician Creation</h2>
          
          <form @submit.prevent="createTestTechnician" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  v-model="testTechnician.name"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Juan Pérez"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  v-model="testTechnician.phone"
                  type="tel"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+54 11 1234-5678"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  v-model="testTechnician.email"
                  type="email"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="juan@example.com"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Zona de Servicio
                </label>
                <input
                  v-model="testTechnician.serviceArea"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="CABA, Zona Norte"
                />
              </div>
            </div>
            
            <button
              type="submit"
              :disabled="loading"
              class="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center gap-2"
            >
              <IconLoading 
                v-if="loading" 
                class="w-4 h-4 animate-spin" 
              />
              <IconPlus 
                v-else 
                class="w-4 h-4" 
              />
              {{ loading ? 'Creando...' : 'Crear Técnico de Prueba' }}
            </button>
          </form>
        </div>

        <!-- Technicians List -->
        <div class="border-t pt-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-800">Técnicos en Firestore</h2>
            <button
              @click="loadTechnicians"
              :disabled="loading"
              class="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white text-sm py-1 px-3 rounded transition-colors flex items-center gap-1"
            >
              <IconRefresh class="w-4 h-4" />
              Actualizar
            </button>
          </div>
          
          <div v-if="technicians.length === 0 && !loading" class="text-gray-500 text-center py-8">
            No hay técnicos registrados. Crea uno para probar la conexión.
          </div>
          
          <div v-if="technicians.length > 0" class="space-y-3">
            <div
              v-for="technician in technicians"
              :key="technician.id"
              class="bg-gray-50 p-4 rounded-md border border-gray-200"
            >
              <div class="flex items-start justify-between">
                <div>
                  <h3 class="font-medium text-gray-800">{{ technician.name }}</h3>
                  <p class="text-sm text-gray-600">{{ technician.email }}</p>
                  <p class="text-sm text-gray-600">{{ technician.phone }}</p>
                  <p class="text-sm text-gray-600">Zona: {{ technician.serviceArea?.join(', ') || 'No especificada' }}</p>
                  <p class="text-xs text-gray-500 mt-1">
                    Creado: {{ $dayjs(technician.createdAt).format('DD/MM/YYYY HH:mm') }}
                  </p>
                </div>
                <button
                  @click="deleteTechnician(technician.id)"
                  class="text-red-500 hover:text-red-700 transition-colors"
                >
                  <IconDelete class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Error Display -->
        <div v-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
          <div class="flex items-center gap-2">
            <IconAlertCircle class="text-red-500 w-5 h-5" />
            <p class="text-red-700 font-medium">Error:</p>
          </div>
          <p class="text-red-600 mt-1">{{ error }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { isFirebaseConfigured } from '~/utils/firebase'
import IconCheckCircle from '~icons/mdi/check-circle'
import IconAlertCircle from '~icons/mdi/alert-circle'
import IconLoading from '~icons/mdi/loading'
import IconPlus from '~icons/mdi/plus'
import IconRefresh from '~icons/mdi/refresh'
import IconDelete from '~icons/mdi/delete'

// Page meta
definePageMeta({
  layout: 'default'
})

// Component state
const isConfigured = isFirebaseConfigured()
const { data: technicians, loading, error, add, list, remove } = useFirestore('technicians')

// Form data
const testTechnician = ref({
  name: '',
  phone: '',
  email: '',
  serviceArea: ''
})

// Create test technician
const createTestTechnician = async () => {
  try {
    const serviceAreaArray = testTechnician.value.serviceArea
      .split(',')
      .map(area => area.trim())
      .filter(area => area.length > 0)

    await add({
      name: testTechnician.value.name,
      phone: testTechnician.value.phone,
      email: testTechnician.value.email,
      serviceArea: serviceAreaArray
    })

    // Reset form
    testTechnician.value = {
      name: '',
      phone: '',
      email: '',
      serviceArea: ''
    }

    // Reload technicians
    await loadTechnicians()
    
    // Show success message
    useToast().success('Técnico creado exitosamente')
  } catch (err) {
    console.error('Error creating technician:', err)
    useToast().error('Error al crear técnico')
  }
}

// Load technicians
const loadTechnicians = async () => {
  try {
    await list()
  } catch (err) {
    console.error('Error loading technicians:', err)
  }
}

// Delete technician
const deleteTechnician = async (id) => {
  try {
    await remove(id)
    await loadTechnicians()
    useToast().success('Técnico eliminado')
  } catch (err) {
    console.error('Error deleting technician:', err)
    useToast().error('Error al eliminar técnico')
  }
}

// Load technicians on mount
onMounted(() => {
  if (isConfigured) {
    loadTechnicians()
  }
})
</script>