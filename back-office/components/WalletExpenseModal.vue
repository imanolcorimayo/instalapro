<template>
  <ModalStructure
    ref="modal"
    :title="isEditMode ? 'Editar Gasto' : 'Agregar Gasto'"
    @on-close="resetForm"
  >
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Association Type Selection -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Asociar con:
        </label>
        <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            type="button"
            @click="form.associationType = 'job'"
            :class="[
              'flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border-2 transition-all text-sm sm:text-base',
              form.associationType === 'job'
                ? 'border-purple-500 bg-purple-50 text-purple-700'
                : 'border-gray-300 bg-white text-gray-700 hover:border-purple-300 hover:bg-purple-50'
            ]"
          >
            <IconBriefcase class="w-4 h-4 sm:w-5 sm:h-5" />
            <span class="font-medium">Trabajo</span>
          </button>
          <button
            type="button"
            @click="form.associationType = 'client'"
            :class="[
              'flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border-2 transition-all text-sm sm:text-base',
              form.associationType === 'client'
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-gray-300 bg-white text-gray-700 hover:border-emerald-300 hover:bg-emerald-50'
            ]"
          >
            <IconAccount class="w-4 h-4 sm:w-5 sm:h-5" />
            <span class="font-medium">Cliente</span>
          </button>
          <button
            type="button"
            @click="form.associationType = 'none'"
            :class="[
              'flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border-2 transition-all text-sm sm:text-base',
              form.associationType === 'none'
                ? 'border-gray-500 bg-gray-100 text-gray-700'
                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
            ]"
          >
            <IconCancel class="w-4 h-4 sm:w-5 sm:h-5" />
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
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
            class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
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
          :class="[
            'flex-1 px-4 py-2 text-white rounded-lg transition-colors font-medium',
            submitting
              ? 'bg-emerald-300 cursor-not-allowed opacity-60'
              : isDemoUser
                ? 'bg-emerald-600 hover:bg-emerald-600/90'
                : 'bg-emerald-600 hover:bg-emerald-700'
          ]"
          :title="isDemoUser ? (isEditMode ? 'Ingresá con Google para editar gastos' : 'Ingresá con Google para registrar gastos') : undefined"
        >
          {{ submitting ? 'Guardando...' : (isEditMode ? 'Actualizar Gasto' : 'Guardar Gasto') }}
        </button>
      </div>
    </form>
  </ModalStructure>
</template>

<script setup>
import { ref, computed } from 'vue'
import { toast } from 'vue3-toastify'
import { useWalletsStore } from '@/stores/wallets'
import { useClientsStore } from '@/stores/clients'
import { useJobsStore } from '@/stores/jobs'
import IconBriefcase from '~icons/mdi/briefcase'
import IconAccount from '~icons/mdi/account'
import IconCancel from '~icons/mdi/cancel'

const { $dayjs } = useNuxtApp()

const walletsStore = useWalletsStore()
const clientsStore = useClientsStore()
const jobsStore = useJobsStore()
const { requireFullAccount, isDemoUser } = useDemoAccessGuard()

// Modal ref
const modal = ref(null)

// Props
const props = defineProps({
  expense: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['saved'])

// State
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

// Computed
const isEditMode = computed(() => !!props.expense)

const todayDate = computed(() => $dayjs().format('YYYY-MM-DD'))

const recentJobs = computed(() => {
  const twoWeeksAgo = $dayjs().subtract(2, 'weeks')
  const jobs = jobsStore.jobs || []

  const filtered = jobs.filter(job => {
    const actualDate = job.scheduledDate?.toDate ? job.scheduledDate.toDate() : job.scheduledDate
    const jobDate = $dayjs(actualDate)
    return jobDate.isAfter(twoWeeksAgo) || jobDate.isSame(twoWeeksAgo, 'day')
  }).sort((a, b) => {
    const dateA = a.scheduledDate?.toDate ? a.scheduledDate.toDate() : a.scheduledDate
    const dateB = b.scheduledDate?.toDate ? b.scheduledDate.toDate() : b.scheduledDate
    return $dayjs(dateB).diff($dayjs(dateA))
  })

  return filtered
})

const allClients = computed(() => {
  const clients = clientsStore.activeClients || []
  return clients
})

const selectedJobClient = computed(() => {
  if (!form.value.selectedJobId) return null
  const job = recentJobs.value.find(j => j.id === form.value.selectedJobId)
  return job ? job.clientName : null
})

// Methods
const showModal = () => {
  modal.value?.showModal()
}

const closeModal = () => {
  modal.value?.closeModal()
}

const resetForm = () => {
  form.value.associationType = 'none'
  form.value.selectedJobId = ''
  form.value.selectedClientId = ''
  form.value.amount = null
  form.value.date = $dayjs().format('YYYY-MM-DD')
  form.value.category = ''
  form.value.notes = ''
}

const loadExpense = (expense) => {
  if (!expense) return

  // Determine association type
  if (expense.jobId) {
    form.value.associationType = 'job'
    form.value.selectedJobId = expense.jobId
  } else if (expense.clientId) {
    form.value.associationType = 'client'
    form.value.selectedClientId = expense.clientId
  } else {
    form.value.associationType = 'none'
  }

  form.value.amount = expense.amount
  form.value.date = $dayjs(expense.date).format('YYYY-MM-DD')
  form.value.category = expense.category || ''
  form.value.notes = expense.notes || ''
}

const formatJobDate = (date) => {
  const actualDate = date?.toDate ? date.toDate() : date
  return $dayjs(actualDate).format('DD/MMM')
}

const onJobSelected = () => {
  if (form.value.selectedJobId) {
    const job = recentJobs.value.find(j => j.id === form.value.selectedJobId)
    if (job) {
      form.value.selectedClientId = job.clientId || ''
    }
  }
}

const handleSubmit = async () => {
  if (requireFullAccount(isEditMode.value ? 'editar gastos' : 'registrar gastos')) {
    return
  }

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
      date: $dayjs(form.value.date).toDate(),
      category: form.value.category,
      notes: form.value.notes || '',
      ...(clientId && { clientId }),
      ...(jobId && { jobId })
    }

    if (isEditMode.value) {
      // Update existing expense
      await walletsStore.updateWallet(props.expense.id, walletData)
      toast.success('Gasto actualizado exitosamente')
    } else {
      // Create new expense
      await walletsStore.createWallet(walletData)
      toast.success('Gasto registrado exitosamente')
    }

    emit('saved')
    closeModal()
    resetForm()
  } catch (error) {
    console.error('Error saving wallet entry:', error)
    toast.error(error.message || 'Error al guardar el gasto')
  } finally {
    submitting.value = false
  }
}

// Expose methods
defineExpose({
  showModal,
  closeModal,
  loadExpense
})
</script>
