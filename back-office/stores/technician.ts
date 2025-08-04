import { defineStore } from 'pinia'
import type { 
  Technician, 
  TechnicianCreateInput, 
  TechnicianUpdateInput, 
  WeeklyAvailability, 
  DaySchedule,
  TechnicianService,
  DayOfWeek 
} from '~/types'

// LocalStorage keys following project conventions
const STORAGE_KEYS = {
  TECHNICIAN_PROFILE: 'instalapro_technician_profile',
  TECHNICIAN_SERVICES: 'instalapro_technician_services',
  TECHNICIAN_AVAILABILITY: 'instalapro_technician_availability'
} as const

// Default day schedule template
const createDefaultDaySchedule = (): DaySchedule => ({
  enabled: true,
  startTime: '09:00',
  endTime: '18:00',
  breakStart: '12:00',
  breakEnd: '13:00'
})

// Default weekly availability template
const createDefaultWeeklyAvailability = (): WeeklyAvailability => ({
  monday: createDefaultDaySchedule(),
  tuesday: createDefaultDaySchedule(),
  wednesday: createDefaultDaySchedule(),
  thursday: createDefaultDaySchedule(),
  friday: createDefaultDaySchedule(),
  saturday: { ...createDefaultDaySchedule(), startTime: '09:00', endTime: '14:00', breakStart: undefined, breakEnd: undefined },
  sunday: { enabled: false, startTime: '09:00', endTime: '18:00' }
})

// Default technician services
const createDefaultServices = (): TechnicianService[] => [
  {
    id: '1',
    name: 'Instalación Split 2500-3500 BTU',
    description: 'Instalación completa de aire acondicionado split hasta 3500 BTU',
    basePrice: 25000,
    estimatedDuration: 180,
    category: 'installation',
    isActive: true
  },
  {
    id: '2',
    name: 'Mantenimiento Preventivo',
    description: 'Limpieza y mantenimiento preventivo de equipo',
    basePrice: 8000,
    estimatedDuration: 90,
    category: 'maintenance',
    isActive: true
  },
  {
    id: '3',
    name: 'Reparación General',
    description: 'Diagnóstico y reparación de fallas comunes',
    basePrice: 12000,
    estimatedDuration: 120,
    category: 'repair',
    isActive: true
  }
]

