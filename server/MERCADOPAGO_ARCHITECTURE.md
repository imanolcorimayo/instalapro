# Mercado Pago Subscription Architecture

## Overview
This document describes the architecture for the Mercado Pago subscription system in InstalaPro.

**Business Model:** Technicians subscribe to InstalaPro platform (SaaS model) and pay monthly fees via Mercado Pago.

**Plan Management:** Subscription plans are created manually by InstalaPro admins via console scripts (`/server/console/scripts/mp/`), not by individual technicians. This provides:
- Full control over pricing strategy
- Git-based audit trail for plan changes
- Simplified security (no UI for plan manipulation)
- Infrequent changes (quarterly/yearly adjustments)

---

## 1. Collections Relationship

```mermaid
erDiagram
    PREAPPROVAL_PLANS ||--o{ SUBSCRIPTIONS : "has many"
    PAYMENT_METHODS ||--o{ SUBSCRIPTIONS : "used by"
    SUBSCRIPTIONS ||--o{ SUBSCRIPTION_PAYMENTS : "generates"
    SUBSCRIPTIONS ||--o{ SUBSCRIPTION_CHANGE_LOGS : "logs changes"
    PREAPPROVAL_PLANS ||--o{ PLAN_CHANGE_LOGS : "logs changes"

    PREAPPROVAL_PLANS {
        string id PK
        string mpPlanId
        string reason
        string planName
        object autoRecurring
        string status
        boolean isActive
        timestamp createdAt
        timestamp updatedAt
    }

    PAYMENT_METHODS {
        string id PK
        string userUid FK
        string customerId
        string mpCardId
        string firstSixDigits
        string lastFourDigits
        string cardholderName
        string status
        timestamp createdAt
    }

    SUBSCRIPTIONS {
        string id PK
        string userUid FK
        string customerId
        string mpSubscriptionId
        string planId FK
        string cardId FK
        string status
        object autoRecurring
        timestamp nextPaymentDate
        timestamp createdAt
    }

    SUBSCRIPTION_PAYMENTS {
        string id PK
        string userUid FK
        string subscriptionId FK
        string mpPaymentId
        number amount
        string status
        timestamp paymentDate
        timestamp createdAt
    }

    PLAN_CHANGE_LOGS {
        string id PK
        string planId FK
        string changeType
        object previousData
        object newData
        string changedBy
        timestamp createdAt
    }

    SUBSCRIPTION_CHANGE_LOGS {
        string id PK
        string userUid FK
        string subscriptionId FK
        string changeType
        object previousData
        object newData
        timestamp createdAt
    }
```

---

## 2. Complete Subscription Flow

```mermaid
sequenceDiagram
    participant ADMIN as InstalaPro Admin
    participant SCRIPT as Console Script
    participant TECH as Technician (Frontend)
    participant BE as Backend Server
    participant MP as Mercado Pago API
    participant FS as Firestore

    Note over ADMIN,FS: STEP 1: Admin Creates Subscription Plans (Manual - Rare)
    ADMIN->>SCRIPT: Run create-preapproval-plan.js
    SCRIPT->>MP: POST /preapproval_plan
    MP-->>SCRIPT: Plan created (mpPlanId, init_point)
    SCRIPT->>FS: Save to preapprovalPlans collection
    SCRIPT->>FS: Log to planChangeLogs
    SCRIPT-->>ADMIN: ✅ Plan created & saved

    Note over TECH,FS: STEP 2: Technician Adds Payment Method
    TECH->>TECH: MP Client SDK tokenizes card
    TECH->>BE: POST /api/payment-methods (card token)
    BE->>FS: Save to paymentMethods (userUid scoped)
    BE-->>TECH: Card saved successfully

    Note over TECH,FS: STEP 3: Technician Subscribes to Plan
    TECH->>BE: GET /api/plans (view available plans)
    BE->>FS: Fetch active plans
    BE-->>TECH: Return plan options
    TECH->>BE: POST /api/subscriptions (planId, cardId)
    BE->>FS: Fetch plan details
    BE->>MP: POST /preapproval (create subscription)
    MP-->>BE: Subscription created (mpSubscriptionId)
    BE->>FS: Save to subscriptions (userUid scoped)
    BE->>FS: Log to subscriptionChangeLogs
    BE-->>TECH: ✅ Subscription active

    Note over MP,FS: STEP 4: Monthly Payment (Automatic)
    MP->>BE: POST /webhooks/mercado-pago (payment.created)
    BE->>MP: GET /v1/payments/{id} (verify payment)
    MP-->>BE: Payment details
    BE->>FS: Save to subscriptionPayments
    BE->>FS: Update subscription (lastPaymentDate, nextPaymentDate)
    BE-->>MP: 200 OK

    Note over TECH,FS: STEP 5: Technician Manages Subscription
    TECH->>BE: PUT /api/subscriptions/{id}/pause
    BE->>MP: PUT /preapproval/{id}
    MP-->>BE: Status updated
    BE->>FS: Update subscriptions (status: paused)
    BE->>FS: Log to subscriptionChangeLogs
    BE-->>TECH: ✅ Subscription paused
```

