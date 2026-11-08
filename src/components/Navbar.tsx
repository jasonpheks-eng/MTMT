import React, { useState } from 'react';
import { useBoutique } from '../context/BoutiqueContext';
import { Menu, X, Settings, Sparkles, Calendar, Camera, ChevronRight, Phone, ArrowUpRight } from 'lucide-react';
import { getImageStyleAndClasses } from '../lib/imageStyle';

export const Navbar: React.FC = () => {
  const { openBookingForService, openAdmin, isAdmin, settings, imageSlots } = useBoutique();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const logoStyle = getImageStyleAndClasses('logo_url', imageSlots.configs, 'auto', 'object-contain');

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <header 
        className="w-full text-white shadow-lg border-b border-rose-300/20 backdrop-blur-xl transition-all duration-300"
        style={{ backgroundColor: (settings.navbar_bg_color || '#000000') + 'ee' }}
      >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
        
        {/* Desktop Logo (Left Corner) */}
        <div className={`hidden md:flex items-center shrink-0 h-16 w-32 ${logoStyle.containerClasses}`}>
          <img 
            src={imageSlots.logo_url} 
            alt="MT Mansion Logo" 
            className={logoStyle.combinedClasses}
            style={logoStyle.style}
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Mobile Logo (Centered) */}
        <div className={`flex md:hidden absolute left-1/2 -translate-x-1/2 h-14 w-28 items-center justify-center ${logoStyle.containerClasses}`}>
          <img 
            src={imageSlots.logo_url} 
            alt="MT Mansion Logo" 
            className={logoStyle.combinedClasses}
            style={logoStyle.style}
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Desktop Nav Links matching Figma (centered) */}
        <nav className="hidden md:flex items-center gap-4 text-sm font-medium tracking-wide text-white">
          <a
            href="#services"
            className="group flex items-center gap-2.5 px-3.5 py-1.5 rounded-full hover:bg-white/10 text-white transition-all"
          >
            <div className="w-7 h-7 rounded-full bg-white/15 group-hover:bg-[#C45266] flex items-center justify-center transition-all shadow-sm shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-white font-medium tracking-wide text-sm">The Services</span>
          </a>
          <a
            href="#booking"
            className="group flex items-center gap-2.5 px-3.5 py-1.5 rounded-full hover:bg-white/10 text-white transition-all"
          >
            <div className="w-7 h-7 rounded-full bg-white/15 group-hover:bg-[#C45266] flex items-center justify-center transition-all shadow-sm shrink-0">
              <Calendar className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-white font-medium tracking-wide text-sm">Your Visit</span>
          </a>
          <a
            href="#experiences"
            className="group flex items-center gap-2.5 px-3.5 py-1.5 rounded-full hover:bg-white/10 text-white transition-all"
          >
            <div className="w-7 h-7 rounded-full bg-white/15 group-hover:bg-[#C45266] flex items-center justify-center transition-all shadow-sm shrink-0">
              <Camera className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-white font-medium tracking-wide text-sm">Experiences</span>
          </a>
        </nav>

        {/* Right Action Zone */}
        <div className="hidden sm:flex items-center gap-2">
          {/* Settings Trigger (Icon Only) */}
          <button
            onClick={openAdmin}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm border border-white/10 hover:scale-105 active:scale-95"
            title="Settings"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4 text-white" />
          </button>

          {/* Primary CTA Book an appointment matching Figma */}
          <button
            onClick={() => openBookingForService()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#240F1B] text-white hover:bg-[#1A0A13] text-sm font-medium tracking-wide transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] border border-white/10"
          >
            <span>Book an appointment</span>
            <span className="text-xs">↗</span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => openBookingForService()}
            className="px-3.5 py-1.5 rounded-full bg-[#240F1B] text-xs font-medium text-white"
          >
            Book ↗
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden border-t border-rose-400/25 px-5 py-6 flex flex-col gap-5 text-white transition-all duration-300 backdrop-blur-2xl shadow-2xl animate-in slide-in-from-top-3 fade-in max-h-[85vh] overflow-y-auto"
          style={{ 
            backgroundColor: settings.navbar_bg_color ? `${settings.navbar_bg_color}fa` : '#000000fa'
          }}
        >
          {/* Navigation Links */}
          <div className="flex flex-col gap-2">
            <a
              href="#services"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-rose-400/30 transition-all flex items-center justify-between group active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm shrink-0 border border-white/15"
                  style={{ backgroundColor: `${settings.hero_accent_color || '#ea297e'}25` }}
                >
                  <Sparkles className="w-5 h-5" style={{ color: settings.hero_accent_color || '#ea297e' }} />
                </div>
                <div>
                  <span className="block text-sm font-medium text-white group-hover:text-rose-200 transition-colors">
                    The Services
                  </span>
                  <span className="block text-[11px] text-zinc-400 group-hover:text-zinc-300 font-light">
                    Nails, Lashes & Hair Artistry
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-rose-300 transition-transform group-hover:translate-x-0.5" />
            </a>

            <a
              href="#booking"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-rose-400/30 transition-all flex items-center justify-between group active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm shrink-0 border border-white/15"
                  style={{ backgroundColor: `${settings.hero_accent_color || '#ea297e'}25` }}
                >
                  <Calendar className="w-5 h-5" style={{ color: settings.hero_accent_color || '#ea297e' }} />
                </div>
                <div>
                  <span className="block text-sm font-medium text-white group-hover:text-rose-200 transition-colors">
                    Your Visit
                  </span>
                  <span className="block text-[11px] text-zinc-400 group-hover:text-zinc-300 font-light">
                    Calendar & Reserve Slots
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-rose-300 transition-transform group-hover:translate-x-0.5" />
            </a>

            <a
              href="#experiences"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-rose-400/30 transition-all flex items-center justify-between group active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm shrink-0 border border-white/15"
                  style={{ backgroundColor: `${settings.hero_accent_color || '#ea297e'}25` }}
                >
                  <Camera className="w-5 h-5" style={{ color: settings.hero_accent_color || '#ea297e' }} />
                </div>
                <div>
                  <span className="block text-sm font-medium text-white group-hover:text-rose-200 transition-colors">
                    Experiences
                  </span>
                  <span className="block text-[11px] text-zinc-400 group-hover:text-zinc-300 font-light">
                    Client Gallery & Transformations
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-rose-300 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>

          {/* Action Zone */}
          <div className="pt-1 flex flex-col gap-2">

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openAdmin();
              }}
              className="w-full py-2.5 px-4 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-rose-100 font-medium text-center text-xs flex items-center justify-center gap-2 transition-all"
            >
              <Settings className="w-3.5 h-3.5 text-rose-300" />
              <span>Admin & Boutique Settings</span>
            </button>
          </div>

          {/* Boutique Contact Strip */}
          {settings.whatsapp_number && (
            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-400">
              <a 
                href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(settings.whatsapp_default_message || 'Hello MT Maison! I would like to inquire about booking an appointment.')}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-rose-300 hover:text-white transition-colors"
              >
                <Phone className="w-3 h-3" />
                <span>{settings.whatsapp_number}</span>
              </a>
              <span className="text-zinc-500">Tue – Sun</span>
            </div>
          )}
        </div>
      )}
      </header>
    </div>
  );
};
