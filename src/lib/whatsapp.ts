export interface WhatsAppBookingDetails {
  boutiqueName?: string;
  clientName: string;
  serviceTitle: string;
  category?: 'nails' | 'lashes' | 'hair' | string;
  price?: number;
  currencySymbol?: string;
  date: string;
  timeSlot: string;
  bookingRef: string;
  notes?: string;
}

/**
 * Formats a clean, highly organized, luxury boutique WhatsApp message
 * with emojis, structured sections, bold headers, and styling notes.
 */
export function formatAppointmentWhatsAppMessage(details: WhatsAppBookingDetails): string {
  const brand = (details.boutiqueName || 'MT Maison').toUpperCase();
  const sym = details.currencySymbol || 'MWK';
  const priceFormatted = details.price !== undefined
    ? `${sym} ${details.price.toLocaleString()}`
    : 'Price on consultation';
  
  // Category badge & icon
  let categoryLabel = 'Bespoke Beauty';
  let categoryEmoji = '✨';
  const cat = details.category?.toLowerCase();
  if (cat === 'nails') {
    categoryLabel = 'Nails & Manicure';
    categoryEmoji = '💅';
  } else if (cat === 'lashes') {
    categoryLabel = 'Lashes & Brows';
    categoryEmoji = '👁️';
  } else if (cat === 'hair') {
    categoryLabel = 'Hair & Wig Installation';
    categoryEmoji = '💇‍♀️';
  }

  // Safe date parsing without UTC offset shifts
  let formattedDate = details.date;
  try {
    const parts = details.date.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        const d = new Date(year, month - 1, day);
        formattedDate = d.toLocaleDateString('en-US', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
      }
    }
  } catch {
    formattedDate = details.date;
  }

  const lines = [
    `✨ *APPOINTMENT BOOKING REQUEST* ✨`,
    `*${brand} LUXURY BOUTIQUE*`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    ``,
    `👤 *CLIENT DETAILS*`,
    `• *Name:* ${details.clientName}`,
    `• *Booking Reference:* #${details.bookingRef}`,
    ``,
    `${categoryEmoji} *TREATMENT RESERVED*`,
    `• *Service:* ${details.serviceTitle}`,
    `• *Category:* ${categoryLabel}`,
    `• *Estimated Fee:* ${priceFormatted}`,
    ``,
    `🗓️ *SCHEDULED APPOINTMENT*`,
    `• *Date:* ${formattedDate}`,
    `• *Time Slot:* ${details.timeSlot}`,
  ];

  if (details.notes && details.notes.trim()) {
    lines.push(
      ``,
      `📝 *CLIENT STYLING NOTES*`,
      `"${details.notes.trim()}"`
    );
  }

  lines.push(
    ``,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `_Hello ${details.boutiqueName || 'MT Maison'} team! I have submitted this appointment request on your website. Kindly confirm availability for this slot._`,
    ``,
    `Thank you! 💕`
  );

  return lines.join('\n');
}

/**
 * Builds a valid WhatsApp click-to-chat deep link URL
 */
export function buildWhatsAppUrl(phoneNumber: string, message: string): string {
  const cleanNumber = (phoneNumber || '+265 888 38 29 38').replace(/[^0-9]/g, '');
  const targetNumber = cleanNumber || '265888382938';
  return `https://wa.me/${targetNumber}?text=${encodeURIComponent(message)}`;
}
