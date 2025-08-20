<template>
  <div class="max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Agenda</h1>
        <p class="text-sm text-gray-600 mt-1">
          Gestiona tus trabajos y horarios disponibles
        </p>
      </div>
      
      <button
        @click="openNewJobModal"
        class="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
      >
        <IconPlus class="w-4 h-4" />
        <span class="hidden sm:inline">Nuevo Trabajo</span>
        <span class="sm:hidden">Nuevo</span>
      </button>
    </div>

    <!-- Week Navigation -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div class="flex items-center justify-between">
        <button
          @click="previousWeek"
          class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <IconChevronLeft class="w-5 h-5" />
        </button>
        
        <div class="text-center">
          <h2 class="text-lg font-semibold text-gray-900">
            {{ currentWeekLabel }}
          </h2>
          <p class="text-sm text-gray-600">
            {{ currentWeekDateRange }}
          </p>
        </div>
        
        <button
          @click="nextWeek"
          class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <IconChevronRight class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Weekly View -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
      <div
        v-for="day in weekDays"
        :key="day.date"
        class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
      >
        <!-- Day Header -->
        <div
          :class="[
            'p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors',
            isToday(day.date) ? 'bg-blue-50 border-blue-100' : 'bg-gray-50'
          ]"
          @click="openDayView(day.date)"
        >
          <div class="text-center">
            <div :class="[
              'text-xs font-medium',
              isToday(day.date) ? 'text-blue-700' : 'text-gray-600'
            ]">
              {{ day.dayName }}
            </div>
            <div :class="[
              'text-lg font-bold mt-1',
              isToday(day.date) ? 'text-blue-600' : 'text-gray-900'
            ]">
              {{ day.dayNumber }}
            </div>
          </div>
        </div>

        <!-- Day Jobs Timeline -->
        <div class="p-2 min-h-[200px] max-h-[400px] overflow-y-auto">
          <!-- No jobs message -->
          <div v-if="getDayJobs(day.date).length === 0" class="text-center py-8">
            <IconCalendarBlank class="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p class="text-xs text-gray-500">Sin trabajos</p>
          </div>

          <!-- Jobs Timeline -->
          <div v-else class="space-y-1">
            <div
              v-for="job in getDayJobs(day.date)"
              :key="job.id"
              :class="[
                'p-2 rounded border-l-4 cursor-pointer hover:shadow-sm transition-all text-xs',
                getJobStatusColor(job.status)
              ]"
              @click="editJob(job)"
            >
              <div class="font-medium text-gray-900 truncate mb-1">
                {{ job.clientName }}
              </div>
              <div class="text-gray-600 mb-1">
                {{ formatJobTime(job.scheduledDate, job.estimatedDuration) }}
              </div>
              <div class="text-gray-500 truncate">
                {{ job.serviceType }}
              </div>
              <div class="text-xs text-gray-400 mt-1">
                ${{ job.price?.toLocaleString() || 0 }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Day View Modal -->
    <ModalStructure
      ref="dayModal"
      :title="selectedDayLabel"
      modal-class="max-w-2xl"
      @on-close="closeDayModal"
    >
      <div class="space-y-4">
        <!-- Day Timeline with Hours -->
        <div class="border border-gray-200 rounded-lg overflow-hidden relative">
          <!-- Hour rows background -->
          <div
            v-for="hour in workingHours"
            :key="hour"
            class="border-b border-gray-100 last:border-b-0 h-16"
          >
            <div class="flex h-full">
              <!-- Hour Column -->
              <div class="w-16 bg-gray-50 flex items-center justify-center border-r border-gray-100">
                <span class="text-xs font-medium text-gray-600">
                  {{ formatHour(hour) }}
                </span>
              </div>
              
              <!-- Job Slot -->
              <div class="flex-1 relative">
                <!-- Empty slot click area -->
                <div
                  v-if="getHourJobs(selectedDate, hour).length === 0"
                  class="absolute inset-0 hover:bg-blue-50 cursor-pointer transition-colors flex items-center justify-center"
                  @click="createJobAtTime(selectedDate, hour)"
                >
                  <span class="text-xs text-gray-400">Click para agendar</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Jobs overlay with proper positioning -->
          <div class="absolute inset-0 pointer-events-none">
            <div class="relative h-full">
              <!-- Left margin for hour column -->
              <div class="ml-16 h-full relative">
                <div
                  v-for="job in getDayJobs(selectedDate)"
                  :key="job.id"
                  :class="[
                    'absolute left-2 right-2 rounded border-l-4 p-2 cursor-pointer hover:shadow-sm transition-all pointer-events-auto',
                    getJobStatusColor(job.status)
                  ]"
                  :style="getDayModalJobPosition(job)"
                  @click="editJob(job)"
                >
                  <div class="text-sm font-medium text-gray-900 truncate">
                    {{ job.clientName }}
                  </div>
                  <div class="text-xs text-gray-600 truncate">
                    {{ job.serviceType }}
                  </div>
                  <div class="text-xs text-gray-500">
                    ${{ job.price?.toLocaleString() || 0 }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalStructure>

    <!-- Job Form Modal -->
    <ModalStructure
      ref="jobModal"
      :title="editingJob ? 'Editar Trabajo' : 'Nuevo Trabajo'"
      @on-close="resetJobForm"
    >
      <form @submit.prevent="saveJob" class="space-y-4">
        <!-- Client Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Cliente *
          </label>
          <input
            v-model="jobForm.clientName"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nombre del cliente"
          />
        </div>

        <!-- Phone -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Teléfono *
          </label>
          <input
            v-model="jobForm.clientPhone"
            type="tel"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="+54 11 1234-5678"
          />
        </div>

        <!-- Service Type -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Servicio *
          </label>
          <select
            v-model="jobForm.serviceType"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar servicio</option>
            <option value="Instalación">Instalación</option>
            <option value="Mantenimiento">Mantenimiento</option>
            <option value="Reparación">Reparación</option>
            <option value="Consulta">Consulta</option>
          </select>
        </div>

        <!-- Date and Time -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Fecha *
            </label>
            <input
              v-model="jobForm.date"
              type="date"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Hora *
            </label>
            <input
              v-model="jobForm.time"
              type="time"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <!-- Duration -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Duración (horas)
          </label>
          <select
            v-model="jobForm.duration"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1">1 hora</option>
            <option value="2">2 horas</option>
            <option value="3">3 horas</option>
            <option value="4">4 horas</option>
            <option value="6">6 horas</option>
            <option value="8">8 horas</option>
          </select>
        </div>

        <!-- Address -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Dirección *
          </label>
          <textarea
            v-model="jobForm.address"
            required
            rows="2"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Dirección completa del trabajo"
          />
        </div>

        <!-- Price -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Precio
          </label>
          <input
            v-model="jobForm.price"
            type="number"
            min="0"
            step="100"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
          />
        </div>

        <!-- Notes -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Notas
          </label>
          <textarea
            v-model="jobForm.notes"
            rows="2"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Notas adicionales..."
          />
        </div>

        <!-- Status (only when editing) -->
        <div v-if="editingJob">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            v-model="jobForm.status"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="pending">Pendiente</option>
            <option value="confirmed">Confirmado</option>
            <option value="in_progress">En Progreso</option>
            <option value="completed">Completado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end gap-3 pt-4">
          <button
            type="button"
            @click="closeJobModal"
            class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Cancelar
          </button>
          <button
            v-if="editingJob"
            type="button"
            @click="deleteJob"
            class="px-4 py-2 text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
          >
            Eliminar
          </button>
          <button
            type="submit"
            :disabled="savingJob"
            class="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center gap-2"
          >
            <IconLoading 
              v-if="savingJob" 
              class="w-4 h-4 animate-spin" 
            />
            {{ editingJob ? 'Actualizar' : 'Crear' }}
          </button>
        </div>
      </form>
    </ModalStructure>
  </div>
</template>

<script setup>
import IconPlus from '~icons/mdi/plus'
import IconChevronLeft from '~icons/mdi/chevron-left'
import IconChevronRight from '~icons/mdi/chevron-right'
import IconCalendarBlank from '~icons/mdi/calendar-blank'
import IconLoading from '~icons/mdi/loading'
import { 
  nowInBuenosAires, 
  toBuenosAires, 
  formatInBuenosAires, 
  isTodayInBuenosAires,
  startOfWeekInBuenosAires,
  endOfWeekInBuenosAires
} from '~/utils/timezone'

definePageMeta({
  layout: 'default'
})

useSeoMeta({
  title: 'Agenda - InstalarPro Back Office',
  description: 'Gestione su agenda de trabajos y citas programadas.',
  robots: 'noindex, nofollow'
})

// Firebase integration
const { data: jobs, loading, error, add, update, remove, list, subscribe } = useFirestore('jobs')

// Get dayjs instance
const { $dayjs } = useNuxtApp()

// Component state
const currentWeekStart = ref(startOfWeekInBuenosAires())
const selectedDate = ref(null)
const editingJob = ref(null)
const savingJob = ref(false)

// Modal refs
const dayModal = ref()
const jobModal = ref()

// Form data
const jobForm = ref({
  clientName: '',
  clientPhone: '',
  serviceType: '',
  date: '',
  time: '',
  duration: '2',
  address: '',
  price: '',
  notes: '',
  status: 'pending'
})

// Computed
const currentWeekEnd = computed(() => {
  return endOfWeekInBuenosAires(currentWeekStart.value)
})

const currentWeekDateRange = computed(() => {
  const start = currentWeekStart.value
  const end = currentWeekEnd.value
  return `${start.format('D MMM')} - ${end.format('D MMM YYYY')}`
})

const currentWeekLabel = computed(() => {
  const start = currentWeekStart.value
  const now = nowInBuenosAires()
  
  if (start.isSame(now, 'week')) {
    return 'Esta Semana'
  } else if (start.isSame(now.add(1, 'week'), 'week')) {
    return 'Próxima Semana'
  } else if (start.isSame(now.subtract(1, 'week'), 'week')) {
    return 'Semana Pasada'
  }
  
  return `Semana del ${start.format('D MMM')}`
})

const weekDays = computed(() => {
  const days = []
  const startOfWeek = currentWeekStart.value
  
  for (let i = 0; i < 7; i++) {
    const date = startOfWeek.add(i, 'day')
    days.push({
      date: date.format('YYYY-MM-DD'),
      dayName: date.format('ddd'),
      dayNumber: date.format('D')
    })
  }
  
  return days
})

const workingHours = computed(() => {
  const hours = []
  for (let i = 8; i <= 18; i++) {
    hours.push(i)
  }
  return hours
})

const selectedDayLabel = computed(() => {
  if (!selectedDate.value) return ''
  return toBuenosAires(selectedDate.value).format('dddd, D [de] MMMM')
})

// Methods
const isToday = (date) => {
  return isTodayInBuenosAires(date)
}

const previousWeek = () => {
  currentWeekStart.value = currentWeekStart.value.subtract(1, 'week')
}

const nextWeek = () => {
  currentWeekStart.value = currentWeekStart.value.add(1, 'week')
}

const getDayJobs = (date) => {
  const dayJobs = jobs.value.filter(job => {
    if (!job.scheduledDate) {
      console.log('Job has no scheduledDate:', job)
      return false
    }
    
    // Handle both Date objects and Firestore Timestamps
    let jobDate
    if (job.scheduledDate.toDate) {
      // Firestore Timestamp
      jobDate = toBuenosAires(job.scheduledDate.toDate()).format('YYYY-MM-DD')
    } else {
      // Regular Date object
      jobDate = toBuenosAires(job.scheduledDate).format('YYYY-MM-DD')
    }
    
    console.log('Comparing job date:', jobDate, 'with filter date:', date, 'for job:', job.clientName)
    return jobDate === date
  }).sort((a, b) => {
    const dateA = a.scheduledDate.toDate ? a.scheduledDate.toDate() : a.scheduledDate
    const dateB = b.scheduledDate.toDate ? b.scheduledDate.toDate() : b.scheduledDate
    return toBuenosAires(dateA).diff(toBuenosAires(dateB))
  })
  
  console.log(`Found ${dayJobs.length} jobs for date ${date}`)
  return dayJobs
}

const getHourJobs = (date, hour) => {
  return jobs.value.filter(job => {
    if (!job.scheduledDate) return false
    
    const actualDate = job.scheduledDate.toDate ? job.scheduledDate.toDate() : job.scheduledDate
    const jobDate = toBuenosAires(actualDate)
    return jobDate.format('YYYY-MM-DD') === date && jobDate.hour() === hour
  })
}

const formatJobTime = (scheduledDate, duration) => {
  const actualDate = scheduledDate.toDate ? scheduledDate.toDate() : scheduledDate
  const start = toBuenosAires(actualDate)
  const end = start.add(duration, 'minute')
  return `${start.format('HH:mm')} - ${end.format('HH:mm')}`
}

const formatHour = (hour) => {
  return `${hour.toString().padStart(2, '0')}:00`
}

const getJobStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-50 border-yellow-300 hover:bg-yellow-100',
    confirmed: 'bg-blue-50 border-blue-300 hover:bg-blue-100',
    in_progress: 'bg-orange-50 border-orange-300 hover:bg-orange-100',
    completed: 'bg-green-50 border-green-300 hover:bg-green-100',
    cancelled: 'bg-red-50 border-red-300 hover:bg-red-100'
  }
  return colors[status] || colors.pending
}

