<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Reportes</h1>
        <p class="text-sm text-gray-500 mt-1">Análisis de ingresos y gastos de su negocio</p>
      </div>

      <button
        @click="openAddExpenseModal"
        class="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors"
      >
        <IconWallet class="w-5 h-5" />
        Agregar Gasto
      </button>
    </div>

    <!-- Week Selector -->
    <div class="flex items-center justify-center gap-4 bg-white rounded-lg border border-gray-200 p-4">
      <button
        @click="goToPreviousWeek"
        class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Semana anterior"
      >
        <IconChevronLeft class="w-5 h-5 text-gray-700" />
      </button>

      <div class="text-center min-w-[240px]">
        <div class="text-xs font-medium text-gray-500">Período</div>
        <div class="text-sm font-semibold text-gray-900 mt-0.5">
          {{ formatWeekRange(selectedWeekStart, selectedWeekEnd) }}
        </div>
      </div>

      <button
        @click="goToNextWeek"
        :disabled="isCurrentWeek"
        :class="[
          'p-2 rounded-lg transition-colors',
          isCurrentWeek
            ? 'text-gray-300 cursor-not-allowed'
            : 'hover:bg-gray-100 text-gray-700'
        ]"
        aria-label="Semana siguiente"
      >
        <IconChevronRight class="w-5 h-5" />
      </button>
    </div>

    <!-- KPI Cards -->
    <section>
      <h2 class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Resumen Semanal</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <!-- Balance Card -->
        <div class="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <IconTrendingUp v-if="balanceChange >= 0" class="w-5 h-5 text-blue-600" />
              <IconTrendingDown v-else class="w-5 h-5 text-red-600" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium text-gray-500">Balance Total</p>
              <p class="mt-1 text-2xl font-semibold text-gray-900">
                {{ formatCurrency(currentWeekBalance) }}
              </p>
              <p class="mt-0.5 text-xs" :class="balanceChange >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ balanceChange >= 0 ? '+' : '' }}{{ balanceChange.toFixed(1) }}% vs anterior
              </p>
            </div>
          </div>
        </div>

        <!-- Income Card -->
        <div class="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <IconCashMultiple class="w-5 h-5 text-green-600" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium text-gray-500">Total Ingresos</p>
              <p class="mt-1 text-2xl font-semibold text-gray-900">
                {{ formatCurrency(currentWeekIncome) }}
              </p>
              <p class="mt-0.5 text-xs" :class="incomeChange >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ incomeChange >= 0 ? '+' : '' }}{{ incomeChange.toFixed(1) }}% vs anterior
              </p>
            </div>
          </div>
        </div>

        <!-- Outcome Card -->
        <div class="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <IconCashMinus class="w-5 h-5 text-red-600" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium text-gray-500">Total Gastos</p>
              <p class="mt-1 text-2xl font-semibold text-gray-900">
                {{ formatCurrency(currentWeekOutcome) }}
              </p>
              <p class="mt-0.5 text-xs" :class="outcomeChange <= 0 ? 'text-green-600' : 'text-red-600'">
                {{ outcomeChange >= 0 ? '+' : '' }}{{ outcomeChange.toFixed(1) }}% vs anterior
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Chart Section -->
    <section>
      <h2 class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Tendencia</h2>
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="h-80">
          <canvas ref="chartCanvas"></canvas>
        </div>
      </div>
    </section>

    <!-- Breakdown Cards -->
    <section>
      <h2 class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Desglose</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <!-- Income by Service -->
        <div class="bg-white rounded-lg border border-gray-200 p-4">
          <h3 class="text-sm font-semibold text-gray-900 mb-4">Ingresos por Servicio</h3>
          <div v-if="incomeByService.length === 0" class="text-center py-8">
            <p class="text-sm text-gray-500">No hay ingresos registrados</p>
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="item in incomeByService"
              :key="item.serviceType"
              class="flex items-center justify-between"
            >
              <div class="flex-1">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs font-medium text-gray-700">{{ item.serviceType }}</span>
                  <span class="text-xs font-semibold text-gray-900">{{ formatCurrency(item.total) }}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-green-500 h-2 rounded-full transition-all duration-300"
                    :style="{ width: `${item.percentage}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Expenses by Category -->
        <div class="bg-white rounded-lg border border-gray-200 p-4">
          <h3 class="text-sm font-semibold text-gray-900 mb-4">Gastos por Categoría</h3>
          <div v-if="outcomeByCategory.length === 0" class="text-center py-8">
            <p class="text-sm text-gray-500">No hay gastos registrados</p>
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="item in outcomeByCategory"
              :key="item.category"
              class="flex items-center justify-between"
            >
              <div class="flex-1">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs font-medium text-gray-700">{{ item.category }}</span>
                  <span class="text-xs font-semibold text-gray-900">{{ formatCurrency(item.total) }}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-red-500 h-2 rounded-full transition-all duration-300"
                    :style="{ width: `${item.percentage}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

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
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { toast } from 'vue3-toastify'
import { Chart, registerables } from 'chart.js'
import { useWalletsStore } from '@/stores/wallets'
import { useClientsStore } from '@/stores/clients'
import { useJobsStore } from '@/stores/jobs'
import IconWallet from '~icons/mdi/wallet'
import IconBriefcase from '~icons/mdi/briefcase'
import IconAccount from '~icons/mdi/account'
import IconCancel from '~icons/mdi/cancel'
import IconChevronLeft from '~icons/mdi/chevron-left'
import IconChevronRight from '~icons/mdi/chevron-right'
import IconTrendingUp from '~icons/mdi/trending-up'
import IconTrendingDown from '~icons/mdi/trending-down'
import IconCashMultiple from '~icons/mdi/cash-multiple'
import IconCashMinus from '~icons/mdi/cash-minus'

