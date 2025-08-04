<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200">
    <!-- Calendar Header -->
    <div class="px-6 py-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <!-- View Selection -->
        <div class="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            v-for="view in viewOptions"
            :key="view.value"
            type="button"
            :class="[
              'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
              currentView === view.value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            ]"
            @click="changeView(view.value)"
          >
            {{ view.label }}
          </button>
        </div>

        <!-- Date Navigation -->
        <div class="flex items-center space-x-4">
          <button
            type="button"
            class="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            @click="navigateDate(-1)"
          >
            <Icon
              name="mdi:chevron-left"
              class="w-5 h-5"
            />
          </button>
          
          <div class="text-center">
            <h2 class="text-lg font-semibold text-gray-900">
              {{ currentDateLabel }}
            </h2>
            <p class="text-sm text-gray-500">
              {{ currentDateSubtitle }}
            </p>
          </div>
          
          <button
            type="button"
            class="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            @click="navigateDate(1)"
          >
            <Icon
              name="mdi:chevron-right"
              class="w-5 h-5"
            />
          </button>
        </div>

        <!-- Actions -->
        <div class="flex items-center space-x-2">
          <button
            type="button"
            class="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            @click="goToToday"
          >
            Hoy
          </button>
          <button
            type="button"
            class="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            @click="openNewJobModal"
          >
            <Icon
              name="mdi:plus"
              class="w-4 h-4 mr-2"
            />
            Nuevo Trabajo
          </button>
        </div>
      </div>
    </div>

    <!-- Calendar Content -->
    <div class="p-6">
      <!-- Loading State -->
      <div
        v-if="scheduleStore.loading"
        class="flex items-center justify-center py-12"
      >
        <div class="text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p class="text-gray-500">Cargando agenda...</p>
        </div>
      </div>

      <!-- Error State -->
      <div
        v-else-if="scheduleStore.error"
        class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
      >
        <div class="flex">
          <Icon
            name="mdi:alert-circle-outline"
            class="w-5 h-5 text-red-400 mt-0.5"
          />
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">
              Error
            </h3>
            <p class="text-sm text-red-700 mt-1">
              {{ scheduleStore.error }}
            </p>
          </div>
        </div>
      </div>

      <!-- Calendar Views -->
      <div v-else>
        <!-- Day View -->
        <ScheduleDayView
          v-if="currentView === 'day'"
          :date="currentDate"
          :technician-id="technicianId"
          @job-click="handleJobClick"
          @slot-click="handleSlotClick"
        />

        <!-- Week View -->
        <ScheduleWeekView
          v-else-if="currentView === 'week'"
          :start-date="weekStartDate"
          :technician-id="technicianId"
          @job-click="handleJobClick"
          @slot-click="handleSlotClick"
        />

        <!-- Month View -->
        <ScheduleMonthView
          v-else-if="currentView === 'month'"
          :year="currentYear"
          :month="currentMonth"
          :technician-id="technicianId"
          @date-click="handleDateClick"
          @job-click="handleJobClick"
        />
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
      <div class="grid grid-cols-4 gap-4">
        <div class="text-center">
          <p class="text-2xl font-bold text-green-600">
            {{ todaysStats.available }}
          </p>
          <p class="text-xs text-gray-600">
            Slots Disponibles
          </p>
        </div>
        <div class="text-center">
          <p class="text-2xl font-bold text-blue-600">
            {{ todaysStats.booked }}
          </p>
          <p class="text-xs text-gray-600">
            Trabajos Agendados
          </p>
        </div>
        <div class="text-center">
          <p class="text-2xl font-bold text-gray-600">
            {{ todaysStats.blocked }}
          </p>
          <p class="text-xs text-gray-600">
            Horarios Bloqueados
          </p>
        </div>
        <div class="text-center">
          <p class="text-2xl font-bold text-purple-600">
            {{ todaysStats.utilization }}%
          </p>
          <p class="text-xs text-gray-600">
            Utilización
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ScheduleView, Job, TimeSlot } from '~/types'

// ==========================================
// PROPS & EMITS
// ==========================================

interface Props {
  technicianId: string
  initialView?: ScheduleView
  initialDate?: string
}

interface Emits {
  (e: 'job-selected', job: Job): void
  (e: 'slot-selected', slot: TimeSlot): void
  (e: 'new-job-requested', date: string, time?: string): void
}

