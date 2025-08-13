<template>
  <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
    <!-- Grid Header -->
    <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-medium text-gray-900">
          {{ title }}
        </h3>
        <div class="flex items-center space-x-4 text-xs text-gray-500">
          <div class="flex items-center">
            <div class="w-2 h-2 bg-green-500 rounded-full mr-1" />
            Disponible
          </div>
          <div class="flex items-center">
            <div class="w-2 h-2 bg-blue-500 rounded-full mr-1" />
            Agendado
          </div>
          <div class="flex items-center">
            <div class="w-2 h-2 bg-red-500 rounded-full mr-1" />
            Bloqueado
          </div>
          <div class="flex items-center">
            <div class="w-2 h-2 bg-gray-500 rounded-full mr-1" />
            Descanso
          </div>
        </div>
      </div>
    </div>

    <!-- Time Grid Container -->
    <div class="relative overflow-auto max-h-[600px]">
      <!-- Current Time Indicator -->
      <div
        v-if="showCurrentTime && currentTimePosition !== null"
        class="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
        :style="{ top: `${currentTimePosition}px` }"
      >
        <div class="w-16 bg-red-500 text-white text-center py-0.5 rounded-r text-xs font-medium">
          {{ currentTime }}
        </div>
        <div class="flex-1 h-0.5 bg-red-500" />
      </div>

      <!-- Grid Content -->
      <div class="relative">
        <!-- Hour Lines -->
        <div
          v-for="hour in hours"
          :key="hour"
          class="relative border-b border-gray-100"
          :style="{ height: `${hourHeight}px` }"
        >
          <!-- Hour Label -->
          <div class="absolute -left-1 -top-2 bg-white px-2 text-xs font-medium text-gray-500 z-10">
            {{ formatHour(hour) }}
          </div>

          <!-- 15-minute Lines -->
          <div class="absolute inset-x-0 top-1/4 h-px bg-gray-50" />
          <div class="absolute inset-x-0 top-2/4 h-px bg-gray-100" />
          <div class="absolute inset-x-0 top-3/4 h-px bg-gray-50" />
        </div>

        <!-- Time Slots -->
        <div class="absolute inset-0 pl-16">
          <div
            v-for="slot in timeSlots"
            :key="slot.id"
            :class="[
              'absolute inset-x-0 cursor-pointer border border-opacity-50 group',
              getSlotClasses(slot)
            ]"
            :style="getSlotStyle(slot)"
            @click="handleSlotClick(slot)"
            @mouseenter="handleSlotHover(slot, true)"
            @mouseleave="handleSlotHover(slot, false)"
          >
            <!-- Slot Content -->
            <div class="h-full p-1 flex flex-col justify-center">
              <!-- Booked Job -->
              <div
                v-if="slot.status === 'booked' && slot.jobId"
                class="text-xs"
              >
                <div class="font-medium text-white truncate">
                  {{ getJobForSlot(slot)?.clientName }}
                </div>
                <div class="text-white text-opacity-90 truncate">
                  {{ getJobForSlot(slot)?.serviceType }}
                </div>
                <div class="text-white text-opacity-75 text-[10px]">
                  ${{ getJobForSlot(slot)?.price.toLocaleString() }}
                </div>
              </div>

              <!-- Blocked Slot -->
              <div
                v-else-if="slot.status === 'blocked'"
                class="text-xs text-center text-white"
              >
                <IconBlockHelper
                  class="w-4 h-4 mx-auto mb-1"
                />
                <div class="text-[10px] truncate">
                  Bloqueado
                </div>
              </div>

              <!-- Break Time -->
              <div
                v-else-if="slot.status === 'break'"
                class="text-xs text-center text-gray-600"
              >
                <IconCoffeeOutline
                  class="w-4 h-4 mx-auto mb-1"
                />
                <div class="text-[10px] truncate">
                  Descanso
                </div>
              </div>

              <!-- Available Slot -->
              <div
                v-else
                class="text-xs text-center text-green-700 group-hover:text-green-800"
              >
                <IconPlusCircleOutline
                  class="w-4 h-4 mx-auto mb-1 opacity-0 group-hover:opacity-100 transition-opacity"
                />
                <div class="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                  Disponible
                </div>
              </div>
            </div>

            <!-- Slot Actions (on hover) -->
            <div class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <div class="flex space-x-1">
                <button
                  v-if="slot.status === 'available'"
                  type="button"
                  class="p-1 bg-white rounded shadow text-green-600 hover:text-green-700"
                  @click.stop="handleBookSlot(slot)"
                >
                  <IconPlus
                    class="w-3 h-3"
                  />
                </button>
                
                <button
                  v-if="slot.status === 'booked'"
                  type="button"
                  class="p-1 bg-white rounded shadow text-blue-600 hover:text-blue-700"
                  @click.stop="handleEditJob(slot)"
                >
                  <IconPencil
                    class="w-3 h-3"
                  />
                </button>
                
                <button
                  v-if="slot.status === 'available'"
                  type="button"
                  class="p-1 bg-white rounded shadow text-red-600 hover:text-red-700"
                  @click.stop="handleBlockSlot(slot)"
                >
                  <IconBlockHelper
                    class="w-3 h-3"
                  />
                </button>
                
                <button
                  v-if="slot.status === 'blocked'"
                  type="button"
                  class="p-1 bg-white rounded shadow text-green-600 hover:text-green-700"
                  @click.stop="handleUnblockSlot(slot)"
                >
                  <IconCheck
                    class="w-3 h-3"
                  />
                </button>
              </div>
            </div>

            <!-- Slot Duration Indicator -->
            <div
              v-if="slot.duration !== defaultSlotDuration"
              class="absolute bottom-0 right-1 text-[10px] text-white bg-black bg-opacity-50 px-1 rounded"
            >
              {{ slot.duration }}min
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Grid Footer with Quick Actions -->
    <div class="px-4 py-3 bg-gray-50 border-t border-gray-200">
      <div class="flex items-center justify-between">
        <div class="text-xs text-gray-500">
          {{ timeSlots.length }} slots totales
        </div>
        
        <div class="flex items-center space-x-2">
          <button
            type="button"
            class="px-2 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50"
            @click="handleRefresh"
          >
            Actualizar
          </button>
          
          <button
            type="button"
            class="px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
            @click="handleQuickBook"
          >
            Reserva Rápida
          </button>
        </div>
      </div>
    </div>

    <!-- Tooltip for Slot Details -->
    <div
      v-if="hoveredSlot"
      ref="tooltipRef"
      class="fixed z-50 p-2 bg-gray-900 text-white text-xs rounded shadow-lg pointer-events-none"
      :style="tooltipStyle"
    >
      <div class="font-medium">
        {{ hoveredSlot.startTime }} - {{ hoveredSlot.endTime }}
      </div>
      <div class="text-gray-300">
        Estado: {{ getStatusLabel(hoveredSlot.status) }}
      </div>
      <div
        v-if="hoveredSlot.status === 'booked' && hoveredSlot.jobId"
        class="text-gray-300"
      >
        Cliente: {{ getJobForSlot(hoveredSlot)?.clientName }}
      </div>
    </div>
  </div>
