import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Appointment } from '../types';

let app: any;
let auth: any;
let provider: GoogleAuthProvider;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  provider = new GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/calendar.events');
} catch (err) {
  console.warn('Firebase / Google Auth initialization warning:', err);
}

let cachedAccessToken: string | null = null;

declare global {
  interface Window {
    google?: any;
  }
}

const loadGisScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }
    const existingScript = document.getElementById('google-gis-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', (e) => reject(e));
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

export const authenticateCEOWithGIS = async (): Promise<{ user: { email?: string; displayName?: string }; accessToken: string }> => {
  await loadGisScript();
  const clientId = firebaseConfig.oAuthClientId;
  if (!clientId) {
    throw new Error('Google OAuth Client ID is missing from configuration');
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
            let userEmail = '';
            let userName = '';
            try {
              const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${response.access_token}` },
              });
              if (userInfoRes.ok) {
                const userInfo = await userInfoRes.json();
                userEmail = userInfo.email || '';
                userName = userInfo.name || '';
              }
            } catch (uErr) {
              console.warn('Could not fetch Google user info:', uErr);
            }
            resolve({
              user: { email: userEmail, displayName: userName },
              accessToken: response.access_token,
            });
          } else {
            reject(new Error('No access token received from Google authentication'));
          }
        },
        error_callback: (err: any) => {
          reject(new Error(err.message || 'Google Auth Popup closed or failed'));
        }
      });

      client.requestAccessToken({ prompt: 'consent' });
    } catch (err) {
      reject(err);
    }
  });
};

export const authenticateCEOForCalendar = async (): Promise<{ user: { email?: string; displayName?: string }; accessToken: string } | null> => {
  if (auth && provider) {
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        cachedAccessToken = credential.accessToken;
        return {
          user: { email: result.user.email || undefined, displayName: result.user.displayName || undefined },
          accessToken: cachedAccessToken
        };
      }
    } catch (err: any) {
      console.warn('Firebase signInWithPopup failed or domain unauthorized, falling back to Google Identity Services (GIS)...', err?.code || err);
    }
  }

  return await authenticateCEOWithGIS();
};

export const getCachedCalendarToken = (): string | null => {
  return cachedAccessToken;
};

export const syncAppointmentToGoogleCalendar = async (
  appointment: Appointment,
  accessToken?: string | null,
  reminderMinutes: number = 30
): Promise<boolean> => {
  const token = accessToken || cachedAccessToken;
  if (!token) {
    console.warn('No Google Calendar access token available. Skipping calendar sync.');
    return false;
  }

  try {
    const [year, month, day] = appointment.date.split('-').map(Number);
    
    let hours = 14;
    let minutes = 30;
    try {
      const match = appointment.time_slot.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (match) {
        hours = parseInt(match[1], 10);
        minutes = parseInt(match[2], 10);
        const ampm = match[3].toUpperCase();
        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
      }
    } catch (tErr) {
      console.warn('Error parsing time slot:', tErr);
    }

    const startDate = new Date(year, month - 1, day, hours, minutes, 0);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    const eventPayload = {
      summary: `MT Mansion: ${appointment.service_title} - ${appointment.client_name}`,
      description: `Boutique Appointment Request\n\nClient: ${appointment.client_name}\nTreatment: ${appointment.service_title}\nDate: ${appointment.date}\nTime: ${appointment.time_slot}\n${appointment.notes ? `Notes: ${appointment.notes}\n` : ''}Ref: ${appointment.id}`,
      start: {
        dateTime: startDate.toISOString(),
      },
      end: {
        dateTime: endDate.toISOString(),
      },
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

    if (!res.ok) {
      const errData = await res.json();
      console.error('Google Calendar API error response:', errData);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Failed to sync appointment to Google Calendar:', err);
    return false;
  }
};

export const signOutFromCalendar = () => {
  cachedAccessToken = null;
  if (auth) {
    try {
      auth.signOut();
    } catch (e) {}
  }
};
