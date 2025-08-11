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
          <Icon name="mdi:clock-outline" class="w-5 h-5 text-blue-600 mr-3" />
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
              <Icon
                :name="getSlotIcon(slot)"
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
                <Icon name="mdi:plus-circle" class="w-6 h-6" />
              </div>

              <!-- Break/Blocked -->
              <div v-else class="text-gray-500">
                <Icon :name="getSlotIcon(slot)" class="w-6 h-6" />
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
      <Icon name="mdi:calendar-remove" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
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

<script setup lang="ts">
import type { TimeSlot, Job, ScheduleDay } from '~/types'
import { isTodayInBuenosAires, formatInBuenosAires, nowInBuenosAires } from '~/utils/timezone'

// ==========================================
// PROPS & EMITS
// ==========================================

interface Props {
  date: string // YYYY-MM-DD format
  technicianId: string
}

interface Emits {
  (e: 'job-click', job: Job): void
  (e: 'slot-click', slot: TimeSlot): void
  (e: 'new-job', date: string, time: string): void
  (e: 'configure-availability'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// ==========================================
// COMPOSABLES
// ==========================================

const scheduleStore = useScheduleStore()

// ==========================================
// STATE
// ==========================================

const currentTime = ref<string>('')
const showAllSlots = ref<boolean>(false)

// ==========================================
// COMPUTED
// ==========================================

const scheduleDay = computed((): ScheduleDay => {
  return scheduleStore.getScheduleDay(props.date, props.technicianId)
})

const isToday = computed(() => {
  return isTodayInBuenosAires(props.date)
})

const dayName = computed(() => {
  const date = new Date(props.date)
  return new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(date)
})

const formattedDate = computed(() => {
  const date = new Date(props.date)
  return new Intl.DateTimeFormat('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }).format(date)
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

const updateCurrentTime = (): void => {
  const now = nowInBuenosAires()
  currentTime.value = formatInBuenosAires(now, 'HH:mm')
}

const isCurrentTimeSlot = (slot: TimeSlot): boolean => {
  return currentTimeSlot.value?.id === slot.id
}

const getCurrentSlotStatus = (): string => {
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

const getSlotClasses = (slot: TimeSlot): string => {
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

const getSlotIcon = (slot: TimeSlot): string => {
  switch (slot.status) {
    case 'available':
      return 'mdi:check-circle-outline'
    case 'booked':
      return 'mdi:calendar-check'
    case 'blocked':
      return 'mdi:block-helper'
    case 'break':
      return 'mdi:coffee-outline'
    default:
      return 'mdi:clock-outline'
  }
}

const getSlotIconColor = (slot: TimeSlot): string => {
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

const getStatusLabel = (status: string): string => {
  const labels = {
    available: 'Disponible',
    booked: 'Ocupado',
    blocked: 'Bloqueado',
    break: 'Descanso'
  }
  return labels[status as keyof typeof labels] || status
}

const getJobForSlot = (slot: TimeSlot): Job | undefined => {
  if (!slot.jobId) return undefined
  return scheduleStore.jobs.find(job => job.id === slot.jobId)
}

const formatDuration = (minutes: number): string => {
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

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'decimal',
    maximumFractionDigits: 0
  }).format(price)
}

const handleSlotClick = (slot: TimeSlot): void => {
  emit('slot-click', slot)
}

const handleNewJob = (slot: TimeSlot): void => {
  emit('new-job', slot.date, slot.startTime)
}

const handleConfigureAvailability = (): void => {
  emit('configure-availability')
}

const toggleShowAll = (): void => {
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