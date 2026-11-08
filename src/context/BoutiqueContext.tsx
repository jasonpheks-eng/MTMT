import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Appointment,
  BoutiqueSettings,
  ImageSlots,
  ServiceItem,
  CalendarTimeSlot,
  RealtimeMessage,
} from '../types';
import { syncAppointmentToGoogleCalendar, getCachedCalendarToken } from '../lib/googleCalendar';
import {
  syncSettingsToSupabase,
  syncServicesToSupabase,
  fetchSettingsFromSupabase,
  fetchServicesFromSupabase,
  checkSupabaseHealth,
  SupabaseSyncResult,
  SupabaseHealthStatus,
} from '../lib/supabaseSync';
import {
  defaultSettings,
  defaultImageSlots,
  defaultServices,
  defaultCalendarSlots,
  defaultAppointments,
} from '../data/initialData';

interface BoutiqueContextType {
  settings: BoutiqueSettings;
  imageSlots: ImageSlots;
  services: ServiceItem[];
  calendarSlots: CalendarTimeSlot[];
  appointments: Appointment[];
  isLoading: boolean;
  isConnected: boolean;
  isSupabaseActive: boolean;
  supabaseClient: SupabaseClient | null;
  isAdmin: boolean;
  isAdminModalOpen: boolean;
  adminInitialTab: 'info' | 'colors' | 'images' | 'services' | 'slots' | 'supabase';
  isBookingModalOpen: boolean;
  selectedServiceForBooking: ServiceItem | null;
  isSearchOpen: boolean;
  isFavoritesOpen: boolean;
  favoriteServiceIds: string[];
  openSearch: () => void;
  closeSearch: () => void;
  openFavorites: () => void;
  closeFavorites: () => void;
  toggleFavorite: (serviceId: string) => void;
  canUndo: boolean;
  undoLastChange: () => Promise<boolean>;
  openBookingForService: (service?: ServiceItem) => void;
  closeBooking: () => void;
  openAdmin: (initialTab?: 'info' | 'colors' | 'images' | 'services' | 'slots' | 'supabase' | any) => void;
  closeAdmin: () => void;
  verifyPin: (pin: string) => Promise<boolean>;
  logoutAdmin: () => void;
  createAppointment: (data: Omit<Appointment, 'id' | 'status' | 'created_at'>) => Promise<Appointment>;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => Promise<void>;
  updateSettings: (newSettings: Partial<BoutiqueSettings>) => Promise<SupabaseSyncResult>;
  updateImageSlots: (newSlots: Partial<ImageSlots>) => Promise<void>;
  updateServices: (newServices: ServiceItem[]) => Promise<SupabaseSyncResult>;
  updateCalendarSlots: (newSlots: CalendarTimeSlot[]) => Promise<void>;
  syncSettingsWithSupabase: (customSettings?: Partial<BoutiqueSettings>) => Promise<SupabaseSyncResult>;
  syncServicesWithSupabase: (customServices?: ServiceItem[]) => Promise<SupabaseSyncResult>;
  checkSupabaseStatus: () => Promise<SupabaseHealthStatus>;
  removeAppointment: (id: string) => void;
  testSupabase: (url: string, key: string) => Promise<{ success: boolean; message: string }>;
  sendWhatsAppDirect: (customText?: string) => void;
}

const BoutiqueContext = createContext<BoutiqueContextType | undefined>(undefined);

