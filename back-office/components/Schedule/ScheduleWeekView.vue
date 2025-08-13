<template>
  <div class="bg-white">
    <!-- Week Days Header -->
    <div class="grid grid-cols-8 gap-px bg-gray-200 rounded-t-lg overflow-hidden">
      <!-- Time column header -->
      <div class="bg-gray-50 p-3">
        <span class="text-xs font-medium text-gray-500">Hora</span>
      </div>
      
      <!-- Day headers -->
      <div
        v-for="day in weekDays"
        :key="day.date"
        :class="[
          'bg-gray-50 p-3 text-center',
          isToday(day.date) ? 'bg-blue-50' : ''
        ]"
      >
        <div class="text-xs font-medium text-gray-900">
          {{ day.dayName }}
        </div>
        <div
          :class="[
            'text-lg font-semibold mt-1',
            isToday(day.date) ? 'text-blue-600' : 'text-gray-700'
          ]"
        >
          {{ day.dayNumber }}
        </div>
        <div class="text-xs text-gray-500 mt-1">
          {{ day.availability.available }}/{{ day.availability.total }} slots
        </div>
      </div>
    </div>

    <!-- Time Grid -->
    <div class="bg-gray-100 rounded-b-lg overflow-hidden">
      <div class="grid grid-cols-8 gap-px">
        <!-- Time slots -->
        <div
          v-for="hour in displayHours"
          :key="hour"
          class="contents"
        >
          <!-- Time label -->
          <div class="bg-white p-2 border-r border-gray-200">
            <span class="text-xs font-medium text-gray-500">
              {{ formatHour(hour) }}
            </span>
          </div>
          
          <!-- Day columns -->
          <div
            v-for="day in weekDays"
            :key="`${day.date}-${hour}`"
            class="bg-white min-h-[60px] border-r border-gray-200 relative"
          >
            <!-- Time slots for this hour -->
            <div
              v-for="slot in getSlotsForHour(day.date, hour)"
              :key="slot.id"
              :class="[
                'absolute inset-x-0 cursor-pointer border-l-2 px-1 py-0.5',
                getSlotClasses(slot)
              ]"
              :style="getSlotStyle(slot)"
              @click="handleSlotClick(slot)"
            >
              <!-- Job content -->
              <div
                v-if="slot.status === 'booked' && slot.jobId"
                class="text-xs"
              >
                <div class="font-medium truncate">
                  {{ getJobForSlot(slot)?.clientName }}
                </div>
                <div class="text-opacity-75 truncate">
                  {{ getJobForSlot(slot)?.serviceType }}
                </div>
              </div>
              
              <!-- Blocked slot content -->
              <div
                v-else-if="slot.status === 'blocked'"
                class="text-xs text-center"
              >
                <IconBlockHelper
                  class="w-3 h-3 mx-auto"
                />
                <div class="mt-0.5 truncate">
                  Bloqueado
                </div>
              </div>
              
              <!-- Break slot content -->
              <div
                v-else-if="slot.status === 'break'"
                class="text-xs text-center"
              >
                <IconCoffeeOutline
                  class="w-3 h-3 mx-auto"
                />
                <div class="mt-0.5 truncate">
                  Descanso
                </div>
              </div>
              
              <!-- Available slot (on hover) -->
              <div
                v-else
                class="text-xs text-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <IconPlusCircleOutline
                  class="w-3 h-3 mx-auto"
                />
                <div class="mt-0.5">
                  Disponible
                </div>
              </div>
            </div>
            
            <!-- Day separator lines -->
            <div class="absolute inset-y-0 right-0 w-px bg-gray-200" />
          </div>
        </div>
      </div>
    </div>

    <!-- Week Summary -->
    <div class="mt-4 bg-gray-50 rounded-lg p-4">
      <h4 class="text-sm font-medium text-gray-900 mb-3">
        Resumen de la Semana
      </h4>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="text-center">
          <p class="text-lg font-semibold text-green-600">
            {{ weekSummary.totalAvailable }}
          </p>
          <p class="text-xs text-gray-600">
            Slots Disponibles
          </p>
        </div>
        <div class="text-center">
          <p class="text-lg font-semibold text-blue-600">
            {{ weekSummary.totalBooked }}
          </p>
          <p class="text-xs text-gray-600">
            Trabajos Agendados
          </p>
        </div>
        <div class="text-center">
          <p class="text-lg font-semibold text-purple-600">
            {{ weekSummary.utilization }}%
          </p>
          <p class="text-xs text-gray-600">
            Utilización
          </p>
        </div>
        <div class="text-center">
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
import IconBlockHelper from '~icons/mdi/block-helper'
import IconCoffeeOutline from '~icons/mdi/coffee-outline'
import IconPlusCircleOutline from '~icons/mdi/plus-circle-outline'
import type { TimeSlot, Job, ScheduleWeek } from '~/types'
import { isTodayInBuenosAires, toBuenosAires } from '~/utils/timezone'

