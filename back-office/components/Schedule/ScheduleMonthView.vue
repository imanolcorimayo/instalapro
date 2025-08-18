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
        <span class="text-xs font-medium text-gray-900">
          {{ dayName }}
        </span>
      </div>

      <!-- Calendar Days -->
      <div
        v-for="day in calendarDays"
        :key="day.date"
        :class="[
          'bg-white min-h-[120px] p-2 cursor-pointer hover:bg-gray-50 transition-colors',
          day.isCurrentMonth ? '' : 'bg-gray-50 text-gray-400',
          day.isToday ? 'bg-blue-50 ring-2 ring-blue-500 ring-inset' : '',
          day.isSelected ? 'bg-blue-100 ring-2 ring-blue-600 ring-inset' : ''
        ]"
        @click="handleDateClick(day.date)"
      >
        <!-- Day Number -->
        <div class="flex items-center justify-between mb-2">
          <span
            :class="[
              'text-sm font-medium',
              day.isToday ? 'text-blue-600' : '',
              day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
            ]"
          >
            {{ day.dayNumber }}
          </span>
          
          <!-- Day Status Indicator -->
          <div class="flex items-center space-x-1">
            <div
              v-if="day.stats.booked > 0"
              :class="[
                'w-2 h-2 rounded-full',
                day.stats.booked >= day.stats.available ? 'bg-red-500' : 'bg-blue-500'
              ]"
            />
            <div
              v-if="day.stats.available > 0"
              class="w-2 h-2 rounded-full bg-green-500"
            />
          </div>
        </div>

        <!-- Jobs for this day -->
        <div class="space-y-1">
          <div
            v-for="job in day.jobs.slice(0, 3)"
            :key="job.id"
            :class="[
              'text-xs p-1 rounded truncate',
              getJobStatusClasses(job.status)
            ]"
            @click.stop="handleJobClick(job)"
          >
            {{ job.clientName }}
          </div>
          
          <!-- More jobs indicator -->
          <div
            v-if="day.jobs.length > 3"
            class="text-xs text-gray-500 p-1"
          >
            +{{ day.jobs.length - 3 }} más
          </div>
        </div>

        <!-- Availability Summary -->
        <div
          v-if="day.stats.total > 0"
          class="mt-2 pt-2 border-t border-gray-100"
        >
          <div class="flex items-center justify-between text-xs text-gray-500">
            <span>{{ day.stats.available }}/{{ day.stats.total }}</span>
            <span>{{ day.utilizationPercentage }}%</span>
          </div>
          
          <!-- Utilization Bar -->
          <div class="mt-1 bg-gray-200 rounded-full h-1">
            <div
              :class="[
                'h-1 rounded-full transition-all duration-300',
                day.utilizationPercentage >= 80 ? 'bg-red-500' :
                day.utilizationPercentage >= 50 ? 'bg-yellow-500' : 'bg-green-500'
              ]"
              :style="{ width: `${day.utilizationPercentage}%` }"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Month Summary -->
    <div class="mt-6 bg-gray-50 rounded-lg p-4">
      <h4 class="text-sm font-medium text-gray-900 mb-4">
        Resumen del Mes
      </h4>
      
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div class="text-center">
          <p class="text-2xl font-bold text-gray-900">
            {{ monthSummary.workingDays }}
          </p>
          <p class="text-xs text-gray-600">
            Días Laborables
          </p>
        </div>
        
        <div class="text-center">
          <p class="text-2xl font-bold text-green-600">
            {{ monthSummary.totalAvailable }}
          </p>
          <p class="text-xs text-gray-600">
            Slots Disponibles
          </p>
        </div>
        
        <div class="text-center">
          <p class="text-2xl font-bold text-blue-600">
            {{ monthSummary.totalBooked }}
          </p>
          <p class="text-xs text-gray-600">
            Trabajos Agendados
          </p>
        </div>
        
        <div class="text-center">
          <p class="text-2xl font-bold text-purple-600">
            {{ monthSummary.utilization }}%
          </p>
          <p class="text-xs text-gray-600">
            Utilización Promedio
          </p>
        </div>
        
        <div class="text-center">
          <p class="text-2xl font-bold text-gray-600">
            {{ monthSummary.revenue }}
          </p>
          <p class="text-xs text-gray-600">
            Ingresos Estimados
          </p>
        </div>
      </div>
      
      <!-- Busiest Days -->
      <div class="mt-4 pt-4 border-t border-gray-200">
        <h5 class="text-sm font-medium text-gray-900 mb-2">
          Días con Mayor Actividad
        </h5>
        <div class="flex flex-wrap gap-2">
          <div
            v-for="day in busiestDays"
            :key="day.date"
            class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium"
          >
            {{ formatDate(day.date) }} ({{ day.jobs }} trabajos)
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatInBuenosAires, toBuenosAires, nowInBuenosAires } from '~/utils/timezone'

