import express, { Request, Response } from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import fs from 'fs';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import {
  Appointment,
  BoutiqueSettings,
  ImageSlots,
  ServiceItem,
  CalendarTimeSlot,
  RealtimeMessage,
} from './src/types';

dotenv.config();

const app = express();
const server = http.createServer(app);
const port = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Data Directory
const isVercel = Boolean(process.env.VERCEL);
const repoStorePath = path.resolve(process.cwd(), 'data', 'boutique_store.json');
const dataDir = isVercel ? path.resolve('/tmp', 'data') : path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
  } catch (e) {}
}
const storeFilePath = path.join(dataDir, 'boutique_store.json');

// Default Initial Data matching Figma design
const defaultSettings: BoutiqueSettings = {
  whatsapp_number: '+265 888 38 29 38',
  boutique_name: 'MT Mansion',
  tagline: 'Where Beauty Meets Elegance',
  address: '142 Luxury Lane, Suite 4B',
  city_region: 'Mayfair, London',
  opening_hours: 'Tue – Sat: 10:00 AM – 7:30 PM | Sun: 11:00 AM – 5:00 PM',
  currency_symbol: 'MWK',
  currency_code: 'MWK',
  instagram_url: 'https://instagram.com',
  tiktok_url: 'https://tiktok.com',
  pinterest_url: 'https://pinterest.com',
  whatsapp_default_message:
    'Hello MT Mansion! I would like to inquire about booking an appointment for bespoke beauty styling.',
  supabase_url: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://hoeztqucwukrqelltlsm.supabase.co',
  supabase_anon_key: process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_8DUKtlDn88mv3gnt9VujNA_faCE03Wk',
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
  experiences_bg_color: '#180711',
  footer_bg_color: '#1A0A13',
  footer_text_color: '#FBF8F6',
  ceo_google_email: 'ceo@mtmansion.com',
  calendar_sync_enabled: true,
  calendar_reminder_min: 30,
  hero_gradient_enabled: false,
  hero_gradient_start: '#701932',
  hero_gradient_end: '#240F1B',
  theme_preset: 'brutalist',
};

const defaultImageSlots: ImageSlots = {
  logo_url: '/assets/aistudio/Black_and_White_Minimalist_Initials_Logo__1__19e0d52a.jpg',
  hero_image: '/assets/boutique/hero_hand_mt.png',
  services_feature: '/assets/boutique/services_polish_hands.png',
  service_nails: '/assets/boutique/service_nails.png',
  service_lashes: '/assets/boutique/service_lashes.png',
  service_hair: '/assets/boutique/service_hair.png',
  about_image: '/assets/boutique/about_applicators.png',
  hero_secondary_image: '/assets/boutique/hero_secondary.png',
  experience_gallery: [
    '/assets/boutique/experience_1.png',
    '/assets/boutique/experience_2.png',
    '/assets/boutique/experience_3.png'
  ],
};

const defaultServices: ServiceItem[] = [
  {
    id: 'nails-essential',
    category: 'nails',
    number: '01',
    title: 'The polished essential',
    description: 'A clean shape, considered colour and a glossy finish. Effortless, never ordinary.',
    price: 35000,
    duration_min: 50,
    is_active: true,
    is_popular: true,
  },
  {
    id: 'nails-length',
    category: 'nails',
    number: '02',
    title: 'Length & definition',
    description: 'Explore your preferred length and silhouette, from soft almond to a statement shape.',
    price: 50000,
    duration_min: 75,
    is_active: true,
  },
  {
    id: 'nails-art',
    category: 'nails',
    number: '03',
    title: 'Your signature nail art',
    description: 'Delicate details or a bolder mood. Bring your inspiration and let\'s talk design.',
    price: 65000,
    duration_min: 90,
    is_active: true,
    is_popular: true,
  },
  {
    id: 'nails-refresh',
    category: 'nails',
    number: '04',
    title: 'Refresh & removal',
    description: 'Ready for a change? Ask about the right refresh or removal for your current set.',
    price: 25000,
    duration_min: 40,
    is_active: true,
  },
  {
    id: 'lashes-classic',
    category: 'lashes',
    number: '05',
    title: 'Silk Lash Extensions',
    description: 'Feather-light individual silk lashes tailored to your eye curvature for natural volume.',
    price: 75000,
    duration_min: 80,
    is_active: true,
  },
  {
    id: 'hair-blowout',
    category: 'hair',
    number: '06',
    title: 'Wig Installation & Custom Styling',
    description: 'Bespoke lace customization, seamless skin melt, secure installation, and precision thermal styling for a flawless, natural silhouette.',
    price: 60000,
    duration_min: 70,
    is_active: true,
  },
];