const getDayModalJobPosition = (job) => {
  const actualDate = job.scheduledDate.toDate ? job.scheduledDate.toDate() : job.scheduledDate
  const jobStart = toBuenosAires(actualDate)
  const durationMinutes = job.estimatedDuration || 120
  
  const startHour = jobStart.hour()
  const startMinute = jobStart.minute()
  
  // Calculate position relative to working hours (8 AM = hour 0, 6 PM = hour 10)
  const hourFromStart = startHour - 8 // 8 AM is our starting hour
  const hourHeight = 64 // Each hour row is h-16 (64px)
  
  // Position calculations
  const topPosition = (hourFromStart * hourHeight) + (startMinute / 60 * hourHeight)
  const jobHeight = (durationMinutes / 60) * hourHeight
  
  return {
    top: `${topPosition}px`,
    height: `${jobHeight}px`
  }
}

// Modal actions
const openDayView = (date) => {
  selectedDate.value = date
  dayModal.value?.showModal()
}

const closeDayModal = () => {
  selectedDate.value = null
}

const openNewJobModal = () => {
  editingJob.value = null
  jobForm.value = {
    clientName: '',
    clientPhone: '',
    serviceType: '',
    date: nowInBuenosAires().format('YYYY-MM-DD'),
    time: '09:00',
    duration: '2',
    address: '',
    price: '',
    notes: '',
    status: 'pending'
  }
  jobModal.value?.showModal()
}