// ==========================================
// PROPS & EMITS
// ==========================================


const props = defineProps({
  year: {
    type: Number,
    default: nowInBuenosAires().year()
  },
  month: {
    type: Number,
    default: nowInBuenosAires().month()
  },
  technicianId: {
    type: String,
    default: ''
  },
  selectedDate: {
    type: String,
    default: undefined
  }
})

const emit = defineEmits(['date-click', 'job-click'])

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
  return start.startOf('week') // dayjs starts week on Sunday by default
})

const calendarEnd = computed(() => {
  const end = monthEnd.value
  return end.endOf('week')
})

const calendarDays = computed(() => {
  const days = []
  let current = calendarStart.value
  const today = formatInBuenosAires(nowInBuenosAires(), 'YYYY-MM-DD')
  
  while (current <= calendarEnd.value) {
    const dateString = formatInBuenosAires(current, 'YYYY-MM-DD')
    const scheduleDay = scheduleStore.getScheduleDay(dateString, props.technicianId)
    const dayJobs = scheduleStore.jobs.filter(job => 
      formatInBuenosAires(job.scheduledDate, 'YYYY-MM-DD') === dateString
    )
    
    days.push({
      date: dateString,
      dayNumber: current.date(),
      isCurrentMonth: current.month() === props.month,
      isToday: dateString === today,
      isSelected: dateString === props.selectedDate,
      stats: {
        total: scheduleDay.totalSlots,
        available: scheduleDay.availableSlots,
        booked: scheduleDay.bookedSlots,
        blocked: scheduleDay.blockedSlots
      },
      jobs: dayJobs,
      utilizationPercentage: scheduleDay.totalSlots > 0 
        ? Math.round((scheduleDay.bookedSlots / scheduleDay.totalSlots) * 100)
        : 0
    })
    
    current = current.add(1, 'day')
  }
  
  return days
})

const monthSummary = computed(() => {
  const currentMonthDays = calendarDays.value.filter(day => day.isCurrentMonth)
  const workingDays = currentMonthDays.filter(day => day.stats.total > 0)
  
  const totalAvailable = currentMonthDays.reduce((sum, day) => sum + day.stats.available, 0)
  const totalBooked = currentMonthDays.reduce((sum, day) => sum + day.stats.booked, 0)
  const totalRevenue = currentMonthDays.reduce((sum, day) => {
    return sum + day.jobs.reduce((jobSum, job) => jobSum + job.price, 0)
  }, 0)
  
  return {
    workingDays: workingDays.length,
    totalAvailable,
    totalBooked,
    utilization: totalAvailable > 0 ? Math.round((totalBooked / totalAvailable) * 100) : 0,
    revenue: `$${totalRevenue.toLocaleString()}`
  }
})

const busiestDays = computed(() => {
  return calendarDays.value
    .filter(day => day.isCurrentMonth && day.jobs.length > 0)
    .sort((a, b) => b.jobs.length - a.jobs.length)
    .slice(0, 5)
    .map(day => ({
      date: day.date,
      jobs: day.jobs.length
    }))
})

// ==========================================
// METHODS
// ==========================================

const handleDateClick = (date) => {
  emit('date-click', date)
}

const handleJobClick = (job) => {
  emit('job-click', job)
}

const getJobStatusClasses = (status) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'confirmed':
      return 'bg-blue-100 text-blue-800'
    case 'in_progress':
      return 'bg-purple-100 text-purple-800'
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const formatDate = (dateString) => {
  const date = toBuenosAires(dateString + 'T00:00:00')
  return date.format('D MMM')
}
</script>