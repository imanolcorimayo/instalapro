<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Reportes</h1>
        <p class="text-gray-600 mt-1">Visualice y analice reportes de su negocio.</p>
      </div>

      <button
        @click="openAddExpenseModal"
        class="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors shadow-sm"
      >
        <IconWallet class="w-5 h-5" />
        Agregar Gasto
      </button>
    </div>

    <!-- Wallet Entry Modal -->
    <ModalStructure
      ref="addExpenseModal"
      title="Agregar Gasto"
      @on-close="resetForm"
    >
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Association Type Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Asociar con:
          </label>
          <div class="flex gap-3">
            <button
              type="button"
              @click="form.associationType = 'job'"
              :class="[
                'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all',
                form.associationType === 'job'
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-purple-300 hover:bg-purple-50'
              ]"
            >
              <IconBriefcase class="w-5 h-5" />
              <span class="font-medium">Trabajo</span>
            </button>
            <button
              type="button"
              @click="form.associationType = 'client'"
              :class="[
                'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all',
                form.associationType === 'client'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-emerald-300 hover:bg-emerald-50'
              ]"
            >
              <IconAccount class="w-5 h-5" />
              <span class="font-medium">Cliente</span>
            </button>
            <button
              type="button"
              @click="form.associationType = 'none'"
              :class="[
                'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all',
                form.associationType === 'none'
                  ? 'border-gray-500 bg-gray-100 text-gray-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
              ]"
            >
              <IconCancel class="w-5 h-5" />
              <span class="font-medium">Ninguno</span>
            </button>
          </div>
        </div>

        <!-- Job Selection (when associationType is 'job') -->
        <div v-if="form.associationType === 'job'">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Trabajo *
          </label>

          <!-- Loading state -->
          <div v-if="jobsStore.loading" class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm">
            Cargando trabajos...
          </div>

          <!-- No jobs available -->
          <div v-else-if="recentJobs.length === 0" class="w-full px-3 py-2 border border-yellow-300 rounded-lg bg-yellow-50 text-yellow-700 text-sm">
            No hay trabajos recientes (últimas 2 semanas)
          </div>

          <!-- Jobs dropdown -->
          <select
            v-else
            v-model="form.selectedJobId"
            @change="onJobSelected"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Seleccionar trabajo...</option>
            <option
              v-for="job in recentJobs"
              :key="job.id"
              :value="job.id"
            >
              {{ formatJobDate(job.scheduledDate) }} - {{ job.clientName }} - {{ job.serviceType }}
            </option>
          </select>

          <!-- Auto-populated Client Display -->
          <div v-if="form.selectedJobId && selectedJobClient" class="mt-2 p-2 bg-purple-50 rounded text-sm text-purple-700 border border-purple-200">
            <IconAccount class="w-4 h-4 inline mr-1" />
            Cliente: {{ selectedJobClient }}
          </div>
        </div>

        <!-- Client Selection (when associationType is 'client') -->
        <div v-if="form.associationType === 'client'">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Cliente *
          </label>

          <!-- Loading state -->
          <div v-if="clientsStore.loading" class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm">
            Cargando clientes...
          </div>

          <!-- No clients available -->
          <div v-else-if="allClients.length === 0" class="w-full px-3 py-2 border border-yellow-300 rounded-lg bg-yellow-50 text-yellow-700 text-sm">
            No hay clientes registrados. Por favor, agregue clientes primero.
          </div>

          <!-- Clients dropdown -->
          <select
            v-else
            v-model="form.selectedClientId"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="">Seleccionar cliente...</option>
            <option
              v-for="client in allClients"
              :key="client.id"
              :value="client.id"
            >
              {{ client.name }}
            </option>
          </select>
        </div>

        <!-- Amount -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Monto *
          </label>
          <div class="relative">
            <span class="absolute left-3 top-2 text-gray-500">$</span>
            <input
              type="number"
              v-model.number="form.amount"
              required
              min="0"
              step="0.01"
              placeholder="0.00"
              class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <!-- Date -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Fecha *
          </label>
          <input
            type="date"
            v-model="form.date"
            required
            :max="todayDate"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <!-- Category -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Categoría *
          </label>
          <select
            v-model="form.category"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Seleccionar categoría...</option>
            <option value="materiales">Materiales</option>
            <option value="herramientas">Herramientas</option>
            <option value="transporte">Transporte</option>
            <option value="combustible">Combustible</option>
            <option value="repuestos">Repuestos</option>
            <option value="subcontratacion">Subcontratación</option>
            <option value="otros">Otros</option>
          </select>
        </div>

        <!-- Notes -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Notas
          </label>
          <textarea
            v-model="form.notes"
            rows="3"
            placeholder="Información adicional sobre el gasto..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          ></textarea>
        </div>

        <!-- Form Actions -->
        <div class="flex gap-3 pt-4">
          <button
            type="button"
            @click="closeModal"
            class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="submitting"
            class="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {{ submitting ? 'Guardando...' : 'Guardar Gasto' }}
          </button>
        </div>
      </form>
    </ModalStructure>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { toast } from 'vue3-toastify'
