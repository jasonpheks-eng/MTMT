import React, { useState, useMemo } from 'react';
import { 
  RefreshCw, 
  Save, 
  Trash2, 
  Plus, 
  Minus,
  Copy, 
  Sparkles, 
  ArrowUp, 
  ArrowDown, 
  Search, 
  Check, 
  Clock, 
  Tag, 
  Layers 
} from 'lucide-react';
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
  // New Treatment Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'nails' | 'lashes' | 'hair'>('nails');
  const [newPrice, setNewPrice] = useState<number>(35000);
  const [newDuration, setNewDuration] = useState<number>(60);
  const [newHideDuration, setNewHideDuration] = useState<boolean>(false);
  const [newDescription, setNewDescription] = useState('');
  const [newIsPopular, setNewIsPopular] = useState(false);
  const [isAddFormOpen, setIsAddFormOpen] = useState(true);

  // Filter & Search State
  const [filterCategory, setFilterCategory] = useState<'all' | 'nails' | 'lashes' | 'hair'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Treatment handler
  const handleAddNewTreatment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTitle.trim()) {
      showSuccessNotice('Please enter a treatment name.');
      return;
    }

    const newId = `${newCategory}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;
    const nextNumber = String(servicesList.length + 1).padStart(2, '0');

    const createdService: ServiceItem = {
      id: newId,
      category: newCategory,
      number: nextNumber,
      title: newTitle.trim(),
      description: newDescription.trim() || `${newDuration} mins professional boutique treatment.`,
      price: Number(newPrice) || 0,
      duration_min: Number(newDuration) || 45,
      hide_duration: newHideDuration,
      is_active: true,
      is_popular: newIsPopular,
    };

    const updated = [createdService, ...servicesList];
    setServicesList(updated);
    await updateServices(updated);
    showSuccessNotice(`Added new treatment "${createdService.title}"!`);

    // Reset Form
    setNewTitle('');
    setNewDescription('');
    setNewIsPopular(false);
    setNewHideDuration(false);
  };

  // Quick Blank Treatment Handler (instant row add)
  const handleQuickAddBlank = async () => {
    const newId = `service-${Date.now().toString(36)}`;
    const nextNumber = String(servicesList.length + 1).padStart(2, '0');

    const blankService: ServiceItem = {
      id: newId,
      category: filterCategory === 'all' ? 'nails' : filterCategory,
      number: nextNumber,
      title: 'New Bespoke Treatment',
      description: 'Custom luxury styling tailored to your preferences.',
      price: 35000,
      duration_min: 60,
      is_active: true,
      is_popular: false,
    };

    const updated = [blankService, ...servicesList];
    setServicesList(updated);
    await updateServices(updated);
    showSuccessNotice('New treatment row added! You can edit its name, category, and price directly below.');
  };

  // Duplicate an existing service
  const handleDuplicate = async (index: number) => {
    const target = servicesList[index];
    const newId = `${target.category}-${Date.now().toString(36)}`;
    const duplicated: ServiceItem = {
      ...target,
      id: newId,
      title: `${target.title} (Copy)`,
      number: String(servicesList.length + 1).padStart(2, '0'),
    };

    const updated = [...servicesList];
    updated.splice(index + 1, 0, duplicated);
    setServicesList(updated);
    await updateServices(updated);
    showSuccessNotice(`Duplicated "${target.title}"!`);
  };

  // Move service up/down in ordering
  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= servicesList.length) return;

    const updated = [...servicesList];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    setServicesList(updated);
    await updateServices(updated);
  };

  // Filtered view
  const filteredList = useMemo(() => {
    return servicesList.filter((s) => {
      const matchesCat = filterCategory === 'all' || s.category === filterCategory;
      const matchesSearch = 
        !searchQuery.trim() || 
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [servicesList, filterCategory, searchQuery]);

  const currencySym = settingsForm.currency_symbol || 'MWK';

  return (
    <div className="space-y-8 pb-12 sm:pb-8" style={{ fontFamily: 'Verdana, Geneva, sans-serif' }}>
      {/* Header with Title and Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-editorial text-2xl sm:text-3xl text-white">Treatments & Services Editor</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#C45266]/30 text-rose-200 border border-[#C45266]/40">
              {servicesList.length} Active
            </span>
          </div>
          <p className="text-xs text-white/70 mt-1 max-w-xl">
            Add as many treatments as you like for Nails, Lashes, and Wig Installation. Edit prices, durations, descriptions, and categories. Changes broadcast live across the website and booking forms.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={handleQuickAddBlank}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-all border border-white/20 shadow-md cursor-pointer"
            title="Quickly append a new treatment row"
          >
            <Plus className="w-3.5 h-3.5 text-rose-300" />
            <span>+ Quick Add</span>
          </button>

          <button
            type="button"
            onClick={handleSaveServices}
            disabled={isSavingServices}
            className="px-5 py-2.5 rounded-xl bg-[#C45266] hover:bg-[#b04356] text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50 shrink-0"
          >
            {isSavingServices ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{isSavingServices ? 'Saving to Database...' : 'Save Services to Database'}</span>
          </button>
        </div>
      </div>

      {/* Prominent "Add New Treatment" Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/20 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#C45266] flex items-center justify-center text-white shadow-md">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Add New Treatment
              </h4>
              <p className="text-[11px] text-white/60">
                Create a new service offering and immediately publish it to your boutique catalog
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAddFormOpen(!isAddFormOpen)}
            className="text-xs text-rose-300 hover:text-white underline underline-offset-4 font-mono transition-colors cursor-pointer"
          >
            {isAddFormOpen ? 'Collapse Form' : 'Expand Form'}
          </button>
        </div>

        {isAddFormOpen && (
          <form onSubmit={handleAddNewTreatment} className="space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
              {/* Treatment Title */}
              <div className="sm:col-span-5">
                <label className="block text-[10px] uppercase tracking-wider text-rose-200 font-semibold mb-1">
                  Treatment Name *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Russian Gel Manicure, Hybrid Volume Lashes..."
                  className="w-full bg-white/10 border border-white/25 focus:border-rose-400 focus:ring-1 focus:ring-rose-400 rounded-xl px-3 py-2 text-xs text-white placeholder-white/35 font-medium shadow-inner"
                />
              </div>

              {/* Category */}
              <div className="sm:col-span-3">
                <label className="block text-[10px] uppercase tracking-wider text-rose-200 font-semibold mb-1">
                  Category *
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-[#200A18] border border-white/25 focus:border-rose-400 rounded-xl px-3 py-2 text-xs text-white font-medium"
                >
                  <option value="nails">Nails (Gel, Acrylic & Art)</option>
                  <option value="lashes">Lashes (Extensions & Lifts)</option>
                  <option value="hair">Wig Installation & Styling</option>
                </select>
              </div>

              {/* Price */}
              <div className="sm:col-span-2">
                <label className="block text-[10px] uppercase tracking-wider text-rose-200 font-semibold mb-1">
                  Price ({currencySym}) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  step={500}
                  value={newPrice}
                  onChange={(e) => setNewPrice(Number(e.target.value))}
                  placeholder="35000"
                  className="w-full bg-white/10 border border-white/25 focus:border-rose-400 rounded-xl px-3 py-2 text-xs text-white shadow-inner"
                />
              </div>

              {/* Duration with Minus Button */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] uppercase tracking-wider text-rose-200 font-semibold">
                    Duration (Mins)
                  </label>
                  <button
                    type="button"
                    onClick={() => setNewHideDuration(!newHideDuration)}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      newHideDuration 
                        ? 'bg-rose-500/25 text-rose-200 border border-rose-400/40' 
                        : 'bg-white/10 text-white/70 hover:text-white hover:bg-red-500/20 border border-white/20'
                    }`}
                    title={newHideDuration ? 'Minutes hidden. Click to show' : 'Click minus (-) to hide minutes from treatment'}
                  >
                    {newHideDuration ? (
                      <>
                        <Plus className="w-2.5 h-2.5" />
                        <span>Show</span>
                      </>
                    ) : (
                      <>
                        <Minus className="w-2.5 h-2.5" />
                        <span>Hide</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    disabled={newHideDuration}
                    min={0}
                    step={5}
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    placeholder="60"
                    className={`w-full bg-white/10 border rounded-xl px-3 py-2 text-xs font-mono shadow-inner transition-all ${
                      newHideDuration 
                        ? 'border-white/10 text-white/30 line-through bg-black/30' 
                        : 'border-white/25 focus:border-rose-400 text-white'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setNewHideDuration(!newHideDuration)}
                    className={`p-2 rounded-xl border transition-all shrink-0 cursor-pointer ${
                      newHideDuration 
                        ? 'bg-rose-500/20 border-rose-500/40 text-rose-200 hover:bg-rose-500/30' 
                        : 'bg-white/10 border-white/25 text-white/70 hover:text-white hover:bg-red-500/25'
                    }`}
                    title={newHideDuration ? 'Minutes hidden. Click to show minutes' : 'Click minus (-) to hide minutes from treatment'}
                  >
                    {newHideDuration ? <Plus className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {newHideDuration && (
                  <span className="block text-[9px] font-mono text-rose-300/80 mt-1">
                    Minutes will not show on cards
                  </span>
                )}
              </div>
            </div>

            {/* Description Textarea */}
            <div>
              <label 
                style={{ fontFamily: 'Verdana, Geneva, sans-serif' }}
                className="block text-[10px] uppercase tracking-wider text-rose-200 font-semibold mb-1"
              >
                Treatment Description / Details (shows on booking cards & modal)
              </label>
              <textarea
                rows={2}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Explain the technique, results, what is included, and any prep/aftercare instructions..."
                className="w-full bg-white/10 border border-white/25 focus:border-rose-400 focus:ring-1 focus:ring-rose-400 rounded-xl px-3 py-2 text-xs text-white placeholder-white/35 leading-relaxed resize-y min-h-[58px]"
              />
            </div>

            {/* Bottom Row with Popular toggle and Submit Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-white/80 select-none">
                <input
                  type="checkbox"
                  checked={newIsPopular}
                  onChange={(e) => setNewIsPopular(e.target.checked)}
                  className="w-4 h-4 rounded text-[#C45266] bg-black/40 border-white/30 focus:ring-0 focus:outline-none cursor-pointer"
                />
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Mark as Popular / Signature Treatment</span>
                </span>
              </label>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#C45266] hover:bg-[#b04356] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add Treatment to Catalog</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Filter and Search Bar for Active Treatments */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: `All (${servicesList.length})` },
            { id: 'nails', label: `Nails (${servicesList.filter(s => s.category === 'nails').length})` },
            { id: 'lashes', label: `Lashes (${servicesList.filter(s => s.category === 'lashes').length})` },
            { id: 'hair', label: `Wig Installation (${servicesList.filter(s => s.category === 'hair').length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterCategory(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap border ${
                filterCategory === tab.id
                  ? 'bg-[#C45266] text-white border-white/40 shadow-sm'
                  : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search treatments..."
            className="w-full bg-white/5 border border-white/15 focus:border-white/30 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/30"
          />
        </div>
      </div>

      {/* Treatments List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-white/80 font-medium px-1">
          <span>Showing {filteredList.length} of {servicesList.length} Treatments</span>
          <span className="text-[11px] text-white/50">Auto-saved live | Changes reflect on web page instantly</span>
        </div>

        {filteredList.length === 0 ? (
          <div className="py-12 px-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-3">
            <Layers className="w-8 h-8 text-rose-300/40 mx-auto" />
            <p className="text-xs text-white/60">No treatments match your current filter or search query.</p>
            <button
              type="button"
              onClick={() => {
                setFilterCategory('all');
                setSearchQuery('');
              }}
              className="text-xs text-rose-300 underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          filteredList.map((srv) => {
            // Find global index in servicesList
            const globalIndex = servicesList.findIndex((s) => s.id === srv.id);

            return (
              <div
                key={srv.id}
                className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/30 transition-all space-y-3.5 shadow-sm backdrop-blur-sm group"
              >
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  {/* Position number and Move controls */}
                  <div className="sm:col-span-1 flex items-center sm:flex-col gap-1.5">
                    <span className="text-xs font-mono text-white/80 font-bold">
                      #{globalIndex + 1}
                    </span>
                    <div className="flex sm:flex-col gap-1">
                      <button
                        type="button"
                        disabled={globalIndex === 0}
                        onClick={() => handleMove(globalIndex, 'up')}
                        className="p-1 rounded bg-white/10 hover:bg-white/20 text-white/60 hover:text-white disabled:opacity-20 cursor-pointer"
                        title="Move up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        disabled={globalIndex === servicesList.length - 1}
                        onClick={() => handleMove(globalIndex, 'down')}
                        className="p-1 rounded bg-white/10 hover:bg-white/20 text-white/60 hover:text-white disabled:opacity-20 cursor-pointer"
                        title="Move down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Treatment Title */}
                  <div className="sm:col-span-4">
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="block text-[10px] uppercase text-white/60">
                        Treatment Name
                      </label>
                      {srv.is_popular && (
                        <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          ✦ Popular
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={srv.title}
                      onChange={(e) => {
                        const updated = [...servicesList];
                        updated[globalIndex].title = e.target.value;
                        setServicesList(updated);
                      }}
                      onBlur={() => updateServices(servicesList)}
                      className="w-full bg-white/5 border border-white/20 focus:border-rose-400 rounded-lg px-2.5 py-1.5 text-xs text-white font-medium"
                    />
                  </div>

                  {/* Category */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] uppercase text-white/60 mb-0.5">
                      Category
                    </label>
                    <select
                      value={srv.category}
                      onChange={(e) => {
                        const updated = [...servicesList];
                        updated[globalIndex].category = e.target.value as any;
                        setServicesList(updated);
                        updateServices(updated);
                      }}
                      className="w-full bg-[#200A18] border border-white/20 rounded-lg px-2 py-1.5 text-xs text-white"
                    >
                      <option value="nails">Nails</option>
                      <option value="lashes">Lashes</option>
                      <option value="hair">Wig Installation</option>
                    </select>
                  </div>

                  {/* Price */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] uppercase text-white/60 mb-0.5">
                      Price ({currencySym})
                    </label>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-white/70 font-mono">{currencySym}</span>
                      <input
                        type="number"
                        value={srv.price}
                        onChange={(e) => {
                          const updated = [...servicesList];
                          updated[globalIndex].price = Number(e.target.value);
                          setServicesList(updated);
                        }}
                        onBlur={() => updateServices(servicesList)}
                        className="w-full bg-white/5 border border-white/20 rounded-lg px-2 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* Duration with Minus Button */}
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="block text-[10px] uppercase text-white/60">
                        Mins
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...servicesList];
                          const willHide = !updated[globalIndex].hide_duration;
                          updated[globalIndex].hide_duration = willHide;
                          setServicesList(updated);
                          updateServices(updated);
                          showSuccessNotice(
                            willHide 
                              ? `Hidden minutes for "${srv.title}"` 
                              : `Showing minutes for "${srv.title}"`
                          );
                        }}
                        className={`px-1 py-0.5 rounded text-[8px] font-mono font-bold flex items-center gap-0.5 transition-all cursor-pointer ${
                          srv.hide_duration 
                            ? 'bg-rose-500/25 text-rose-300 border border-rose-400/40' 
                            : 'bg-white/10 text-white/70 hover:text-white hover:bg-red-500/20 border border-white/20'
                        }`}
                        title={srv.hide_duration ? 'Click to show minutes in treatment' : 'Click minus (-) to hide minutes from treatment'}
                      >
                        {srv.hide_duration ? (
                          <>
                            <Plus className="w-2 h-2" />
                            <span>Show</span>
                          </>
                        ) : (
                          <>
                            <Minus className="w-2 h-2" />
                            <span>Hide</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        disabled={srv.hide_duration}
                        value={srv.duration_min}
                        onChange={(e) => {
                          const updated = [...servicesList];
                          updated[globalIndex].duration_min = Number(e.target.value);
                          setServicesList(updated);
                        }}
                        onBlur={() => updateServices(servicesList)}
                        className={`w-full bg-white/5 border rounded-lg px-2 py-1.5 text-xs font-mono transition-all ${
                          srv.hide_duration 
                            ? 'border-white/10 text-white/30 line-through bg-black/30' 
                            : 'border-white/20 text-white'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...servicesList];
                          const willHide = !updated[globalIndex].hide_duration;
                          updated[globalIndex].hide_duration = willHide;
                          setServicesList(updated);
                          updateServices(updated);
                          showSuccessNotice(
                            willHide 
                              ? `Hidden minutes for "${srv.title}"` 
                              : `Showing minutes for "${srv.title}"`
                          );
                        }}
                        className={`p-1.5 rounded-lg border transition-all shrink-0 cursor-pointer ${
                          srv.hide_duration 
                            ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 hover:bg-rose-500/30' 
                            : 'bg-white/10 border-white/20 text-white/70 hover:text-white hover:bg-red-500/25'
                        }`}
                        title={srv.hide_duration ? 'Minutes hidden. Click to show minutes' : 'Click minus (-) to hide minutes from treatment'}
                      >
                        {srv.hide_duration ? <Plus className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                      </button>
                    </div>
                    {srv.hide_duration && (
                      <span className="block text-[9px] font-mono text-rose-300/80 mt-0.5 leading-none">
                        Minutes hidden
                      </span>
                    )}
                  </div>

                  {/* Actions (Duplicate & Delete) */}
                  <div className="sm:col-span-1 flex items-center justify-end gap-1 pt-2 sm:pt-0">
                    <button
                      type="button"
                      onClick={() => handleDuplicate(globalIndex)}
                      className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                      title="Duplicate this treatment"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        const updated = servicesList.filter((_, i) => i !== globalIndex);
                        setServicesList(updated);
                        await updateServices(updated);
                        showSuccessNotice(`Deleted "${srv.title}"`);
                      }}
                      className="p-1.5 text-rose-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                      title="Delete Treatment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Description & Popular Tag Options */}
                <div className="pt-2 border-t border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] uppercase tracking-wider font-mono text-white/70">
                      Service Information / Description (displays on web page)
                    </label>
                    <label className="inline-flex items-center gap-1.5 text-[10px] font-mono text-white/70 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={srv.is_popular || false}
                        onChange={(e) => {
                          const updated = [...servicesList];
                          updated[globalIndex].is_popular = e.target.checked;
                          setServicesList(updated);
                          updateServices(updated);
                        }}
                        className="w-3.5 h-3.5 rounded text-[#C45266] bg-black/40 border-white/30"
                      />
                      <span>Mark Popular</span>
                    </label>
                  </div>
                  <textarea
                    rows={2}
                    value={srv.description || ''}
                    onChange={(e) => {
                      const updated = [...servicesList];
                      updated[globalIndex].description = e.target.value;
                      setServicesList(updated);
                    }}
                    onBlur={() => updateServices(servicesList)}
                    placeholder="Enter detailed description of treatment technique, prep, results, or advice..."
                    className="w-full bg-white/5 border border-white/15 focus:border-white/40 focus:ring-1 focus:ring-rose-400/50 rounded-xl px-3 py-2 text-xs text-rose-100/90 placeholder-white/25 focus:outline-none leading-relaxed resize-y min-h-[52px]"
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
