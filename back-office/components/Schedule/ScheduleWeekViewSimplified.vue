<template>
  <div class="bg-white">
    <!-- Week Overview -->
    <div class="grid grid-cols-7 gap-4 mb-6">
      <div
        v-for="day in weekDays"
        :key="day.date"
        :class="[
          'text-center p-4 rounded-lg border-2 transition-all cursor-pointer',
          isToday(day.date) 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        ]"
        @click="handleDateClick(day.date)"
      >
        <div class="text-sm font-medium text-gray-600 mb-1">
          {{ day.dayName }}
        </div>
        <div
          :class="[
            'text-2xl font-bold mb-2',
            isToday(day.date) ? 'text-blue-600' : 'text-gray-800'
          ]"
        >
          {{ day.dayNumber }}
        </div>
        
        <!-- Day Stats -->
        <div class="space-y-1">
          <div
            v-if="day.stats.booked > 0"
            class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
          >
            {{ day.stats.booked }} trabajo{{ day.stats.booked !== 1 ? 's' : '' }}
          </div>
          <div
            v-if="day.stats.available > 0"
            class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full"
          >
            {{ day.stats.available }} disponible{{ day.stats.available !== 1 ? 's' : '' }}
          </div>
          <div
            v-if="day.stats.total === 0"
            class="text-xs text-gray-500"
          >
            Sin horarios
          </div>
        </div>
      </div>
    </div>

    <!-- Jobs Timeline -->
    <div class="bg-gray-50 rounded-lg p-4">
      <h4 class="text-lg font-semibold text-gray-900 mb-4">
        Trabajos de la Semana
      </h4>

      <!-- Jobs by Day -->
      <div class="space-y-4">
        <div
          v-for="day in weekDays.filter(d => d.jobs.length > 0)"
          :key="day.date"
          class="bg-white rounded-lg p-4 border border-gray-200"
        >
          <div class="flex items-center justify-between mb-3">
            <h5 class="font-medium text-gray-900">
              {{ day.dayName }} {{ day.dayNumber }}
              <span v-if="isToday(day.date)" class="text-blue-600 text-sm ml-2">(Hoy)</span>
            </h5>
            <span class="text-sm text-gray-500">
              {{ day.jobs.length }} trabajo{{ day.jobs.length !== 1 ? 's' : '' }}
            </span>
          </div>

          <!-- Jobs List -->
          <div class="space-y-2">
            <div
              v-for="job in day.jobs"
              :key="job.id"
              :class="[
                'flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors',
                getJobStatusClasses(job.status),
                'hover:shadow-sm'
              ]"
              @click="handleJobClick(job)"
            >
              <div class="flex items-center">
                <component
                  :is="getJobStatusIcon(job.status)"
                  :class="['w-5 h-5 mr-3', getJobStatusIconColor(job.status)]"
                />
                <div>
                  <p class="font-medium text-gray-900">{{ job.clientName }}</p>
                  <p class="text-sm text-gray-600">{{ job.serviceType }}</p>
                </div>
              </div>
              
              <div class="text-right">
                <p class="text-sm font-medium text-gray-900">
                  {{ formatJobTime(job.scheduledDate) }}
                </p>
                <p class="text-sm text-green-600 font-medium">
                  ${{ formatPrice(job.price) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="weekSummary.totalJobs === 0"
        class="text-center py-8"
      >
        <IconCalendarOutline class="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p class="text-gray-500 mb-4">No hay trabajos programados para esta semana</p>
        <button
          type="button"
          class="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          @click="handleNewJob"
        >
          Crear Primer Trabajo
        </button>
      </div>
    </div>

    <!-- Week Summary -->
    <div class="mt-6 bg-white border border-gray-200 rounded-lg p-4">
      <h4 class="text-sm font-medium text-gray-900 mb-3">
        Resumen de la Semana
      </h4>
      <div class="grid grid-cols-4 gap-4 text-center">
        <div>
          <p class="text-lg font-semibold text-blue-600">
            {{ weekSummary.totalJobs }}
          </p>
          <p class="text-xs text-gray-600">
            Total Trabajos
          </p>
        </div>
        <div>
          <p class="text-lg font-semibold text-green-600">
            {{ weekSummary.revenue }}
          </p>
          <p class="text-xs text-gray-600">
            Ingresos
          </p>
        </div>
        <div>
          <p class="text-lg font-semibold text-purple-600">
            {{ weekSummary.utilization }}%
          </p>
          <p class="text-xs text-gray-600">
            Ocupación
          </p>
        </div>
        <div>
          <p class="text-lg font-semibold text-gray-600">
            {{ weekSummary.workingHours }}h
          </p>
          <p class="text-xs text-gray-600">
            Horas de Trabajo
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconCalendarOutline from '~icons/mdi/calendar-outline'
import IconClockOutline from '~icons/mdi/clock-outline'
import IconCheckCircleOutline from '~icons/mdi/check-circle-outline'
import IconPlayCircleOutline from '~icons/mdi/play-circle-outline'
import IconCheckAll from '~icons/mdi/check-all'
import IconCloseCircleOutline from '~icons/mdi/close-circle-outline'
import IconHelpCircleOutline from '~icons/mdi/help-circle-outline'
import type { TimeSlot, Job, ScheduleWeek } from '~/types'
import { isTodayInBuenosAires, formatInBuenosAires, toBuenosAires } from '~/utils/timezone'

// ==========================================
// PROPS & EMITS
// ==========================================

interface Props {
  startDate: string // YYYY-MM-DD format
  technicianId: string
}

interface Emits {
  (e: 'job-click', job: Job): void
  (e: 'date-click', date: string): void
  (e: 'new-job'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// ==========================================
// COMPOSABLES
// ==========================================

const scheduleStore = useScheduleStore()

// ==========================================
// COMPUTED
// ==========================================

const scheduleWeek = computed((): ScheduleWeek => {
  return scheduleStore.getScheduleWeek(props.startDate, props.technicianId)
})

const weekDays = computed(() => {
  return scheduleWeek.value.days.map(day => {
    const date = toBuenosAires(day.date + 'T00:00:00')
    const dayJobs = scheduleStore.jobs.filter(job => 
      formatInBuenosAires(job.scheduledDate, 'YYYY-MM-DD') === day.date
    ).sort((a, b) => 
      formatInBuenosAires(a.scheduledDate, 'HH:mm').localeCompare(
        formatInBuenosAires(b.scheduledDate, 'HH:mm')
      )
    )

    return {
      date: day.date,
      dayName: date.format('ddd'),
      dayNumber: date.date(),
      stats: {
        total: day.totalSlots,
        available: day.availableSlots,
        booked: day.bookedSlots,
        blocked: day.blockedSlots
      },
      jobs: dayJobs
    }
  })
})

const weekSummary = computed(() => {
  const allJobs = weekDays.value.flatMap(day => day.jobs)
  const totalRevenue = allJobs.reduce((sum, job) => sum + job.price, 0)
  const week = scheduleWeek.value

  return {
    totalJobs: allJobs.length,
    revenue: `$${totalRevenue.toLocaleString()}`,
    utilization: Math.round(week.utilization),
    workingHours: Math.round(week.totalAvailableHours * 10) / 10
  }
})

// ==========================================
// METHODS
// ==========================================

const isToday = (date: string): boolean => {
  return isTodayInBuenosAires(date)
}

const handleDateClick = (date: string): void => {
  emit('date-click', date)
}

const handleJobClick = (job: Job): void => {
  emit('job-click', job)
}

const handleNewJob = (): void => {
  emit('new-job')
}

const getJobStatusClasses = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'border-yellow-200 bg-yellow-50'
    case 'confirmed':
      return 'border-blue-200 bg-blue-50'
    case 'in_progress':
      return 'border-purple-200 bg-purple-50'
    case 'completed':
      return 'border-green-200 bg-green-50'
    case 'cancelled':
      return 'border-red-200 bg-red-50'
    default:
      return 'border-gray-200 bg-gray-50'
  }
}

const getJobStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return IconClockOutline
    case 'confirmed':
      return IconCheckCircleOutline
    case 'in_progress':
      return IconPlayCircleOutline
    case 'completed':
      return IconCheckAll
    case 'cancelled':
      return IconCloseCircleOutline
    default:
      return IconHelpCircleOutline
  }
}

const getJobStatusIconColor = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'text-yellow-500'
    case 'confirmed':
      return 'text-blue-500'
    case 'in_progress':
      return 'text-purple-500'
    case 'completed':
      return 'text-green-500'
    case 'cancelled':
      return 'text-red-500'
    default:
      return 'text-gray-500'
  }
}

const formatJobTime = (date: Date): string => {
  return formatInBuenosAires(date, 'HH:mm')
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'decimal',
    maximumFractionDigits: 0
  }).format(price)
}
</script>