// ==========================================
// PROPS & EMITS
// ==========================================

interface Props {
  startDate: string // YYYY-MM-DD format
  technicianId: string
}

interface Emits {
  (e: 'job-click', job: Job): void
  (e: 'slot-click', slot: TimeSlot): void
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
    return {
      date: day.date,
      dayName: date.format('ddd'),
      dayNumber: date.date(),
      availability: {
        total: day.totalSlots,
        available: day.availableSlots,
        booked: day.bookedSlots,
        blocked: day.blockedSlots
      }
    }
  })
})

const displayHours = computed(() => {
  // Get all unique hours from time slots across the week
  const hours = new Set<number>()
  
  scheduleWeek.value.days.forEach(day => {
    day.timeSlots.forEach(slot => {
      const hour = parseInt(slot.startTime.split(':')[0])
      hours.add(hour)
    })
  })
  
  return Array.from(hours).sort((a, b) => a - b)
})

const weekSummary = computed(() => {
  const week = scheduleWeek.value
  return {
    totalAvailable: week.days.reduce((sum, day) => sum + day.availableSlots, 0),
    totalBooked: week.days.reduce((sum, day) => sum + day.bookedSlots, 0),
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

const formatHour = (hour: number): string => {
  return `${hour.toString().padStart(2, '0')}:00`
}

const getSlotsForHour = (date: string, hour: number): TimeSlot[] => {
  const day = scheduleWeek.value.days.find(d => d.date === date)
  if (!day) return []
  
  return day.timeSlots.filter(slot => {
    const slotHour = parseInt(slot.startTime.split(':')[0])
    return slotHour === hour
  })
}

const getSlotClasses = (slot: TimeSlot): string => {
  const baseClasses = 'group transition-all duration-200 hover:shadow-sm'
  
  switch (slot.status) {
    case 'available':
      return `${baseClasses} border-green-500 bg-green-50 hover:bg-green-100`
    case 'booked':
      return `${baseClasses} border-blue-500 bg-blue-100 hover:bg-blue-200`
    case 'blocked':
      return `${baseClasses} border-red-500 bg-red-50 hover:bg-red-100`
    case 'break':
      return `${baseClasses} border-gray-500 bg-gray-100 hover:bg-gray-200`
    default:
      return baseClasses
  }
}

const getSlotStyle = (slot: TimeSlot): Record<string, string> => {
  // Calculate position based on minutes within the hour
  const [, minutes] = slot.startTime.split(':').map(Number)
  const top = (minutes / 60) * 60 // Convert to pixels (assuming 60px per hour)
  const height = (slot.duration / 60) * 60 // Height based on duration
  
  return {
    top: `${top}px`,
    height: `${Math.max(height - 2, 20)}px` // Minimum height with gap
  }
}

const handleSlotClick = (slot: TimeSlot): void => {
  emit('slot-click', slot)
}

const getJobForSlot = (slot: TimeSlot): Job | undefined => {
  if (!slot.jobId) return undefined
  return scheduleStore.jobs.find(job => job.id === slot.jobId)
}
</script>