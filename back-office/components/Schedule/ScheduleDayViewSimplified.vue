<template>
  <div class="bg-white">
    <!-- Day Header -->
    <div class="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
      <div>
        <h3 class="text-xl font-semibold text-gray-900">
          {{ dayName }}
        </h3>
        <p class="text-sm text-gray-500">
          {{ formattedDate }}
        </p>
      </div>
      
      <!-- Quick Stats -->
      <div class="flex items-center space-x-6 text-sm">
        <div class="text-center">
          <p class="text-lg font-semibold text-blue-600">{{ scheduleDay.bookedSlots }}</p>
          <p class="text-gray-500">Trabajos</p>
        </div>
        <div class="text-center">
          <p class="text-lg font-semibold text-green-600">{{ scheduleDay.availableSlots }}</p>
          <p class="text-gray-500">Disponibles</p>
        </div>
      </div>
    </div>

    <!-- Time Slots -->
    <div v-if="scheduleDay.isAvailable" class="p-4">
      <!-- Current Time Indicator -->
      <div
        v-if="isToday && currentTimeSlot"
        class="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg"
      >
        <div class="flex items-center">
          <IconClockOutline class="w-5 h-5 text-blue-600 mr-3" />
          <div>
            <p class="text-sm font-medium text-blue-900">
              Ahora: {{ currentTime }}
            </p>
            <p class="text-xs text-blue-700">
              {{ getCurrentSlotStatus() }}
            </p>
          </div>
        </div>
      </div>

      <!-- Time Slot List - Simplified -->
      <div class="space-y-2">
        <div
          v-for="slot in visibleTimeSlots"
          :key="slot.id"
          :class="[
            'border rounded-lg p-4 transition-all duration-200 cursor-pointer',
            getSlotClasses(slot),
            isCurrentTimeSlot(slot) ? 'ring-2 ring-blue-500 ring-opacity-50 shadow-md' : 'hover:shadow-sm'
          ]"
          @click="handleSlotClick(slot)"
        >
          <div class="flex items-center justify-between">
            <!-- Time and Status -->
            <div class="flex items-center">
              <component
                :is="getSlotIcon(slot)"
                :class="['w-5 h-5 mr-3', getSlotIconColor(slot)]"
              />
              <div>
                <p class="font-medium text-gray-900">
                  {{ slot.startTime }} - {{ slot.endTime }}
                </p>
                <p class="text-sm text-gray-500">
                  {{ getStatusLabel(slot.status) }} • {{ formatDuration(slot.duration) }}
                </p>
              </div>
            </div>

            <!-- Slot Content -->
            <div class="text-right">
              <!-- Booked Job -->
              <div v-if="slot.status === 'booked' && slot.jobId">
                <p class="font-medium text-gray-900">
                  {{ getJobForSlot(slot)?.clientName }}
                </p>
                <p class="text-sm text-gray-600">
                  {{ getJobForSlot(slot)?.serviceType }}
                </p>
                <p class="text-xs text-green-600 font-medium">
                  ${{ formatPrice(getJobForSlot(slot)?.price || 0) }}
                </p>
              </div>

              <!-- Available Slot -->
              <div v-else-if="slot.status === 'available'" class="text-green-600">
                <IconPlusCircle class="w-6 h-6" />
              </div>

              <!-- Break/Blocked -->
              <div v-else class="text-gray-500">
                <component :is="getSlotIcon(slot)" class="w-6 h-6" />
              </div>
            </div>
          </div>

          <!-- Quick Actions for Available Slots -->
          <div
            v-if="slot.status === 'available'"
            class="mt-3 pt-3 border-t border-gray-100"
          >
            <button
              type="button"
              class="w-full px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              @click.stop="handleNewJob(slot)"
            >
              Agendar Trabajo
            </button>
          </div>
        </div>
      </div>

      <!-- Show More Button -->
      <div
        v-if="hasMoreSlots"
        class="mt-4 text-center"
      >
        <button
          type="button"
          class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          @click="toggleShowAll"
        >
          {{ showAllSlots ? 'Mostrar menos' : `Mostrar ${hiddenSlotsCount} más` }}
        </button>
      </div>
    </div>

    <!-- No Availability -->
    <div v-else class="text-center py-16">
      <IconCalendarRemove class="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">
        No hay disponibilidad
      </h3>
      <p class="text-gray-600 mb-6">
        No tienes horarios configurados para este día
      </p>
      <button
        type="button"
        class="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        @click="handleConfigureAvailability"
      >
        Configurar Horarios
      </button>
    </div>
  </div>
</template>

<script setup>
import IconClockOutline from '~icons/mdi/clock-outline'
import IconPlusCircle from '~icons/mdi/plus-circle'
import IconCalendarRemove from '~icons/mdi/calendar-remove'
import IconCheckCircleOutline from '~icons/mdi/check-circle-outline'
import IconCalendarCheck from '~icons/mdi/calendar-check'
import IconBlockHelper from '~icons/mdi/block-helper'
import IconCoffeeOutline from '~icons/mdi/coffee-outline'
import { isTodayInBuenosAires, formatInBuenosAires, nowInBuenosAires, toBuenosAires } from '~/utils/timezone'

