import React, { useState } from 'react';
import { Plus, RefreshCw, Save, Trash2 } from 'lucide-react';
import { ServiceItem, BoutiqueSettings } from '../../../types';

interface TabServicesProps {
  servicesList: ServiceItem[];
  setServicesList: React.Dispatch<React.SetStateAction<ServiceItem[]>>;
  updateServices: (services: ServiceItem[]) => Promise<any>;
  handleSaveServices: () => Promise<void>;
  isSavingServices: boolean;
  settingsForm: BoutiqueSettings;
  showSuccessNotice: (msg: string) => void;
  isSupabaseActive: boolean;
}

export const TabServices: React.FC<TabServicesProps> = ({
  servicesList,
  setServicesList,
  updateServices,
  handleSaveServices,
  isSavingServices,
  settingsForm,
  showSuccessNotice,
  isSupabaseActive,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'nails' | 'lashes' | 'hair'>('nails');
  const [newPrice, setNewPrice] = useState<number>(75);
  const [newDuration, setNewDuration] = useState<number>(60);
  const [newDescription, setNewDescription] = useState('');

  return (
    <div className="space-y-8 pb-12 sm:pb-8">
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

          <div className="sm:col-span-12 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] uppercase tracking-wider text-white/60">
                Service Information / Description
              </label>
              <span className="text-[10px] text-white/40">Multi-line supported · Displays on boutique web page</span>
            </div>
            <textarea
              rows={3}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              onFocus={(e) => {
                setTimeout(() => {
                  e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 250);
              }}
              placeholder="Enter detailed treatment information (e.g. technique, cuticle prep, high-gloss gel finish, what's included, aftercare tips)..."
              className="w-full bg-white/5 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-rose-400/50 leading-relaxed resize-y scroll-mt-28 min-h-[76px]"
            />
            <div className="flex justify-end pt-1">
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
                className="px-5 py-2.5 rounded-xl bg-[#C45266] hover:bg-[#b04356] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 shadow-md cursor-pointer"
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
          <span className="text-[11px] text-white/60">Edits save and broadcast live to web page</span>
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
                  onFocus={(e) => {
                    setTimeout(() => {
                      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 250);
                  }}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white font-medium scroll-mt-28"
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
                    onFocus={(e) => {
                      setTimeout(() => {
                        e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 250);
                    }}
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-2 py-1.5 text-xs text-white font-mono scroll-mt-28"
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
                  onFocus={(e) => {
                    setTimeout(() => {
                      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 250);
                  }}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-2 py-1.5 text-xs text-white font-mono scroll-mt-28"
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

            {/* Service Information Box - Multi-line Textarea */}
            <div className="pt-2 border-t border-white/10 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] uppercase tracking-wider font-mono text-white/70">
                  Service Information / Description (displays on web page)
                </label>
              </div>
              <textarea
                rows={3}
                value={srv.description || ''}
                onChange={(e) => {
                  const updated = [...servicesList];
                  updated[index].description = e.target.value;
                  setServicesList(updated);
                }}
                onBlur={() => updateServices(servicesList)}
                onFocus={(e) => {
                  setTimeout(() => {
                    e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }, 250);
                }}
                placeholder="Enter detailed description of treatment technique, prep, results, or advice..."
                className="w-full bg-white/5 border border-white/15 focus:border-white/40 focus:ring-1 focus:ring-rose-400/50 rounded-xl px-3 py-2 text-xs text-rose-100/90 placeholder-white/25 focus:outline-none leading-relaxed resize-y scroll-mt-28 min-h-[72px]"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
