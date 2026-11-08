# Gmail & Google Calendar Sync for jasonpheks@gmail.com

Configure direct Google Calendar event synchronization pre-targeted to the CEO's Gmail address (`jasonpheks@gmail.com`) so every client booking automatically includes calendar invite parameters for `jasonpheks@gmail.com`.

## User Review & Critical Decisions

> [!IMPORTANT]
> **Confirmed Target Account**: Sync calendar events directly to `jasonpheks@gmail.com` as the primary CEO destination email address for all boutique appointments.

- **Confirmed Choice**: Pre-configure `ceo_google_email` default to `jasonpheks@gmail.com`.
- **Confirmed Feature**: Automatically append `jasonpheks@gmail.com` as an invited attendee on generated Google Calendar links and backend calendar sync payloads.

---

## 1. Overview & Core Concept

- **What It Does**: Whenever a client books an appointment (or when an admin manages bookings), the app generates Google Calendar event invitations with `add=jasonpheks@gmail.com` pre-attached.
- **Target Audience**: CEO (`jasonpheks@gmail.com`) and boutique clients.
- **Key Value**: Guarantees appointments instantly appear on the CEO's Google Calendar and Gmail calendar schedule with zero configuration friction.

---

## 2. User Experience & Visual Design

- **Admin Panel (TabCalendar)**:
  - CEO Google Email pre-set to `jasonpheks@gmail.com`.
  - Display "Sync Active for jasonpheks@gmail.com" status badge.
  - Quick action to dispatch test appointment to `jasonpheks@gmail.com` Google Calendar.
- **Client Booking Modal & Admin Appointments Tab**:
  - Direct "Sync to Google Calendar" button on every appointment card that invites `jasonpheks@gmail.com` directly.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1**: Attendee-Targeted Web Links (`add=jasonpheks@gmail.com`)
  - *Chosen Approach*: Embed `add=jasonpheks@gmail.com` into Google Calendar `TEMPLATE` render links (`https://calendar.google.com/calendar/render?action=TEMPLATE&add=jasonpheks@gmail.com&...`).
  - *Why*: Automatically sends a Google Calendar invitation directly to `jasonpheks@gmail.com`'s Google Calendar when clicked.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Booking                        │
│  - Form submission -> Appends add=jasonpheks@gmail.com      │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Google Calendar Event Link                  │
│  - https://calendar.google.com/calendar/render             │
│    ?action=TEMPLATE                                         │
│    &text=MT+Mansion:+Service                                │
│    &add=jasonpheks@gmail.com                                │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 CEO Gmail / Google Calendar                 │
│  - Event added directly to jasonpheks@gmail.com's Calendar  │
└─────────────────────────────────────────────────────────────┘
```

- **Data Model Updates**:
  - Set default `defaultSettings.ceo_google_email` in `server.ts` and `initialData.ts` to `jasonpheks@gmail.com`.
- **Helper Function Updates**:
  - Update `buildGoogleCalendarWebLink` in `src/lib/googleCalendar.ts` to include `add=${encodeURIComponent(targetEmail)}`.
