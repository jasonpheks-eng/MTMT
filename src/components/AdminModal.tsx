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
  Upload,
  RefreshCw,
  LogOut,
  ExternalLink,
  Phone,
  Trash2,
  Plus,
  ShieldCheck,
  FlipHorizontal,
  FlipVertical,
  Sliders,
  Layers,
  RotateCcw,
  Palette,
  Save,
  Sparkles,
  Type,
  Eye,
  EyeOff,
  Copy,
  Check,
} from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Appointment, ServiceItem, ImageSlots, CalendarTimeSlot, SingleImageConfig } from '../types';
import { processImageFile, removeImageBackground } from '../lib/imageUpload';
import { getImageStyleAndClasses } from '../lib/imageStyle';
import { ExperienceGalleryEditor } from './ExperienceGallery';
import { authenticateCEOForCalendar, syncAppointmentToGoogleCalendar, getCachedCalendarToken, signOutFromCalendar } from '../lib/googleCalendar';
import { SUPABASE_SETUP_SQL, SupabaseHealthStatus, SupabaseSyncResult } from '../lib/supabaseSync';

export const AdminModal: React.FC = () => {
  const {
    isAdminModalOpen,
    closeAdmin,
    isAdmin,
    verifyPin,
    logoutAdmin,
    appointments,
    updateAppointmentStatus,
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
    'info' | 'colors' | 'images' | 'services' | 'slots' | 'supabase' | 'calendar'
  >('info');

  // Appointments filter
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');

  // Local state for forms
  const [settingsForm, setSettingsForm] = useState(settings);
  const [imageSlotsForm, setImageSlotsForm] = useState(imageSlots);
  const [servicesList, setServicesList] = useState(services);
  const [slotsList, setSlotsList] = useState<CalendarTimeSlot[]>(calendarSlots);
  const [newSlotTime, setNewSlotTime] = useState('');
  const [newSlotPeriod, setNewSlotPeriod] = useState<'morning' | 'afternoon' | 'evening'>('afternoon');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [supabaseTestResult, setSupabaseTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isSavingServices, setIsSavingServices] = useState(false);
  const [isSyncingAllSupabase, setIsSyncingAllSupabase] = useState(false);
  const [supabaseHealth, setSupabaseHealth] = useState<SupabaseHealthStatus | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  // Google Calendar Auth State for CEO
  const [isConnectingCalendar, setIsConnectingCalendar] = useState(false);
  const [calendarConnectMsg, setCalendarConnectMsg] = useState('');

  const handleConnectCalendar = async () => {
    setIsConnectingCalendar(true);
    setCalendarConnectMsg('');
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
      setCalendarConnectMsg(err.message || 'Google Calendar connection failed');
    } finally {
      setIsConnectingCalendar(false);
    }
  };

  // New Treatment Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'nails' | 'lashes' | 'hair'>('nails');
  const [newPrice, setNewPrice] = useState<number>(75);
  const [newDuration, setNewDuration] = useState<number>(60);
  const [newDescription, setNewDescription] = useState('');

  // Sync state when props change (only if modal just opened or settings changed from outside)
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

  const handleFileUpload = async (slotKey: keyof ImageSlots, file: File) => {
    try {
      const optimized = await processImageFile(file);
      setImageSlotsForm((prev) => ({
        ...prev,
        [slotKey]: optimized,
      }));
      showSuccessNotice(`Slot "${slotKey}" loaded locally. Click "Save & Broadcast" to apply live.`);
    } catch (err) {
      console.error('File upload error:', err);
      alert('Failed to process image file');
    }
  };

  const handleUpdateImageConfig = (
    slotKey: string,
    partialConfig: Partial<SingleImageConfig>
  ) => {
    const currentConfigs = imageSlotsForm.configs || {};
    const updatedSlotConfig = {
      ...(currentConfigs[slotKey] || {}),
      ...partialConfig,
    };
    const newConfigs = {
      ...currentConfigs,
      [slotKey]: updatedSlotConfig,
    };
    const updatedForm = {
      ...imageSlotsForm,
      configs: newConfigs,
    };
    setImageSlotsForm(updatedForm);
  };

  const ImageSlotEditor: React.FC<{
    slotKey: keyof Omit<ImageSlots, 'configs'>;
    label: string;
    defaultAspect: string;
  }> = ({ slotKey, label, defaultAspect }) => {
    const currentUrl = imageSlotsForm[slotKey] as string;
    const config = imageSlotsForm.configs?.[slotKey] || {};
    const previewStyle = getImageStyleAndClasses(slotKey, imageSlotsForm.configs, defaultAspect, 'object-cover');
    const [isDragOver, setIsDragOver] = useState(false);

    const handleAutoEraseBg = async () => {
      try {
        showSuccessNotice(`Keying out background for ${label}...`);
        const transparentPng = await removeImageBackground(currentUrl);
        setImageSlotsForm((prev) => ({
          ...prev,
          [slotKey]: transparentPng,
        }));
        handleUpdateImageConfig(slotKey, { removeBg: true });
        showSuccessNotice(`Background removed locally for ${label}! Click Save to apply.`);
      } catch (err) {
        console.error('BG removal failed:', err);
      }
    };

    return (
      <div
        key={slotKey}
        className={`p-5 rounded-2xl bg-white/5 border transition-all space-y-4 ${isDragOver ? 'border-rose-400 bg-rose-950/20' : 'border-white/10 hover:border-white/40 shadow-sm backdrop-blur-sm'}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file && file.type.startsWith('image/')) handleFileUpload(slotKey, file);
        }}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-white flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-white/80" />
            <span>{label}</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-950 text-white/80 border border-rose-800/40">
              Border: {config.borderStyle || 'None'}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-950 text-white/80 border border-rose-800/40">
              Aspect: {config.aspectRatio || 'Default (' + defaultAspect + ')'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
          <div className="sm:col-span-4 flex flex-col items-center gap-2">
            <label className={`w-full max-h-[190px] relative flex items-center justify-center cursor-pointer group/upload overflow-hidden ${previewStyle.containerClasses}`}>
              <img
                src={currentUrl}
                alt={label}
                className={previewStyle.combinedClasses}
                style={previewStyle.style}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/65 opacity-0 group-hover/upload:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1 p-2 text-center rounded-2xl backdrop-blur-[2px]">
                <Upload className="w-6 h-6 text-white/80 animate-bounce" />
                <span className="text-[11px] font-semibold tracking-wide">Click to Upload Image</span>
                <span className="text-[9px] text-white/60">Or drop photo file here</span>
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(slotKey, e.target.files[0])}
              />
            </label>
            <span className="text-[10px] text-white/60 font-mono">Live Preview (Click or drop to upload)</span>
          </div>

          <div className="sm:col-span-8 space-y-3">
            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase tracking-wider text-white/60">
                Image Source URL / Upload or Drop
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentUrl}
                  onChange={(e) => setImageSlotsForm({ ...imageSlotsForm, [slotKey]: e.target.value })}
                  placeholder="Image URL or path..."
                  className="flex-1 bg-white/5 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white placeholder-rose-200/30 focus:outline-none focus:border-white/50 font-mono"
                />
                <label className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5 shrink-0 text-white">
                  <Upload className="w-3.5 h-3.5 text-white/80" />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(slotKey, e.target.files[0])}
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] uppercase font-mono text-white/60 mb-1">
                  Aspect Ratio
                </label>
                <select
                  value={config.aspectRatio || 'auto'}
                  onChange={(e) => handleUpdateImageConfig(slotKey, { aspectRatio: e.target.value as any })}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-white/50 font-mono"
                >
                  <option value="4/5">4:5 (Portrait)</option>
                  <option value="1/1">1:1 (Square)</option>
                  <option value="4/3">4:3 (Landscape)</option>
                  <option value="16/9">16:9 (Wide)</option>
                  <option value="3/4">3:4 (Tall)</option>
                  <option value="auto">Auto / Natural</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-white/60 mb-1">
                  Positioning
                </label>
                <select
                  value={config.position || 'center'}
                  onChange={(e) => handleUpdateImageConfig(slotKey, { position: e.target.value as any })}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-white/50 font-mono"
                >
                  <option value="center">Center</option>
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-white/60 mb-1">
                  Object Fit
                </label>
                <select
                  value={config.objectFit || 'cover'}
                  onChange={(e) => handleUpdateImageConfig(slotKey, { objectFit: e.target.value as any })}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-white/50 font-mono"
                >
                  <option value="cover">Cover (Fill)</option>
                  <option value="contain">Contain (Fit)</option>
                  <option value="fill">Stretch</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10">
              <div>
                <label className="block text-[10px] uppercase font-mono text-white/60 mb-1">
                  Border Style (Theme Blended)
                </label>
                <select
                  value={config.borderStyle || 'none'}
                  onChange={(e) => handleUpdateImageConfig(slotKey, { borderStyle: e.target.value as any })}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-white/50 font-mono"
                >
                  <option value="none">No Border (Clean)</option>
                  <option value="soft-translucent">Soft Translucent Edges</option>
                  <option value="blend-in">Blend-In Effect Option</option>
                  <option value="ambient-glow">Ambient Rose Glow</option>
                  <option value="glass-card">Frosted Glass Border</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-white/60 mb-1">
                  Corner Shape
                </label>
                <select
                  value={config.cornerStyle || 'rounded'}
                  onChange={(e) => handleUpdateImageConfig(slotKey, { cornerStyle: e.target.value as any })}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-white/50 font-mono"
                >
                  <option value="rounded">Rounded Corners (2xl)</option>
                  <option value="pill">Deep Pill Curve (3xl)</option>
                  <option value="full">Circular / Oval (Full)</option>
                  <option value="sharp">Sharp Rectangular (None)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono text-white/60">Zoom Size:</span>
                <input
                  type="range"
                  min="0.8"
                  max="2.2"
                  step="0.1"
                  value={config.scale || 1.0}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    const currentConfigs = imageSlotsForm.configs || {};
                    const updatedSlotConfig = { ...(currentConfigs[slotKey] || {}), scale: val };
                    setImageSlotsForm({
                      ...imageSlotsForm,
                      configs: { ...currentConfigs, [slotKey]: updatedSlotConfig }
                    });
                  }}
                  onMouseUp={(e) => {
                    const val = parseFloat((e.target as HTMLInputElement).value);
                    handleUpdateImageConfig(slotKey, { scale: val });
                  }}
                  onTouchEnd={(e) => {
                    const val = parseFloat((e.target as HTMLInputElement).value);
                    handleUpdateImageConfig(slotKey, { scale: val });
                  }}
                  className="w-20 sm:w-28 accent-[#C45266] cursor-pointer"
                />
                <span className="text-[11px] font-mono text-white font-bold">{Math.round((config.scale || 1.0) * 100)}%</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleUpdateImageConfig(slotKey, { flipH: !config.flipH })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1 transition-all ${
                    config.flipH
                      ? 'bg-[#C45266] text-white font-semibold shadow'
                      : 'bg-white/10 hover:bg-white/20 text-white/80'
                  }`}
                  title="Flip image horizontally"
                >
                  <FlipHorizontal className="w-3.5 h-3.5" />
                  <span>Flip H</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateImageConfig(slotKey, { flipV: !config.flipV })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1 transition-all ${
                    config.flipV
                      ? 'bg-[#C45266] text-white font-semibold shadow'
                      : 'bg-white/10 hover:bg-white/20 text-white/80'
                  }`}
                  title="Flip image vertically"
                >
                  <FlipVertical className="w-3.5 h-3.5" />
                  <span>Flip V</span>
                </button>

                <button
                  type="button"
                  onClick={handleAutoEraseBg}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono bg-emerald-700 hover:bg-emerald-600 text-white font-semibold shadow flex items-center gap-1 transition-all"
                  title="Automatically key out white/light background to transparent PNG"
                >
                  <span>Auto Erase BG</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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

  const handleAddSlot = async () => {
    if (!newSlotTime.trim()) {
      alert('Please enter a time slot, e.g. 03:30 PM');
      return;
    }
    const cleanTime = newSlotTime.trim();
    if (slotsList.some((s) => s.time.toLowerCase() === cleanTime.toLowerCase())) {
      alert(`A time slot for "${cleanTime}" already exists.`);
      return;
    }
    const newSlot: CalendarTimeSlot = {
      time: cleanTime,
      period: newSlotPeriod,
      is_available: true,
    };
    const updated = [...slotsList, newSlot];
    setSlotsList(updated);
    try {
      await updateCalendarSlots(updated);
      setNewSlotTime('');
      showSuccessNotice(`Added new time slot "${newSlot.time}"!`);
    } catch {
      alert('Failed to save new time slot');
    }
  };

  const handleDeleteSlot = async (index: number) => {
    const slotToDelete = slotsList[index];
    const updated = slotsList.filter((_, i) => i !== index);
    setSlotsList(updated);
    try {
      await updateCalendarSlots(updated);
      showSuccessNotice(`Removed time slot "${slotToDelete.time}"`);
    } catch {
      console.error('Failed to delete time slot');
    }
  };

  const handleUpdateSlotField = (index: number, partial: Partial<CalendarTimeSlot>) => {
    const updated = [...slotsList];
    updated[index] = { ...updated[index], ...partial };
    setSlotsList(updated);
  };

  const handleSaveAllSlots = async () => {
    try {
      await updateCalendarSlots(slotsList);
      showSuccessNotice('All time slots updated and synchronized live!');
    } catch {
      console.error('Failed to update calendar slots');
    }
  };

  const handleResetDefaultSlots = async () => {
    const defaultSlots: CalendarTimeSlot[] = [
      { time: '10:00 AM', period: 'morning', is_available: true },
      { time: '11:30 AM', period: 'morning', is_available: true },
      { time: '01:00 PM', period: 'afternoon', is_available: true },
      { time: '02:30 PM', period: 'afternoon', is_available: true },
      { time: '04:00 PM', period: 'afternoon', is_available: true },
      { time: '05:30 PM', period: 'evening', is_available: true },
      { time: '07:00 PM', period: 'evening', is_available: true },
    ];
    setSlotsList(defaultSlots);
    try {
      await updateCalendarSlots(defaultSlots);
      showSuccessNotice('Reset slots to standard boutique schedule!');
    } catch {
      console.error('Failed to reset time slots');
    }
  };

  const showSuccessNotice = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(''), 4000);
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

  const filteredAppointments = appointments.filter((apt) => {
    if (statusFilter === 'all') return true;
    return apt.status === statusFilter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-[#2D1B28] text-white rounded-3xl border border-white/20 shadow-2xl flex flex-col overflow-hidden">
        
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
                  onClick={handleGlobalSave}
                  className="px-3 py-1.5 rounded-full bg-[#C45266] hover:bg-[#b04356] text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow cursor-pointer border border-white/10"
                  title="Save changes in current tab"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Save Changes</span>
                </button>

                <button
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
                  onClick={logoutAdmin}
                  className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs text-white/80 flex items-center gap-1.5 transition-colors"
                  title="Lock Session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
            <button
              onClick={closeAdmin}
              className="p-2 text-white/80 hover:text-white bg-white/10 rounded-full transition-colors"
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
            
            {/* Sidebar Tabs */}
            {/* Mobile Tab Selector */}
            <div className="md:hidden px-4 py-3 border-b border-white/10 bg-[#1F0E1A] shrink-0">
              <label className="block text-[10px] uppercase tracking-widest text-white/60 mb-1.5 px-1 font-semibold">
                Management Section
              </label>
              <select 
                value={activeTab} 
                onChange={(e) => setActiveTab(e.target.value as any)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white/50 font-medium appearance-none shadow-inner"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23ea297e\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25rem' }}
              >
                <option value="info">Boutique Information</option>
                <option value="colors">Theme & Colors</option>
                <option value="images">Logo & Boutique Images</option>
                <option value="services">Services & Prices</option>
                <option value="slots">Calendar Slots</option>
                <option value="calendar">Google Calendar</option>
                <option value="supabase">Supabase Sync</option>
              </select>
            </div>

            {/* Desktop Sidebar Tabs */}
            <div className="hidden md:flex w-56 bg-[#1F0E1A] border-r border-white/10 p-4 flex-col gap-1 shrink-0">

              <button
                onClick={() => setActiveTab('info')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium tracking-wide transition-all ${
                  activeTab === 'info'
                    ? 'bg-[#C45266] text-white shadow-md'
                    : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Boutique Info</span>
              </button>

              <button
                onClick={() => setActiveTab('colors')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium tracking-wide transition-all ${
                  activeTab === 'colors'
                    ? 'bg-[#C45266] text-white shadow-md'
                    : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Palette className="w-4 h-4" />
                <span>Theme & Colors</span>
              </button>

              <button
                onClick={() => setActiveTab('images')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium tracking-wide transition-all ${
                  activeTab === 'images'
                    ? 'bg-[#C45266] text-white shadow-md'
                    : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Logo & Images</span>
              </button>

              <button
                onClick={() => setActiveTab('services')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium tracking-wide transition-all ${
                  activeTab === 'services'
                    ? 'bg-[#C45266] text-white shadow-md'
                    : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span>Services & Prices</span>
              </button>

              <button
                onClick={() => setActiveTab('slots')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium tracking-wide transition-all ${
                  activeTab === 'slots'
                    ? 'bg-[#C45266] text-white shadow-md'
                    : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Calendar Slots</span>
              </button>

              <button
                onClick={() => setActiveTab('calendar')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium tracking-wide transition-all ${
                  activeTab === 'calendar'
                    ? 'bg-[#C45266] text-white shadow-md'
                    : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Google Calendar</span>
              </button>

              <button
                onClick={() => setActiveTab('supabase')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium tracking-wide transition-all ${
                  activeTab === 'supabase'
                    ? 'bg-[#C45266] text-white shadow-md'
                    : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Database className="w-4 h-4" />
                <span>Supabase Sync</span>
              </button>
            </div>

            {/* Main Panel Content */}
            <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
              
              {saveSuccessMsg && (
                <div className="mb-6 p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}



              {/* TAB 1: BOUTIQUE INFO & CONTACT */}
              {activeTab === 'info' && (
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
                          onChange={(e) => {
                            const val = e.target.value;
                            const updated = { ...settingsForm, boutique_name: val };
                            setSettingsForm(updated);
                            updateSettings(updated);
                          }}
                          placeholder="mt maison"
                          className="w-full bg-white/5 border border-white/20 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-white/50"
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
                          onChange={(e) => {
                            const val = e.target.value;
                            const updated = { ...settingsForm, tagline: val };
                            setSettingsForm(updated);
                            updateSettings(updated);
                          }}
                          placeholder="where beauty meets elegance"
                          className="w-full bg-white/5 border border-white/20 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-white/50"
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
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            const updated = { ...settingsForm, hero_font_size: val };
                            setSettingsForm(updated);
                            updateSettings(updated);
                          }}
                          className="w-full accent-rose-500 cursor-pointer"
                        />
                        <div className="text-right text-[10px] text-zinc-400 font-mono mt-1">{settingsForm.hero_font_size || 65}px</div>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-mono text-white/60 mb-1">Description Align</label>
                        <select
                          value={settingsForm.hero_description_align || 'left'}
                          onChange={(e) => {
                            const val = e.target.value as any;
                            const updated = { ...settingsForm, hero_description_align: val };
                            setSettingsForm(updated);
                            updateSettings(updated);
                          }}
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
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            const updated = { ...settingsForm, hero_description_line_height: val };
                            setSettingsForm(updated);
                            updateSettings(updated);
                          }}
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
                        onChange={(e) => {
                          const val = e.target.value;
                          const updated = { ...settingsForm, hero_description: val };
                          setSettingsForm(updated);
                          updateSettings(updated);
                        }}
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
                          onChange={(e) => {
                            const val = e.target.value;
                            const updated = { ...settingsForm, hero_button_text: val };
                            setSettingsForm(updated);
                            updateSettings(updated);
                          }}
                          className="w-full bg-white/5 border border-white/20 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-white/50"
                        />
                      </div>

                      <div>
                        <label className="block text-xs uppercase tracking-wider text-white/80 mb-1 font-medium">Hero Scroll Hint</label>
                        <input
                          type="text"
                          value={settingsForm.hero_scroll_text || 'Scroll to Explore'}
                          onChange={(e) => {
                            const val = e.target.value;
                            const updated = { ...settingsForm, hero_scroll_text: val };
                            setSettingsForm(updated);
                            updateSettings(updated);
                          }}
                          className="w-full bg-white/5 border border-white/20 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-white/50"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                      <label className="text-[11px] text-white/60 uppercase font-mono">Paragraph Color:</label>
                      <input
                        type="color"
                        value={settingsForm.hero_text_color || '#a1a1aa'}
                        onChange={(e) => {
                          const val = e.target.value;
                          const updated = { ...settingsForm, hero_text_color: val };
                          setSettingsForm(updated);
                          updateSettings(updated);
                        }}
                        className="w-8 h-7 rounded-md bg-white/10 border border-white/20 cursor-pointer overflow-hidden p-0"
                      />
                      <input
                        type="text"
                        value={settingsForm.hero_text_color || '#a1a1aa'}
                        onChange={(e) => {
                          const val = e.target.value;
                          const updated = { ...settingsForm, hero_text_color: val };
                          setSettingsForm(updated);
                          updateSettings(updated);
                        }}
                        className="w-20 bg-white/5 border border-white/20 rounded-md px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-white/50"
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
              )}

              {/* TAB: THEME & SECTION COLORS */}
              {activeTab === 'colors' && (
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
                        className="px-3.5 py-2 rounded-xl border border-white/20 hover:bg-white/10 text-white/80 text-xs font-medium transition-all"
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
                          aboutText: '#FBF8F6',
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
                          aboutText: '#F5F5F5',
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
                          aboutText: '#FFF0F5',
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
                          aboutText: '#F0FFF8',
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
                          aboutText: '#FFF5FF',
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
                          aboutText: '#EDF6F9',
                          expBg: '#04080D',
                          footerBg: '#020406',
                          footerText: '#90E0EF',
                        },
                        {
                          name: 'Champagne & Pearl',
                          heroBg: '#F5F1E9',
                          heroAccent: '#D4AF37',
                          navBg: '#FFFFFF',
                          navText: '#D4AF37',
                          detailsBg: '#E9E4D9',
                          detailsText: '#A68B31',
                          servicesBg: '#E9E4D9',
                          servicesCard: '#F5F1E9',
                          bookingBg: '#F5F1E9',
                          bookingCard: '#FFFFFF',
                          bookingAccent: '#D4AF37',
                          aboutBg: '#F5F1E9',
                          aboutText: '#8C7326',
                          expBg: '#F5F1E9',
                          footerBg: '#E9E4D9',
                          footerText: '#8C7326',
                        },
                        {
                          name: 'Midnight Sapphire',
                          heroBg: '#001233',
                          heroAccent: '#33A1FD',
                          navBg: '#000814',
                          navText: '#33A1FD',
                          detailsBg: '#001D3D',
                          detailsText: '#90E0EF',
                          servicesBg: '#001D3D',
                          servicesCard: '#003566',
                          bookingBg: '#003566',
                          bookingCard: '#001D3D',
                          bookingAccent: '#FFC300',
                          aboutBg: '#001233',
                          aboutText: '#90E0EF',
                          expBg: '#000814',
                          footerBg: '#000814',
                          footerText: '#90E0EF',
                        },
                        {
                          name: 'Dusty Rose & Gold',
                          heroBg: '#8E6C88',
                          heroAccent: '#E5B8C0',
                          navBg: '#2D142C',
                          navText: '#E5B8C0',
                          detailsBg: '#522E38',
                          detailsText: '#F7EBEB',
                          servicesBg: '#522E38',
                          servicesCard: '#815854',
                          bookingBg: '#815854',
                          bookingCard: '#522E38',
                          bookingAccent: '#E5B8C0',
                          aboutBg: '#8E6C88',
                          aboutText: '#F7EBEB',
                          expBg: '#2D142C',
                          footerBg: '#2D142C',
                          footerText: '#F7EBEB',
                        },
                        {
                          name: 'Tuscan Olive',
                          heroBg: '#3E442B',
                          heroAccent: '#D4AF37',
                          navBg: '#2D311E',
                          navText: '#D4AF37',
                          detailsBg: '#606C38',
                          detailsText: '#FEFAE0',
                          servicesBg: '#606C38',
                          servicesCard: '#283618',
                          bookingBg: '#283618',
                          bookingCard: '#606C38',
                          bookingAccent: '#DDA15E',
                          aboutBg: '#3E442B',
                          aboutText: '#FEFAE0',
                          expBg: '#283618',
                          footerBg: '#1A1F13',
                          footerText: '#FEFAE0',
                        },
                        {
                          name: 'Modern Slate',
                          heroBg: '#333533',
                          heroAccent: '#F5CB5C',
                          navBg: '#202020',
                          navText: '#F5CB5C',
                          detailsBg: '#242424',
                          detailsText: '#CFDBD5',
                          servicesBg: '#242424',
                          servicesCard: '#333533',
                          bookingBg: '#333533',
                          bookingCard: '#242424',
                          bookingAccent: '#F5CB5C',
                          aboutBg: '#333533',
                          aboutText: '#CFDBD5',
                          expBg: '#202020',
                          footerBg: '#202020',
                          footerText: '#CFDBD5',
                        },
                        {
                          name: 'Royal Amethyst',
                          heroBg: '#432371',
                          heroAccent: '#FAAE7B',
                          navBg: '#220B19',
                          navText: '#FAAE7B',
                          detailsBg: '#4A154B',
                          detailsText: '#E0E1DD',
                          servicesBg: '#4A154B',
                          servicesCard: '#220B19',
                          bookingBg: '#220B19',
                          bookingCard: '#4A154B',
                          bookingAccent: '#FAAE7B',
                          aboutBg: '#432371',
                          aboutText: '#E0E1DD',
                          expBg: '#220B19',
                          footerBg: '#1A0A13',
                          footerText: '#E0E1DD',
                        },
                        {
                          name: 'Blush & Peony',
                          heroBg: '#822646',
                          heroAccent: '#FF85A2',
                          navBg: '#2E0917',
                          navText: '#FF85A2',
                          detailsBg: '#54152C',
                          detailsText: '#FFD3E2',
                          servicesBg: '#54152C',
                          servicesCard: '#3E0D1F',
                          bookingBg: '#661935',
                          bookingCard: '#3E0D1F',
                          bookingAccent: '#FF85A2',
                          aboutBg: '#300817',
                          aboutText: '#FFF5F8',
                          expBg: '#220510',
                          footerBg: '#18030B',
                          footerText: '#FFD3E2',
                        },
                        {
                          name: 'Rose Quartz Luxe',
                          heroBg: '#6B2B43',
                          heroAccent: '#FFAEC7',
                          navBg: '#210A14',
                          navText: '#FFAEC7',
                          detailsBg: '#47182B',
                          detailsText: '#FFE5EC',
                          servicesBg: '#47182B',
                          servicesCard: '#33101E',
                          bookingBg: '#551E34',
                          bookingCard: '#33101E',
                          bookingAccent: '#FFAEC7',
                          aboutBg: '#270A17',
                          aboutText: '#FFF0F5',
                          expBg: '#1B0610',
                          footerBg: '#12030A',
                          footerText: '#FFE5EC',
                        },
                        {
                          name: 'Hot Barbie Glam',
                          heroBg: '#52062E',
                          heroAccent: '#FF1493',
                          navBg: '#1A000D',
                          navText: '#FF1493',
                          detailsBg: '#3B0421',
                          detailsText: '#FFB6C1',
                          servicesBg: '#3B0421',
                          servicesCard: '#2B0217',
                          bookingBg: '#480528',
                          bookingCard: '#2B0217',
                          bookingAccent: '#FF69B4',
                          aboutBg: '#220113',
                          aboutText: '#FFF0F5',
                          expBg: '#16000C',
                          footerBg: '#0F0008',
                          footerText: '#FFB6C1',
                        },
                        {
                          name: 'Cotton Candy Cashmere',
                          heroBg: '#702C53',
                          heroAccent: '#FF94D2',
                          navBg: '#260B1C',
                          navText: '#FF94D2',
                          detailsBg: '#4C1B37',
                          detailsText: '#FFE3F4',
                          servicesBg: '#4C1B37',
                          servicesCard: '#371227',
                          bookingBg: '#5C2243',
                          bookingCard: '#371227',
                          bookingAccent: '#FF94D2',
                          aboutBg: '#2C0A20',
                          aboutText: '#FFF5FA',
                          expBg: '#1F0616',
                          footerBg: '#160410',
                          footerText: '#FFE3F4',
                        },
                        {
                          name: 'Sakura Petal',
                          heroBg: '#5E2238',
                          heroAccent: '#FFB7C5',
                          navBg: '#210913',
                          navText: '#FFB7C5',
                          detailsBg: '#411526',
                          detailsText: '#FFECF1',
                          servicesBg: '#411526',
                          servicesCard: '#2F0D1B',
                          bookingBg: '#4F1B2F',
                          bookingCard: '#2F0D1B',
                          bookingAccent: '#FFB7C5',
                          aboutBg: '#260715',
                          aboutText: '#FFF8FA',
                          expBg: '#1A040E',
                          footerBg: '#110209',
                          footerText: '#FFECF1',
                        },
                        {
                          name: 'Magenta Noir',
                          heroBg: '#380B26',
                          heroAccent: '#FF007F',
                          navBg: '#12020C',
                          navText: '#FF007F',
                          detailsBg: '#27061A',
                          detailsText: '#FFAAD4',
                          servicesBg: '#27061A',
                          servicesCard: '#1C0312',
                          bookingBg: '#300820',
                          bookingCard: '#1C0312',
                          bookingAccent: '#FF007F',
                          aboutBg: '#180210',
                          aboutText: '#FFF0F8',
                          expBg: '#0F010A',
                          footerBg: '#0A0007',
                          footerText: '#FFAAD4',
                        },
                        {
                          name: 'Pastel Pink & Gold',
                          heroBg: '#7A3A54',
                          heroAccent: '#FFD700',
                          navBg: '#2B111C',
                          navText: '#FFD700',
                          detailsBg: '#57263A',
                          detailsText: '#FFF0BA',
                          servicesBg: '#57263A',
                          servicesCard: '#3E1929',
                          bookingBg: '#683046',
                          bookingCard: '#3E1929',
                          bookingAccent: '#FFD700',
                          aboutBg: '#31101F',
                          aboutText: '#FFF9F5',
                          expBg: '#220A15',
                          footerBg: '#17060E',
                          footerText: '#FFF0BA',
                        },
                        {
                          name: 'Flamingo Rose',
                          heroBg: '#6E1B38',
                          heroAccent: '#FF6F91',
                          navBg: '#250712',
                          navText: '#FF6F91',
                          detailsBg: '#4D1126',
                          detailsText: '#FFD2DD',
                          servicesBg: '#4D1126',
                          servicesCard: '#370A1A',
                          bookingBg: '#5C152E',
                          bookingCard: '#370A1A',
                          bookingAccent: '#FF6F91',
                          aboutBg: '#2B0514',
                          aboutText: '#FFF5F7',
                          expBg: '#1D030D',
                          footerBg: '#130108',
                          footerText: '#FFD2DD',
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
                              about_text_color: preset.footerText,
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
                          className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-rose-400/50 transition-all text-left group hover:scale-[1.02]"
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
                              onChange={(e) => {
                                const val = e.target.value;
                                const updated = { ...settingsForm, hero_text_color: val };
                                setSettingsForm(updated);
                                updateSettings(updated);
                              }}
                              className="w-10 h-9 rounded-lg bg-white/10 border border-white/20 cursor-pointer overflow-hidden p-0 shrink-0"
                            />
                            <input
                              type="text"
                              value={settingsForm.hero_text_color || '#a1a1aa'}
                              onChange={(e) => {
                                const val = e.target.value;
                                const updated = { ...settingsForm, hero_text_color: val };
                                setSettingsForm(updated);
                                updateSettings(updated);
                              }}
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
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const updated = { ...settingsForm, gooey_color_1: val };
                                    setSettingsForm(updated);
                                    updateSettings(updated);
                                  }}
                                  className="w-10 h-9 rounded-lg bg-white/10 border border-white/20 cursor-pointer overflow-hidden p-0 shrink-0"
                                />
                                <input
                                  type="text"
                                  value={settingsForm.gooey_color_1 || '#701932'}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const updated = { ...settingsForm, gooey_color_1: val };
                                    setSettingsForm(updated);
                                    updateSettings(updated);
                                  }}
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
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const updated = { ...settingsForm, gooey_color_2: val };
                                    setSettingsForm(updated);
                                    updateSettings(updated);
                                  }}
                                  className="w-10 h-9 rounded-lg bg-white/10 border border-white/20 cursor-pointer overflow-hidden p-0 shrink-0"
                                />
                                <input
                                  type="text"
                                  value={settingsForm.gooey_color_2 || '#240F1B'}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const updated = { ...settingsForm, gooey_color_2: val };
                                    setSettingsForm(updated);
                                    updateSettings(updated);
                                  }}
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
                                    onChange={(e) => updateSettings({ ...settingsForm, hero_gooey_sensitivity: parseInt(e.target.value) })}
                                    className="w-full accent-rose-500 h-1.5"
                                  />
                                  <div className="text-[10px] font-bold text-rose-300 text-right mt-0.5">{settingsForm.hero_gooey_sensitivity || 80}%</div>
                                </div>
                                <div>
                                  <label className="block text-[9px] uppercase font-mono text-white/50 mb-1">Hero Opacity</label>
                                  <input
                                    type="range" min="0" max="100"
                                    value={settingsForm.hero_gooey_opacity ?? 100}
                                    onChange={(e) => updateSettings({ ...settingsForm, hero_gooey_opacity: parseInt(e.target.value) })}
                                    className="w-full accent-rose-500 h-1.5"
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
                                    onChange={(e) => updateSettings({ ...settingsForm, services_gooey_sensitivity: parseInt(e.target.value) })}
                                    className="w-full accent-rose-500 h-1.5"
                                  />
                                  <div className="text-[10px] font-bold text-rose-300 text-right mt-0.5">{settingsForm.services_gooey_sensitivity || 80}%</div>
                                </div>
                                <div>
                                  <label className="block text-[9px] uppercase font-mono text-white/50 mb-1">Services Opacity</label>
                                  <input
                                    type="range" min="0" max="100"
                                    value={settingsForm.services_gooey_opacity ?? 30}
                                    onChange={(e) => updateSettings({ ...settingsForm, services_gooey_opacity: parseInt(e.target.value) })}
                                    className="w-full accent-rose-500 h-1.5"
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
                                    onChange={(e) => updateSettings({ ...settingsForm, booking_gooey_sensitivity: parseInt(e.target.value) })}
                                    className="w-full accent-rose-500 h-1.5"
                                  />
                                  <div className="text-[10px] font-bold text-rose-300 text-right mt-0.5">{settingsForm.booking_gooey_sensitivity || 80}%</div>
                                </div>
                                <div>
                                  <label className="block text-[9px] uppercase font-mono text-white/50 mb-1">Booking Opacity</label>
                                  <input
                                    type="range" min="0" max="100"
                                    value={settingsForm.booking_gooey_opacity ?? 30}
                                    onChange={(e) => updateSettings({ ...settingsForm, booking_gooey_opacity: parseInt(e.target.value) })}
                                    className="w-full accent-rose-500 h-1.5"
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
                                    onChange={(e) => updateSettings({ ...settingsForm, experiences_gooey_sensitivity: parseInt(e.target.value) })}
                                    className="w-full accent-rose-500 h-1.5"
                                  />
                                  <div className="text-[10px] font-bold text-rose-300 text-right mt-0.5">{settingsForm.experiences_gooey_sensitivity || 80}%</div>
                                </div>
                                <div>
                                  <label className="block text-[9px] uppercase font-mono text-white/50 mb-1">Exp. Opacity</label>
                                  <input
                                    type="range" min="0" max="100"
                                    value={settingsForm.experiences_gooey_opacity ?? 30}
                                    onChange={(e) => updateSettings({ ...settingsForm, experiences_gooey_opacity: parseInt(e.target.value) })}
                                    className="w-full accent-rose-500 h-1.5"
                                  />
                                  <div className="text-[10px] font-bold text-rose-300 text-right mt-0.5">{settingsForm.experiences_gooey_opacity ?? 30}%</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-white/10 col-span-1 sm:col-span-2">
                          <label className="block text-[11px] uppercase tracking-wider text-white/60 mb-1 flex items-center gap-1.5 font-medium">
                            <Type className="w-3.5 h-3.5 text-rose-400" />
                            <span>Hero Welcome Introduction Paragraph</span>
                          </label>
                          <textarea
                            rows={2}
                            value={settingsForm.hero_description ?? 'Welcome to MT Maison, your beauty destination for flawless nails, beautiful wig installations and stunning lashes. We help you look good, feel confident and express your unique style.'}
                            onChange={(e) => {
                              const val = e.target.value;
                              const updated = { ...settingsForm, hero_description: val };
                              setSettingsForm(updated);
                              updateSettings(updated);
                            }}
                            className="w-full bg-white/5 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-white/50 leading-relaxed font-sans"
                            placeholder="Welcome to MT Maison, your beauty destination..."
                          />
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


                    {/* Section 4: ... */}

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
                              onChange={(e) => {
                                const val = e.target.value;
                                const updated = { ...settingsForm, services_text_color: val };
                                setSettingsForm(updated);
                                updateSettings(updated);
                              }}
                              className="w-10 h-9 rounded-lg bg-white/10 border border-white/20 cursor-pointer overflow-hidden p-0 shrink-0"
                            />
                            <input
                              type="text"
                              value={settingsForm.services_text_color || '#F49AC2'}
                              onChange={(e) => {
                                const val = e.target.value;
                                const updated = { ...settingsForm, services_text_color: val };
                                setSettingsForm(updated);
                                updateSettings(updated);
                              }}
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





                    {/* Section 7: Client Experiences Gallery */}
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
                              onChange={(e) => {
                                const val = e.target.value;
                                const updated = { ...settingsForm, experiences_bg_color: val };
                                setSettingsForm(updated);
                                updateSettings(updated);
                              }}
                              className="w-10 h-9 rounded-lg bg-white/10 border border-white/20 cursor-pointer overflow-hidden p-0 shrink-0"
                            />
                            <input
                              type="text"
                              value={settingsForm.experiences_bg_color || '#180711'}
                              onChange={(e) => {
                                const val = e.target.value;
                                const updated = { ...settingsForm, experiences_bg_color: val };
                                setSettingsForm(updated);
                                updateSettings(updated);
                              }}
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
                              onChange={(e) => {
                                const val = e.target.value;
                                const updated = { ...settingsForm, experiences_title_color: val };
                                setSettingsForm(updated);
                                updateSettings(updated);
                              }}
                              className="w-10 h-9 rounded-lg bg-white/10 border border-white/20 cursor-pointer overflow-hidden p-0 shrink-0"
                            />
                            <input
                              type="text"
                              value={settingsForm.experiences_title_color || '#FFFFFF'}
                              onChange={(e) => {
                                const val = e.target.value;
                                const updated = { ...settingsForm, experiences_title_color: val };
                                setSettingsForm(updated);
                                updateSettings(updated);
                              }}
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
                              onChange={(e) => {
                                const val = e.target.value;
                                const updated = { ...settingsForm, experiences_subtitle_color: val };
                                setSettingsForm(updated);
                                updateSettings(updated);
                              }}
                              className="w-10 h-9 rounded-lg bg-white/10 border border-white/20 cursor-pointer overflow-hidden p-0 shrink-0"
                            />
                            <input
                              type="text"
                              value={settingsForm.experiences_subtitle_color || '#F49AC2'}
                              onChange={(e) => {
                                const val = e.target.value;
                                const updated = { ...settingsForm, experiences_subtitle_color: val };
                                setSettingsForm(updated);
                                updateSettings(updated);
                              }}
                              className="flex-1 bg-white/5 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-white/50"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 8: Footer */}
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
              )}

              {/* TAB 3: IMAGE SLOTS & TRANSFORMATIONS */}
              {activeTab === 'images' && (
                <form onSubmit={handleSaveImageSlots} className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-editorial text-2xl text-white">Logo & Boutique Image Studio</h3>
                      <p className="text-xs text-white/60 mt-0.5">
                        Upload your brand logo, adjust showcase thumbnails, and manage your client experience gallery. Customize zoom, positioning, and background removal for any image.
                      </p>
                    </div>
                  </div>


// ... (other helper components like ImageSlotEditor)


// ... inside render:
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 px-1">
                        <div className="w-8 h-8 rounded-lg bg-[#C45266] flex items-center justify-center">
                          <ImageIcon className="w-4 h-4 text-white" />
                        </div>
                        <h4 className="text-sm font-semibold uppercase tracking-widest text-white/80">Brand Identity (Logo)</h4>
                      </div>
                      <ImageSlotEditor slotKey="logo_url" label="Primary Boutique Logo" defaultAspect="auto" />
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2 px-1">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                          <ImageIcon className="w-4 h-4 text-rose-400" />
                        </div>
                        <h4 className="text-sm font-semibold uppercase tracking-widest text-white/80">Showcase & Portfolio Imagery</h4>
                      </div>
                    <ImageSlotEditor slotKey="service_nails" label="Nails Portfolio Showcase" defaultAspect="4/3" />
                    <ImageSlotEditor slotKey="service_lashes" label="Lashes Portfolio Showcase" defaultAspect="4/3" />
                    <ImageSlotEditor slotKey="service_hair" label="Wig Installation Showcase" defaultAspect="4/3" />
                    <ExperienceGalleryEditor 
                      gallery={imageSlotsForm.experience_gallery || []} 
                      onUpdate={(newGallery) => { 
                        setImageSlotsForm({ ...imageSlotsForm, experience_gallery: newGallery }); 
                        updateImageSlots({ experience_gallery: newGallery }); 
                      }} 
                    />
                    <ImageSlotEditor slotKey="services_feature" label="Services Feature Editorial Photo" defaultAspect="4/5" />
                    </div>
                  </div>

                </form>
              )}

              {/* TAB 4: SERVICES & PRICING */}
              {activeTab === 'services' && (
                <div className="space-y-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-editorial text-2xl sm:text-3xl text-white">Treatments & Services Editor</h3>
                      <p className="text-xs text-white/60 mt-1">
                        Edit prices, treatment names, and categories. Add new offerings or remove old ones. Changes sync live across the entire boutique and booking form.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveServices}
                      disabled={isSavingServices}
                      className="px-5 py-2.5 rounded-xl bg-[#C45266] hover:bg-[#b04356] text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50 shrink-0 self-start sm:self-auto"
                    >
                      {isSavingServices ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      <span>{isSavingServices ? 'Saving to Database...' : 'Save Services to Database'}</span>
                    </button>
                  </div>

                  {/* Add New Treatment Form */}
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/20 space-y-4 shadow-sm backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-white text-xs font-semibold uppercase tracking-wider">
                      <Plus className="w-4 h-4 text-white/80" />
                      <span>Add New Treatment Offering</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-5">
                        <label className="block text-[11px] uppercase tracking-wider text-white/60 mb-1">
                          Treatment Name *
                        </label>
                        <input
                          type="text"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          placeholder="e.g. Russian Gel Manicure"
                          className="w-full bg-white/5 border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/50"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[11px] uppercase tracking-wider text-white/60 mb-1">
                          Category
                        </label>
                        <select
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value as any)}
                          className="w-full bg-white/5 border border-white/20 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-white/50"
                        >
                          <option value="nails">Nails</option>
                          <option value="lashes">Lashes</option>
                          <option value="hair">Wig Installation</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] uppercase tracking-wider text-white/60 mb-1">
                          Price ({settingsForm.currency_symbol || 'MWK'})
                        </label>
                        <input
                          type="number"
                          value={newPrice}
                          onChange={(e) => setNewPrice(Number(e.target.value))}
                          className="w-full bg-white/5 border border-white/20 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-white/50"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] uppercase tracking-wider text-white/60 mb-1">
                          Duration (min)
                        </label>
                        <input
                          type="number"
                          value={newDuration}
                          onChange={(e) => setNewDuration(Number(e.target.value))}
                          className="w-full bg-white/5 border border-white/20 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-white/50"
                        />
                      </div>

                      <div className="sm:col-span-12">
                        <label className="block text-[11px] uppercase tracking-wider text-white/60 mb-1">
                          Description
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                            placeholder="Brief description of the treatment technique and results..."
                            className="flex-1 bg-white/5 border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/50"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!newTitle.trim()) {
                                alert('Please provide a treatment name');
                                return;
                              }
                              const newSrv: ServiceItem = {
                                id: `srv-${Date.now()}`,
                                category: newCategory,
                                number: `0${servicesList.length + 1}`,
                                title: newTitle.trim(),
                                description: newDescription.trim() || 'Bespoke atelier beauty treatment.',
                                price: newPrice > 0 ? newPrice : 35000,
                                duration_min: newDuration > 0 ? newDuration : 45,
                                is_active: true,
                              };
                              const updated = [...servicesList, newSrv];
                              setServicesList(updated);
                              updateServices(updated);
                              setNewTitle('');
                              setNewDescription('');
                              showSuccessNotice(`Added "${newSrv.title}" to treatments!`);
                            }}
                            className="px-5 py-2 rounded-xl bg-[#C45266] hover:bg-[#b04356] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 shadow-md"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Treatment</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Existing Treatments List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-white/80 font-medium px-1">
                      <span>Current Active Treatments ({servicesList.length})</span>
                      <span className="text-[11px] text-white/60">Edits save and broadcast instantly</span>
                    </div>

                    {servicesList.map((srv, index) => (
                      <div
                        key={srv.id}
                        className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/30 transition-all space-y-3 shadow-sm backdrop-blur-sm"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                          <div className="sm:col-span-1 text-xs font-mono text-white/80 font-bold">
                            #{index + 1}
                          </div>

                          <div className="sm:col-span-5">
                            <label className="block text-[10px] uppercase font-mono text-white/60 mb-0.5">
                              Treatment Name
                            </label>
                            <input
                              type="text"
                              value={srv.title}
                              onChange={(e) => {
                                const updated = [...servicesList];
                                updated[index].title = e.target.value;
                                setServicesList(updated);
                              }}
                              onBlur={() => updateServices(servicesList)}
                              className="w-full bg-white/5 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white font-medium"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[10px] uppercase font-mono text-white/60 mb-0.5">
                              Category
                            </label>
                            <select
                              value={srv.category}
                              onChange={(e) => {
                                const updated = [...servicesList];
                                updated[index].category = e.target.value as any;
                                setServicesList(updated);
                                updateServices(updated);
                              }}
                              className="w-full bg-white/5 border border-white/20 rounded-lg px-2 py-1.5 text-xs text-white"
                            >
                              <option value="nails">Nails</option>
                              <option value="lashes">Lashes</option>
                              <option value="hair">Wig Installation</option>
                            </select>
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[10px] uppercase font-mono text-white/60 mb-0.5">
                              Price ({settingsForm.currency_symbol || 'MWK'})
                            </label>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-white/80 font-mono">{settingsForm.currency_symbol || 'MWK'}</span>
                              <input
                                type="number"
                                value={srv.price}
                                onChange={(e) => {
                                  const updated = [...servicesList];
                                  updated[index].price = Number(e.target.value);
                                  setServicesList(updated);
                                }}
                                onBlur={() => updateServices(servicesList)}
                                className="w-full bg-white/5 border border-white/20 rounded-lg px-2 py-1.5 text-xs text-white font-mono"
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-1">
                            <label className="block text-[10px] uppercase font-mono text-white/60 mb-0.5">
                              Mins
                            </label>
                            <input
                              type="number"
                              value={srv.duration_min}
                              onChange={(e) => {
                                const updated = [...servicesList];
                                updated[index].duration_min = Number(e.target.value);
                                setServicesList(updated);
                              }}
                              onBlur={() => updateServices(servicesList)}
                              className="w-full bg-white/5 border border-white/20 rounded-lg px-2 py-1.5 text-xs text-white font-mono"
                            />
                          </div>

                          <div className="sm:col-span-1 flex justify-end items-end pt-3 sm:pt-0">
                            <button
                              type="button"
                              onClick={async () => {
                                const updated = servicesList.filter((_, i) => i !== index);
                                setServicesList(updated);
                                await updateServices(updated);
                                showSuccessNotice(`Deleted "${srv.title}"`);
                              }}
                              className="p-2 text-rose-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                              title="Delete Treatment"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Description field */}
                        <div className="pt-1">
                          <input
                            type="text"
                            value={srv.description || ''}
                            onChange={(e) => {
                              const updated = [...servicesList];
                              updated[index].description = e.target.value;
                              setServicesList(updated);
                            }}
                            onBlur={() => updateServices(servicesList)}
                            placeholder="Treatment description..."
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-rose-100/80 placeholder-white/20 focus:outline-none focus:border-white/50/50"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Sticky Bottom Save Bar for Services */}
                  <div className="pt-4 flex items-center justify-between gap-3 border-t border-white/10 sticky bottom-0 bg-[#2D1B28]/95 p-4 -mx-2 rounded-2xl backdrop-blur-md shadow-lg border border-white/10">
                    <div className="text-[11px] text-white/60">
                      {isSupabaseActive ? 'Service offerings sync to Supabase database (persists on Vercel).' : 'Service offerings save locally and apply live.'}
                    </div>
                    <button
                      type="button"
                      onClick={handleSaveServices}
                      disabled={isSavingServices}
                      className="px-6 py-2.5 rounded-xl bg-[#C45266] hover:bg-[#b04356] text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {isSavingServices ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      <span>{isSavingServices ? 'Saving Services to Database...' : 'Save All Services to Database'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 5: CALENDAR SLOTS */}
              {activeTab === 'slots' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-editorial text-2xl text-white">Daily Booking Slots & Schedule</h3>
                      <p className="text-xs text-white/60 mt-0.5">
                        Add, edit times, customize periods, toggle availability, or delete slots. Changes broadcast instantly.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleResetDefaultSlots}
                        className="px-3.5 py-1.5 rounded-xl border border-white/20 hover:bg-white/10 text-white/80 text-xs transition-colors"
                        title="Restore standard boutique operating hours"
                      >
                        Reset Defaults
                      </button>
                    </div>
                  </div>

                  {/* Add New Time Slot Form */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/20 space-y-3 shadow-sm backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-white text-xs font-semibold uppercase tracking-wider">
                      <Plus className="w-4 h-4 text-white/80" />
                      <span>Add New Time Slot</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                      <div className="sm:col-span-5">
                        <label className="block text-[11px] uppercase tracking-wider text-white/60 mb-1">
                          Slot Time *
                        </label>
                        <div className="relative">
                          <Clock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-white/60" />
                          <input
                            type="text"
                            value={newSlotTime}
                            onChange={(e) => setNewSlotTime(e.target.value)}
                            placeholder="e.g. 03:30 PM, 12:15 PM"
                            className="w-full bg-white/5 border border-white/20 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-white/30 font-mono focus:outline-none focus:border-white/50"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-4">
                        <label className="block text-[11px] uppercase tracking-wider text-white/60 mb-1">
                          Period
                        </label>
                        <select
                          value={newSlotPeriod}
                          onChange={(e) => setNewSlotPeriod(e.target.value as any)}
                          className="w-full bg-white/5 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/50"
                        >
                          <option value="morning">Morning (until 12 PM)</option>
                          <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                          <option value="evening">Evening (5 PM onwards)</option>
                        </select>
                      </div>

                      <div className="sm:col-span-3">
                        <button
                          type="button"
                          onClick={handleAddSlot}
                          className="w-full py-2 px-4 rounded-xl bg-[#C45266] hover:bg-[#b04356] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Slot</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* List of Time Slots with Inline Editing & Delete */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-white/80 font-medium px-1">
                      <span>Available Slots ({slotsList.length})</span>
                      <span className="text-[11px] text-white/60">
                        Edit time directly or toggle checkbox to enable/disable
                      </span>
                    </div>

                    {slotsList.length === 0 ? (
                      <div className="p-8 text-center bg-white/5 rounded-2xl border border-white/10 text-white/60 text-xs">
                        No time slots configured. Click "Reset Defaults" above to restore standard hours.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {slotsList.map((slot, index) => (
                          <div
                            key={`${slot.time}-${index}`}
                            className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                              slot.is_available
                                ? 'bg-white/10 border-white/30 text-white shadow-sm backdrop-blur-sm'
                                : 'bg-white/5 border-white/10 text-white/40 opacity-75'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              {/* Inline Editable Time String */}
                              <div className="relative flex-1">
                                <Clock className="w-3.5 h-3.5 absolute left-2.5 top-2 text-white/60" />
                                <input
                                  type="text"
                                  value={slot.time}
                                  onChange={(e) =>
                                    handleUpdateSlotField(index, { time: e.target.value })
                                  }
                                  className="w-full bg-white/5 border border-white/15 focus:border-white/50 rounded-lg pl-8 pr-2 py-1 text-xs font-mono font-semibold text-white focus:outline-none"
                                />
                              </div>

                              {/* Delete Slot Button */}
                              <button
                                type="button"
                                onClick={() => handleDeleteSlot(index)}
                                className="p-1.5 text-rose-400 hover:text-red-300 hover:bg-red-950/50 rounded-lg transition-colors shrink-0"
                                title={`Delete slot ${slot.time}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10 text-xs">
                              {/* Period Selector */}
                              <select
                                value={slot.period}
                                onChange={(e) =>
                                  handleUpdateSlotField(index, { period: e.target.value as any })
                                }
                                className="bg-white/10 border border-white/10 rounded px-2 py-0.5 text-[11px] font-mono uppercase text-white focus:outline-none"
                              >
                                <option value="morning">Morning</option>
                                <option value="afternoon">Afternoon</option>
                                <option value="evening">Evening</option>
                              </select>

                              {/* Availability Toggle */}
                              <label className="flex items-center gap-2 cursor-pointer select-none">
                                <span className={`text-[11px] font-medium ${slot.is_available ? 'text-emerald-300' : 'text-white/60'}`}>
                                  {slot.is_available ? 'Active' : 'Offline'}
                                </span>
                                <input
                                  type="checkbox"
                                  checked={slot.is_available}
                                  onChange={(e) => {
                                    handleUpdateSlotField(index, { is_available: e.target.checked });
                                    // Also auto-save toggle immediately
                                    const updated = [...slotsList];
                                    updated[index].is_available = e.target.checked;
                                    updateCalendarSlots(updated);
                                  }}
                                  className="w-4 h-4 accent-[#C45266] rounded cursor-pointer"
                                />
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB: GOOGLE CALENDAR SYNC */}
              {activeTab === 'calendar' && (
                <div className="space-y-6 max-w-2xl">
                  <div>
                    <h3 className="font-editorial text-2xl text-white">CEO Google Calendar Sync</h3>
                    <p className="text-xs text-white/60 mt-0.5">
                      Connect the CEO's designated Google account to automatically receive booking appointments and 30-minute pop-up reminders in Google Calendar.
                    </p>
                  </div>

                  {calendarConnectMsg && (
                    <div className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 ${calendarConnectMsg.includes('success') ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-200' : 'bg-red-950/70 border border-red-500/40 text-red-200'}`}>
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <span>{calendarConnectMsg}</span>
                    </div>
                  )}

                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 shadow-sm backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-white">Google Account Authorization</h4>
                        <p className="text-[11px] text-white/60 mt-0.5">
                          Sign in with the CEO Google account that should receive calendar notifications.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleConnectCalendar}
                        disabled={isConnectingCalendar}
                        className="px-4 py-2.5 rounded-xl bg-white hover:bg-rose-50 text-black text-xs font-medium tracking-wide transition-all shadow flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
                      >
                        <Calendar className="w-4 h-4 text-[#ea297e]" />
                        <span>{isConnectingCalendar ? 'Connecting...' : 'Sign in with Google'}</span>
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
                        }}
                        className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/5 text-white text-xs font-medium tracking-wide transition-all border border-white/10 flex items-center gap-2 cursor-pointer"
                      >
                        <span>Sign out</span>
                      </button>
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
                          placeholder="ceo@mtmansion.com"
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
              )}

              {/* TAB 6: SUPABASE REAL-TIME CONNECTION */}
              {activeTab === 'supabase' && (
                <div className="space-y-6 max-w-2xl">
                  <div>
                    <h3 className="font-editorial text-2xl text-white">Supabase Postgres Changes Sync</h3>
                    <p className="text-xs text-white/60 mt-0.5">
                      Connect your Supabase project to enable cloud Postgres replication and live cross-device table updates.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 shadow-sm backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">
                        Real-Time Sync Engine Status
                      </span>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-mono flex items-center gap-1.5 ${
                          isSupabaseActive
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        {isSupabaseActive ? 'Supabase Postgres Active' : 'WebSocket Broadcast Active'}
                      </span>
                    </div>

                    <p className="text-xs text-white/60 leading-relaxed">
                      MT Mansion is configured with zero-refresh synchronization. When you save an appointment or update an image, our server broadcasts via WebSockets immediately and replicates to your Supabase Postgres database.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-white/80 mb-1 font-medium">
                        Supabase Project URL
                      </label>
                      <input
                        type="url"
                        value={settingsForm.supabase_url}
                        onChange={(e) => setSettingsForm({ ...settingsForm, supabase_url: e.target.value })}
                        placeholder="https://your-project.supabase.co"
                        className="w-full bg-white/5 border border-white/20 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-white/50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-white/80 mb-1 font-medium">
                        Supabase Anon Public API Key
                      </label>
                      <input
                        type="password"
                        value={settingsForm.supabase_anon_key}
                        onChange={(e) => setSettingsForm({ ...settingsForm, supabase_anon_key: e.target.value })}
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                        className="w-full bg-white/5 border border-white/20 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-white/50"
                      />
                    </div>
                  </div>

                  {supabaseTestResult && (
                    <div
                      className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                        supabaseTestResult.success
                          ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-200'
                          : 'bg-red-950/70 border border-red-500/40 text-red-200'
                      }`}
                    >
                      {supabaseTestResult.success ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      )}
                      <span>{supabaseTestResult.message}</span>
                    </div>
                  )}

                  {supabaseHealth && (
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                      <div className="flex items-center justify-between text-xs font-semibold text-white/90 uppercase tracking-wider">
                        <span>Database Tables & Permissions</span>
                        <span className="font-mono text-[11px] text-white/60">
                          {supabaseHealth.connected ? 'Connected' : 'Disconnected'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                        <div className="p-2.5 rounded-xl bg-black/30 border border-white/10 flex items-center justify-between">
                          <span className="font-mono text-white/70">boutique_settings</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                            supabaseHealth.settingsTable === 'ready' 
                              ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/30'
                              : supabaseHealth.settingsTable === 'permission_denied'
                              ? 'bg-amber-900/60 text-amber-300 border border-amber-500/30'
                              : 'bg-red-900/60 text-red-300 border border-red-500/30'
                          }`}>
                            {supabaseHealth.settingsTable === 'ready' ? 'Ready' : supabaseHealth.settingsTable === 'permission_denied' ? 'RLS Blocked' : 'Missing Table'}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-black/30 border border-white/10 flex items-center justify-between">
                          <span className="font-mono text-white/70">services</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                            supabaseHealth.servicesTable === 'ready' 
                              ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/30'
                              : supabaseHealth.servicesTable === 'permission_denied'
                              ? 'bg-amber-900/60 text-amber-300 border border-amber-500/30'
                              : 'bg-red-900/60 text-red-300 border border-red-500/30'
                          }`}>
                            {supabaseHealth.servicesTable === 'ready' ? 'Ready' : supabaseHealth.servicesTable === 'permission_denied' ? 'RLS Blocked' : 'Missing Table'}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-black/30 border border-white/10 flex items-center justify-between">
                          <span className="font-mono text-white/70">appointments</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                            supabaseHealth.appointmentsTable === 'ready' 
                              ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/30'
                              : supabaseHealth.appointmentsTable === 'permission_denied'
                              ? 'bg-amber-900/60 text-amber-300 border border-amber-500/30'
                              : 'bg-red-900/60 text-red-300 border border-red-500/30'
                          }`}>
                            {supabaseHealth.appointmentsTable === 'ready' ? 'Ready' : supabaseHealth.appointmentsTable === 'permission_denied' ? 'RLS Blocked' : 'Missing Table'}
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-white/60">
                        {supabaseHealth.message}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      disabled={isTestingSupabase}
                      onClick={async () => {
                        setIsTestingSupabase(true);
                        setSupabaseTestResult(null);
                        const res = await testSupabase(settingsForm.supabase_url, settingsForm.supabase_anon_key);
                        setSupabaseTestResult(res);
                        const health = await checkSupabaseStatus();
                        setSupabaseHealth(health);
                        setIsTestingSupabase(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isTestingSupabase ? 'animate-spin' : ''}`} />
                      <span>Test & Verify Tables</span>
                    </button>

                    <button
                      type="button"
                      disabled={isSyncingAllSupabase}
                      onClick={async () => {
                        setIsSyncingAllSupabase(true);
                        const sRes = await syncSettingsWithSupabase(settingsForm);
                        const srvRes = await syncServicesWithSupabase(servicesList);
                        const health = await checkSupabaseStatus();
                        setSupabaseHealth(health);
                        setIsSyncingAllSupabase(false);

                        if (sRes.success && srvRes.success) {
                          showSuccessNotice('All boutique settings and services successfully synced to Supabase database!');
                        } else {
                          const errs = [];
                          if (!sRes.success) errs.push(`Settings: ${sRes.message}`);
                          if (!srvRes.success) errs.push(`Services: ${srvRes.message}`);
                          showSuccessNotice(`Sync note: ${errs.join(' | ')}`);
                        }
                      }}
                      className="px-5 py-2 rounded-xl bg-[#C45266] hover:bg-[#b04356] text-white text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                    >
                      {isSyncingAllSupabase ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Database className="w-3.5 h-3.5" />
                      )}
                      <span>{isSyncingAllSupabase ? 'Syncing to Supabase...' : 'Sync All Data to Supabase Now'}</span>
                    </button>
                  </div>

                  {/* SQL Setup Script & Database Permissions Instructions */}
                  <div className="p-5 rounded-2xl bg-black/40 border border-white/15 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-white flex items-center gap-1.5">
                          <Database className="w-4 h-4 text-emerald-400" />
                          <span>1-Click Database Setup SQL (Required for Vercel Persistence)</span>
                        </h4>
                        <p className="text-[11px] text-white/60 mt-0.5">
                          Run this SQL script in your Supabase SQL Editor to create tables and configure public Row Level Security (RLS) policies.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
                            setCopiedSql(true);
                            showSuccessNotice('Setup SQL copied to clipboard!');
                            setTimeout(() => setCopiedSql(false), 3000);
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow cursor-pointer"
                        >
                          {copiedSql ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy SQL Script</span>
                            </>
                          )}
                        </button>

                        <a
                          href="https://supabase.com/dashboard"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1.5 transition-all"
                        >
                          <span>Supabase Dashboard</span>
                          <ExternalLink className="w-3 h-3 text-white/60" />
                        </a>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-white/70">
                      <div className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-white/10 text-white flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">1</span>
                        <span>Open your Supabase project dashboard and click <strong>SQL Editor</strong> on the left sidebar.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-white/10 text-white flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">2</span>
                        <span>Click <strong>New query</strong>, paste the copied SQL script, and click <strong>Run</strong>.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-white/10 text-white flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">3</span>
                        <span>Return here and click <strong>"Test & Verify Tables"</strong> to verify all tables show <span className="text-emerald-300 font-mono">Ready</span>!</span>
                      </div>
                    </div>

                    <div className="relative">
                      <pre className="p-3 bg-black/60 rounded-xl border border-white/10 text-[11px] font-mono text-white/80 max-h-44 overflow-y-auto overflow-x-auto leading-relaxed select-all">
                        {SUPABASE_SETUP_SQL}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
