# InstalarPro - Air Conditioner Technician Job Management MVP

## Overview
InstalarPro is an MVP back-office application for **self-employed** Air Conditioner Technicians in Argentina/LATAM. **Primary focus: client administration and job management**. The system provides essential tools for managing appointments, clients, quotes, and basic cash flow without the complexity of authentication or cloud storage.

**Target Users**: Self-employed technicians, no big teams, basic financial tracking only.

### Project URLs
- **instalapro.com** - Public landing page (SEO/marketing)
- **back.instalapro.com** - This back-office app (technician dashboard)
- **client.instalapro.com** - Simple client booking interface

## Tech Stack
- Nuxt 4 (Vue 3), Tailwind CSS, Pinia
- Package manager: yarn (not npm)
- **Database Strategy**: LocalStorage for MVP → Firebase/Firestore for production
- TypeScript interfaces for all data structures

## Code Architecture

#### Package JSON scripts and dependencies

```json
{
  "name": "instalapro",
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
    "@pinia/nuxt": "0.11.0",
    "@tailwindcss/vite": "^4.1.7",
    "@vueuse/nuxt": "13.2.0",
    "nuxt": "^4.0.1",
    "pinia": "^3.0.2",
    "tailwindcss": "^4.1.7",
    "unplugin-icons": "^22.1.0",
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
- **Stores**: Pinia stores for state management (schedule, clients, quotes, cashFlow)
- **Data Flow**: Standard CRUD with localStorage, cached in local state
- **Components**: Modal-based entity management, naming convention `/entity/EntityDetails.vue`
- **Tooltips**: Interactive tooltip system using `TooltipStructure.vue` for space-efficient UI controls
- **Layout**: Sidebar navigation (`default.vue`) with module-based menu
- **Design**: Tailwind CSS, icons via `~icons/pack-name/icon-name`, toast notifications
- **Utils**: Common functions in `@/utils/index.ts`, dates with $dayjs
- **Language**: All code and comments in English, UI text in Spanish

#### Store Architecture & Database Strategy

**MVP Phase (LocalStorage)**:
- Stores handle all data persistence logic internally
- LocalStorage operations abstracted within store methods
- Consistent CRUD interface across all stores
- Real-time reactive state management with Pinia

**Production Phase (Firebase/Firestore)**:
- Same store interface, different implementation
- Stores contain all Firestore logic (queries, mutations, subscriptions)
- Real-time listeners for live data updates
- Offline support with Firestore caching

**Store Method Pattern** (consistent across both phases):
```typescript
// Store methods that work for both LocalStorage and Firestore
loadData()        // Initial data fetch
addItem(item)     // Create new item
updateItem(id, updates)  // Update existing item
deleteItem(id)    // Delete item
subscribeToChanges()     // Real-time updates (Firestore only)
```

**Implementation Guidelines**:
- **Separation of Concerns**: Database logic stays in stores, components only call store methods
- **Future-Proof Interface**: Store methods designed to work with both LocalStorage and Firestore
- **TypeScript First**: All data structures defined with strict interfaces
- **Error Handling**: Consistent error handling across both database implementations

#### Component Naming Conventions

**Subfolder Component Naming Rule:**
- Components in subfolders must be prefixed with the folder name when used
- Format: `[FolderName][ComponentName].vue`
- Usage: `<Schedule[ComponentName]>` for components in `/Schedule/` folder
- Exception: If component name already starts with folder name, use full name without duplication

**Examples:**
```vue
<!-- ✅ Correct Usage -->
<ScheduleCalendarView />     <!-- from /Schedule/ScheduleCalendarView.vue -->
<ClientProfileModal />       <!-- from /Client/ClientProfileModal.vue -->
<QuoteTemplateForm />        <!-- from /Quote/QuoteTemplateForm.vue -->
<CashFlowSummary />          <!-- from /CashFlow/CashFlowSummary.vue -->

