import React, { useState } from 'react';
import { Image as ImageIcon, Upload, FlipHorizontal, FlipVertical } from 'lucide-react';
import { ImageSlots, SingleImageConfig } from '../../../types';
import { processImageFile, removeImageBackground } from '../../../lib/imageUpload';
import { getImageStyleAndClasses } from '../../../lib/imageStyle';
import { ExperienceGalleryEditor } from '../../ExperienceGallery';

interface TabImagesProps {
  imageSlotsForm: ImageSlots;
  setImageSlotsForm: React.Dispatch<React.SetStateAction<ImageSlots>>;
  handleSaveImageSlots: (e?: React.FormEvent) => Promise<void>;
  updateImageSlots: (slots: Partial<ImageSlots>) => Promise<any>;
  showSuccessNotice: (msg: string) => void;
}

export const TabImages: React.FC<TabImagesProps> = ({
  imageSlotsForm,
  setImageSlotsForm,
  handleSaveImageSlots,
  updateImageSlots,
  showSuccessNotice,
}) => {

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
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1 transition-all cursor-pointer ${
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
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1 transition-all cursor-pointer ${
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
                  className="px-2.5 py-1 rounded-lg text-xs font-mono bg-emerald-700 hover:bg-emerald-600 text-white font-semibold shadow flex items-center gap-1 transition-all cursor-pointer"
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

  return (
    <form onSubmit={handleSaveImageSlots} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-editorial text-2xl text-white">Logo & Boutique Image Studio</h3>
          <p className="text-xs text-white/60 mt-0.5">
            Upload your brand logo, adjust showcase thumbnails, and manage your client experience gallery. Customize zoom, positioning, and background removal for any image.
          </p>
        </div>
      </div>

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
  );
};
