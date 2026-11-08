import React from 'react';
import { Sparkles, Type, Save, RefreshCw } from 'lucide-react';
import { BoutiqueSettings } from '../../../types';

interface TabInfoProps {
  settingsForm: BoutiqueSettings;
  setSettingsForm: React.Dispatch<React.SetStateAction<BoutiqueSettings>>;
  handleSaveSettings: (e?: React.FormEvent) => Promise<void>;
  isSavingSettings: boolean;
  isSupabaseActive: boolean;
}

export const TabInfo: React.FC<TabInfoProps> = ({
  settingsForm,
  setSettingsForm,
  handleSaveSettings,
  isSavingSettings,
  isSupabaseActive,
}) => {
  return (
    <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl">
      <div>
        <h3 className="font-editorial text-2xl text-white">Boutique Information</h3>
        <p className="text-xs text-white/60 mt-0.5">Manage your public contact details, hours, and default WhatsApp messaging.</p>
      </div>

      {/* Hero Section Copy Editor */}
      <div className="p-5 rounded-2xl bg-white/5 border border-white/20 space-y-4 shadow-lg backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <span className="text-xs uppercase tracking-wider text-white/80 font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-400" />
            <span>Homepage Hero Headline & Introduction Story</span>
          </span>
          <span className="text-[11px] text-white/60 font-mono">Live on Home Page</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-white/80 mb-1 font-medium flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-rose-400" />
              <span>Hero Main Headline</span>
            </label>
            <input
              type="text"
              value={settingsForm.boutique_name || ''}
              onChange={(e) => setSettingsForm({ ...settingsForm, boutique_name: e.target.value })}
              placeholder="mt maison"
              className="w-full bg-white/5 border border-white/20 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-white/50 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-white/80 mb-1 font-medium flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-rose-400" />
              <span>Hero Tagline Subtitle</span>
            </label>
            <input
              type="text"
              value={settingsForm.tagline || ''}
              onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
              placeholder="where beauty meets elegance"
              className="w-full bg-white/5 border border-white/20 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-white/50 font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-2 border-t border-white/5">
          <div>
            <label className="block text-[10px] uppercase font-mono text-white/60 mb-1">Headline Font Size (px)</label>
            <input
              type="range"
              min="30"
              max="120"
              step="1"
              value={settingsForm.hero_font_size || 65}
              onChange={(e) => setSettingsForm({ ...settingsForm, hero_font_size: parseInt(e.target.value) })}
              className="w-full accent-rose-500 cursor-pointer h-2"
            />
            <div className="text-right text-[10px] text-zinc-400 font-mono mt-1">{settingsForm.hero_font_size || 65}px</div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-mono text-white/60 mb-1">Description Align</label>
            <select
              value={settingsForm.hero_description_align || 'left'}
              onChange={(e) => setSettingsForm({ ...settingsForm, hero_description_align: e.target.value as any })}
              className="w-full bg-white/5 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-white/50"
            >
              <option value="left" className="bg-[#240F1B]">Left</option>
              <option value="center" className="bg-[#240F1B]">Center</option>
              <option value="right" className="bg-[#240F1B]">Right</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-mono text-white/60 mb-1">Desc. Line Height (px)</label>
            <input
              type="number"
              value={settingsForm.hero_description_line_height || 22.25}
              onChange={(e) => setSettingsForm({ ...settingsForm, hero_description_line_height: parseFloat(e.target.value) })}
              className="w-full bg-white/5 border border-white/20 rounded-lg px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-white/50"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-white/80 mb-1 font-medium flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-rose-400" />
            <span>Hero Welcome Introduction Paragraph</span>
          </label>
          <textarea
            rows={3}
            value={settingsForm.hero_description ?? 'Welcome to MT Maison, your beauty destination for flawless nails, beautiful wig installations and stunning lashes. We help you look good, feel confident and express your unique style.'}
            onChange={(e) => setSettingsForm({ ...settingsForm, hero_description: e.target.value })}
            placeholder="Welcome to MT Maison, your beauty destination for flawless nails, beautiful wig installations and stunning lashes..."
            className="w-full bg-white/5 border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-white/50 leading-relaxed font-sans"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/5">
          <div>
            <label className="block text-xs uppercase tracking-wider text-white/80 mb-1 font-medium">Hero Button Text</label>
            <input
              type="text"
              value={settingsForm.hero_button_text || 'Reserve Your Slot'}
              onChange={(e) => setSettingsForm({ ...settingsForm, hero_button_text: e.target.value })}
              className="w-full bg-white/5 border border-white/20 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-white/50"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-white/80 mb-1 font-medium">Hero Scroll Hint</label>
            <input
              type="text"
              value={settingsForm.hero_scroll_text || 'Scroll to Explore'}
              onChange={(e) => setSettingsForm({ ...settingsForm, hero_scroll_text: e.target.value })}
              className="w-full bg-white/5 border border-white/20 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-white/50"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-white/5">
          <label className="text-[11px] text-white/60 uppercase font-mono">Paragraph Color:</label>
          <input
            type="color"
            value={settingsForm.hero_text_color || '#a1a1aa'}
            onChange={(e) => setSettingsForm({ ...settingsForm, hero_text_color: e.target.value })}
            className="w-10 h-9 rounded-lg bg-white/10 border border-white/20 cursor-pointer overflow-hidden p-0 shrink-0"
          />
          <input
            type="text"
            value={settingsForm.hero_text_color || '#a1a1aa'}
            onChange={(e) => setSettingsForm({ ...settingsForm, hero_text_color: e.target.value })}
            className="w-24 bg-white/5 border border-white/20 rounded-lg px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-white/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-white/80 mb-1 font-medium">
            Boutique WhatsApp Number *
          </label>
          <input
            type="text"
            required
            value={settingsForm.whatsapp_number}
            onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp_number: e.target.value })}
            placeholder="+1 (555) 382-9014"
            className="w-full bg-white/5 border border-white/20 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-white/50"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-white/80 mb-1 font-medium">
            Boutique Name
          </label>
          <input
            type="text"
            value={settingsForm.boutique_name}
            onChange={(e) => setSettingsForm({ ...settingsForm, boutique_name: e.target.value })}
            className="w-full bg-white/5 border border-white/20 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-white/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-white/80 mb-1 font-medium">
            Street Address
          </label>
          <input
            type="text"
            value={settingsForm.address}
            onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
            className="w-full bg-white/5 border border-white/20 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-white/50"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-white/80 mb-1 font-medium">
            City / Region
          </label>
          <input
            type="text"
            value={settingsForm.city_region}
            onChange={(e) => setSettingsForm({ ...settingsForm, city_region: e.target.value })}
            className="w-full bg-white/5 border border-white/20 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-white/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-white/80 mb-1 font-medium">
            Currency Symbol
          </label>
          <input
            type="text"
            value={settingsForm.currency_symbol || 'MWK'}
            onChange={(e) => setSettingsForm({ ...settingsForm, currency_symbol: e.target.value })}
            placeholder="MWK"
            className="w-full bg-white/5 border border-white/20 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-white/50"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-white/80 mb-1 font-medium">
            Currency Code
          </label>
          <input
            type="text"
            value={settingsForm.currency_code || 'MWK'}
            onChange={(e) => setSettingsForm({ ...settingsForm, currency_code: e.target.value.toUpperCase() })}
            placeholder="MWK"
            className="w-full bg-white/5 border border-white/20 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-white/50"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider text-white/80 mb-1 font-medium">
          Opening Hours
        </label>
        <input
          type="text"
          value={settingsForm.opening_hours}
          onChange={(e) => setSettingsForm({ ...settingsForm, opening_hours: e.target.value })}
          className="w-full bg-white/5 border border-white/20 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-white/50"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider text-white/80 mb-1 font-medium">
          Default WhatsApp Message
        </label>
        <textarea
          rows={2}
          value={settingsForm.whatsapp_default_message}
          onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp_default_message: e.target.value })}
          className="w-full bg-white/5 border border-white/20 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-white/50"
        />
      </div>

      <div className="pt-2 border-t border-white/10 space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
          Social Presence
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-white/60 mb-1">
              Instagram
            </label>
            <input
              type="url"
              value={settingsForm.instagram_url}
              onChange={(e) => setSettingsForm({ ...settingsForm, instagram_url: e.target.value })}
              className="w-full bg-white/5 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-white/60 mb-1">
              TikTok
            </label>
            <input
              type="url"
              value={settingsForm.tiktok_url}
              onChange={(e) => setSettingsForm({ ...settingsForm, tiktok_url: e.target.value })}
              className="w-full bg-white/5 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-white/60 mb-1">
              Pinterest
            </label>
            <input
              type="url"
              value={settingsForm.pinterest_url}
              onChange={(e) => setSettingsForm({ ...settingsForm, pinterest_url: e.target.value })}
              className="w-full bg-white/5 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white"
            />
          </div>
        </div>
      </div>

      {/* Submit Bar */}
      <div className="pt-4 flex items-center justify-between gap-3 border-t border-white/10">
        <div className="text-[11px] text-white/60">
          {isSupabaseActive ? 'Boutique details sync to Supabase database (persists on Vercel).' : 'Changes save locally and broadcast live.'}
        </div>
        <button
          type="submit"
          disabled={isSavingSettings}
          className="px-6 py-2.5 rounded-xl bg-[#C45266] hover:bg-[#b04356] text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
        >
          {isSavingSettings ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          <span>{isSavingSettings ? 'Saving to Database...' : 'Save Boutique Details'}</span>
        </button>
      </div>
    </form>
  );
};
