# InstalarPro - Global Project Instructions

## Project Overview
InstalarPro is a comprehensive platform for Air Conditioner Technicians in Argentina/LATAM, consisting of three interconnected domains serving different users and purposes.

### Architecture Overview
```
/instalapro (root)
├── CLAUDE.md (this file - global instructions)
├── /home (instalapro.com - public marketing site)
├── /back-office (back.instalapro.com - technician dashboard)
└── /booking (agenda.instalapro.com - client booking interface)
```

### Domain URLs & Purposes
- **instalapro.com** (`/home`) - Public marketing site, lead capture, contact info
- **back.instalapro.com** (`/back-office`) - Complex technician dashboard and management
- **agenda.instalapro.com/{technician}** (`/booking`) - Simple client booking interface

## Shared Tech Stack & Standards

### Core Technologies
- **Framework**: Nuxt 4 (Vue 3) for all domains
- **Package Manager**: yarn (NEVER npm)
- **Styling**: Tailwind CSS exclusively (NO custom CSS)
- **State Management**: Pinia stores
- **Icons**: Iconify (`~icons/pack-name/icon-name`)
- **Dates**: dayjs-nuxt
- **Notifications**: vue3-toastify
- **TypeScript**: Strict typing for all data structures

### Shared Dependencies (All Domains)
```json
{
  "dependencies": {
    "@nuxtjs/tailwindcss": "^6.12.3",
    "@vueuse/nuxt": "13.2.0",
    "nuxt": "^4.0.1",
    "tailwindcss": "^3.4.16",
    "unplugin-icons": "^0.21.0",
    "vue": "^3.5.17",
    "vue-router": "^4.5.1",
    "vue3-toastify": "^0.2.8"
  },
  "devDependencies": {
    "@iconify/json": "^2.2.339",
    "@iconify/utils": "^2.3.0",
    "dayjs-nuxt": "^2.1.11"
  }
}
```

**Note**: Pinia will be added back when Nuxt 4 compatible versions are available.

## Cross-Domain Data Structures

### Core Business Entities
These TypeScript interfaces are shared across all domains:

#### Technician Profile
```typescript
interface Technician {
  id: string
  name: string
  phone: string
  whatsappNumber: string
  email: string
  serviceArea: string[] // Cities/zones served
  services: TechnicianService[]
  availability: WeeklyAvailability
  bookingUrl: string // agenda.instalapro.com/{technician}
  createdAt: Date
  updatedAt: Date
}

interface TechnicianService {
  id: string
  name: string
  description: string
  basePrice: number
  estimatedDuration: number // minutes
  category: 'installation' | 'maintenance' | 'repair' | 'consultation'
}

interface WeeklyAvailability {
  monday: DaySchedule
  tuesday: DaySchedule
  wednesday: DaySchedule
  thursday: DaySchedule
  friday: DaySchedule
  saturday: DaySchedule
  sunday: DaySchedule
}

interface DaySchedule {
  enabled: boolean
  startTime: string // HH:mm format
  endTime: string // HH:mm format
  breakStart?: string
  breakEnd?: string
}
```

#### Job & Booking Entities
```typescript
interface Job {
  id: string
  technicianId: string
  clientId: string
  clientName: string
  clientPhone: string
  clientEmail?: string
  serviceType: string
  description: string
  address: string
  scheduledDate: Date
  estimatedDuration: number
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  price: number
  paid: boolean
  notes: string
  source: 'back_office' | 'client_booking' | 'phone'
  createdAt: Date
  updatedAt: Date
}

interface BookingRequest {
  id: string
  technicianId: string
  clientName: string
  clientPhone: string
  clientEmail?: string
  serviceType: string
  preferredDate: Date
  address: string
  notes?: string
  status: 'pending' | 'confirmed' | 'rejected'
  createdAt: Date
}
```

#### Client Entity
```typescript
interface Client {
  id: string
  name: string
  phone: string
  email?: string
  address: string
  serviceHistory: JobHistory[]
  totalJobs: number
  totalSpent: number
  preferredServiceTypes: string[]
  notes: string
  source: 'back_office' | 'booking' | 'referral'
  createdAt: Date
  updatedAt: Date
}

interface JobHistory {
  jobId: string
  date: Date
  serviceType: string
  description: string
  price: number
  status: string
  technicianId: string
}
```