import { useWalletsStore } from '@/stores/wallets'
import { useClientsStore } from '@/stores/clients'
import { useJobsStore } from '@/stores/jobs'
import IconWallet from '~icons/mdi/wallet'
import IconBriefcase from '~icons/mdi/briefcase'
import IconAccount from '~icons/mdi/account'
import IconCancel from '~icons/mdi/cancel'

const { $dayjs } = useNuxtApp()

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

useSeoMeta({
  title: 'Reportes - InstalarPro Back Office',
  description: 'Visualice y analice reportes de su negocio.',
  robots: 'noindex, nofollow'
})

// Stores
const walletsStore = useWalletsStore()
const clientsStore = useClientsStore()
const jobsStore = useJobsStore()

// Modal ref
const addExpenseModal = ref(null)

// Form state
const form = ref({
  associationType: 'none',
  selectedJobId: '',
  selectedClientId: '',
  amount: null,
  date: '',
  category: '',
  notes: ''
})

const submitting = ref(false)

// Computed properties
const todayDate = computed(() => $dayjs().format('YYYY-MM-DD'))

const recentJobs = computed(() => {
  const twoWeeksAgo = $dayjs().subtract(2, 'weeks')
  const jobs = jobsStore.jobs || []

  const filtered = jobs.filter(job => {
    // Handle Firestore Timestamp objects
    const actualDate = job.scheduledDate?.toDate ? job.scheduledDate.toDate() : job.scheduledDate
    const jobDate = $dayjs(actualDate)
    return jobDate.isAfter(twoWeeksAgo) || jobDate.isSame(twoWeeksAgo, 'day')
  }).sort((a, b) => {
    // Handle Firestore Timestamp objects in sort
    const dateA = a.scheduledDate?.toDate ? a.scheduledDate.toDate() : a.scheduledDate
    const dateB = b.scheduledDate?.toDate ? b.scheduledDate.toDate() : b.scheduledDate
    return $dayjs(dateB).diff($dayjs(dateA))
  })

  console.log('Recent jobs:', filtered.length, 'out of', jobs.length, 'total jobs')
  return filtered
})

const allClients = computed(() => {
  const clients = clientsStore.activeClients || []
  console.log('Active clients:', clients.length)
  return clients
})

const selectedJobClient = computed(() => {
  if (!form.value.selectedJobId) return null
  const job = recentJobs.value.find(j => j.id === form.value.selectedJobId)
  return job ? job.clientName : null
})

// Methods
const formatJobDate = (date) => {
  // Handle Firestore Timestamp objects
  const actualDate = date?.toDate ? date.toDate() : date
  return $dayjs(actualDate).format('DD/MMM')
}

const openAddExpenseModal = () => {
  addExpenseModal.value?.showModal()
}

const closeModal = () => {
  addExpenseModal.value?.closeModal()
}

const resetForm = () => {
  form.value = {
    associationType: 'none',
    selectedJobId: '',
    selectedClientId: '',
    amount: null,
    date: $dayjs().format('YYYY-MM-DD'),
    category: '',
    notes: ''
  }
}

const onJobSelected = () => {
  // When a job is selected, automatically set the client info
  if (form.value.selectedJobId) {
    const job = recentJobs.value.find(j => j.id === form.value.selectedJobId)
    if (job) {
      form.value.selectedClientId = job.clientId || ''
    }
  }
}

const handleSubmit = async () => {
  try {
    submitting.value = true

    // Prepare wallet data based on association type
    let clientId = null
    let jobId = null

    if (form.value.associationType === 'job') {
      const job = recentJobs.value.find(j => j.id === form.value.selectedJobId)
      jobId = form.value.selectedJobId
      clientId = job?.clientId || null
    } else if (form.value.associationType === 'client') {
      clientId = form.value.selectedClientId
    }

    const walletData = {
      amount: form.value.amount,
      date: form.value.date,
      category: form.value.category,
      notes: form.value.notes || '',
      ...(clientId && { clientId }),
      ...(jobId && { jobId })
    }

    await walletsStore.createWallet(walletData)

    toast.success('Gasto registrado exitosamente')
    closeModal()
    resetForm()
  } catch (error) {
    console.error('Error creating wallet entry:', error)
    toast.error(error.message || 'Error al registrar el gasto')
  } finally {
    submitting.value = false
  }
}

// Initialize
onMounted(async () => {
  // Set default date to today
  form.value.date = $dayjs().format('YYYY-MM-DD')

  // Load required data
  await Promise.all([
    clientsStore.initialize(),
    jobsStore.initialize()
  ])
})
</script>
