<template>
  <ModalStructure
    ref="modalRef"
    title="Configurar Horarios de Atención"
    modal-class="max-w-4xl"
    @on-close="handleModalClose"
  >
    <!-- Modal Content -->
    <div class="space-y-6">
      <!-- Instructions -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex">
          <Icon
            name="mdi:information-outline"
            class="w-5 h-5 text-blue-600 mt-0.5 mr-3"
          />
          <div>
            <h3 class="font-medium text-blue-900 mb-1">
              Configura tu disponibilidad
            </h3>
            <p class="text-sm text-blue-800">
              Establece los días y horarios en que estarás disponible para recibir trabajos. 
              Puedes incluir descansos durante el día.
            </p>
          </div>
        </div>
      </div>

      <!-- Days configuration -->
      <div class="space-y-4">
        <div
          v-for="(dayInfo, dayKey) in daysOfWeek"
          :key="dayKey"
          :class="[
            'border rounded-lg p-4 transition-colors',
            localAvailability[dayKey].enabled 
              ? 'border-green-200 bg-green-50' 
              : 'border-gray-200 bg-gray-50'
          ]"
        >
          <!-- Day header -->
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center">
              <button
                type="button"
                :class="[
                  'flex items-center justify-center w-6 h-6 rounded border-2 mr-3 transition-colors',
                  localAvailability[dayKey].enabled
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                ]"
                @click="toggleLocalDay(dayKey)"
              >
                <Icon
                  v-if="localAvailability[dayKey].enabled"
                  name="mdi:check"
                  class="w-4 h-4"
                />
              </button>
              <div>
                <h3 class="font-medium text-gray-900">
                  {{ dayInfo.name }}
                </h3>
                <p class="text-sm text-gray-500 mt-0.5">
                  {{ localAvailability[dayKey].enabled ? 'Disponible' : 'No disponible' }}
                </p>
              </div>
            </div>
            
            <!-- Quick presets for this day -->
            <div
              v-if="localAvailability[dayKey].enabled"
              class="flex items-center space-x-2"
            >
              <button
                v-for="preset in dayPresets"
                :key="preset.name"
                type="button"
                class="px-2 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                @click="applyPreset(dayKey, preset)"
              >
                {{ preset.name }}
              </button>
            </div>
          </div>

          <!-- Day time configuration -->
          <div
            v-if="localAvailability[dayKey].enabled"
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <!-- Start time -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Hora de inicio
              </label>
              <SettingsTimeSelector
                v-model="localAvailability[dayKey].startTime"
                title="Hora de inicio"
                placeholder="09:00"
              />
            </div>

            <!-- End time -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Hora de fin
              </label>
              <SettingsTimeSelector
                v-model="localAvailability[dayKey].endTime"
                title="Hora de fin"
                placeholder="18:00"
              />
            </div>

            <!-- Break start -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Inicio descanso
                <span class="text-xs font-normal text-gray-500">(opcional)</span>
              </label>
              <SettingsTimeSelector
                v-model="localAvailability[dayKey].breakStart"
                title="Inicio del descanso"
                placeholder="12:00"
              />
            </div>

            <!-- Break end -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Fin descanso
                <span class="text-xs font-normal text-gray-500">(opcional)</span>
              </label>
              <SettingsTimeSelector
                v-model="localAvailability[dayKey].breakEnd"
                title="Fin del descanso"
                placeholder="13:00"
              />
            </div>
          </div>

          <!-- Working hours summary for enabled days -->
          <div
            v-if="localAvailability[dayKey].enabled"
            class="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between text-sm"
          >
            <span class="text-gray-600">
              Horas de trabajo: {{ calculateWorkingHours(localAvailability[dayKey]) }}h
            </span>
            <span class="text-gray-500">
              Horario: {{ localAvailability[dayKey].startTime }} - {{ localAvailability[dayKey].endTime }}
            </span>
          </div>
        </div>
      </div>

      <!-- Weekly summary -->
      <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 class="font-medium text-gray-900 mb-3">
          Resumen Semanal
        </h4>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span class="text-gray-600">Días activos:</span>
            <p class="font-medium text-gray-900">{{ localActiveDaysCount }}/7</p>
          </div>
          <div>
            <span class="text-gray-600">Horas totales:</span>
            <p class="font-medium text-gray-900">{{ localTotalWeeklyHours }}h/semana</p>
          </div>
          <div>
            <span class="text-gray-600">Promedio diario:</span>
            <p class="font-medium text-gray-900">
              {{ localActiveDaysCount > 0 ? Math.round(localTotalWeeklyHours / localActiveDaysCount * 10) / 10 : 0 }}h/día
            </p>
          </div>
          <div>
            <span class="text-gray-600">Estado:</span>
            <p
              :class="[
                'font-medium',
                localActiveDaysCount > 0 ? 'text-green-700' : 'text-red-700'
              ]"
            >
              {{ localActiveDaysCount > 0 ? 'Configurado' : 'Sin configurar' }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Footer -->
    <template #footer>
      <div class="flex items-center justify-between w-full">
        <!-- Quick actions -->
        <div class="flex items-center space-x-2">
          <button
            type="button"
            class="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
            @click="applyQuickPreset('business')"
          >
            Horario Comercial
          </button>
          <button
            type="button"
            class="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
            @click="applyQuickPreset('extended')"
          >
            Horario Extendido
          </button>
        </div>

        <!-- Main actions -->
        <div class="flex items-center space-x-3">
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            @click="handleCancel"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            :disabled="isSaving"
            @click="handleSave"
          >
            <span v-if="isSaving">Guardando...</span>
            <span v-else>Guardar Cambios</span>
          </button>
        </div>
      </div>
    </template>
  </ModalStructure>
</template>

<script setup lang="ts">
import type { DayOfWeek, WeeklyAvailability, DaySchedule } from '~/types'

// ==========================================
// COMPOSABLES
// ==========================================

const technicianStore = useTechnicianStore()

// ==========================================
// REFS
// ==========================================

const modalRef = ref()

// ==========================================
// STATE
// ==========================================

const isSaving = ref<boolean>(false)
const localAvailability = ref<WeeklyAvailability>({} as WeeklyAvailability)

// ==========================================
// COMPUTED
// ==========================================

const daysOfWeek = computed(() => ({
  monday: { name: 'Lunes', shortName: 'Lun' },
  tuesday: { name: 'Martes', shortName: 'Mar' },
  wednesday: { name: 'Miércoles', shortName: 'Mié' },
  thursday: { name: 'Jueves', shortName: 'Jue' },
  friday: { name: 'Viernes', shortName: 'Vie' },
  saturday: { name: 'Sábado', shortName: 'Sáb' },
  sunday: { name: 'Domingo', shortName: 'Dom' }
}))

const localActiveDaysCount = computed(() => {
  return Object.values(localAvailability.value).filter(day => day.enabled).length
})

const localTotalWeeklyHours = computed(() => {
  return Object.values(localAvailability.value)
    .filter(day => day.enabled)
    .reduce((total, day) => total + calculateWorkingHours(day), 0)
})

const dayPresets = computed(() => [
  { name: '8-17', startTime: '08:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00' },
  { name: '9-18', startTime: '09:00', endTime: '18:00', breakStart: '12:00', breakEnd: '13:00' },
  { name: '8-14', startTime: '08:00', endTime: '14:00', breakStart: undefined, breakEnd: undefined }
])

// ==========================================
// METHODS
// ==========================================

const showModal = (): void => {
  // Load current availability into local state
  if (technicianStore.technician?.availability) {
    localAvailability.value = JSON.parse(JSON.stringify(technicianStore.technician.availability))
  } else {
    // Initialize with default availability
    localAvailability.value = createDefaultAvailability()
  }
  
  modalRef.value?.showModal()
}

const createDefaultAvailability = (): WeeklyAvailability => ({
  monday: { enabled: true, startTime: '09:00', endTime: '18:00', breakStart: '12:00', breakEnd: '13:00' },
  tuesday: { enabled: true, startTime: '09:00', endTime: '18:00', breakStart: '12:00', breakEnd: '13:00' },
  wednesday: { enabled: true, startTime: '09:00', endTime: '18:00', breakStart: '12:00', breakEnd: '13:00' },
  thursday: { enabled: true, startTime: '09:00', endTime: '18:00', breakStart: '12:00', breakEnd: '13:00' },
  friday: { enabled: true, startTime: '09:00', endTime: '18:00', breakStart: '12:00', breakEnd: '13:00' },
  saturday: { enabled: true, startTime: '09:00', endTime: '14:00' },
  sunday: { enabled: false, startTime: '09:00', endTime: '18:00' }
})

const toggleLocalDay = (dayKey: DayOfWeek): void => {
  localAvailability.value[dayKey].enabled = !localAvailability.value[dayKey].enabled
}

const applyPreset = (dayKey: DayOfWeek, preset: any): void => {
  localAvailability.value[dayKey] = {
    ...localAvailability.value[dayKey],
    startTime: preset.startTime,
    endTime: preset.endTime,
    breakStart: preset.breakStart,
    breakEnd: preset.breakEnd
  }
}

const applyQuickPreset = (presetType: 'business' | 'extended'): void => {
  const presets = {
    business: {
      monday: { enabled: true, startTime: '09:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00' },
      tuesday: { enabled: true, startTime: '09:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00' },
      wednesday: { enabled: true, startTime: '09:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00' },
      thursday: { enabled: true, startTime: '09:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00' },
      friday: { enabled: true, startTime: '09:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00' },
      saturday: { enabled: false, startTime: '09:00', endTime: '14:00' },
      sunday: { enabled: false, startTime: '09:00', endTime: '18:00' }
    },
    extended: {
      monday: { enabled: true, startTime: '08:00', endTime: '19:00', breakStart: '12:00', breakEnd: '13:00' },
      tuesday: { enabled: true, startTime: '08:00', endTime: '19:00', breakStart: '12:00', breakEnd: '13:00' },
      wednesday: { enabled: true, startTime: '08:00', endTime: '19:00', breakStart: '12:00', breakEnd: '13:00' },
      thursday: { enabled: true, startTime: '08:00', endTime: '19:00', breakStart: '12:00', breakEnd: '13:00' },
      friday: { enabled: true, startTime: '08:00', endTime: '19:00', breakStart: '12:00', breakEnd: '13:00' },
      saturday: { enabled: true, startTime: '08:00', endTime: '15:00', breakStart: '12:00', breakEnd: '13:00' },
      sunday: { enabled: false, startTime: '09:00', endTime: '18:00' }
    }
  }
  
  localAvailability.value = presets[presetType] as WeeklyAvailability
}

const calculateWorkingHours = (daySchedule: DaySchedule): number => {
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

const parseTime = (timeString: string): number => {
  const [hours, minutes] = timeString.split(':').map(Number)
  return hours * 60 + minutes
}

const handleSave = async (): Promise<void> => {
  // Validate schedule before saving
  const validationErrors = validateSchedule(localAvailability.value)
  if (validationErrors.length > 0) {
    // Show validation errors
    console.error('Schedule validation errors:', validationErrors)
    return
  }

  isSaving.value = true
  
  try {
    await technicianStore.updateAvailability(localAvailability.value)
    
    // Regenerate time slots when availability changes
    if (technicianStore.technician) {
      const scheduleStore = useScheduleStore()
      await scheduleStore.regenerateSlotsFromAvailability(
        localAvailability.value,
        technicianStore.technician.id
      )
    }
    
    modalRef.value?.closeModal()
  } catch (error) {
    console.error('Error saving availability:', error)
  } finally {
    isSaving.value = false
  }
}

const validateSchedule = (schedule: WeeklyAvailability): string[] => {
  const errors: string[] = []
  
  Object.entries(schedule).forEach(([dayKey, daySchedule]) => {
    if (!daySchedule.enabled) return
    
    const dayName = daysOfWeek.value[dayKey as DayOfWeek]?.name || dayKey
    
    // Validate that end time is after start time
    const startMinutes = parseTime(daySchedule.startTime)
    const endMinutes = parseTime(daySchedule.endTime)
    
    if (endMinutes <= startMinutes) {
      errors.push(`${dayName}: La hora de fin debe ser posterior a la hora de inicio`)
    }
    
    // Validate break times if they exist
    if (daySchedule.breakStart && daySchedule.breakEnd) {
      const breakStartMinutes = parseTime(daySchedule.breakStart)
      const breakEndMinutes = parseTime(daySchedule.breakEnd)
      
      if (breakEndMinutes <= breakStartMinutes) {
        errors.push(`${dayName}: El fin del descanso debe ser posterior al inicio`)
      }
      
      if (breakStartMinutes < startMinutes || breakEndMinutes > endMinutes) {
        errors.push(`${dayName}: El descanso debe estar dentro del horario de trabajo`)
      }
    }
    
    // Validate minimum working hours (at least 1 hour)
    const workingHours = calculateWorkingHours(daySchedule)
    if (workingHours < 1) {
      errors.push(`${dayName}: Debe tener al menos 1 hora de trabajo`)
    }
  })
  
  return errors
}

const handleCancel = (): void => {
  modalRef.value?.closeModal()
}

const handleModalClose = (): void => {
  // Reset local state when modal closes
  isSaving.value = false
}

// ==========================================
// EXPOSE METHODS
// ==========================================

defineExpose({
  showModal
})
</script>