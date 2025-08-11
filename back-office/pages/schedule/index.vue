<template>
  <div class="max-w-7xl mx-auto">
    <!-- Simplified Page Header -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">
        Agenda
      </h1>
      <p class="text-gray-600 mt-2">
        Gestiona tus trabajos y horarios disponibles
      </p>
    </div>

    <!-- No Technician Setup -->
    <div
      v-if="!technicianStore.technician"
      class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6"
    >
      <div class="flex">
        <Icon
          name="mdi:alert-outline"
          class="w-6 h-6 text-yellow-600 mt-0.5 mr-3"
        />
        <div>
          <h3 class="text-lg font-medium text-yellow-800 mb-2">
            Configuración Requerida
          </h3>
          <p class="text-yellow-700 mb-4">
            Necesitas completar tu perfil de técnico antes de gestionar tu agenda.
          </p>
          <button
            type="button"
            class="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
            @click="goToSetup"
          >
            Completar Perfil
          </button>
        </div>
      </div>
    </div>

    <!-- No Availability Setup -->
    <div
      v-else-if="!technicianStore.hasAvailability"
      class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6"
    >
      <div class="flex">
        <Icon
          name="mdi:calendar-clock"
          class="w-6 h-6 text-blue-600 mt-0.5 mr-3"
        />
        <div>
          <h3 class="text-lg font-medium text-blue-800 mb-2">
            Configura tu Disponibilidad
          </h3>
          <p class="text-blue-700 mb-4">
            Define tus horarios de trabajo para empezar a recibir reservas.
          </p>
          <button
            type="button"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            @click="goToSettings"
          >
            Configurar Horarios
          </button>
        </div>
      </div>
    </div>

    <!-- Main Calendar Interface -->
    <div v-else>
      <ScheduleCalendarView
        :technician-id="technicianStore.technician.id"
        @job-selected="handleJobSelected"
        @slot-selected="handleSlotSelected"
        @new-job-requested="handleNewJobRequested"
      />
    </div>


    <!-- Job Details Modal -->
    <ScheduleJobModal
      ref="jobModalRef"
      @job-updated="handleJobUpdated"
      @job-deleted="handleJobDeleted"
    />

    <!-- Quick Booking Modal -->
    <ScheduleQuickBookModal
      ref="quickBookModalRef"
      :technician-id="technicianStore.technician?.id || ''"
      @job-created="handleJobCreated"
    />

    <!-- Slot Actions Modal -->
    <ScheduleSlotActionsModal
      ref="slotActionsModalRef"
      @slot-booked="handleSlotBooked"
      @slot-blocked="handleSlotBlocked"
    />
  </div>
</template>

<script setup lang="ts">
import type { Job, TimeSlot } from '~/types'
import { formatInBuenosAires, startOfWeekInBuenosAires } from '~/utils/timezone'

// ==========================================
// PAGE METADATA
// ==========================================

definePageMeta({
  layout: 'default'
})

useSeoMeta({
  title: 'Agenda - InstalarPro Back Office',
  description: 'Gestione su agenda de trabajos y citas programadas.',
  robots: 'noindex, nofollow'
})

// ==========================================
// COMPOSABLES
// ==========================================

const scheduleStore = useScheduleStore()
const technicianStore = useTechnicianStore()
const router = useRouter()

// ==========================================
// REFS
// ==========================================

const jobModalRef = ref()
const quickBookModalRef = ref()
const slotActionsModalRef = ref()

// ==========================================
// COMPUTED
// ==========================================


// ==========================================
// METHODS
// ==========================================

const goToSetup = (): void => {
  router.push('/setup')
}

const goToSettings = (): void => {
  router.push('/settings')
}

const handleJobSelected = (job: Job): void => {
  if (jobModalRef.value) {
    jobModalRef.value.showModal(job)
  }
}

const handleSlotSelected = (slot: TimeSlot): void => {
  if (slotActionsModalRef.value) {
    slotActionsModalRef.value.showModal(slot)
  }
}

const handleNewJobRequested = (date: string, time?: string): void => {
  if (quickBookModalRef.value) {
    quickBookModalRef.value.showModal(date, time)
  }
}

const handleJobUpdated = (job: Job): void => {
  // Job is automatically updated in the store
  // Optionally show success message
}

const handleJobDeleted = (jobId: string): void => {
  // Job is automatically deleted from the store
  // Optionally show success message
}

const handleJobCreated = (job: Job): void => {
  // Job is automatically added to the store
  // Optionally show success message
}

const handleSlotBooked = (slot: TimeSlot): void => {
  // Slot is automatically booked in the store
  handleNewJobRequested(slot.date, slot.startTime)
}

const handleSlotBlocked = (slot: TimeSlot): void => {
  // Slot is automatically blocked in the store
  // Optionally show success message
}


// ==========================================
// LIFECYCLE
// ==========================================

onMounted(async () => {
  // Initialize stores
  await Promise.all([
    scheduleStore.initialize(),
    technicianStore.initialize()
  ])
  
  // Generate time slots if technician has availability
  if (technicianStore.technician?.availability && technicianStore.hasAvailability) {
    await scheduleStore.generateTimeSlots(
      technicianStore.technician.availability,
      technicianStore.technician.id
    )
  }
})
</script>