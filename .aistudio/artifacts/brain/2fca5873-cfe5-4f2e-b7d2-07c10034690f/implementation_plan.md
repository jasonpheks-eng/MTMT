# Automated Google Calendar OAuth & Firestore Persistence Plan

Ensure seamless, automated Google Calendar event synchronization for every client booking using authenticated OAuth tokens and Firestore persistence.

## User Review & Critical Decisions

> [!IMPORTANT]
> **Confirmed Goal**: Automatically sync guest bookings to your personal Google Calendar via OAuth authentication and persist records in Firestore.

- **Confirmed Decision 1**: Store and retrieve active Google OAuth access tokens securely in memory and Firestore.
- **Confirmed Decision 2**: Automatically trigger Google Calendar REST API calls on booking submission to insert events directly into your calendar.

---

## 1. Overview & Core Concept

- **What It Does**: When you sign in with Google in the Admin Panel, your OAuth token (`https://www.googleapis.com/auth/calendar.events`) is authorized. When a guest books an appointment, the app automatically posts the event to your Google Calendar in the background.
- **Target Audience**: Boutique CEO / Owner (`jasonpheks@gmail.com`).
- **Key Value**: Fully automated calendar scheduling with zero manual link clicking required.

---

## 2. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                       Guest Booking                         │
│  - Guest submits booking details in BookingSection           │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Background Calendar Sync                    │
│  - Verifies stored OAuth token                              │
│  - Calls Google Calendar REST API                           │
│    (POST /calendars/primary/events)                         │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Personal Google Calendar                  │
│  - Event appears instantly with 30-min popup reminder       │
└─────────────────────────────────────────────────────────────┘
```

- **Implementation Steps**:
  1. Verify OAuth token management in `src/lib/googleCalendar.ts`.
  2. Ensure `handleBookingSubmit` in `BookingSection.tsx` calls `syncAppointmentToGoogleCalendar` with the active OAuth token.
  3. Verify Firestore and backend sync in `server.ts`.