<!-- ❌ Incorrect Usage -->
<CalendarView />             <!-- Wrong - missing Schedule prefix -->
<ScheduleScheduleView />     <!-- Wrong - folder name duplicated -->
```

#### UI Components Structure

**ModalStructure.vue** - Base modal component for all modal dialogs:
- **MANDATORY**: All modal dialogs MUST use ModalStructure.vue as the base component
- Consistent modal behavior, styling, and functionality across the application
- Props: `title`, `modalClass`, `closeOnBackdropClick`, `clickPropagationFilter`, `modalNamespace`
- Slots: `header`, default slot (content), `footer`
- Features:
  - Teleport to body for proper z-index handling
  - ESC key to close functionality
  - Click outside to close (configurable)
  - Focus trapping and scroll prevention
  - Fade-in animation
  - Proper cleanup on unmount
- Usage: `<ModalStructure ref="modal" title="Modal Title" @on-close="closeModal">`
- Methods: `showModal()`, `closeModal()`

**TooltipStructure.vue** - Base tooltip component for interactive controls:
- Reusable dropdown-style tooltip positioned relative to trigger button
- Consistent styling and behavior across the application
- Used for space-efficient form controls (time selection, service types, pricing)
- Props: `title`, `tooltipClass`, `position` (bottom-left, bottom-right, top-left, top-right)
- Slots: `trigger`, `content`, `footer`
- Features: 
  - Smart positioning with viewport edge detection
  - Focus trapping, keyboard navigation (ESC to close)
  - Click-outside-to-close with backdrop
  - Modal namespace class `tooltip-namespace` for click propagation filtering
  - Automatic position adjustment when tooltip exceeds viewport boundaries

## Core System Modules

### 1. Job Schedule Management
- **Access**: All technicians
- **Features**: Daily/weekly calendar view, job status tracking, pending appointment confirmations
- **Data**: Job appointments, client assignments, service types, status updates
- **Store**: `schedule.ts` | **LocalStorage Keys**: `jobs`, `jobHistory`

### 2. Client Management
- **Features**: Client profiles with contact info, service history, WhatsApp integration
- **Data**: Client information, address, phone (with WhatsApp button), service history
- **Integration**: Direct WhatsApp messaging, service history tracking
- **Store**: `clients.ts` | **LocalStorage Keys**: `clients`, `clientHistory`

### 3. Quote Management
- **Features**: Quick quote templates, service pricing, PDF export, WhatsApp sending
- **Templates**: Standard installation templates (e.g., "3500 BTU Split Installation = $xx")
- **Export**: PDF generation, WhatsApp sharing
- **Store**: `quotes.ts` | **LocalStorage Keys**: `quotes`, `quoteTemplates`

### 4. Basic Cash Flow
- **Features**: Simple revenue tracking, payment status monitoring
- **Scope**: Basic numbers for self-employed technicians (no complex accounting)
- **Data**: Monthly billing summary, paid/pending job status
- **Reports**: Clear, understandable financial overview
- **Store**: `cashFlow.ts` | **LocalStorage Keys**: `payments`, `monthlyReports`

### 5. Client UI Interface
- **Features**: Public-facing interface for clients to view technician availability and pricing
- **Functionality**: Availability calendar, service selection, appointment booking
- **Integration**: Feeds into technician schedule system
- **Store**: `clientBooking.ts` | **LocalStorage Keys**: `availability`, `bookings`

## Page Structure

All pages use modal-based entity management:

- **Dashboard**: `/index.vue` - Main overview with key metrics and recent activities
- **Schedule**: `/schedule/index.vue` - Daily/weekly job calendar and appointment management
- **Clients**: `/clients/index.vue` - Client directory with profiles and history
- **Quotes**: `/quotes/index.vue` - Quote templates and generation
- **Cash Flow**: `/cash-flow/index.vue` - Payment tracking and monthly reports
- **Client Booking**: `/booking/index.vue` - Public interface for client appointment booking

## TypeScript Interfaces & Data Structures

**Interface Organization**:
- Each store has dedicated TypeScript interfaces
- Interfaces designed for both LocalStorage and Firestore compatibility
- Consistent naming: `[Entity]`, `[Entity]CreateInput`, `[Entity]UpdateInput`
- Common fields: `id`, `createdAt`, `updatedAt` (Firestore timestamps compatible)

### Jobs Store Interfaces
```typescript
// Core Job entity
interface Job {
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

// Input types for store operations
interface JobCreateInput {
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

interface JobUpdateInput {
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
```

### Clients Store Interfaces
```typescript
// Core Client entity
interface Client {
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

interface JobHistory {
  jobId: string
  date: Date
  serviceType: string
  description: string
  price: number
  status: string
}

// Input types for store operations
interface ClientCreateInput {
  name: string
  phone: string
  address: string
  email?: string
  notes?: string
}

interface ClientUpdateInput {
  name?: string
  phone?: string
  address?: string
  email?: string
  notes?: string
  preferredServiceTypes?: string[]
}
```

### Quotes Store Interfaces
```typescript
// Core Quote entity
interface Quote {
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

interface QuoteItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

// Input types for store operations
interface QuoteCreateInput {
  clientId?: string
  clientName: string
  serviceType: string
  description: string
  items: Omit<QuoteItem, 'id'>[]
  validUntil: Date
}

interface QuoteUpdateInput {
  clientName?: string
  serviceType?: string
  description?: string
  items?: QuoteItem[]
  validUntil?: Date
  status?: Quote['status']
}
```

### Cash Flow Store Interfaces
```typescript
// Core Payment entity
interface Payment {
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

interface MonthlyReport {
  id: string
  month: string // YYYY-MM
  totalRevenue: number
  totalJobs: number
  paidJobs: number
  pendingPayments: number
  topServices: ServiceSummary[]
  createdAt: Date
  updatedAt: Date
}

interface ServiceSummary {
  serviceType: string
  count: number
  revenue: number
}

// Input types for store operations
interface PaymentCreateInput {
  jobId: string
  clientId: string
  amount: number
  paymentMethod: 'cash' | 'transfer' | 'card'
  paymentDate: Date
  notes?: string
}

interface PaymentUpdateInput {
  amount?: number
  paymentMethod?: Payment['paymentMethod']
  paymentDate?: Date
  notes?: string
}
```

## Development Guidelines

### Language Rules
- **Code & Comments**: Always in English
- **UI Text**: Always in Spanish for user-facing content
- **Variable Names**: English, descriptive, camelCase
- **Function Names**: English, verb-based, descriptive

### No Authentication System
- No login/logout functionality
- No user roles or permissions
- Single technician assumption
- Direct access to all modules

### Data Persistence Strategy

**LocalStorage (MVP Phase)**:
- Use consistent key naming: `instalapro_[module]_[dataType]`
- JSON serialization with proper Date handling
- Data validation on load with TypeScript interfaces
- Graceful fallback for missing/corrupted data
- Export/import functionality for data backup

**Firestore (Production Phase)**:
- Collection-based structure: `jobs`, `clients`, `quotes`, `payments`
- Real-time listeners for live updates
- Optimistic updates with offline support
- Proper indexing for query performance
- Security rules for data protection

**Store Implementation Requirements**:
- Same public API for both localStorage and Firestore
- Internal adapter pattern to switch between implementations
- Consistent error handling and loading states
- TypeScript interfaces enforced at runtime

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

**Examples of Correct Styling**:
```vue
<!-- ✅ Correct: Tailwind classes -->
<div class="bg-white p-4 rounded-lg shadow-md border border-gray-200">
  <h2 class="text-xl font-semibold text-gray-800 mb-3">Title</h2>
  <button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors">
    Action
  </button>
</div>

<!-- ❌ Incorrect: Inline styles or custom CSS -->
<div style="background: white; padding: 16px;">
<div class="custom-container">
```

### Library & Dependencies Guidelines

**ALLOWED LIBRARIES ONLY** - Do not add any libraries beyond this approved list:

- **Iconify** (`@iconify/json`, `@iconify/utils`, `unplugin-icons`)
  - **MANDATORY** for all icons: Use `~icons/pack-name/icon-name` syntax
  - Never use other icon libraries (Font Awesome, Heroicons, etc.)
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

**Examples**:
```vue
<!-- ✅ Correct: Using approved libraries -->
<Icon name="mdi:calendar" class="w-5 h-5" />
<Toast :message="success" type="success" />

<!-- ❌ Incorrect: Using non-approved libraries -->
<FontAwesomeIcon :icon="['fas', 'calendar']" />
<VButton variant="primary">Click me</VButton>
```

---

This documentation serves as the foundation for developing InstalarPro MVP, ensuring consistency with established patterns while meeting the specific needs of air conditioner technicians in the Argentina/LATAM market.