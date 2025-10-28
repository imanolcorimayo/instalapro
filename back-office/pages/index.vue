<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <!-- Loading State -->
    <div v-if="dashboardStore.loading" class="flex items-center justify-center py-24">
      <div class="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
    </div>

    <!-- Dashboard Content -->
    <div v-else class="mx-auto max-w-7xl">
      <!-- HOY Section -->
      <div class="mb-8">
        <div class="mb-4 flex items-center gap-2">
          <div class="flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1">
            <IconCalendar class="h-4 w-4 text-blue-600" />
            <span class="text-sm font-semibold text-blue-900">HOY</span>
          </div>
        </div>

        <div class="grid gap-4 md:grid-cols-3">
          <!-- Trabajos Card -->
          <div class="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div class="absolute right-0 top-0 h-1 w-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
            <div class="mb-3 flex items-center gap-3">
              <div class="rounded-lg bg-blue-100 p-2">
                <IconBriefcase class="h-5 w-5 text-blue-600" />
              </div>
              <span class="text-sm font-medium text-gray-600">Trabajos</span>
            </div>
            <p class="text-4xl font-bold text-gray-900">{{ dashboardStore.jobsToday }}</p>
          </div>

          <!-- Próximo Trabajo Card -->
          <div class="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-6 shadow-sm transition-all hover:shadow-md">
            <div class="mb-2 flex items-center gap-2">
              <IconClockOutline class="h-5 w-5 text-blue-600" />
              <span class="text-sm font-semibold text-gray-700">Próximo Trabajo</span>
            </div>
            <div v-if="dashboardStore.nextJob">
              <p class="mb-1 font-semibold text-gray-900">{{ dashboardStore.nextJob.clientName }}</p>
              <p class="mb-2 text-sm text-gray-600">{{ dashboardStore.nextJob.serviceType }}</p>
              <p class="text-xs text-gray-500">{{ formatJobTime(dashboardStore.nextJob) }}</p>
            </div>
            <p v-else class="text-sm text-gray-400">Sin trabajos programados</p>
          </div>

          <!-- Pendientes Card -->
          <div class="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div class="absolute right-0 top-0 h-1 w-full bg-gradient-to-r from-amber-500 to-orange-500"></div>
            <div class="mb-3 flex items-center gap-3">
              <div class="rounded-lg bg-amber-100 p-2">
                <IconAlertCircle class="h-5 w-5 text-amber-600" />
              </div>
              <span class="text-sm font-medium text-gray-600">Pendientes</span>
            </div>
            <p class="text-4xl font-bold text-gray-900">{{ dashboardStore.pendingJobs }}</p>
          </div>
        </div>
      </div>

      <!-- ESTA SEMANA Section -->
      <div class="mb-8">
        <div class="mb-4 flex items-center gap-2">
          <div class="flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1">
            <IconCalendarWeek class="h-4 w-4 text-purple-600" />
            <span class="text-sm font-semibold text-purple-900">ESTA SEMANA</span>
          </div>
        </div>

        <div class="grid gap-4 md:grid-cols-3">
          <!-- Trabajos Card -->
          <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div class="mb-3 flex items-center gap-3">
              <div class="rounded-lg bg-purple-100 p-2">
                <IconBriefcase class="h-5 w-5 text-purple-600" />
              </div>
              <span class="text-sm font-medium text-gray-600">Trabajos</span>
            </div>
            <p class="text-4xl font-bold text-gray-900">{{ dashboardStore.jobsThisWeek }}</p>
          </div>

          <!-- Ingresos Card -->
          <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div class="mb-3 flex items-center gap-3">
              <div class="rounded-lg bg-green-100 p-2">
                <IconCurrencyDollar class="h-5 w-5 text-green-600" />
              </div>
              <span class="text-sm font-medium text-gray-600">Ingresos</span>
            </div>
            <p class="text-4xl font-bold text-gray-900">{{ formatCurrency(dashboardStore.revenueThisWeek) }}</p>
          </div>

          <!-- Horas Disponibles Card -->
          <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div class="mb-3 flex items-center gap-3">
              <div class="rounded-lg bg-indigo-100 p-2">
                <IconClockOutline class="h-5 w-5 text-indigo-600" />
              </div>
              <span class="text-sm font-medium text-gray-600">Horas Disponibles</span>
            </div>
            <p class="text-4xl font-bold text-gray-900">{{ dashboardStore.availableHoursThisWeek }}</p>
          </div>
        </div>
      </div>

      <!-- ESTE MES Section -->
      <div class="mb-8">
        <div class="mb-4 flex items-center gap-2">
          <div class="flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1">
            <IconCalendarMonth class="h-4 w-4 text-indigo-600" />
            <span class="text-sm font-semibold text-indigo-900">ESTE MES</span>
          </div>
        </div>

        <div class="grid gap-4 md:grid-cols-3">
          <!-- Ingresos Card -->
          <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div class="mb-3 flex items-center gap-3">
              <div class="rounded-lg bg-green-100 p-2">
                <IconTrendingUp class="h-5 w-5 text-green-600" />
              </div>
              <span class="text-sm font-medium text-gray-600">Ingresos</span>
            </div>
            <p class="text-4xl font-bold text-gray-900">{{ formatCurrency(dashboardStore.revenueThisMonth) }}</p>
          </div>

          <!-- Trabajos Card -->
          <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div class="mb-3 flex items-center gap-3">
              <div class="rounded-lg bg-indigo-100 p-2">
                <IconTrendingUp class="h-5 w-5 text-indigo-600" />
              </div>
              <span class="text-sm font-medium text-gray-600">Trabajos</span>
            </div>
            <div class="flex items-baseline gap-2">
              <p class="text-4xl font-bold text-gray-900">{{ dashboardStore.jobsThisMonth }}</p>
              <span class="text-sm text-gray-500">/ {{ dashboardStore.jobsLastMonth }}</span>
            </div>
            <p class="mt-1 text-xs text-gray-500">vs. mes anterior</p>
          </div>

          <!-- Nuevos Clientes Card -->
          <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div class="mb-3 flex items-center gap-3">
              <div class="rounded-lg bg-blue-100 p-2">
                <IconUserPlus class="h-5 w-5 text-blue-600" />
              </div>
              <span class="text-sm font-medium text-gray-600">Nuevos Clientes</span>
            </div>
            <p class="text-4xl font-bold text-gray-900">{{ dashboardStore.newClientsThisMonth }}</p>
          </div>
        </div>
      </div>

      <!-- ACCIONES RÁPIDAS Section -->
      <div class="mb-8">
        <h2 class="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">Acciones Rápidas</h2>

        <div class="grid gap-3 md:grid-cols-3">
          <!-- Nuevo Trabajo Button -->
          <button
            @click="navigateTo('/schedule')"
            class="group flex items-center justify-between rounded-lg border-2 border-blue-200 bg-blue-50/50 px-5 py-4 text-left transition-all hover:border-blue-400 hover:bg-blue-100 hover:shadow-md active:scale-[0.98]"
          >
            <div>
              <p class="font-semibold text-gray-900">Nuevo Trabajo</p>
              <p class="text-sm text-gray-600">Agendar una nueva cita</p>
            </div>
            <div class="rounded-full bg-blue-500 p-2 transition-transform group-hover:scale-110">
              <IconPlus class="h-5 w-5 text-white" />
            </div>
          </button>

          <!-- Ver Agenda Button -->
          <button
            @click="navigateTo('/schedule')"
            class="group flex items-center justify-between rounded-lg border-2 border-purple-200 bg-purple-50/50 px-5 py-4 text-left transition-all hover:border-purple-400 hover:bg-purple-100 hover:shadow-md active:scale-[0.98]"
          >
            <div>
              <p class="font-semibold text-gray-900">Ver Agenda</p>
              <p class="text-sm text-gray-600">Gestionar horarios</p>
            </div>
            <div class="rounded-full bg-purple-500 p-2 transition-transform group-hover:scale-110">
              <IconCalendarWeek class="h-5 w-5 text-white" />
            </div>
          </button>

          <!-- Nuevo Cliente Button -->
          <button
            @click="navigateTo('/clients')"
            class="group flex items-center justify-between rounded-lg border-2 border-green-200 bg-green-50/50 px-5 py-4 text-left transition-all hover:border-green-400 hover:bg-green-100 hover:shadow-md active:scale-[0.98]"
          >
            <div>
              <p class="font-semibold text-gray-900">Nuevo Cliente</p>
              <p class="text-sm text-gray-600">Agregar al registro</p>
            </div>
            <div class="rounded-full bg-green-500 p-2 transition-transform group-hover:scale-110">
              <IconUserPlus class="h-5 w-5 text-white" />
            </div>
          </button>
        </div>
      </div>

      <!-- ACTIVIDAD RECIENTE Section -->
      <div>
        <h2 class="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">Actividad Reciente</h2>

        <div v-if="dashboardStore.recentActivity.length === 0" class="p-8 text-center bg-white rounded-xl border border-gray-200">
          <IconInbox class="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p class="text-sm text-gray-500">No hay actividad reciente</p>
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="activity in dashboardStore.recentActivity"
            :key="activity.id"
            :class="[
              'flex items-center justify-between rounded-lg border p-4 transition-all hover:shadow-sm',
              activity.color === 'yellow' && 'border-amber-200 bg-amber-50',
              activity.color === 'orange' && 'border-amber-200 bg-amber-50',
              activity.color === 'green' && 'border-green-200 bg-green-50',
              activity.color === 'blue' && 'border-blue-200 bg-blue-50',
              activity.color === 'red' && 'border-red-200 bg-red-50',
              activity.color === 'gray' && 'border-gray-200 bg-white'
            ]"
          >
            <div class="flex items-center gap-4">
              <div :class="[
                'rounded-full p-2',
                activity.color === 'yellow' && 'bg-amber-500',
                activity.color === 'orange' && 'bg-amber-500',
                activity.color === 'green' && 'bg-green-500',
                activity.color === 'blue' && 'bg-blue-500',
                activity.color === 'red' && 'bg-red-500',
                activity.color === 'gray' && 'bg-gray-500'
              ]">
                <component :is="getIcon(activity.icon)" class="h-5 w-5 text-white" />
              </div>
              <div>
                <p class="font-semibold text-gray-900">{{ activity.action }}</p>
                <p class="text-sm text-gray-600">{{ activity.description }}</p>
              </div>
            </div>
            <span class="text-sm text-gray-500">{{ formatRelativeTime(activity.timestamp) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useDashboardStore } from '~/stores/dashboard'
import { toBuenosAires } from '~/utils/timezone'

// Icons
import IconCalendar from '~icons/mdi/calendar'
import IconCalendarWeek from '~icons/mdi/calendar-week'
import IconCalendarMonth from '~icons/mdi/calendar-month'
import IconClockOutline from '~icons/mdi/clock-outline'
import IconAlertCircle from '~icons/mdi/alert-circle-outline'
import IconCurrencyDollar from '~icons/mdi/currency-usd'
import IconTrendingUp from '~icons/mdi/trending-up'
import IconUserPlus from '~icons/mdi/account-plus-outline'
import IconPlus from '~icons/mdi/plus'
import IconInbox from '~icons/mdi/inbox'
import IconCheckCircleOutline from '~icons/mdi/check-circle-outline'
import IconProgressClock from '~icons/mdi/progress-clock'
import IconCloseCircleOutline from '~icons/mdi/close-circle-outline'
import IconAccount from '~icons/mdi/account-outline'
import IconBriefcase from '~icons/mdi/briefcase-outline'

// ==========================================
// PAGE METADATA
// ==========================================

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

useSeoMeta({
  title: 'Dashboard - InstalaPro',
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
  'mdi:check-circle-outline': IconCheckCircleOutline,
  'mdi:progress-clock': IconProgressClock,
  'mdi:close-circle-outline': IconCloseCircleOutline,
  'mdi:account': IconAccount,
  'mdi:account-outline': IconAccount,
  'mdi:alert-circle-outline': IconAlertCircle,
}

// ==========================================
// METHODS
// ==========================================

const getIcon = (iconName) => {
  return iconComponents[iconName] || IconAccount
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

const formatJobTime = (job) => {
  const jobDate = job.scheduledDate.toDate ? job.scheduledDate.toDate() : job.scheduledDate
  const start = toBuenosAires(jobDate)
  const end = start.add(job.estimatedDuration, 'minute')

  return `${start.format('DD/MM')} ${start.format('HH:mm')} - ${end.format('HH:mm')}`
}

const formatRelativeTime = (date) => {
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
