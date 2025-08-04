<template>
  <div class="max-w-7xl mx-auto">
    <!-- Page Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">
            Agenda
          </h1>
          <p class="text-gray-600">
            Gestiona tus trabajos programados y disponibilidad
          </p>
        </div>
        
        <!-- Quick Stats -->
        <div class="flex items-center space-x-6 text-sm">
          <div class="text-center">
            <p class="text-2xl font-bold text-blue-600">
              {{ scheduleStore.todaysJobs.length }}
            </p>
            <p class="text-gray-500">Trabajos Hoy</p>
          </div>
          <div class="text-center">
            <p class="text-2xl font-bold text-green-600">
              {{ scheduleStore.upcomingJobs.length }}
            </p>
            <p class="text-gray-500">Próximos</p>
          </div>
          <div class="text-center">
            <p class="text-2xl font-bold text-purple-600">
              {{ weeklyUtilization }}%
            </p>
            <p class="text-gray-500">Utilización</p>
          </div>
        </div>
      </div>
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

    <!-- Today's Schedule Sidebar (Mobile/Tablet) -->
    <div
      v-if="technicianStore.technician && technicianStore.hasAvailability"
      class="mt-6 lg:hidden"
    >
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="px-4 py-3 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">
            Agenda de Hoy
          </h3>
          <p class="text-sm text-gray-500">
            {{ new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }) }}
          </p>
        </div>
        
        <div class="p-4">
          <!-- Today's Jobs -->
          <div
            v-if="scheduleStore.todaysJobs.length > 0"
            class="space-y-3"
          >
            <div
              v-for="job in scheduleStore.todaysJobs"
              :key="job.id"
              :class="[
                'p-3 border rounded-lg cursor-pointer transition-colors',
                getJobStatusClasses(job.status)
              ]"
              @click="handleJobSelected(job)"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium text-gray-900">
                    {{ job.clientName }}
                  </p>
                  <p class="text-sm text-gray-600">
                    {{ job.serviceType }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ formatJobTime(job.scheduledDate) }} • ${{ job.price.toLocaleString() }}
                  </p>
                </div>
                <div class="text-right">
                  <span :class="['px-2 py-1 text-xs font-medium rounded-full', getJobStatusBadgeClasses(job.status)]">
                    {{ getJobStatusLabel(job.status) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- No Jobs Today -->
          <div
            v-else
            class="text-center py-6"
          >
            <Icon
              name="mdi:calendar-check"
              class="w-12 h-12 text-gray-300 mx-auto mb-3"
            />
            <p class="text-gray-500">
              No tienes trabajos programados para hoy
            </p>
          </div>
        </div>
      </div>
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

const weeklyUtilization = computed(() => {
  if (!technicianStore.technician) return 0
  
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay() + 1) // Monday
  
  const weekSchedule = scheduleStore.getScheduleWeek(
    startOfWeek.toISOString().split('T')[0],
    technicianStore.technician.id
  )
  
  return Math.round(weekSchedule.utilization)
})

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

const formatJobTime = (date: Date): string => {
  return date.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const getJobStatusClasses = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100'
    case 'confirmed':
      return 'border-blue-200 bg-blue-50 hover:bg-blue-100'
    case 'in_progress':
      return 'border-purple-200 bg-purple-50 hover:bg-purple-100'
    case 'completed':
      return 'border-green-200 bg-green-50 hover:bg-green-100'
    case 'cancelled':
      return 'border-red-200 bg-red-50 hover:bg-red-100'
    default:
      return 'border-gray-200 bg-gray-50 hover:bg-gray-100'
  }
}

const getJobStatusBadgeClasses = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'confirmed':
      return 'bg-blue-100 text-blue-800'
    case 'in_progress':
      return 'bg-purple-100 text-purple-800'
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getJobStatusLabel = (status: string): string => {
  const labels = {
    pending: 'Pendiente',
    confirmed: 'Confirmado',
    in_progress: 'En Proceso',
    completed: 'Completado',
    cancelled: 'Cancelado'
  }
  return labels[status as keyof typeof labels] || status
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