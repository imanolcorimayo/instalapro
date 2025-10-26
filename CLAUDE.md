# InstalaPro - Global Project Instructions

## Project Overview
InstalaPro is a comprehensive platform for Air Conditioner Technicians in Argentina/LATAM, consisting of three interconnected domains serving different users and purposes.

### Architecture Overview
```
/instalapro (root)
├── CLAUDE.md (this file - global instructions)
├── /home (instalapro.com - public marketing site)
├── /back-office (back.instalapro.com - technician dashboard)
└── /booking (agenda.instalapro.com - client booking interface)
```

### Domain URLs & Purposes
- **instalapro.com** (`/home`) - Technician acquisition site, showcase platform benefits
- **back.instalapro.com** (`/back-office`) - Technician dashboard and business management
- **agenda.instalapro.com/{technician}** (`/booking`) - Individual technician booking pages for their clients

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
- **Authentication**: Firebase Auth with Google OAuth
- **Database**: Firebase/Firestore with user-scoped collections
- **Date Handling**: NEVER use Date objects, always use dayjs for all date operations

### Shared Dependencies (All Domains)
```json
{
  "dependencies": {
    "@nuxtjs/tailwindcss": "^6.12.3",
    "@pinia/nuxt": "^0.11.2",
    "pinia": "^3.0.3",
    "@vueuse/nuxt": "13.2.0",
    "firebase": "^12.1.0",
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

## Cross-Domain Data Structures

### Core Business Entities
These TypeScript interfaces are shared across all domains:

#### Technician Profile
```typescript
interface Technicians {
  id: string
  name: string
  phone: string
  whatsappNumber: string
  email: string
  businessName?: string
  serviceArea: string[] // Cities/zones served
  services: TechniciansService[]
  availability: WeeklyAvailability
  bookingUrl: string // agenda.instalapro.com/{technician}
  profileSetupComplete: boolean
  createdAt: Date
  updatedAt: Date
}

interface TechniciansService {
  id: string
  name: string
  description: string
  basePrice: number
  estimatedDuration: number // minutes
  category: 'installation' | 'maintenance' | 'repair' | 'consultation'
  isActive: boolean
}

// Input types for store operations
interface TechniciansCreateInput {
  name: string
  phone: string
  email: string
  businessName?: string
  serviceArea: string[]
}

