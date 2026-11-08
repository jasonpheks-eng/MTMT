import React, { useState } from 'react';
import { Database, CheckCircle, AlertCircle, RefreshCw, Copy, Check, ExternalLink } from 'lucide-react';
import { BoutiqueSettings, ServiceItem } from '../../../types';
import { SUPABASE_SETUP_SQL, SupabaseHealthStatus } from '../../../lib/supabaseSync';

interface TabSupabaseProps {
  settingsForm: BoutiqueSettings;
  setSettingsForm: React.Dispatch<React.SetStateAction<BoutiqueSettings>>;
  servicesList: ServiceItem[];
  isSupabaseActive: boolean;
  testSupabase: (url: string, key: string) => Promise<{ success: boolean; message: string }>;
  checkSupabaseStatus: () => Promise<SupabaseHealthStatus>;
  syncSettingsWithSupabase: (settings: BoutiqueSettings) => Promise<any>;
  syncServicesWithSupabase: (services: ServiceItem[]) => Promise<any>;
  showSuccessNotice: (msg: string) => void;
}

export const TabSupabase: React.FC<TabSupabaseProps> = ({
  settingsForm,
  setSettingsForm,
  servicesList,
  isSupabaseActive,
  testSupabase,
  checkSupabaseStatus,
  syncSettingsWithSupabase,
  syncServicesWithSupabase,
  showSuccessNotice,
}) => {
  const [supabaseTestResult, setSupabaseTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [isSyncingAllSupabase, setIsSyncingAllSupabase] = useState(false);
  const [supabaseHealth, setSupabaseHealth] = useState<SupabaseHealthStatus | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  return (
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
  );
};
