<template>
  <div class="p-4 lg:p-6">
    <!-- Loading State -->
    <div v-if="dashboardStore.loading" class="flex items-center justify-center py-24">
      <div class="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin"></div>
    </div>

    <!-- Dashboard Content -->
    <div v-else class="mx-auto max-w-7xl">
      <!-- Hero Section - Today's Overview -->
      <div class="mb-8" data-tour-id="dashboard-today">
        <div class="mb-4 flex items-center gap-2">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
            <IconCalendar class="h-4 w-4 text-blue-600" />
          </div>
          <h2 class="text-lg font-semibold text-slate-900">Hoy</h2>
        </div>

        <div class="grid gap-6 md:grid-cols-3">
        <!-- Próximo Trabajo - Featured Card (2 columns) -->
        <div class="md:col-span-2 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm">
          <div class="mb-4 flex items-center gap-2">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500">
              <IconClockOutline class="h-5 w-5 text-white" />
            </div>
            <span class="text-sm font-medium text-slate-600">Próximo Trabajo</span>
          </div>
          <div v-if="dashboardStore.nextJob">
            <h3 class="mb-1 text-xl font-bold text-slate-900">{{ dashboardStore.nextJob.clientName }}</h3>
            <p class="mb-2 text-slate-700">{{ dashboardStore.nextJob.serviceType }}</p>
            <div class="flex items-center gap-2 text-sm text-slate-600">
              <IconCalendar class="h-4 w-4" />
              <span>{{ formatJobTime(dashboardStore.nextJob) }}</span>
            </div>
          </div>
          <div v-else>
            <p class="text-slate-500">Sin trabajos programados</p>
          </div>
        </div>

        <!-- Today's Quick Stats (stacked column) -->
        <div class="space-y-4">
          <!-- Trabajos Hoy -->
          <div class="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div class="mb-2 flex items-center justify-between">
              <span class="text-sm text-slate-600">Trabajos Hoy</span>
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                <IconBriefcase class="h-4 w-4 text-slate-700" />
              </div>
            </div>
            <p class="text-3xl font-bold text-slate-900">{{ dashboardStore.jobsToday }}</p>
          </div>

          <!-- Pendientes -->
          <div class="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div class="mb-2 flex items-center justify-between">
              <span class="text-sm text-slate-600">Pendientes</span>
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                <IconAlertCircle class="h-4 w-4 text-amber-700" />
              </div>
            </div>
            <p class="text-3xl font-bold text-slate-900">{{ dashboardStore.pendingJobs }}</p>
          </div>
        </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="mb-8">
        <h2 class="mb-4 text-lg font-semibold text-slate-900">Acciones Rápidas</h2>
        <div class="grid gap-3 md:grid-cols-3">
          <!-- Nuevo Trabajo -->
          <button
            @click="navigateTo('/schedule')"
            class="group flex items-center gap-3 rounded-xl border-2 border-slate-200 bg-white px-5 py-4 text-left transition-all hover:border-blue-400 hover:bg-blue-50 hover:shadow-md active:scale-[0.98]"
          >
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500 transition-transform group-hover:scale-110">
              <IconPlus class="h-5 w-5 text-white" />
            </div>
            <div>
              <p class="font-semibold text-slate-900">Nuevo Trabajo</p>
              <p class="text-sm text-slate-600">Agendar una nueva cita</p>
            </div>
          </button>

          <!-- Ver Agenda -->
          <button
            @click="navigateTo('/schedule')"
            class="group flex items-center gap-3 rounded-xl border-2 border-slate-200 bg-white px-5 py-4 text-left transition-all hover:border-purple-400 hover:bg-purple-50 hover:shadow-md active:scale-[0.98]"
          >
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500 transition-transform group-hover:scale-110">
              <IconCalendarWeek class="h-5 w-5 text-white" />
            </div>
            <div>
              <p class="font-semibold text-slate-900">Ver Agenda</p>
              <p class="text-sm text-slate-600">Gestionar horarios</p>
            </div>
          </button>

          <!-- Nuevo Cliente -->
          <button
            @click="navigateTo('/clients')"
            class="group flex items-center gap-3 rounded-xl border-2 border-slate-200 bg-white px-5 py-4 text-left transition-all hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-md active:scale-[0.98]"
          >
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500 transition-transform group-hover:scale-110">
              <IconUserPlus class="h-5 w-5 text-white" />
            </div>
            <div>
              <p class="font-semibold text-slate-900">Nuevo Cliente</p>
              <p class="text-sm text-slate-600">Agregar al registro</p>
            </div>
          </button>
        </div>
      </div>

      <!-- Resumen Semanal y Mensual -->
      <div class="mb-8" data-tour-id="dashboard-week-month">
        <h2 class="mb-4 text-lg font-semibold text-slate-900">Resumen Semanal y Mensual</h2>

        <div class="grid gap-6 lg:grid-cols-2">
          <!-- Esta Semana -->
          <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div class="mb-4 flex items-center gap-2">
              <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100">
                <IconCalendarWeek class="h-4 w-4 text-purple-600" />
              </div>
              <h3 class="font-semibold text-slate-900">Esta Semana</h3>
            </div>

            <div class="space-y-3">
              <div class="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                <div class="flex items-center gap-3">
                  <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                    <IconCurrencyDollar class="h-4 w-4 text-green-600" />
                  </div>
                  <span class="text-sm font-medium text-slate-700">Ingresos</span>
                </div>
                <span class="text-lg font-bold text-slate-900">{{ formatCurrency(dashboardStore.revenueThisWeek) }}</span>
              </div>

              <div class="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                <div class="flex items-center gap-3">
                  <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                    <IconBriefcase class="h-4 w-4 text-slate-600" />
                  </div>
                  <span class="text-sm font-medium text-slate-700">Trabajos</span>
                </div>
                <span class="text-lg font-bold text-slate-900">{{ dashboardStore.jobsThisWeek }}</span>
              </div>

              <div class="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                <div class="flex items-center gap-3">
                  <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                    <IconClock class="h-4 w-4 text-blue-600" />
                  </div>
                  <span class="text-sm font-medium text-slate-700">Horas Disponibles</span>
                </div>
                <span class="text-lg font-bold text-slate-900">{{ dashboardStore.availableHoursThisWeek }}</span>
              </div>
            </div>
          </div>

          <!-- Este Mes -->
          <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div class="mb-4 flex items-center gap-2">
              <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100">
                <IconCalendarMonth class="h-4 w-4 text-indigo-600" />
              </div>
              <h3 class="font-semibold text-slate-900">Este Mes</h3>
            </div>

            <div class="space-y-3">
              <div class="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                <div class="flex items-center gap-3">
                  <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                    <IconCurrencyDollar class="h-4 w-4 text-green-600" />
                  </div>
                  <span class="text-sm font-medium text-slate-700">Ingresos</span>
                </div>
                <span class="text-lg font-bold text-slate-900">{{ formatCurrency(dashboardStore.revenueThisMonth) }}</span>
              </div>

              <div class="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                <div class="flex items-center gap-3">
                  <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                    <IconBriefcase class="h-4 w-4 text-slate-600" />
                  </div>
                  <span class="text-sm font-medium text-slate-700">Trabajos</span>
                </div>
                <div class="text-right">
                  <span class="text-lg font-bold text-slate-900">{{ dashboardStore.jobsThisMonth }}</span>
                  <span class="ml-1 text-sm text-slate-500">/ {{ dashboardStore.jobsLastMonth }}</span>
                  <p class="text-xs text-slate-500">vs. mes anterior</p>
                </div>
              </div>

              <div class="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                <div class="flex items-center gap-3">
                  <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                    <IconUsers class="h-4 w-4 text-blue-600" />
                  </div>
                  <span class="text-sm font-medium text-slate-700">Nuevos Clientes</span>
                </div>
                <span class="text-lg font-bold text-slate-900">{{ dashboardStore.newClientsThisMonth }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Activity Feed - Compact -->
      <div>
        <h2 class="mb-4 text-lg font-semibold text-slate-900">Actividad Reciente</h2>

        <div v-if="dashboardStore.recentActivity.length === 0" class="p-8 text-center">
          <IconInbox class="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p class="text-sm text-slate-500">No hay actividad reciente</p>
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="activity in dashboardStore.recentActivity"
            :key="activity.id"
            :class="[
              'flex items-center justify-between rounded-lg p-4 transition-all hover:shadow-sm',
              activity.color === 'yellow' && 'border border-amber-200 bg-amber-50',
              activity.color === 'orange' && 'border border-amber-200 bg-amber-50',
              activity.color === 'green' && 'border border-green-200 bg-green-50',
              activity.color === 'blue' && 'border border-blue-200 bg-blue-50',
              activity.color === 'red' && 'border border-red-200 bg-red-50',
              activity.color === 'gray' && 'border border-slate-200 bg-white'
            ]"
          >
            <div class="flex items-center gap-3">
              <div :class="[
                'flex h-8 w-8 items-center justify-center rounded-lg',
                activity.color === 'yellow' && 'bg-amber-100',
                activity.color === 'orange' && 'bg-amber-100',
                activity.color === 'green' && 'bg-green-100',
                activity.color === 'blue' && 'bg-blue-100',
                activity.color === 'red' && 'bg-red-100',
                activity.color === 'gray' && 'bg-slate-100'
              ]">
                <component
                  :is="getIcon(activity.icon)"
                  :class="[
                    'h-4 w-4',
                    activity.color === 'yellow' && 'text-amber-600',
                    activity.color === 'orange' && 'text-amber-600',
                    activity.color === 'green' && 'text-green-600',
                    activity.color === 'blue' && 'text-blue-600',
                    activity.color === 'red' && 'text-red-600',
                    activity.color === 'gray' && 'text-slate-600'
                  ]"
                />
              </div>
              <div>
                <p class="font-medium text-slate-900">{{ activity.action }}</p>
                <p class="text-sm text-slate-600">{{ activity.description }}</p>
              </div>
            </div>
            <span class="text-sm text-slate-500">{{ formatRelativeTime(activity.timestamp) }}</span>
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
import IconUserPlus from '~icons/mdi/account-plus-outline'
import IconPlus from '~icons/mdi/plus'
import IconInbox from '~icons/mdi/inbox'
import IconCheckCircleOutline from '~icons/mdi/check-circle-outline'
import IconProgressClock from '~icons/mdi/progress-clock'
import IconCloseCircleOutline from '~icons/mdi/close-circle-outline'
import IconAccount from '~icons/mdi/account-outline'
import IconBriefcase from '~icons/mdi/briefcase-outline'
import IconUsers from '~icons/mdi/account-group-outline'
import IconClock from '~icons/mdi/clock-outline'

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
