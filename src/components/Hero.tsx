import React, { useEffect } from 'react';
import { useBoutique } from '../context/BoutiqueContext';
import { GooeyGradientBackground } from './GooeyGradientBackground';

// Cute small pink icons for Hair, Lashes, and Nails
export const CuteHairIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <circle cx="6" cy="6" r="3" fill="#FF5B9E" fillOpacity="0.25" stroke="#FF5B9E" />
    <circle cx="6" cy="18" r="3" fill="#FF5B9E" fillOpacity="0.25" stroke="#FF5B9E" />
    <line x1="20" y1="4" x2="8.12" y2="15.88" stroke="#FF5B9E" />
    <line x1="14.47" y1="14.48" x2="20" y2="20" stroke="#FF5B9E" />
    <line x1="8.12" y1="8.12" x2="12" y2="12" stroke="#FF5B9E" />
    <path d="M18 2.5l.5 1.5 1.5.5-1.5.5-.5 1.5-.5-1.5-1.5-.5 1.5-.5z" fill="#FF5B9E" stroke="none" />
  </svg>
);

export const CuteLashesIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M2 13c3.5 4.5 16.5 4.5 20 0" stroke="#FF5B9E" strokeWidth="2.2" />
    <path d="M3.5 12L1.8 8.5" stroke="#FF5B9E" strokeWidth="1.8" />
    <path d="M7 14L5.5 9.5" stroke="#FF5B9E" strokeWidth="1.8" />
    <path d="M12 15V10" stroke="#FF5B9E" strokeWidth="1.8" />
    <path d="M17 14L18.5 9.5" stroke="#FF5B9E" strokeWidth="1.8" />
    <path d="M20.5 12L22.2 8.5" stroke="#FF5B9E" strokeWidth="1.8" />
    <path d="M19.5 3.5l.4 1.1 1.1.4-1.1.4-.4 1.1-.4-1.1-1.1-.4 1.1-.4z" fill="#FF5B9E" stroke="none" />
  </svg>
);

export const CuteNailsIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <rect x="9" y="2.5" width="6" height="5" rx="1.5" stroke="#FF5B9E" fill="#FF5B9E" fillOpacity="0.25" />
    <path d="M10.5 7.5v2.5h3v-2.5" stroke="#FF5B9E" />
    <path d="M7 10h10a2 2 0 0 1 2 2v7.5a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 19.5V12a2 2 0 0 1 2-2z" stroke="#FF5B9E" fill="#FF5B9E" fillOpacity="0.2" />
    <path d="M9 14c1.5 1.5 4.5 1.5 6 0" stroke="#FF5B9E" strokeWidth="1.6" />
    <circle cx="12" cy="18" r="1.5" fill="#FF5B9E" stroke="none" />
    <path d="M19 5.5l.4.9.9.4-.9.4-.4.9-.4-.9-.9-.4.9-.4z" fill="#FF5B9E" stroke="none" />
  </svg>
);

