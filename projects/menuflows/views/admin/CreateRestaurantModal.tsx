import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api.admin';

interface CreateRestaurantModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const BUSINESS_TYPES = [
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'cafe', label: 'Cafe' },
  { value: 'bar', label: 'Bar' },
  { value: 'fast_food', label: 'Fast Food' },
  { value: 'bakery', label: 'Bakery' },
  { value: 'food_truck', label: 'Food Truck' },
];

const ACCENT_COLORS = [
  '#c21e3a', // Primary red
  '#2563eb', // Blue
  '#059669', // Emerald
  '#d97706', // Amber
  '#7c3aed', // Purple
  '#db2777', // Pink
  '#0891b2', // Cyan
  '#65a30d', // Lime
];

const CreateRestaurantModal: React.FC<CreateRestaurantModalProps> = ({ onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [businessType, setBusinessType] = useState('restaurant');
  const [accentColor, setAccentColor] = useState('#c21e3a');
  const [ownerPin, setOwnerPin] = useState('1234');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-generate slug from name
  useEffect(() => {
    if (!slugEdited && name) {
      const generatedSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setSlug(generatedSlug);
    }
  }, [name, slugEdited]);

  const handleSlugChange = (value: string) => {
    setSlug(value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
    setSlugEdited(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Restaurant name is required');
      return;
    }

    if (!slug.trim()) {
      setError('Slug is required');
      return;
    }

    if (ownerPin.length !== 4 || !/^\d+$/.test(ownerPin)) {
      setError('Owner PIN must be 4 digits');
      return;
    }

    setLoading(true);

    const result = await adminApi.createRestaurant({
      name: name.trim(),
      slug: slug.trim(),
      businessType,
      accentColor,
      ownerPin,
    });

    if (result.restaurant) {
      onSuccess();
    } else {
      setError(result.error || 'Failed to create restaurant');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-[#1c1113] rounded-3xl border border-white/10 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-[#1c1113] px-6 py-5 border-b border-white/5 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-black text-white">New Restaurant</h2>
            <p className="text-[11px] text-text-secondary/50">Create a new tenant</p>
          </div>
          <button
            onClick={onClose}
            className="size-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-text-secondary/50 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60 px-1">
              Restaurant Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Sample Bistro"
              className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 transition-all"
              disabled={loading}
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60 px-1">
              URL Slug
            </label>
            <div className="flex items-center h-12 bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <span className="px-3 text-text-secondary/40 text-sm">/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="sample-bistro"
                className="flex-1 h-full px-0 bg-transparent text-white placeholder:text-white/30 focus:outline-none"
                disabled={loading}
              />
            </div>
            <p className="text-[10px] text-text-secondary/40 px-1">
              Customers will access at: menuflows.app/{slug || 'your-slug'}
            </p>
          </div>

          {/* Business Type */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60 px-1">
              Business Type
            </label>
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
              disabled={loading}
            >
              {BUSINESS_TYPES.map((type) => (
                <option key={type.value} value={type.value} className="bg-[#1c1113]">
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Accent Color */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60 px-1">
              Accent Color
            </label>
            <div className="flex flex-wrap gap-2">
              {ACCENT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setAccentColor(color)}
                  className={`size-10 rounded-xl transition-all ${
                    accentColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1c1113] scale-110' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  disabled={loading}
                />
              ))}
            </div>
          </div>

          {/* Owner PIN */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60 px-1">
              Default Owner PIN
            </label>
            <input
              type="text"
              value={ownerPin}
              onChange={(e) => setOwnerPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="1234"
              maxLength={4}
              className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 transition-all font-mono text-center tracking-[0.5em] text-lg"
              disabled={loading}
            />
            <p className="text-[10px] text-text-secondary/40 px-1">
              4-digit PIN for staff portal access
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
              <p className="text-red-400 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-12 bg-white/5 border border-white/10 rounded-xl font-bold text-sm text-text-secondary hover:bg-white/10 transition-all"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-12 bg-primary rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                  Creating...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Create Restaurant
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRestaurantModal;