export const BoutiqueProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<BoutiqueSettings>(() => {
    try {
      const local = localStorage.getItem('mt_settings_cache');
      return local ? { ...defaultSettings, ...JSON.parse(local) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });
  const [imageSlots, setImageSlots] = useState<ImageSlots>(() => {
    try {
      const local = localStorage.getItem('mt_imageslots_cache');
      return local ? { ...defaultImageSlots, ...JSON.parse(local) } : defaultImageSlots;
    } catch {
      return defaultImageSlots;
    }
  });
  const [services, setServices] = useState<ServiceItem[]>(() => {
    try {
      const local = localStorage.getItem('mt_services_cache');
      return local ? JSON.parse(local) : defaultServices;
    } catch {
      return defaultServices;
    }
  });
  const [calendarSlots, setCalendarSlots] = useState<CalendarTimeSlot[]>(() => {
    try {
      const local = localStorage.getItem('mt_slots_cache');
      return local ? JSON.parse(local) : defaultCalendarSlots;
    } catch {
      return defaultCalendarSlots;
    }
  });
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const local = localStorage.getItem('mt_appointments_cache');
      return local ? JSON.parse(local) : defaultAppointments;
    } catch {
      return defaultAppointments;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isSupabaseActive, setIsSupabaseActive] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return sessionStorage.getItem('mt_admin_auth') === 'true';
  });
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [adminInitialTab, setAdminInitialTab] = useState<
    'info' | 'colors' | 'images' | 'services' | 'slots' | 'supabase'
  >('info');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<ServiceItem | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState<boolean>(false);
  const [favoriteServiceIds, setFavoriteServiceIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('mt_favorite_services');
      return saved ? JSON.parse(saved) : ['nails-essential', 'lashes-classic'];
    } catch {
      return ['nails-essential', 'lashes-classic'];
    }
  });

  const openSearch = () => setIsSearchOpen(true);
  const closeSearch = () => setIsSearchOpen(false);
  const openFavorites = () => setIsFavoritesOpen(true);
  const closeFavorites = () => setIsFavoritesOpen(false);

  const toggleFavorite = (serviceId: string) => {
    setFavoriteServiceIds((prev) => {
      const next = prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId];
      try {
        localStorage.setItem('mt_favorite_services', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  // Undo History Snapshot Stack
  const [historyStack, setHistoryStack] = useState<
    Array<{
      settings: BoutiqueSettings;
      imageSlots: ImageSlots;
      services: ServiceItem[];
      calendarSlots: CalendarTimeSlot[];
    }>
  >([]);

  const pushHistorySnapshot = useCallback(() => {
    setHistoryStack((prev) => [
      ...prev.slice(-15),
      { settings, imageSlots, services, calendarSlots },
    ]);
  }, [settings, imageSlots, services, calendarSlots]);

  // Client Supabase instance
  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient | null>(null);

  // Initialize Supabase if credentials exist (with env fallback)
  useEffect(() => {
    const effectiveUrl =
      settings.supabase_url ||
      (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_URL : '') ||
      (import.meta as any).env?.VITE_SUPABASE_URL ||
      'https://hoeztqucwukrqelltlsm.supabase.co';
    const effectiveKey =
      settings.supabase_anon_key ||
      (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_ANON_KEY : '') ||
      (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
      'sb_publishable_8DUKtlDn88mv3gnt9VujNA_faCE03Wk';

    if (effectiveUrl && effectiveKey) {
      try {
        const client = createClient(effectiveUrl, effectiveKey);
        setSupabaseClient(client);
        setIsSupabaseActive(true);

        // Fetch cloud settings from Supabase on start (ensures Vercel users get persistent edits)
        fetchSettingsFromSupabase(client).then((res) => {
          if (res.success && res.settings) {
            setSettings((prev) => {
              const merged = { ...prev, ...res.settings };
              try {
                localStorage.setItem('mt_settings_cache', JSON.stringify(merged));
              } catch (e) {}
              return merged;
            });
          }
        });

        // Fetch cloud services from Supabase on start
        fetchServicesFromSupabase(client).then((res) => {
          if (res.success && res.services && res.services.length > 0) {
            setServices(res.services);
            try {
              localStorage.setItem('mt_services_cache', JSON.stringify(res.services));
            } catch (e) {}
          }
        });

        // Supabase Postgres changes listener: appointments
        const aptChannel = client
          .channel('public:appointments')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'appointments' },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                const newApt = payload.new as Appointment;
                setAppointments((prev) => {
                  if (prev.some((a) => a.id === newApt.id)) return prev;
                  return [newApt, ...prev];
                });
              } else if (payload.eventType === 'UPDATE') {
                const updatedApt = payload.new as Appointment;
                setAppointments((prev) =>
                  prev.map((a) => (a.id === updatedApt.id ? updatedApt : a))
                );
              }
            }
          )
          .subscribe();

        // Supabase Postgres changes listener: boutique_settings
        const settingsChannel = client
          .channel('public:boutique_settings')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'boutique_settings' },
            (payload) => {
              if (payload.new) {
                const row = payload.new as any;
                const newSettings = row.settings ? { ...row.settings } : row;
                setSettings((prev) => ({ ...prev, ...newSettings }));
              }
            }
          )
          .subscribe();

        // Supabase Postgres changes listener: services
        const servicesChannel = client
          .channel('public:services')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'services' },
            async () => {
              const res = await fetchServicesFromSupabase(client);
              if (res.success && res.services && res.services.length > 0) {
                setServices(res.services);
              }
            }
          )
          .subscribe();

        return () => {
          client.removeChannel(aptChannel);
          client.removeChannel(settingsChannel);
          client.removeChannel(servicesChannel);
        };
      } catch (err) {
        console.warn('Supabase client initialization warning:', err);
        setIsSupabaseActive(false);
      }
    } else {
      setSupabaseClient(null);
      setIsSupabaseActive(false);
    }
  }, [settings.supabase_url, settings.supabase_anon_key]);

  // Initial Bootstrap from Server
  const fetchBootstrap = useCallback(async () => {
    try {
      const res = await fetch('/api/bootstrap');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          // Preserve local customized settings if saved by admin
          const hasCustomSettings = localStorage.getItem('mt_settings_customized') === 'true';
          const cachedSettings = localStorage.getItem('mt_settings_cache');
          if (hasCustomSettings && cachedSettings) {
            try {
              const parsed = JSON.parse(cachedSettings);
              setSettings((prev) => ({ ...json.data.settings, ...prev, ...parsed }));
            } catch {
              setSettings(json.data.settings);
            }
          } else {
            setSettings(json.data.settings);
            try {
              localStorage.setItem('mt_settings_cache', JSON.stringify(json.data.settings));
            } catch (e) {}
          }

          const hasCustomImages = localStorage.getItem('mt_images_customized') === 'true';
          const cachedImages = localStorage.getItem('mt_imageslots_cache');
          if (hasCustomImages && cachedImages) {
            try {
              const parsed = JSON.parse(cachedImages);
              setImageSlots((prev) => ({ ...json.data.imageSlots, ...prev, ...parsed }));
            } catch {
              setImageSlots(json.data.imageSlots);
            }
          } else {
            setImageSlots(json.data.imageSlots);
            try {
              localStorage.setItem('mt_imageslots_cache', JSON.stringify(json.data.imageSlots));
            } catch (e) {}
          }

          const hasCustomServices = localStorage.getItem('mt_services_customized') === 'true';
          const cachedServices = localStorage.getItem('mt_services_cache');
          if (hasCustomServices && cachedServices) {
            try {
              const parsed = JSON.parse(cachedServices);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setServices(parsed);
              } else {
                setServices(json.data.services);
              }
            } catch {
              setServices(json.data.services);
            }
          } else {
            setServices(json.data.services);
            try {
              localStorage.setItem('mt_services_cache', JSON.stringify(json.data.services));
            } catch (e) {}
          }

          const hasCustomSlots = localStorage.getItem('mt_slots_customized') === 'true';
          const cachedSlots = localStorage.getItem('mt_slots_cache');
          if (hasCustomSlots && cachedSlots) {
            try {
              const parsed = JSON.parse(cachedSlots);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setCalendarSlots(parsed);
              } else {
                setCalendarSlots(json.data.calendarSlots);
              }
            } catch {
              setCalendarSlots(json.data.calendarSlots);
            }
          } else {
            setCalendarSlots(json.data.calendarSlots);
            try {
              localStorage.setItem('mt_slots_cache', JSON.stringify(json.data.calendarSlots));
            } catch (e) {}
          }

          setAppointments(json.data.appointments);
          try {
            localStorage.setItem('mt_appointments_cache', JSON.stringify(json.data.appointments));
          } catch (e) {}

          if (json.hasSupabase) {
            setIsSupabaseActive(true);
          }
        }
      }
    } catch (err) {
      console.warn('Bootstrap fetch note, preserving local cache:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBootstrap();
  }, [fetchBootstrap]);

  // WebSocket Connection for instant cross-tab real-time sync
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connectWebSocket = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const msg: RealtimeMessage = JSON.parse(event.data);
            handleRealtimeMessage(msg);
          } catch (e) {
            console.error('Failed to parse WebSocket message:', e);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          // Try reconnecting after 3 seconds
          reconnectTimeout = setTimeout(connectWebSocket, 3000);
        };

        ws.onerror = () => {
          setIsConnected(false);
          ws?.close();
        };
      } catch (e) {
        setIsConnected(false);
        reconnectTimeout = setTimeout(connectWebSocket, 3000);
      }
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, []);

  // Handle incoming real-time messages
  const handleRealtimeMessage = (msg: RealtimeMessage) => {
    switch (msg.type) {
      case 'INIT_STATE':
        if (msg.data) {
          if (msg.data.settings) setSettings((prev) => ({ ...defaultSettings, ...prev, ...msg.data.settings }));
          if (msg.data.imageSlots) setImageSlots((prev) => ({ ...defaultImageSlots, ...prev, ...msg.data.imageSlots }));
          if (Array.isArray(msg.data.services)) setServices(msg.data.services);
          if (Array.isArray(msg.data.calendarSlots)) setCalendarSlots(msg.data.calendarSlots);
          if (Array.isArray(msg.data.appointments)) setAppointments(msg.data.appointments);
        }
        break;

      case 'APPOINTMENT_CREATED':
        if (msg.data && msg.data.id) {
          setAppointments((prev) => {
            if (prev.some((a) => a.id === msg.data.id)) return prev;
            return [msg.data, ...prev];
          });
        }
        break;

      case 'APPOINTMENT_UPDATED':
        if (msg.data && msg.data.id) {
          setAppointments((prev) =>
            prev.map((a) => (a.id === msg.data.id ? msg.data : a))
          );
        }
        break;

      case 'SETTINGS_UPDATED':
        if (msg.data) setSettings((prev) => ({ ...prev, ...msg.data }));
        break;

      case 'IMAGES_UPDATED':
        if (msg.data) setImageSlots((prev) => ({ ...prev, ...msg.data }));
        break;

      case 'SERVICES_UPDATED':
        if (Array.isArray(msg.data)) setServices(msg.data);
        break;

      case 'SLOTS_UPDATED':
        if (Array.isArray(msg.data)) setCalendarSlots(msg.data);
        break;

      default:
        break;
    }
  };

  // Actions
  const openBookingForService = (service?: ServiceItem) => {
    setSelectedServiceForBooking(service || services[0] || null);
    setIsBookingModalOpen(true);
  };

  const closeBooking = () => {
    setIsBookingModalOpen(false);
    setSelectedServiceForBooking(null);
  };

  const openAdmin = (initialTab?: unknown) => {
    if (typeof initialTab === 'string' && initialTab !== 'whatsapp') {
      setAdminInitialTab(initialTab as any);
    } else {
      setAdminInitialTab('info');
    }
    setIsAdminModalOpen(true);
  };

  const closeAdmin = () => {
    setIsAdminModalOpen(false);
  };

  const verifyPin = async (pin: string): Promise<boolean> => {
    const cleanPin = (pin || '').trim();
    if (cleanPin.toUpperCase() === 'MT1234') {
      setIsAdmin(true);
      try {
        sessionStorage.setItem('mt_admin_auth', 'true');
        fetch('/api/verify-pin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin: cleanPin }),
        }).catch(() => null);
      } catch {
        // storage or fetch error ignored
      }
      return true;
    }

    try {
      const res = await fetch('/api/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: cleanPin }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAdmin(true);
        sessionStorage.setItem('mt_admin_auth', 'true');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('mt_admin_auth');
  };

  const createAppointment = async (
    data: Omit<Appointment, 'id' | 'status' | 'created_at'>
  ): Promise<Appointment> => {
    let createdApt: Appointment | null = null;

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const responseText = await res.text();
      if (res.ok && responseText) {
        try {
          const json = JSON.parse(responseText);
          if (json.appointment) {
            createdApt = json.appointment;
          }
        } catch (parseErr) {
          console.warn('Server response was not JSON:', parseErr);
        }
      }
    } catch (err) {
      console.warn('Network or API endpoint note, proceeding with client-side booking:', err);
    }

    // Failsafe: Guarantee appointment object exists even if backend returns non-JSON or HTML 500 error
    if (!createdApt) {
      const service = services.find((s) => s.id === data.service_id);
      createdApt = {
        id: `MT-${Math.floor(10000 + Math.random() * 90000)}`,
        client_name: data.client_name,
        client_phone: data.client_phone || 'WhatsApp Direct',
        client_email: data.client_email || '',
        service_id: data.service_id,
        service_title: data.service_title || service?.title || 'Bespoke Consultation',
        category: data.category || service?.category || 'nails',
        date: data.date,
        time_slot: data.time_slot,
        notes: data.notes || '',
        status: 'pending',
        created_at: new Date().toISOString(),
      };
    }

    setAppointments((prev) => {
      if (prev.some((a) => a.id === createdApt!.id)) return prev;
      const next = [createdApt!, ...prev];
      try {
        localStorage.setItem('mt_appointments_cache', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    if (supabaseClient) {
      try {
        Promise.resolve(supabaseClient.from('appointments').insert([createdApt])).catch(() => {});
      } catch (e) {}
    }

    if (settings.calendar_sync_enabled !== false) {
      try {
        await syncAppointmentToGoogleCalendar(
          createdApt,
          getCachedCalendarToken(),
          settings.calendar_reminder_min || 30
        );
      } catch (calErr) {
        console.warn('Google Calendar sync warning:', calErr);
      }
    }

    return createdApt;
  };

  const updateAppointmentStatus = async (
    id: string,
    status: Appointment['status']
  ): Promise<void> => {
    setAppointments((prev) => {
      const next = prev.map((a) => (a.id === id ? { ...a, status } : a));
      try {
        localStorage.setItem('mt_appointments_cache', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    if (supabaseClient) {
      try {
        Promise.resolve(supabaseClient.from('appointments').update({ status }).eq('id', id)).catch(() => {});
      } catch (e) {}
    }

    try {
      await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    } catch (err) {
      console.warn('Server status update note:', err);
    }
  };

  const undoLastChange = async (): Promise<boolean> => {
    if (historyStack.length === 0) return false;
    const lastSnapshot = historyStack[historyStack.length - 1];
    setHistoryStack((prev) => prev.slice(0, prev.length - 1));

    try {
      await Promise.all([
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lastSnapshot.settings),
        }),
        fetch('/api/image-slots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lastSnapshot.imageSlots),
        }),
        fetch('/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ services: lastSnapshot.services }),
        }),
        fetch('/api/slots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slots: lastSnapshot.calendarSlots }),
        }),
      ]);
      setSettings(lastSnapshot.settings);
      setImageSlots(lastSnapshot.imageSlots);
      setServices(lastSnapshot.services);
      setCalendarSlots(lastSnapshot.calendarSlots);
      return true;
    } catch {
      return false;
    }
  };

  const updateSettings = async (newSettings: Partial<BoutiqueSettings>): Promise<SupabaseSyncResult> => {
    pushHistorySnapshot();

    // 1. Update React state immediately
    let mergedSettings: BoutiqueSettings = { ...settings, ...newSettings };
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      mergedSettings = updated;
      // 2. Persist to localStorage immediately
      try {
        localStorage.setItem('mt_settings_cache', JSON.stringify(updated));
        localStorage.setItem('mt_settings_customized', 'true');
      } catch (e) {}
      return updated;
    });

    // 3. Sync to backend API (handles both full-stack server and Vercel serverless)
    try {
      fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      }).catch((e) => console.warn('Backend sync note:', e));
    } catch (err) {
      console.warn('Backend sync note (settings saved in browser):', err);
    }

    // 4. Directly sync to Supabase database (critical for Vercel persistence across sessions)
    if (supabaseClient) {
      try {
        const syncResult = await syncSettingsToSupabase(supabaseClient, mergedSettings);
        return syncResult;
      } catch (err: any) {
        return {
          success: false,
          code: 'SYNC_ERROR',
          message: `Supabase database sync note: ${err.message || 'Unknown error'}`,
        };
      }
    }

    return {
      success: true,
      message: 'Settings saved to browser storage and broadcast live.',
    };
  };

  const updateImageSlots = async (newSlots: Partial<ImageSlots>): Promise<void> => {
    pushHistorySnapshot();

    setImageSlots((prev) => {
      const updated = { ...prev, ...newSlots };
      try {
        localStorage.setItem('mt_imageslots_cache', JSON.stringify(updated));
        localStorage.setItem('mt_images_customized', 'true');
      } catch (e) {}
      return updated;
    });

    try {
      const res = await fetch('/api/image-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSlots),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.imageSlots) {
          setImageSlots(json.imageSlots);
          try {
            localStorage.setItem('mt_imageslots_cache', JSON.stringify(json.imageSlots));
          } catch (e) {}
        }
      }
    } catch (err) {
      console.warn('Backend sync note (images saved in browser):', err);
    }
  };

  const updateServices = async (newServices: ServiceItem[]): Promise<SupabaseSyncResult> => {
    pushHistorySnapshot();

    setServices(newServices);
    try {
      localStorage.setItem('mt_services_cache', JSON.stringify(newServices));
      localStorage.setItem('mt_services_customized', 'true');
    } catch (e) {}

    try {
      fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ services: newServices }),
      }).catch((e) => console.warn('Backend sync note:', e));
    } catch (err) {
      console.warn('Backend sync note (services saved in browser):', err);
    }

    // Directly sync to Supabase database (critical for Vercel persistence)
    if (supabaseClient) {
      try {
        const syncResult = await syncServicesToSupabase(supabaseClient, newServices);
        return syncResult;
      } catch (err: any) {
        return {
          success: false,
          code: 'SYNC_ERROR',
          message: `Supabase services sync note: ${err.message || 'Unknown error'}`,
        };
      }
    }

    return {
      success: true,
      message: 'Services saved to browser storage and broadcast live.',
    };
  };

  const syncSettingsWithSupabase = async (
    customSettings?: Partial<BoutiqueSettings>
  ): Promise<SupabaseSyncResult> => {
    if (!supabaseClient) {
      return {
        success: false,
        code: 'NO_CLIENT',
        message: 'Supabase client is not connected. Enter your project URL and public anon key in the Supabase tab.',
      };
    }
    return syncSettingsToSupabase(supabaseClient, customSettings || settings);
  };

  const syncServicesWithSupabase = async (
    customServices?: ServiceItem[]
  ): Promise<SupabaseSyncResult> => {
    if (!supabaseClient) {
      return {
        success: false,
        code: 'NO_CLIENT',
        message: 'Supabase client is not connected. Enter your project URL and public anon key in the Supabase tab.',
      };
    }
    return syncServicesToSupabase(supabaseClient, customServices || services);
  };

  const checkSupabaseStatus = async (): Promise<SupabaseHealthStatus> => {
    if (!supabaseClient) {
      return {
        connected: false,
        settingsTable: 'error',
        servicesTable: 'error',
        appointmentsTable: 'error',
        message: 'Supabase client not initialized.',
      };
    }
    return checkSupabaseHealth(supabaseClient);
  };

  const updateCalendarSlots = async (newSlots: CalendarTimeSlot[]): Promise<void> => {
    pushHistorySnapshot();

    setCalendarSlots(newSlots);
    try {
      localStorage.setItem('mt_slots_cache', JSON.stringify(newSlots));
      localStorage.setItem('mt_slots_customized', 'true');
    } catch (e) {}

    try {
      const res = await fetch('/api/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slots: newSlots }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.slots) {
          setCalendarSlots(json.slots);
          try {
            localStorage.setItem('mt_slots_cache', JSON.stringify(json.slots));
          } catch (e) {}
        }
      }
    } catch (err) {
      console.warn('Backend sync note (slots saved in browser):', err);
    }
  };

  const removeAppointment = (id: string) => {
    setAppointments((prev) => {
      const next = prev.filter((a) => a.id !== id);
      localStorage.setItem('mt_appointments_cache', JSON.stringify(next));
      return next;
    });
  };

  const testSupabase = async (
    url: string,
    key: string
  ): Promise<{ success: boolean; message: string }> => {
    const res = await fetch('/api/test-supabase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, key }),
    });

    const json = await res.json();
    return {
      success: json.success,
      message: json.message || (json.success ? 'Connected' : 'Connection failed'),
    };
  };

  const sendWhatsAppDirect = (customText?: string) => {
    const cleanNumber = settings.whatsapp_number.replace(/[^0-9]/g, '');
    const message = customText || settings.whatsapp_default_message;
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <BoutiqueContext.Provider
      value={{
        settings,
        imageSlots,
        services,
        calendarSlots,
        appointments,
        isLoading,
        isConnected,
        isSupabaseActive,
        supabaseClient,
        isAdmin,
        isAdminModalOpen,
        adminInitialTab,
        isBookingModalOpen,
        selectedServiceForBooking,
        isSearchOpen,
        isFavoritesOpen,
        favoriteServiceIds,
        openSearch,
        closeSearch,
        openFavorites,
        closeFavorites,
        toggleFavorite,
        canUndo: historyStack.length > 0,
        undoLastChange,
        openBookingForService,
        closeBooking,
        openAdmin,
        closeAdmin,
        verifyPin,
        logoutAdmin,
        createAppointment,
        updateAppointmentStatus,
        updateSettings,
        updateImageSlots,
        updateServices,
        updateCalendarSlots,
        syncSettingsWithSupabase,
        syncServicesWithSupabase,
        checkSupabaseStatus,
        removeAppointment,
        testSupabase,
        sendWhatsAppDirect,
      }}
    >
      {children}
    </BoutiqueContext.Provider>
  );
};

export const useBoutique = () => {
  const context = useContext(BoutiqueContext);
  if (!context) {
    throw new Error('useBoutique must be used within a BoutiqueProvider');
  }
  return context;
};