</template>

<script setup>
import IconBlockHelper from '~icons/mdi/block-helper'
import IconCoffeeOutline from '~icons/mdi/coffee-outline'
import IconPlusCircleOutline from '~icons/mdi/plus-circle-outline'
import IconPlus from '~icons/mdi/plus'
import IconPencil from '~icons/mdi/pencil'
import IconCheck from '~icons/mdi/check'
import { formatInBuenosAires, nowInBuenosAires } from '~/utils/timezone'

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
    default: ''
  },
  title: {
    type: String,
    default: 'Horarios del Día'
  },
  hourHeight: {
    type: Number,
    default: 80
  },
  showCurrentTime: {
    type: Boolean,
    default: true
  },
  defaultSlotDuration: {
    type: Number,
    default: 60
  }
})

const emit = defineEmits(['slot-click', 'book-slot', 'block-slot', 'edit-job', 'refresh', 'quick-book'])

// ==========================================
// COMPOSABLES
// ==========================================

const scheduleStore = useScheduleStore()

// ==========================================
// STATE
// ==========================================

const hoveredSlot = ref(null)
const tooltipStyle = ref({})
const tooltipRef = ref()
const currentTime = ref('')
const currentTimePosition = ref(null)

// ==========================================
// COMPUTED
// ==========================================

const scheduleDay = computed(() => {
  return scheduleStore.getScheduleDay(props.date, props.technicianId)
})

const timeSlots = computed(() => {
  return scheduleDay.value.timeSlots.sort((a, b) => {
    return a.startTime.localeCompare(b.startTime)
  })
})

