<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    @click.self="handleClose"
  >
    <div class="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full max-h-[85vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Consulta General</h2>
        <button
          @click="handleClose"
          class="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
        >
          <IconClose class="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <!-- Step 1: Type of Consultation -->
      <div v-if="currentStep === 1">
        <p class="text-gray-700 mb-4 text-lg">¿Tu consulta es sobre uno o más equipos de aire acondicionado?</p>

        <div class="space-y-3">
          <button
            @click="selectConsultationType('devices')"
            class="w-full h-14 px-6 rounded-lg border-2 border-blue-600 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <IconSnowflake class="w-5 h-5" />
            Sí, sobre equipos de AA
          </button>

          <button
            @click="selectConsultationType('general')"
            class="w-full h-14 px-6 rounded-lg border-2 border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <IconClipboardText class="w-5 h-5" />
            No, otra consulta
          </button>
        </div>
      </div>

      <!-- Step 2a: Device Details (if devices selected) -->
      <div v-else-if="currentStep === 2 && consultationType === 'devices'">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800">Equipo #{{ currentDeviceIndex + 1 }}</h3>
          <button
            @click="goBackToStep1"
            class="text-sm text-blue-600 hover:text-blue-700"
          >
            Cambiar tipo
          </button>
        </div>

        <form @submit.prevent class="space-y-4">
          <!-- Access Question -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              ¿Se puede acceder fácilmente a la unidad exterior?
            </label>
            <div class="grid grid-cols-3 gap-2">
              <button
                type="button"
                @click="currentDevice.easyAccess = 'yes'"
                :class="[
                  'h-11 rounded-lg border-2 font-medium transition-colors',
                  currentDevice.easyAccess === 'yes'
                    ? 'border-green-600 bg-green-50 text-green-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                ]"
              >
                Sí
              </button>
              <button
                type="button"
                @click="currentDevice.easyAccess = 'no'"
                :class="[
                  'h-11 rounded-lg border-2 font-medium transition-colors',
                  currentDevice.easyAccess === 'no'
                    ? 'border-red-600 bg-red-50 text-red-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                ]"
              >
                No
              </button>
              <button
                type="button"
                @click="currentDevice.easyAccess = 'unsure'"
                :class="[
                  'h-11 rounded-lg border-2 font-medium text-sm transition-colors',
                  currentDevice.easyAccess === 'unsure'
                    ? 'border-yellow-600 bg-yellow-50 text-yellow-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                ]"
              >
                No estoy seguro
              </button>
            </div>
          </div>

          <!-- Access Details (if difficult) -->
          <div v-if="currentDevice.easyAccess === 'no'">
            <label for="access-details" class="block text-sm font-medium text-gray-700 mb-1">
              Describe el acceso
            </label>
            <input
              id="access-details"
              v-model="currentDevice.accessDetails"
              type="text"
              class="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: 9º piso, azotea, acceso complicado"
            />
          </div>

          <!-- Brand/Model -->
          <div>
            <label for="brand-model" class="block text-sm font-medium text-gray-700 mb-1">
              Marca y modelo (si se conoce)
            </label>
            <input
              id="brand-model"
              v-model="currentDevice.brandModel"
              type="text"
              class="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: Samsung AR12"
            />
          </div>

          <!-- Capacity -->
          <div>
            <label for="capacity" class="block text-sm font-medium text-gray-700 mb-1">
              Frigorías o capacidad aproximada
            </label>
            <input
              id="capacity"
              v-model="currentDevice.capacity"
              type="text"
              class="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: 3000 frigorías, 2250W"
            />
          </div>

          <!-- Installation Age -->
          <div>
            <label for="age" class="block text-sm font-medium text-gray-700 mb-1">
              Años instalado o estado
            </label>
            <input
              id="age"
              v-model="currentDevice.age"
              type="text"
              class="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: 5 años, nuevo sin instalar"
            />
          </div>

          <!-- Problem Description -->
          <div>
            <label for="problem" class="block text-sm font-medium text-gray-700 mb-1">
              Describe el problema o consulta <span class="text-red-500">*</span>
            </label>
            <textarea
              id="problem"
              v-model="currentDevice.problem"
              rows="4"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Describe lo que sucede o lo que necesitas saber"
              required
            ></textarea>
          </div>
        </form>

        <!-- Actions -->
        <div class="space-y-3 mt-6">
          <button
            @click="saveCurrentDevice"
            :disabled="!currentDevice.problem?.trim()"
            :class="[
              'w-full h-12 rounded-lg font-semibold transition-colors',
              currentDevice.problem?.trim()
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            ]"
          >
            {{ devices.length > 0 ? 'Guardar equipo' : 'Continuar' }}
          </button>

          <button
            v-if="devices.length > 0"
            @click="proceedToClientInfo"
            class="w-full h-12 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors"
          >
            Finalizar y continuar
          </button>
        </div>

        <!-- Saved Devices Summary -->
        <div v-if="devices.length > 0" class="mt-6 pt-6 border-t border-gray-200">
          <p class="text-sm font-medium text-gray-700 mb-3">Equipos agregados: {{ devices.length }}</p>
          <div class="space-y-2">
            <div
              v-for="(device, index) in devices"
              :key="index"
              class="bg-gray-50 rounded-lg p-3 text-sm"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <p class="font-medium text-gray-800">Equipo #{{ index + 1 }}</p>
                  <p class="text-gray-600 line-clamp-2">{{ device.problem }}</p>
                </div>
                <button
                  @click="removeDevice(index)"
                  class="ml-2 text-red-600 hover:text-red-700"
                >
                  <IconDelete class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 2b: General Consultation (if general selected) -->
      <div v-else-if="currentStep === 2 && consultationType === 'general'">
        <div class="mb-4">
          <button
            @click="goBackToStep1"
            class="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <IconChevronLeft class="w-4 h-4" />
            Cambiar tipo
          </button>
        </div>

        <form @submit.prevent class="space-y-4">
          <div>
            <label for="general-consultation" class="block text-sm font-medium text-gray-700 mb-1">
              ¿Podrías describir tu consulta? <span class="text-red-500">*</span>
            </label>
            <textarea
              id="general-consultation"
              v-model="generalConsultation"
              rows="8"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Describe tu consulta con el mayor detalle posible..."
              required
            ></textarea>
          </div>
        </form>

        <!-- Actions -->
        <div class="mt-6">
          <button
            @click="proceedToClientInfo"
            :disabled="!generalConsultation?.trim()"
            :class="[
              'w-full h-12 rounded-lg font-semibold transition-colors',
              generalConsultation?.trim()
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            ]"
          >
            Continuar
          </button>
        </div>
      </div>

      <!-- Step 3: Client Information -->
      <div v-else-if="currentStep === 3">
        <div class="mb-4">
          <button
            @click="goBackToStep2"
            class="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <IconChevronLeft class="w-4 h-4" />
            Volver
          </button>
        </div>

        <h3 class="text-lg font-semibold text-gray-800 mb-4">Tus datos</h3>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Email -->
          <div>
            <label for="consult-email" class="block text-sm font-medium text-gray-700 mb-1">
              Email <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <input
                id="consult-email"
                v-model="clientInfo.email"
                @blur="handleEmailBlur"
                type="email"
                class="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="tu@email.com"
                required
              />
              <div v-if="clientsStore.loading" class="absolute right-3 top-1/2 -translate-y-1/2">
                <div class="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            </div>
            <p v-if="emailError" class="text-xs text-red-500 mt-1">{{ emailError }}</p>
            <p v-else-if="clientFound" class="text-xs text-green-600 mt-1 flex items-center gap-1">
              <IconCheck class="w-4 h-4" />
              Cliente encontrado - datos precargados
            </p>
          </div>

          <!-- Name -->
          <div>
            <label for="consult-name" class="block text-sm font-medium text-gray-700 mb-1">
              Nombre <span class="text-red-500">*</span>
            </label>
            <input
              id="consult-name"
              v-model="clientInfo.name"
              type="text"
              class="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Tu nombre"
              required
            />
          </div>

          <!-- Phone -->
          <div>
            <label for="consult-phone" class="block text-sm font-medium text-gray-700 mb-1">
              Teléfono <span class="text-red-500">*</span>
            </label>
            <input
              id="consult-phone"
              v-model="clientInfo.phone"
              type="tel"
              class="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="+54 9 11 1234-5678"
              required
            />
          </div>

          <!-- Address -->
          <div>
            <label for="consult-address" class="block text-sm font-medium text-gray-700 mb-1">
              Dirección <span class="text-red-500">*</span>
            </label>
            <input
              id="consult-address"
              v-model="clientInfo.address"
              type="text"
              class="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Calle, número, piso, depto"
              required
            />
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="submitting || !isClientInfoComplete"
            :class="[
              'w-full h-12 rounded-lg font-semibold transition-colors mt-6',
              isClientInfoComplete && !submitting
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            ]"
          >
            {{ submitting ? 'Enviando...' : 'Enviar consulta' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
// Icons
import IconClose from '~icons/mdi/close'
import IconSnowflake from '~icons/mdi/snowflake'
import IconClipboardText from '~icons/mdi/clipboard-text-outline'
import IconChevronLeft from '~icons/mdi/chevron-left'
import IconDelete from '~icons/mdi/delete-outline'
import IconCheck from '~icons/mdi/check'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  technicianUserUid: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close', 'submitted'])

// Cookie for email persistence
const emailCookie = useCookie('booking_client_email')

// Stores
const clientsStore = useClientsStore()

// State
const currentStep = ref(1)
const consultationType = ref(null) // 'devices' or 'general'
const devices = ref([])
const currentDeviceIndex = ref(0)
const currentDevice = ref({
  easyAccess: null,
  accessDetails: '',
  brandModel: '',
  capacity: '',
  age: '',
  problem: ''
})
const generalConsultation = ref('')
const clientInfo = ref({
  email: '',
  name: '',
  phone: '',
  address: ''
})
const submitting = ref(false)

// Client lookup state
const clientFound = ref(false)
const emailError = ref(null)

// Computed
const isClientInfoComplete = computed(() => {
  return clientInfo.value.email?.trim() &&
         clientInfo.value.name?.trim() &&
         clientInfo.value.phone?.trim() &&
         clientInfo.value.address?.trim()
})

// Handle email blur - lookup client
const handleEmailBlur = async () => {
  const email = clientInfo.value.email.trim()

  // Reset state
  clientFound.value = false
  emailError.value = null

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email) {
    return
  }

  if (!emailRegex.test(email)) {
    emailError.value = 'Email inválido'
    return
  }

  // Save email to cookie
  emailCookie.value = email

  // Lookup client
  const client = await clientsStore.findClientByEmail(email, props.technicianUserUid)

  if (client) {
    // Client found - pre-populate form
    clientFound.value = true
    clientInfo.value.name = client.name
    clientInfo.value.phone = client.phone
    clientInfo.value.address = client.address
  }
}

// Load email from cookie when reaching step 3
const loadEmailFromCookie = async () => {
  if (emailCookie.value && !clientInfo.value.email) {
    clientInfo.value.email = emailCookie.value
    await handleEmailBlur()
  }
}

// Watch for step 3 to load email from cookie
watch(currentStep, async (newStep) => {
  if (newStep === 3) {
    await loadEmailFromCookie()
  }
})

// Methods
const selectConsultationType = (type) => {
  consultationType.value = type
  currentStep.value = 2
}

const goBackToStep1 = () => {
  currentStep.value = 1
  consultationType.value = null
}

const goBackToStep2 = () => {
  currentStep.value = 2
}

const saveCurrentDevice = () => {
  if (!currentDevice.value.problem?.trim()) return

  devices.value.push({ ...currentDevice.value })

  // Reset current device for next entry
  currentDevice.value = {
    easyAccess: null,
    accessDetails: '',
    brandModel: '',
    capacity: '',
    age: '',
    problem: ''
  }
}

const removeDevice = (index) => {
  devices.value.splice(index, 1)
}

const proceedToClientInfo = () => {
  // If editing a device, save it first
  if (currentDevice.value.problem?.trim() && consultationType.value === 'devices') {
    saveCurrentDevice()
  }

  currentStep.value = 3
}

const formatConsultationNotes = () => {
  let notes = '=== CONSULTA GENERAL ===\n\n'

  if (consultationType.value === 'devices') {
    notes += 'TIPO: Equipos de Aire Acondicionado\n\n'
    notes += '--- EQUIPOS ---\n'

    devices.value.forEach((device, index) => {
      notes += `\nEquipo #${index + 1}:\n`
      if (device.brandModel) notes += `- Marca/Modelo: ${device.brandModel}\n`
      if (device.capacity) notes += `- Frigorías/Capacidad: ${device.capacity}\n`
      if (device.age) notes += `- Años instalado: ${device.age}\n`

      const accessText = device.easyAccess === 'yes' ? 'Sí' : device.easyAccess === 'no' ? 'No' : 'No estoy seguro'
      notes += `- Acceso fácil: ${accessText}\n`
      if (device.accessDetails) notes += `- Detalles de acceso: ${device.accessDetails}\n`

      notes += `- Problema/Consulta: ${device.problem}\n`
    })
  } else {
    notes += 'TIPO: Otra consulta\n\n'
    notes += '--- CONSULTA ---\n'
    notes += generalConsultation.value
  }

  return notes
}

const handleSubmit = async () => {
  if (!isClientInfoComplete.value || submitting.value) return

  submitting.value = true

  try {
    const jobsStore = useJobsStore()
    const clientsStore = useClientsStore()

    const clientEmail = clientInfo.value.email.trim().toLowerCase()

    // Step 1: Create or get client
    let clientId
    const existingClient = await clientsStore.findClientByEmail(clientEmail, props.technicianUserUid)

    if (existingClient) {
      clientId = existingClient.id
    } else {
      const { ClientsSchema } = await import('~/utils/odm/schemas/clientSchema')
      const clientsSchema = new ClientsSchema()

      const clientData = {
        userUid: props.technicianUserUid,
        name: clientInfo.value.name.trim(),
        email: clientEmail,
        phone: clientInfo.value.phone.trim(),
        address: clientInfo.value.address.trim(),
        notes: ''
      }

      const clientResult = await clientsSchema.create(clientData)

      if (!clientResult.success) {
        throw new Error(clientResult.error || 'Error al crear cliente')
      }

      clientId = clientResult.data?.id
    }

    // Step 2: Create job with consultation details
    const jobData = {
      userUid: props.technicianUserUid,
      clientId: clientId,
      clientName: clientInfo.value.name.trim(),
      clientPhone: clientInfo.value.phone.trim(),
      clientEmail: clientEmail,
      serviceType: 'Consulta General',
      description: 'Consulta general - Pendiente de revisión y cotización',
      address: clientInfo.value.address.trim(),
      scheduledDate: new Date(), // Temporary date - technician will schedule
      estimatedDuration: 60, // Default 1 hour
      price: 0, // TBD
      notes: formatConsultationNotes(),
      status: 'pending',
      source: 'client_booking',
      isCustomService: true
    }

    await jobsStore.createJob(jobData)

    // Success
    emit('submitted')
    handleClose()
  } catch (err) {
    console.error('Error submitting consultation:', err)
    alert('Error al enviar la consulta. Por favor, intenta nuevamente.')
  } finally {
    submitting.value = false
  }
}

const handleClose = () => {
  // Reset state
  currentStep.value = 1
  consultationType.value = null
  devices.value = []
  currentDeviceIndex.value = 0
  currentDevice.value = {
    easyAccess: null,
    accessDetails: '',
    brandModel: '',
    capacity: '',
    age: '',
    problem: ''
  }
  generalConsultation.value = ''
  clientInfo.value = {
    email: '',
    name: '',
    phone: '',
    address: ''
  }
  submitting.value = false
  clientFound.value = false
  emailError.value = null

  emit('close')
}
</script>
