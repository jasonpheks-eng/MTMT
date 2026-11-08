import React, { useState } from 'react';
import { Calendar, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { BoutiqueSettings } from '../../../types';
import { 
  authenticateCEOForCalendar, 
  signOutFromCalendar, 
  getGoogleOAuthUrl,
  getCachedCalendarToken
} from '../../../lib/googleCalendar';

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
  const [popupBlocked, setPopupBlocked] = useState(false);

  const hasToken = !!getCachedCalendarToken();

  const handleConnectCalendar = async () => {
    setIsConnectingCalendar(true);
    setCalendarConnectMsg('');
    setPopupBlocked(false);
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
      const msg = err.message || 'Google Calendar connection failed';
      setCalendarConnectMsg(msg);
      if (msg.includes('blocked') || msg.includes('POPUP') || msg.includes('closed') || msg.includes('failed to load')) {
        setPopupBlocked(true);
      }
    } finally {
      setIsConnectingCalendar(false);
    }
  };

  const handleDirectOAuth = () => {
    const url = getGoogleOAuthUrl();
    window.open(url, '_blank', 'width=550,height=650');
    setCalendarConnectMsg('Sign-in window opened. After approving, check your email below and click Save Changes.');
    setSettingsForm({
      ...settingsForm,
      calendar_sync_enabled: true,
    });
  };

  return (
    <div className="space-y-6 max-w-2xl font-sans">
      <div>
        <h3 className="font-editorial text-2xl text-white">CEO Google Calendar Sync</h3>
        <p className="text-xs text-white/60 mt-0.5">
          Connect the CEO's designated Google account to automatically receive booking appointments and 30-minute pop-up reminders in Google Calendar.
        </p>
      </div>

      {calendarConnectMsg && (
        <div className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 ${
          calendarConnectMsg.includes('success') || calendarConnectMsg.includes('opened')
            ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-200' 
            : 'bg-rose-950/70 border border-rose-500/40 text-rose-200'
        }`}>
          {calendarConnectMsg.includes('success') || calendarConnectMsg.includes('opened') ? (
            <CheckCircle className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{calendarConnectMsg}</span>
        </div>
      )}

      {popupBlocked && (
        <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs space-y-2">
          <div className="font-medium flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Browser Popup Blocked</span>
          </div>
          <p className="text-[11px] text-amber-200/80 leading-relaxed">
            Your browser or preview window prevented the sign-in popup from opening. Click the button below to authorize Google Calendar directly in a new window:
          </p>
          <button
            type="button"
            onClick={handleDirectOAuth}
            className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Google Sign-In Window</span>
          </button>
        </div>
      )}

      <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 shadow-sm backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium text-white">Google Account Authorization</h4>
              {hasToken && (
                <span className="px-2 py-0.5 text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                  Connected
                </span>
              )}
            </div>
            <p className="text-[11px] text-white/60 mt-0.5">
              Sign in with the CEO Google account that should receive calendar notifications.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleConnectCalendar}
              disabled={isConnectingCalendar}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-rose-50 text-black text-xs font-medium tracking-wide transition-all shadow flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
            >
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4 shrink-0">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
              <span>{isConnectingCalendar ? 'Connecting...' : 'Sign in with Google'}</span>
            </button>

            <button
              type="button"
              onClick={handleDirectOAuth}
              title="Open Google OAuth authorization in a new window"
              className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/20 flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Direct Link</span>
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
                setPopupBlocked(false);
              }}
              className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium tracking-wide transition-all border border-white/10 flex items-center gap-2 cursor-pointer"
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
              placeholder="e.g. jasonpheks@gmail.com"
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

