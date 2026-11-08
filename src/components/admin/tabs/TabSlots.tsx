import React, { useState } from 'react';
import { Clock, Plus, Trash2 } from 'lucide-react';
import { CalendarTimeSlot } from '../../../types';

interface TabSlotsProps {
  slotsList: CalendarTimeSlot[];
  setSlotsList: React.Dispatch<React.SetStateAction<CalendarTimeSlot[]>>;
  updateCalendarSlots: (slots: CalendarTimeSlot[]) => Promise<any>;
  showSuccessNotice: (msg: string) => void;
}

export const TabSlots: React.FC<TabSlotsProps> = ({
  slotsList,
  setSlotsList,
  updateCalendarSlots,
  showSuccessNotice,
}) => {
  const [newSlotTime, setNewSlotTime] = useState('');
  const [newSlotPeriod, setNewSlotPeriod] = useState<'morning' | 'afternoon' | 'evening'>('afternoon');

  const handleAddSlot = async () => {
    if (!newSlotTime.trim()) {
      alert('Please enter a time slot, e.g. 03:30 PM');
      return;
    }
    const cleanTime = newSlotTime.trim();
    if (slotsList.some((s) => s.time.toLowerCase() === cleanTime.toLowerCase())) {
      alert(`A time slot for "${cleanTime}" already exists.`);
      return;
    }
    const newSlot: CalendarTimeSlot = {
      time: cleanTime,
      period: newSlotPeriod,
      is_available: true,
    };
    const updated = [...slotsList, newSlot];
    setSlotsList(updated);
    try {
      await updateCalendarSlots(updated);
      setNewSlotTime('');
      showSuccessNotice(`Added new time slot "${newSlot.time}"!`);
    } catch {
      alert('Failed to save new time slot');
    }
  };

  const handleDeleteSlot = async (index: number) => {
    const slotToDelete = slotsList[index];
    const updated = slotsList.filter((_, i) => i !== index);
    setSlotsList(updated);
    try {
      await updateCalendarSlots(updated);
      showSuccessNotice(`Removed time slot "${slotToDelete.time}"`);
    } catch {
      console.error('Failed to delete time slot');
    }
  };

  const handleUpdateSlotField = (index: number, partial: Partial<CalendarTimeSlot>) => {
    const updated = [...slotsList];
    updated[index] = { ...updated[index], ...partial };
    setSlotsList(updated);
  };

  const handleResetDefaultSlots = async () => {
    const defaultSlots: CalendarTimeSlot[] = [
      { time: '10:00 AM', period: 'morning', is_available: true },
      { time: '11:30 AM', period: 'morning', is_available: true },
      { time: '01:00 PM', period: 'afternoon', is_available: true },
      { time: '02:30 PM', period: 'afternoon', is_available: true },
      { time: '04:00 PM', period: 'afternoon', is_available: true },
      { time: '05:30 PM', period: 'evening', is_available: true },
      { time: '07:00 PM', period: 'evening', is_available: true },
    ];
    setSlotsList(defaultSlots);
    try {
      await updateCalendarSlots(defaultSlots);
      showSuccessNotice('Reset slots to standard boutique schedule!');
    } catch {
      console.error('Failed to reset time slots');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-editorial text-2xl text-white">Daily Booking Slots & Schedule</h3>
          <p className="text-xs text-white/60 mt-0.5">
            Add, edit times, customize periods, toggle availability, or delete slots. Changes broadcast instantly.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaultSlots}
            className="px-3.5 py-1.5 rounded-xl border border-white/20 hover:bg-white/10 text-white/80 text-xs transition-colors cursor-pointer"
            title="Restore standard boutique operating hours"
          >
            Reset Defaults
          </button>
        </div>
      </div>

      {/* Add New Time Slot Form */}
      <div className="p-4 rounded-2xl bg-white/5 border border-white/20 space-y-3 shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-2 text-white text-xs font-semibold uppercase tracking-wider">
          <Plus className="w-4 h-4 text-white/80" />
          <span>Add New Time Slot</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-5">
            <label className="block text-[11px] uppercase tracking-wider text-white/60 mb-1">
              Slot Time *
            </label>
            <div className="relative">
              <Clock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-white/60" />
              <input
                type="text"
                value={newSlotTime}
                onChange={(e) => setNewSlotTime(e.target.value)}
                placeholder="e.g. 03:30 PM, 12:15 PM"
                className="w-full bg-white/5 border border-white/20 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-white/30 font-mono focus:outline-none focus:border-white/50"
              />
            </div>
          </div>

          <div className="sm:col-span-4">
            <label className="block text-[11px] uppercase tracking-wider text-white/60 mb-1">
              Period
            </label>
            <select
              value={newSlotPeriod}
              onChange={(e) => setNewSlotPeriod(e.target.value as any)}
              className="w-full bg-white/5 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/50"
            >
              <option value="morning">Morning (until 12 PM)</option>
              <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
              <option value="evening">Evening (5 PM onwards)</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <button
              type="button"
              onClick={handleAddSlot}
              className="w-full py-2 px-4 rounded-xl bg-[#C45266] hover:bg-[#b04356] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Slot</span>
            </button>
          </div>
        </div>
      </div>

      {/* List of Time Slots with Inline Editing & Delete */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-white/80 font-medium px-1">
          <span>Available Slots ({slotsList.length})</span>
          <span className="text-[11px] text-white/60">
            Edit time directly or toggle checkbox to enable/disable
          </span>
        </div>

        {slotsList.length === 0 ? (
          <div className="p-8 text-center bg-white/5 rounded-2xl border border-white/10 text-white/60 text-xs">
            No time slots configured. Click "Reset Defaults" above to restore standard hours.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {slotsList.map((slot, index) => (
              <div
                key={`${slot.time}-${index}`}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                  slot.is_available
                    ? 'bg-white/10 border-white/30 text-white shadow-sm backdrop-blur-sm'
                    : 'bg-white/5 border-white/10 text-white/40 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="relative flex-1">
                    <Clock className="w-3.5 h-3.5 absolute left-2.5 top-2 text-white/60" />
                    <input
                      type="text"
                      value={slot.time}
                      onChange={(e) =>
                        handleUpdateSlotField(index, { time: e.target.value })
                      }
                      className="w-full bg-white/5 border border-white/15 focus:border-white/50 rounded-lg pl-8 pr-2 py-1 text-xs font-mono font-semibold text-white focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteSlot(index)}
                    className="p-1.5 text-rose-400 hover:text-red-300 hover:bg-red-950/50 rounded-lg transition-colors shrink-0 cursor-pointer"
                    title={`Delete slot ${slot.time}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10 text-xs">
                  <select
                    value={slot.period}
                    onChange={(e) =>
                      handleUpdateSlotField(index, { period: e.target.value as any })
                    }
                    className="bg-white/10 border border-white/10 rounded px-2 py-0.5 text-[11px] font-mono uppercase text-white focus:outline-none"
                  >
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                  </select>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <span className={`text-[11px] font-medium ${slot.is_available ? 'text-emerald-300' : 'text-white/60'}`}>
                      {slot.is_available ? 'Active' : 'Offline'}
                    </span>
                    <input
                      type="checkbox"
                      checked={slot.is_available}
                      onChange={(e) => {
                        handleUpdateSlotField(index, { is_available: e.target.checked });
                        const updated = [...slotsList];
                        updated[index].is_available = e.target.checked;
                        updateCalendarSlots(updated);
                      }}
                      className="w-4 h-4 accent-[#C45266] rounded cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
