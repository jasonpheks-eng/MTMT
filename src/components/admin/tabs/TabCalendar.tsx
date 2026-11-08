import React, { useState } from 'react';
import { Calendar, CheckCircle, ExternalLink, Sparkles } from 'lucide-react';
import { BoutiqueSettings } from '../../../types';
import { buildGoogleCalendarWebLink } from '../../../lib/googleCalendar';

interface TabCalendarProps {
  settingsForm: BoutiqueSettings;
  setSettingsForm: React.Dispatch<React.SetStateAction<BoutiqueSettings>>;
}

export const TabCalendar: React.FC<TabCalendarProps> = ({
  settingsForm,
  setSettingsForm,
}) => {
  const [testLink, setTestLink] = useState('');

  const generateSampleCalendarLink = () => {
    const sampleAppt = {
      id: 'SAMPLE-101',
      client_name: 'Sample Client',
      client_phone: '+44 7911 123456',
      client_email: settingsForm.ceo_google_email || 'ceo@mtmansion.com',
      service_id: 'nails-art',
      service_title: 'Your signature nail art',
      category: 'nails' as const,
      date: new Date().toISOString().split('T')[0],
      time_slot: '02:30 PM',
      notes: 'Sample appointment test event for MT Mansion boutique',
      status: 'confirmed' as const,
      created_at: new Date().toISOString(),
    };
    const link = buildGoogleCalendarWebLink(sampleAppt, settingsForm.calendar_reminder_min || 30);
    setTestLink(link);
    window.open(link, '_blank');
  };

  return (
    <div className="space-y-6 max-w-2xl font-sans">
      <div>
        <h3 className="font-editorial text-2xl text-white">CEO Google Calendar Sync</h3>
        <p className="text-xs text-white/60 mt-0.5">
          Manage Google Calendar integration for client booking requests and reminder notifications.
        </p>
      </div>

      <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-5 shadow-sm backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#ea297e]" />
              <span>Google Calendar Configuration</span>
            </h4>
            <p className="text-[11px] text-white/60 mt-0.5">
              Appointments generate zero-friction Google Calendar event links for instant client and CEO calendar synchronization.
            </p>
          </div>
          <button
            type="button"
            onClick={generateSampleCalendarLink}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/20 flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Test Add to Calendar</span>
          </button>
        </div>

        <div className="pt-3 border-t border-white/10 space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-white/80 mb-1 font-medium">
              CEO Target Google Email
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
              <span className="text-xs font-medium text-white block">Enable Automatic Calendar Links</span>
              <span className="text-[11px] text-white/60">Generate instant 'Add to Google Calendar' links upon client booking</span>
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
              Reminder Time (Minutes Before Appointment)
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

          {testLink && (
            <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-xs text-emerald-200 flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 truncate">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Test Google Calendar web event link generated!</span>
              </span>
              <a
                href={testLink}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded bg-emerald-500 text-black font-medium text-[11px] flex items-center gap-1 shrink-0 hover:bg-emerald-400 transition-colors"
              >
                <span>Open Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