const editJob = (job) => {
  editingJob.value = job
  const actualDate = job.scheduledDate.toDate ? job.scheduledDate.toDate() : job.scheduledDate
  const jobDate = toBuenosAires(actualDate)
  jobForm.value = {
    clientName: job.clientName,
    clientPhone: job.clientPhone,
    serviceType: job.serviceType,
    date: jobDate.format('YYYY-MM-DD'),
    time: jobDate.format('HH:mm'),
    duration: (job.estimatedDuration / 60).toString(),
    address: job.address,
    price: job.price?.toString() || '',
    notes: job.notes || '',
    status: job.status
  }
  jobModal.value?.showModal()
}

const createJobAtTime = (date, hour) => {
  editingJob.value = null
  jobForm.value = {
    clientName: '',
    clientPhone: '',
    serviceType: '',
    date: date,
    time: `${hour.toString().padStart(2, '0')}:00`,
    duration: '2',
    address: '',
    price: '',
    notes: '',
    status: 'pending'
  }
  jobModal.value?.showModal()
}

const resetJobForm = () => {
  editingJob.value = null
  jobForm.value = {
    clientName: '',
    clientPhone: '',
    serviceType: '',
    date: '',
    time: '',
    duration: '2',
    address: '',
    price: '',
    notes: '',
    status: 'pending'
  }
}

