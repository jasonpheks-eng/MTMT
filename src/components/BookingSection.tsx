import React, { useState, useMemo } from 'react';
import { useBoutique } from '../context/BoutiqueContext';
import { ServiceItem } from '../types';
import { GooeyGradientBackground } from './GooeyGradientBackground';
import { formatAppointmentWhatsAppMessage, buildWhatsAppUrl } from '../lib/whatsapp';
import { buildGoogleCalendarWebLink } from '../lib/googleCalendar';
import {
  Clock,
  CheckCircle,
  MessageCircle,
  User,
  AlertCircle,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Eye,
  Scissors,
  Layers,
  X,
} from 'lucide-react';

const NailIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 3h6v4H9z" />
    <path d="M10 7v3a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V7" />
    <path d="M8 12h8a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2z" />
    <circle cx="12" cy="16" r="1.5" fill="currentColor" />
  </svg>
);

const LashIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" />
    <circle cx="12" cy="12" r="2.5" />
    <path d="M3 7.5L1.5 5.5" />
    <path d="M7 4.5L6 2" />
    <path d="M12 3.5V1" />
    <path d="M17 4.5l1-2.5" />
    <path d="M21 7.5l1.5-2" />
  </svg>
);

const HairIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <line x1="20" y1="4" x2="8.12" y2="15.88" />
    <line x1="14.47" y1="14.48" x2="20" y2="20" />
    <line x1="8.12" y1="8.12" x2="12" y2="12" />
  </svg>
);

const getCategoryIcon = (category?: string, className = "w-4 h-4") => {
  switch (category?.toLowerCase()) {
    case 'nails':
      return <NailIcon className={className} />;
    case 'lashes':
      return <LashIcon className={className} />;
    case 'hair':
      return <HairIcon className={className} />;
    default:
      return <Sparkles className={className} />;
  }
};

