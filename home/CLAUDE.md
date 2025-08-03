# InstalarPro Home - Marketing Landing Page

## Domain Overview
**URL**: https://instalapro.com  
**Purpose**: Public marketing website for lead generation and brand awareness  
**Target Users**: Potential clients seeking air conditioning services  
**Primary Goal**: Drive traffic to technician booking pages and capture leads

## Page Structure & Content Strategy

### Core Pages
- **Homepage** (`/index.vue`) - Main landing with hero, services overview, CTA
- **Services** (`/services/index.vue`) - Detailed service descriptions and pricing
- **Technicians** (`/technicians/index.vue`) - Directory of available technicians
- **Contact** (`/contact/index.vue`) - Contact forms and business information
- **About** (`/about/index.vue`) - Company story and value proposition
- **Blog** (`/blog/`) - SEO content and technical articles (optional)

### Dynamic Pages
- **Technician Profile** (`/technicians/[slug].vue`) - Individual technician pages
- **Service Detail** (`/services/[service].vue`) - Detailed service information
- **Location Pages** (`/[city].vue`) - City-specific landing pages for local SEO

## Content Strategy

### Primary Value Propositions
1. **Technicos Confiables** - Verified, experienced AC technicians
2. **Servicio Rapido** - Same-day and next-day service availability  
3. **Precios Justos** - Transparent pricing, no hidden fees
4. **Garantia Total** - Full warranty on all installations and repairs

### Service Categories
```typescript
interface ServiceCategory {
  id: string
  name: string
  description: string
  icon: string // Iconify icon name
  basePrice: string // Display price range
  services: string[] // Individual services in category
}

const serviceCategories: ServiceCategory[] = [
  {
    id: 'installation',
    name: 'Instalación',
    description: 'Instalación profesional de equipos nuevos',
    icon: 'mdi:air-conditioner',
    basePrice: 'Desde $15,000',
    services: ['Split 1x1', 'Split 2x1', 'Split 3x1', 'Cassette', 'Piso-Techo']
  },
  {
    id: 'maintenance', 
    name: 'Mantenimiento',
    description: 'Service preventivo y limpieza',
    icon: 'mdi:wrench',
    basePrice: 'Desde $3,000',
    services: ['Limpieza Split', 'Carga Gas', 'Cambio Filtros', 'Revisión General']
  },
  {
    id: 'repair',
    name: 'Reparación', 
    description: 'Diagnóstico y reparación de fallas',
    icon: 'mdi:hammer-wrench',
    basePrice: 'Desde $2,500',
    services: ['Diagnóstico', 'Reparación Electrónica', 'Cambio Repuestos']
  },
  {
    id: 'consultation',
    name: 'Consultoría',
    description: 'Asesoramiento técnico especializado',
    icon: 'mdi:clipboard-check',
    basePrice: 'Desde $1,500', 
    services: ['Evaluación Técnica', 'Presupuesto Detallado', 'Consulta Remota']
  }
]
```

## SEO Strategy

### Target Keywords (Argentina/LATAM)
- **Primary**: "instalacion aire acondicionado", "service aire acondicionado", "reparacion aire acondicionado"
- **Location-based**: "[ciudad] aire acondicionado", "tecnico aire acondicionado [zona]"
- **Long-tail**: "cuanto cuesta instalar aire acondicionado", "mejor tecnico aire acondicionado"

### Technical SEO Requirements
- **Meta Tags**: Dynamic meta titles and descriptions per page
- **Schema Markup**: LocalBusiness, Service, and Review schema
- **Open Graph**: Social media sharing optimization
- **Site Map**: XML sitemap with all pages and technicians
- **Speed**: Core Web Vitals optimization with Nuxt SSG

### Content Guidelines
- **Heading Structure**: H1 → H2 → H3 hierarchy on all pages
- **Internal Linking**: Cross-link related services and technician pages  
- **Local SEO**: Embed Google Maps, local business information
- **Image SEO**: Alt tags in Spanish, optimized file sizes

## Lead Capture Strategy

### Contact Forms
```typescript
interface LeadCapture {
  id: string
  name: string
  phone: string
  email?: string
  serviceType: string
  location: string
  urgency: 'immediate' | 'this_week' | 'next_week' | 'planning'
  description?: string
  preferredContact: 'phone' | 'whatsapp' | 'email'
  source: string // Page where form was submitted
  createdAt: Date
}
```

### CTA Strategy
- **Primary CTA**: "Solicitar Presupuesto Gratis" → Contact form
- **Secondary CTA**: "Ver Técnicos Disponibles" → Technician directory
- **Urgency CTA**: "Servicio de Emergencia" → Priority contact form
- **WhatsApp CTA**: Direct WhatsApp contact for instant communication