const defaultCalendarSlots: CalendarTimeSlot[] = [
  { time: '10:00 AM', period: 'morning', is_available: true },
  { time: '11:30 AM', period: 'morning', is_available: true },
  { time: '01:00 PM', period: 'afternoon', is_available: true },
  { time: '02:30 PM', period: 'afternoon', is_available: true },
  { time: '04:00 PM', period: 'afternoon', is_available: true },
  { time: '05:30 PM', period: 'evening', is_available: true },
  { time: '07:00 PM', period: 'evening', is_available: true },
];

const defaultAppointments: Appointment[] = [
  {
    id: 'MT-89101',
    client_name: 'Elena Rostova',
    client_phone: '+44 7911 123456',
    client_email: 'elena.rostova@example.com',
    service_id: 'nails-art',
    service_title: 'Your signature nail art',
    category: 'nails',
    date: '2026-11-12',
    time_slot: '02:30 PM',
    notes: 'Pastel French with delicate chrome aura lines',
    status: 'confirmed',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'MT-89102',
    client_name: 'Camilla Dupont',
    client_phone: '+44 7911 654321',
    client_email: 'camilla.d@example.com',
    service_id: 'lashes-classic',
    service_title: 'Silk Lash Extensions',
    category: 'lashes',
    date: '2026-11-13',
    time_slot: '11:30 AM',
    notes: 'Natural cat-eye effect for an upcoming gala',
    status: 'pending',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

interface BoutiqueStore {
  settings: BoutiqueSettings;
  imageSlots: ImageSlots;
  services: ServiceItem[];
  calendarSlots: CalendarTimeSlot[];
  appointments: Appointment[];
}

let store: BoutiqueStore = {
  settings: defaultSettings,
  imageSlots: defaultImageSlots,
  services: defaultServices,
  calendarSlots: defaultCalendarSlots,
  appointments: defaultAppointments,
};

// Load saved data if present
try {
  let fileToLoad = '';
  if (fs.existsSync(storeFilePath)) {
    fileToLoad = storeFilePath;
  } else if (fs.existsSync(repoStorePath)) {
    fileToLoad = repoStorePath;
  }

  if (fileToLoad) {
    const raw = fs.readFileSync(fileToLoad, 'utf-8');
    const parsed = JSON.parse(raw);
    store = {
      settings: { ...defaultSettings, ...(parsed.settings || {}) },
      imageSlots: { ...defaultImageSlots, ...(parsed.imageSlots || {}) },
      services: parsed.services?.length ? parsed.services : defaultServices,
      calendarSlots: parsed.calendarSlots?.length ? parsed.calendarSlots : defaultCalendarSlots,
      appointments: parsed.appointments || defaultAppointments,
    };
    console.log(`Loaded store from: ${fileToLoad}`);
  }
} catch (err) {
  console.error('Error reading store file, using defaults:', err);
}

const persistStore = () => {
  try {
    fs.writeFileSync(storeFilePath, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Error persisting store to storeFilePath:', err);
  }
  if (!isVercel) {
    try {
      if (fs.existsSync(path.dirname(repoStorePath))) {
        fs.writeFileSync(repoStorePath, JSON.stringify(store, null, 2), 'utf-8');
      }
    } catch (e) {}
  }
};

// Supabase Client Management
let supabase: SupabaseClient | null = null;

const initSupabase = (url: string, key: string) => {
  if (url && key) {
    try {
      supabase = createClient(url, key);
      console.log('Connected to Supabase project:', url);
      // Listen for Postgres changes on appointments table if available
      try {
        const channel = supabase
          .channel('schema-db-changes')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'appointments' },
            (payload) => {
              console.log('Supabase Postgres change detected:', payload.eventType);
              if (payload.eventType === 'INSERT' && payload.new) {
                const newApt = payload.new as Appointment;
                if (!store.appointments.some((a) => a.id === newApt.id)) {
                  store.appointments.unshift(newApt);
                  persistStore();
                  broadcast({
                    type: 'APPOINTMENT_CREATED',
                    data: newApt,
                    timestamp: Date.now(),
                  });
                }
              } else if (payload.eventType === 'UPDATE' && payload.new) {
                const updatedApt = payload.new as Appointment;
                store.appointments = store.appointments.map((a) =>
                  a.id === updatedApt.id ? updatedApt : a
                );
                persistStore();
                broadcast({
                  type: 'APPOINTMENT_UPDATED',
                  data: updatedApt,
                  timestamp: Date.now(),
                });
              }
            }
          )
          .subscribe();
      } catch (subErr) {
        console.warn('Supabase realtime channel subscription note:', subErr);
      }
    } catch (err) {
      console.error('Failed to create Supabase client:', err);
      supabase = null;
    }
  } else {
    supabase = null;
  }
};

if (store.settings.supabase_url && store.settings.supabase_anon_key) {
  initSupabase(store.settings.supabase_url, store.settings.supabase_anon_key);
}

// WebSocket Server for zero-refresh real-time sync across all client sessions
const wss = new WebSocketServer({ noServer: true });
const activeClients = new Set<WebSocket>();

wss.on('connection', (ws) => {
  activeClients.add(ws);

  // Send initial bootstrap state on connect
  const initMsg: RealtimeMessage = {
    type: 'INIT_STATE',
    data: store,
    timestamp: Date.now(),
  };
  ws.send(JSON.stringify(initMsg));

  ws.on('close', () => {
    activeClients.delete(ws);
  });

  ws.on('error', (err) => {
    console.error('WebSocket client error:', err);
    activeClients.delete(ws);
  });
});

// Broadcast helper: delivers to all open client sessions instantly
const broadcast = (message: RealtimeMessage) => {
  const payload = JSON.stringify(message);
  for (const client of activeClients) {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(payload);
      } catch (err) {
        console.error('Error broadcasting to client:', err);
      }
    }
  }

  // Also notify any Server-Sent Events listeners
  sseListeners.forEach((res) => {
    try {
      res.write(`data: ${payload}\n\n`);
    } catch (e) {
      // client disconnected
    }
  });
};

