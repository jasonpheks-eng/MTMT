import React from 'react';
import { Palette, Layers, Save, RefreshCw, Type } from 'lucide-react';
import { BoutiqueSettings } from '../../../types';

interface TabColorsProps {
  settingsForm: BoutiqueSettings;
  setSettingsForm: React.Dispatch<React.SetStateAction<BoutiqueSettings>>;
  handleSaveSettings: (e?: React.FormEvent) => Promise<void>;
  updateSettings: (settings: BoutiqueSettings) => Promise<any>;
  showSuccessNotice: (msg: string) => void;
  isSavingSettings: boolean;
  isSupabaseActive: boolean;
}

export const TabColors: React.FC<TabColorsProps> = ({
  settingsForm,
  setSettingsForm,
  handleSaveSettings,
  updateSettings,
  showSuccessNotice,
  isSavingSettings,
  isSupabaseActive,
}) => {
  return (
    <form onSubmit={handleSaveSettings} className="space-y-8">
      <div className="p-5 rounded-2xl bg-[#C45266]/10 border border-[#C45266]/30 space-y-4">
        <label className="block text-xs font-semibold uppercase tracking-wider text-white/80">
          Theme Presets
        </label>
        <select
          value={settingsForm.theme_preset || 'custom'}
          onChange={(e) => {
            const val = e.target.value;
            let newSettings = { ...settingsForm, theme_preset: val };
            if (val === 'brutalist') {
              newSettings = { 
                ...newSettings, 
                hero_bg_color: '#000000', 
                hero_accent_color: '#FF5B9E', 
                hero_gradient_enabled: false,
                navbar_bg_color: '#000000',
                navbar_text_color: '#FF5B9E',
                services_bg_color: '#0a0a0a',
                services_card_bg_color: '#141414',
                booking_bg_color: '#111010',
                booking_card_bg_color: '#181818',
                booking_accent_color: '#FF5B9E',
                experiences_bg_color: '#000000',
                footer_bg_color: '#000000'
              };
            } else if (val === 'elegant') {
              newSettings = { 
                ...newSettings, 
                hero_bg_color: '#240F1B', 
                hero_accent_color: '#C76A75', 
                hero_gradient_enabled: false,
                navbar_bg_color: '#000000',
                navbar_text_color: '#ea297e',
                services_bg_color: '#501D2C',
                services_card_bg_color: '#3B1622',
                booking_bg_color: '#5b0827',
                booking_card_bg_color: '#2E1222',
                booking_accent_color: '#C45266',
                experiences_bg_color: '#180711',
                footer_bg_color: '#1A0A13'
              };
            } else if (val === 'midnight') {
              newSettings = { 
                ...newSettings, 
                hero_bg_color: '#0A0A0A', 
                hero_accent_color: '#D4AF37', 
                hero_gradient_enabled: false,
                navbar_bg_color: '#000000',
                navbar_text_color: '#D4AF37',
                services_bg_color: '#141414',
                services_card_bg_color: '#222222',
                booking_bg_color: '#1A1A1A',
                booking_card_bg_color: '#2B2B2B',
                booking_accent_color: '#D4AF37',
                experiences_bg_color: '#0A0A0A',
                footer_bg_color: '#050505'
              };
            } else if (val === 'velvet') {
              newSettings = { 
                ...newSettings, 
                hero_bg_color: '#4A1525', 
                hero_accent_color: '#F49AC2', 
                hero_gradient_enabled: false,
                navbar_bg_color: '#1F0710',
                navbar_text_color: '#F49AC2',
                services_bg_color: '#38101C',
                services_card_bg_color: '#471524',
                booking_bg_color: '#471524',
                booking_card_bg_color: '#5A1B2E',
                booking_accent_color: '#F49AC2',
                experiences_bg_color: '#220710',
                footer_bg_color: '#1A050D'
              };
            } else if (val === 'blush') {
              newSettings = {
                ...newSettings,
                hero_bg_color: '#822646',
                hero_accent_color: '#FF85A2',
                hero_gradient_enabled: false,
                navbar_bg_color: '#2E0917',
                navbar_text_color: '#FF85A2',
                services_bg_color: '#54152C',
                services_card_bg_color: '#3E0D1F',
                booking_bg_color: '#661935',
                booking_card_bg_color: '#3E0D1F',
                booking_accent_color: '#FF85A2',
                experiences_bg_color: '#220510',
                footer_bg_color: '#18030B'
              };
            } else if (val === 'barbie') {
              newSettings = {
                ...newSettings,
                hero_bg_color: '#52062E',
                hero_accent_color: '#FF1493',
                hero_gradient_enabled: false,
                navbar_bg_color: '#1A000D',
                navbar_text_color: '#FF1493',
                services_bg_color: '#3B0421',
                services_card_bg_color: '#2B0217',
                booking_bg_color: '#480528',
                booking_card_bg_color: '#2B0217',
                booking_accent_color: '#FF69B4',
                experiences_bg_color: '#16000C',
                footer_bg_color: '#0F0008'
              };
            } else if (val === 'rose_quartz') {
              newSettings = {
                ...newSettings,
                hero_bg_color: '#6B2B43',
                hero_accent_color: '#FFAEC7',
                hero_gradient_enabled: false,
                navbar_bg_color: '#210A14',
                navbar_text_color: '#FFAEC7',
                services_bg_color: '#47182B',
                services_card_bg_color: '#33101E',
                booking_bg_color: '#551E34',
                booking_card_bg_color: '#33101E',
                booking_accent_color: '#FFAEC7',
                experiences_bg_color: '#1B0610',
                footer_bg_color: '#12030A'
              };
            } else if (val === 'sakura') {
              newSettings = {
                ...newSettings,
                hero_bg_color: '#5E2238',
                hero_accent_color: '#FFB7C5',
                hero_gradient_enabled: false,
                navbar_bg_color: '#210913',
                navbar_text_color: '#FFB7C5',
                services_bg_color: '#411526',
                services_card_bg_color: '#2F0D1B',
                booking_bg_color: '#4F1B2F',
                booking_card_bg_color: '#2F0D1B',
                booking_accent_color: '#FFB7C5',
                experiences_bg_color: '#1A040E',
                footer_bg_color: '#110209'
              };
            } else if (val === 'cotton') {
              newSettings = {
                ...newSettings,
                hero_bg_color: '#702C53',
                hero_accent_color: '#FF94D2',
                hero_gradient_enabled: false,
                navbar_bg_color: '#260B1C',
                navbar_text_color: '#FF94D2',
                services_bg_color: '#4C1B37',
                services_card_bg_color: '#371227',
                booking_bg_color: '#5C2243',
                booking_card_bg_color: '#371227',
                booking_accent_color: '#FF94D2',
                experiences_bg_color: '#1F0616',
                footer_bg_color: '#160410'
              };
            }
            setSettingsForm(newSettings);
            updateSettings(newSettings);
            showSuccessNotice(`Switched to "${val}" theme!`);
          }}
          className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white/50"
        >
          <option value="custom">Custom Colors</option>
          <option value="brutalist">1. Brutalist (Pink / Black)</option>
          <option value="elegant">2. Signature Elegant (Wine / Rose)</option>
          <option value="midnight">3. Midnight Noir (Gold / Black)</option>
          <option value="velvet">4. Velvet Rose (Plum / Rose)</option>
          <option value="blush">5. Blush & Peony (Warm Rose / Soft Pink)</option>
          <option value="barbie">6. Hot Barbie Glam (Neon Pink / Noir)</option>
          <option value="rose_quartz">7. Rose Quartz Luxe (Dusty Rose / Champagne)</option>
          <option value="sakura">8. Sakura Petal (Cherry Blossom / Soft Pink)</option>
          <option value="cotton">9. Cotton Candy Cashmere (Pastel Pink / Rose)</option>
        </select>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-editorial text-2xl sm:text-3xl text-white flex items-center gap-2">
            <Palette className="w-6 h-6 text-rose-400" />
            <span>Section & Page Color Customizer</span>
          </h3>
          <p className="text-xs text-white/60 mt-1">
            Change background and text colors for each individual section on your site. Broadcasts live across all open visitor sessions.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              const resetColors = {
                ...settingsForm,
                hero_bg_color: '#701932',
                hero_accent_color: '#ea297e',
                navbar_bg_color: '#000000',
                navbar_text_color: '#ea297e',
                details_bg_color: '#501D2C',
                details_text_color: '#E5B8C0',
                services_bg_color: '#501D2C',
                services_card_bg_color: '#3B1622',
                booking_bg_color: '#5b0827',
                booking_card_bg_color: '#2E1222',
                booking_accent_color: '#C45266',
                about_bg_color: '#240F1B',
                about_text_color: '#FBF8F6',
                hero_text_color: '#a1a1aa',
                services_text_color: '#F49AC2',
                experiences_bg_color: '#180711',
                experiences_title_color: '#FFFFFF',
                experiences_subtitle_color: '#F49AC2',
                footer_bg_color: '#1A0A13',
                footer_text_color: '#FBF8F6',
              };
              setSettingsForm(resetColors);
              updateSettings(resetColors);
              showSuccessNotice('Reset all section colors to signature luxury defaults!');
            }}
            className="px-3.5 py-2 rounded-xl border border-white/20 hover:bg-white/10 text-white/80 text-xs font-medium transition-all cursor-pointer"
            title="Reset to default theme palette"
          >
            Reset Defaults
          </button>
        </div>
      </div>

      {/* Preset Theme Quick Switcher */}
      <div className="p-5 rounded-2xl bg-white/5 border border-white/20 space-y-3 shadow-lg backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-white font-semibold flex items-center gap-2">
            <Palette className="w-4 h-4 text-white/80" />
            <span>One-Click Curated Theme Palettes</span>
          </span>
          <span className="text-[11px] text-white/60 font-mono">Select a preset to update all sections</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            {
              name: 'Signature Burgundy',
              heroBg: '#701932',
              heroAccent: '#ea297e',
              navBg: '#000000',
              navText: '#ea297e',
              detailsBg: '#501D2C',
              detailsText: '#E5B8C0',
              servicesBg: '#501D2C',
              servicesCard: '#3B1622',
              bookingBg: '#5b0827',
              bookingCard: '#2E1222',
              bookingAccent: '#C45266',
              aboutBg: '#240F1B',
              expBg: '#180711',
              footerBg: '#1A0A13',
              footerText: '#FBF8F6',
            },
            {
              name: 'Midnight Noir',
              heroBg: '#0A0A0A',
              heroAccent: '#D4AF37',
              navBg: '#000000',
              navText: '#D4AF37',
              detailsBg: '#141414',
              detailsText: '#F3E5AB',
              servicesBg: '#141414',
              servicesCard: '#222222',
              bookingBg: '#1A1A1A',
              bookingCard: '#2B2B2B',
              bookingAccent: '#D4AF37',
              aboutBg: '#111111',
              expBg: '#0A0A0A',
              footerBg: '#050505',
              footerText: '#CCCCCC',
            },
            {
              name: 'Velvet Rose',
              heroBg: '#4A1525',
              heroAccent: '#F49AC2',
              navBg: '#1F0710',
              navText: '#F49AC2',
              detailsBg: '#38101C',
              detailsText: '#FFC0CB',
              servicesBg: '#38101C',
              servicesCard: '#471524',
              bookingBg: '#471524',
              bookingCard: '#5A1B2E',
              bookingAccent: '#F49AC2',
              aboutBg: '#2A0A14',
              expBg: '#220710',
              footerBg: '#1A050D',
              footerText: '#FFC0CB',
            },
            {
              name: 'Emerald Atelier',
              heroBg: '#0D2B22',
              heroAccent: '#50E3C2',
              navBg: '#051410',
              navText: '#50E3C2',
              detailsBg: '#0A241C',
              detailsText: '#A8F0E0',
              servicesBg: '#0A241C',
              servicesCard: '#133D30',
              bookingBg: '#0F3329',
              bookingCard: '#17473A',
              bookingAccent: '#50E3C2',
              aboutBg: '#071C16',
              expBg: '#051410',
              footerBg: '#030C0A',
              footerText: '#A8F0E0',
            },
            {
              name: 'Deep Plum & Gold',
              heroBg: '#2D122D',
              heroAccent: '#FFD700',
              navBg: '#170717',
              navText: '#FFD700',
              detailsBg: '#260E26',
              detailsText: '#FFE87C',
              servicesBg: '#260E26',
              servicesCard: '#3A183A',
              bookingBg: '#331433',
              bookingCard: '#451D45',
              bookingAccent: '#FFD700',
              aboutBg: '#1F0A1F',
              expBg: '#150515',
              footerBg: '#0F030F',
              footerText: '#FFE87C',
            },
            {
              name: 'Ocean Noir',
              heroBg: '#0D1B2A',
              heroAccent: '#48CAE4',
              navBg: '#050C14',
              navText: '#48CAE4',
              detailsBg: '#0B1724',
              detailsText: '#90E0EF',
              servicesBg: '#0B1724',
              servicesCard: '#1B263B',
              bookingBg: '#1B263B',
              bookingCard: '#293B57',
              bookingAccent: '#48CAE4',
              aboutBg: '#08101A',
              expBg: '#04080D',
              footerBg: '#020406',
              footerText: '#90E0EF',
            },
          ].map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => {
                const updated = {
                  ...settingsForm,
                  hero_bg_color: preset.heroBg,
                  hero_accent_color: preset.heroAccent,
                  navbar_bg_color: preset.navBg,
                  navbar_text_color: preset.navText,
                  details_bg_color: preset.detailsBg,
                  details_text_color: preset.detailsText,
                  services_bg_color: preset.servicesBg,
                  services_card_bg_color: preset.servicesCard,
                  booking_bg_color: preset.bookingBg,
                  booking_card_bg_color: preset.bookingCard,
                  booking_accent_color: preset.bookingAccent,
                  about_bg_color: preset.aboutBg,
                  experiences_bg_color: preset.expBg,
                  gooey_color_1: preset.heroBg,
                  gooey_color_2: preset.aboutBg || preset.expBg,
                  footer_bg_color: preset.footerBg,
                  footer_text_color: preset.footerText,
                };
                setSettingsForm(updated);
                updateSettings(updated);
                showSuccessNotice(`Applied "${preset.name}" palette live!`);
              }}
              className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-rose-400/50 transition-all text-left group hover:scale-[1.02] cursor-pointer"
            >
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-3.5 h-3.5 rounded-full border border-white/30" style={{ backgroundColor: preset.heroBg }} title="Hero Background" />
                <div className="w-3.5 h-3.5 rounded-full border border-white/30" style={{ backgroundColor: preset.heroAccent }} title="Accent Color" />
                <div className="w-3.5 h-3.5 rounded-full border border-white/30" style={{ backgroundColor: preset.bookingBg }} title="Booking Section" />
                <div className="w-3.5 h-3.5 rounded-full border border-white/30" style={{ backgroundColor: preset.expBg }} title="Experiences Gallery" />
              </div>
              <span className="block text-xs font-semibold text-white group-hover:text-white transition-colors">
                {preset.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Section-by-Section Color Control Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Section 1: Header / Navbar */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/20 hover:border-white/40 transition-all space-y-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-white/80" />
              <span>1. Navigation Header Bar</span>
            </label>
            <span className="w-4 h-4 rounded-full border border-white/30" style={{ backgroundColor: settingsForm.navbar_bg_color || '#000000' }} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-white/70 mb-1">
                Header Background Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settingsForm.navbar_bg_color || '#000000'}
                  onChange={(e) => setSettingsForm({ ...settingsForm, navbar_bg_color: e.target.value })}
                  className="w-10 h-9 rounded-lg bg-white/10 border border-white/20 cursor-pointer overflow-hidden p-0 shrink-0"
                />
                <input
                  type="text"
                  value={settingsForm.navbar_bg_color || '#000000'}
                  onChange={(e) => setSettingsForm({ ...settingsForm, navbar_bg_color: e.target.value })}
                  className="flex-1 bg-white/5 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-white/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-white/70 mb-1">
                Nav Links & Accent Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settingsForm.navbar_text_color || '#ea297e'}
                  onChange={(e) => setSettingsForm({ ...settingsForm, navbar_text_color: e.target.value })}
                  className="w-10 h-9 rounded-lg bg-white/10 border border-white/20 cursor-pointer overflow-hidden p-0 shrink-0"
                />
                <input
                  type="text"
                  value={settingsForm.navbar_text_color || '#ea297e'}
                  onChange={(e) => setSettingsForm({ ...settingsForm, navbar_text_color: e.target.value })}
                  className="flex-1 bg-white/5 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-white/50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Hero Introduction Banner */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/20 hover:border-white/40 transition-all space-y-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-white/80" />
              <span>2. Hero Banner Section</span>
            </label>
            <span className="w-4 h-4 rounded-full border border-white/30" style={{ backgroundColor: settingsForm.hero_bg_color || '#701932' }} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-white/70 mb-1">
                Hero Background Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settingsForm.hero_bg_color || '#701932'}
                  onChange={(e) => setSettingsForm({ ...settingsForm, hero_bg_color: e.target.value })}
                  className="w-10 h-9 rounded-lg bg-white/10 border border-white/20 cursor-pointer overflow-hidden p-0 shrink-0"
                />
                <input
                  type="text"
                  value={settingsForm.hero_bg_color || '#701932'}
                  onChange={(e) => setSettingsForm({ ...settingsForm, hero_bg_color: e.target.value })}
                  className="flex-1 bg-white/5 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-white/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-white/70 mb-1">
                Hero Title Highlight Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settingsForm.hero_accent_color || '#ea297e'}
                  onChange={(e) => setSettingsForm({ ...settingsForm, hero_accent_color: e.target.value })}
                  className="w-10 h-9 rounded-lg bg-white/10 border border-white/20 cursor-pointer overflow-hidden p-0 shrink-0"
                />
                <input
                  type="text"
                  value={settingsForm.hero_accent_color || '#ea297e'}
                  onChange={(e) => setSettingsForm({ ...settingsForm, hero_accent_color: e.target.value })}
                  className="flex-1 bg-white/5 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-white/50"
                />
              </div>
            </div>

            <div className="col-span-1 sm:col-span-2">
              <label className="block text-[11px] uppercase tracking-wider text-white/70 mb-1">
                Hero Description Paragraph Text Color
              </label>
              <div className="flex items-center gap-2">
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
                  className="flex-1 bg-white/5 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-white/50"
                />
              </div>
            </div>

            <div className="col-span-1 sm:col-span-2 pt-2 border-t border-white/10">
              <label className="block text-[11px] uppercase tracking-wider text-white mb-1 font-semibold">
                ✨ Interactive Gooey Liquid Backgrounds
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mt-2">
                <div>
                  <label className="block text-[10px] uppercase font-mono text-white/60 mb-1">Blob Base Color 1</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settingsForm.gooey_color_1 || '#701932'}
                      onChange={(e) => setSettingsForm({ ...settingsForm, gooey_color_1: e.target.value })}
                      className="w-10 h-9 rounded-lg bg-white/10 border border-white/20 cursor-pointer overflow-hidden p-0 shrink-0"
                    />
                    <input
                      type="text"
                      value={settingsForm.gooey_color_1 || '#701932'}
                      onChange={(e) => setSettingsForm({ ...settingsForm, gooey_color_1: e.target.value })}
                      className="flex-1 bg-white/5 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-white/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-mono text-white/60 mb-1">Blob Base Color 2</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settingsForm.gooey_color_2 || '#240F1B'}
                      onChange={(e) => setSettingsForm({ ...settingsForm, gooey_color_2: e.target.value })}
                      className="w-10 h-9 rounded-lg bg-white/10 border border-white/20 cursor-pointer overflow-hidden p-0 shrink-0"
                    />
                    <input
                      type="text"
                      value={settingsForm.gooey_color_2 || '#240F1B'}
                      onChange={(e) => setSettingsForm({ ...settingsForm, gooey_color_2: e.target.value })}
                      className="flex-1 bg-white/5 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-white/50"
                    />
                  </div>
                </div>

                {/* Sensitivity & Opacity Controls Grid */}
                <div className="col-span-1 sm:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-white/10">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[9px] uppercase font-mono text-white/50 mb-1">Hero Sens.</label>
                      <input
                        type="range" min="1" max="100"
                        value={settingsForm.hero_gooey_sensitivity || 80}
                        onChange={(e) => setSettingsForm({ ...settingsForm, hero_gooey_sensitivity: parseInt(e.target.value) })}
                        className="w-full accent-rose-500 h-2 cursor-pointer"
                      />
                      <div className="text-[10px] font-bold text-rose-300 text-right mt-0.5">{settingsForm.hero_gooey_sensitivity || 80}%</div>
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase font-mono text-white/50 mb-1">Hero Opacity</label>
                      <input
                        type="range" min="0" max="100"
                        value={settingsForm.hero_gooey_opacity ?? 100}
                        onChange={(e) => setSettingsForm({ ...settingsForm, hero_gooey_opacity: parseInt(e.target.value) })}
                        className="w-full accent-rose-500 h-2 cursor-pointer"
                      />
                      <div className="text-[10px] font-bold text-rose-300 text-right mt-0.5">{settingsForm.hero_gooey_opacity ?? 100}%</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[9px] uppercase font-mono text-white/50 mb-1">Services Sens.</label>
                      <input
                        type="range" min="1" max="100"
                        value={settingsForm.services_gooey_sensitivity || 80}
                        onChange={(e) => setSettingsForm({ ...settingsForm, services_gooey_sensitivity: parseInt(e.target.value) })}
                        className="w-full accent-rose-500 h-2 cursor-pointer"
                      />
                      <div className="text-[10px] font-bold text-rose-300 text-right mt-0.5">{settingsForm.services_gooey_sensitivity || 80}%</div>
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase font-mono text-white/50 mb-1">Services Opacity</label>
                      <input
                        type="range" min="0" max="100"
                        value={settingsForm.services_gooey_opacity ?? 30}
                        onChange={(e) => setSettingsForm({ ...settingsForm, services_gooey_opacity: parseInt(e.target.value) })}
                        className="w-full accent-rose-500 h-2 cursor-pointer"
                      />
                      <div className="text-[10px] font-bold text-rose-300 text-right mt-0.5">{settingsForm.services_gooey_opacity ?? 30}%</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[9px] uppercase font-mono text-white/50 mb-1">Booking Sens.</label>
                      <input
                        type="range" min="1" max="100"
                        value={settingsForm.booking_gooey_sensitivity || 80}
                        onChange={(e) => setSettingsForm({ ...settingsForm, booking_gooey_sensitivity: parseInt(e.target.value) })}
                        className="w-full accent-rose-500 h-2 cursor-pointer"
                      />
                      <div className="text-[10px] font-bold text-rose-300 text-right mt-0.5">{settingsForm.booking_gooey_sensitivity || 80}%</div>
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase font-mono text-white/50 mb-1">Booking Opacity</label>
                      <input
                        type="range" min="0" max="100"
                        value={settingsForm.booking_gooey_opacity ?? 30}
                        onChange={(e) => setSettingsForm({ ...settingsForm, booking_gooey_opacity: parseInt(e.target.value) })}
                        className="w-full accent-rose-500 h-2 cursor-pointer"
                      />
                      <div className="text-[10px] font-bold text-rose-300 text-right mt-0.5">{settingsForm.booking_gooey_opacity ?? 30}%</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[9px] uppercase font-mono text-white/50 mb-1">Exp. Sens.</label>
                      <input
                        type="range" min="1" max="100"
                        value={settingsForm.experiences_gooey_sensitivity || 80}
                        onChange={(e) => setSettingsForm({ ...settingsForm, experiences_gooey_sensitivity: parseInt(e.target.value) })}
                        className="w-full accent-rose-500 h-2 cursor-pointer"
                      />
                      <div className="text-[10px] font-bold text-rose-300 text-right mt-0.5">{settingsForm.experiences_gooey_sensitivity || 80}%</div>
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase font-mono text-white/50 mb-1">Exp. Opacity</label>
                      <input
                        type="range" min="0" max="100"
                        value={settingsForm.experiences_gooey_opacity ?? 30}
                        onChange={(e) => setSettingsForm({ ...settingsForm, experiences_gooey_opacity: parseInt(e.target.value) })}
                        className="w-full accent-rose-500 h-2 cursor-pointer"
                      />
                      <div className="text-[10px] font-bold text-rose-300 text-right mt-0.5">{settingsForm.experiences_gooey_opacity ?? 30}%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-4 col-span-1 sm:col-span-2">
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/80">
                <input
                  type="checkbox"
                  checked={!!settingsForm.hero_gradient_enabled}
                  onChange={(e) => setSettingsForm({ ...settingsForm, hero_gradient_enabled: e.target.checked })}
                  className="accent-[#C45266]"
                />
                Enable Moving Gradient
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-mono text-white/60 mb-1">Gradient Start</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={settingsForm.hero_gradient_start || '#701932'} onChange={(e) => setSettingsForm({ ...settingsForm, hero_gradient_start: e.target.value })} className="w-10 h-9 rounded-lg bg-white/10 border border-white/20 cursor-pointer overflow-hidden p-0 shrink-0" />
                    <input type="text" value={settingsForm.hero_gradient_start || '#701932'} onChange={(e) => setSettingsForm({ ...settingsForm, hero_gradient_start: e.target.value })} className="flex-1 bg-white/5 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-white/50" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-mono text-white/60 mb-1">Gradient End</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={settingsForm.hero_gradient_end || '#240F1B'} onChange={(e) => setSettingsForm({ ...settingsForm, hero_gradient_end: e.target.value })} className="w-10 h-9 rounded-lg bg-white/10 border border-white/20 cursor-pointer overflow-hidden p-0 shrink-0" />
                    <input type="text" value={settingsForm.hero_gradient_end || '#240F1B'} onChange={(e) => setSettingsForm({ ...settingsForm, hero_gradient_end: e.target.value })} className="flex-1 bg-white/5 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-white/50" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Section 4: Services Showcase */}
        <div className="p-5 rounded-2xl bg-white/5 shadow-sm backdrop-blur-sm transition-all space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/80 flex items-center gap-2">
              <Layers className="w-4 h-4 text-rose-400" />
              <span>4. Services Portfolio Showcase</span>
            </label>
            <span className="w-4 h-4 rounded-full border border-white/30" style={{ backgroundColor: settingsForm.services_bg_color || '#501D2C' }} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-white/60 mb-1">
                Section Background Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settingsForm.services_bg_color || '#501D2C'}
                  onChange={(e) => setSettingsForm({ ...settingsForm, services_bg_color: e.target.value })}
                  className="w-10 h-9 rounded-lg bg-white/10 border border-white/20 cursor-pointer overflow-hidden p-0 shrink-0"
                />
                <input
                  type="text"
                  value={settingsForm.services_bg_color || '#501D2C'}
                  onChange={(e) => setSettingsForm({ ...settingsForm, services_bg_color: e.target.value })}
                  className="flex-1 bg-white/5 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-white/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-white/60 mb-1">
                Card Container Background
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settingsForm.services_card_bg_color || '#3B1622'}
                  onChange={(e) => setSettingsForm({ ...settingsForm, services_card_bg_color: e.target.value })}
                  className="w-10 h-9 rounded-lg bg-white/10 border border-white/20 cursor-pointer overflow-hidden p-0 shrink-0"
                />
                <input
                  type="text"
                  value={settingsForm.services_card_bg_color || '#3B1622'}
                  onChange={(e) => setSettingsForm({ ...settingsForm, services_card_bg_color: e.target.value })}
                  className="flex-1 bg-white/5 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-white/50"
                />
              </div>
            </div>

            <div className="col-span-1 sm:col-span-2">
              <label className="block text-[11px] uppercase tracking-wider text-white/60 mb-1">
                Card Subtitle / Description Text Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settingsForm.services_text_color || '#F49AC2'}
                  onChange={(e) => setSettingsForm({ ...settingsForm, services_text_color: e.target.value })}
                  className="w-10 h-9 rounded-lg bg-white/10 border border-white/20 cursor-pointer overflow-hidden p-0 shrink-0"
                />
                <input
                  type="text"
                  value={settingsForm.services_text_color || '#F49AC2'}
                  onChange={(e) => setSettingsForm({ ...settingsForm, services_text_color: e.target.value })}
                  className="flex-1 bg-white/5 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-white/50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Booking Calendar */}
        <div className="p-5 rounded-2xl bg-white/5 shadow-sm backdrop-blur-sm transition-all space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/80 flex items-center gap-2">
              <Layers className="w-4 h-4 text-rose-400" />
              <span>5. Booking Calendar Section</span>
            </label>
            <span className="w-4 h-4 rounded-full border border-white/30" style={{ backgroundColor: settingsForm.booking_bg_color || '#5b0827' }} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-white/60 mb-1">
                Section Background Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settingsForm.booking_bg_color || '#5b0827'}
                  onChange={(e) => setSettingsForm({ ...settingsForm, booking_bg_color: e.target.value })}
                  className="w-10 h-9 rounded-lg bg-white/10 border border-white/20 cursor-pointer overflow-hidden p-0 shrink-0"
                />
                <input
                  type="text"
                  value={settingsForm.booking_bg_color || '#5b0827'}
                  onChange={(e) => setSettingsForm({ ...settingsForm, booking_bg_color: e.target.value })}
                  className="flex-1 bg-white/5 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-white/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-white/60 mb-1">
                Left Calendar Card Background
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settingsForm.booking_card_bg_color || '#2E1222'}
                  onChange={(e) => setSettingsForm({ ...settingsForm, booking_card_bg_color: e.target.value })}
                  className="w-10 h-9 rounded-lg bg-white/10 border border-white/20 cursor-pointer overflow-hidden p-0 shrink-0"
                />
                <input
                  type="text"
                  value={settingsForm.booking_card_bg_color || '#2E1222'}
                  onChange={(e) => setSettingsForm({ ...settingsForm, booking_card_bg_color: e.target.value })}
                  className="flex-1 bg-white/5 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-white/50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 6: Client Experiences Gallery */}
        <div className="p-5 rounded-2xl bg-white/5 shadow-sm backdrop-blur-sm transition-all space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/80 flex items-center gap-2">
              <Layers className="w-4 h-4 text-rose-400" />
              <span>6. Client Experiences Gallery</span>
            </label>
            <span className="w-4 h-4 rounded-full border border-white/30" style={{ backgroundColor: settingsForm.experiences_bg_color || '#180711' }} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-white/60 mb-1">
                Gallery Background Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settingsForm.experiences_bg_color || '#180711'}
                  onChange={(e) => setSettingsForm({ ...settingsForm, experiences_bg_color: e.target.value })}
                  className="w-10 h-9 rounded-lg bg-white/10 border border-white/20 cursor-pointer overflow-hidden p-0 shrink-0"
                />
                <input
                  type="text"
                  value={settingsForm.experiences_bg_color || '#180711'}
                  onChange={(e) => setSettingsForm({ ...settingsForm, experiences_bg_color: e.target.value })}
                  className="flex-1 bg-white/5 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-white/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-white/60 mb-1">
                Main Title Color ("Your Experiences")
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settingsForm.experiences_title_color || '#FFFFFF'}
                  onChange={(e) => setSettingsForm({ ...settingsForm, experiences_title_color: e.target.value })}
                  className="w-10 h-9 rounded-lg bg-white/10 border border-white/20 cursor-pointer overflow-hidden p-0 shrink-0"
                />
                <input
                  type="text"
                  value={settingsForm.experiences_title_color || '#FFFFFF'}
                  onChange={(e) => setSettingsForm({ ...settingsForm, experiences_title_color: e.target.value })}
                  className="flex-1 bg-white/5 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-white/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-white/60 mb-1">
                Badge / Subtitle ("Client Gallery")
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settingsForm.experiences_subtitle_color || '#F49AC2'}
                  onChange={(e) => setSettingsForm({ ...settingsForm, experiences_subtitle_color: e.target.value })}
                  className="w-10 h-9 rounded-lg bg-white/10 border border-white/20 cursor-pointer overflow-hidden p-0 shrink-0"
                />
                <input
                  type="text"
                  value={settingsForm.experiences_subtitle_color || '#F49AC2'}
                  onChange={(e) => setSettingsForm({ ...settingsForm, experiences_subtitle_color: e.target.value })}
                  className="flex-1 bg-white/5 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-white/50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 7: Footer */}
        <div className="p-5 rounded-2xl bg-white/5 shadow-sm backdrop-blur-sm transition-all space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/80 flex items-center gap-2">
              <Layers className="w-4 h-4 text-rose-400" />
              <span>7. Footer Section</span>
            </label>
            <span className="w-4 h-4 rounded-full border border-white/30" style={{ backgroundColor: settingsForm.footer_bg_color || '#1A0A13' }} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-white/60 mb-1">
                Footer Background Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settingsForm.footer_bg_color || '#1A0A13'}
                  onChange={(e) => setSettingsForm({ ...settingsForm, footer_bg_color: e.target.value })}
                  className="w-10 h-9 rounded-lg bg-white/10 border border-white/20 cursor-pointer overflow-hidden p-0 shrink-0"
                />
                <input
                  type="text"
                  value={settingsForm.footer_bg_color || '#1A0A13'}
                  onChange={(e) => setSettingsForm({ ...settingsForm, footer_bg_color: e.target.value })}
                  className="flex-1 bg-white/5 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-white/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-white/60 mb-1">
                Footer Text Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settingsForm.footer_text_color || '#FBF8F6'}
                  onChange={(e) => setSettingsForm({ ...settingsForm, footer_text_color: e.target.value })}
                  className="w-10 h-9 rounded-lg bg-white/10 border border-white/20 cursor-pointer overflow-hidden p-0 shrink-0"
                />
                <input
                  type="text"
                  value={settingsForm.footer_text_color || '#FBF8F6'}
                  onChange={(e) => setSettingsForm({ ...settingsForm, footer_text_color: e.target.value })}
                  className="flex-1 bg-white/5 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-white/50"
                />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Submit Bar for Colors & Hero */}
      <div className="pt-4 flex items-center justify-between gap-3 border-t border-white/10 sticky bottom-0 bg-[#2D1B28]/95 p-4 -mx-2 rounded-2xl backdrop-blur-md shadow-lg border border-white/10">
        <div className="text-[11px] text-white/60">
          {isSupabaseActive ? 'Theme colors sync to Supabase database (persists on Vercel).' : 'Theme colors save locally and apply live.'}
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
          <span>{isSavingSettings ? 'Saving Colors to Database...' : 'Save Theme & Colors to Database'}</span>
        </button>
      </div>
    </form>
  );
};
