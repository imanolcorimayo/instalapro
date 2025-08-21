<template>
  <form @submit.prevent="saveClient" class="space-y-4">
    <!-- Name -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        Nombre completo *
      </label>
      <input
        v-model="clientForm.name"
        type="text"
        required
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Juan Pérez"
      />
    </div>

    <!-- Phone -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        Teléfono *
      </label>
      <input
        v-model="clientForm.phone"
        type="tel"
        required
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="+54 11 1234-5678"
      />
    </div>

    <!-- Email -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        Email (opcional)
      </label>
      <input
        v-model="clientForm.email"
        type="email"
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="juan@example.com"
      />
    </div>

    <!-- Address -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        Dirección *
      </label>
      <textarea
        v-model="clientForm.address"
        required
        rows="2"
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Av. Corrientes 1234, CABA"
      />
    </div>

    <!-- Notes -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        Notas (opcional)
      </label>
      <textarea
        v-model="clientForm.notes"
        rows="2"
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Información adicional sobre el cliente..."
      />
    </div>

    <!-- Form Actions -->
    <div class="flex justify-end gap-3 pt-4">
      <button
        type="button"
        @click="$emit('close')"
        class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
      >
        Cancelar
      </button>
      <button
        type="submit"
        :disabled="saving"
        class="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center gap-2"
      >
        <IconLoading 
          v-if="saving" 
          class="w-4 h-4 animate-spin" 
        />
        Crear Cliente
      </button>
    </div>
  </form>
</template>

<script setup>
import IconLoading from '~icons/mdi/loading'

// Props
const props = defineProps({
  initialName: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits(['clientCreated', 'close'])

// Firebase integration
const { add } = useFirestore('clients')

// Component state
const saving = ref(false)

// Form data
const clientForm = ref({
  name: props.initialName,
  phone: '',
  email: '',
  address: '',
  notes: ''
})

// Methods
const saveClient = async () => {
  try {
    saving.value = true
    
    const clientData = {
      name: clientForm.value.name.trim(),
      phone: clientForm.value.phone.trim(),
      email: clientForm.value.email.trim() || undefined,
      address: clientForm.value.address.trim(),
      notes: clientForm.value.notes.trim(),
      totalJobs: 0,
      totalSpent: 0,
      serviceHistory: [],
      preferredServiceTypes: []
    }

    const clientId = await add(clientData)
    
    // Create client object with ID for emission
    const newClient = {
      id: clientId,
      ...clientData,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    useToast().success('Cliente creado exitosamente')
    emit('clientCreated', newClient)
    
  } catch (err) {
    console.error('Error saving client:', err)
    useToast().error('Error al guardar cliente')
  } finally {
    saving.value = false
  }
}

// Auto-focus name field when initialName changes
watch(() => props.initialName, (newName) => {
  clientForm.value.name = newName
}, { immediate: true })
</script>