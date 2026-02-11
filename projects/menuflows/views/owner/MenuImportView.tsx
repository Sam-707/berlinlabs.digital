import React, { useState } from 'react';
import { MenuItem } from '../../types';
import {
  getCategoriesForBusinessType,
  normalizeCategory,
  detectAllergens,
  detectSpicy,
} from '../../lib/menu-categories';

interface MenuImportViewProps {
  onImport: (items: MenuItem[]) => void;
  onBack: () => void;
  existingMenu: MenuItem[];
  businessType?: string;
}

interface ProcessedItem {
  original: any;
  normalized: MenuItem;
  selected: boolean;
  categoryOverride?: string;
}

const MenuImportView: React.FC<MenuImportViewProps> = ({ onImport, onBack, existingMenu, businessType }) => {
  const [jsonInput, setJsonInput] = useState('');
  const [processedItems, setProcessedItems] = useState<ProcessedItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'input' | 'review' | 'done'>('input');
  const [replaceMode, setReplaceMode] = useState(false);

  const processJson = () => {
    setError(null);
    try {
      const data = JSON.parse(jsonInput);
      let items: any[] = [];

      // Handle different formats
      if (Array.isArray(data)) {
        items = data;
      } else if (typeof data === 'object') {
        // Grouped by category: { "Burgers": [...], "Sides": [...] }
        for (const [category, categoryItems] of Object.entries(data)) {
          if (Array.isArray(categoryItems)) {
            items.push(...(categoryItems as any[]).map(item => ({ ...item, category })));
          }
        }
      }

      if (items.length === 0) {
        setError('No menu items found in JSON');
        return;
      }

      // Process and normalize
      const processed: ProcessedItem[] = items
        .filter(item => item.name || item.title || item.itemName)
        .map((item, index) => {
          const name = item.name || item.title || item.itemName || 'Unnamed';
          const description = item.description || item.desc || '';
          const rawPrice = item.price || item.itemPrice || item.priceAmount || 0;
          const price = typeof rawPrice === 'string'
            ? parseFloat(rawPrice.replace(/[€$£,]/g, '').replace(',', '.')) || 0
            : rawPrice;
          const image = item.image || item.imageUrl || item.photo || '';
          const category = normalizeCategory(item.category || item.categoryName || item.section || 'Mains', businessType);
          const allergens = detectAllergens(description);

          return {
            original: item,
            selected: true,
            normalized: {
              id: crypto.randomUUID(),
              name: name.trim(),
              description: description.trim(),
              price,
              image: image.startsWith('//') ? 'https:' + image : image,
              category,
              isAvailable: item.available ?? item.isAvailable ?? true,
              isSpicy: detectSpicy(name, description),
              containsPeanuts: allergens.includes('Peanuts'),
              allergens,
              additives: [],
            },
          };
        });

      setProcessedItems(processed);
      setStep('review');
    } catch (e) {
      setError(`Invalid JSON: ${e instanceof Error ? e.message : 'Parse error'}`);
    }
  };

  const updateItem = (index: number, updates: Partial<MenuItem>) => {
    setProcessedItems(prev => prev.map((item, i) =>
      i === index ? { ...item, normalized: { ...item.normalized, ...updates } } : item
    ));
  };

  const toggleItem = (index: number) => {
    setProcessedItems(prev => prev.map((item, i) =>
      i === index ? { ...item, selected: !item.selected } : item
    ));
  };

  const handleImport = () => {
    const selectedItems = processedItems
      .filter(p => p.selected)
      .map(p => p.normalized);

    if (replaceMode) {
      onImport(selectedItems);
    } else {
      onImport([...existingMenu, ...selectedItems]);
    }
    setStep('done');
  };

  const selectedCount = processedItems.filter(p => p.selected).length;
  const categories = [...new Set(processedItems.map(p => p.normalized.category))];

  return (
    <div className="h-full bg-admin-bg text-white flex flex-col">
      {/* Header */}
      <header className="px-6 pt-8 pb-4 flex items-center gap-4 border-b border-white/5">
        <button onClick={onBack} className="size-10 rounded-full bg-white/5 flex items-center justify-center">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1 className="text-xl font-black">Import Menu</h1>
          <p className="text-xs text-text-secondary">From UberEats, Deliveroo, etc.</p>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {step === 'input' && (
          <>
            <div className="bg-admin-surface rounded-2xl p-6 space-y-4">
              <h2 className="font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">data_object</span>
                Paste Scraped JSON
              </h2>
              <p className="text-xs text-text-secondary">
                Paste the JSON data from UberEats, Deliveroo, or any menu scraper.
                We'll automatically normalize categories, detect allergens, and clean up the data.
              </p>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder={`[
  {
    "name": "Classic Burger",
    "description": "Juicy beef patty with cheese...",
    "price": "12.50",
    "category": "Burgers",
    "image": "https://..."
  },
  ...
]`}
                className="w-full h-64 bg-black/20 rounded-xl p-4 text-sm font-mono text-white/80 placeholder:text-white/20 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {error && (
                <div className="text-red-400 text-sm bg-red-500/10 rounded-lg p-3">
                  {error}
                </div>
              )}
            </div>

            <div className="bg-admin-surface rounded-2xl p-6 space-y-3">
              <h3 className="font-bold text-sm">Supported Formats</h3>
              <div className="grid grid-cols-2 gap-3 text-xs text-text-secondary">
                <div className="bg-black/20 rounded-lg p-3">
                  <p className="font-bold text-white mb-1">Array format</p>
                  <code>[{"{name, price, ...}"}]</code>
                </div>
                <div className="bg-black/20 rounded-lg p-3">
                  <p className="font-bold text-white mb-1">Grouped format</p>
                  <code>{"{\"Burgers\": [...], ...}"}</code>
                </div>
              </div>
            </div>

            <button
              onClick={processJson}
              disabled={!jsonInput.trim()}
              className="w-full h-14 rounded-full bg-primary text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Process & Preview
            </button>
          </>
        )}

        {step === 'review' && (
          <>
            {/* Summary */}
            <div className="bg-admin-surface rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold">Review Items</h2>
                <span className="text-sm text-text-secondary">
                  {selectedCount} of {processedItems.length} selected
                </span>
              </div>

              {/* Category chips */}
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => {
                  const count = processedItems.filter(p => p.normalized.category === cat && p.selected).length;
                  return (
                    <span key={cat} className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold">
                      {cat}: {count}
                    </span>
                  );
                })}
              </div>

              {/* Replace mode toggle */}
              <label className="flex items-center gap-3 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={replaceMode}
                  onChange={(e) => setReplaceMode(e.target.checked)}
                  className="rounded bg-white/10 border-none text-primary focus:ring-primary"
                />
                <span>Replace existing menu ({existingMenu.length} items)</span>
              </label>
            </div>

            {/* Items list */}
            <div className="space-y-3">
              {processedItems.map((item, index) => (
                <div
                  key={index}
                  className={`bg-admin-surface rounded-xl p-4 space-y-3 transition-opacity ${!item.selected ? 'opacity-40' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => toggleItem(index)}
                      className="mt-1 rounded bg-white/10 border-none text-primary"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={item.normalized.name}
                          onChange={(e) => updateItem(index, { name: e.target.value })}
                          className="flex-1 bg-transparent font-bold text-white border-none p-0 focus:ring-0"
                        />
                        <span className="text-price font-bold">
                          €{item.normalized.price.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary line-clamp-2 mt-1">
                        {item.normalized.description || 'No description'}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <select
                          value={item.normalized.category}
                          onChange={(e) => updateItem(index, { category: e.target.value })}
                          className="text-xs bg-black/30 rounded-lg px-2 py-1 border-none text-white"
                        >
                          {getCategoriesForBusinessType(businessType).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        {item.normalized.isSpicy && (
                          <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">🌶️ Spicy</span>
                        )}
                        {item.normalized.allergens.length > 0 && (
                          <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
                            ⚠️ {item.normalized.allergens.length} allergens
                          </span>
                        )}
                      </div>
                    </div>
                    {item.normalized.image && (
                      <img
                        src={item.normalized.image}
                        alt=""
                        className="size-16 rounded-lg object-cover bg-black/20"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setStep('input')}
                className="flex-1 h-12 rounded-full bg-white/5 text-white font-bold"
              >
                Back
              </button>
              <button
                onClick={handleImport}
                disabled={selectedCount === 0}
                className="flex-1 h-12 rounded-full bg-primary text-white font-bold disabled:opacity-50"
              >
                Import {selectedCount} Items
              </button>
            </div>
          </>
        )}

        {step === 'done' && (
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="size-20 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-emerald-500 text-4xl">check_circle</span>
            </div>
            <h2 className="text-2xl font-black">Import Complete!</h2>
            <p className="text-text-secondary text-center">
              {selectedCount} menu items have been imported.
              <br />You can now edit them in Inventory.
            </p>
            <button
              onClick={onBack}
              className="h-12 px-8 rounded-full bg-primary text-white font-bold"
            >
              Go to Inventory
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuImportView;
