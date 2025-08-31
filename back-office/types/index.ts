// Core business entity interfaces for InstalarPro back-office
// All interfaces designed for both LocalStorage and Firestore compatibility

// ==========================================
// TECHNICIAN INTERFACES (BASIC PROFILE ONLY)
// ==========================================

export interface Technician {
  id: string
  userUid: string // Firebase Auth user ID for data isolation
  name: string
  email: string // Primary email (from Firebase Auth)
  secondaryEmail?: string // Optional additional email
  phone: string
  createdAt: Date
  updatedAt: Date
  createdBy?: string // Firebase Auth user ID
  isActive?: boolean // For soft deletion
  archivedAt?: Date // When account was closed
  deactivatedAt?: Date // When account was deactivated
}

// Input types for store operations
export interface TechnicianCreateInput {
  name: string
  phone: string
  secondaryEmail?: string
}

export interface TechnicianUpdateInput {
  name?: string
  phone?: string
  secondaryEmail?: string
}

// ==========================================
// SERVICE TYPE INTERFACES
// ==========================================

export interface ServiceType {
  id: string
  userUid: string // Firebase Auth user ID for data isolation
  name: string
  description?: string
  basePrice: number
  estimatedDuration: number // minutes
  category: string
  isActive?: boolean
  createdAt: Date
  updatedAt: Date
  createdBy?: string
}

// Input types for service type operations
export interface ServiceTypeCreateInput {
  name: string
  description?: string
  basePrice: number
  estimatedDuration: number // minutes
  category: string
}

export interface ServiceTypeUpdateInput {
  name?: string
  description?: string
  basePrice?: number
  estimatedDuration?: number // minutes
  category?: string
  isActive?: boolean
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
// SCHEDULE & TIME SLOT INTERFACES
// ==========================================

export interface TimeSlot {
  id: string
  date: string // YYYY-MM-DD format
  startTime: string // HH:mm format
  endTime: string // HH:mm format
  duration: number // minutes
  status: 'available' | 'booked' | 'blocked' | 'break'
  jobId?: string // Reference to job if booked
  technicianId: string
  serviceTypes: string[] // Which services can be booked in this slot
  createdAt: Date
  updatedAt: Date
}

export interface TimeSlotCreateInput {
  date: string
  startTime: string
  endTime: string
  duration: number
  status: 'available' | 'blocked'
  serviceTypes?: string[]
}

export interface TimeSlotUpdateInput {
  status?: TimeSlot['status']
  jobId?: string
  serviceTypes?: string[]
}

export interface ScheduleDay {
  date: string // YYYY-MM-DD format
  dayOfWeek: DayOfWeek
  isAvailable: boolean
  timeSlots: TimeSlot[]
  totalSlots: number
  availableSlots: number
  bookedSlots: number
  blockedSlots: number
}

export interface ScheduleWeek {
  startDate: string // YYYY-MM-DD format
  endDate: string // YYYY-MM-DD format
  days: ScheduleDay[]
  totalAvailableHours: number
  utilization: number // Percentage of booked vs available slots
}

export interface BlockedTimeSlot {
  id: string
  technicianId: string
  startDate: string // YYYY-MM-DD format
  endDate: string // YYYY-MM-DD format
  startTime: string // HH:mm format
  endTime: string // HH:mm format
  reason: string
  isRecurring: boolean
  recurringPattern?: 'weekly' | 'monthly'
  createdAt: Date
  updatedAt: Date
}

export interface SlotGenerationOptions {
  slotDuration: number // Default slot duration in minutes
  bufferTime: number // Buffer time between appointments in minutes
  advanceBookingDays: number // How many days ahead to generate slots
  minBookingNotice: number // Minimum hours notice required for booking
}

// ==========================================
// UTILITY TYPES
// ==========================================

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

export type ServiceCategory = 'installation' | 'maintenance' | 'repair' | 'consultation'

export type JobStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'

export type PaymentMethod = 'cash' | 'transfer' | 'card'

export type TimeSlotStatus = 'available' | 'booked' | 'blocked' | 'break'

export type ScheduleView = 'day' | 'week' | 'month'