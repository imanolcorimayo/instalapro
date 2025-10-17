<template>
  <div class="date-time-selector">
    <!-- Date Selection: Week Calendar View -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">Selecciona una fecha</h3>

      <!-- Week Navigation -->
      <div class="flex items-center justify-between mb-4">
        <button
          @click="previousWeek"
          :disabled="isCurrentWeek"
          :class="[
            'p-2 rounded-lg transition-colors',
            isCurrentWeek
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-blue-600 hover:bg-blue-50'
          ]"
        >
          <IconChevronLeft class="w-6 h-6" />
        </button>

        <span class="text-sm font-medium text-gray-700">
          {{ weekRangeText }}
        </span>

        <button
          @click="nextWeek"
          class="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
        >
          <IconChevronRight class="w-6 h-6" />
        </button>
      </div>

      <!-- Week Days Grid -->
      <div class="grid grid-cols-7 gap-2">
        <button
          v-for="day in weekDays"
          :key="day.date"
          @click="selectDate(day.date)"
          :disabled="day.isPast"
          :class="[
            'flex flex-col items-center justify-center p-3 rounded-xl cursor-pointer transition-all duration-200 border-2',
            selectedDate === day.date
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : day.isPast
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
              : day.hasAvailableSlots
              ? 'bg-white text-gray-800 border-gray-200 hover:border-gray-300 hover:shadow-sm'
              : 'bg-gray-50 text-gray-400 border-gray-200'
          ]"
        >
          <span class="text-xs font-medium">{{ day.dayName }}</span>
          <span class="text-lg font-semibold mt-1">{{ day.dayNumber }}</span>
          <span v-if="!day.isPast && day.hasAvailableSlots && selectedDate !== day.date" class="text-xs mt-1 text-blue-600">
            {{ day.availableCount }} slots
          </span>
        </button>
      </div>
    </div>

    <!-- Time Slot Selection -->
    <div v-if="selectedDate">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">Selecciona un horario</h3>

      <!-- Loading State -->
      <div v-if="slotStore.loading" class="text-center py-8">
        <div class="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
        <p class="text-gray-500 text-sm">Cargando horarios...</p>
      </div>

      <!-- No slots available -->
      <div v-else-if="availableHoursForSelectedDate.length === 0" class="text-center py-8">
        <IconCalendarRemove class="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p class="text-gray-600">No hay horarios disponibles para esta fecha.</p>
        <p class="text-gray-500 text-sm mt-2">Por favor, selecciona otra fecha.</p>
      </div>

      <!-- Time slots grouped by time of day -->
      <div v-else class="space-y-6">
        <!-- Morning -->
        <div v-if="timeSlotsByPeriod.morning.length > 0">
          <h4 class="text-sm font-medium text-gray-600 mb-3 flex items-center">
            <IconWeatherSunny class="w-5 h-5 mr-2 text-yellow-500" />
            Mañana (6:00 AM - 11:59 AM)
          </h4>
          <div class="grid grid-cols-3 gap-3">
            <button
              v-for="hour in timeSlotsByPeriod.morning"
              :key="hour"
              @click="selectTime(hour)"
              :class="[
                'py-3 px-4 rounded-xl font-medium transition-all duration-200 border-2',
                selectedHour === hour
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-gray-800 border-gray-200 hover:border-gray-300 hover:shadow-sm'
              ]"
            >
              {{ formatHour(hour) }}
            </button>
          </div>
        </div>

        <!-- Afternoon -->
        <div v-if="timeSlotsByPeriod.afternoon.length > 0">
          <h4 class="text-sm font-medium text-gray-600 mb-3 flex items-center">
            <IconWeatherPartlyCloudy class="w-5 h-5 mr-2 text-orange-500" />
            Tarde (12:00 PM - 5:59 PM)
          </h4>
          <div class="grid grid-cols-3 gap-3">
            <button
              v-for="hour in timeSlotsByPeriod.afternoon"
              :key="hour"
              @click="selectTime(hour)"
              :class="[
                'py-3 px-4 rounded-xl font-medium transition-all duration-200 border-2',
                selectedHour === hour
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-gray-800 border-gray-200 hover:border-gray-300 hover:shadow-sm'
              ]"
            >
              {{ formatHour(hour) }}
            </button>
          </div>
        </div>

        <!-- Evening -->
        <div v-if="timeSlotsByPeriod.evening.length > 0">
          <h4 class="text-sm font-medium text-gray-600 mb-3 flex items-center">
            <IconWeatherNight class="w-5 h-5 mr-2 text-indigo-500" />
            Noche (6:00 PM - 10:00 PM)
          </h4>
          <div class="grid grid-cols-3 gap-3">
            <button
              v-for="hour in timeSlotsByPeriod.evening"
              :key="hour"
              @click="selectTime(hour)"
              :class="[
                'py-3 px-4 rounded-xl font-medium transition-all duration-200 border-2',
                selectedHour === hour
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-gray-800 border-gray-200 hover:border-gray-300 hover:shadow-sm'
              ]"
            >
              {{ formatHour(hour) }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- No date selected message -->
    <div v-else class="text-center py-12">
      <IconCalendarBlank class="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <p class="text-gray-500">Selecciona una fecha para ver los horarios disponibles</p>
    </div>
  </div>
</template>

<script setup>
import { useDayjs } from '#dayjs'
import IconChevronLeft from '~icons/mdi/chevron-left'
import IconChevronRight from '~icons/mdi/chevron-right'
import IconWeatherSunny from '~icons/mdi/weather-sunny'
import IconWeatherPartlyCloudy from '~icons/mdi/weather-partly-cloudy'
import IconWeatherNight from '~icons/mdi/weather-night'
import IconCalendarBlank from '~icons/mdi/calendar-blank-outline'
import IconCalendarRemove from '~icons/mdi/calendar-remove-outline'
import { filterHoursByTimeConstraints } from '~/utils/timeUtils'

const dayjs = useDayjs()
const bookingStore = useBookingStore()
const slotStore = useSlotAvailabilityStore()

const props = defineProps({
  technicianUserUid: {
    type: String,
    required: true
  }
})

// State
const currentWeekStart = ref(dayjs().startOf('week'))
const selectedDate = ref(bookingStore.selectedDate)
const selectedHour = ref(bookingStore.selectedHour)

// Computed
const isCurrentWeek = computed(() => {
  return currentWeekStart.value.isSame(dayjs().startOf('week'), 'day')
})

const weekRangeText = computed(() => {
  const start = currentWeekStart.value
  const end = currentWeekStart.value.add(6, 'days')

  if (start.month() === end.month()) {
    return `${start.format('D')} - ${end.format('D')} de ${start.format('MMMM YYYY')}`
  } else {
    return `${start.format('D MMM')} - ${end.format('D MMM YYYY')}`
  }
})

const weekDays = computed(() => {
  const days = []
  const today = dayjs().startOf('day')
  const serviceDuration = bookingStore.selectedService?.estimatedDuration || 60

  for (let i = 0; i < 7; i++) {
    const date = currentWeekStart.value.add(i, 'days')
    const dateString = date.format('YYYY-MM-DD')
    const allHours = slotStore.getAvailableHoursForDate(dateString)

    // Step 1: Filter by time constraints (past hours + minimum advance for today)
    const hoursAfterTimeFilter = filterHoursByTimeConstraints(dateString, allHours)

    // Step 2: Filter by service duration (must end by 10 PM)
    const validHours = hoursAfterTimeFilter.filter(hour => {
      const serviceEndHour = hour + Math.ceil(serviceDuration / 60)
      return serviceEndHour <= 22
    })

    days.push({
      date: dateString,
      dayName: date.format('ddd'),
      dayNumber: date.format('D'),
      isPast: date.isBefore(today),
      hasAvailableSlots: validHours.length > 0,
      availableCount: validHours.length
    })
  }

  return days
})

const availableHoursForSelectedDate = computed(() => {
  if (!selectedDate.value) return []
  return slotStore.getAvailableHoursForDate(selectedDate.value)
})

const timeSlotsByPeriod = computed(() => {
  if (!selectedDate.value) {
    return { morning: [], afternoon: [], evening: [] }
  }

  // Get all available hours for the selected date
  const hours = slotStore.getAvailableHoursForDate(selectedDate.value)

  // Get service duration (default to 60 minutes if not set)
  const serviceDuration = bookingStore.selectedService?.estimatedDuration || 60

  // Step 1: Filter by time constraints (past hours + minimum advance for today)
  const hoursAfterTimeFilter = filterHoursByTimeConstraints(selectedDate.value, hours)

  // Step 2: Filter by service duration
  // A slot is valid if: slotHour + Math.ceil(serviceDuration / 60) <= 22
  // This ensures the service ends by 10 PM (hour 22)
  const validHours = hoursAfterTimeFilter.filter(hour => {
    const serviceEndHour = hour + Math.ceil(serviceDuration / 60)
    return serviceEndHour <= 22
  })

  // Group filtered hours by time of day
  return {
    morning: validHours.filter(h => h >= 6 && h < 12),   // 6 AM - 11:59 AM
    afternoon: validHours.filter(h => h >= 12 && h < 18), // 12 PM - 5:59 PM
    evening: validHours.filter(h => h >= 18 && h <= 22)   // 6 PM - 10 PM
  }
})

// Methods
const previousWeek = () => {
  if (!isCurrentWeek.value) {
    currentWeekStart.value = currentWeekStart.value.subtract(7, 'days')
    loadSlotsForWeek()
  }
}

const nextWeek = () => {
  currentWeekStart.value = currentWeekStart.value.add(7, 'days')
  loadSlotsForWeek()
}

const selectDate = (date) => {
  const selectedDay = dayjs(date)
  const today = dayjs().startOf('day')

  if (selectedDay.isBefore(today)) {
    return // Don't allow selecting past dates
  }

  selectedDate.value = date
  selectedHour.value = null // Reset hour when changing date
}

const selectTime = (hour) => {
  // Toggle selection - if same hour clicked, deselect it
  if (selectedHour.value === hour) {
    selectedHour.value = null
    // Clear date/time selection in booking store
    bookingStore.selectDateTime('', -1)
  } else {
    selectedHour.value = hour
    if (selectedDate.value && selectedHour.value !== null) {
      bookingStore.selectDateTime(selectedDate.value, selectedHour.value)
    }
  }
}

const formatHour = (hour) => {
  const period = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${displayHour}:00 ${period}`
}

const loadSlotsForWeek = async () => {
  const startDate = currentWeekStart.value.format('YYYY-MM-DD')
  const endDate = currentWeekStart.value.add(6, 'days').format('YYYY-MM-DD')

  console.log('[DateTimeSelector] Loading slots for week:', { startDate, endDate, technicianUserUid: props.technicianUserUid })
  await slotStore.loadAvailableSlots(startDate, endDate, props.technicianUserUid)
  console.log('[DateTimeSelector] Loaded slots:', slotStore.availableSlots.length, 'slots')
  console.log('[DateTimeSelector] Slot details:', slotStore.availableSlots)
}

// Load initial data
onMounted(async () => {
  console.log('[DateTimeSelector] Component mounted')
  await loadSlotsForWeek()

  // Auto-select first available date if no date is already selected
  if (!selectedDate.value) {
    // Find the first day that has available slots and is not in the past
    const firstAvailableDay = weekDays.value.find(day =>
      !day.isPast && day.hasAvailableSlots
    )

    if (firstAvailableDay) {
      selectedDate.value = firstAvailableDay.date
      console.log('[DateTimeSelector] Auto-selected first available date:', firstAvailableDay.date, `(${firstAvailableDay.availableCount} slots)`)
    } else {
      console.log('[DateTimeSelector] No available dates found in the current week')
    }
  }
})
</script>
