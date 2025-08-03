# InstalarPro Booking - Client Appointment Interface

## Domain Overview
**URL**: https://agenda.instalapro.com/{technician}  
**Purpose**: Individual technician booking pages for their clients  
**Target Users**: End customers who received the booking link directly from their technician
**Primary Goal**: Convert booking requests into confirmed appointments with minimal friction

## Business Model Clarification
**IMPORTANT**: Each technician gets their own individual booking page after setting up their account in back-office.
- Technicians share their unique booking URL directly with their clients
- Each URL is customized for that specific technician: `agenda.instalapro.com/{technician}`
- Clients only see and book with the one technician who shared the link
- We NEVER have a technician directory or public listing - each page is private to that technician's clients
- This is NOT a marketplace - it's individual booking pages for each technician's business

## Core Philosophy: Ultra-Simple UX

### Design Priorities (In Order)
1. **MOBILE FIRST** - 90% of users will book via smartphone
2. **MINIMAL STEPS** - 3 screens maximum: Service → Time → Confirmation  
3. **NO REGISTRATION** - Phone number is the only required identifier
4. **INSTANT FEEDBACK** - Real-time availability, immediate confirmation
5. **WHATSAPP NATIVE** - Leverage familiar communication patterns

### User Journey Flow
```
Technician shares booking link → Client receives link → Select Service → Pick Date/Time → Enter Details → Confirmation → WhatsApp notification to technician
```

## URL Structure & Routing

### Technician-Specific URLs
- **Primary**: `agenda.instalapro.com/{technician-slug}`
- **Service-Specific**: `agenda.instalapro.com/{technician-slug}/{service}`
- **Fallback**: `agenda.instalapro.com/` → Redirect to instalapro.com

### Route Configuration
```typescript
// pages/[technician]/index.vue - Main booking page
// pages/[technician]/[service].vue - Pre-selected service booking
// pages/index.vue - Redirect to main site
// pages/404.vue - Invalid technician handling
```

## Page Structure & Components

### Main Booking Flow (`/[technician]/index.vue`)
```vue
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Technician Header -->
    <TechnicianHeader :technician="technician" />
    
    <!-- Progress Indicator -->
    <BookingProgressBar :current-step="currentStep" />
    
    <!-- Step Components -->
    <BookingServiceSelection v-if="currentStep === 1" />
    <BookingTimeSelection v-if="currentStep === 2" />
    <BookingClientDetails v-if="currentStep === 3" />
    <BookingConfirmation v-if="currentStep === 4" />
    
    <!-- Sticky Footer -->
    <BookingFooter />
  </div>
</template>
```

### Core Components

#### TechnicianHeader.vue
```typescript
interface TechnicianHeaderProps {
  technician: {
    name: string
    businessName?: string
    photo?: string
    phone: string
    whatsappNumber: string
    serviceArea: string[]
    responseTime: string // "Responde en 15 min"
  }
}
```

#### BookingServiceSelection.vue  
```typescript
interface ServiceOption {
  id: string
  name: string
  description: string
  icon: string
  estimatedDuration: number
  priceRange: string
  popular?: boolean
}

// Example services
const services: ServiceOption[] = [
  {
    id: 'installation-split',
    name: 'Instalación Split',
    description: 'Instalación completa de aire acondicionado split',
    icon: 'mdi:air-conditioner',
    estimatedDuration: 180,
    priceRange: '$15,000 - $25,000',
    popular: true
  },
  {
    id: 'maintenance',
    name: 'Service y Mantenimiento', 
    description: 'Limpieza, carga de gas y revisión general',
    icon: 'mdi:wrench',
    estimatedDuration: 90,
    priceRange: '$3,000 - $5,000'
  }
]
```

#### BookingTimeSelection.vue
```typescript
interface TimeSlot {
  date: string // YYYY-MM-DD
  time: string // HH:mm
  available: boolean
  duration: number // minutes
  endTime: string // calculated end time
}

interface AvailabilityView {
  currentWeek: Date[]
  timeSlots: TimeSlot[]
  selectedDate: string | null
  selectedTime: string | null
}
```

