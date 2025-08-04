<template>
  <div class="bg-white">
    <!-- Day Header -->
    <div class="flex items-center justify-between p-4 border-b border-gray-200">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">
          {{ dayName }}
        </h3>
        <p class="text-sm text-gray-500">
          {{ formattedDate }}
        </p>
      </div>
      
      <div class="flex items-center space-x-4 text-sm">
        <div class="flex items-center">
          <div class="w-3 h-3 bg-green-500 rounded-full mr-2" />
          <span class="text-gray-600">{{ scheduleDay.availableSlots }} Disponibles</span>
        </div>
        <div class="flex items-center">
          <div class="w-3 h-3 bg-blue-500 rounded-full mr-2" />
          <span class="text-gray-600">{{ scheduleDay.bookedSlots }} Agendados</span>
        </div>
        <div class="flex items-center">
          <div class="w-3 h-3 bg-red-500 rounded-full mr-2" />
          <span class="text-gray-600">{{ scheduleDay.blockedSlots }} Bloqueados</span>
        </div>
      </div>
    </div>

    <!-- Time Slots -->
    <div
      v-if="scheduleDay.isAvailable"
      class="p-4"
    >
      <!-- Current Time Indicator -->
      <div
        v-if="isToday && currentTimeSlot"
        class="relative mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg"
      >
        <div class="flex items-center">
          <Icon
            name="mdi:clock-outline"
            class="w-5 h-5 text-blue-600 mr-3"
          />
          <div>
            <p class="text-sm font-medium text-blue-900">
              Hora Actual: {{ currentTime }}
            </p>
            <p class="text-xs text-blue-700">
              {{ currentTimeSlot.status === 'available' ? 'Disponible ahora' : `Estado: ${getStatusLabel(currentTimeSlot.status)}` }}
            </p>
          </div>
        </div>
      </div>

      <!-- Time Slot Grid -->
      <div class="space-y-1">
        <div
          v-for="slot in groupedTimeSlots"
          :key="slot.id"
          :class="[
            'border rounded-lg p-3 cursor-pointer transition-all duration-200',
            getSlotClasses(slot),
            isCurrentTimeSlot(slot) ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
          ]"
          @click="handleSlotClick(slot)"
        >
          <div class="flex items-center justify-between">
            <!-- Time and Status -->
            <div class="flex items-center">
              <div class="flex items-center">
                <Icon
                  :name="getSlotIcon(slot)"
                  :class="['w-4 h-4 mr-3', getSlotIconColor(slot)]"
                />
                <div>
                  <p class="font-medium text-gray-900">
                    {{ slot.startTime }} - {{ slot.endTime }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ slot.duration }}min • {{ getStatusLabel(slot.status) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Slot Content -->
            <div class="flex-1 ml-4">
              <!-- Booked Job -->
              <div
                v-if="slot.status === 'booked' && slot.jobId"
                class="text-right"
              >
                <p class="font-medium text-gray-900">
                  {{ getJobForSlot(slot)?.clientName }}
                </p>
                <p class="text-sm text-gray-600">
                  {{ getJobForSlot(slot)?.serviceType }}
                </p>
                <p class="text-xs text-gray-500">
                  ${{ getJobForSlot(slot)?.price.toLocaleString() }}
                </p>
              </div>

              <!-- Blocked Slot -->
              <div
                v-else-if="slot.status === 'blocked'"
                class="text-right"
              >
                <p class="font-medium text-red-700">
                  Horario Bloqueado
                </p>
                <p class="text-sm text-red-600">
                  {{ getBlockedReason(slot) }}
                </p>
              </div>

              <!-- Break Time -->
              <div
                v-else-if="slot.status === 'break'"
                class="text-right"
              >
                <p class="font-medium text-gray-700">
                  Tiempo de Descanso
                </p>
                <p class="text-sm text-gray-600">
                  No disponible para reservas
                </p>
              </div>

              <!-- Available Slot -->
              <div
                v-else
                class="text-right"
              >
                <p class="font-medium text-green-700">
                  Disponible
                </p>
                <p class="text-sm text-gray-600">
                  Hacer clic para agendar
                </p>
              </div>
            </div>

            <!-- Actions -->
            <div class="ml-4 flex items-center space-x-2">
              <button
                v-if="slot.status === 'available'"
                type="button"
                class="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                @click.stop="handleBookSlot(slot)"
              >
                <Icon
                  name="mdi:plus-circle"
                  class="w-4 h-4"
                />
              </button>
              
              <button
                v-if="slot.status === 'booked'"
                type="button"
                class="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                @click.stop="handleEditJob(slot)"
              >
                <Icon
                  name="mdi:pencil"
                  class="w-4 h-4"
                />
              </button>
              
              <button
                v-if="slot.status === 'available'"
                type="button"
                class="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                @click.stop="handleBlockSlot(slot)"
              >
                <Icon
                  name="mdi:block-helper"
                  class="w-4 h-4"
                />
              </button>
              
              <button
                v-if="slot.status === 'blocked'"
                type="button"
                class="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                @click.stop="handleUnblockSlot(slot)"
              >
                <Icon
                  name="mdi:check-circle"
                  class="w-4 h-4"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Availability -->
    <div
      v-else
      class="text-center py-12"
    >
      <Icon
        name="mdi:calendar-remove"
        class="w-16 h-16 text-gray-300 mx-auto mb-4"
      />
      <h3 class="text-lg font-medium text-gray-900 mb-2">
        No hay disponibilidad
      </h3>
      <p class="text-gray-600 mb-4">
        No tienes horarios configurados para este día
      </p>
      <button
        type="button"
        class="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        @click="handleConfigureAvailability"
      >
        Configurar Disponibilidad
      </button>
    </div>

    <!-- Day Summary -->
    <div
      v-if="scheduleDay.isAvailable"
      class="p-4 border-t border-gray-200 bg-gray-50"
    >
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div>
          <p class="text-lg font-semibold text-gray-900">
            {{ scheduleDay.totalSlots }}
          </p>
          <p class="text-xs text-gray-600">
            Total Slots
          </p>
        </div>
        <div>
          <p class="text-lg font-semibold text-green-600">
            {{ scheduleDay.availableSlots }}
          </p>
          <p class="text-xs text-gray-600">
            Disponibles
          </p>
        </div>
        <div>
          <p class="text-lg font-semibold text-blue-600">
            {{ scheduleDay.bookedSlots }}
          </p>
          <p class="text-xs text-gray-600">
            Agendados
          </p>
        </div>
        <div>
          <p class="text-lg font-semibold text-purple-600">
            {{ dayUtilization }}%
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
import type { TimeSlot, Job, ScheduleDay } from '~/types'

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
  (e: 'book-slot', slot: TimeSlot): void
  (e: 'block-slot', slot: TimeSlot): void
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

// ==========================================
// COMPUTED
// ==========================================

const scheduleDay = computed((): ScheduleDay => {
  return scheduleStore.getScheduleDay(props.date, props.technicianId)
})

const isToday = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return props.date === today
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

const groupedTimeSlots = computed(() => {
  return scheduleDay.value.timeSlots.sort((a, b) => {
    return a.startTime.localeCompare(b.startTime)
  })
})

const currentTimeSlot = computed(() => {
  if (!isToday.value) return null
  
  const now = new Date()
  const currentTimeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
  
  return scheduleDay.value.timeSlots.find(slot => 
    slot.startTime <= currentTimeString && slot.endTime > currentTimeString
  )
})

const dayUtilization = computed(() => {
  return scheduleDay.value.totalSlots > 0 
    ? Math.round((scheduleDay.value.bookedSlots / scheduleDay.value.totalSlots) * 100)
    : 0
})

// ==========================================
// METHODS
// ==========================================

const updateCurrentTime = (): void => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const isCurrentTimeSlot = (slot: TimeSlot): boolean => {
  return currentTimeSlot.value?.id === slot.id
}

const getSlotClasses = (slot: TimeSlot): string => {
  const baseClasses = 'hover:shadow-md transition-all duration-200'
  
  switch (slot.status) {
    case 'available':
      return `${baseClasses} border-green-200 bg-green-50 hover:bg-green-100`
    case 'booked':
      return `${baseClasses} border-blue-200 bg-blue-50 hover:bg-blue-100`
    case 'blocked':
      return `${baseClasses} border-red-200 bg-red-50 hover:bg-red-100`
    case 'break':
      return `${baseClasses} border-gray-200 bg-gray-50 hover:bg-gray-100`
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
    booked: 'Agendado',
    blocked: 'Bloqueado',
    break: 'Descanso'
  }
  return labels[status as keyof typeof labels] || status
}

const getJobForSlot = (slot: TimeSlot): Job | undefined => {
  if (!slot.jobId) return undefined
  return scheduleStore.jobs.find(job => job.id === slot.jobId)
}

const getBlockedReason = (slot: TimeSlot): string => {
  const blockedSlot = scheduleStore.blockedSlots.find(blocked => 
    blocked.startDate === slot.date && 
    blocked.startTime === slot.startTime &&
    blocked.technicianId === slot.technicianId
  )
  return blockedSlot?.reason || 'Sin razón especificada'
}

const handleSlotClick = (slot: TimeSlot): void => {
  emit('slot-click', slot)
}

const handleBookSlot = (slot: TimeSlot): void => {
  emit('book-slot', slot)
}

const handleEditJob = (slot: TimeSlot): void => {
  const job = getJobForSlot(slot)
  if (job) {
    emit('job-click', job)
  }
}

const handleBlockSlot = (slot: TimeSlot): void => {
  emit('block-slot', slot)
}

const handleUnblockSlot = async (slot: TimeSlot): Promise<void> => {
  await scheduleStore.unblockTimeSlot(slot.id)
}

const handleConfigureAvailability = (): void => {
  emit('configure-availability')
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