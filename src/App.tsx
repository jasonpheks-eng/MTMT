import React from 'react';
import { BoutiqueProvider, useBoutique } from './context/BoutiqueContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ServicesShowcase } from './components/ServicesShowcase';
import { BookingSection } from './components/BookingSection';
import { ExperiencesSection } from './components/ExperiencesSection';
import { Footer } from './components/Footer';
import { BookingModal } from './components/BookingModal';
import { SearchModal } from './components/SearchModal';
import { FavoritesModal } from './components/FavoritesModal';

// Code-split and lazy-load AdminModal so admin portal code & heavy drag-and-drop libraries do not bloat initial mobile page load
const AdminModal = React.lazy(() => import('./components/AdminModal').then((m) => ({ default: m.AdminModal })));

const AppContent: React.FC = () => {
  const { settings } = useBoutique();
  
  return (
    <div 
      className="min-h-screen text-[#FBF8F6] selection:bg-[#C45266] selection:text-white flex flex-col font-sans transition-colors duration-500"
      style={{ backgroundColor: settings.hero_bg_color || '#240F1B' }}
    >
      {/* Navigation */}
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <Hero />

        {/* Services Showcase (Nails, Lashes, Hair) */}
        <ServicesShowcase />

        {/* Live Interactive Calendar Booking System */}
        <BookingSection />

        {/* Client Experiences */}
        <ExperiencesSection />
      </main>

      {/* Footer & CTA */}
      <Footer />

      {/* Modals & Widgets */}
      <BookingModal />
      <SearchModal />
      <FavoritesModal />

      {/* Lazy Loaded Admin Portal */}
      <React.Suspense fallback={null}>
        <AdminModal />
      </React.Suspense>
    </div>
  );
};

export default function App() {
  return (
    <BoutiqueProvider>
      <AppContent />
    </BoutiqueProvider>
  );
}
