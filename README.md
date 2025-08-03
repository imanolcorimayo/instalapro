# InstalarPro - Air Conditioner Technician Platform

## Project Overview
InstalarPro is a comprehensive platform connecting air conditioner technicians with clients in Argentina/LATAM. The platform consists of three interconnected domains serving different users and purposes.

## Architecture

### Domain Structure
```
/instalapro (root)
├── CLAUDE.md (global project instructions)
├── /home (instalapro.com - marketing site)
├── /back-office (back.instalapro.com - technician dashboard)  
└── /booking (agenda.instalapro.com - client booking interface)
```

### Domain URLs
- **instalapro.com** - Public marketing website for lead generation
- **back.instalapro.com** - Technician management dashboard and back-office
- **agenda.instalapro.com/{technician}** - Client booking interface

### Tech Stack
- **Framework**: Nuxt 4 (Vue 3) for all domains
- **Styling**: Tailwind CSS (exclusive)
- **State Management**: Pinia
- **Icons**: Iconify (`~icons/` syntax)
- **Package Manager**: yarn (not npm)

## Getting Started

### Prerequisites
- Node.js 18+ 
- Yarn package manager
- Git

### Installation & Development

#### Global Setup
```bash
# Clone the repository
git clone <repository-url>
cd instalapro

# Install dependencies for each domain
cd home && yarn install
cd ../back-office && yarn install  
cd ../booking && yarn install
```

#### Running Individual Domains
```bash
# Marketing site (port auto-assigned, typically 3000)
cd home && yarn dev

# Back office (port auto-assigned, typically 3000) 
cd back-office && yarn dev

# Booking interface (port auto-assigned, typically 3000)
cd booking && yarn dev
```

**Note**: Nuxt automatically selects available ports. If multiple domains run simultaneously, they'll use different ports.

## Development Guidelines

### Code Standards
- **Language**: Code and comments in English, UI text in Spanish
- **TypeScript**: Strict typing required for all data structures
- **Styling**: Tailwind CSS only, no custom CSS files
- **Icons**: Iconify only (`~icons/pack-name/icon-name`)
- **Mobile-First**: All interfaces must be mobile responsive

### Shared Data Structures
Common TypeScript interfaces are defined in the global CLAUDE.md and should be consistent across all domains:
- `Technician` - Technician profiles and information
- `Job` - Service appointments and work orders
- `Client` - Customer information and history
- `BookingRequest` - Client booking requests

### Database Strategy
- **MVP**: LocalStorage with consistent key naming
- **Production**: Firebase/Firestore with real-time sync
- **Keys**: `instalapro_[domain]_[entity]_[data]`

## Domain-Specific Information

### `/home` - Marketing Site
- **Purpose**: Lead generation and SEO
- **Target**: Potential clients seeking AC services
- **Features**: Service listings, technician directory, contact forms
- **Port**: 3001

### `/back-office` - Technician Dashboard  
- **Purpose**: Complete business management for technicians
- **Target**: Self-employed AC technicians
- **Features**: Schedule, clients, quotes, cash flow, job management
- **Port**: 3000

### `/booking` - Client Interface
- **Purpose**: Simple appointment booking
- **Target**: End customers booking appointments
- **Features**: Service selection, time slots, booking confirmation
- **Port**: 3002

## Integration Points

### Data Flow
1. **Marketing** → **Booking**: Lead capture to appointment scheduling
2. **Booking** → **Back Office**: Client requests to technician workflow  
3. **Back Office** → **Client**: Job confirmations and communication

### Shared Components
- Contact forms and lead capture
- WhatsApp integration buttons
- Service type selectors
- Time slot pickers

## Support & Documentation

For detailed implementation instructions for each domain, refer to:
- `/CLAUDE.md` - Global project instructions and shared interfaces
- `/home/CLAUDE.md` - Marketing site implementation details
- `/back-office/CLAUDE.md` - Technician dashboard specifications
- `/booking/CLAUDE.md` - Client booking interface requirements

## License
Private project - All rights reserved