// SSE Fallback listeners
const sseListeners = new Set<Response>();

// Handle HTTP upgrade to WebSocket
server.on('upgrade', (request, socket, head) => {
  if (request.url === '/ws' || request.url?.startsWith('/ws')) {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  }
});

// API Router supporting both direct /api/* calls and Vercel rewritten /* calls
const apiRouter = express.Router();

apiRouter.get('/bootstrap', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: store,
    hasSupabase: Boolean(supabase),
  });
});

apiRouter.post('/verify-pin', (req: Request, res: Response) => {
  const { pin } = req.body;
  const cleanPin = typeof pin === 'string' ? pin.trim().toUpperCase() : '';
  if (cleanPin === 'MT1234') {
    res.json({ success: true, message: 'Admin authenticated' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid Admin PIN' });
  }
});

apiRouter.post('/appointments', async (req: Request, res: Response) => {
  const { client_name, client_phone, client_email, service_id, date, time_slot, notes } = req.body;

  if (!client_name || !client_phone || !service_id || !date || !time_slot) {
    return res.status(400).json({ success: false, message: 'Missing required booking fields' });
  }

  const service = store.services.find((s) => s.id === service_id);
  const newAppointment: Appointment = {
    id: `MT-${Math.floor(10000 + Math.random() * 90000)}`,
    client_name,
    client_phone,
    client_email: client_email || '',
    service_id,
    service_title: service?.title || 'Bespoke Consultation',
    category: service?.category || 'nails',
    date,
    time_slot,
    notes: notes || '',
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  store.appointments.unshift(newAppointment);
  persistStore();

  // Try mirroring to Supabase if configured
  if (supabase) {
    try {
      await supabase.from('appointments').insert([newAppointment]);
    } catch (err) {
      console.warn('Note: Could not insert to Supabase table (table may not exist yet):', err);
    }
  }

  // Instant real-time broadcast to all browser sessions
  broadcast({
    type: 'APPOINTMENT_CREATED',
    data: newAppointment,
    timestamp: Date.now(),
  });

  res.json({ success: true, appointment: newAppointment });
});

apiRouter.patch('/appointments/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, notes, time_slot, date } = req.body;

  const index = store.appointments.findIndex((a) => a.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Appointment not found' });
  }

  const updated: Appointment = {
    ...store.appointments[index],
    ...(status ? { status } : {}),
    ...(notes !== undefined ? { notes } : {}),
    ...(time_slot ? { time_slot } : {}),
    ...(date ? { date } : {}),
  };

  store.appointments[index] = updated;
  persistStore();

  if (supabase) {
    try {
      await supabase.from('appointments').update(updated).eq('id', id);
    } catch (err) {
      console.warn('Supabase update note:', err);
    }
  }

  broadcast({
    type: 'APPOINTMENT_UPDATED',
    data: updated,
    timestamp: Date.now(),
  });

  res.json({ success: true, appointment: updated });
});

apiRouter.post('/settings', (req: Request, res: Response) => {
  const newSettings = req.body;
  store.settings = {
    ...store.settings,
    ...newSettings,
  };
  persistStore();

  if (newSettings.supabase_url !== undefined || newSettings.supabase_anon_key !== undefined) {
    initSupabase(store.settings.supabase_url, store.settings.supabase_anon_key);
  }

  // Mirror settings to Supabase
  if (supabase) {
    try {
      const payload = {
        id: 'current',
        hero_bg_color: store.settings.hero_bg_color,
        hero_accent_color: store.settings.hero_accent_color,
        boutique_name: store.settings.boutique_name,
        tagline: store.settings.tagline,
        whatsapp_number: store.settings.whatsapp_number,
        hero_description: store.settings.hero_description,
        settings: store.settings,
        updated_at: new Date().toISOString(),
      };
      Promise.resolve(supabase.from('boutique_settings').upsert(payload, { onConflict: 'id' })).catch(() => {});
    } catch (e) {
      // Supabase mirror error ignored
    }
  }

  broadcast({
    type: 'SETTINGS_UPDATED',
    data: store.settings,
    timestamp: Date.now(),
  });

  res.json({ success: true, settings: store.settings });
});

apiRouter.post('/image-slots', (req: Request, res: Response) => {
  const newImageSlots = req.body;
  store.imageSlots = {
    ...store.imageSlots,
    ...newImageSlots,
  };
  persistStore();

  broadcast({
    type: 'IMAGES_UPDATED',
    data: store.imageSlots,
    timestamp: Date.now(),
  });

  res.json({ success: true, imageSlots: store.imageSlots });
});

apiRouter.post('/services', (req: Request, res: Response) => {
  const { services } = req.body;
  if (Array.isArray(services)) {
    store.services = services;
    persistStore();

    // Mirror services to Supabase
    if (supabase) {
      try {
        const rows = services.map((s: any, idx: number) => ({
          id: s.id,
          category: s.category,
          number: s.number || String(idx + 1).padStart(2, '0'),
          title: s.title,
          description: s.description || '',
          price: Number(s.price) || 0,
          duration_min: Number(s.duration_min) || 60,
          is_active: s.is_active !== false,
          updated_at: new Date().toISOString(),
        }));
        Promise.resolve(supabase.from('services').upsert(rows, { onConflict: 'id' })).catch(() => {});
      } catch (e) {
        // Supabase mirror error ignored
      }
    }

    broadcast({
      type: 'SERVICES_UPDATED',
      data: store.services,
      timestamp: Date.now(),
    });

    res.json({ success: true, services: store.services });
  } else {
    res.status(400).json({ success: false, message: 'Services array expected' });
  }
});

apiRouter.post('/slots', (req: Request, res: Response) => {
  const { slots } = req.body;
  if (Array.isArray(slots)) {
    store.calendarSlots = slots;
    persistStore();

    broadcast({
      type: 'SLOTS_UPDATED',
      data: store.calendarSlots,
      timestamp: Date.now(),
    });

    res.json({ success: true, slots: store.calendarSlots });
  } else {
    res.status(400).json({ success: false, message: 'Slots array expected' });
  }
});

apiRouter.post('/sync-store', (req: Request, res: Response) => {
  const clientStore = req.body;
  if (clientStore && typeof clientStore === 'object') {
    if (clientStore.settings) store.settings = { ...store.settings, ...clientStore.settings };
    if (clientStore.imageSlots) store.imageSlots = { ...store.imageSlots, ...clientStore.imageSlots };
    if (Array.isArray(clientStore.services)) store.services = clientStore.services;
    if (Array.isArray(clientStore.calendarSlots)) store.calendarSlots = clientStore.calendarSlots;
    persistStore();
  }
  res.json({ success: true, store });
});

// Test Supabase connection endpoint
apiRouter.post('/test-supabase', async (req: Request, res: Response) => {
  const { url, key } = req.body;
  if (!url || !key) {
    return res.status(400).json({ success: false, message: 'URL and Anon key required' });
  }

  try {
    const testClient = createClient(url, key);
    const { error } = await testClient.from('appointments').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      return res.json({
        success: true,
        reachable: true,
        tableExists: false,
        message: `Connected to Supabase! Note: 'appointments' table does not exist yet (${error.message}). Realtime sync is active for other channels.`,
      });
    }
    return res.json({
      success: true,
      reachable: true,
      tableExists: true,
      message: 'Supabase connected successfully with Postgres changes listener active!',
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      reachable: false,
      message: err.message || 'Failed to connect to Supabase project',
    });
  }
});

// Google Calendar sync endpoint
apiRouter.post('/calendar/sync', async (req: Request, res: Response) => {
  const { appointment, apiKey, calendarId } = req.body;
  if (!appointment || !appointment.client_name) {
    return res.status(400).json({ success: false, message: 'Invalid appointment payload' });
  }

  const [year, month, day] = (appointment.date || '2026-11-12').split('-').map(Number);
  let hours = 14;
  let minutes = 30;
  try {
    const match = (appointment.time_slot || '').match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (match) {
      hours = parseInt(match[1], 10);
      minutes = parseInt(match[2], 10);
      const ampm = match[3].toUpperCase();
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
    }
  } catch (e) {}

  const startDate = new Date(year, (month || 1) - 1, day || 1, hours, minutes, 0);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
  const formatISO = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, '');
  const dates = `${formatISO(startDate)}/${formatISO(endDate)}`;

  const title = `MT Mansion: ${appointment.service_title} - ${appointment.client_name}`;
  const details = `Boutique Appointment Booking\n\nClient: ${appointment.client_name}\nPhone: ${appointment.client_phone}\nTreatment: ${appointment.service_title}\nDate: ${appointment.date}\nTime: ${appointment.time_slot}\n${appointment.notes ? `Notes: ${appointment.notes}\n` : ''}Ref: ${appointment.id}`;
  const location = `MT Mansion Luxury Boutique`;

  const webLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${encodeURIComponent(dates)}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;

  if (apiKey) {
    try {
      const targetCal = calendarId || store.settings.ceo_google_email || 'primary';
      const eventPayload = {
        summary: title,
        description: details,
        location,
        start: { dateTime: startDate.toISOString() },
        end: { dateTime: endDate.toISOString() },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: store.settings.calendar_reminder_min || 30 },
            { method: 'email', minutes: store.settings.calendar_reminder_min || 30 }
          ]
        }
      };

      const googleRes = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(targetCal)}/events?key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventPayload),
        }
      );
      if (googleRes.ok) {
        return res.json({ success: true, synced: true, webLink, message: 'Synced to Google Calendar via API key' });
      }
    } catch (gErr) {
      console.warn('Google Calendar API sync error:', gErr);
    }
  }

  return res.json({ success: true, synced: false, webLink, message: 'Google Calendar web link generated' });
});

// SSE endpoint for fallback real-time streaming
apiRouter.get('/realtime-sse', (req: Request, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.write('\n');
  sseListeners.add(res);

  req.on('close', () => {
    sseListeners.delete(res);
  });
});

// Mount on both /api (standard) and / (Vercel rewrite fallback)
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Vite Middleware integration in Dev / Static Serving in Prod
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  server.listen(port, '0.0.0.0', () => {
    console.log(`MT Mansion server running on http://localhost:${port}`);
  });
}

if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

export default app;
