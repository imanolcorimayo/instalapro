<template>
  <div>
    <!-- Header Actions -->
    <div class="flex justify-end mb-6">
      <button
        @click="openAddClientModal"
        class="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
      >
        <IconPlus class="w-4 h-4" />
        <span class="hidden sm:inline">Agregar Cliente</span>
        <span class="sm:hidden">Agregar</span>
      </button>
    </div>

    <!-- Search Bar -->
    <div class="mb-6">
      <div class="relative">
        <IconSearch class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar clientes por nombre, teléfono o dirección..."
          class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <IconLoading class="w-8 h-8 animate-spin text-blue-500" />
      <span class="ml-2 text-gray-600">Cargando clientes...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div class="flex items-center gap-2">
        <IconAlertCircle class="text-red-500 w-5 h-5" />
        <p class="text-red-700 font-medium">Error al cargar clientes</p>
      </div>
      <p class="text-red-600 mt-1 text-sm">{{ error }}</p>
      <button
        @click="loadClients"
        class="mt-2 text-red-600 hover:text-red-800 text-sm underline"
      >
        Intentar nuevamente
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredClients.length === 0 && !searchQuery" class="text-center py-12">
      <IconAccountGroup class="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">No hay clientes registrados</h3>
      <p class="text-gray-600 mb-4">Comience agregando su primer cliente para gestionar su base de datos.</p>
      <button
        @click="openAddClientModal"
        class="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg inline-flex items-center gap-2"
      >
        <IconPlus class="w-4 h-4" />
        Agregar Primer Cliente
      </button>
    </div>

    <!-- No Search Results -->
    <div v-else-if="filteredClients.length === 0 && searchQuery" class="text-center py-12">
      <IconSearchOff class="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">Sin resultados</h3>
      <p class="text-gray-600">No se encontraron clientes que coincidan con "{{ searchQuery }}"</p>
    </div>

    <!-- Clients Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <div
        v-for="client in filteredClients"
        :key="client.id"
        class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
      >
        <!-- Client Header -->
        <div class="flex items-start justify-between mb-3">
          <div class="flex-1 min-w-0">
            <h3 class="font-medium text-gray-900 truncate">{{ client.name }}</h3>
            <p class="text-sm text-gray-600 truncate">{{ client.address }}</p>
          </div>
          <div class="flex items-center gap-1 ml-2">
            <button
              @click="openWhatsApp(client.phone)"
              class="p-1.5 text-green-500 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
              :title="`WhatsApp: ${client.phone}`"
            >
              <IconWhatsapp class="w-4 h-4" />
            </button>
            <button
              @click="editClient(client)"
              class="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
              title="Editar cliente"
            >
              <IconEdit class="w-4 h-4" />
            </button>
            <button
              @click="deleteClient(client.id, client.name)"
              class="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
              title="Eliminar cliente"
            >
              <IconDelete class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Contact Info -->
        <div class="space-y-1 mb-3">
          <div class="flex items-center gap-2 text-sm">
            <IconPhone class="w-4 h-4 text-gray-400" />
            <span class="text-gray-700">{{ client.phone }}</span>
          </div>
          <div v-if="client.email" class="flex items-center gap-2 text-sm">
            <IconEmail class="w-4 h-4 text-gray-400" />
            <span class="text-gray-700 truncate">{{ client.email }}</span>
          </div>
        </div>

        <!-- Stats -->
        <div class="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
          <span>{{ client.totalJobs || 0 }} trabajos</span>
          <span>${{ formatPrice(client.totalSpent) }}</span>
          <span>{{ $dayjs(client.createdAt).format('MMM YYYY') }}</span>
        </div>
      </div>
    </div>

    <!-- Add/Edit Client Modal -->
    <ClientModal
      ref="clientModal"
      @client-created="onClientCreated"
    />
  </div>
</template>

<script setup>
import IconPlus from '~icons/mdi/plus'
import IconSearch from '~icons/mdi/magnify'
import IconLoading from '~icons/mdi/loading'
import IconAlertCircle from '~icons/mdi/alert-circle'
import IconAccountGroup from '~icons/mdi/account-group'
import IconSearchOff from '~icons/mdi/magnify-close'
import IconWhatsapp from '~icons/mdi/whatsapp'
import IconEdit from '~icons/mdi/pencil'
import IconDelete from '~icons/mdi/delete'
import IconPhone from '~icons/mdi/phone'
import IconEmail from '~icons/mdi/email'
import { formatPrice } from '@/utils'

// Page meta
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

useSeoMeta({
  title: 'Clientes - InstalarPro Back Office',
  description: 'Administre su base de datos de clientes e historial de servicios.',
  robots: 'noindex, nofollow'
})

// Store integration
const clientsStore = useClientsStore()
const { clients, loading, error } = storeToRefs(clientsStore)

// Component state
const searchQuery = ref('')
const clientModal = ref()

// Computed
const filteredClients = computed(() => {
  if (!searchQuery.value.trim()) {
    return clients.value
  }
  
  const query = searchQuery.value.toLowerCase().trim()
  return clients.value.filter(client =>
    client.name.toLowerCase().includes(query) ||
    client.phone.includes(query) ||
    client.address.toLowerCase().includes(query) ||
    (client.email && client.email.toLowerCase().includes(query))
  )
})

// Methods
const loadClients = async () => {
  try {
    await clientsStore.loadClients()
  } catch (err) {
    console.error('Error loading clients:', err)
    useToast().error('Error al cargar clientes')
  }
}

const openAddClientModal = () => {
  clientModal.value?.showModal()
}

const onClientCreated = (newClient) => {
  // Client was created successfully, no need to reload as store is already updated
  console.log('Client created:', newClient.name)
}

const editClient = (client) => {
  // TODO: Implement edit functionality in ClientModal.vue
  // For now, we'll keep the current approach until ClientModal supports editing
  useToast().info('Funcionalidad de edición próximamente disponible')
}

const deleteClient = async (clientId, clientName) => {
  if (!confirm(`¿Está seguro de eliminar al cliente "${clientName}"?`)) {
    return
  }

  try {
    await clientsStore.deleteClient(clientId)
    useToast().success('Cliente eliminado exitosamente')
  } catch (err) {
    console.error('Error deleting client:', err)
    useToast().error('Error al eliminar cliente')
  }
}

const openWhatsApp = (phone) => {
  const cleanPhone = phone.replace(/[^\d+]/g, '')
  const whatsappUrl = `https://wa.me/${cleanPhone}`
  window.open(whatsappUrl, '_blank')
}

// Initialize store on mount
onMounted(async () => {
  await clientsStore.initialize()
})
</script>