// Register Chart.js components
Chart.register(...registerables)

const { $dayjs } = useNuxtApp()

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

useSeoMeta({
  title: 'Reportes - InstalarPro Back Office',
  description: 'Análisis de ingresos y gastos de su negocio.',
  robots: 'noindex, nofollow'
})

// Stores
const walletsStore = useWalletsStore()
const clientsStore = useClientsStore()
const jobsStore = useJobsStore()

// Modal ref
const addExpenseModal = ref(null)

// Chart ref
const chartCanvas = ref(null)
let chartInstance = null

// Week navigation state
const selectedWeekStart = ref($dayjs().startOf('week').add(1, 'day')) // Monday
const selectedWeekEnd = ref($dayjs().endOf('week').add(1, 'day')) // Sunday

// Form state (for wallet modal)
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

// ==========================================
// COMPUTED PROPERTIES - WEEK NAVIGATION
// ==========================================

const isCurrentWeek = computed(() => {
  const thisWeekStart = $dayjs().startOf('week').add(1, 'day')
  return selectedWeekStart.value.isSame(thisWeekStart, 'day')
})

// ==========================================
// COMPUTED PROPERTIES - CURRENT WEEK METRICS
// ==========================================

const currentWeekIncome = computed(() => {
  const jobs = jobsStore.jobs || []
  const start = selectedWeekStart.value.format('YYYY-MM-DD')
  const end = selectedWeekEnd.value.format('YYYY-MM-DD')

  return jobs
    .filter(job => {
      if (job.status !== 'completed' || job.isActive === false) return false
      if (!job.scheduledDate) return false

      const actualDate = job.scheduledDate.toDate ? job.scheduledDate.toDate() : job.scheduledDate
      const jobDate = $dayjs(actualDate).format('YYYY-MM-DD')

      return jobDate >= start && jobDate <= end
    })
    .reduce((sum, job) => sum + (job.price || 0), 0)
})

const currentWeekOutcome = computed(() => {
  const wallets = walletsStore.wallets || []
  const start = selectedWeekStart.value.format('YYYY-MM-DD')
  const end = selectedWeekEnd.value.format('YYYY-MM-DD')

  return wallets
    .filter(wallet => {
      if (wallet.movementType !== 'outcome' || wallet.deletedAt) return false
      const walletDate = $dayjs(wallet.date).format('YYYY-MM-DD')
      return walletDate >= start && walletDate <= end
    })
    .reduce((sum, wallet) => sum + wallet.amount, 0)
})

const currentWeekBalance = computed(() => {
  return currentWeekIncome.value - currentWeekOutcome.value
})

// ==========================================
// COMPUTED PROPERTIES - PREVIOUS WEEK METRICS
// ==========================================

const previousWeekStart = computed(() => {
  return selectedWeekStart.value.subtract(1, 'week')
})

const previousWeekEnd = computed(() => {
  return selectedWeekEnd.value.subtract(1, 'week')
})

const previousWeekIncome = computed(() => {
  const jobs = jobsStore.jobs || []
  const start = previousWeekStart.value.format('YYYY-MM-DD')
  const end = previousWeekEnd.value.format('YYYY-MM-DD')

  return jobs
    .filter(job => {
      if (job.status !== 'completed' || job.isActive === false) return false
      if (!job.scheduledDate) return false

      const actualDate = job.scheduledDate.toDate ? job.scheduledDate.toDate() : job.scheduledDate
      const jobDate = $dayjs(actualDate).format('YYYY-MM-DD')

      return jobDate >= start && jobDate <= end
    })
    .reduce((sum, job) => sum + (job.price || 0), 0)
})

