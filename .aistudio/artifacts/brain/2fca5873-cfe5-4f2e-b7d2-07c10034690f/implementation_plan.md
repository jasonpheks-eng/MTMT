# Direct Google Calendar Integration Plan

Transition Google Calendar booking synchronization from client-side OAuth popups (which encounter origin mismatch errors on dynamic preview domains) to a reliable server-side proxy route and direct calendar link sync system.

## User Review & Critical Decisions

> [!IMPORTANT]
> **Confirmed Choice**: The user selected **Direct Google Calendar sync with backend API key or Service Account**. This bypasses client-side OAuth popups and eliminates the `Error 400: origin_mismatch` issue caused by dynamic preview origins.

- **Confirmed Decision 1**: Server-side proxy route (`/api/calendar/sync`) for automated background appointment creation.
- **Confirmed Decision 2**: Direct "Add to Google Calendar" action link for clients as a instant zero-friction calendar fallback.

---

## 1. Overview & Core Concept

- **What It Does**: Enables seamless booking calendar creation when clients book appointments at MT Mansion. The system creates Google Calendar events via backend proxy API calls and provides "Add to Calendar" links for booking confirmations.
- **Target Audience / Persona**: Boutique CEO / Admin managing appointment schedules and luxury clients booking beauty services.
- **Key Value**: 100% reliable calendar event creation without popup blockers, browser origin mismatch errors, or manual authorization friction.

---

## 2. User Experience & Visual Design

- **Admin Panel (TabCalendar)**:
  - Simplified interface for CEO Google Calendar configuration.
  - Allows specifying CEO target Google Email, Calendar ID, and optional API key / Service Account credentials.
  - Active status indicator showing system sync readiness.
  - Test sync trigger button to verify API connectivity.
- **Client Booking Experience**:
  - Instant booking confirmation modal after service booking.
  - "Add to Google Calendar" link generated for the client's personal calendar.
  - Automated background sync to CEO's boutique calendar.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1**: Server-Side Calendar Sync Proxy
  - *Chosen Approach*: Handle Google Calendar Event creation via backend endpoint `/api/calendar/sync` in `server.ts`.
  - *Why*: Server-side requests are immune to browser `origin_mismatch` restrictions and popup blockers.
- **Decision 2**: Dual Sync Strategy (Server Sync + Client Calendar Links)
  - *Chosen Approach*: Send background creation request to server AND provide direct `https://calendar.google.com/calendar/render?action=TEMPLATE` link in booking confirmation.
  - *Why*: Guarantees both the CEO and the client have calendar events even if custom API credentials are not yet configured.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────┐
│                    Client (Browser)                     │
│  - BoutiqueContext (Book Appointment)                   │
│  - Booking Modal ("Add to Google Calendar" link)         │
│  - AdminModal -> TabCalendar (CEO Settings)             │
└────────────────────────────┬────────────────────────────┘
                             │ POST /api/calendar/sync
                             ▼
┌─────────────────────────────────────────────────────────┐
│                   Server (server.ts)                    │
│  - Express proxy route /api/calendar/sync              │
│  - Google Calendar REST API event creation payload      │
│  - Secure API Key / Service Account token handler       │
└────────────────────────────┬────────────────────────────┘
                             │ HTTPS API Call
                             ▼
┌─────────────────────────────────────────────────────────┐
│                   Google Calendar API                   │
│  - https://www.googleapis.com/calendar/v3/calendars    │
└─────────────────────────────────────────────────────────┘
```

- **Data Model Updates**:
  - `BoutiqueSettings`: Keep `calendar_sync_enabled`, `ceo_google_email`, `calendar_reminder_min`, and optional `calendar_api_key`.
- **API Flow**:
  1. Client submits booking request.
  2. `BoutiqueContext` calls `/api/calendar/sync` with appointment details.
  3. Server proxy builds Google Calendar event payload and dispatches event creation.
  4. Client receives appointment confirmation with direct Google Calendar web event URL.