const hours = computed(() => {
  if (timeSlots.value.length === 0) return []
  
  const startHour = Math.min(...timeSlots.value.map(slot => 
    parseInt(slot.startTime.split(':')[0])
  ))
  const endHour = Math.max(...timeSlots.value.map(slot => 
    parseInt(slot.endTime.split(':')[0])
  ))
  
  const hours = []
  for (let i = startHour; i <= endHour; i++) {
    hours.push(i)
  }
  return hours
})

const isToday = computed(() => {
  const today = formatInBuenosAires(nowInBuenosAires(), 'YYYY-MM-DD')
  return props.date === today
})

// ==========================================
// METHODS
// ==========================================

const updateCurrentTime = () => {
  const now = nowInBuenosAires()
  currentTime.value = now.format('HH:mm')
  
  if (isToday.value && hours.value.length > 0) {
    const currentMinutes = now.hour() * 60 + now.minute()
    const startHour = Math.min(...hours.value)
    const startMinutes = startHour * 60
    
    if (currentMinutes >= startMinutes) {
      const relativeMinutes = currentMinutes - startMinutes
      currentTimePosition.value = (relativeMinutes / 60) * props.hourHeight
    } else {
      currentTimePosition.value = null
    }
  } else {
    currentTimePosition.value = null
  }
}

const formatHour = (hour) => {
  return `${hour.toString().padStart(2, '0')}:00`
}

const getSlotStyle = (slot) => {
  if (hours.value.length === 0) return {}
  
  const startHour = Math.min(...hours.value)
  const slotStartMinutes = parseTimeToMinutes(slot.startTime)
  const startMinutes = startHour * 60
  
  const top = ((slotStartMinutes - startMinutes) / 60) * props.hourHeight
  const height = (slot.duration / 60) * props.hourHeight
  
  return {
    top: `${top}px`,
    height: `${Math.max(height - 2, 20)}px`
  }
}

const getSlotClasses = (slot) => {
  const baseClasses = 'hover:shadow-md transition-all duration-200'
  
  switch (slot.status) {
    case 'available':
      return `${baseClasses} border-green-300 bg-green-100 hover:bg-green-200`
    case 'booked':
      return `${baseClasses} border-blue-500 bg-blue-500 hover:bg-blue-600 shadow-sm`
    case 'blocked':
      return `${baseClasses} border-red-500 bg-red-500 hover:bg-red-600 shadow-sm`
    case 'break':
      return `${baseClasses} border-gray-400 bg-gray-200 hover:bg-gray-300`
    default:
      return baseClasses
  }
}

const getStatusLabel = (status) => {
  const labels = {
    available: 'Disponible',
    booked: 'Agendado',
    blocked: 'Bloqueado',
    break: 'Descanso'
  }
  return labels[status] || status
}

const parseTimeToMinutes = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number)
  return hours * 60 + minutes
}

const getJobForSlot = (slot) => {
  if (!slot.jobId) return undefined
  return scheduleStore.jobs.find(job => job.id === slot.jobId)
}

const handleSlotClick = (slot) => {
  emit('slot-click', slot)
}

const handleBookSlot = (slot) => {
  emit('book-slot', slot)
}

const handleBlockSlot = (slot) => {
  emit('block-slot', slot)
}

const handleEditJob = (slot) => {
  emit('edit-job', slot)
}

const handleUnblockSlot = async (slot) => {
  await scheduleStore.unblockTimeSlot(slot.id)
}

const handleRefresh = () => {
  emit('refresh')
}

const handleQuickBook = () => {
  emit('quick-book')
}

const handleSlotHover = (slot, isEntering) => {
  if (isEntering) {
    hoveredSlot.value = slot
    updateTooltipPosition()
  } else {
    hoveredSlot.value = null
  }
}

const updateTooltipPosition = () => {
  if (!hoveredSlot.value) return
  
  // Get mouse position and adjust tooltip
  const handleMouseMove = (event) => {
    tooltipStyle.value = {
      left: `${event.clientX + 10}px`,
      top: `${event.clientY - 10}px`
    }
  }
  
  document.addEventListener('mousemove', handleMouseMove, { once: true })
}

// ==========================================
// LIFECYCLE
// ==========================================

onMounted(() => {
  updateCurrentTime()
  
  // Update current time every minute
  const timeInterval = setInterval(updateCurrentTime, 60000)
  
  onUnmounted(() => {
    clearInterval(timeInterval)
  })
})

// ==========================================
// WATCHERS
// ==========================================

watch(
  () => props.date,
  () => {
    updateCurrentTime()
  }
)
</script>