export const BookingSection: React.FC = () => {
  const {
    services,
    calendarSlots,
    createAppointment,
    removeAppointment,
    settings,
    selectedServiceForBooking,
    appointments,
  } = useBoutique();

  // Collapsible Treatment Selection Menu
  const [isTreatmentMenuOpen, setIsTreatmentMenuOpen] = useState<boolean>(false);
  const [isItineraryOpen, setIsItineraryOpen] = useState<boolean>(false);

  // Category Filter for Treatments
  const [activeCategory, setActiveCategory] = useState<'all' | 'nails' | 'lashes' | 'hair'>('all');

  // Filtered Services List from Admin State
  const filteredServices = useMemo(() => {
    const list = services || [];
    if (activeCategory === 'all') return list;
    return list.filter((s) => s.category === activeCategory);
  }, [services, activeCategory]);

  // Initialize with selected service if provided
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    selectedServiceForBooking?.id || (services && services[0]?.id) || ''
  );

  // Smart useEffect to sync only when a new service is explicitly chosen from context
  React.useEffect(() => {
    if (selectedServiceForBooking && selectedServiceForBooking.id !== selectedServiceId) {
      setSelectedServiceId(selectedServiceForBooking.id);
      if (selectedServiceForBooking.category) {
        setActiveCategory(selectedServiceForBooking.category as any);
      }
    }
  }, [selectedServiceForBooking, selectedServiceId]);

  const selectedService = useMemo(() => {
    const list = services || [];
    return list.find((s) => s.id === selectedServiceId) || list[0] || null;
  }, [services, selectedServiceId]);

  // Calendar Month State (defaults to November 2026)
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date(2026, 10, 1));

  const prevMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1));
  };

  const formatDateKey = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const monthDays = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const startingDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // 0: Mon, 6: Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      days.push(dateObj);
    }
    return days;
  }, [currentMonthDate]);

  const monthName = currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const [selectedDate, setSelectedDate] = useState<string>('2026-11-12');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('02:30 PM');

  const activeSlots = useMemo(() => {
    return (calendarSlots || []).filter((s) => s.is_available !== false);
  }, [calendarSlots]);

  React.useEffect(() => {
    if (activeSlots.length > 0 && !activeSlots.some((s) => s.time === selectedTimeSlot)) {
      setSelectedTimeSlot(activeSlots[0].time);
    }
  }, [activeSlots, selectedTimeSlot]);

  // Form Fields
  const [clientName, setClientName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Status State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Formatted Selected Date Label
  const selectedDateLabel = useMemo(() => {
    try {
      const [y, m, d] = selectedDate.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  // Submission Handler
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !selectedService) {
      setErrorMessage('Please enter your name.');
      return;
    }
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const appointment = await createAppointment({
        client_name: clientName.trim(),
        client_phone: 'WhatsApp Direct',
        service_id: selectedService.id,
        service_title: selectedService.title,
        category: selectedService.category,
        date: selectedDate,
        time_slot: selectedTimeSlot,
        notes: notes.trim(),
      });

      setConfirmedBooking(appointment);
      setIsItineraryOpen(true);

      // 1. Organized WhatsApp Message
      const waText = formatAppointmentWhatsAppMessage({
        boutiqueName: settings.boutique_name,
        clientName: appointment.client_name,
        serviceTitle: appointment.service_title,
        category: selectedService.category,
        price: selectedService.price,
        currencySymbol: settings.currency_symbol,
        date: appointment.date,
        timeSlot: appointment.time_slot,
        bookingRef: appointment.id,
        notes: notes.trim(),
      });

      const waUrl = buildWhatsAppUrl(settings.whatsapp_number, waText);
      window.open(waUrl, '_blank', 'noopener,noreferrer');

      // 2. Auto-trigger Google Calendar sync window with 30-min reminder for CEO
      const targetEmail = settings.ceo_google_email || 'jasonpheks@gmail.com';
      const calUrl = buildGoogleCalendarWebLink(
        appointment,
        settings.calendar_reminder_min || 30,
        targetEmail
      );
      setTimeout(() => {
        try {
          window.open(calUrl, '_blank', 'noopener,noreferrer');
        } catch (e) {}
      }, 600);

      // Scroll smoothly to confirmation card
      setTimeout(() => {
        const itinerarySection = document.getElementById('my-bookings-section') || document.getElementById('booking');
        if (itinerarySection) {
          itinerarySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);

      setNotes('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Booking submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section 
      id="booking" 
      className="relative overflow-hidden text-white py-16 lg:py-24 px-4 sm:px-6 lg:px-8 scroll-mt-16 transition-colors duration-300"
      style={{ backgroundColor: settings.booking_bg_color || '#5b0827' }}
    >
      <div className="absolute inset-0 pointer-events-none z-0">
        <GooeyGradientBackground 
          interactive={false} 
          sensitivity={settings.booking_gooey_sensitivity}
          opacity={settings.booking_gooey_opacity}
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Simple Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold tracking-[0.25em] uppercase text-rose-300">
            Fast Boutique Reservation
          </span>
          <h2 
            className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-normal text-white mt-2"
            style={{ fontSize: '42px' }}
          >
            Make a Booking
          </h2>
          <p className="mt-3 text-sm text-rose-100/80 font-light">
            Select your desired treatment, choose a date on the boutique calendar, and confirm your request instantly on WhatsApp.
          </p>
        </div>

        {confirmedBooking ? (
          /* Simplified Confirmation Card */
          <div 
            className="max-w-xl mx-auto rounded-3xl p-8 border border-rose-400/30 shadow-2xl text-center space-y-6 animate-in fade-in"
            style={{ backgroundColor: settings.booking_card_bg_color || '#2E1222' }}
          >
            <div className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-rose-300" />
            </div>

            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-rose-300">
                Booking Ref #{confirmedBooking.id}
              </span>
              <h3 className="font-editorial text-3xl text-white mt-1">
                Appointment Requested!
              </h3>
              <p className="text-rose-100/90 text-sm mt-2">
                We've reserved <strong className="text-white">{confirmedBooking.service_title}</strong> for you on <strong className="text-white">{confirmedBooking.date}</strong> at <strong className="text-white">{confirmedBooking.time_slot}</strong>.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  const calUrl = buildGoogleCalendarWebLink(confirmedBooking, settings.calendar_reminder_min || 30, settings.ceo_google_email || 'jasonpheks@gmail.com');
                  window.open(calUrl, '_blank', 'noopener,noreferrer');
                }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer"
              >
                <CalendarIcon className="w-4 h-4 text-blue-200" />
                <span>Add to Google Calendar ↗</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const confirmedService = services.find(s => s.id === confirmedBooking.service_id);
                  const waText = formatAppointmentWhatsAppMessage({
                    boutiqueName: settings.boutique_name,
                    clientName: confirmedBooking.client_name,
                    serviceTitle: confirmedBooking.service_title,
                    category: confirmedBooking.category,
                    price: confirmedService?.price,
                    currencySymbol: settings.currency_symbol,
                    date: confirmedBooking.date,
                    timeSlot: confirmedBooking.time_slot,
                    bookingRef: confirmedBooking.id,
                    notes: confirmedBooking.notes,
                  });
                  const waUrl = buildWhatsAppUrl(settings.whatsapp_number, waText);
                  window.open(waUrl, '_blank', 'noopener,noreferrer');
                }}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Open WhatsApp ↗</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmedBooking(null);
                  setClientName('');
                  setNotes('');
                }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-full border border-white/20 hover:bg-white/10 text-white text-xs transition-colors cursor-pointer"
              >
                Book Another
              </button>
            </div>
          </div>
        ) : (
          /* Streamlined 2-Column Booking Layout with Visual Calendar */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            
            {/* Left Column: Calendar Date Selection first, then Treatment Selection */}
            <div 
              className="lg:col-span-7 rounded-3xl p-5 sm:p-8 border border-white/10 shadow-xl space-y-6 transition-colors duration-300"
              style={{ backgroundColor: settings.booking_card_bg_color || '#111010' }}
            >
              
              {/* Step 1: The Visual Calendar & Time Slots */}
              <div className="space-y-4">
                
                {/* Calendar Month Header & Controls */}
                <div className="pb-2 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-rose-300" />
                    <h3 className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-rose-200">
                      1. SELECT DATE
                    </h3>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <span className="text-sm font-editorial font-medium text-white tracking-wide">
                      {monthName}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={prevMonth}
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center justify-center"
                        aria-label="Previous Month"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={nextMonth}
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center justify-center"
                        aria-label="Next Month"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Weekday Column Headers */}
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-mono text-rose-300/70 uppercase">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>

                {/* Calendar Days Grid */}
                <div className="grid grid-cols-7 gap-1.5 p-1.5 sm:p-2 rounded-2xl bg-black/30 border border-white/10">
                  {monthDays.map((d, index) => {
                    if (!d) {
                      return <div key={`empty-${index}`} className="aspect-square" />;
                    }
                    const dateKey = formatDateKey(d);
                    const isSelected = selectedDate === dateKey;
                    const isPast = d < new Date(2026, 10, 5); // disable past demo dates

                    return (
                      <button
                        key={dateKey}
                        type="button"
                        disabled={isPast}
                        onClick={() => setSelectedDate(dateKey)}
                        className={`aspect-square min-h-[44px] rounded-xl flex flex-col items-center justify-center font-mono text-xs sm:text-sm transition-all ${
                          isSelected
                            ? 'bg-[#C45266] text-white font-bold shadow-lg ring-2 ring-white/60'
                            : isPast
                            ? 'text-white/20 cursor-not-allowed'
                            : 'text-rose-100 hover:bg-white/15 hover:text-white'
                        }`}
                        style={isSelected ? { backgroundColor: settings.hero_accent_color || '#C45266' } : {}}
                      >
                        <span>{d.getDate()}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Time Slot Selection */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-rose-300 mb-3 font-medium">
                    <span>Available Slots on {selectedDateLabel}:</span>
                    <span className="text-white font-bold">{selectedTimeSlot}</span>
                  </div>

                  {activeSlots.length === 0 ? (
                    <div className="py-8 px-4 rounded-2xl bg-black/30 border border-white/10 text-center text-xs text-rose-200/70">
                      No online slots currently open for this date. Please message us on WhatsApp for personal scheduling.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {activeSlots.map((slot) => (
                        <button
                          key={slot.time}
                          type="button"
                          onClick={() => setSelectedTimeSlot(slot.time)}
                          className={`min-h-[44px] py-2 px-3 rounded-xl font-mono text-xs border text-center transition-all flex items-center justify-center gap-1.5 ${
                            selectedTimeSlot === slot.time
                              ? 'text-white border-white font-bold shadow-lg'
                              : 'bg-black/25 border-white/10 text-rose-200 hover:border-rose-400/40'
                          }`}
                          style={{ 
                            fontFamily: 'Verdana, sans-serif',
                            backgroundColor: selectedTimeSlot === slot.time ? (settings.hero_accent_color || '#C45266') : undefined
                          }}
                        >
                          <Clock className="w-3.5 h-3.5 opacity-70" />
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Step 2: Treatment Selection Header */}
              <div className="pt-4 border-t border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-rose-200">
                      2. Select Treatment
                    </h3>
                    <span className="text-[10px] text-rose-300/70">
                      Choose your preferred beauty service
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsTreatmentMenuOpen(!isTreatmentMenuOpen)}
                    className="h-10 px-4 rounded-full text-white text-xs font-medium transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                    style={{ backgroundColor: settings.hero_accent_color || '#C45266' }}
                  >
                    <span>{isTreatmentMenuOpen ? 'Hide Menu' : 'Browse Treatments'}</span>
                    {isTreatmentMenuOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Selected Treatment Display Card (Clickable) */}
                <div
                  onClick={() => setIsTreatmentMenuOpen(!isTreatmentMenuOpen)}
                  className="p-4 rounded-2xl border border-white/20 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group shadow-md"
                  style={{ backgroundColor: `${settings.hero_accent_color || '#C45266'}22` }}
                  title="Click to view all treatments"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div 
                      className="w-12 h-12 rounded-xl text-white flex items-center justify-center shrink-0 shadow-lg"
                      style={{ backgroundColor: settings.hero_accent_color || '#C45266' }}
                    >
                      {getCategoryIcon(selectedService?.category, "w-6 h-6 text-white")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span 
                          className="uppercase tracking-widest text-rose-300 font-semibold"
                          style={{ fontSize: '11px', fontFamily: 'Arial' }}
                        >
                          Chosen Treatment
                        </span>
                      </div>
                      <h4 className="text-base sm:text-lg font-semibold text-white truncate mt-0.5 group-hover:text-rose-200 transition-colors">
                        {selectedService ? selectedService.title : 'Choose a treatment'}
                      </h4>
                      <div className="text-xs text-rose-200/90 font-mono mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                        {selectedService ? (
                          <>
                            <span 
                              className="font-bold text-white text-sm"
                              style={{ fontFamily: 'monospace' }}
                            >
                              {settings.currency_symbol || 'MWK'} {selectedService.price ? selectedService.price.toLocaleString() : 0}
                            </span>
                            <span className="opacity-40">·</span>
                            <span className="font-medium">{selectedService.duration_min} mins</span>
                            {selectedService.description && (
                              <>
                                <span className="opacity-40 hidden sm:inline">·</span>
                                <span 
                                  className="font-sans text-rose-100/70 truncate max-w-[200px] sm:max-w-xs block sm:inline"
                                >
                                  {selectedService.description}
                                </span>
                              </>
                            )}
                          </>
                        ) : (
                          <span>Click to view and select from boutique menu</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-white/10 shrink-0">
                    {selectedService && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedServiceId('');
                          setIsTreatmentMenuOpen(true);
                        }}
                        className="h-10 px-3 rounded-xl bg-black/40 hover:bg-red-950/60 text-rose-300 hover:text-white text-xs font-medium border border-white/10 transition-all flex items-center justify-center gap-1.5"
                        title="Clear selected treatment"
                      >
                        <X className="w-4 h-4" />
                        <span>Deselect</span>
                      </button>
                    )}
                    <div className="flex items-center gap-1.5 h-10 px-4 rounded-xl bg-white/10 group-hover:bg-white/20 text-rose-200 text-xs font-medium transition-all flex-1 sm:flex-none justify-center">
                      <span>{isTreatmentMenuOpen ? 'Close' : 'Change'}</span>
                      {isTreatmentMenuOpen ? (
                        <ChevronUp className="w-4 h-4 text-rose-300" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-rose-300" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Collapsible Treatments Menu - Shows on click */}
                {isTreatmentMenuOpen && (
                  <div className="space-y-4 pt-1 animate-in fade-in slide-in-from-top-2 duration-300 border-t border-white/10 pt-4">
                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-2 px-2">
                      {[
                        { id: 'all', label: 'All Treatments', icon: <Layers className="w-3.5 h-3.5" /> },
                        { id: 'nails', label: 'Nails', icon: <NailIcon className="w-3.5 h-3.5 text-rose-300" /> },
                        { id: 'lashes', label: 'Lashes', icon: <LashIcon className="w-3.5 h-3.5 text-rose-300" /> },
                        { id: 'hair', label: 'Wig Installation', icon: <HairIcon className="w-3.5 h-3.5 text-rose-300" /> },
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setActiveCategory(cat.id as any)}
                          className={`h-10 px-4 rounded-full text-xs font-medium flex items-center gap-2 whitespace-nowrap transition-all border shrink-0 ${
                            activeCategory === cat.id
                              ? 'text-white font-semibold shadow-lg ring-2 ring-white/20 border-white'
                              : 'bg-black/30 border-white/10 text-rose-200/80 hover:bg-white/10 hover:text-white'
                          }`}
                          style={activeCategory === cat.id ? { backgroundColor: settings.hero_accent_color || '#C45266' } : {}}
                        >
                          {cat.icon}
                          <span>{cat.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Treatments Selection List */}
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                      {filteredServices.length === 0 ? (
                        <div className="py-12 text-center text-rose-300/60 text-xs font-light">
                          No treatments currently listed in this category.
                        </div>
                      ) : (
                        filteredServices.map((service) => {
                          const isSelected = selectedService?.id === service.id;
                          return (
                            <button
                              key={service.id}
                              type="button"
                              onClick={() => {
                                setSelectedServiceId(service.id);
                                setIsTreatmentMenuOpen(false); // Collapses menu to show chosen treatment!
                              }}
                              className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                                isSelected
                                  ? 'border-white text-white shadow-xl ring-2 ring-white/30'
                                  : 'bg-black/25 border-white/10 text-rose-100 hover:border-rose-400/40 hover:bg-black/35'
                              }`}
                              style={isSelected ? { backgroundColor: settings.hero_accent_color || '#C45266' } : {}}
                            >
                              <div className="flex items-center gap-4 min-w-0 flex-1">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${isSelected ? 'bg-white/20 text-white' : 'bg-black/40 text-rose-300'}`}>
                                  {getCategoryIcon(service.category, "w-5 h-5")}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-sm sm:text-base text-white truncate">
                                      {service.title}
                                    </h4>
                                    {service.is_popular && (
                                      <span className="text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/20 text-white font-sans shrink-0 border border-white/10">
                                        Popular
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-rose-100/70 truncate mt-1 font-light">
                                    {service.description || `${service.duration_min} mins treatment`}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 shrink-0">
                                <div className="text-right font-mono">
                                  <span className="text-sm sm:text-base font-bold text-white">{settings.currency_symbol || 'MWK'} {service.price ? service.price.toLocaleString() : 0}</span>
                                  <span className="block text-[10px] text-rose-200 opacity-80 mt-0.5">{service.duration_min}m</span>
                                </div>
                                <div
                                  className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                                    isSelected
                                      ? 'bg-white text-rose-600 border-white shadow-inner'
                                      : 'border-white/30 bg-transparent'
                                  }`}
                                  style={isSelected ? { color: settings.hero_accent_color || '#C45266' } : {}}
                                >
                                  {isSelected && <Check className="w-4 h-4" />}
                                </div>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Right Column: Reservation Details & WhatsApp Request */}
            <div className="lg:col-span-5 bg-gradient-to-br from-[#b43859] to-[#701932] rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl backdrop-blur-md space-y-6 lg:sticky lg:top-24"
                 style={{ backgroundImage: `linear-gradient(to bottom right, ${settings.hero_accent_color || '#b43859'}ee, ${settings.booking_bg_color || '#701932'}ff)` }}>
              
              <div className="border-b border-white/10 pb-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-rose-100">
                  3. Your Details
                </h3>
                <p className="text-xs text-rose-200/70 mt-1">
                  We'll prepare your request and open WhatsApp directly with all details filled in.
                </p>
              </div>

              {errorMessage && (
                <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/50 text-red-100 text-xs flex items-center gap-2 animate-shake">
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleBookingSubmit} className="space-y-5">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-rose-200 mb-1.5 font-semibold px-1">
                    Your Full Name *
                  </label>
                  <div className="relative group">
                    <User className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-rose-400 transition-colors" />
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Sophia Vance"
                      className="w-full min-h-[48px] bg-white text-neutral-900 border border-white/20 rounded-2xl pl-12 pr-4 py-3 text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-rose-400/50 shadow-inner"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-rose-200 mb-1.5 font-semibold px-1">
                    Styling Notes (Optional)
                  </label>
                  <div className="relative group">
                    <MessageCircle className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-rose-400 transition-colors" />
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Soft almond shape, French chrome line..."
                      className="w-full min-h-[48px] bg-white text-neutral-900 border border-white/20 rounded-2xl pl-12 pr-4 py-3 text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-rose-400/50 shadow-inner"
                    />
                  </div>
                </div>

                {/* Live Selection Summary */}
                {selectedService && (
                  <div className="p-5 rounded-2xl bg-black/25 border border-white/15 text-xs space-y-3 backdrop-blur-md">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <span className="uppercase tracking-widest text-[10px] font-bold text-rose-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> Request Overview
                      </span>
                      <span className="text-[10px] font-medium text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" /> WhatsApp Ready
                      </span>
                    </div>

                    <div className="flex justify-between items-start gap-4 text-rose-200">
                      <span className="uppercase tracking-widest text-[9px] font-bold opacity-70 shrink-0 mt-0.5">Service</span>
                      <span className="text-white font-semibold text-right leading-tight">{selectedService.title}</span>
                    </div>
                    <div className="flex justify-between items-start gap-4 text-rose-200">
                      <span className="uppercase tracking-widest text-[9px] font-bold opacity-70 shrink-0 mt-0.5">Category</span>
                      <span className="text-white font-medium text-right capitalize">{selectedService.category}</span>
                    </div>
                    <div className="flex justify-between items-start gap-4 text-rose-200">
                      <span className="uppercase tracking-widest text-[9px] font-bold opacity-70 shrink-0 mt-0.5">Schedule</span>
                      <span className="text-white font-medium text-right leading-tight">{selectedDateLabel} @ {selectedTimeSlot}</span>
                    </div>
                    {clientName.trim() && (
                      <div className="flex justify-between items-start gap-4 text-rose-200">
                        <span className="uppercase tracking-widest text-[9px] font-bold opacity-70 shrink-0 mt-0.5">Client</span>
                        <span className="text-white font-medium text-right">{clientName.trim()}</span>
                      </div>
                    )}
                    {notes.trim() && (
                      <div className="flex justify-between items-start gap-4 text-rose-200">
                        <span className="uppercase tracking-widest text-[9px] font-bold opacity-70 shrink-0 mt-0.5">Notes</span>
                        <span className="text-white/90 italic text-right text-[11px] truncate max-w-[180px]">"{notes.trim()}"</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center gap-4 text-rose-200 pt-3 border-t border-white/10">
                      <span className="uppercase tracking-widest text-[9px] font-bold opacity-70 shrink-0">Total Fee</span>
                      <span className="text-white font-bold text-base">{settings.currency_symbol || 'MWK'} {selectedService.price ? selectedService.price.toLocaleString() : 0}</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full min-h-[56px] rounded-full bg-[#34A853] hover:bg-[#2e9449] text-white font-bold text-sm tracking-widest uppercase transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2.5 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed group"
                >
                  <MessageCircle className="w-5 h-5 text-white group-hover:rotate-12 transition-transform" />
                  <span>{isSubmitting ? 'Securing Slot...' : 'Request via WhatsApp ↗'}</span>
                </button>
              </form>

              {/* Step 4: My Bookings */}
              {appointments.length > 0 && (
                <div id="my-bookings-section" className="pt-6 border-t border-white/10 animate-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-rose-200 mb-4 px-1">
                    4. My Bookings
                  </h3>
                  <div className="space-y-3">
                    {appointments.slice(0, 3).map((apt) => (
                      <div key={apt.id} className="p-4 rounded-2xl bg-black/20 border border-white/5 text-xs text-rose-100 relative group hover:bg-black/30 transition-colors">
                        <div className="flex justify-between font-bold text-white mb-1 pr-8">
                          <span className="truncate">{apt.service_title}</span>
                          <button
                            onClick={() => removeAppointment(apt.id)}
                            className="absolute top-4 right-4 text-rose-300/50 hover:text-white transition-colors p-1"
                            title="Delete booking"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="opacity-70 flex items-center gap-1.5 mt-1">
                          <CalendarIcon className="w-3 h-3" />
                          <span>{apt.date} at {apt.time_slot}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </section>
  );
};