#### BookingClientDetails.vue
```typescript
interface BookingFormData {
  clientName: string
  clientPhone: string
  clientEmail?: string
  address: string
  notes?: string
  urgency: 'normal' | 'urgent' | 'emergency'
  preferredContact: 'phone' | 'whatsapp'
}
```

## Booking Logic & State Management

### Store Architecture (`stores/booking.ts`)
```typescript
interface BookingStore {
  // Current booking session
  currentBooking: BookingSession | null
  
  // Technician data
  technician: Technician | null
  availability: WeeklyAvailability | null
  
  // Booking methods
  loadTechnician(slug: string): Promise<void>
  loadAvailability(technicianId: string): Promise<void>
  selectService(serviceId: string): void
  selectTimeSlot(date: string, time: string): void
  submitBooking(clientDetails: BookingFormData): Promise<BookingRequest>
  
  // Availability helpers
  getAvailableSlots(date: string): TimeSlot[]
  isSlotAvailable(date: string, time: string): boolean
  getNextAvailableSlot(): TimeSlot | null
}

interface BookingSession {
  id: string
  technicianId: string
  selectedService: ServiceOption
  selectedDate: string
  selectedTime: string
  duration: number
  estimatedPrice: number
  clientDetails?: BookingFormData
  status: 'in_progress' | 'submitted' | 'confirmed'
}
```

### Availability Calculation
```typescript
// Real-time availability checking
function calculateAvailability(
  technician: Technician,
  existingBookings: Job[],
  dateRange: DateRange
): TimeSlot[] {
  // 1. Get technician's weekly schedule
  // 2. Generate time slots for date range
  // 3. Remove slots with existing bookings
  // 4. Remove past time slots
  // 5. Apply buffer time between appointments
  // 6. Return available slots
}
```

## Mobile-First Design System

### Responsive Breakpoints
```css
/* Mobile First - Default styles for mobile */
.booking-container { @apply px-4 py-2; }

/* Tablet - 768px and up */
@screen md { 
  .booking-container { @apply px-6 py-4; }
}

/* Desktop - 1024px and up (minimal usage) */
@screen lg {
  .booking-container { @apply max-w-2xl mx-auto; }
}
```

### Touch-Friendly Interface
- **Button Size**: Minimum 44px height for touch targets
- **Spacing**: Generous padding between interactive elements  
- **Typography**: Minimum 16px font size to prevent zoom
- **Form Fields**: Large, clearly labeled input fields
- **Loading States**: Clear feedback for all user actions

### Component Examples
```vue
<!-- Service Selection Cards -->
<div class="grid gap-4 p-4">
  <div class="bg-white rounded-lg border-2 border-gray-200 p-4 active:border-blue-500">
    <div class="flex items-center space-x-3">
      <Icon name="mdi:air-conditioner" class="w-8 h-8 text-blue-600" />
      <div class="flex-1">
        <h3 class="font-semibold text-lg">Instalación Split</h3>
        <p class="text-gray-600 text-sm">Instalación completa</p>
        <p class="text-blue-600 font-medium">$15,000 - $25,000</p>
      </div>
    </div>
  </div>
</div>

<!-- Time Slot Selection -->
<div class="grid grid-cols-2 gap-3 p-4">
  <button class="bg-white border-2 border-gray-200 rounded-lg py-3 px-4 text-center hover:border-blue-500">
    <div class="font-semibold">09:00</div>
    <div class="text-sm text-gray-600">Disponible</div>
  </button>
</div>
```

## Integration with Back Office

### Real-Time Data Flow
```typescript
// booking → back-office notification flow
interface BookingNotification {
  type: 'new_booking' | 'booking_updated' | 'booking_cancelled'
  bookingId: string
  technicianId: string
  clientName: string
  serviceType: string
  scheduledDate: Date
  urgency: string
  timestamp: Date
}
```

### Data Synchronization
- **Technician Profile**: Sync individual technician's profile from back-office
- **Services**: Pull that specific technician's service catalog and pricing
- **Availability**: Get real-time availability for that technician only
- **Booking Requests**: Submit booking requests to that technician's back-office

