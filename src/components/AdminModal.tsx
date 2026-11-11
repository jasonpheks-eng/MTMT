import React, { useState } from 'react';
import { useBoutique } from '../context/BoutiqueContext';
import {
  X,
  Lock,
  Calendar,
  MessageCircle,
  Image as ImageIcon,
  DollarSign,
  Clock,
  Settings,
  Database,
  CheckCircle,
  AlertCircle,
  LogOut,
  RotateCcw,
  Palette,
  Save,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react';

import { TabLoader } from './admin/TabLoader';

// Lazy-loaded Admin Tabs for code splitting and instant mobile responsiveness
const TabInfo = React.lazy(() => import('./admin/tabs/TabInfo').then((m) => ({ default: m.TabInfo })));
const TabColors = React.lazy(() => import('./admin/tabs/TabColors').then((m) => ({ default: m.TabColors })));
const TabImages = React.lazy(() => import('./admin/tabs/TabImages').then((m) => ({ default: m.TabImages })));
const TabServices = React.lazy(() => import('./admin/tabs/TabServices').then((m) => ({ default: m.TabServices })));
const TabSlots = React.lazy(() => import('./admin/tabs/TabSlots').then((m) => ({ default: m.TabSlots })));
const TabCalendar = React.lazy(() => import('./admin/tabs/TabCalendar').then((m) => ({ default: m.TabCalendar })));
const TabBookingsCalendar = React.lazy(() => import('./admin/tabs/TabBookingsCalendar').then((m) => ({ default: m.TabBookingsCalendar })));
const TabSupabase = React.lazy(() => import('./admin/tabs/TabSupabase').then((m) => ({ default: m.TabSupabase })));

export const AdminModal: React.FC = () => {
  const {
    isAdminModalOpen,
    closeAdmin,
    isAdmin,
    verifyPin,
    logoutAdmin,
    settings,
    updateSettings,
    imageSlots,
    updateImageSlots,
    services,
    updateServices,
    calendarSlots,
    updateCalendarSlots,
    syncSettingsWithSupabase,
    syncServicesWithSupabase,
    checkSupabaseStatus,
    testSupabase,
    isSupabaseActive,
    isConnected,
    adminInitialTab,
    canUndo,
    undoLastChange,
  } = useBoutique();

  // Pin entry state
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<
    'info' | 'colors' | 'images' | 'services' | 'slots' | 'calendar' | 'bookings' | 'supabase'
  >('info');

  // Local state for forms
  const [settingsForm, setSettingsForm] = useState(settings);
  const [imageSlotsForm, setImageSlotsForm] = useState(imageSlots);
  const [servicesList, setServicesList] = useState(services);
  const [slotsList, setSlotsList] = useState(calendarSlots);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isSavingServices, setIsSavingServices] = useState(false);

  // Sync state when props change
  React.useEffect(() => {
    if (isAdminModalOpen) {
      setSettingsForm(settings);
    }
  }, [settings, isAdminModalOpen]);

  React.useEffect(() => {
    setImageSlotsForm(imageSlots);
  }, [imageSlots]);

  React.useEffect(() => {
    setServicesList(services);
  }, [services]);

  React.useEffect(() => {
    setSlotsList(calendarSlots);
  }, [calendarSlots]);

  React.useEffect(() => {
    if (adminInitialTab) {
      setActiveTab(adminInitialTab);
    }
  }, [adminInitialTab, isAdminModalOpen]);

  if (!isAdminModalOpen) return null;

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setPinError('');
    const valid = await verifyPin(pinInput);
    setIsVerifying(false);
    if (!valid) {
      setPinError('Incorrect password. Please try again.');
    } else {
      setPinInput('');
    }
  };

  const showSuccessNotice = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  const handleSaveSettings = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsSavingSettings(true);
    try {
      const syncResult = await updateSettings(settingsForm);
      if (syncResult && !syncResult.success) {
        if (syncResult.code === 'RLS_DENIED') {
          showSuccessNotice('Saved locally! Supabase note: Permission denied (RLS). Go to Supabase tab to copy permissive SQL.');
        } else if (syncResult.code === 'TABLE_NOT_FOUND') {
          showSuccessNotice('Saved locally! Supabase note: Table "boutique_settings" not found. Run SQL in Supabase tab.');
        } else {
          showSuccessNotice(`Saved locally! Supabase note: ${syncResult.message}`);
        }
      } else {
        showSuccessNotice(
          isSupabaseActive
            ? 'Boutique & color settings saved and synced to Supabase database!'
            : 'Boutique & color settings saved successfully!'
        );
      }
    } catch (err: any) {
      console.warn('Settings save warning:', err);
      showSuccessNotice('Settings saved in browser storage!');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSaveImageSlots = async (e?: React.FormEvent) => {
    e?.preventDefault();
    try {
      await updateImageSlots(imageSlotsForm);
      showSuccessNotice('Image slots saved successfully!');
    } catch (err) {
      console.warn('Images save warning:', err);
      showSuccessNotice('Images saved in browser storage!');
    }
  };

  const handleSaveServices = async () => {
    setIsSavingServices(true);
    try {
      const syncResult = await updateServices(servicesList);
      if (syncResult && !syncResult.success) {
        if (syncResult.code === 'RLS_DENIED') {
          showSuccessNotice('Services saved locally! Supabase note: Permission denied (RLS). Go to Supabase tab to copy permissive SQL.');
        } else if (syncResult.code === 'TABLE_NOT_FOUND') {
          showSuccessNotice('Services saved locally! Supabase note: Table "services" not found. Run SQL in Supabase tab.');
        } else {
          showSuccessNotice(`Services saved locally! Supabase note: ${syncResult.message}`);
        }
      } else {
        showSuccessNotice(
          isSupabaseActive
            ? `Service catalog (${servicesList.length} offerings) synced to Supabase database!`
            : 'Service catalog updated across all sessions!'
        );
      }
    } catch {
      alert('Failed to update services');
    } finally {
      setIsSavingServices(false);
    }
  };

  const handleSaveAllSlots = async () => {
    try {
      await updateCalendarSlots(slotsList);
      showSuccessNotice('All time slots updated and synchronized live!');
    } catch {
      console.error('Failed to update calendar slots');
    }
  };

  const handleGlobalSave = () => {
    switch (activeTab) {
      case 'info':
      case 'colors':
      case 'calendar':
      case 'supabase':
        handleSaveSettings();
        break;
      case 'images':
        handleSaveImageSlots();
        break;
      case 'services':
        handleSaveServices();
        break;
      case 'slots':
        handleSaveAllSlots();
        break;
      default:
        break;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full h-[100dvh] sm:h-auto max-w-5xl sm:max-h-[92vh] bg-[#2D1B28] text-white rounded-none sm:rounded-3xl border-0 sm:border border-white/20 shadow-2xl flex flex-col overflow-hidden"
        style={{ fontFamily: 'Verdana, Geneva, sans-serif' }}
      >
        
        {/* Top Header */}
        <div className="px-6 py-5 border-b border-white/10 bg-[#251421] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#C45266] text-white flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[11px] text-white/80">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span>{isConnected ? 'Real-Time Sync Active' : 'Offline'}</span>
                {isSupabaseActive && (
                  <span className="text-emerald-300 font-mono">· Supabase Postgres Changes Connected</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <>
                <button
                  type="button"
                  onClick={handleGlobalSave}
                  className="px-3 py-1.5 rounded-full bg-[#C45266] hover:bg-[#b04356] text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow cursor-pointer border border-white/10"
                  title="Save changes in current tab"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Save Changes</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    const undone = await undoLastChange();
                    if (undone) {
                      showSuccessNotice('Reverted last admin change!');
                    }
                  }}
                  disabled={!canUndo}
                  className={`px-3 py-1.5 rounded-full border text-xs font-medium flex items-center gap-1.5 transition-all ${
                    canUndo
                      ? 'bg-amber-500/20 hover:bg-amber-500/40 text-amber-200 border-amber-400/40 cursor-pointer shadow'
                      : 'bg-white/5 text-white/30 border-white/10 cursor-not-allowed opacity-50'
                  }`}
                  title="Undo previous admin action"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Undo Last Change</span>
                </button>

                <button
                  type="button"
                  onClick={logoutAdmin}
                  className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs text-white/80 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Lock Session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
            <button
              type="button"
              onClick={closeAdmin}
              className="p-2 text-white/80 hover:text-white bg-white/10 rounded-full transition-colors cursor-pointer"
              aria-label="Close portal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        {!isAdmin ? (
          /* PIN Verification Gate */
          <div className="p-8 sm:p-12 text-center max-w-md mx-auto my-auto space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-[#C45266]/20 text-white/80 border border-rose-400/40 flex items-center justify-center mx-auto shadow-inner">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-editorial text-3xl text-white">Staff Authentication</h3>
              <p className="text-xs text-white/60 mt-1">
                Enter your boutique security PIN to access appointment bookings and live settings.
              </p>
            </div>

            {pinError && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{pinError}</span>
              </div>
            )}

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Enter Password"
                  className="w-full text-center tracking-[0.3em] font-mono text-xl bg-white/5 border border-white/20 rounded-2xl py-3 px-12 text-white focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-rose-400 placeholder:text-neutral-500 placeholder:tracking-normal placeholder:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1 transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-3.5 rounded-full bg-[#C45266] hover:bg-[#b04356] text-white font-medium text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>{isVerifying ? 'Checking...' : 'Unlock Management Panel'}</span>
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Mobile Touch Horizontal Tab Bar */}
            <div className="md:hidden border-b border-white/10 bg-[#1F0E1A] shrink-0 px-3 py-2.5 flex gap-2 overflow-x-auto no-scrollbar items-center touch-pan-x">
              <button
                type="button"
                onClick={() => setActiveTab('info')}
                className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap flex items-center gap-1.5 shrink-0 min-h-[40px] cursor-pointer ${
                  activeTab === 'info' ? 'bg-[#C45266] text-white shadow-md font-semibold' : 'bg-white/5 text-zinc-300 hover:bg-white/10'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Info</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('colors')}
                className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap flex items-center gap-1.5 shrink-0 min-h-[40px] cursor-pointer ${
                  activeTab === 'colors' ? 'bg-[#C45266] text-white shadow-md font-semibold' : 'bg-white/5 text-zinc-300 hover:bg-white/10'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Colors</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('images')}
                className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap flex items-center gap-1.5 shrink-0 min-h-[40px] cursor-pointer ${
                  activeTab === 'images' ? 'bg-[#C45266] text-white shadow-md font-semibold' : 'bg-white/5 text-zinc-300 hover:bg-white/10'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Images</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('services')}
                className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap flex items-center gap-1.5 shrink-0 min-h-[40px] cursor-pointer ${
                  activeTab === 'services' ? 'bg-[#C45266] text-white shadow-md font-semibold' : 'bg-white/5 text-zinc-300 hover:bg-white/10'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Services</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('slots')}
                className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap flex items-center gap-1.5 shrink-0 min-h-[40px] cursor-pointer ${
                  activeTab === 'slots' ? 'bg-[#C45266] text-white shadow-md font-semibold' : 'bg-white/5 text-zinc-300 hover:bg-white/10'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Slots</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('calendar')}
                className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap flex items-center gap-1.5 shrink-0 min-h-[40px] cursor-pointer ${
                  activeTab === 'calendar' ? 'bg-[#C45266] text-white shadow-md font-semibold' : 'bg-white/5 text-zinc-300 hover:bg-white/10'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Google Cal</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('bookings')}
                className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap flex items-center gap-1.5 shrink-0 min-h-[40px] cursor-pointer ${
                  activeTab === 'bookings' ? 'bg-[#C45266] text-white shadow-md font-semibold' : 'bg-white/5 text-zinc-300 hover:bg-white/10'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-rose-300" />
                <span>Bookings Calendar</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('supabase')}
                className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap flex items-center gap-1.5 shrink-0 min-h-[40px] cursor-pointer ${
                  activeTab === 'supabase' ? 'bg-[#C45266] text-white shadow-md font-semibold' : 'bg-white/5 text-zinc-300 hover:bg-white/10'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>Supabase</span>
              </button>
            </div>

            {/* Desktop Sidebar Tabs */}
            <div className="hidden md:flex w-56 bg-[#1F0E1A] border-r border-white/10 p-4 flex-col gap-1 shrink-0">

              <button
                type="button"
                onClick={() => setActiveTab('info')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium tracking-wide transition-all cursor-pointer ${
                  activeTab === 'info'
                    ? 'bg-[#C45266] text-white shadow-md'
                    : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Boutique Info</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('colors')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium tracking-wide transition-all cursor-pointer ${
                  activeTab === 'colors'
                    ? 'bg-[#C45266] text-white shadow-md'
                    : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Palette className="w-4 h-4" />
                <span>Theme & Colors</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('images')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium tracking-wide transition-all cursor-pointer ${
                  activeTab === 'images'
                    ? 'bg-[#C45266] text-white shadow-md'
                    : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Logo & Images</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('services')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium tracking-wide transition-all cursor-pointer ${
                  activeTab === 'services'
                    ? 'bg-[#C45266] text-white shadow-md'
                    : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span>Services & Prices</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('slots')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium tracking-wide transition-all cursor-pointer ${
                  activeTab === 'slots'
                    ? 'bg-[#C45266] text-white shadow-md'
                    : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Calendar Slots</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('calendar')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium tracking-wide transition-all cursor-pointer ${
                  activeTab === 'calendar'
                    ? 'bg-[#C45266] text-white shadow-md'
                    : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Google Calendar</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('bookings')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium tracking-wide transition-all cursor-pointer ${
                  activeTab === 'bookings'
                    ? 'bg-[#C45266] text-white shadow-md'
                    : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Calendar className="w-4 h-4 text-rose-300" />
                <span>Bookings Calendar</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('supabase')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium tracking-wide transition-all cursor-pointer ${
                  activeTab === 'supabase'
                    ? 'bg-[#C45266] text-white shadow-md'
                    : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Database className="w-4 h-4" />
                <span>Supabase Sync</span>
              </button>
            </div>

            {/* Main Panel Content with Code-Splitting Suspense */}
            <div className="flex-1 p-4 sm:p-8 overflow-y-auto pb-48 sm:pb-12 scroll-smooth overscroll-contain">
              {saveSuccessMsg && (
                <div className="mb-6 p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              <React.Suspense fallback={<TabLoader />}>
                {activeTab === 'info' && (
                  <TabInfo
                    settingsForm={settingsForm}
                    setSettingsForm={setSettingsForm}
                    handleSaveSettings={handleSaveSettings}
                    isSavingSettings={isSavingSettings}
                    isSupabaseActive={isSupabaseActive}
                  />
                )}
                {activeTab === 'colors' && (
                  <TabColors
                    settingsForm={settingsForm}
                    setSettingsForm={setSettingsForm}
                    handleSaveSettings={handleSaveSettings}
                    updateSettings={updateSettings}
                    showSuccessNotice={showSuccessNotice}
                    isSavingSettings={isSavingSettings}
                    isSupabaseActive={isSupabaseActive}
                  />
                )}
                {activeTab === 'images' && (
                  <TabImages
                    imageSlotsForm={imageSlotsForm}
                    setImageSlotsForm={setImageSlotsForm}
                    handleSaveImageSlots={handleSaveImageSlots}
                    updateImageSlots={updateImageSlots}
                    showSuccessNotice={showSuccessNotice}
                  />
                )}
                {activeTab === 'services' && (
                  <TabServices
                    servicesList={servicesList}
                    setServicesList={setServicesList}
                    updateServices={updateServices}
                    handleSaveServices={handleSaveServices}
                    isSavingServices={isSavingServices}
                    settingsForm={settingsForm}
                    showSuccessNotice={showSuccessNotice}
                    isSupabaseActive={isSupabaseActive}
                  />
                )}
                {activeTab === 'slots' && (
                  <TabSlots
                    slotsList={slotsList}
                    setSlotsList={setSlotsList}
                    updateCalendarSlots={updateCalendarSlots}
                    showSuccessNotice={showSuccessNotice}
                  />
                )}
                {activeTab === 'calendar' && (
                  <TabCalendar
                    settingsForm={settingsForm}
                    setSettingsForm={setSettingsForm}
                  />
                )}
                {activeTab === 'bookings' && (
                  <TabBookingsCalendar />
                )}
                {activeTab === 'supabase' && (
                  <TabSupabase
                    settingsForm={settingsForm}
                    setSettingsForm={setSettingsForm}
                    servicesList={servicesList}
                    isSupabaseActive={isSupabaseActive}
                    testSupabase={testSupabase}
                    checkSupabaseStatus={checkSupabaseStatus}
                    syncSettingsWithSupabase={syncSettingsWithSupabase}
                    syncServicesWithSupabase={syncServicesWithSupabase}
                    showSuccessNotice={showSuccessNotice}
                  />
                )}
              </React.Suspense>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
