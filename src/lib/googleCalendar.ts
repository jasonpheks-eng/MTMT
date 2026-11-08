import { Appointment } from '../types';

export const buildGoogleCalendarWebLink = (
  appointment: Appointment,
  reminderMinutes: number = 30
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

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${encodeURIComponent(dates)}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
  } catch (err) {
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('MT Mansion Appointment')}`;
  }
};

export const getCachedCalendarToken = (): string | null => null;

export const syncAppointmentToGoogleCalendar = async (
  appointment: Appointment,
  apiKey?: string | null,
  calendarId?: string | null
): Promise<{ success: boolean; webLink: string; synced: boolean }> => {
  const webLink = buildGoogleCalendarWebLink(appointment);

  try {
    const res = await fetch('/api/calendar/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointment, apiKey, calendarId }),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        webLink: data.webLink || webLink,
        synced: Boolean(data.synced),
      };
    }
  } catch (err) {
    console.warn('Calendar sync server proxy warning:', err);
  }

  return { success: true, webLink, synced: false };
};

export const signOutFromCalendar = () => {
  // No-op for direct API key / web link mode
};

