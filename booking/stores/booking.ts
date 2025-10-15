import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ServiceType } from '~/types'

export const useBookingStore = defineStore('booking', () => {
  // Selection state
  const selectedService = ref<ServiceType | null>(null)
  const selectedDate = ref<string | null>(null) // YYYY-MM-DD format
  const selectedHour = ref<number | null>(null) // 6-22 hour range

  // Booking flow
  const currentStep = ref<1 | 2 | 3>(1)

  // Client information
  const clientInfo = ref({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  })

  // Actions
  const selectService = (service: ServiceType) => {
    // Toggle selection - if same service clicked, deselect it
    if (selectedService.value?.id === service.id) {
      selectedService.value = null
    } else {
      selectedService.value = service
    }
  }

  const selectDateTime = (date: string, hour: number) => {
    // Handle deselection (when empty string and -1 are passed)
    if (date === '' || hour === -1) {
      selectedDate.value = null
      selectedHour.value = null
    } else {
      selectedDate.value = date
      selectedHour.value = hour
    }
  }

  const updateClientInfo = (info: Partial<typeof clientInfo.value>) => {
    clientInfo.value = { ...clientInfo.value, ...info }
  }

  const goToStep = (step: 1 | 2 | 3) => {
    currentStep.value = step
  }

  const nextStep = () => {
    if (currentStep.value < 3) {
      currentStep.value = (currentStep.value + 1) as 1 | 2 | 3
    }
  }

  const previousStep = () => {
    if (currentStep.value > 1) {
      currentStep.value = (currentStep.value - 1) as 1 | 2 | 3
    }
  }

  const resetBooking = () => {
    selectedService.value = null
    selectedDate.value = null
    selectedHour.value = null
    currentStep.value = 1
    clientInfo.value = {
      name: '',
      phone: '',
      email: '',
      address: '',
      notes: ''
    }
  }

  // Computed-like getters
  const isServiceSelected = () => selectedService.value !== null
  const isDateTimeSelected = () => selectedDate.value !== null && selectedHour.value !== null
  const isClientInfoComplete = () => {
    return clientInfo.value.name.trim() !== '' && clientInfo.value.phone.trim() !== ''
  }

  const canProceedToStep2 = () => isServiceSelected()
  const canProceedToStep3 = () => isServiceSelected() && isDateTimeSelected()
  const canSubmitBooking = () => canProceedToStep3() && isClientInfoComplete()

  return {
    // State
    selectedService,
    selectedDate,
    selectedHour,
    currentStep,
    clientInfo,

    // Actions
    selectService,
    selectDateTime,
    updateClientInfo,
    goToStep,
    nextStep,
    previousStep,
    resetBooking,

    // Getters
    isServiceSelected,
    isDateTimeSelected,
    isClientInfoComplete,
    canProceedToStep2,
    canProceedToStep3,
    canSubmitBooking
  }
})
