<template>
  <div class="space-y-4">
    <!-- Days of the week grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div
        v-for="(dayInfo, dayKey) in daysOfWeek"
        :key="dayKey"
        :class="[
          'border border-gray-200 rounded-lg p-4',
          availability?.[dayKey]?.enabled 
            ? 'bg-green-50 border-green-200' 
            : 'bg-gray-50 border-gray-200'
        ]"
      >
        <!-- Day header -->
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center">
            <h3 class="font-medium text-gray-900">
              {{ dayInfo.name }}
            </h3>
            <div
              :class="[
                'ml-2 w-2 h-2 rounded-full',
                availability?.[dayKey]?.enabled ? 'bg-green-500' : 'bg-gray-400'
              ]"
            />
          </div>
          <button
            type="button"
            :class="[
              'text-xs px-2 py-1 rounded-md font-medium transition-colors',
              availability?.[dayKey]?.enabled
                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            ]"
            @click="toggleDay(dayKey)"
          >
            {{ availability?.[dayKey]?.enabled ? 'Activo' : 'Inactivo' }}
          </button>
        </div>

        <!-- Day schedule info -->
        <div
          v-if="availability?.[dayKey]?.enabled"
          class="space-y-2"
        >
          <!-- Working hours -->
          <div class="flex items-center text-sm text-gray-700">
            <IconClockOutline
              class="w-4 h-4 mr-2 text-gray-500"
            />
            <span>
              {{ availability[dayKey].startTime }} - {{ availability[dayKey].endTime }}
            </span>
          </div>

          <!-- Break time -->
          <div
            v-if="availability[dayKey].breakStart && availability[dayKey].breakEnd"
            class="flex items-center text-sm text-gray-600"
          >
            <IconCoffeeOutline
              class="w-4 h-4 mr-2 text-gray-500"
            />
            <span>
              Descanso: {{ availability[dayKey].breakStart }} - {{ availability[dayKey].breakEnd }}
            </span>
          </div>

          <!-- Working hours calculation -->
          <div class="flex items-center text-xs text-gray-500">
            <IconTimerOutline
              class="w-3 h-3 mr-1"
            />
            <span>
              {{ calculateWorkingHours(availability[dayKey]) }} horas de trabajo
            </span>
          </div>
        </div>

        <!-- Inactive day message -->
        <div
          v-else
          class="text-sm text-gray-500 italic"
        >
          No disponible este día
        </div>
      </div>
    </div>

    <!-- Summary -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div class="flex items-start">
        <IconInformationOutline
          class="w-5 h-5 text-blue-600 mt-0.5 mr-3"
        />
        <div class="flex-1">
          <h4 class="font-medium text-blue-900 mb-2">
            Resumen de Disponibilidad
          </h4>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span class="text-blue-700 font-medium">Días activos:</span>
              <p class="text-blue-800">{{ activeDaysCount }}/7</p>
            </div>
            <div>
              <span class="text-blue-700 font-medium">Horas totales:</span>
              <p class="text-blue-800">{{ totalWeeklyHours }}h por semana</p>
            </div>
            <div>
              <span class="text-blue-700 font-medium">Horario típico:</span>
              <p class="text-blue-800">{{ typicalSchedule }}</p>
            </div>
            <div>
              <span class="text-blue-700 font-medium">Estado:</span>
              <p
                :class="[
                  'font-medium',
                  activeDaysCount > 0 ? 'text-green-700' : 'text-red-700'
                ]"
              >
                {{ activeDaysCount > 0 ? 'Configurado' : 'Sin configurar' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import IconClockOutline from '~icons/mdi/clock-outline'
import IconCoffeeOutline from '~icons/mdi/coffee-outline'
import IconTimerOutline from '~icons/mdi/timer-outline'
import IconInformationOutline from '~icons/mdi/information-outline'

// ==========================================
// COMPOSABLES
// ==========================================

const technicianStore = useTechnicianStore()

// ==========================================
// COMPUTED
// ==========================================

const availability = computed(() => {
  return technicianStore.technician?.availability
})

const daysOfWeek = computed(() => ({
  monday: { name: 'Lunes', shortName: 'Lun' },
  tuesday: { name: 'Martes', shortName: 'Mar' },
  wednesday: { name: 'Miércoles', shortName: 'Mié' },
  thursday: { name: 'Jueves', shortName: 'Jue' },
  friday: { name: 'Viernes', shortName: 'Vie' },
  saturday: { name: 'Sábado', shortName: 'Sáb' },
  sunday: { name: 'Domingo', shortName: 'Dom' }
}))

const activeDaysCount = computed(() => {
  if (!availability.value) return 0
  
  return Object.values(availability.value).filter(day => day.enabled).length
})

const totalWeeklyHours = computed(() => {
  if (!availability.value) return 0
  
  return Object.values(availability.value)
    .filter(day => day.enabled)
    .reduce((total, day) => total + calculateWorkingHours(day), 0)
})

const typicalSchedule = computed(() => {
  if (!availability.value) return 'Sin configurar'
  
  const enabledDays = Object.values(availability.value).filter(day => day.enabled)
  
  if (enabledDays.length === 0) return 'Sin configurar'
  
  // Find most common start and end times
  const startTimes = enabledDays.map(day => day.startTime)
  const endTimes = enabledDays.map(day => day.endTime)
  
  const mostCommonStart = findMostCommon(startTimes)
  const mostCommonEnd = findMostCommon(endTimes)
  
  return `${mostCommonStart} - ${mostCommonEnd}`
})

// ==========================================
// METHODS
// ==========================================

const toggleDay = async (dayKey) => {
  await technicianStore.toggleDayAvailability(dayKey)
}

const calculateWorkingHours = (daySchedule) => {
  if (!daySchedule.enabled) return 0
  
  const startTime = parseTime(daySchedule.startTime)
  const endTime = parseTime(daySchedule.endTime)
  
  let workingMinutes = endTime - startTime
  
  // Subtract break time if exists
  if (daySchedule.breakStart && daySchedule.breakEnd) {
    const breakStart = parseTime(daySchedule.breakStart)
    const breakEnd = parseTime(daySchedule.breakEnd)
    const breakDuration = breakEnd - breakStart
    workingMinutes -= breakDuration
  }
  
  return Math.max(0, Math.round(workingMinutes / 60 * 10) / 10) // Round to 1 decimal
}

const parseTime = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number)
  return hours * 60 + minutes
}

const findMostCommon = (array) => {
  if (array.length === 0) return ''
  
  const frequency = {}
  
  array.forEach(item => {
    frequency[item] = (frequency[item] || 0) + 1
  })
  
  return Object.keys(frequency).reduce((a, b) => 
    frequency[a] > frequency[b] ? a : b
  )
}
</script>