const previousWeekOutcome = computed(() => {
  const wallets = walletsStore.wallets || []
  const start = previousWeekStart.value.format('YYYY-MM-DD')
  const end = previousWeekEnd.value.format('YYYY-MM-DD')

  return wallets
    .filter(wallet => {
      if (wallet.movementType !== 'outcome' || wallet.deletedAt) return false
      const walletDate = $dayjs(wallet.date).format('YYYY-MM-DD')
      return walletDate >= start && walletDate <= end
    })
    .reduce((sum, wallet) => sum + wallet.amount, 0)
})

const previousWeekBalance = computed(() => {
  return previousWeekIncome.value - previousWeekOutcome.value
})

// ==========================================
// COMPUTED PROPERTIES - CHANGE PERCENTAGES
// ==========================================

const incomeChange = computed(() => {
  if (previousWeekIncome.value === 0) {
    return currentWeekIncome.value > 0 ? 100 : 0
  }
  return ((currentWeekIncome.value - previousWeekIncome.value) / previousWeekIncome.value) * 100
})

const outcomeChange = computed(() => {
  if (previousWeekOutcome.value === 0) {
    return currentWeekOutcome.value > 0 ? 100 : 0
  }
  return ((currentWeekOutcome.value - previousWeekOutcome.value) / previousWeekOutcome.value) * 100
})

const balanceChange = computed(() => {
  if (previousWeekBalance.value === 0) {
    return currentWeekBalance.value > 0 ? 100 : 0
  }
  return ((currentWeekBalance.value - previousWeekBalance.value) / Math.abs(previousWeekBalance.value)) * 100
})

// ==========================================
// COMPUTED PROPERTIES - CHART DATA
// ==========================================

const weeklyChartData = computed(() => {
  const weeks = []
  const weeksToShow = 8

  for (let i = weeksToShow - 1; i >= 0; i--) {
    const weekStart = selectedWeekStart.value.subtract(i, 'week')
    const weekEnd = selectedWeekEnd.value.subtract(i, 'week')
    const startStr = weekStart.format('YYYY-MM-DD')
    const endStr = weekEnd.format('YYYY-MM-DD')

    // Calculate income for this week
    const income = (jobsStore.jobs || [])
      .filter(job => {
        if (job.status !== 'completed' || job.isActive === false) return false
        if (!job.scheduledDate) return false

        const actualDate = job.scheduledDate.toDate ? job.scheduledDate.toDate() : job.scheduledDate
        const jobDate = $dayjs(actualDate).format('YYYY-MM-DD')

        return jobDate >= startStr && jobDate <= endStr
      })
      .reduce((sum, job) => sum + (job.price || 0), 0)

    // Calculate outcome for this week
    const outcome = (walletsStore.wallets || [])
      .filter(wallet => {
        if (wallet.movementType !== 'outcome' || wallet.deletedAt) return false
        const walletDate = $dayjs(wallet.date).format('YYYY-MM-DD')
        return walletDate >= startStr && walletDate <= endStr
      })
      .reduce((sum, wallet) => sum + wallet.amount, 0)

    weeks.push({
      label: `${weekStart.format('DD/MM')} - ${weekEnd.format('DD/MM')}`,
      income,
      outcome,
      balance: income - outcome
    })
  }

  return weeks
})

// ==========================================
// COMPUTED PROPERTIES - BREAKDOWNS
// ==========================================

const incomeByService = computed(() => {
  const jobs = jobsStore.jobs || []
  const start = selectedWeekStart.value.format('YYYY-MM-DD')
  const end = selectedWeekEnd.value.format('YYYY-MM-DD')

  const serviceMap = new Map()

  jobs
    .filter(job => {
      if (job.status !== 'completed' || job.isActive === false) return false
      if (!job.scheduledDate) return false

      const actualDate = job.scheduledDate.toDate ? job.scheduledDate.toDate() : job.scheduledDate
      const jobDate = $dayjs(actualDate).format('YYYY-MM-DD')

      return jobDate >= start && jobDate <= end
    })
    .forEach(job => {
      const serviceType = job.serviceType || 'Sin especificar'
      const existing = serviceMap.get(serviceType) || 0
      serviceMap.set(serviceType, existing + (job.price || 0))
    })

  const total = currentWeekIncome.value || 1 // Avoid division by zero

  return Array.from(serviceMap.entries())
    .map(([serviceType, amount]) => ({
      serviceType,
      total: amount,
      percentage: (amount / total) * 100
    }))
    .sort((a, b) => b.total - a.total)
})

