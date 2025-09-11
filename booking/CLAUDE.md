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

## Mobile-First Design System

### Touch-Friendly Interface
- **Button Size**: Minimum 44px height for touch targets
- **Spacing**: Generous padding between interactive elements  
- **Typography**: Minimum 16px font size to prevent zoom
- **Form Fields**: Large, clearly labeled input fields
- **Loading States**: Clear feedback for all user actions

### Data Synchronization
- **Technician Profile**: Sync individual technician's profile from back-office
- **Services**: Pull that specific technician's service catalog and pricing
- **Availability**: Get real-time availability for that technician only
- **Booking Requests**: Submit booking requests to that technician's back-office

## Error Handling & Edge Cases

### Common Scenarios
- **Invalid Technician URL**: Redirect to main site with message
- **No Availability**: Show "Próxima disponibilidad" with calendar
- **Booking Conflicts**: Real-time conflict detection and alternative suggestions
- **Form Validation**: Inline validation with clear error messages
- **Network Issues**: Offline detection with retry mechanisms

## Component Guidelines

### Base Components (Use Existing Patterns)
- **ModalStructure.vue** - Base modal component for confirmations
- **Form Components** - Large, touch-friendly input fields
- **Button Components** - Minimum 44px height for touch targets

### Component Creation Rules
**⚠️ CRITICAL: UNUSED COMPONENT PREVENTION**
Before creating ANY new component:
1. **Verify immediate usage**: Component must be imported and used
2. **Follow proven patterns**: Use existing base components
3. **Check for existing solutions**: Extend existing components before creating new ones

## CSS & Styling Guidelines
- **MANDATORY**: Use Tailwind CSS classes exclusively for all styling
- **NO custom CSS**: Avoid inline styles, custom CSS files, or `<style>` blocks
- **Mobile-First**: Use Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`)
- **Touch Targets**: Minimum `h-11` (44px) for all interactive elements
- **Spacing**: Use Tailwind's spacing scale for consistent layouts

## Library Guidelines

**ALLOWED LIBRARIES ONLY**:
- **Iconify** (`@iconify/json`, `@iconify/utils`, `unplugin-icons`)
  - **MANDATORY** for all icons: Use `~icons/pack-name/icon-name` syntax
  - Never use emojis as icons, always use Iconify
- **Tailwind CSS** - For all styling
- **VueUse** - For Vue composition utilities
- **vue3-toastify** - For notifications
- **dayjs** - For all date operations

**FORBIDDEN**:
- **NO additional UI libraries**
- **NO additional icon libraries** 
- **NO CSS frameworks** beyond Tailwind
- **NO date libraries** beyond dayjs

## Performance Optimization

### Loading Strategy
- **Critical CSS**: Inline critical styles for above-fold content
- **Progressive Loading**: Show service selection while availability loads
- **Image Optimization**: Optimized technician photos, lazy loading
- **Prefetching**: Prefetch likely next steps in booking flow
---

This booking interface prioritizes simplicity and mobile usability to maximize conversion rates while seamlessly integrating with the back-office system for technician workflow management.