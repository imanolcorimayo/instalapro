<template>
  <div class="space-y-4">
    <!-- Compact Header -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <div
          v-if="isTestingMode"
          class="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs font-medium border border-purple-200"
        >
          <IconFlaskOutline class="w-4 h-4" />
          Datos demo
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          data-tour-id="reports-demo-toggle"
          type="button"
          @click="toggleTestingData"
          :class="[
            'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors border text-sm',
            isTestingMode
              ? 'bg-purple-600 border-purple-600 text-white hover:bg-purple-500'
              : 'border-purple-500 text-purple-600 hover:bg-purple-50'
          ]"
        >
          <IconFlaskOutline class="w-4 h-4" />
          {{ isTestingMode ? 'Datos reales' : 'Demo' }}
        </button>
        <button
          @click="openAddExpenseModal"
          :class="[
            'flex items-center gap-2 px-3 py-2 text-white rounded-lg transition-colors text-sm',
            isDemoUser ? 'bg-gray-900 hover:bg-gray-900/90' : 'bg-gray-900 hover:bg-gray-800'
          ]"
          :title="isDemoUser ? 'Ingresá con Google para registrar gastos' : 'Agregar un nuevo gasto'"
        >
          <IconWallet class="w-4 h-4" />
          Agregar Gasto
        </button>
      </div>
    </div>

    <!-- Week Selector -->
    <div data-tour-id="reports-week-selector" class="flex items-center justify-center gap-4 bg-white rounded-lg border border-gray-200 p-3">
      <button
        @click="goToPreviousWeek"
        class="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Semana anterior"
      >
        <IconChevronLeft class="w-5 h-5 text-gray-700" />
      </button>

      <div class="text-center min-w-[200px]">
        <div class="text-sm font-semibold text-gray-900">
          {{ formatWeekRange(selectedWeekStart, selectedWeekEnd) }}
        </div>
      </div>

      <button
        @click="goToNextWeek"
        :disabled="isCurrentWeek"
        :class="[
          'p-1.5 rounded-lg transition-colors',
          isCurrentWeek
            ? 'text-gray-300 cursor-not-allowed'
            : 'hover:bg-gray-100 text-gray-700'
        ]"
        aria-label="Semana siguiente"
      >
        <IconChevronRight class="w-5 h-5" />
      </button>
    </div>

    <!-- Tab Navigation -->
    <div
      data-tour-id="reports-tab-navigation"
      class="flex flex-wrap sm:flex-nowrap items-center justify-center gap-1.5 bg-white rounded-lg border border-gray-200 p-1.5 w-full"
    >
      <button
        @click="activeTab = 'resumen'"
        :class="[
          'flex items-center justify-center sm:justify-start gap-1.5 px-3 py-1.5 rounded-lg transition-all font-medium text-sm w-full sm:w-auto',
          activeTab === 'resumen'
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'text-gray-600 hover:bg-gray-100'
        ]"
      >
        <IconChartLine class="w-4 h-4" />
        Resumen
      </button>
      <button
        @click="activeTab = 'trabajos'"
        :class="[
          'flex items-center justify-center sm:justify-start gap-1.5 px-3 py-1.5 rounded-lg transition-all font-medium text-sm w-full sm:w-auto',
          activeTab === 'trabajos'
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'text-gray-600 hover:bg-gray-100'
        ]"
      >
        <IconBriefcase class="w-4 h-4" />
        Trabajos
      </button>
      <button
        @click="activeTab = 'movimientos'"
        :class="[
          'flex items-center justify-center sm:justify-start gap-1.5 px-3 py-1.5 rounded-lg transition-all font-medium text-sm w-full sm:w-auto',
          activeTab === 'movimientos'
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'text-gray-600 hover:bg-gray-100'
        ]"
      >
        <IconWallet class="w-4 h-4" />
        Movimientos
      </button>
    </div>

    <!-- Resumen Tab Content -->
    <div v-if="activeTab === 'resumen'" class="space-y-4">
    <!-- KPI Cards -->
    <section>
      <h2 class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Resumen Semanal</h2>
      <div data-tour-id="reports-kpi-cards" class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <!-- Balance Card -->
        <div class="bg-white rounded-lg border border-gray-200 p-3 hover:border-gray-300 transition-colors">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <IconTrendingUp v-if="balanceChange >= 0" class="w-5 h-5 text-indigo-600" />
              <IconTrendingDown v-else class="w-5 h-5 text-rose-600" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium text-gray-500">Balance Total</p>
              <p class="mt-1 text-2xl font-semibold text-gray-900">
                {{ formatCurrency(currentWeekBalance) }}
              </p>
              <p class="mt-0.5 text-xs" :class="balanceChange >= 0 ? 'text-emerald-600' : 'text-rose-600'">
                {{ balanceChange >= 0 ? '+' : '' }}{{ balanceChange.toFixed(1) }}% vs anterior
              </p>
            </div>
          </div>
        </div>

        <!-- Income Card -->
        <div class="bg-white rounded-lg border border-gray-200 p-3 hover:border-gray-300 transition-colors">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <IconCashMultiple class="w-5 h-5 text-emerald-600" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium text-gray-500">Total Ingresos</p>
              <p class="mt-1 text-2xl font-semibold text-gray-900">
                {{ formatCurrency(currentWeekIncome) }}
              </p>
              <p class="mt-0.5 text-xs" :class="incomeChange >= 0 ? 'text-emerald-600' : 'text-rose-600'">
                {{ incomeChange >= 0 ? '+' : '' }}{{ incomeChange.toFixed(1) }}% vs anterior
              </p>
            </div>
          </div>
        </div>

        <!-- Outcome Card -->
        <div class="bg-white rounded-lg border border-gray-200 p-3 hover:border-gray-300 transition-colors">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <IconCashMinus class="w-5 h-5 text-amber-600" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium text-gray-500">Total Gastos</p>
              <p class="mt-1 text-2xl font-semibold text-gray-900">
                {{ formatCurrency(currentWeekOutcome) }}
              </p>
              <p class="mt-0.5 text-xs" :class="outcomeChange <= 0 ? 'text-emerald-600' : 'text-amber-600'">
                {{ outcomeChange >= 0 ? '+' : '' }}{{ outcomeChange.toFixed(1) }}% vs anterior
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Chart Section -->
    <section>
      <h2 class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Tendencia</h2>
      <div
        data-tour-id="reports-trend-chart"
        :class="[
          'bg-white rounded-lg border border-gray-200 p-3 transition-all duration-300',
          isTestingMode ? 'ring-2 ring-purple-400 shadow-sm' : ''
        ]"
      >
        <div class="h-64">
          <canvas ref="chartCanvas"></canvas>
        </div>
      </div>
    </section>

    <!-- Breakdown Cards -->
    <section>
      <h2 class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Desglose</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <!-- Income by Service -->
        <div
          :class="[
            'bg-white rounded-lg border border-gray-200 p-3 transition-all duration-300',
            isTestingMode ? 'ring-2 ring-purple-400 shadow-sm' : ''
          ]"
        >
          <h3 class="text-sm font-semibold text-gray-900 mb-3">Ingresos por Servicio</h3>
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
                    class="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                    :style="{ width: `${item.percentage}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Expenses by Category -->
        <div
          :class="[
            'bg-white rounded-lg border border-gray-200 p-3 transition-all duration-300',
            isTestingMode ? 'ring-2 ring-purple-400 shadow-sm' : ''
          ]"
        >
          <h3 class="text-sm font-semibold text-gray-900 mb-3">Gastos por Categoría</h3>
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
                    class="bg-amber-500 h-2 rounded-full transition-all duration-300"
                    :style="{ width: `${item.percentage}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    </div>

    <!-- Trabajos Tab Content -->
    <div v-if="activeTab === 'trabajos'">
      <section>
        <h2 class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Trabajos de la Semana</h2>
        <div
          :class="[
            'bg-white rounded-lg border border-gray-200 transition-all duration-300',
            isTestingMode ? 'ring-2 ring-purple-400 shadow-sm' : ''
          ]"
        >
          <!-- Empty State -->
          <div v-if="weekJobs.length === 0" class="text-center py-8">
            <IconBriefcase class="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p class="text-sm text-gray-500">No hay trabajos registrados en esta semana</p>
          </div>

          <!-- Jobs Table -->
          <div v-else class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Servicio</th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr
                  v-for="job in weekJobs"
                  :key="job.id"
                  class="hover:bg-gray-50 transition-colors"
                >
                  <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {{ $dayjs(job.scheduledDate?.toDate ? job.scheduledDate.toDate() : job.scheduledDate).format('DD/MM/YYYY') }}
                  </td>
                  <td class="px-3 py-2 text-sm text-gray-900">
                    {{ job.clientName }}
                  </td>
                  <td class="px-3 py-2 text-sm text-gray-700">
                    {{ job.serviceType }}
                  </td>
                  <td class="px-3 py-2 whitespace-nowrap">
                    <span :class="['px-2 py-1 text-xs font-medium rounded-full', getStatusColor(job.status)]">
                      {{ formatJobStatus(job.status) }}
                    </span>
                  </td>
                  <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-right font-semibold">
                    {{ formatCurrency(job.price || 0) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>

    <!-- Movimientos Tab Content -->
    <div v-if="activeTab === 'movimientos'">
      <section>
        <h2 class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Movimientos de la Semana</h2>
        <div
          :class="[
            'bg-white rounded-lg border border-gray-200 transition-all duration-300',
            isTestingMode ? 'ring-2 ring-purple-400 shadow-sm' : ''
          ]"
        >
          <!-- Empty State -->
          <div v-if="weekWalletEntries.length === 0" class="text-center py-8">
            <IconWallet class="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p class="text-sm text-gray-500">No hay movimientos registrados en esta semana</p>
          </div>

          <!-- Wallet Entries Table -->
          <div v-else class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente/Trabajo</th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notas</th>
                  <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                  <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr
                  v-for="entry in weekWalletEntries"
                  :key="entry.id"
                  class="hover:bg-gray-50 transition-colors"
                >
                  <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {{ $dayjs(entry.date).format('DD/MM/YYYY') }}
                  </td>
                  <td class="px-3 py-2 whitespace-nowrap">
                    <span :class="['px-2 py-1 text-xs font-medium rounded-full', getMovementTypeColor(entry.movementType)]">
                      {{ getMovementTypeLabel(entry.movementType) }}
                    </span>
                  </td>
                  <td class="px-3 py-2">
                    <div v-if="getClientJobInfo(entry).client">
                      <div class="text-sm text-gray-900">{{ getClientJobInfo(entry).client }}</div>
                      <div v-if="getClientJobInfo(entry).job" class="text-xs text-gray-500">{{ getClientJobInfo(entry).job }}</div>
                    </div>
                    <span v-else class="text-sm text-gray-500">-</span>
                  </td>
                  <td class="px-3 py-2 text-sm text-gray-700">
                    {{ formatCategory(entry.category || 'otros') }}
                  </td>
                  <td class="px-3 py-2 text-sm text-gray-600 max-w-xs truncate">
                    {{ entry.notes || '-' }}
                  </td>
                  <td class="px-3 py-2 whitespace-nowrap text-sm text-right font-semibold" :class="entry.movementType === 'income' ? 'text-emerald-600' : 'text-amber-600'">
                    {{ entry.movementType === 'income' ? '+' : '-' }}{{ formatCurrency(entry.amount) }}
                  </td>
                  <td class="px-3 py-2 whitespace-nowrap text-right">
                    <div v-if="entry.movementType === 'outcome' && !entry.isJobIncome" class="flex items-center justify-end gap-2">
                      <button
                        @click="openEditExpenseModal(entry)"
                        :class="[
                          'p-1.5 rounded-lg transition-colors',
                          isDemoUser ? 'text-blue-600 hover:bg-blue-50/80' : 'text-blue-600 hover:bg-blue-50'
                        ]"
                        :title="isDemoUser ? 'Ingresá con Google para editar gastos' : 'Editar gasto'"
                      >
                        <IconPencil class="w-4 h-4" />
                      </button>
                      <button
                        @click="confirmDeleteExpense(entry)"
                        :class="[
                          'p-1.5 rounded-lg transition-colors',
                          isDemoUser ? 'text-red-600 hover:bg-red-50/80' : 'text-red-600 hover:bg-red-50'
                        ]"
                        :title="isDemoUser ? 'Ingresá con Google para eliminar gastos' : 'Eliminar gasto'"
                      >
                        <IconDelete class="w-4 h-4" />
                      </button>
                    </div>
                    <span v-else class="text-gray-400 text-xs">-</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>

    <!-- Wallet Entry Modal -->
    <WalletExpenseModal
      ref="expenseModal"
      :expense="selectedExpense"
      @saved="onExpenseSaved"
    />

    <!-- Reportes Tour -->
    <ReportesTour />
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
import IconChevronLeft from '~icons/mdi/chevron-left'
import IconChevronRight from '~icons/mdi/chevron-right'
import IconTrendingUp from '~icons/mdi/trending-up'
import IconTrendingDown from '~icons/mdi/trending-down'
import IconCashMultiple from '~icons/mdi/cash-multiple'
import IconCashMinus from '~icons/mdi/cash-minus'
import IconFlaskOutline from '~icons/mdi/flask-outline'
import IconChartLine from '~icons/mdi/chart-line'
import IconPencil from '~icons/mdi/pencil'
import IconDelete from '~icons/mdi/delete'
import testingReportesData from '@/utils/demo/reportes-demo-data.json'
import ReportesTour from '~/components/onboarding/ReportesTour.vue'

