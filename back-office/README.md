# InstalaPro - Back Office

**🌐 Live Demo**: [https://instalapro-booking.web.app/](https://instalapro-booking.web.app/)

## Overview
Complete business management dashboard for air conditioner technicians.

## Purpose
- **Target**: Self-employed AC technicians
- **Goal**: Comprehensive job and client management system
- **Focus**: Client administration, job scheduling, and business operations

## Key Features
- Job schedule management
- Client database and history
- Quote generation and management
- Basic cash flow tracking
- WhatsApp integration for client communication

## User Experience
Designed specifically for technicians who need maximum simplicity and minimal learning curve. All interfaces prioritize ease of use over complex features.

## Technical Details
For implementation details and technical specifications, refer to `/back-office/CLAUDE.md` and the global `/CLAUDE.md` file.

## Getting Started
```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Build for production
yarn build
```

## Test Access Flow
Enable the shared demo mode so early testers can navigate the full back-office without real data.

### 1) Configure environment variables
Create `.env` with the following keys (values should match the same Firebase project):
```bash
NUXT_PUBLIC_TEST_ACCESS_ENABLED=true
NUXT_PUBLIC_TEST_TECHNICIAN_SLUG=instalapro-demo       # Slug used on the booking site
NUXT_PUBLIC_TEST_ACCESS_CODE=SHARE_THIS_CODE_WITH_TESTERS  # Code that testers will type
NUXT_TEST_USER_UID=instalapro-demo-user                # UID used for the seeded dataset
NUXT_PUBLIC_TEST_USER_EMAIL=demo.tech@instalapro.com   # Email for test user account
NUXT_PUBLIC_TEST_USER_PASSWORD=YOUR_SECURE_PASSWORD    # Password for test user account
```

### 2) Seed the Firebase project
Run the helper script once per project to create the demo user, technician, services, clients, jobs and slot availability:
```bash
cd back-office
yarn seed:test-data
```
Optional overrides:
```bash
TEST_USER_UID=instalapro-demo-user \
TEST_USER_EMAIL=demo.tech@instalapro.com \
TEST_USER_PASSWORD=YOUR_SECURE_PASSWORD \
TEST_TECHNICIAN_SLUG=instalapro-demo \
node scripts/seed-test-data.js
```
> **Important:** Ensure `TEST_USER_EMAIL` and `TEST_USER_PASSWORD` match your `.env` file values (`NUXT_PUBLIC_TEST_USER_EMAIL` and `NUXT_PUBLIC_TEST_USER_PASSWORD`)
> The script is idempotent; running it again refreshes the sample data without duplicating records.

### 3) Share the testing credentials
- **Back-office:** testers visit `/sign-in`, click "Usar código de prueba" and enter `NUXT_PUBLIC_TEST_ACCESS_CODE`.
- **Booking:** send the generated URL `https://your-booking-host/${NUXT_PUBLIC_TEST_TECHNICIAN_SLUG}` so they can explore the client-facing flow.

Ensure the test user credentials (`TEST_USER_EMAIL` and `TEST_USER_PASSWORD`) match between your `.env` file and the seed script. When testers enter the correct access code, they are signed in client-side with these email/password credentials and can explore the seeded dataset.
