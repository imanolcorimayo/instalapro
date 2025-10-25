# InstalarPro ODM (Object Document Mapper) Architecture

## Overview

The InstalarPro ODM system provides a robust, type-safe layer between the Pinia stores and Firestore database. It handles validation, user isolation, caching, and provides a consistent API for data operations across all entities.

### Key Design Principles

1. **User Isolation**: All data is automatically scoped to the authenticated user via `userUid` field
2. **Type Safety**: Full TypeScript support with runtime validation
3. **Schema-First**: All data structures defined through schemas with validation rules
4. **Caching**: In-memory caching for performance optimization
5. **Real-time**: Firestore real-time subscriptions for live data updates
6. **Security**: Built-in reference validation and user ownership verification

## Core ODM Architecture

```mermaid
graph TB
    subgraph "ODM Core Layer"
        Schema[Schema Base Class]
        Types[ODM Types & Interfaces]
        Validator[Validator System]
        
        Schema --> Types
        Schema --> Validator
    end
    
    subgraph "Schema Implementations"
        ClientSchema[ClientSchema]
        JobSchema[JobSchema]
        ServiceTypeSchema[ServiceTypeSchema]
        TechnicianSchema[TechnicianSchema]
        
        ClientSchema --> Schema
        JobSchema --> Schema
        ServiceTypeSchema --> Schema
        TechnicianSchema --> Schema
    end
    
    subgraph "Pinia Stores"
        ClientStore[Clients Store]
        JobStore[Jobs Store]
        ServiceTypeStore[ServiceTypes Store]
        TechnicianStore[Technicians Store]
        
        ClientStore --> ClientSchema
        JobStore --> JobSchema
        ServiceTypeStore --> ServiceTypeSchema
        TechnicianStore --> TechnicianSchema
    end
    
    subgraph "Database Layer"
        Firestore[(Firestore Database)]
        
        Schema --> Firestore
    end
    
    subgraph "UI Layer"
        Components[Vue Components]
        Pages[Nuxt Pages]
        
        Components --> ClientStore
        Components --> JobStore
        Components --> ServiceTypeStore
        Components --> TechnicianStore
        
        Pages --> ClientStore
        Pages --> JobStore
        Pages --> ServiceTypeStore
        Pages --> TechnicianStore
    end
```

## Data Flow Architecture

```mermaid
sequenceDiagram
    participant UI as Vue Component
    participant Store as Pinia Store
    participant Schema as ODM Schema
    participant Validator as Validator
    participant Firestore as Firestore DB
    participant Auth as Firebase Auth
    
    UI->>Store: createClient(data)
    Store->>Schema: create(dataWithDefaults)
    
    Schema->>Auth: getCurrentUserUid()
    Auth-->>Schema: userUid
    
    Schema->>Schema: addSystemFields(userUid, timestamps)
    Schema->>Validator: validate(data, schema)
    Validator-->>Schema: ValidationResult
    
    alt Validation Success
        Schema->>Schema: prepareForSave(data)
        Schema->>Firestore: addDoc(collection, preparedData)
        Firestore-->>Schema: DocumentReference
        Schema->>Firestore: getDoc(docRef)
        Firestore-->>Schema: DocumentSnapshot
        Schema->>Schema: convertFirestoreDoc(snapshot)
        Schema-->>Store: CreateResult{success: true, data}
        Store->>Store: updateCache(newDocument)
        Store-->>UI: documentId
    else Validation Failed
        Schema-->>Store: CreateResult{success: false, error}
        Store-->>UI: Error
    end
```

## Database Structure

InstalarPro uses a flat Firestore collection structure with user isolation through `userUid` field. All collections are multi-tenant, with each document scoped to the authenticated technician.

```
// ----------- TECHNICIANS -------------
- Technician profile and account configuration
- One record per authenticated user (userUid matches Firebase Auth UID)

technicians/{technicianId}
  userUid                       // Firebase Auth UID
  name
  phone
  email
  secondaryEmail (optional)
  businessName (optional)
  urlSlug (optional)            // For agenda.instalapro.com/{urlSlug}
  isActive
  createdAt
  updatedAt
  createdBy
  archivedAt (optional)
  deactivatedAt (optional)


// ----------- SERVICE TYPES -------------
- Service catalog configuration
- Defines services offered by technician with pricing and duration

serviceTypes/{serviceTypeId}
  userUid                       // Owner technician
  name
  description (optional)
  basePrice
  estimatedDuration             // Minutes (15-480)
  category                      // e.g., 'installation', 'maintenance', 'repair'
  isActive
  createdAt
  updatedAt
  createdBy


// ----------- CLIENTS -------------
- Client database for technician
- Tracks service history and contact information

clients/{clientId}
  userUid                       // Owner technician
  name
  phone
  email (optional)
  address
  totalJobs
  totalSpent
  notes (optional)
  isActive
  createdAt
  updatedAt
  createdBy
  archivedAt (optional)


// ----------- JOBS -------------
- Job/appointment management
- Can reference existing client or contain standalone client info

jobs/{jobId}
  userUid                       // Owner technician
  clientId (optional)           // Reference to clients collection
  clientName
  clientPhone
  clientEmail (optional)
  serviceType
  description (optional)
  address
  scheduledDate
  estimatedDuration             // Minutes (15-480)
  status                        // 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'
  price
  notes (optional)
  source                        // 'back_office', 'client_booking'
  isActive
  createdAt
  updatedAt
  createdBy
  archivedAt (optional)


// ----------- SLOT AVAILABILITY -------------
- Time slot availability tracking for scheduling
- Generated from technician's weekly availability configuration
- BusinessRule: When job is created/cancelled, update corresponding slot's isAvailable status

slotAvailability/{slotId}
  userUid                       // Owner technician
  date                          // YYYY-MM-DD format
  hour                          // 6-22 (6 AM - 10 PM)
  isAvailable
  isManual                      // true if manually toggled, false if auto-closed by job
  createdAt
  updatedAt


// ----------- WALLETS -------------
- Expense and cash flow tracking for technician
- Currently focused on OUTPUT (expenses) only
- Income is calculated from completed jobs
- BusinessRule: movementType field exists for future expansion but only 'outcome' is allowed in first version

wallets/{walletId}
  userUid                       // Owner technician
  clientId (optional)           // Reference to clients collection
  jobId (optional)              // Reference to jobs collection

  movementType                  // 'income' | 'outcome' (only 'outcome' allowed for now)
  amount                        // Amount (always positive)
  date                          // When expense occurred (YYYY-MM-DD format)
  category                      // Category from predefined list (not user-configurable)
  notes (optional)              // Additional context about the expense

  createdAt
  createdBy
  updatedAt
  deletedAt (optional)          // Soft delete for debugging/audit trail
```