// Register Chart.js components
Chart.register(...registerables)

const { $dayjs } = useNuxtApp()

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

useSeoMeta({
  title: 'Reportes - InstalaPro Back Office',
  description: 'Análisis de ingresos y gastos de su negocio.',
  robots: 'noindex, nofollow'
})

// Stores
const walletsStore = useWalletsStore()
const clientsStore = useClientsStore()
const jobsStore = useJobsStore()
const { requireFullAccount, isDemoUser } = useDemoAccessGuard()

// Modal ref
const expenseModal = ref(null)
const selectedExpense = ref(null)

// Chart ref
const chartCanvas = ref(null)
let chartInstance = null

const isTestingMode = ref(false)
const testingDataset = hydrateTestingDataset(testingReportesData)

const effectiveJobs = computed(() =>
  isTestingMode.value ? testingDataset.jobs : (jobsStore.jobs || [])
)

const effectiveWallets = computed(() =>
  isTestingMode.value ? testingDataset.wallets : (walletsStore.wallets || [])
)

// Week navigation state
const selectedWeekStart = ref($dayjs().startOf('week').add(1, 'day')) // Monday
const selectedWeekEnd = ref($dayjs().endOf('week').add(1, 'day')) // Sunday

// Tab state
const activeTab = ref('resumen')

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
  const jobs = effectiveJobs.value
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
  const wallets = effectiveWallets.value
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
  const jobs = effectiveJobs.value
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
  const wallets = effectiveWallets.value
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
    const income = effectiveJobs.value
      .filter(job => {
        if (job.status !== 'completed' || job.isActive === false) return false
        if (!job.scheduledDate) return false

        const actualDate = job.scheduledDate.toDate ? job.scheduledDate.toDate() : job.scheduledDate
        const jobDate = $dayjs(actualDate).format('YYYY-MM-DD')

        return jobDate >= startStr && jobDate <= endStr
      })
      .reduce((sum, job) => sum + (job.price || 0), 0)

    // Calculate outcome for this week
    const outcome = effectiveWallets.value
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
  const jobs = effectiveJobs.value
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
      // Group by serviceTypeId for configured services, or by unique identifier for custom services
      // This ensures stable reporting even if service names change
      const groupKey = job.serviceTypeId
        ? job.serviceTypeId
        : (job.isCustomService ? `custom-${job.id}` : job.serviceType || 'Sin especificar')

      const displayName = job.serviceType || 'Sin especificar'

      const existing = serviceMap.get(groupKey) || { name: displayName, total: 0 }
      serviceMap.set(groupKey, { name: displayName, total: existing.total + (job.price || 0) })
    })

  const total = currentWeekIncome.value || 1 // Avoid division by zero

  return Array.from(serviceMap.values())
    .map(({ name, total: amount }) => ({
      serviceType: name,
      total: amount,
      percentage: (amount / total) * 100
    }))
    .sort((a, b) => b.total - a.total)
})