interface TechniciansUpdateInput {
  name?: string
  phone?: string
  whatsappNumber?: string
  email?: string
  businessName?: string
  serviceArea?: string[]
  services?: TechniciansService[]
  availability?: WeeklyAvailability
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
- **Security Rules**: User-scoped access control with `userUid` field
- **User Isolation**: All documents include `userUid` field for multi-tenant data separation

#### Firestore Architecture
```typescript
// Firestore Collections (Flat Structure with userUid field)
/clients/{docId} -> { userUid, name, phone, address, ... }
/jobs/{docId} -> { userUid, clientId, serviceType, scheduledDate, ... }
/quotes/{docId} -> { userUid, clientId, items, total, ... }
/payments/{docId} -> { userUid, jobId, amount, paymentDate, ... }
```

#### Store Method Pattern
```typescript
// Standard store methods for Firestore operations
loadData()           // Fetch user's documents from Firestore
createItem(data)     // Create new document with userUid
updateItem(id, data) // Update existing document (user verification)
deleteItem(id)       // Delete document (user verification)
subscribeToChanges() // Real-time Firestore listeners
```

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

### `/home` - Technician Acquisition
- **Primary Goal**: Attract technicians to join the platform
- **Key Features**: Platform benefits showcase, technician onboarding, feature demonstrations
- **User Journey**: Technician Discovery → Platform Benefits → Sign Up → Back Office Setup
- **Technology**: Nuxt SSG for optimal SEO performance targeting technicians

### `/back-office` - Technician Management
- **Primary Goal**: Complete business management for technicians
- **Key Features**: Account setup, services configuration, availability management, client tracking, quotes, cash flow
- **User Journey**: New technician onboarding → Service setup → Availability configuration → Daily operations
- **Technology**: Nuxt SPA with complex state management

### `/booking` - Individual Technician Pages
- **Primary Goal**: Provide each technician with their own booking interface
- **Key Features**: Individual technician branding, service selection, availability calendar, booking confirmation
- **User Journey**: Client receives technician's booking link → Service Selection → Time Slot → Confirmation
- **Technology**: Dynamic routing for individual technician pages

## Integration Requirements

### Data Synchronization
- Real-time booking notifications from individual `/booking/{technician}` pages to `/back-office`
- Technician profile and service data shared between back-office and booking domains
- Service catalog and availability synchronized from back-office to individual booking pages

### Communication Flow
- WhatsApp integration from back-office for client communication
- Email notifications for booking confirmations
- SMS reminders for upcoming appointments
- Technician shares their individual booking link directly with clients

### Analytics & Reporting
- Technician acquisition tracking (home → back-office signup)
- Booking conversion rates per technician
- Individual technician performance metrics

---

## Domain-Specific Instructions
For detailed implementation instructions, refer to each domain's CLAUDE.md:
- `/home/CLAUDE.md` - Marketing site implementation
- `/back-office/CLAUDE.md` - Technician dashboard (already comprehensive)
- `/booking/CLAUDE.md` - Client booking interface

## UI/UX Philosophy

**TARGET USERS**: Air conditioning technicians NOT familiar with complex business systems  
**PRIMARY USE**: Client administration and job management  
**PRIORITY**: Maximum simplicity and minimal learning curve

### Core UX Philosophy
- **SIMPLICITY FIRST**: Every interface element must be immediately understandable
- **MINIMAL LEARNING CURVE**: Users should understand the app within 5 minutes
- **ONE-CLICK ACTIONS**: Reduce multi-step processes to single interactions when possible
- **VISUAL CLARITY**: Use clear visual hierarchy and obvious interactive elements
- **FORGIVENESS**: Provide easy undo/edit options for user mistakes

### Design Requirements
- **Mobile-first responsive design** - Most users will access on phones
- **Large, clear buttons** - Easy to tap with fingers (minimum 44px height)
- **Clear Spanish labels** with simple, everyday language (no technical jargon)
- **Intuitive iconography** - Use universally recognized icons only
- **Immediate feedback** - Show loading states, success/error messages instantly
- **Consistent patterns** - Same actions work the same way throughout the app
- **WhatsApp integration** - Leverage familiar communication methods

### Simplification Guidelines
- **Minimize form fields** - Only ask for essential information
- **Use dropdowns/selectors** instead of free text input when possible
- **Provide templates and presets** for common tasks
- **Progressive disclosure** - Show basic options first, advanced options on request
- **Clear navigation** - Always show where users are and how to go back
- **Single-purpose screens** - Each screen should have one clear objective

## Component Creation Guidelines

**⚠️ CRITICAL: UNUSED COMPONENT PREVENTION**
Before creating ANY new component, you MUST:
1. **Verify immediate usage**: Component must be imported and used in at least one file
2. **Document usage location**: Add comment in component showing where it's used
3. **Follow proven patterns**: Use `ModalStructure.vue` + inline content instead of dedicated modal components
4. **Check for existing solutions**: Extend existing components before creating new ones

**Subfolder Component Naming Rule:**
- Components in subfolders must be prefixed with the folder name when used
- Format: `[FolderName][ComponentName].vue`
- Usage: Follow existing working patterns
- Exception: If component name already starts with folder name, use full name without duplication

**PROVEN SUCCESSFUL PATTERNS (Use These):**
- **Base Components**: `ModalStructure.vue`, `TooltipStructure.vue`
- **Reusable Components**: Modal-based entity management
- **Modal Pattern**: Use `ModalStructure.vue` with slot content, NOT dedicated modal components

**ANTI-PATTERNS (Avoid These):**
- Creating dedicated modal components for single-use cases
- Building complex nested component hierarchies
- Creating "regular" and "simplified" versions of the same component
- Components that are never imported or used anywhere

## CSS & Styling Guidelines
- **MANDATORY**: Use Tailwind CSS classes exclusively for all styling
- **NO custom CSS**: Avoid inline styles, custom CSS files, or `<style>` blocks
- **Component Styling**: All styling through Tailwind utility classes
- **Responsive Design**: Use Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`)
- **Consistent Spacing**: Use Tailwind's spacing scale (`p-4`, `m-2`, `gap-3`, etc.)
- **Color System**: Use Tailwind's color palette and semantic color classes
- **Typography**: Use Tailwind's typography utilities (`text-lg`, `font-semibold`, etc.)
- **Layout**: Use Tailwind's flexbox and grid utilities for layouts
- **State Variants**: Use Tailwind's state variants (`hover:`, `focus:`, `active:`, etc.)
- **Dark Mode**: Prepare for dark mode using Tailwind's `dark:` variant

## Library & Dependencies Guidelines

**ALLOWED LIBRARIES ONLY** - Do not add any libraries beyond this approved list:

- **Iconify** (`@iconify/json`, `@iconify/utils`, `unplugin-icons`)
  - **MANDATORY** for all icons: Use `~icons/pack-name/icon-name` syntax
  - Never use other icon libraries (Font Awesome, Heroicons, etc.)
  - Never use emojis as icons, always use Iconify
- **Chart.js** - For data visualization and charts only
- **Tailwind CSS** (`tailwindcss`, `@tailwindcss/vite`) - For all styling
- **Pinia** (`pinia`, `@pinia/nuxt`) - For state management
- **VueUse** (`@vueuse/nuxt`) - For Vue composition utilities
- **vue3-toastify** - For toast notifications only

**FORBIDDEN**:
- **NO additional UI libraries** (Vuetify, Quasar, Element Plus, etc.)
- **NO additional icon libraries** (Font Awesome, Heroicons, Lucide, etc.)
- **NO CSS frameworks** beyond Tailwind (Bootstrap, Bulma, etc.)
- **NO additional chart libraries** (D3.js, ApexCharts, etc.)
- **NO utility libraries** (Lodash, Ramda, etc.) - use native JS or VueUse
- **NO date libraries** beyond dayjs (Moment.js, date-fns, etc.)

**Before Adding Any Library**:
1. Check if functionality exists in approved libraries
2. Check if it can be implemented with native JavaScript/Vue
3. Only request new libraries if absolutely critical for core functionality

## Firestore Security Rules

**User Data Isolation**:
```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access documents with their userUid
    match /clients/{document} {
      allow read, write: if request.auth != null && resource.data.userUid == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userUid == request.auth.uid;
    }
    
    match /jobs/{document} {
      allow read, write: if request.auth != null && resource.data.userUid == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userUid == request.auth.uid;
    }
    
    match /quotes/{document} {
      allow read, write: if request.auth != null && resource.data.userUid == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userUid == request.auth.uid;
    }
    
    match /payments/{document} {
      allow read, write: if request.auth != null && resource.data.userUid == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userUid == request.auth.uid;
    }
  }
}
```

This global file ensures consistency while allowing domain-specific customization and optimization.