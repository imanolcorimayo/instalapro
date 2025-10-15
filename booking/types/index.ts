// Core business entity interfaces for InstalarPro booking page
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
  address?: string
  notes?: string
}