const outcomeByCategory = computed(() => {
  const wallets = walletsStore.wallets || []
  const start = selectedWeekStart.value.format('YYYY-MM-DD')
  const end = selectedWeekEnd.value.format('YYYY-MM-DD')

  const categoryMap = new Map()

  wallets
    .filter(wallet => {
      if (wallet.movementType !== 'outcome' || wallet.deletedAt) return false
      const walletDate = $dayjs(wallet.date).format('YYYY-MM-DD')
      return walletDate >= start && walletDate <= end
    })
    .forEach(wallet => {
      const category = wallet.category || 'otros'
      const existing = categoryMap.get(category) || 0
      categoryMap.set(category, existing + wallet.amount)
    })

  const total = currentWeekOutcome.value || 1 // Avoid division by zero

  return Array.from(categoryMap.entries())
    .map(([category, amount]) => ({
      category: formatCategory(category),
      total: amount,
      percentage: (amount / total) * 100
    }))
    .sort((a, b) => b.total - a.total)
})

// ==========================================
// COMPUTED PROPERTIES - WALLET MODAL
// ==========================================

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

// ==========================================
// METHODS - WEEK NAVIGATION
// ==========================================

const goToPreviousWeek = () => {
  selectedWeekStart.value = selectedWeekStart.value.subtract(1, 'week')
  selectedWeekEnd.value = selectedWeekEnd.value.subtract(1, 'week')
}

const goToNextWeek = () => {
  if (!isCurrentWeek.value) {
    selectedWeekStart.value = selectedWeekStart.value.add(1, 'week')
    selectedWeekEnd.value = selectedWeekEnd.value.add(1, 'week')
  }
}

// ==========================================
// METHODS - FORMATTING
// ==========================================

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

const formatWeekRange = (start, end) => {
  return `${start.format('DD/MM/YYYY')} - ${end.format('DD/MM/YYYY')}`
}

const formatCategory = (category) => {
  const categoryNames = {
    materiales: 'Materiales',
    herramientas: 'Herramientas',
    transporte: 'Transporte',
    combustible: 'Combustible',
    repuestos: 'Repuestos',
    subcontratacion: 'Subcontratación',
    otros: 'Otros'
  }
  return categoryNames[category] || category
}

const formatJobDate = (date) => {
  const actualDate = date?.toDate ? date.toDate() : date
  return $dayjs(actualDate).format('DD/MMM')
}

// ==========================================
// METHODS - CHART
// ==========================================

const initChart = () => {
  if (!chartCanvas.value) return

  // Destroy existing chart
  if (chartInstance) {
    chartInstance.destroy()
  }

  const ctx = chartCanvas.value.getContext('2d')

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: weeklyChartData.value.map(week => week.label),
      datasets: [
        {
          label: 'Ingresos',
          data: weeklyChartData.value.map(week => week.income),
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Gastos',
          data: weeklyChartData.value.map(week => week.outcome),
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Balance',
          data: weeklyChartData.value.map(week => week.balance),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || ''
              if (label) {
                label += ': '
              }
              label += formatCurrency(context.parsed.y)
              return label
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return formatCurrency(value)
            }
          }
        }
      }
    }
  })
}

const updateChart = () => {
  if (!chartInstance) return

  chartInstance.data.labels = weeklyChartData.value.map(week => week.label)
  chartInstance.data.datasets[0].data = weeklyChartData.value.map(week => week.income)
  chartInstance.data.datasets[1].data = weeklyChartData.value.map(week => week.outcome)
  chartInstance.data.datasets[2].data = weeklyChartData.value.map(week => week.balance)

  chartInstance.update()
}

// ==========================================
// METHODS - WALLET MODAL
// ==========================================

const openAddExpenseModal = () => {
  addExpenseModal.value?.showModal()
}

const closeModal = () => {
  addExpenseModal.value?.closeModal()
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

const onJobSelected = () => {
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
      date: $dayjs(form.value.date).toDate(), // Convert string to Date object
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

// ==========================================
// LIFECYCLE
// ==========================================

onMounted(async () => {
  // Set default date to today
  form.value.date = $dayjs().format('YYYY-MM-DD')

  // Load required data
  await Promise.all([
    clientsStore.initialize(),
    jobsStore.initialize(),
    walletsStore.initialize()
  ])

  // Initialize chart after data is loaded
  await nextTick()
  initChart()
})

// Watch for week changes and update chart
watch([selectedWeekStart, selectedWeekEnd], () => {
  updateChart()
})

// Watch for data changes and update chart
watch([() => jobsStore.jobs, () => walletsStore.wallets], () => {
  updateChart()
}, { deep: true })
</script>
