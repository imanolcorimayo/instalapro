// Core business entity interfaces for InstalarPro back-office
// All interfaces designed for both LocalStorage and Firestore compatibility

// ==========================================
// TECHNICIAN & AVAILABILITY INTERFACES
// ==========================================

export interface DaySchedule {
  enabled: boolean
  startTime: string // HH:mm format (e.g., "09:00")
  endTime: string // HH:mm format (e.g., "18:00")
  breakStart?: string // HH:mm format (e.g., "12:00")
  breakEnd?: string // HH:mm format (e.g., "13:00")
}

export interface WeeklyAvailability {
  monday: DaySchedule
  tuesday: DaySchedule
  wednesday: DaySchedule
  thursday: DaySchedule
  friday: DaySchedule
  saturday: DaySchedule
  sunday: DaySchedule
}

export interface TechnicianService {
  id: string
  name: string
  description: string
  basePrice: number
  estimatedDuration: number // minutes
  category: 'installation' | 'maintenance' | 'repair' | 'consultation'
  isActive: boolean
}

export interface Technician {
  id: string
  name: string
  phone: string
  whatsappNumber: string
  email: string
  businessName?: string
  serviceArea: string[] // Cities/zones served
  services: TechnicianService[]
  availability: WeeklyAvailability
  bookingUrl: string // agenda.instalapro.com/{technician}
  profileSetupComplete: boolean
  createdAt: Date
  updatedAt: Date
}

// Input types for store operations
export interface TechnicianCreateInput {
  name: string
  phone: string
  email: string
  businessName?: string
  serviceArea: string[]
}

export interface TechnicianUpdateInput {
  name?: string
  phone?: string
  whatsappNumber?: string
  email?: string
  businessName?: string
  serviceArea?: string[]
  services?: TechnicianService[]
  availability?: WeeklyAvailability
}

// ==========================================
// JOB & SCHEDULE INTERFACES
// ==========================================

export interface Job {
  id: string
  clientId: string
  clientName: string
  clientPhone: string
  serviceType: string
  description: string
  address: string
  scheduledDate: Date
  estimatedDuration: number // minutes
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  price: number
  paid: boolean
  notes: string
  createdAt: Date
  updatedAt: Date
}

export interface JobCreateInput {
  clientId: string
  clientName: string
  clientPhone: string
  serviceType: string
  description: string
  address: string
  scheduledDate: Date
  estimatedDuration: number
  price: number
  notes?: string
}

export interface JobUpdateInput {
  clientName?: string
  clientPhone?: string
  serviceType?: string
  description?: string
  address?: string
  scheduledDate?: Date
  estimatedDuration?: number
  status?: Job['status']
  price?: number
  paid?: boolean
  notes?: string
}

// ==========================================
// CLIENT INTERFACES
// ==========================================

export interface JobHistory {
  jobId: string
  date: Date
  serviceType: string
  description: string
  price: number
  status: string
}

export interface Client {
  id: string
  name: string
  phone: string
  address: string
  email?: string
  serviceHistory: JobHistory[]
  totalJobs: number
  totalSpent: number
  preferredServiceTypes: string[]
  notes: string
  createdAt: Date
  updatedAt: Date
}

export interface ClientCreateInput {
  name: string
  phone: string
  address: string
  email?: string
  notes?: string
}

export interface ClientUpdateInput {
  name?: string
  phone?: string
  address?: string
  email?: string
  notes?: string
  preferredServiceTypes?: string[]
}

// ==========================================
// QUOTE INTERFACES
// ==========================================

export interface QuoteItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface Quote {
  id: string
  clientId?: string
  clientName: string
  serviceType: string
  description: string
  items: QuoteItem[]
  subtotal: number
  tax: number
  total: number
  validUntil: Date
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
  createdAt: Date
  updatedAt: Date
}

export interface QuoteCreateInput {
  clientId?: string
  clientName: string
  serviceType: string
  description: string
  items: Omit<QuoteItem, 'id'>[]
  validUntil: Date
}

export interface QuoteUpdateInput {
  clientName?: string
  serviceType?: string
  description?: string
  items?: QuoteItem[]
  validUntil?: Date
  status?: Quote['status']
}

// ==========================================
// CASH FLOW & PAYMENT INTERFACES
// ==========================================

export interface Payment {
  id: string
  jobId: string
  clientId: string
  amount: number
  paymentMethod: 'cash' | 'transfer' | 'card'
  paymentDate: Date
  notes: string
  createdAt: Date
  updatedAt: Date
}

export interface ServiceSummary {
  serviceType: string
  count: number
  revenue: number
}

export interface MonthlyReport {
  id: string
  month: string // YYYY-MM format
  totalRevenue: number
  totalJobs: number
  paidJobs: number
  pendingPayments: number
  topServices: ServiceSummary[]
  createdAt: Date
  updatedAt: Date
}

export interface PaymentCreateInput {
  jobId: string
  clientId: string
  amount: number
  paymentMethod: 'cash' | 'transfer' | 'card'
  paymentDate: Date
  notes?: string
}

export interface PaymentUpdateInput {
  amount?: number
  paymentMethod?: Payment['paymentMethod']
  paymentDate?: Date
  notes?: string
}

// ==========================================
// UTILITY TYPES
// ==========================================

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

export type ServiceCategory = 'installation' | 'maintenance' | 'repair' | 'consultation'

export type JobStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'

export type PaymentMethod = 'cash' | 'transfer' | 'card'