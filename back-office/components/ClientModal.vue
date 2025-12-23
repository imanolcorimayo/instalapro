<template>
<ModalStructure
  ref="clientModal"
  :title="isEditing ? 'Editar Cliente' : 'Nuevo Cliente'"
  @on-close="handleModalClose"
>
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
        @click="closeModal"
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
        {{ isEditing ? 'Guardar Cambios' : 'Crear Cliente' }}
      </button>
    </div>
  </form>
</ModalStructure>
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
const emit = defineEmits(['clientCreated', 'clientUpdated'])

// Store integration
const clientsStore = useClientsStore()

// Modal reference
const clientModal = ref()

// Component state
const saving = ref(false)
const editingClient = ref(null)

// Computed
const isEditing = computed(() => !!editingClient.value)

// Form data
const clientForm = ref({
  name: props.initialName,
  phone: '',
  email: '',
  address: '',
  notes: ''
})

// Methods
const showModal = () => {
  editingClient.value = null
  resetForm()
  clientModal.value?.showModal()
}

const showEditModal = (client) => {
  editingClient.value = client
  clientForm.value = {
    name: client.name || '',
    phone: client.phone || '',
    email: client.email || '',
    address: client.address || '',
    notes: client.notes || ''
  }
  clientModal.value?.showModal()
}

const closeModal = () => {
  clientModal.value?.closeModal()
}

// Called when ModalStructure emits on-close (e.g., user clicks X or backdrop)
const handleModalClose = () => {
  editingClient.value = null
  resetForm()
}

const resetForm = () => {
  clientForm.value = {
    name: props.initialName,
    phone: '',
    email: '',
    address: '',
    notes: ''
  }
}

const saveClient = async () => {
  saving.value = true

  try {
    // Prepare client data
    const clientData = {
      name: clientForm.value.name.trim(),
      phone: clientForm.value.phone.trim(),
      address: clientForm.value.address.trim(),
      email: clientForm.value.email?.trim() || undefined,
      notes: clientForm.value.notes?.trim() || undefined
    }

    if (isEditing.value) {
      // Update existing client
      const clientToUpdate = editingClient.value
      await clientsStore.updateClient(clientToUpdate.id, clientData)
      useToast().success('Cliente actualizado exitosamente')
      closeModal()
      handleModalClose()
      emit('clientUpdated', { ...clientToUpdate, ...clientData })
    } else {
      // Create new client
      let clientCreated = false
      let newClient = null

      try {
        newClient = await clientsStore.createClient(clientData)
        clientCreated = true
      } catch (err) {
        // Check if error is the known Nuxt regex bug (client may still be created)
        const isNuxtRegexBug = err instanceof Error &&
                               err.message.includes('Invalid regular expression') &&
                               err.message.includes('Stack overflow')

        if (isNuxtRegexBug) {
          console.warn('Nuxt regex bug encountered, but client may have been created:', err)
          await clientsStore.loadClients()
          const possibleClient = clientsStore.activeClients.find(
            c => c.name === clientForm.value.name.trim() &&
                 c.phone === clientForm.value.phone.trim()
          )
          if (possibleClient) {
            newClient = possibleClient
            clientCreated = true
          }
        }

        if (!clientCreated) {
          throw err
        }
      }

      if (clientCreated && newClient) {
        useToast().success('Cliente creado exitosamente')
        closeModal()
        handleModalClose()
        emit('clientCreated', newClient)
      }
    }
  } catch (err) {
    console.error('Error saving client:', err)
    useToast().error('Error al guardar cliente')
  } finally {
    saving.value = false
  }
}

// Watch for initialName changes
watch(() => props.initialName, (newName) => {
  clientForm.value.name = newName
}, { immediate: true })

// Expose methods to parent components
defineExpose({
  showModal,
  showEditModal,
  closeModal
})
</script>