const props = withDefaults(defineProps<Props>(), {
  initialView: 'week',
  initialDate: () => new Date().toISOString().split('T')[0]
})

const emit = defineEmits<Emits>()

// ==========================================
// COMPOSABLES
// ==========================================

const scheduleStore = useScheduleStore()
const technicianStore = useTechnicianStore()

// ==========================================
// STATE
// ==========================================

const currentView = ref<ScheduleView>(props.initialView)
const currentDate = ref<string>(props.initialDate)

// ==========================================
// COMPUTED
// ==========================================

const viewOptions = computed(() => [
  { label: 'Día', value: 'day' as ScheduleView },
  { label: 'Semana', value: 'week' as ScheduleView },
  { label: 'Mes', value: 'month' as ScheduleView }
])

const currentYear = computed(() => new Date(currentDate.value).getFullYear())
const currentMonth = computed(() => new Date(currentDate.value).getMonth())

const currentDateLabel = computed(() => {
  const date = new Date(currentDate.value)
  const formatter = new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: currentView.value === 'day' ? 'numeric' : undefined
  })
  
  if (currentView.value === 'week') {
    const weekStart = getWeekStartDate(date)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    
    const startFormatter = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' })
    const endFormatter = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
    
    return `${startFormatter.format(weekStart)} - ${endFormatter.format(weekEnd)}`
  }
  
  return formatter.format(date)
})

const currentDateSubtitle = computed(() => {
  const date = new Date(currentDate.value)
  
  if (currentView.value === 'day') {
    return new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(date)
  }
  
  if (currentView.value === 'week') {
    return `Semana ${getWeekNumber(date)}`
  }
  
  return `${date.getFullYear()}`
})

const weekStartDate = computed(() => {
  const date = new Date(currentDate.value)
  return getWeekStartDate(date).toISOString().split('T')[0]
})

const todaysStats = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  const scheduleDay = scheduleStore.getScheduleDay(today, props.technicianId)
  
  return {
    available: scheduleDay.availableSlots,
    booked: scheduleDay.bookedSlots,
    blocked: scheduleDay.blockedSlots,
    utilization: scheduleDay.totalSlots > 0 
      ? Math.round((scheduleDay.bookedSlots / scheduleDay.totalSlots) * 100)
      : 0
  }
})

// ==========================================
// METHODS
// ==========================================

const changeView = (view: ScheduleView): void => {
  currentView.value = view
}

const navigateDate = (direction: number): void => {
  const date = new Date(currentDate.value)
  
  switch (currentView.value) {
    case 'day':
      date.setDate(date.getDate() + direction)
      break
    case 'week':
      date.setDate(date.getDate() + (direction * 7))
      break
    case 'month':
      date.setMonth(date.getMonth() + direction)
      break
  }
  
  currentDate.value = date.toISOString().split('T')[0]
}

const goToToday = (): void => {
  currentDate.value = new Date().toISOString().split('T')[0]
}

const openNewJobModal = (): void => {
  emit('new-job-requested', currentDate.value)
}

const handleJobClick = (job: Job): void => {
  emit('job-selected', job)
}

const handleSlotClick = (slot: TimeSlot): void => {
  emit('slot-selected', slot)
}

const handleDateClick = (date: string): void => {
  currentDate.value = date
  currentView.value = 'day'
}

const getWeekStartDate = (date: Date): Date => {
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is sunday
  return new Date(date.setDate(diff))
}

const getWeekNumber = (date: Date): number => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}

// ==========================================
// LIFECYCLE
// ==========================================

onMounted(async () => {
  // Initialize stores
  await scheduleStore.initialize()
  
  // Generate time slots if technician has availability configured
  if (technicianStore.technician?.availability && technicianStore.hasAvailability) {
    await scheduleStore.generateTimeSlots(
      technicianStore.technician.availability,
      props.technicianId
    )
  }
})

// ==========================================
// WATCHERS
// ==========================================

watch(
  () => technicianStore.technician?.availability,
  async (newAvailability) => {
    if (newAvailability && technicianStore.hasAvailability) {
      await scheduleStore.generateTimeSlots(
        newAvailability,
        props.technicianId
      )
    }
  },
  { deep: true }
)
</script>