## Data Flow Between Domains

### Booking → Back Office
1. Client creates `BookingRequest` via `/booking`
2. Request stored in shared data layer (localStorage → Firestore)
3. Back-office receives real-time notification
4. Technician confirms/rejects → creates `Job` or updates `BookingRequest`

### Back Office → Client Communication
1. Job status updates trigger WhatsApp messages
2. Quote PDFs sent via WhatsApp
3. Payment reminders and confirmations

### Home → Lead Capture
1. Contact forms create `Lead` entities
2. Phone inquiries logged for follow-up
3. SEO drives traffic to technician booking pages

## Database Strategy

### MVP Phase (LocalStorage)
- **Key Naming**: `instalapro_[domain]_[entity]_[data]`
- **Cross-Domain Access**: Shared localStorage keys for common entities
- **Sync Strategy**: Manual export/import between domains

### Production Phase (Firestore)
- **Collections**: `technicians`, `jobs`, `clients`, `bookings`, `leads`
- **Real-time Sync**: All domains subscribe to shared collections
- **Security Rules**: Domain-based access control

## Shared Component Guidelines

### Naming Conventions
- **Global Components**: PascalCase without domain prefix
- **Domain Components**: `[Domain][Component]` format
- **Shared Utils**: Export from `/utils/shared.ts` in each domain

### Cross-Domain Components
Store shared components that might be used across domains:

```typescript
// Shared in each domain's components/shared/
- ContactForm.vue (lead capture)
- WhatsAppButton.vue (client communication)
- ServiceSelector.vue (service type picker)
- TimeSlotPicker.vue (appointment scheduling)
```

## Development Workflow

### Git Strategy
- **Main Branch**: `main` (production ready)
- **Domain Branches**: `home/feature-name`, `back-office/feature-name`, `booking/feature-name`
- **Feature Integration**: Merge to main when domain feature complete

### Domain-Specific Development
1. Each domain has independent package.json and dependencies
2. Shared interfaces defined in this global CLAUDE.md
3. Cross-domain testing via shared data scenarios

### Code Standards
- **Language**: Code & comments in English, UI text in Spanish
- **TypeScript**: Strict typing required for all entities
- **Styling**: Tailwind CSS only, no custom styles
- **Icons**: Iconify only (`~icons/` syntax)
- **Mobile-First**: All domains must be mobile responsive

## Domain-Specific Focus Areas

### `/home` - Marketing & SEO
- **Primary Goal**: Drive traffic and capture leads
- **Key Features**: Landing pages, contact forms, SEO optimization
- **User Journey**: Visitor → Lead → Phone Call → Booking
- **Technology**: Nuxt SSG for optimal SEO performance

### `/back-office` - Technician Management
- **Primary Goal**: Complete business management for technicians
- **Key Features**: Schedule, clients, quotes, cash flow, analytics
- **User Journey**: Technician daily workflow and administration
- **Technology**: Nuxt SPA with complex state management

### `/booking` - Client Self-Service
- **Primary Goal**: Simple appointment booking for clients
- **Key Features**: Availability calendar, service selection, booking confirmation
- **User Journey**: Client → Service Selection → Time Slot → Confirmation
- **Technology**: Nuxt SSG/SPA hybrid for speed and simplicity

## Integration Requirements

### Data Synchronization
- Real-time booking notifications from `/booking` to `/back-office`
- Client data shared between domains
- Service catalog synchronized across booking and back-office

### Communication Flow
- WhatsApp integration from back-office for client communication
- Email notifications for booking confirmations
- SMS reminders for upcoming appointments

### Analytics & Reporting
- Cross-domain user journey tracking
- Lead conversion rates (home → booking → job)
- Technician performance metrics

---

## Domain-Specific Instructions
For detailed implementation instructions, refer to each domain's CLAUDE.md:
- `/home/CLAUDE.md` - Marketing site implementation
- `/back-office/CLAUDE.md` - Technician dashboard (already comprehensive)
- `/booking/CLAUDE.md` - Client booking interface

This global file ensures consistency while allowing domain-specific customization and optimization.