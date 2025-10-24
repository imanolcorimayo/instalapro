<template>
  <div>
    <!-- Loading State -->
    <div v-if="dashboardStore.loading" class="flex items-center justify-center py-24">
      <div class="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
    </div>

    <!-- Dashboard Content -->
    <div v-else class="space-y-6">
      <!-- Today's Priority -->
      <section>
        <h2 class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Hoy</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <!-- Jobs Today -->
          <div class="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <IconCalendar class="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p class="text-xs font-medium text-gray-500">Trabajos</p>
                <p class="mt-1 text-2xl font-semibold text-gray-900">{{ dashboardStore.jobsToday }}</p>
              </div>
            </div>
          </div>

          <!-- Next Job -->
          <div class="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors md:col-span-2">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <IconClockOutline class="w-5 h-5 text-blue-600" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-medium text-gray-500">Próximo Trabajo</p>
                <div v-if="dashboardStore.nextJob" class="mt-1">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ dashboardStore.nextJob.clientName }}</p>
                  <p class="text-xs text-gray-600 truncate">{{ dashboardStore.nextJob.serviceType }}</p>
                  <p class="text-xs text-gray-500 mt-0.5">{{ formatJobTime(dashboardStore.nextJob) }}</p>
                </div>
                <p v-else class="mt-1 text-sm text-gray-400">Sin trabajos programados</p>
              </div>
            </div>
          </div>

          <!-- Pending Confirmation -->
          <div class="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <IconAlertCircle class="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p class="text-xs font-medium text-gray-500">Pendientes</p>
                <p class="mt-1 text-2xl font-semibold text-gray-900">{{ dashboardStore.pendingJobs }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- This Week -->
      <section>
        <h2 class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Esta Semana</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <!-- Jobs This Week -->
          <div class="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <IconCalendarWeek class="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p class="text-xs font-medium text-gray-500">Trabajos</p>
                <p class="mt-1 text-2xl font-semibold text-gray-900">{{ dashboardStore.jobsThisWeek }}</p>
              </div>
            </div>
          </div>

          <!-- Revenue This Week -->
          <div class="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <IconCurrencyDollar class="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p class="text-xs font-medium text-gray-500">Ingresos</p>
                <p class="mt-1 text-2xl font-semibold text-gray-900">{{ formatCurrency(dashboardStore.revenueThisWeek) }}</p>
              </div>
            </div>
          </div>

          <!-- Available Hours This Week -->
          <div class="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <IconClockCheck class="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p class="text-xs font-medium text-gray-500">Horas Disponibles</p>
                <p class="mt-1 text-2xl font-semibold text-gray-900">{{ dashboardStore.availableHoursThisWeek }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Financial Overview & Business Insights -->
      <section>
        <h2 class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Este Mes</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <!-- Revenue This Month -->
          <div class="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <IconTrendingUp class="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p class="text-xs font-medium text-gray-500">Ingresos</p>
                <p class="mt-1 text-2xl font-semibold text-gray-900">{{ formatCurrency(dashboardStore.revenueThisMonth) }}</p>
              </div>
            </div>
          </div>

          <!-- Jobs Growth -->
          <div class="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors">
            <div class="flex items-center gap-3">
              <div :class="dashboardStore.jobsThisMonth >= dashboardStore.jobsLastMonth ? 'bg-green-50' : 'bg-red-50'"
                   class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0">
                <IconChartLine :class="dashboardStore.jobsThisMonth >= dashboardStore.jobsLastMonth ? 'text-green-600' : 'text-red-600'"
                               class="w-5 h-5" />
              </div>
              <div>
                <p class="text-xs font-medium text-gray-500">Trabajos</p>
                <div class="mt-1 flex items-baseline gap-1">
                  <p class="text-2xl font-semibold text-gray-900">{{ dashboardStore.jobsThisMonth }}</p>
                  <span class="text-sm text-gray-500">/</span>
                  <span class="text-sm text-gray-500">{{ dashboardStore.jobsLastMonth }}</span>
                </div>
                <p class="mt-0.5 text-xs text-gray-500">vs. mes anterior</p>
              </div>
            </div>
          </div>

          <!-- New Clients -->
          <div class="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <IconUserPlus class="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p class="text-xs font-medium text-gray-500">Nuevos Clientes</p>
                <p class="mt-1 text-2xl font-semibold text-gray-900">{{ dashboardStore.newClientsThisMonth }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Quick Actions -->
      <section>
        <h2 class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Acciones Rápidas</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            @click="navigateTo('/schedule')"
            class="group bg-gray-100 rounded-lg border border-gray-200 p-4 hover:border-gray-900 hover:bg-gray-900 transition-all duration-200 text-left"
          >
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium text-gray-900 group-hover:text-white transition-colors">Nuevo Trabajo</h3>
                <p class="mt-0.5 text-xs text-gray-600 group-hover:text-gray-300 transition-colors">Agendar una nueva cita</p>
              </div>
              <div class="w-8 h-8 bg-white group-hover:bg-white/10 rounded-lg flex items-center justify-center transition-colors">
                <IconPlus class="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
              </div>
            </div>
          </button>

          <button
            @click="navigateTo('/schedule')"
            class="group bg-gray-100 rounded-lg border border-gray-200 p-4 hover:border-gray-900 hover:bg-gray-900 transition-all duration-200 text-left"
          >
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium text-gray-900 group-hover:text-white transition-colors">Ver Agenda</h3>
                <p class="mt-0.5 text-xs text-gray-600 group-hover:text-gray-300 transition-colors">Gestionar horarios</p>
              </div>
              <div class="w-8 h-8 bg-white group-hover:bg-white/10 rounded-lg flex items-center justify-center transition-colors">
                <IconCalendarMonth class="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
              </div>
            </div>
          </button>

          <button
            @click="navigateTo('/clients')"
            class="group bg-gray-100 rounded-lg border border-gray-200 p-4 hover:border-gray-900 hover:bg-gray-900 transition-all duration-200 text-left"
          >
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium text-gray-900 group-hover:text-white transition-colors">Nuevo Cliente</h3>
                <p class="mt-0.5 text-xs text-gray-600 group-hover:text-gray-300 transition-colors">Agregar al registro</p>
              </div>
              <div class="w-8 h-8 bg-white group-hover:bg-white/10 rounded-lg flex items-center justify-center transition-colors">
                <IconUserPlus class="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
              </div>
            </div>
          </button>
        </div>
      </section>

      <!-- Recent Activity -->
      <section>
        <h2 class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Actividad Reciente</h2>
        <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div v-if="dashboardStore.recentActivity.length === 0" class="p-8 text-center">
            <IconInbox class="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p class="text-sm text-gray-500">No hay actividad reciente</p>
          </div>
          <div v-else class="divide-y divide-gray-100">
            <div
              v-for="activity in dashboardStore.recentActivity"
              :key="activity.id"
              class="p-4 hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center gap-3">
                <div :class="`bg-${activity.color}-50`" class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
                  <component :is="getIcon(activity.icon)" :class="`text-${activity.color}-600`" class="w-4 h-4" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-medium text-gray-900">{{ activity.action }}</p>
                  <p class="text-xs text-gray-600 truncate">{{ activity.description }}</p>
                </div>
                <div class="flex-shrink-0">
                  <p class="text-xs text-gray-500">{{ formatRelativeTime(activity.timestamp) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDashboardStore } from '~/stores/dashboard'
import { toBuenosAires } from '~/utils/timezone'
import type { Job } from '~/stores/jobs'

// Icons
import IconCalendar from '~icons/mdi/calendar'
import IconCalendarWeek from '~icons/mdi/calendar-week'
import IconCalendarMonth from '~icons/mdi/calendar-month'
import IconClockOutline from '~icons/mdi/clock-outline'
import IconClockCheck from '~icons/mdi/clock-check'
import IconAlertCircle from '~icons/mdi/alert-circle-outline'
import IconCurrencyDollar from '~icons/mdi/currency-usd'
import IconTrendingUp from '~icons/mdi/trending-up'
import IconChartLine from '~icons/mdi/chart-line'
import IconUserPlus from '~icons/mdi/account-plus'
import IconPlus from '~icons/mdi/plus'
import IconInbox from '~icons/mdi/inbox'
import IconCheckCircle from '~icons/mdi/check-circle'
import IconProgressClock from '~icons/mdi/progress-clock'
import IconCheckAll from '~icons/mdi/check-all'
import IconCloseCircle from '~icons/mdi/close-circle'
import IconAccount from '~icons/mdi/account'

// ==========================================
// PAGE METADATA
// ==========================================

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

useSeoMeta({
  title: 'Dashboard - InstalarPro',
  description: 'Vista general de tu negocio de aire acondicionado',
  robots: 'noindex, nofollow'
})

// ==========================================
// STORES
// ==========================================

const dashboardStore = useDashboardStore()

// ==========================================
// COMPUTED
// ==========================================

const iconComponents = {
  'mdi:clock-outline': IconClockOutline,
  'mdi:check-circle': IconCheckCircle,
  'mdi:progress-clock': IconProgressClock,
  'mdi:check-all': IconCheckAll,
  'mdi:close-circle': IconCloseCircle,
  'mdi:account': IconAccount,
}

// ==========================================
// METHODS
// ==========================================

const getIcon = (iconName: string) => {
  return iconComponents[iconName] || IconAccount
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

const formatJobTime = (job: Job): string => {
  const jobDate = job.scheduledDate.toDate ? job.scheduledDate.toDate() : job.scheduledDate
  const start = toBuenosAires(jobDate)
  const end = start.add(job.estimatedDuration, 'minute')

  return `${start.format('DD/MM')} ${start.format('HH:mm')} - ${end.format('HH:mm')}`
}

const formatRelativeTime = (date: Date): string => {
  const now = toBuenosAires()
  const then = toBuenosAires(date)
  const diffMinutes = now.diff(then, 'minute')

  if (diffMinutes < 1) return 'Ahora'
  if (diffMinutes < 60) return `Hace ${diffMinutes}m`

  const diffHours = now.diff(then, 'hour')
  if (diffHours < 24) return `Hace ${diffHours}h`

  const diffDays = now.diff(then, 'day')
  if (diffDays < 7) return `Hace ${diffDays}d`

  return then.format('DD/MM/YYYY')
}

// ==========================================
// LIFECYCLE
// ==========================================

onMounted(async () => {
  await dashboardStore.initialize()
})

onUnmounted(() => {
  dashboardStore.cleanup()
})
</script>