### Form Placement
- **Hero Section**: Main contact form above the fold
- **Service Pages**: Service-specific quote forms
- **Technician Pages**: "Contactar Técnico" forms
- **Sticky Footer**: Persistent WhatsApp contact button

## UI/UX Requirements

### Design Principles
- **Trust Building**: Professional imagery, testimonials, certifications
- **Simplicity**: Clear navigation, minimal clicks to contact
- **Mobile-First**: 80% of users will access via mobile
- **Speed**: Fast loading times, optimized images
- **Accessibility**: WCAG compliance for inclusive design

### Visual Elements
```vue
<!-- Color Palette -->
<div class="bg-blue-600">Primary - Professional Blue</div>
<div class="bg-orange-500">Accent - Warmth/Energy Orange</div>
<div class="bg-gray-100">Light Gray - Background</div>
<div class="bg-gray-800">Dark Gray - Text</div>
<div class="bg-white">White - Clean backgrounds</div>

<!-- Typography Scale -->
<h1 class="text-4xl font-bold">Hero Headlines</h1>
<h2 class="text-3xl font-semibold">Section Headers</h2>
<h3 class="text-xl font-medium">Subsections</h3>
<p class="text-base">Body text</p>
<small class="text-sm text-gray-600">Supporting text</small>
```

### Component Architecture
```typescript
// Shared components for marketing site
- ContactForm.vue (lead capture)
- ServiceCard.vue (service display)
- TechnicianCard.vue (technician profiles)
- TestimonialCarousel.vue (social proof)
- WhatsAppButton.vue (sticky contact)
- LocationMap.vue (service area display)
- PriceCalculator.vue (interactive pricing)
```

## Technical Implementation

### Nuxt Configuration
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  ssr: true, // Server-side rendering for SEO
  nitro: {
    prerender: {
      routes: ['/sitemap.xml', '/robots.txt']
    }
  },
  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt', 
    'unplugin-icons/nuxt',
    'dayjs-nuxt',
    '@nuxtjs/tailwindcss'
  ],
  app: {
    head: {
      htmlAttrs: { lang: 'es' },
      meta: [
        { name: 'robots', content: 'index, follow' },
        { name: 'author', content: 'InstalarPro' }
      ]
    }
  }
})
```

### Store Architecture
```typescript
// stores/leads.ts - Lead capture and management
interface LeadsStore {
  leads: LeadCapture[]
  loadLeads(): Promise<void>
  submitLead(lead: Omit<LeadCapture, 'id' | 'createdAt'>): Promise<void>
  getLeadsBySource(source: string): LeadCapture[]
  exportLeads(): void
}

// stores/content.ts - Site content management  
interface ContentStore {
  services: ServiceCategory[]
  technicians: Technician[]
  testimonials: Testimonial[]
  loadContent(): Promise<void>
  getServiceBySlug(slug: string): ServiceCategory | null
  getTechnicianBySlug(slug: string): Technician | null
}
```

### Integration with Other Domains
- **Lead Handoff**: Leads flow to back-office for technician assignment
- **Technician Data**: Pull technician profiles from back-office system
- **Booking Integration**: Direct links to agenda.instalapro.com/{technician}
- **Analytics**: Track conversion from marketing site to bookings

## Content Management

### Static Content
- Service descriptions and pricing
- Company information and policies
- SEO-optimized blog content
- Technician profiles and specialties

### Dynamic Content  
- Real-time technician availability status
- Service area coverage maps
- Customer testimonials and ratings
- Pricing updates and promotions

### Multilingual Considerations
- **Primary Language**: Spanish (Argentina/LATAM market)
- **Future**: Portuguese for Brazil expansion
- **Technical Terms**: Use local HVAC terminology
- **Currency**: Argentine Peso (ARS) pricing display

## Performance & Analytics

### Key Metrics
- **Traffic Sources**: Organic search, referrals, direct
- **Conversion Rates**: Visitor → Lead → Booking
- **Page Performance**: Core Web Vitals, bounce rate
- **Form Completion**: Lead capture form analytics
- **Mobile Usage**: Mobile vs desktop user behavior

### Optimization Strategy
- **Image Optimization**: WebP format, lazy loading
- **Code Splitting**: Route-based chunk loading  
- **Caching**: Aggressive caching for static content
- **CDN**: Content delivery optimization
- **Monitoring**: Real-time performance tracking

---

This marketing site serves as the primary entry point for potential clients, focusing on lead generation, SEO performance, and seamless handoff to the booking system for actual service appointments.