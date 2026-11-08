import React, { useState } from 'react';
import { Calendar, CheckCircle } from 'lucide-react';
import { BoutiqueSettings } from '../../../types';
import { authenticateCEOForCalendar, signOutFromCalendar } from '../../../lib/googleCalendar';

interface TabCalendarProps {
  settingsForm: BoutiqueSettings;
  setSettingsForm: React.Dispatch<React.SetStateAction<BoutiqueSettings>>;
}

export const TabCalendar: React.FC<TabCalendarProps> = ({
  settingsForm,
  setSettingsForm,
}) => {
  const [isConnectingCalendar, setIsConnectingCalendar] = useState(false);
  const [calendarConnectMsg, setCalendarConnectMsg] = useState('');

  const handleConnectCalendar = async () => {
    setIsConnectingCalendar(true);
    setCalendarConnectMsg('');
    try {
      const result = await authenticateCEOForCalendar();
      if (result) {
        setCalendarConnectMsg('Google Calendar connected successfully!');
        setSettingsForm({ 
          ...settingsForm, 
          calendar_sync_enabled: true,
          ceo_google_email: result.user.email || settingsForm.ceo_google_email
        });
      }
    } catch (err: any) {
      setCalendarConnectMsg(err.message || 'Google Calendar connection failed');
    } finally {
      setIsConnectingCalendar(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="font-editorial text-2xl text-white">CEO Google Calendar Sync</h3>
        <p className="text-xs text-white/60 mt-0.5">
          Connect the CEO's designated Google account to automatically receive booking appointments and 30-minute pop-up reminders in Google Calendar.
        </p>
      </div>

      {calendarConnectMsg && (
        <div className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 ${calendarConnectMsg.includes('success') ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-200' : 'bg-red-950/70 border border-red-500/40 text-red-200'}`}>
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{calendarConnectMsg}</span>
        </div>
      )}

      <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 shadow-sm backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-medium text-white">Google Account Authorization</h4>
            <p className="text-[11px] text-white/60 mt-0.5">
              Sign in with the CEO Google account that should receive calendar notifications.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleConnectCalendar}
              disabled={isConnectingCalendar}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-rose-50 text-black text-xs font-medium tracking-wide transition-all shadow flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
            >
              <Calendar className="w-4 h-4 text-[#ea297e]" />
              <span>{isConnectingCalendar ? 'Connecting...' : 'Sign in with Google'}</span>
            </button>
            
            <button
              type="button"
              onClick={() => {
                signOutFromCalendar();
                setSettingsForm({ 
                  ...settingsForm, 
                  calendar_sync_enabled: false,
                  ceo_google_email: ''
                });
                setCalendarConnectMsg('Signed out of Google Calendar.');
              }}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium tracking-wide transition-all border border-white/10 flex items-center gap-2 cursor-pointer"
            >
              <span>Sign out</span>
            </button>
          </div>
        </div>

        <div className="pt-3 border-t border-white/10 space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-white/80 mb-1 font-medium">
              CEO Google Account Email
            </label>
            <input
              type="email"
              value={settingsForm.ceo_google_email || ''}
              onChange={(e) => setSettingsForm({ ...settingsForm, ceo_google_email: e.target.value })}
              placeholder="ceo@mtmansion.com"
              className="w-full bg-white/5 border border-white/20 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-white/50 font-mono"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <span className="text-xs font-medium text-white block">Enable Automatic Calendar Sync</span>
              <span className="text-[11px] text-white/60">Automatically create calendar events when clients book</span>
            </div>
            <input
              type="checkbox"
              checked={settingsForm.calendar_sync_enabled !== false}
              onChange={(e) => setSettingsForm({ ...settingsForm, calendar_sync_enabled: e.target.checked })}
              className="w-4 h-4 accent-[#C45266] rounded cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-white/80 mb-1 font-medium">
              Popup Reminder Time (Minutes Before Appointment)
            </label>
            <select
              value={settingsForm.calendar_reminder_min || 30}
              onChange={(e) => setSettingsForm({ ...settingsForm, calendar_reminder_min: Number(e.target.value) })}
              className="w-full bg-white/5 border border-white/20 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-white/50 font-mono"
            >
              <option value={15} className="bg-[#240F1B]">15 minutes before</option>
              <option value={30} className="bg-[#240F1B]">30 minutes before</option>
              <option value={60} className="bg-[#240F1B]">1 hour before</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
