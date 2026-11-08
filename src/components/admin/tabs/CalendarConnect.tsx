import React, { useState } from 'react';
import { Calendar, CheckCircle, ExternalLink, Sparkles, ShieldCheck } from 'lucide-react';
import { BoutiqueSettings } from '../../../types';
import { authenticateCEOForCalendar, getCachedCalendarToken, getCachedCEOEmail, buildGoogleCalendarWebLink } from '../../../lib/googleCalendar';

interface CalendarConnectProps {
  settingsForm: BoutiqueSettings;
  setSettingsForm: React.Dispatch<React.SetStateAction<BoutiqueSettings>>;
}

export const CalendarConnect: React.FC<CalendarConnectProps> = ({
  settingsForm,
  setSettingsForm,
}) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const [testLink, setTestLink] = useState('');

  const hasToken = !!getCachedCalendarToken();
  const cachedEmail = getCachedCEOEmail();

  const handleAuthenticate = async () => {
    setIsAuthenticating(true);
    setAuthMessage('');
    try {
      const result = await authenticateCEOForCalendar();
      if (result) {
        const email = result.user.email || settingsForm.ceo_google_email || 'jasonpheks@gmail.com';
        setAuthMessage(`Successfully authorized Google Calendar for ${email}! App can now manage events on your behalf.`);
        setSettingsForm({
          ...settingsForm,
          ceo_google_email: email,
          calendar_sync_enabled: true,
        });
      }
    } catch (err: any) {
      setAuthMessage(err.message || 'Google account authorization failed.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl font-sans">
      <div>
        <h3 className="font-editorial text-2xl text-white">Google Calendar Authorization (CalendarConnect)</h3>
        <p className="text-xs text-white/60 mt-0.5">
          Authenticate with your Google account using stored OAuth credentials to authorize the boutique app to manage events on your behalf.
        </p>
      </div>

      {authMessage && (
        <div className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 ${authMessage.includes('Successfully') ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-200' : 'bg-rose-950/70 border border-rose-500/40 text-rose-200'}`}>
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{authMessage}</span>
        </div>
      )}

      <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-5 shadow-sm backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>OAuth Credential Authentication</span>
              </h4>
              {hasToken && (
                <span className="px-2 py-0.5 text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                  Active Token Authorized
                </span>
              )}
            </div>
            <p className="text-[11px] text-white/60 mt-0.5">
              {cachedEmail ? `Authenticated as ${cachedEmail}` : 'Connect your CEO Google account to enable direct event insertion.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAuthenticate}
              disabled={isAuthenticating}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-rose-50 text-black text-xs font-medium tracking-wide transition-all shadow flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
            >
              <Calendar className="w-4 h-4 text-[#ea297e]" />
              <span>{isAuthenticating ? 'Authorizing...' : 'Authorize CalendarConnect'}</span>
            </button>
          </div>
        </div>

        <div className="pt-3 border-t border-white/10 space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-white/80 mb-1 font-medium">
              Authorized CEO Google Email
            </label>
            <input
              type="email"
              value={settingsForm.ceo_google_email || 'jasonpheks@gmail.com'}
              onChange={(e) => setSettingsForm({ ...settingsForm, ceo_google_email: e.target.value })}
              className="w-full bg-white/5 border border-white/20 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-white/50 font-mono"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <span className="text-xs font-medium text-white block">Automatic Event Management</span>
              <span className="text-[11px] text-white/60">Allow app to create and manage booking events in your calendar</span>
            </div>
            <input
              type="checkbox"
              checked={settingsForm.calendar_sync_enabled !== false}
              onChange={(e) => setSettingsForm({ ...settingsForm, calendar_sync_enabled: e.target.checked })}
              className="w-4 h-4 accent-[#C45266] rounded cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
