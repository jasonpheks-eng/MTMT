import firebaseConfig from '../../firebase-applet-config.json';
import { Appointment } from '../types';

let cachedAccessToken: string | null = null;
let cachedUserEmail: string | null = null;

// Parse access token from URL hash if redirected
if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
  try {
    const params = new URLSearchParams(window.location.hash.substring(1));
    const token = params.get('access_token');
    if (token) {
      cachedAccessToken = token;
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  } catch (e) {}
}

declare global {
  interface Window {
    google?: any;
  }
}

const loadGisScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      resolve();
      return;
    }
    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }
    const existing = document.getElementById('google-gis-script');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', (e) => reject(e));
      return;
    }
    const script = document.createElement('script');
    script.id = 'google-gis-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });
};

export const authenticateCEOForCalendar = async (): Promise<{ user: { email?: string; displayName?: string }; accessToken: string }> => {
  await loadGisScript();
  const clientId = firebaseConfig.oAuthClientId;
  if (!clientId) {
    throw new Error('Google OAuth Client ID is missing in configuration');
  }

  return new Promise((resolve, reject) => {
    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
        callback: async (response: any) => {
          if (response.error) {
            reject(new Error(response.error_description || response.error));
            return;
          }
          if (response.access_token) {
            cachedAccessToken = response.access_token;
            let userEmail = 'jasonpheks@gmail.com';
            let userName = 'CEO';
            try {
              const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${response.access_token}` },
              });
              if (userInfoRes.ok) {
                const userInfo = await userInfoRes.json();
                userEmail = userInfo.email || userEmail;
                userName = userInfo.name || userName;
                cachedUserEmail = userEmail;
              }
            } catch (uErr) {
              console.warn('Could not fetch user info:', uErr);
            }
            resolve({
              user: { email: userEmail, displayName: userName },
              accessToken: response.access_token,
            });
          } else {
            reject(new Error('No access token received from Google'));
          }
        },
        error_callback: (err: any) => {
          reject(new Error(err?.message || 'Google authentication popup was closed or blocked.'));
        }
      });

      client.requestAccessToken({ prompt: 'consent' });
    } catch (err: any) {
      reject(err);
    }
  });
};

export const getCachedCalendarToken = (): string | null => cachedAccessToken;
export const getCachedCEOEmail = (): string | null => cachedUserEmail;

export const buildGoogleCalendarWebLink = (
  appointment: Appointment,
  reminderMinutes: number = 30,
  targetEmail: string = 'jasonpheks@gmail.com'
): string => {
  try {
    const [year, month, day] = appointment.date.split('-').map(Number);
    let hours = 14;
    let minutes = 30;
    const match = appointment.time_slot.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (match) {
      hours = parseInt(match[1], 10);
      minutes = parseInt(match[2], 10);
      const ampm = match[3].toUpperCase();
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
    }

    const startDate = new Date(year, month - 1, day, hours, minutes, 0);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    const formatISO = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, '');
    const dates = `${formatISO(startDate)}/${formatISO(endDate)}`;

    const title = `MT Mansion: ${appointment.service_title} - ${appointment.client_name}`;
    const details = `Boutique Appointment Booking\n\nClient: ${appointment.client_name}\nPhone: ${appointment.client_phone}\nTreatment: ${appointment.service_title}\nDate: ${appointment.date}\nTime: ${appointment.time_slot}\n${appointment.notes ? `Notes: ${appointment.notes}\n` : ''}Ref: ${appointment.id}`;
    const location = `MT Mansion Luxury Boutique`;
    const attendee = targetEmail || cachedUserEmail || 'jasonpheks@gmail.com';

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${encodeURIComponent(dates)}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}&add=${encodeURIComponent(attendee)}`;
  } catch (err) {
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('MT Mansion Appointment')}&add=jasonpheks%40gmail.com`;
  }
};

export const syncAppointmentToGoogleCalendar = async (
  appointment: Appointment,
  accessToken?: string | null,
  reminderMinutes: number = 30
): Promise<{ success: boolean; webLink: string; synced: boolean }> => {
  const token = accessToken || cachedAccessToken;
  const webLink = buildGoogleCalendarWebLink(appointment, reminderMinutes);

  if (!token) {
    return { success: true, webLink, synced: false };
  }

  try {
    const [year, month, day] = appointment.date.split('-').map(Number);
    let hours = 14;
    let minutes = 30;
    const match = appointment.time_slot.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (match) {
      hours = parseInt(match[1], 10);
      minutes = parseInt(match[2], 10);
      const ampm = match[3].toUpperCase();
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
    }

    const startDate = new Date(year, month - 1, day, hours, minutes, 0);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    const eventPayload = {
      summary: `MT Mansion: ${appointment.service_title} - ${appointment.client_name}`,
      description: `Boutique Appointment Booking\n\nClient: ${appointment.client_name}\nPhone: ${appointment.client_phone}\nTreatment: ${appointment.service_title}\nDate: ${appointment.date}\nTime: ${appointment.time_slot}\n${appointment.notes ? `Notes: ${appointment.notes}\n` : ''}Ref: ${appointment.id}`,
      location: 'MT Mansion Luxury Boutique',
      start: { dateTime: startDate.toISOString() },
      end: { dateTime: endDate.toISOString() },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: reminderMinutes },
          { method: 'email', minutes: reminderMinutes }
        ],
      },
    };

    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventPayload),
    });

    if (res.ok) {
      return { success: true, webLink, synced: true };
    } else {
      const errData = await res.json();
      console.warn('Google Calendar REST API sync note:', errData);
    }
  } catch (err) {
    console.warn('Failed direct sync to Google Calendar:', err);
  }

  return { success: true, webLink, synced: false };
};

export const signOutFromCalendar = () => {
  cachedAccessToken = null;
  cachedUserEmail = null;
};