const closeJobModal = () => {
  jobModal.value?.closeModal()
}

const checkTimeOverlap = (newJobStart, newJobDuration, excludeJobId = null) => {
  const newStart = toBuenosAires(newJobStart)
  const newEnd = newStart.add(newJobDuration, 'minute')
  const newDate = newStart.format('YYYY-MM-DD')
  
  const dayJobs = jobs.value.filter(job => {
    if (excludeJobId && job.id === excludeJobId) return false
    if (!job.scheduledDate) return false
    
    const actualDate = job.scheduledDate.toDate ? job.scheduledDate.toDate() : job.scheduledDate
    const jobDate = toBuenosAires(actualDate).format('YYYY-MM-DD')
    return jobDate === newDate
  })
  
  for (const job of dayJobs) {
    const actualDate = job.scheduledDate.toDate ? job.scheduledDate.toDate() : job.scheduledDate
    const jobStart = toBuenosAires(actualDate)
    const jobEnd = jobStart.add(job.estimatedDuration || 120, 'minute')
    
    // Check if times overlap
    if (newStart.isBefore(jobEnd) && newEnd.isAfter(jobStart)) {
      return {
        hasOverlap: true,
        conflictJob: job,
        conflictTime: `${jobStart.format('HH:mm')} - ${jobEnd.format('HH:mm')}`
      }
    }
  }
  
  return { hasOverlap: false }
}

