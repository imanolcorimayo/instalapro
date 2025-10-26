# InstalaPro - Air Conditioner Technician Job Management MVP

## Overview
InstalaPro is an MVP back-office application for **self-employed** Air Conditioner Technicians in Argentina/LATAM. **Primary focus: technician account setup, service configuration, and complete business management**. The system provides essential tools for managing appointments, clients, quotes, and basic cash flow.

**Target Users**: Self-employed technicians who sign up via our marketing site, set up their services, and get their individual booking pages.

## Business Model Clarification
**IMPORTANT**: We market TO technicians, NOT to clients seeking technicians.
- Technicians discover us through instalapro.com (marketing site)
- Technicians sign up and configure their business in this back-office
- Upon setup, each technician gets their individual booking page: `agenda.instalapro.com/{technician}`
- Technicians share their booking link directly with their own clients
- We NEVER list technicians publicly or approach end clients

### Project URLs
- **instalapro.com** - Technician acquisition and marketing site
- **back.instalapro.com** - This back-office app (technician dashboard and setup)
- **agenda.instalapro.com/{technician}** - Individual technician booking pages

## Tech Stack
- Nuxt 4 (Vue 3), Tailwind CSS, Pinia
- Package manager: yarn (not npm)
- **Database**: Firebase/Firestore with user-scoped collections
- **Authentication**: Firebase Auth with Google OAuth
- TypeScript interfaces for all data structures (except in Vue pages and components).

## Code Architecture

#### Package JSON scripts and dependencies

