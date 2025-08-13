<template>
  <TooltipStructure
    ref="tooltipRef"
    :title="title"
    position="bottom-left"
    tooltip-class="w-64"
  >
    <template #trigger>
      <button
        type="button"
        :class="[
          'flex items-center justify-between w-full px-3 py-2 text-left border border-gray-300 rounded-md shadow-sm bg-white',
          'hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          'text-sm font-medium text-gray-700'
        ]"
      >
        <span>{{ displayValue }}</span>
        <IconChevronDown
          class="w-4 h-4 text-gray-400"
        />
      </button>
    </template>

    <template #content>
      <div class="space-y-3">
        <!-- Time input fields -->
        <div class="grid grid-cols-2 gap-3">
          <!-- Hours -->
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">
              Hora
            </label>
            <select
              v-model="selectedHour"
              class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              @change="updateTime"
            >
              <option
                v-for="hour in hours"
                :key="hour"
                :value="hour"
              >
                {{ hour.toString().padStart(2, '0') }}
              </option>
            </select>
          </div>

          <!-- Minutes -->
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">
              Minutos
            </label>
            <select
              v-model="selectedMinute"
              class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              @change="updateTime"
            >
              <option
                v-for="minute in minutes"
                :key="minute"
                :value="minute"
              >
                {{ minute.toString().padStart(2, '0') }}
              </option>
            </select>
          </div>
        </div>

        <!-- Quick time buttons -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-2">
            Horarios Comunes
          </label>
          <div class="grid grid-cols-3 gap-1">
            <button
              v-for="quickTime in quickTimes"
              :key="quickTime.value"
              type="button"
              class="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
              @click="selectQuickTime(quickTime.value)"
            >
              {{ quickTime.label }}
            </button>
          </div>
        </div>

        <!-- Time preview -->
        <div class="pt-2 border-t border-gray-200">
          <div class="flex items-center justify-between">
            <span class="text-xs text-gray-500">Hora seleccionada:</span>
            <span class="text-sm font-medium text-gray-900">
              {{ previewTime }}
            </span>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex items-center justify-end space-x-2">
        <button
          type="button"
          class="px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors"
          @click="closeTooltip"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
          @click="confirmTime"
        >
          Confirmar
        </button>
      </div>
    </template>
  </TooltipStructure>
</template>

<script setup lang="ts">
import IconChevronDown from '~icons/mdi/chevron-down'

interface Props {
  modelValue: string // HH:mm format
  title?: string
  placeholder?: string
  disabled?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Seleccionar Hora',
  placeholder: 'Seleccionar...',
  disabled: false
})

const emit = defineEmits<Emits>()

// ==========================================
// REFS
// ==========================================

const tooltipRef = ref()

// ==========================================
// STATE
// ==========================================

const selectedHour = ref<number>(9)
const selectedMinute = ref<number>(0)

// ==========================================
// COMPUTED
// ==========================================

const displayValue = computed(() => {
  if (!props.modelValue) return props.placeholder
  return props.modelValue
})

const previewTime = computed(() => {
  return `${selectedHour.value.toString().padStart(2, '0')}:${selectedMinute.value.toString().padStart(2, '0')}`
})

const hours = computed(() => {
  return Array.from({ length: 24 }, (_, i) => i)
})

const minutes = computed(() => {
  return Array.from({ length: 12 }, (_, i) => i * 5) // 0, 5, 10, 15, ..., 55
})

const quickTimes = computed(() => [
  { label: '8:00', value: '08:00' },
  { label: '9:00', value: '09:00' },
  { label: '10:00', value: '10:00' },
  { label: '12:00', value: '12:00' },
  { label: '13:00', value: '13:00' },
  { label: '14:00', value: '14:00' },
  { label: '16:00', value: '16:00' },
  { label: '17:00', value: '17:00' },
  { label: '18:00', value: '18:00' }
])

// ==========================================
// METHODS
// ==========================================

const parseTimeValue = (timeValue: string): { hour: number; minute: number } => {
  if (!timeValue) return { hour: 9, minute: 0 }
  
  const [hourStr, minuteStr] = timeValue.split(':')
  return {
    hour: parseInt(hourStr, 10) || 9,
    minute: parseInt(minuteStr, 10) || 0
  }
}

const updateTime = (): void => {
  // Update preview immediately as user selects
  // Actual value is only emitted when confirmed
}

const selectQuickTime = (timeValue: string): void => {
  const { hour, minute } = parseTimeValue(timeValue)
  selectedHour.value = hour
  selectedMinute.value = minute
}

const confirmTime = (): void => {
  // Validate time before confirming
  if (isValidTime(selectedHour.value, selectedMinute.value)) {
    const newTimeValue = previewTime.value
    emit('update:modelValue', newTimeValue)
    closeTooltip()
  }
}

const isValidTime = (hour: number, minute: number): boolean => {
  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59
}

const closeTooltip = (): void => {
  if (tooltipRef.value) {
    tooltipRef.value.closeTooltip()
  }
}

// ==========================================
// WATCHERS
// ==========================================

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      const { hour, minute } = parseTimeValue(newValue)
      selectedHour.value = hour
      selectedMinute.value = minute
    }
  },
  { immediate: true }
)

// ==========================================
// EXPOSE METHODS
// ==========================================

defineExpose({
  openTooltip: () => tooltipRef.value?.showTooltip(),
  closeTooltip
})
</script>