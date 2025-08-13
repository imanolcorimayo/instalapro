<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200">
    <!-- Simplified Header -->
    <div class="px-6 py-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <!-- View Selection - Simplified -->
        <div class="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            v-for="view in viewOptions"
            :key="view.value"
            type="button"
            :class="[
              'px-4 py-2 text-sm font-medium rounded-md transition-colors',
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
            class="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
            @click="navigateDate(-1)"
          >
            <IconChevronLeft class="w-5 h-5" />
          </button>
          
          <div class="text-center min-w-[200px]">
            <h2 class="text-lg font-semibold text-gray-900">
              {{ currentDateLabel }}
            </h2>
          </div>
          
          <button
            type="button"
            class="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
            @click="navigateDate(1)"
          >
            <IconChevronRight class="w-5 h-5" />
          </button>
        </div>

        <!-- Actions - Simplified -->
        <div class="flex items-center space-x-3">
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            @click="goToToday"
          >
            Hoy
          </button>
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            @click="openNewJobModal"
          >
            <IconPlus class="w-4 h-4 mr-2" />
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
        class="flex items-center justify-center py-16"
      >
        <div class="text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p class="text-gray-500">Cargando agenda...</p>
        </div>
      </div>

      <!-- Error State -->
      <div
        v-else-if="scheduleStore.error"
        class="bg-red-50 border border-red-200 rounded-lg p-6 text-center"
      >
        <IconAlertCircleOutline class="w-8 h-8 text-red-400 mx-auto mb-3" />
        <h3 class="text-sm font-medium text-red-800 mb-2">Error en la Agenda</h3>
        <p class="text-sm text-red-700">{{ scheduleStore.error }}</p>
        <button
          type="button"
          class="mt-4 px-4 py-2 text-sm font-medium text-red-700 hover:text-red-900 transition-colors"
          @click="retryLoad"
        >
          Reintentar
        </button>
      </div>

      <!-- Calendar Views -->
      <div v-else>
        <!-- Day View -->
        <ScheduleDayViewSimplified
          v-if="currentView === 'day'"
          :date="currentDate"
          :technician-id="technicianId"
          @job-click="handleJobClick"
          @slot-click="handleSlotClick"
          @new-job="handleNewJobAtTime"
        />

        <!-- Week View -->
        <ScheduleWeekViewSimplified
          v-else-if="currentView === 'week'"
          :start-date="weekStartDate"
          :technician-id="technicianId"
          @job-click="handleJobClick"
          @slot-click="handleSlotClick"
          @date-click="handleDateClick"
        />

        <!-- Month View -->
        <ScheduleMonthViewSimplified
          v-else-if="currentView === 'month'"
          :year="currentYear"
          :month="currentMonth"
          :technician-id="technicianId"
          @date-click="handleDateClick"
          @job-click="handleJobClick"
        />
      </div>
    </div>

    <!-- Simplified Stats Footer - Only essential info -->
    <div
      v-if="!scheduleStore.loading && !scheduleStore.error"
      class="px-6 py-3 border-t border-gray-200 bg-gray-50"
    >
      <div class="flex items-center justify-between text-sm text-gray-600">
        <div class="flex items-center space-x-6">
          <span>
            <span class="font-medium text-blue-600">{{ todaysStats.booked }}</span>
            trabajos hoy
          </span>
          <span>
            <span class="font-medium text-green-600">{{ todaysStats.available }}</span>
            slots disponibles
          </span>
        </div>
        <div v-if="todaysStats.total > 0">
          {{ todaysStats.utilization }}% ocupación
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import IconChevronLeft from '~icons/mdi/chevron-left'
import IconChevronRight from '~icons/mdi/chevron-right'
import IconPlus from '~icons/mdi/plus'
import IconAlertCircleOutline from '~icons/mdi/alert-circle-outline'
import { formatInBuenosAires, startOfWeekInBuenosAires, nowInBuenosAires, toBuenosAires } from '~/utils/timezone'

// ==========================================
// PROPS & EMITS
// ==========================================
const props = defineProps({
  technicianId: {
    type: String,
    required: true
  },
  initialView: {
    type: String,
    default: 'week'
  },
  initialDate: {
    type: String,
    default: () => formatInBuenosAires(nowInBuenosAires(), 'YYYY-MM-DD')
  }
})

const emit = defineEmits(['job-selected', 'slot-selected', 'new-job-requested'])

// ==========================================
// COMPOSABLES
// ==========================================

const scheduleStore = useScheduleStore()
const technicianStore = useTechnicianStore()

// ==========================================
// STATE
// ==========================================

const currentView = ref(props.initialView)
const currentDate = ref(props.initialDate)

// ==========================================
// COMPUTED
// ==========================================

const viewOptions = computed(() => [
  { label: 'Día', value: 'day' },
  { label: 'Semana', value: 'week' },
  { label: 'Mes', value: 'month' }
])

const currentYear = computed(() => toBuenosAires(currentDate.value + 'T00:00:00').year())
const currentMonth = computed(() => toBuenosAires(currentDate.value + 'T00:00:00').month())

const currentDateLabel = computed(() => {
  const date = toBuenosAires(currentDate.value + 'T00:00:00')
  
  if (currentView.value === 'day') {
    return date.format('dddd, D [de] MMMM [de] YYYY')
  }
  
  if (currentView.value === 'week') {
    const weekStart = startOfWeekInBuenosAires(date)
    const weekEnd = weekStart.add(6, 'day')
    
    return `${weekStart.format('D MMM')} - ${weekEnd.format('D MMM YYYY')}`
  }
  
  return date.format('MMMM [de] YYYY')
})

const weekStartDate = computed(() => {
  const date = toBuenosAires(currentDate.value + 'T00:00:00')
  const weekStart = startOfWeekInBuenosAires(date)
  return formatInBuenosAires(weekStart, 'YYYY-MM-DD')
})

const todaysStats = computed(() => {
  const today = formatInBuenosAires(nowInBuenosAires(), 'YYYY-MM-DD')
  const scheduleDay = scheduleStore.getScheduleDay(today, props.technicianId)
  
  return {
    available: scheduleDay.availableSlots,
    booked: scheduleDay.bookedSlots,
    total: scheduleDay.totalSlots,
    utilization: scheduleDay.totalSlots > 0 
      ? Math.round((scheduleDay.bookedSlots / scheduleDay.totalSlots) * 100)
      : 0
  }
})

// ==========================================
// METHODS
// ==========================================

const changeView = (view) => {
  currentView.value = view
}

const navigateDate = (direction) => {
  const date = toBuenosAires(currentDate.value + 'T00:00:00')
  
  let newDate
  switch (currentView.value) {
    case 'day':
      newDate = date.add(direction, 'day')
      break
    case 'week':
      newDate = date.add(direction * 7, 'day')
      break
    case 'month':
      newDate = date.add(direction, 'month')
      break
    default:
      newDate = date
  }
  
  currentDate.value = formatInBuenosAires(newDate, 'YYYY-MM-DD')
}

const goToToday = () => {
  currentDate.value = formatInBuenosAires(nowInBuenosAires(), 'YYYY-MM-DD')
}

const openNewJobModal = () => {
  emit('new-job-requested', currentDate.value)
}

const handleJobClick = (job) => {
  emit('job-selected', job)
}

const handleSlotClick = (slot) => {
  emit('slot-selected', slot)
}

const handleDateClick = (date) => {
  currentDate.value = date
  currentView.value = 'day'
}

const handleNewJobAtTime = (date, time) => {
  emit('new-job-requested', date, time)
}

const retryLoad = async () => {
  await scheduleStore.initialize()
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