export const Hero: React.FC = () => {
  const { openBookingForService, services, settings } = useBoutique();

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="min-h-screen relative overflow-hidden flex flex-col justify-center text-white" id="hero">
      <div className="absolute inset-0 z-0">
        <GooeyGradientBackground 
          sensitivity={settings.hero_gooey_sensitivity} 
          opacity={settings.hero_gooey_opacity}
        />
      </div>

      <div className="relative z-10 px-8 md:px-20 pt-20">
        <span 
          className="font-extrabold uppercase tracking-tighter leading-[0.9] mb-6 flex flex-wrap items-center gap-3 sm:gap-5 select-none relative z-20 break-words w-full" 
          style={{ 
            fontSize: `clamp(40px, 12vw, ${settings.hero_font_size || 65}px)`,
            color: settings.hero_accent_color || '#FF5B9E',
            backgroundImage: `linear-gradient(135deg, #ffffff 30%, ${settings.hero_accent_color || '#FF5B9E'} 70%, #ffd1dc 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 10px 15px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 25px rgba(255, 91, 158, 0.3))',
          }}
        >
          <span 
            className="inline-block"
            style={{ fontSize: '50px' }}
          >
            {settings.boutique_name || 'mt maison'}
          </span>

          {/* Cute Small Pink Icons: Hair, Lashes, and Nails */}
          <span 
            className="inline-flex items-center justify-center mx-auto sm:mx-auto self-center gap-2 sm:gap-3 py-1.5 px-3.5 rounded-full bg-pink-500/15 border border-pink-400/40 backdrop-blur-md shadow-[0_0_20px_rgba(255,91,158,0.35)] select-none text-normal transition-all hover:border-pink-300 hover:shadow-[0_0_25px_rgba(255,91,158,0.5)]"
            style={{ 
              WebkitTextFillColor: 'initial',
              WebkitBackgroundClip: 'initial',
              backgroundImage: 'none',
              filter: 'none',
              fontSize: '12px',
              letterSpacing: '0.05em',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            {/* Hair Icon */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const hairService = services.find(s => s.category === 'hair');
                openBookingForService(hairService);
              }}
              className="inline-flex items-center gap-1.5 text-pink-300 hover:text-white transition-all transform hover:scale-110 cursor-pointer group"
              title="Hair & Wig Installations - Click to Book"
            >
              <CuteHairIcon className="w-4 h-4 text-[#FF5B9E] group-hover:text-pink-300 drop-shadow-[0_0_8px_rgba(255,91,158,0.7)]" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-pink-200 group-hover:text-white">Hair</span>
            </button>

            <span className="w-1 h-1 rounded-full bg-pink-400/40" />

            {/* Lashes Icon */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const lashService = services.find(s => s.category === 'lashes');
                openBookingForService(lashService);
              }}
              className="inline-flex items-center gap-1.5 text-pink-300 hover:text-white transition-all transform hover:scale-110 cursor-pointer group"
              title="Lash Extensions - Click to Book"
            >
              <CuteLashesIcon className="w-4 h-4 text-[#FF5B9E] group-hover:text-pink-300 drop-shadow-[0_0_8px_rgba(255,91,158,0.7)]" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-pink-200 group-hover:text-white">Lashes</span>
            </button>

            <span className="w-1 h-1 rounded-full bg-pink-400/40" />

            {/* Nails Icon */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const nailService = services.find(s => s.category === 'nails');
                openBookingForService(nailService);
              }}
              className="inline-flex items-center gap-1.5 text-pink-300 hover:text-white transition-all transform hover:scale-110 cursor-pointer group"
              title="Nail Art & Manicure - Click to Book"
            >
              <CuteNailsIcon className="w-4 h-4 text-[#FF5B9E] group-hover:text-pink-300 drop-shadow-[0_0_8px_rgba(255,91,158,0.7)]" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-pink-200 group-hover:text-white">Nails</span>
            </button>
          </span>
        </span>
        
        <div className="max-w-6xl relative z-20">
          <div className="reveal active">
            <span 
              className="font-bold tracking-[0.4em] sm:tracking-[1em] uppercase mb-8 block transition-all duration-300 break-words text-center" 
              style={{ 
                color: settings.hero_accent_color || '#FF5B9E',
                fontSize: 'clamp(14px, 4vw, 16.99px)',
                lineHeight: '1.4',
                textAlign: 'center',
              }}
            >
              {settings.tagline || 'where beauty meets elegance'}&nbsp;&nbsp;
            </span>
          </div>
          
          <div className="reveal active delay-200 grid md:grid-cols-2 gap-10 md:gap-20 items-start">
            <p 
              className="text-base sm:text-lg md:text-xl font-light transition-colors duration-200"
              style={{ 
                color: settings.hero_text_color || '#a1a1aa',
                textShadow: '0 2px 8px rgba(0,0,0,0.4)',
                lineHeight: `${settings.hero_description_line_height || 22.25}px`,
                textAlign: (settings.hero_description_align || 'left') as any
              }}
            >
              {settings.hero_description || 'Welcome to MT Maison, your beauty destination for flawless nails, beautiful wig installations and stunning lashes.'}
            </p>
            
            <div className="flex flex-col gap-6 w-full sm:w-auto">
              <button
                onClick={() => openBookingForService()}
                className="bg-white text-black w-full sm:w-fit px-8 py-5 sm:px-12 sm:py-6 text-xs sm:text-sm font-extrabold uppercase tracking-[0.3em] sm:tracking-[0.4em] hover:bg-[#FF5B9E] hover:text-white transition-all cursor-crosshair rounded-full shadow-2xl active:scale-95"
              >
                {settings.hero_button_text || 'Reserve Your Slot'}
              </button>
            </div>
          </div>
        </div>

        <div className="absolute right-0 bottom-0 p-8 hidden lg:block">
          <div className="h-40 w-px bg-[#FF5B9E] mb-4"></div>
          <span className="[writing-mode:vertical-rl] inline-block text-[10px] tracking-[1em] text-[#FF5B9E] uppercase font-bold">
            {settings.hero_scroll_text || 'Scroll to Explore'}
          </span>
        </div>
      </div>
    </section>
  );
};