// ==========================================
// PROPS & EMITS
// ==========================================

const props = defineProps({
  date: {
    type: String,
    required: true
  },
  technicianId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['job-click', 'slot-click', 'new-job', 'configure-availability'])

// ==========================================
// COMPOSABLES
// ==========================================

const scheduleStore = useScheduleStore()

// ==========================================
// STATE
// ==========================================

const currentTime = ref('')
const showAllSlots = ref(false)

// ==========================================
// COMPUTED
// ==========================================

const scheduleDay = computed(() => {
  return scheduleStore.getScheduleDay(props.date, props.technicianId)
})

const isToday = computed(() => {
  return isTodayInBuenosAires(props.date)
})

const dayName = computed(() => {
  const date = toBuenosAires(props.date + 'T00:00:00')
  return date.format('dddd')
})

const formattedDate = computed(() => {
  const date = toBuenosAires(props.date + 'T00:00:00')
  return date.format('D [de] MMMM [de] YYYY')
})

const sortedTimeSlots = computed(() => {
  return scheduleDay.value.timeSlots.sort((a, b) => {
    return a.startTime.localeCompare(b.startTime)
  })
})

const visibleTimeSlots = computed(() => {
  if (showAllSlots.value) {
    return sortedTimeSlots.value
  }
  // Show first 4 slots by default
  return sortedTimeSlots.value.slice(0, 4)
})

const hasMoreSlots = computed(() => {
  return sortedTimeSlots.value.length > 4
})

const hiddenSlotsCount = computed(() => {
  return Math.max(0, sortedTimeSlots.value.length - 4)
})

const currentTimeSlot = computed(() => {
  if (!isToday.value) return null
  
  const now = nowInBuenosAires()
  const currentTimeString = formatInBuenosAires(now, 'HH:mm')
  
  return scheduleDay.value.timeSlots.find(slot => 
    slot.startTime <= currentTimeString && slot.endTime > currentTimeString
  )
})

// ==========================================
// METHODS
// ==========================================

const updateCurrentTime = () => {
  const now = nowInBuenosAires()
  currentTime.value = formatInBuenosAires(now, 'HH:mm')
}

const isCurrentTimeSlot = (slot) => {
  return currentTimeSlot.value?.id === slot.id
}

const getCurrentSlotStatus = () => {
  if (!currentTimeSlot.value) return 'Sin horario disponible'
  
  switch (currentTimeSlot.value.status) {
    case 'available':
      return 'Disponible para agendar'
    case 'booked':
      const job = getJobForSlot(currentTimeSlot.value)
      return `Trabajo con ${job?.clientName || 'cliente'}`
    case 'break':
      return 'Tiempo de descanso'
    case 'blocked':
      return 'Horario bloqueado'
    default:
      return 'Estado desconocido'
  }
}

const getSlotClasses = (slot) => {
  const baseClasses = 'transition-all duration-200'
  
  switch (slot.status) {
    case 'available':
      return `${baseClasses} border-green-200 bg-green-50 hover:bg-green-100`
    case 'booked':
      return `${baseClasses} border-blue-200 bg-blue-50 hover:bg-blue-100`
    case 'blocked':
      return `${baseClasses} border-red-200 bg-red-50`
    case 'break':
      return `${baseClasses} border-gray-200 bg-gray-50`
    default:
      return `${baseClasses} border-gray-200`
  }
}

const getSlotIcon = (slot) => {
  switch (slot.status) {
    case 'available':
      return IconCheckCircleOutline
    case 'booked':
      return IconCalendarCheck
    case 'blocked':
      return IconBlockHelper
    case 'break':
      return IconCoffeeOutline
    default:
      return IconClockOutline
  }
}

const getSlotIconColor = (slot) => {
  switch (slot.status) {
    case 'available':
      return 'text-green-500'
    case 'booked':
      return 'text-blue-500'
    case 'blocked':
      return 'text-red-500'
    case 'break':
      return 'text-gray-500'
    default:
      return 'text-gray-400'
  }
}

const getStatusLabel = (status) => {
  const labels = {
    available: 'Disponible',
    booked: 'Ocupado',
    blocked: 'Bloqueado',
    break: 'Descanso'
  }
  return labels[status] || status
}

const getJobForSlot = (slot) => {
  if (!slot.jobId) return undefined
  return scheduleStore.jobs.find(job => job.id === slot.jobId)
}

const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}min`
  } else if (hours > 0) {
    return `${hours}h`
  } else {
    return `${mins}min`
  }
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'decimal',
    maximumFractionDigits: 0
  }).format(price)
}

const handleSlotClick = (slot) => {
  emit('slot-click', slot)
}

const handleNewJob = (slot) => {
  emit('new-job', slot.date, slot.startTime)
}

const handleConfigureAvailability = () => {
  emit('configure-availability')
}

const toggleShowAll = () => {
  showAllSlots.value = !showAllSlots.value
}

// ==========================================
// LIFECYCLE
// ==========================================

onMounted(() => {
  updateCurrentTime()
  
  // Update current time every minute
  setInterval(updateCurrentTime, 60000)
})
</script>