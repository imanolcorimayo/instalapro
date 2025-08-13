<template>
  <div class="bg-white">
    <!-- Month Grid -->
    <div class="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
      <!-- Week Day Headers -->
      <div
        v-for="dayName in weekDayNames"
        :key="dayName"
        class="bg-gray-50 p-3 text-center"
      >
        <span class="text-sm font-medium text-gray-900">
          {{ dayName }}
        </span>
      </div>

      <!-- Calendar Days -->
      <div
        v-for="day in calendarDays"
        :key="day.date"
        :class="[
          'bg-white min-h-[100px] p-3 cursor-pointer hover:bg-gray-50 transition-colors',
          day.isCurrentMonth ? '' : 'bg-gray-50 text-gray-400',
          day.isToday ? 'bg-blue-50 ring-2 ring-blue-500 ring-inset' : '',
          day.hasJobs ? 'border-l-4 border-blue-500' : ''
        ]"
        @click="handleDateClick(day.date)"
      >
        <!-- Day Number -->
        <div class="flex items-center justify-between mb-2">
          <span
            :class="[
              'text-lg font-medium',
              day.isToday ? 'text-blue-600' : '',
              day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
            ]"
          >
            {{ day.dayNumber }}
          </span>
          
          <!-- Job Count Indicator -->
          <div
            v-if="day.jobs.length > 0"
            class="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full"
          >
            {{ day.jobs.length }}
          </div>
        </div>

        <!-- Jobs List - Simplified -->
        <div class="space-y-1">
          <div
            v-for="job in day.jobs.slice(0, 2)"
            :key="job.id"
            :class="[
              'text-xs p-2 rounded cursor-pointer transition-colors',
              getJobStatusClasses(job.status)
            ]"
            @click.stop="handleJobClick(job)"
          >
            <div class="font-medium truncate">{{ job.clientName }}</div>
            <div class="text-xs opacity-75 truncate">
              {{ formatJobTime(job.scheduledDate) }} • ${{ formatPrice(job.price) }}
            </div>
          </div>
          
          <!-- More Jobs Indicator -->
          <div
            v-if="day.jobs.length > 2"
            class="text-xs text-gray-500 p-2 text-center bg-gray-100 rounded cursor-pointer hover:bg-gray-200 transition-colors"
            @click.stop="handleDateClick(day.date)"
          >
            +{{ day.jobs.length - 2 }} más
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-if="day.jobs.length === 0 && day.isCurrentMonth"
          class="text-center py-4 text-gray-400"
        >
          <IconPlusCircleOutline class="w-6 h-6 mx-auto mb-1" />
          <div class="text-xs">Agregar trabajo</div>
        </div>
      </div>
    </div>

    <!-- Simplified Month Summary -->
    <div class="mt-6 bg-gray-50 rounded-lg p-4">
      <div class="grid grid-cols-3 gap-4 text-center">
        <div>
          <p class="text-2xl font-bold text-blue-600">
            {{ monthSummary.totalJobs }}
          </p>
          <p class="text-sm text-gray-600">
            Trabajos del Mes
          </p>
        </div>
        
        <div>
          <p class="text-2xl font-bold text-green-600">
            {{ monthSummary.revenue }}
          </p>
          <p class="text-sm text-gray-600">
            Ingresos Estimados
          </p>
        </div>
        
        <div>
          <p class="text-2xl font-bold text-purple-600">
            {{ monthSummary.workingDays }}
          </p>
          <p class="text-sm text-gray-600">
            Días con Trabajo
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconPlusCircleOutline from '~icons/mdi/plus-circle-outline'
import type { Job } from '~/types'
import { formatInBuenosAires, isTodayInBuenosAires, toBuenosAires } from '~/utils/timezone'

// ==========================================
// PROPS & EMITS
// ==========================================

interface Props {
  year: number
  month: number // 0-based (0 = January)
  technicianId: string
}

interface Emits {
  (e: 'date-click', date: string): void
  (e: 'job-click', job: Job): void
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

const weekDayNames = computed(() => [
  'Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'
])

const monthStart = computed(() => toBuenosAires(`${props.year}-${(props.month + 1).toString().padStart(2, '0')}-01T00:00:00`))
const monthEnd = computed(() => toBuenosAires(`${props.year}-${(props.month + 1).toString().padStart(2, '0')}-01T00:00:00`).endOf('month'))

const calendarStart = computed(() => {
  const start = monthStart.value
  return start.startOf('week')
})

const calendarEnd = computed(() => {
  const end = monthEnd.value
  return end.endOf('week')
})

const calendarDays = computed(() => {
  const days = []
  let current = calendarStart.value
  
  while (current <= calendarEnd.value) {
    const dateString = formatInBuenosAires(current, 'YYYY-MM-DD')
    const dayJobs = scheduleStore.jobs.filter(job => 
      formatInBuenosAires(job.scheduledDate, 'YYYY-MM-DD') === dateString
    )
    
    days.push({
      date: dateString,
      dayNumber: current.date(),
      isCurrentMonth: current.month() === props.month,
      isToday: isTodayInBuenosAires(dateString),
      hasJobs: dayJobs.length > 0,
      jobs: dayJobs.sort((a, b) => 
        formatInBuenosAires(a.scheduledDate, 'HH:mm').localeCompare(
          formatInBuenosAires(b.scheduledDate, 'HH:mm')
        )
      )
    })
    
    current = current.add(1, 'day')
  }
  
  return days
})

const monthSummary = computed(() => {
  const currentMonthDays = calendarDays.value.filter(day => day.isCurrentMonth)
  const allJobs = currentMonthDays.flatMap(day => day.jobs)
  const workingDays = currentMonthDays.filter(day => day.hasJobs)
  
  const totalRevenue = allJobs.reduce((sum, job) => sum + job.price, 0)
  
  return {
    totalJobs: allJobs.length,
    workingDays: workingDays.length,
    revenue: `$${totalRevenue.toLocaleString()}`
  }
})

// ==========================================
// METHODS
// ==========================================

const handleDateClick = (date: string): void => {
  emit('date-click', date)
}

const handleJobClick = (job: Job): void => {
  emit('job-click', job)
}

const getJobStatusClasses = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border border-yellow-200'
    case 'confirmed':
      return 'bg-blue-100 text-blue-800 border border-blue-200'
    case 'in_progress':
      return 'bg-purple-100 text-purple-800 border border-purple-200'
    case 'completed':
      return 'bg-green-100 text-green-800 border border-green-200'
    case 'cancelled':
      return 'bg-red-100 text-red-800 border border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border border-gray-200'
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