const outcomeByCategory = computed(() => {
  const wallets = effectiveWallets.value
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
// COMPUTED PROPERTIES - TAB DATA
// ==========================================

const weekJobs = computed(() => {
  const jobs = effectiveJobs.value
  const start = selectedWeekStart.value.format('YYYY-MM-DD')
  const end = selectedWeekEnd.value.format('YYYY-MM-DD')

  return jobs
    .filter(job => {
      if (!job.scheduledDate) return false

      const actualDate = job.scheduledDate.toDate ? job.scheduledDate.toDate() : job.scheduledDate
      const jobDate = $dayjs(actualDate).format('YYYY-MM-DD')

      return jobDate >= start && jobDate <= end
    })
    .sort((a, b) => {
      const dateA = a.scheduledDate?.toDate ? a.scheduledDate.toDate() : a.scheduledDate
      const dateB = b.scheduledDate?.toDate ? b.scheduledDate.toDate() : b.scheduledDate
      return $dayjs(dateB).diff($dayjs(dateA))
    })
})

const weekWalletEntries = computed(() => {
  const wallets = effectiveWallets.value
  const jobs = effectiveJobs.value
  const start = selectedWeekStart.value.format('YYYY-MM-DD')
  const end = selectedWeekEnd.value.format('YYYY-MM-DD')

  // Get wallet entries
  const walletEntries = wallets
    .filter(wallet => {
      if (wallet.deletedAt) return false
      const walletDate = $dayjs(wallet.date).format('YYYY-MM-DD')
      return walletDate >= start && walletDate <= end
    })

  // Get completed jobs as income entries
  const jobIncomeEntries = jobs
    .filter(job => {
      if (job.status !== 'completed' || job.isActive === false) return false
      if (!job.scheduledDate) return false

      const actualDate = job.scheduledDate.toDate ? job.scheduledDate.toDate() : job.scheduledDate
      const jobDate = $dayjs(actualDate).format('YYYY-MM-DD')

      return jobDate >= start && jobDate <= end
    })
    .map(job => {
      const actualDate = job.scheduledDate.toDate ? job.scheduledDate.toDate() : job.scheduledDate
      return {
        id: `job-${job.id}`,
        date: $dayjs(actualDate).format('YYYY-MM-DD'),
        movementType: 'income',
        amount: job.price || 0,
        category: 'trabajo',
        notes: `${job.clientName} - ${job.serviceType}`,
        isJobIncome: true
      }
    })

  // Combine and sort by date
  return [...walletEntries, ...jobIncomeEntries]
    .sort((a, b) => $dayjs(b.date).diff($dayjs(a.date)))
})

// ==========================================
// METHODS - TESTING DATA
// ==========================================

const toggleTestingData = () => {
  isTestingMode.value = !isTestingMode.value
  updateChart()
}

function hydrateTestingDataset(source) {
  const baseWeek = $dayjs().startOf('week').add(1, 'day')

  const jobs = (source.jobs || []).map((job) => {
    const weekStart = baseWeek.subtract(job.weekOffset ?? 0, 'week')
    const scheduledDate = weekStart.add(job.dayOffset ?? 0, 'day').toDate()

    return {
      id: job.id,
      status: job.status,
      isActive: job.isActive,
      scheduledDate,
      price: job.price,
      serviceType: job.serviceType,
      clientName: job.clientName,
      clientId: job.clientId
    }
  })

  const wallets = (source.wallets || []).map((wallet) => {
    const weekStart = baseWeek.subtract(wallet.weekOffset ?? 0, 'week')
    const date = weekStart.add(wallet.dayOffset ?? 0, 'day').format('YYYY-MM-DD')

    return {
      id: wallet.id,
      movementType: wallet.movementType,
      deletedAt: null,
      date,
      amount: wallet.amount,
      category: wallet.category,
      notes: wallet.notes
    }
  })

  return { jobs, wallets }
}

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
    trabajo: 'Trabajo',
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

const formatJobStatus = (status) => {
  const statusLabels = {
    pending: 'Pendiente',
    confirmed: 'Confirmado',
    in_progress: 'En Progreso',
    completed: 'Completado',
    cancelled: 'Cancelado'
  }
  return statusLabels[status] || status
}

const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

const getMovementTypeLabel = (type) => {
  return type === 'income' ? 'Ingreso' : 'Gasto'
}

const getMovementTypeColor = (type) => {
  return type === 'income' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
}

const getClientJobInfo = (entry) => {
  // For job income entries, extract client name and service type from notes
  if (entry.isJobIncome) {
    // Notes format: "ClientName - ServiceType"
    const parts = entry.notes?.split(' - ')
    return {
      client: parts?.[0] || null,
      job: parts?.[1] || null
    }
  }

  // For wallet entries with job association
  if (entry.jobId) {
    const job = effectiveJobs.value.find(j => j.id === entry.jobId)
    if (job) {
      return {
        client: job.clientName,
        job: job.serviceType
      }
    }
  }

  // For wallet entries with client association (but no job)
  if (entry.clientId) {
    const client = clientsStore.clients?.find(c => c.id === entry.clientId)
    if (client) {
      return {
        client: client.name,
        job: null
      }
    }
  }

  return { client: null, job: null }
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
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.15,
          fill: true
        },
        {
          label: 'Gastos',
          data: weeklyChartData.value.map(week => week.outcome),
          borderColor: 'rgb(245, 158, 11)',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.15,
          fill: true
        },
        {
          label: 'Balance',
          data: weeklyChartData.value.map(week => week.balance),
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          tension: 0.15,
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
  if (requireFullAccount('registrar gastos')) {
    return
  }

  selectedExpense.value = null
  expenseModal.value?.showModal()
}

const openEditExpenseModal = (expense) => {
  if (requireFullAccount('editar gastos')) {
    return
  }

  selectedExpense.value = expense
  expenseModal.value?.loadExpense(expense)
  expenseModal.value?.showModal()
}

const confirmDeleteExpense = async (expense) => {
  if (requireFullAccount('eliminar gastos')) {
    return
  }

  if (!confirm('¿Está seguro de que desea eliminar este gasto?')) {
    return
  }

  try {
    await walletsStore.deleteWallet(expense.id)
    toast.success('Gasto eliminado exitosamente')
  } catch (error) {
    console.error('Error deleting expense:', error)
    toast.error(error.message || 'Error al eliminar el gasto')
  }
}

const onExpenseSaved = () => {
  selectedExpense.value = null
  updateChart()
}

// ==========================================
// LIFECYCLE
// ==========================================

onMounted(async () => {
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
watch([effectiveJobs, effectiveWallets], () => {
  updateChart()
}, { deep: true })

watch(isTestingMode, () => {
  updateChart()
})

// Watch for tab changes and reinitialize chart when switching to resumen
watch(activeTab, async (newTab) => {
  if (newTab === 'resumen') {
    await nextTick()
    initChart()
  }
})
</script>