```json
{
  "name": "instalapro-back-office",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "nuxt build",
    "dev": "nuxt dev",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "postinstall": "nuxt prepare"
  },
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

#### Architecture Patterns
- **Stores**: Pinia handle all Schema/Firestore operations and caching (schedule, jobs, clients, quotes, etc)
- **Caching**: Cache is only a (new Map) variable that on reload it refreshes
- **Data Flow**: Standard CRUD with Firestore, cached in local state
- **Components**: Modal-based entity management, naming convention `/entity/EntityDetails.vue`
- **Tooltips**: Interactive tooltip system using `TooltipStructure.vue` for space-efficient UI controls
- **Modals**: Interactive tooltip system using `ModalStructure.vue` for space-efficient UI controls
- **Layout**: Sidebar navigation (`default.vue`) with module-based menu
- **Design**: Tailwind CSS, icons via `~icons/pack-name/icon-name`, toast notifications
- **Utils**: Common functions in `@/utils/index.ts`, dates with $dayjs
- **Language**: All code and comments in English, UI text in Spanish
- **Date Handling**: NEVER use Date objects, always use dayjs for all date operations

#### Store Architecture & Database Strategy

**Firestore Implementation**:
- Stores handle all Firestore operations and caching
- Schema classes handle validation and basic CRUD operations
- Real-time listeners for live data updates across devices
- User-scoped data isolation through `userUid` field

**Data Architecture**:
```typescript
// Firestore Collections (Flat Structure with userUid field)
/clients/{docId} -> { userUid, name, phone, address, ... }
/jobs/{docId} -> { userUid, clientId, serviceType, scheduledDate, ... }
/quotes/{docId} -> { userUid, clientId, items, total, ... }
/payments/{docId} -> { userUid, jobId, amount, paymentDate, ... }
```

**Store Method Pattern**:
```typescript
// Standard store methods for Firestore operations
loadData()           // Fetch user's documents from Firestore
createItem(data)     // Create new document with userUid
updateItem(id, data) // Update existing document (user verification)
deleteItem(id)       // Delete document (user verification)
subscribeToChanges() // Real-time Firestore listeners
```

**Implementation Guidelines**:
- **User Isolation**: All queries automatically filter by authenticated user's UID
- **Schema Validation**: All data validated through ODM schemas before Firestore operations
- **Business Logic**: Complex logic handled in stores, not schemas
- **Real-time Updates**: Firestore listeners for cross-device synchronization
- **Error Handling**: Consistent error handling with user-friendly messages

#### Component Creation Guidelines

**⚠️ CRITICAL: UNUSED COMPONENT PREVENTION**
Before creating ANY new component, you MUST:
1. **Verify immediate usage**: Component must be imported and used in at least one file
2. **Document usage location**: Add comment in component showing where it's used
3. **Follow proven patterns**: Use `ModalStructure.vue` + inline content instead of dedicated modal components
4. **Check for existing solutions**: Extend existing components before creating new ones

**Subfolder Component Naming Rule:**
- Components in subfolders must be prefixed with the folder name when used
- Format: `[FolderName][ComponentName].vue`
- Usage: Follow existing working patterns (Settings components, ClientModal)
- Exception: If component name already starts with folder name, use full name without duplication

**PROVEN SUCCESSFUL PATTERNS (Use These):**
- **Base Components**: `ModalStructure.vue`, `TooltipStructure.vue`
- **Reusable Components**: `ClientModal.vue` (used in multiple pages)
- **Specialized Components**: Settings folder components (all actively used)
- **Modal Pattern**: Use `ModalStructure.vue` with slot content, NOT dedicated modal components

**ANTI-PATTERNS (Avoid These):**
- Creating dedicated modal components for single-use cases
- Building complex nested component hierarchies
- Creating "regular" and "simplified" versions of the same component
- Components that are never imported or used anywhere

**CURRENT CLEAN COMPONENT STRUCTURE (2 components, all used):**
```
/components/
├── ModalStructure.vue                # ✅ Base modal
├── TooltipStructure.vue              # ✅ Base tooltip
```

#### UI Components Structure

**ModalStructure.vue** - Base modal component for all modal dialogs:
- **MANDATORY**: All modal dialogs MUST use ModalStructure.vue as the base component
- Consistent modal behavior, styling, and functionality across the application
- Usage: `<ModalStructure ref="modal" title="Modal Title" @on-close="closeModal">`
- Methods: `showModal()`, `closeModal()`

**TooltipStructure.vue** - Base tooltip component for interactive controls:
- Reusable dropdown-style tooltip positioned relative to trigger button

## Core System Modules

### 1. Settings & Profile Management
- **Purpose**: Unified technician configuration, profile management, and account setup
- **Features**: Profile editing (name, phone, email, WhatsApp), account closure, initial technician onboarding
- **Data**: Technician personal information, account status, configuration settings
- **Location**: `/settings` page with modal-based profile editing
- **Store**: `technician.ts` | **Collection**: `/users` (future implementation)

### 2. Job Schedule Management
- **Purpose**: Daily business operations and appointment management
- **Features**: Daily/weekly calendar view, job status tracking, booking confirmations from client pages
- **Data**: Job appointments, client assignments, service types, status updates
- **Store**: `schedule.ts` | **Collections**: `/jobs`, `/timeSlots` (userUid-scoped)

### 3. Client Management
- **Purpose**: Comprehensive client database and relationship management
- **Features**: Client profiles with contact info, service history, WhatsApp integration
- **Data**: Client information, address, phone (with WhatsApp button), service history
- **Integration**: Direct WhatsApp messaging, service history tracking
- **Store**: `clients.ts` | **Collection**: `/clients` (userUid-scoped)

### 4. Quote Management
- **Purpose**: Professional quote generation and client communication
- **Features**: Quick quote templates, service pricing, PDF export, WhatsApp sending
- **Templates**: Standard installation templates (e.g., "3500 BTU Split Installation = $xx")
- **Export**: PDF generation, WhatsApp sharing
- **Store**: `quotes.ts` | **Collection**: `/quotes` (userUid-scoped)

### 5. Basic Cash Flow
- **Purpose**: Simple financial tracking for self-employed technicians
- **Features**: Simple revenue tracking, payment status monitoring
- **Scope**: Basic numbers for self-employed technicians (no complex accounting)
- **Data**: Monthly billing summary, pending job status
- **Reports**: Clear, understandable financial overview
- **Store**: `cashFlow.ts` | **Collection**: `/payments` (userUid-scoped)

## Page Structure

All pages use modal-based entity management:

- **Dashboard**: `/index.vue` - Main overview with key metrics and recent activities
- **Settings**: `/settings/index.vue` - Unified technician configuration including profile editing, account management, and initial setup functionality
- **Schedule**: `/schedule/index.vue` - Daily/weekly job calendar and appointment management
- **Clients**: `/clients/index.vue` - Client directory with profiles and history
- **Quotes**: `/quotes/index.vue` - Quote templates and generation
- **Cash Flow**: `/cash-flow/index.vue` - Payment tracking and monthly reports

## TypeScript Interfaces & Data Structures

**Interface Organization**:
- Each store has dedicated TypeScript interfaces
- Interfaces designed for Firestore compatibility
- Consistent naming: `[Entity]`, `[Entity]CreateInput`, `[Entity]UpdateInput`
- Common fields: `id`, `userUid`, `createdAt`, `updatedAt` (Firestore timestamps)
- User isolation: All entities automatically include `userUid` field

### Technicians Store Interfaces
```typescript
// Core Technicians entity for account setup
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
```

## Development Guidelines

### Language Rules
- **Code & Comments**: Always in English
- **UI Text**: Always in Spanish for user-facing content
- **Variable Names**: English, descriptive, camelCase
- **Function Names**: English, verb-based, descriptive

### Data Persistence Strategy

**Schema & Validation Layer**:
- **ODM Schemas**: TypeScript schema classes handle validation and basic CRUD
- **Business Logic**: Complex operations handled in Pinia stores
- **Data Validation**: All documents validated against schema before Firestore operations
- **Reference Validation**: Cross-document references automatically validated

**Store Implementation**:
- **Caching**: In-memory Map cache for performance optimization
- **Error Handling**: Consistent error handling with user-friendly messages
- **Loading States**: Reactive loading states for UI feedback
- **Type Safety**: Full TypeScript support with runtime validation

### UI/UX Principles

**TARGET USERS**: Air conditioning technicians NOT familiar with complex business systems  
**PRIMARY USE**: Client administration and job management  
**PRIORITY**: Maximum simplicity and minimal learning curve

#### Core UX Philosophy
- **SIMPLICITY FIRST**: Every interface element must be immediately understandable
- **MINIMAL LEARNING CURVE**: Users should understand the app within 5 minutes
- **ONE-CLICK ACTIONS**: Reduce multi-step processes to single interactions when possible
- **VISUAL CLARITY**: Use clear visual hierarchy and obvious interactive elements
- **FORGIVENESS**: Provide easy undo/edit options for user mistakes

#### Design Requirements
- **Mobile-first responsive design** - Most users will access on phones
- **Large, clear buttons** - Easy to tap with fingers
- **Clear Spanish labels** with simple, everyday language (no technical jargon)
- **Intuitive iconography** - Use universally recognized icons only
- **Immediate feedback** - Show loading states, success/error messages instantly
- **Consistent patterns** - Same actions work the same way throughout the app
- **WhatsApp integration** - Leverage familiar communication methods

#### Simplification Guidelines
- **Minimize form fields** - Only ask for essential information
- **Use dropdowns/selectors** instead of free text input when possible
- **Provide templates and presets** for common tasks
- **Progressive disclosure** - Show basic options first, advanced options on request
- **Clear navigation** - Always show where users are and how to go back
- **Single-purpose screens** - Each screen should have one clear objective

#### Examples of Simple UX
```vue
<!-- ✅ Simple: One clear action per screen -->
<div class="p-6 text-center">
  <h1 class="text-2xl font-bold mb-4">Nuevo Trabajo</h1>
  <button class="w-full bg-blue-500 text-white p-4 rounded-lg text-lg">
    Agendar Cita
  </button>
</div>

<!-- ❌ Complex: Multiple unclear options -->
<div class="grid grid-cols-3 gap-2">
  <button class="text-xs">Opt 1</button>
  <button class="text-xs">Opt 2</button>
  <button class="text-xs">Opt 3</button>
</div>
```

### CSS & Styling Guidelines
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

### Library & Dependencies Guidelines

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

---

This documentation serves as the foundation for developing InstalaPro MVP, ensuring consistency with established patterns while meeting the specific needs of air conditioner technicians in the Argentina/LATAM market.