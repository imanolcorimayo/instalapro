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
- **instalapro.com** - Static landing page for technicians to showcase their services
- **back.instalapro.com** - Technician management dashboard and back-office
- **agenda.instalapro.com/{technician}** - Client booking interface

## Domain-Specific Information

### `/home` - Technician Landing Page
- **Purpose**: Static landing page for technicians to showcase their services
- **Target**: Individual technicians building their online presence
- **Features**: Service showcase, contact information, professional presentation

### `/back-office` - Technician Dashboard
- **Purpose**: Complete business management for technicians
- **Target**: Self-employed AC technicians
- **Features**: Schedule, clients, quotes, cash flow, job management
- **🚀 Live Demo**: https://instalapro-back-office.web.app/

### `/booking` - Client Interface
- **Purpose**: Simple appointment booking
- **Target**: End customers booking appointments
- **Features**: Service selection, time slots, booking confirmation
- **🚀 Live Demo**: https://instalapro-booking.web.app/

## Integration Points

### Data Flow
1. **Home** → **Booking**: Technician landing page to appointment scheduling
2. **Booking** → **Back Office**: Client requests to technician workflow  
3. **Back Office** → **Client**: Job confirmations and communication

## Support & Documentation

For detailed implementation instructions for each domain, refer to:
- `/CLAUDE.md` - Global project instructions and shared interfaces
- `/home/CLAUDE.md` - Technician landing page implementation details
- `/back-office/CLAUDE.md` - Technician dashboard specifications
- `/booking/CLAUDE.md` - Client booking interface requirements

## License
Private project - All rights reserved
