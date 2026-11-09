import React, { useState, useMemo } from 'react';
import { useBoutique } from '../../../context/BoutiqueContext';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
  List,
  LayoutGrid,
  Info,
  Sparkles
} from 'lucide-react';
import { Appointment } from '../../../types';

export const TabBookingsCalendar: React.FC = () => {
  const { appointments, updateAppointmentStatus, removeAppointment, settings } = useBoutique();
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date(2026, 10, 1)); // Default to Nov 2026 for demo
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed': return 'text-emerald-500 bg-emerald-50 border-emerald-200';
      case 'completed': return 'text-blue-500 bg-blue-50 border-blue-200';
      case 'cancelled': return 'text-rose-500 bg-rose-50 border-rose-200';
      default: return 'text-pink-500 bg-pink-50 border-pink-200';
    }
  };

  const handleStatusChange = async (id: string, status: Appointment['status']) => {
    await updateAppointmentStatus(id, status);
  };

  const handleRemove = (id: string) => {
    removeAppointment(id);
  };

  const openWhatsApp = (phone: string, name: string, service: string, date: string, time: string) => {
    const cleanNumber = phone.replace(/[^0-9]/g, '');
    const message = `Hi ${name}, this is ${settings.boutique_name}. We're confirming your ${service} appointment on ${date} at ${time}.`;
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Calendar logic
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; 

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      const dateString = date.toISOString().split('T')[0];
      const dayAppointments = appointments.filter(a => a.date === dateString);
      days.push({ day: i, dateString, appointments: dayAppointments });
    }
    return days;
  }, [currentDate, appointments]);

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const sortedAppointments = [...appointments].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time_slot.split(' - ')[0]}`);
    const dateB = new Date(`${b.date}T${b.time_slot.split(' - ')[0]}`);
    return dateB.getTime() - dateA.getTime();
  });

  const selectedDayBookings = useMemo(() => {
    if (!selectedDay) return [];
    return appointments.filter(a => a.date === selectedDay).sort((a, b) => a.time_slot.localeCompare(b.time_slot));
  }, [selectedDay, appointments]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.8)] animate-pulse" />
            <span className="text-[9px] sm:text-[10px] text-pink-400 uppercase tracking-[0.2em] sm:tracking-[0.3em] font-bold">Live Management</span>
          </div>
          <h3 className="font-editorial text-3xl sm:text-4xl text-white tracking-tight leading-none">Booking Concierge</h3>
          <p className="text-xs sm:text-sm text-white/70 mt-2 font-light">
            Elegantly tracking and managing your boutique's schedule.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-white/10 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-white/20 shrink-0 self-start shadow-xl backdrop-blur-sm">
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all ${
              viewMode === 'calendar' 
                ? 'bg-white text-pink-600 shadow-lg scale-105' 
                : 'text-white hover:bg-white/10'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Calendar</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all ${
              viewMode === 'list' 
                ? 'bg-white text-pink-600 shadow-lg scale-105' 
                : 'text-white hover:bg-white/10'
            }`}
          >
            <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>All Bookings</span>
          </button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="space-y-6 sm:space-y-8">
          {/* Calendar Controller */}
          <div className="flex items-center justify-between bg-white/10 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border border-white/20 shadow-2xl backdrop-blur-md">
            <h4 className="font-editorial text-xl sm:text-3xl text-white tracking-wide">{monthName}</h4>
            <div className="flex items-center gap-2 sm:gap-3">
              <button 
                onClick={prevMonth} 
                className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white/5 hover:bg-white/20 rounded-full transition-all text-white border border-white/10 group active:scale-90"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <button 
                onClick={nextMonth} 
                className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white/5 hover:bg-white/20 rounded-full transition-all text-white border border-white/10 group active:scale-90"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-4 md:gap-6">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="text-center py-1 sm:py-2 text-[9px] sm:text-[11px] font-bold uppercase tracking-wider sm:tracking-[0.2em] text-pink-400/80">
                {day}
              </div>
            ))}
            
            {calendarDays.map((item, idx) => {
              if (!item) return <div key={`empty-${idx}`} className="aspect-square bg-white/[0.02] rounded-lg sm:rounded-2xl border border-white/[0.05] opacity-20" />;
              
              const isSelected = selectedDay === item.dateString;
              const hasBookings = item.appointments.length > 0;
              const isToday = item.dateString === new Date().toISOString().split('T')[0];

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDay(isSelected ? null : item.dateString)}
                  className={`relative aspect-square rounded-xl sm:rounded-[1.5rem] border-2 transition-all group flex flex-col items-center justify-center gap-0.5 sm:gap-1 shadow-lg ${
                    isSelected 
                      ? 'bg-white border-pink-400 scale-105 z-10 shadow-pink-500/20' 
                      : isToday
                      ? 'bg-pink-500/10 border-pink-500/40 text-white ring-2 ring-pink-500/20'
                      : 'bg-white/5 border-white/10 hover:border-white/40 hover:bg-white/15'
                  }`}
                >
                  <span className={`text-xs sm:text-lg font-bold font-mono transition-colors ${
                    isSelected ? 'text-pink-600' : 'text-white'
                  }`}>
                    {item.day}
                  </span>
                  
                  {isToday && !isSelected && (
                    <span className="text-[7px] sm:text-[9px] uppercase font-black text-pink-400 tracking-tighter">Today</span>
                  )}

                  <div className="flex items-center justify-center gap-0.5 sm:gap-1 min-h-[4px] sm:min-h-[6px] mt-0.5 sm:mt-1">
                    {item.appointments.length > 0 && (
                      <div className={`flex gap-0.5 sm:gap-1 ${isSelected ? 'opacity-100' : 'opacity-80'}`}>
                        {item.appointments.slice(0, 3).map((a, i) => (
                          <div 
                            key={i} 
                            className={`w-1 h-1 sm:w-2 sm:h-2 rounded-full border border-white/20 ${
                              isSelected ? 'bg-pink-600' : 
                              a.status === 'confirmed' ? 'bg-emerald-400' : 
                              a.status === 'cancelled' ? 'bg-rose-400' : 'bg-pink-400'
                            }`} 
                          />
                        ))}
                        {item.appointments.length > 3 && (
                          <span className={`text-[7px] sm:text-[9px] font-bold ${isSelected ? 'text-pink-600' : 'text-white/40'}`}>+</span>
                        )}
                      </div>
                    )}
                  </div>

                  {isSelected && (
                    <div className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 w-3.5 h-3.5 sm:w-5 sm:h-5 bg-pink-500 rounded-full border border-white shadow-lg flex items-center justify-center">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-ping" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Day Bookings Detail Overlay */}
          {selectedDay && (
            <div className="animate-in slide-in-from-top-8 fade-in duration-500 pt-4 sm:pt-6">
              <div className="bg-white rounded-3xl sm:rounded-[2.5rem] border-0 overflow-hidden shadow-[0_32px_80px_-20px_rgba(0,0,0,0.6)] ring-1 ring-white/20">
                <div className="px-5 py-5 sm:px-8 sm:py-7 border-b border-pink-100 flex items-center justify-between bg-gradient-to-r from-pink-50 via-white to-white">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-pink-600 flex items-center justify-center shadow-pink-200 shadow-2xl scale-100 sm:scale-110">
                      <CalendarIcon className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <div className="ml-1 sm:ml-2">
                      <h5 className="font-editorial text-lg sm:text-3xl text-pink-950 leading-none">
                        {new Date(selectedDay).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </h5>
                      <p className="text-[9px] sm:text-[11px] text-pink-600 font-black uppercase tracking-wider sm:tracking-[0.2em] mt-1 sm:mt-2">
                        {selectedDayBookings.length} {selectedDayBookings.length === 1 ? 'Guest Request' : 'Guest Requests'}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedDay(null)} 
                    className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center hover:bg-pink-100 rounded-full text-pink-300 hover:text-pink-600 transition-all active:scale-90"
                  >
                    <XCircle className="w-6 h-6 sm:w-7 sm:h-7" />
                  </button>
                </div>
                
                <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 max-h-[500px] sm:max-h-[600px] overflow-y-auto bg-white/60 backdrop-blur-md">
                  {selectedDayBookings.length === 0 ? (
                    <div className="text-center py-16 sm:py-20 opacity-40">
                      <Info className="w-12 h-12 sm:w-16 h-16 text-pink-200 mx-auto mb-4 sm:mb-6" />
                      <p className="text-xl sm:text-2xl text-pink-900 font-editorial italic">The schedule is open for this date.</p>
                    </div>
                  ) : (
                    selectedDayBookings.map(apt => (
                      <BookingCard 
                        key={apt.id} 
                        apt={apt} 
                        getStatusColor={getStatusColor} 
                        handleStatusChange={handleStatusChange} 
                        handleRemove={handleRemove} 
                        openWhatsApp={openWhatsApp}
                        isLight
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 animate-in fade-in duration-500">
          {sortedAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 sm:p-24 bg-white/5 border border-white/10 rounded-3xl sm:rounded-[3rem] text-center shadow-inner">
              <CalendarIcon className="w-16 h-16 sm:w-20 sm:h-20 text-white/5 mb-6 sm:mb-8" />
              <h4 className="font-editorial text-2xl sm:text-3xl text-white">Your Concierge is Ready</h4>
              <p className="text-xs sm:text-sm text-white/40 mt-3 font-light">New guest appointments will appear here as they are requested.</p>
            </div>
          ) : (
            sortedAppointments.map((apt) => (
              <BookingCard 
                key={apt.id} 
                apt={apt} 
                getStatusColor={getStatusColor} 
                handleStatusChange={handleStatusChange} 
                handleRemove={handleRemove} 
                openWhatsApp={openWhatsApp}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

interface BookingCardProps {
  apt: Appointment;
  getStatusColor: (status: Appointment['status']) => string;
  handleStatusChange: (id: string, status: Appointment['status']) => void;
  handleRemove: (id: string) => void;
  openWhatsApp: (phone: string, name: string, service: string, date: string, time: string) => void;
  isLight?: boolean;
}

const BookingCard: React.FC<BookingCardProps> = ({ 
  apt, 
  getStatusColor, 
  handleStatusChange, 
  handleRemove, 
  openWhatsApp, 
  isLight 
}) => {
  const cardBg = isLight ? 'bg-white border-pink-100 shadow-xl' : 'bg-white/10 border-white/20 shadow-2xl';
  const textColor = isLight ? 'text-pink-950' : 'text-white';
  const subTextColor = isLight ? 'text-pink-600' : 'text-white/70';
  const labelColor = isLight ? 'text-pink-400' : 'text-white/40';

  return (
    <div className={`p-5 sm:p-8 rounded-3xl sm:rounded-[2.5rem] border transition-all group ${cardBg} hover:shadow-2xl hover:translate-y-[-2px] duration-300`}>
      <div className="flex flex-col md:flex-row items-stretch md:items-start justify-between gap-6 sm:gap-8">
        <div className="space-y-5 sm:space-y-6 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <span className={`px-3 sm:px-5 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-[11px] font-black uppercase tracking-wider sm:tracking-[0.2em] border shadow-sm ${getStatusColor(apt.status)}`}>
                {apt.status}
              </span>
              <span className={`text-[10px] sm:text-xs font-mono font-bold ${labelColor}`}>{apt.id}</span>
            </div>
            <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider sm:tracking-[0.2em] ${labelColor} text-right`}>
              {new Date(apt.created_at).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl flex items-center justify-center shrink-0 border shadow-inner transition-all group-hover:scale-105 duration-500 ${
              isLight ? 'bg-pink-50 border-pink-100 text-pink-600' : 'bg-white/10 border-white/10 text-pink-400'
            }`}>
              <User className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div className="min-w-0">
              <h4 className={`text-lg sm:text-2xl font-bold tracking-tight truncate ${textColor}`}>{apt.client_name}</h4>
              <div className="flex flex-wrap items-center gap-3 sm:gap-5 mt-1 sm:mt-2">
                <button 
                  onClick={() => window.open(`tel:${apt.client_phone}`)}
                  className={`text-[11px] sm:text-sm font-bold flex items-center gap-1.5 transition-colors ${subTextColor} hover:text-pink-500`}
                >
                  <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="truncate">{apt.client_phone}</span>
                </button>
                {apt.client_email && (
                  <span className={`text-[11px] sm:text-sm flex items-center gap-1.5 ${subTextColor}`}>
                    <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="truncate">{apt.client_email}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className={`grid grid-cols-2 gap-4 sm:gap-8 py-4 sm:py-5 border-y ${isLight ? 'border-pink-50' : 'border-white/10'}`}>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 ${isLight ? 'bg-pink-50 text-pink-600' : 'bg-pink-500/20 text-pink-400'}`}>
                <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <p className={`text-[8px] sm:text-[10px] uppercase font-black tracking-widest ${labelColor}`}>Date</p>
                <span className={`text-xs sm:text-base font-bold truncate ${textColor}`}>{new Date(apt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 ${isLight ? 'bg-pink-50 text-pink-600' : 'bg-pink-500/20 text-pink-400'}`}>
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <p className={`text-[8px] sm:text-[10px] uppercase font-black tracking-widest ${labelColor}`}>Time</p>
                <span className={`text-xs sm:text-base font-bold truncate ${textColor}`}>{apt.time_slot}</span>
              </div>
            </div>
          </div>

          <div className={`p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border ${isLight ? 'bg-pink-50/30 border-pink-100' : 'bg-black/20 border-white/5'}`}>
            <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-pink-600 flex items-center justify-center shadow-lg shrink-0">
                  <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                </div>
                <span className={`text-[11px] sm:text-sm font-black uppercase tracking-tighter truncate ${textColor}`}>{apt.service_title}</span>
              </div>
              <span className="text-[8px] sm:text-[10px] text-white bg-pink-600 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase font-black tracking-widest shadow-md shrink-0">
                {apt.category}
              </span>
            </div>
            {apt.notes && (
              <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border ${
                isLight ? 'bg-white text-pink-900 border-pink-100 shadow-sm' : 'bg-white/5 text-white/80 border-white/5'
              }`}>
                <p className="text-[11px] sm:text-xs italic leading-relaxed font-medium">"{apt.notes}"</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-row md:flex-col gap-3 sm:gap-4 shrink-0 justify-center">
          <div className="flex flex-row md:flex-col gap-2">
            <button
              onClick={() => handleStatusChange(apt.id, 'confirmed')}
              disabled={apt.status === 'confirmed'}
              className={`p-3 sm:p-4 rounded-xl sm:rounded-[1.5rem] transition-all shadow-lg ${apt.status === 'confirmed' ? 'bg-emerald-500 text-white opacity-40' : 'bg-white text-emerald-600 hover:bg-emerald-50 border border-emerald-100 hover:scale-105 active:scale-95'}`}
              title="Confirm Booking"
            >
              <CheckCircle2 className="w-5 h-5 sm:w-7 sm:h-7" />
            </button>
            <button
              onClick={() => handleStatusChange(apt.id, 'cancelled')}
              disabled={apt.status === 'cancelled'}
              className={`p-3 sm:p-4 rounded-xl sm:rounded-[1.5rem] transition-all shadow-lg ${apt.status === 'cancelled' ? 'bg-rose-500 text-white opacity-40' : 'bg-white text-rose-600 hover:bg-rose-50 border border-rose-100 hover:scale-105 active:scale-95'}`}
              title="Cancel Booking"
            >
              <XCircle className="w-5 h-5 sm:w-7 sm:h-7" />
            </button>
          </div>
          
          <div className={`w-px h-auto md:w-full md:h-px my-1 sm:my-2 ${isLight ? 'bg-pink-100' : 'bg-white/10'}`} />
          
          <div className="flex flex-row md:flex-col gap-2">
            <button
              onClick={() => openWhatsApp(apt.client_phone, apt.client_name, apt.service_title, apt.date, apt.time_slot)}
              className="p-3 sm:p-4 rounded-xl sm:rounded-[1.5rem] bg-[#25D366] text-white hover:bg-[#1fb355] shadow-xl hover:scale-105 transition-all active:scale-95 flex items-center justify-center"
              title="Contact on WhatsApp"
            >
              <MessageSquare className="w-5 h-5 sm:w-7 sm:h-7" />
            </button>
            <button
              onClick={() => handleRemove(apt.id)}
              className="p-3 sm:p-4 rounded-xl sm:rounded-[1.5rem] bg-white text-rose-500 hover:bg-rose-50 border border-rose-200 hover:scale-105 transition-all shadow-lg active:scale-95 flex items-center justify-center"
              title="Delete Permanently"
            >
              <Trash2 className="w-5 h-5 sm:w-7 sm:h-7" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
