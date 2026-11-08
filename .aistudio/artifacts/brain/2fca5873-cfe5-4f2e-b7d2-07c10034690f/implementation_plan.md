# Direct Background Google Calendar Event Sync Upon Guest Booking

Automatically create a calendar event in the CEO's synchronized Google Calendar (`settings.ceo_google_email` / authorized account) behind the scenes whenever a guest clicks "Request via WhatsApp", ensuring the event is created directly via the Google Calendar REST API using the stored access token while opening WhatsApp.

## User Review & Critical Decisions

> [!IMPORTANT]
> **Confirmed Workflow**: When a guest submits a booking request, the app will execute two actions in parallel behind the scenes:
> 1. Open WhatsApp with the prefilled message for staff.
> 2. Dispatch a direct background API call to the CEO's Google Calendar using the authorized OAuth token (`getCachedCalendarToken()`) and target email (`settings.ceo_google_email`), creating the appointment event instantly in the CEO's calendar.

- **Confirmed Decision 1**: Direct REST API event creation (`https://www.googleapis.com/calendar/v3/calendars/primary/events`) utilizing the cached OAuth token if available.
- **Confirmed Decision 2**: Fallback to direct calendar web link generation with pre-populated attendee (`settings.ceo_google_email`) if no OAuth token is active yet.

---

## 1. Overview & Core Concept

- **What It Does**: Seamless background event syncing. When a guest submits a booking in `BookingSection.tsx`, `createAppointment` invokes `syncAppointmentToGoogleCalendar(appointment, getCachedCalendarToken(), settings.calendar_reminder_min || 30)`.
- **Target Audience**: Boutique CEO / Owner and guests.
- **Key Value**: Zero-touch calendar entry creation in the CEO's Google Calendar upon guest request submission.

---

## 2. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    Guest Booking Submit                     │
│  - User enters name & notes, clicks "Request via WhatsApp"   │
└──────────────────────────────┬──────────────────────────────┘
                               │
       ┌───────────────────────┴───────────────────────┐
       ▼                                               ▼
┌──────────────────────────────┐        ┌──────────────────────────────┐
│      Open WhatsApp Chat      │        │  Background Calendar Sync    │
│  - Prefilled WhatsApp msg    │        │  - syncAppointmentToGoogle...│
│  - Sends details to staff    │        │  - POST to Google Calendar   │
│                              │        │    REST API (primary/events) │
└──────────────────────────────┘        └──────────────────────────────┘
```

- **Implementation Details**:
  - Update `BookingSection.tsx` to call `syncAppointmentToGoogleCalendar(appointment, getCachedCalendarToken(), settings.calendar_reminder_min || 30, settings.ceo_google_email)` on submit.
  - Update `src/lib/googleCalendar.ts` to ensure `syncAppointmentToGoogleCalendar` correctly uses `settings.ceo_google_email` and handles API authentication cleanly.