export const useTechnicianStore = defineStore('technician', () => {
  // ==========================================
  // STATE
  // ==========================================
  
  const technician = ref<Technician | null>(null)
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  // ==========================================
  // GETTERS
  // ==========================================

  const isProfileComplete = computed(() => {
    return technician.value?.profileSetupComplete || false
  })

  const activeServices = computed(() => {
    return technician.value?.services.filter(service => service.isActive) || []
  })

  const hasAvailability = computed(() => {
    if (!technician.value?.availability) return false
    
    return Object.values(technician.value.availability).some(day => day.enabled)
  })

  // ==========================================
  // ACTIONS - DATA PERSISTENCE
  // ==========================================

  const saveToLocalStorage = () => {
    if (!technician.value) return

    try {
      // Save technician profile
      localStorage.setItem(
        STORAGE_KEYS.TECHNICIAN_PROFILE, 
        JSON.stringify({
          ...technician.value,
          // Convert dates to ISO strings for storage
          createdAt: technician.value.createdAt.toISOString(),
          updatedAt: technician.value.updatedAt.toISOString()
        })
      )
    } catch (err) {
      console.error('Error saving technician to localStorage:', err)
      error.value = 'Error guardando los datos del técnico'
    }
  }

  const loadFromLocalStorage = (): Technician | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TECHNICIAN_PROFILE)
      if (!stored) return null

      const parsed = JSON.parse(stored)
      
      // Convert ISO strings back to Date objects
      return {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
        updatedAt: new Date(parsed.updatedAt)
      }
    } catch (err) {
      console.error('Error loading technician from localStorage:', err)
      return null
    }
  }

  // ==========================================
  // ACTIONS - CRUD OPERATIONS
  // ==========================================

  const createTechnician = async (input: TechnicianCreateInput): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const now = new Date()
      const technicianId = `tech_${Date.now()}`
      
      const newTechnician: Technician = {
        id: technicianId,
        name: input.name,
        phone: input.phone,
        whatsappNumber: input.phone, // Default to same as phone
        email: input.email,
        businessName: input.businessName,
        serviceArea: input.serviceArea,
        services: createDefaultServices(),
        availability: createDefaultWeeklyAvailability(),
        bookingUrl: `agenda.instalapro.com/${technicianId}`,
        profileSetupComplete: false,
        createdAt: now,
        updatedAt: now
      }

      technician.value = newTechnician
      saveToLocalStorage()
    } catch (err) {
      error.value = 'Error creando el perfil del técnico'
      console.error('Error creating technician:', err)
    } finally {
      loading.value = false
    }
  }

  const updateTechnician = async (updates: TechnicianUpdateInput): Promise<void> => {
    if (!technician.value) {
      error.value = 'No hay técnico para actualizar'
      return
    }

    loading.value = true
    error.value = null

    try {
      technician.value = {
        ...technician.value,
        ...updates,
        updatedAt: new Date()
      }

      saveToLocalStorage()
    } catch (err) {
      error.value = 'Error actualizando el perfil del técnico'
      console.error('Error updating technician:', err)
    } finally {
      loading.value = false
    }
  }

  const loadTechnician = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const loaded = loadFromLocalStorage()
      technician.value = loaded
    } catch (err) {
      error.value = 'Error cargando el perfil del técnico'
      console.error('Error loading technician:', err)
    } finally {
      loading.value = false
    }
  }

  // ==========================================
  // ACTIONS - AVAILABILITY MANAGEMENT
  // ==========================================

  const updateAvailability = async (availability: WeeklyAvailability): Promise<void> => {
    if (!technician.value) {
      error.value = 'No hay técnico para actualizar'
      return
    }

    loading.value = true
    error.value = null

    try {
      technician.value = {
        ...technician.value,
        availability,
        updatedAt: new Date()
      }

      saveToLocalStorage()
    } catch (err) {
      error.value = 'Error actualizando la disponibilidad'
      console.error('Error updating availability:', err)
    } finally {
      loading.value = false
    }
  }

  const updateDaySchedule = async (day: DayOfWeek, schedule: DaySchedule): Promise<void> => {
    if (!technician.value) {
      error.value = 'No hay técnico para actualizar'
      return
    }

    loading.value = true
    error.value = null

    try {
      technician.value = {
        ...technician.value,
        availability: {
          ...technician.value.availability,
          [day]: schedule
        },
        updatedAt: new Date()
      }

      saveToLocalStorage()
    } catch (err) {
      error.value = 'Error actualizando el horario del día'
      console.error('Error updating day schedule:', err)
    } finally {
      loading.value = false
    }
  }

  const toggleDayAvailability = async (day: DayOfWeek): Promise<void> => {
    if (!technician.value) {
      error.value = 'No hay técnico para actualizar'
      return
    }

    const currentDay = technician.value.availability[day]
    await updateDaySchedule(day, {
      ...currentDay,
      enabled: !currentDay.enabled
    })
  }

  // ==========================================
  // ACTIONS - SERVICE MANAGEMENT
  // ==========================================

  const addService = async (service: Omit<TechnicianService, 'id'>): Promise<void> => {
    if (!technician.value) {
      error.value = 'No hay técnico para actualizar'
      return
    }

    loading.value = true
    error.value = null

    try {
      const newService: TechnicianService = {
        ...service,
        id: `service_${Date.now()}`
      }

      technician.value = {
        ...technician.value,
        services: [...technician.value.services, newService],
        updatedAt: new Date()
      }

      saveToLocalStorage()
    } catch (err) {
      error.value = 'Error agregando el servicio'
      console.error('Error adding service:', err)
    } finally {
      loading.value = false
    }
  }

  const updateService = async (serviceId: string, updates: Partial<TechnicianService>): Promise<void> => {
    if (!technician.value) {
      error.value = 'No hay técnico para actualizar'
      return
    }

    loading.value = true
    error.value = null

    try {
      technician.value = {
        ...technician.value,
        services: technician.value.services.map(service => 
          service.id === serviceId 
            ? { ...service, ...updates }
            : service
        ),
        updatedAt: new Date()
      }

      saveToLocalStorage()
    } catch (err) {
      error.value = 'Error actualizando el servicio'
      console.error('Error updating service:', err)
    } finally {
      loading.value = false
    }
  }

  const deleteService = async (serviceId: string): Promise<void> => {
    if (!technician.value) {
      error.value = 'No hay técnico para actualizar'
      return
    }

    loading.value = true
    error.value = null

    try {
      technician.value = {
        ...technician.value,
        services: technician.value.services.filter(service => service.id !== serviceId),
        updatedAt: new Date()
      }

      saveToLocalStorage()
    } catch (err) {
      error.value = 'Error eliminando el servicio'
      console.error('Error deleting service:', err)
    } finally {
      loading.value = false
    }
  }

  // ==========================================
  // ACTIONS - PROFILE COMPLETION
  // ==========================================

  const markProfileComplete = async (): Promise<void> => {
    if (!technician.value) return

    await updateTechnician({ 
      profileSetupComplete: true 
    })
  }

  // ==========================================
  // INITIALIZATION
  // ==========================================

  const initialize = async (): Promise<void> => {
    await loadTechnician()
  }

  // Return store interface
  return {
    // State (remove readonly to fix the warning)
    technician,
    loading,
    error,

    // Getters
    isProfileComplete,
    activeServices,
    hasAvailability,

    // Actions
    createTechnician,
    updateTechnician,
    loadTechnician,
    initialize,

    // Availability management
    updateAvailability,
    updateDaySchedule,
    toggleDayAvailability,

    // Service management
    addService,
    updateService,
    deleteService,

    // Profile completion
    markProfileComplete
  }
})