const saveJob = async () => {
  try {
    savingJob.value = true
    
    // Combine date and time
    const scheduledDateTime = toBuenosAires(`${jobForm.value.date} ${jobForm.value.time}`)
    const durationMinutes = parseInt(jobForm.value.duration) * 60
    
    // Check for time overlap
    const overlapCheck = checkTimeOverlap(
      scheduledDateTime.toDate(), 
      durationMinutes, 
      editingJob.value?.id
    )
    
    if (overlapCheck.hasOverlap) {
      useToast().error(
        `Conflicto de horario con "${overlapCheck.conflictJob.clientName}" (${overlapCheck.conflictTime})`
      )
      savingJob.value = false
      return
    }
    
    const jobData = {
      clientName: jobForm.value.clientName.trim(),
      clientPhone: jobForm.value.clientPhone.trim(),
      serviceType: jobForm.value.serviceType,
      scheduledDate: scheduledDateTime.toDate(),
      estimatedDuration: durationMinutes,
      address: jobForm.value.address.trim(),
      price: jobForm.value.price ? parseFloat(jobForm.value.price) : 0,
      notes: jobForm.value.notes.trim(),
      status: jobForm.value.status,
      description: `${jobForm.value.serviceType} - ${jobForm.value.clientName}`,
      clientId: '',
      paid: false
    }

    if (editingJob.value) {
      await update(editingJob.value.id, jobData)
      useToast().success('Trabajo actualizado exitosamente')
    } else {
      await add(jobData)
      useToast().success('Trabajo creado exitosamente')
    }

    // Close modal - jobs will update automatically via subscription
    jobModal.value?.closeModal()
    
  } catch (err) {
    console.error('Error saving job:', err)
    useToast().error('Error al guardar trabajo')
  } finally {
    savingJob.value = false
  }
}

const deleteJob = async () => {
  if (!confirm(`¿Está seguro de eliminar este trabajo?`)) {
    return
  }

  try {
    await remove(editingJob.value.id)
    useToast().success('Trabajo eliminado exitosamente')
    jobModal.value?.closeModal()
  } catch (err) {
    console.error('Error deleting job:', err)
    useToast().error('Error al eliminar trabajo')
  }
}

const loadJobs = async () => {
  try {
    await list()
  } catch (err) {
    console.error('Error loading jobs:', err)
    useToast().error('Error al cargar trabajos')
  }
}

// Load jobs and set up real-time subscription
onMounted(() => {
  // Subscribe to real-time updates
  subscribe()
})
</script>