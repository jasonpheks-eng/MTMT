import React, { useState } from 'react';
import { useBoutique } from '../context/BoutiqueContext';
import { ArrowUpRight, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { getImageStyleAndClasses } from '../lib/imageStyle';
import { GooeyGradientBackground } from './GooeyGradientBackground';

export const ServicesShowcase: React.FC = () => {
  const { imageSlots, openBookingForService, services, settings } = useBoutique();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const categories = [
    {
      id: 'nails',
      slotKey: 'service_nails',
      title: 'Nails',
      subtitle: 'Sculpted Gel & Bespoke Art',
      image: imageSlots.service_nails,
      serviceId: 'nails-art',
    },
    {
      id: 'lashes',
      slotKey: 'service_lashes',
      title: 'Lashes',
      subtitle: 'Silk Extensions & Lash Lift',
      image: imageSlots.service_lashes,
      serviceId: 'lashes-classic',
    },
    {
      id: 'hair',
      slotKey: 'service_hair',
      title: 'Wig Installation',
      subtitle: 'Custom Melt & Precision Styling',
      image: imageSlots.service_hair,
      serviceId: 'hair-blowout',
    },
  ];

  const handleCardClick = (cat: any) => {
    // Toggle treatment menu expansion for this card
    if (expandedCategory === cat.id) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(cat.id);
    }
  };

  return (
    <section 
      id="services" 
      className="relative overflow-hidden text-white py-20 lg:py-28 px-4 sm:px-6 lg:px-8 border-b border-rose-950/40 scroll-mt-16 transition-colors duration-300"
      style={{ backgroundColor: settings.services_bg_color || '#501D2C' }}
    >
      <div className="absolute inset-0 pointer-events-none z-0">
        <GooeyGradientBackground 
          interactive={false} 
          sensitivity={settings.services_gooey_sensitivity}
          opacity={settings.services_gooey_opacity}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-xs font-semibold tracking-[0.25em] uppercase text-rose-300">
              Boutique Menu & Treatments
            </span>
            <h2 
              className="font-editorial font-normal tracking-wide text-white mt-2"
              style={{ fontSize: 'clamp(2.5rem, 8vw, 3.75rem)' }}
            >
              OUR SERVICES
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-rose-200/80 font-light max-w-md">
            Click any treatment card below to view specific treatments, pricing, and book your session directly.
          </p>
        </div>

        {/* 3 Showcase Cards with Inline Select Treatments Menu */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {categories.map((cat) => {
            const cardImgStyle = getImageStyleAndClasses(cat.slotKey, imageSlots.configs, 'aspect-[4/3]', 'object-cover');
            const catServices = (services || []).filter((s) => s.category === cat.id);
            const isExpanded = expandedCategory === cat.id;

            return (
              <div
                key={cat.id}
                className="group flex flex-col backdrop-blur-md rounded-3xl p-4 border border-white/15 hover:border-white/30 transition-all duration-300 shadow-xl"
                style={{ backgroundColor: 'rgba(91, 8, 36, 0.55)' }}
              >
                {/* Image Container */}
                <div 
                  onClick={() => handleCardClick(cat)}
                  className={`relative ${cardImgStyle.aspectClass} rounded-2xl overflow-hidden shadow-xl border border-white/10 transition-all duration-500 group-hover:shadow-rose-500/20 group-hover:border-white/30 cursor-pointer`}
                  style={{ backgroundColor: settings.services_card_bg_color || '#3B1622' }}
                >
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className={`${cardImgStyle.combinedClasses} group-hover:scale-105 transition-transform duration-700 ease-out`}
                    style={cardImgStyle.style}
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Translucent Glassy Overlay with View Treatments Button */}
                  <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] group-hover:bg-black/35 transition-colors duration-500 flex items-center justify-center">
                    <div className="bg-white/20 hover:bg-white/35 text-white backdrop-blur-md border border-white/40 px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest shadow-2xl transition-all duration-300 flex items-center gap-2">
                      <span>{isExpanded ? 'Hide Menu' : 'Select Treatments'}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-white" /> : <ChevronDown className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                
                  <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white group-hover:bg-white/40 group-hover:text-white transition-all shadow-lg">
                    <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>

                {/* Title & Info */}
                <div 
                  onClick={() => handleCardClick(cat)}
                  className="mt-4 flex items-baseline justify-between cursor-pointer px-1"
                >
                  <div>
                    <h3 className="font-editorial text-2xl sm:text-3xl italic text-white group-hover:text-rose-200 transition-colors">
                      {cat.title}
                    </h3>
                    <p 
                      className="text-xs tracking-wider uppercase mt-1 font-bold"
                      style={{ color: settings.services_text_color || '#F49AC2' }}
                    >
                      {cat.subtitle}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardClick(cat);
                    }}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-rose-200 transition-colors"
                  >
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>

                {/* Interactive Select Treatments Menu inside Card */}
                <div className="mt-4 pt-3 border-t border-white/10 space-y-2.5">
                  <button
                    type="button"
                    onClick={() => handleCardClick(cat)}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center justify-between transition-all border border-white/15 cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-rose-300" />
                      {isExpanded ? 'Hide Treatments Menu' : `View ${cat.title} Treatments (${catServices.length})`}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-rose-300" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-rose-300" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="space-y-2.5 pt-1 animate-in fade-in slide-in-from-top-2 duration-300 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/20">
                      {catServices.length === 0 ? (
                        <div className="p-4 rounded-xl bg-black/30 text-center text-xs text-rose-200/60">
                          No treatments currently listed in this category.
                        </div>
                      ) : (
                        catServices.map((service) => (
                          <div
                            key={service.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              openBookingForService(service);
                            }}
                            className="p-3.5 rounded-xl bg-black/40 hover:bg-black/60 border border-white/10 hover:border-white/30 transition-all cursor-pointer flex flex-col justify-between gap-3 group/item shadow-md"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="text-sm font-semibold text-white group-hover/item:text-rose-200 transition-colors">
                                  {service.title}
                                </h4>
                                {service.is_popular && (
                                  <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-200 border border-rose-400/30 font-sans shrink-0">
                                    Popular
                                  </span>
                                )}
                              </div>
                              {service.description && (
                                <p className="text-xs text-rose-100/80 font-light mt-1 max-h-14 overflow-y-auto pr-1 leading-relaxed border-t border-white/5 pt-1">
                                  {service.description}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/10 shrink-0">
                              <div className="font-mono text-left">
                                <span className="text-sm font-bold text-white">
                                  {settings.currency_symbol || 'MWK'} {service.price ? service.price.toLocaleString() : 0}
                                </span>
                                {!service.hide_duration && service.duration_min > 0 && (
                                  <span className="block text-[10px] text-rose-300 opacity-90">{service.duration_min} mins</span>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openBookingForService(service);
                                }}
                                className="px-4 py-2 rounded-xl bg-[#C45266] hover:bg-[#b04356] text-white text-xs font-bold shadow-lg transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                              >
                                <span>Book</span>
                                <ArrowUpRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
