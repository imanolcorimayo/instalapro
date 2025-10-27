# InstalaPro - Client Booking Interface

**🌐 Live Demo**: [https://instalapro-back-office.web.app/](https://instalapro-back-office.web.app/)

## Overview
Simple and intuitive appointment booking interface for clients to schedule services with technicians.

## Purpose
- **Target**: End customers booking AC services
- **Goal**: Streamlined appointment booking process
- **Focus**: Service selection, time slot booking, and appointment confirmation

## Key Features
- Service type selection
- Available time slot display
- Simple booking confirmation
- Integration with technician back-office
- Mobile-optimized interface

## User Experience
Designed for maximum simplicity to allow clients to quickly book appointments without confusion or complexity.

## Technical Details
For implementation details and technical specifications, refer to `/booking/CLAUDE.md` and the global `/CLAUDE.md` file.

## Getting Started
```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Build for production
yarn build
```

## Demo Technician Link
When the back-office demo mode is configured, set `NUXT_PUBLIC_TEST_TECHNICIAN_SLUG` in `.env` and share the booking URL:
```bash
https://your-booking-host/${NUXT_PUBLIC_TEST_TECHNICIAN_SLUG}
```
That slug is seeded by `back-office/scripts/seed-test-data.js`, so both apps read the same sample technician profile.