### LocalStorage Integration (MVP)
```typescript
// Shared localStorage keys with back-office
const STORAGE_KEYS = {
  TECHNICIAN_PROFILE: 'instalapro_technician_profile',
  AVAILABILITY: 'instalapro_technician_availability', 
  PENDING_BOOKINGS: 'instalapro_pending_bookings',
  CONFIRMED_JOBS: 'instalapro_confirmed_jobs'
}
```

## WhatsApp Integration

### Automatic Notifications
```typescript
interface WhatsAppMessage {
  to: string // Client phone number
  type: 'booking_confirmation' | 'appointment_reminder' | 'technician_contact'
  template: string
  variables: Record<string, string>
}

// Booking confirmation message
const bookingConfirmation = {
  to: booking.clientPhone,
  template: 'booking_confirmed',
  variables: {
    clientName: booking.clientName,
    technicianName: technician.name,
    serviceType: booking.selectedService.name,
    appointmentDate: formatDate(booking.selectedDate),
    appointmentTime: booking.selectedTime,
    estimatedPrice: booking.estimatedPrice.toString()
  }
}
```

### Message Templates (Spanish)
```typescript
const messageTemplates = {
  booking_confirmed: `
¡Hola {{clientName}}! 

Tu cita ha sido confirmada ✅

🔧 Servicio: {{serviceType}}
👨‍🔧 Técnico: {{technicianName}}  
📅 Fecha: {{appointmentDate}}
⏰ Hora: {{appointmentTime}}
💰 Precio estimado: {{estimatedPrice}}

El técnico se comunicará contigo 30 min antes.

¿Dudas? Responde este mensaje.
  `,
  
  appointment_reminder: `
¡Hola {{clientName}}! 

Recordatorio: Tu cita es MAÑANA

🔧 {{serviceType}}
⏰ {{appointmentTime}}
📍 {{address}}

El técnico {{technicianName}} llegará puntual.
  `
}
```

## Error Handling & Edge Cases

### Common Scenarios
- **Invalid Technician URL**: Redirect to main site with message
- **No Availability**: Show "Próxima disponibilidad" with calendar
- **Booking Conflicts**: Real-time conflict detection and alternative suggestions
- **Form Validation**: Inline validation with clear error messages
- **Network Issues**: Offline detection with retry mechanisms

### Graceful Degradation
```vue
<!-- No JavaScript fallback -->
<noscript>
  <div class="p-4 bg-yellow-100 text-center">
    <p>Para una mejor experiencia, contacta directamente:</p>
    <a :href="`tel:${technician.phone}`" class="text-blue-600 font-semibold">
      {{ technician.phone }}
    </a>
  </div>
</noscript>

<!-- Slow connection handling -->
<div v-if="loading" class="text-center p-8">
  <div class="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
  <p class="mt-2 text-gray-600">Cargando disponibilidad...</p>
</div>
```

## Performance Optimization

### Loading Strategy
- **Critical CSS**: Inline critical styles for above-fold content
- **Progressive Loading**: Show service selection while availability loads
- **Image Optimization**: Optimized technician photos, lazy loading
- **Prefetching**: Prefetch likely next steps in booking flow

### Caching Strategy
```typescript
// Cache technician data for repeat visits
const cacheTechnician = (slug: string, data: Technician) => {
  sessionStorage.setItem(`technician_${slug}`, JSON.stringify({
    data,
    timestamp: Date.now(),
    expiry: 30 * 60 * 1000 // 30 minutes
  }))
}
```

## Analytics & Conversion Tracking

### Key Metrics
- **Conversion Funnel**: Service Selection → Time Selection → Form → Confirmation
- **Drop-off Points**: Where users abandon the booking process
- **Popular Services**: Most requested services by technician
- **Peak Hours**: Most popular booking times
- **Mobile Usage**: Device and browser analytics

### Event Tracking
```typescript
// GTM/GA4 events
const trackBookingStep = (step: number, technician: string, service?: string) => {
  gtag('event', 'booking_step', {
    step_number: step,
    technician_id: technician,
    service_type: service
  })
}
```

---

This booking interface prioritizes simplicity and mobile usability to maximize conversion rates while seamlessly integrating with the back-office system for technician workflow management.