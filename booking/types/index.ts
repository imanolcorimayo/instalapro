// Core business entity interfaces for InstalaPro booking page
// Subset of back-office types needed for public booking functionality

// ==========================================
// TECHNICIAN INTERFACES (PUBLIC VIEW)
// ==========================================

export interface Technician {
  id: string
  userUid: string
  name: string
  email: string
  phone: string
  urlSlug?: string
  isActive?: boolean
  createdAt: Date
  updatedAt: Date
}

// ==========================================
// SERVICE TYPE INTERFACES
// ==========================================

export interface ServiceType {
  id: string
  userUid: string
  name: string
  description?: string
  basePrice: number
  estimatedDuration: number // minutes
  category: string
  isActive?: boolean
  createdAt: Date
  updatedAt: Date
}

// ==========================================
// SLOT AVAILABILITY INTERFACES
// ==========================================

export interface SlotAvailability {
  id: string
  userUid: string
  date: string // YYYY-MM-DD
  hour: number // 6-22
  isAvailable: boolean
  isManual: boolean // true = manually set, false = auto-closed by job
  createdAt: Date
  updatedAt: Date
}

// ==========================================
// BOOKING REQUEST INTERFACES
// ==========================================

export interface BookingRequest {
  id: string
  technicianId: string
  technicianUserUid: string
  clientName: string
  clientPhone: string
  clientEmail?: string
  serviceTypeId: string
  serviceTypeName: string
  preferredDate?: Date
  preferredTime?: string // HH:mm format
  address?: string
  notes?: string
  status: 'pending' | 'confirmed' | 'rejected'
  createdAt: Date
  updatedAt: Date
}

export interface BookingRequestCreateInput {
  technicianId: string
  technicianUserUid: string
  clientName: string
  clientPhone: string
  clientEmail?: string
  serviceTypeId: string
  serviceTypeName: string
  preferredDate?: Date
  preferredTime?: string
  address?: string
  notes?: string
}

// ==========================================
// CLIENT INTERFACES (MINIMAL FOR BOOKING)
// ==========================================

export interface Client {
  id: string
  userUid: string
  name: string
  email: string
  phone: string
  address: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface ClientCreateInput {
  name: string
  email: string
  phone: string
  address: string
  notes?: string
}
