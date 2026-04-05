
import React, { useState, useEffect, useMemo } from 'react';
import { MenuItem, MenuCategory } from '../types';
import { useBranding } from '../contexts';

interface MenuViewProps {
  menu: MenuItem[];
  categories: MenuCategory[];
  cartCount: number;
  onItemClick: (item: MenuItem) => void;
  onOpenCart: () => void;
  onQuickAdd: (item: MenuItem) => void;
  selectedTableNumber?: number | null;
  restaurantName?: string;
}

const MenuView: React.FC<MenuViewProps> = ({ menu, categories, cartCount, onItemClick, onOpenCart, onQuickAdd, selectedTableNumber, restaurantName }) => {
  const branding = useBranding();
  const isDemo = typeof window !== 'undefined' && window.location.pathname.replace(/\/$/, '') === '/demo';

  // Derive category list: prefer DB categories, fall back to unique item.category values
  const effectiveCategories = useMemo(() => {
    if (categories.length > 0) return categories.map(c => c.name);
    return Array.from(new Set(menu.map(item => item.category))).filter(Boolean);
  }, [categories, menu]);

  const initialCategory = effectiveCategories[0] ?? '';
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [lastActiveCategory, setLastActiveCategory] = useState(initialCategory);

  // Keep activeCategory in sync when effectiveCategories first loads
  useEffect(() => {
    if (activeCategory === '' && effectiveCategories.length > 0) {
      setActiveCategory(effectiveCategories[0]);
      setLastActiveCategory(effectiveCategories[0]);
    }
  }, [effectiveCategories, activeCategory]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isBouncing, setIsBouncing] = useState(false);

  useEffect(() => {
    if (cartCount > 0) {
      setIsBouncing(true);
      const timer = setTimeout(() => setIsBouncing(false), 500);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  // Safe normalization (handles null/undefined)
  const normalize = (str: string | undefined | null): string => {
    if (!str) return '';
    return str.toLowerCase().trim().replace(/\s+/g, ' ');
  };

  // Check if item matches search query
  const matchesSearch = (item: MenuItem, query: string): boolean => {
    if (!query) return true;
    const q = normalize(query);
    return (
      normalize(item.name).includes(q) ||
      normalize(item.description).includes(q) ||
      normalize(item.category).includes(q)
    );
  };

  // Two modes: (1) No search = filter by activeCategory, (2) Searching = filter by query across all items
  const isSearching = searchQuery.trim().length > 0;

  const filteredItems = menu.filter(item => {
    // Always filter by availability
    if (!item.isAvailable) return false;

    // Search mode: ignore category, match by query
    if (isSearching) {
      return matchesSearch(item, searchQuery);
    }

    // Normal mode: filter by active category
    return item.category === activeCategory;
  });

  // Get unique categories that have matching items
  const categoriesWithMatches = useMemo(() => {
    if (!isSearching) return effectiveCategories;
    const uniqueCategories = new Set(filteredItems.map(item => item.category));
    return effectiveCategories.filter(cat => uniqueCategories.has(cat));
  }, [filteredItems, isSearching, effectiveCategories]);

  // Handle search input change
  const handleSearchChange = (value: string) => {
    // Save active category when starting a search
    if (!isSearching && value.trim().length > 0) {
      setLastActiveCategory(activeCategory);
    }
    setSearchQuery(value);
  };

  // Handle clearing search
  const handleClearSearch = () => {
    setSearchQuery('');
    setActiveCategory(lastActiveCategory);
  };

  // Handle category chip click
  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    setSearchQuery(''); // Clear search when switching categories
  };

  return (
    <div className="flex flex-col h-full bg-background-dark view-transition relative overflow-hidden">

      {/* Agency Preview Banner */}
      {isDemo && (
        <div className="shrink-0 flex items-center justify-between gap-3 px-4 py-2.5 border-b border-white/10 z-50" style={{ background: '#0a0a12' }}>
          <p className="text-[9px] text-slate-400 leading-tight truncate min-w-0">
            <span className="text-white font-black">Preview — </span>
            This is how your restaurant clients' menus look under the{' '}
            <span className="font-black" style={{ color: 'var(--color-accent)' }}>{branding.company.name}</span> brand.
          </p>
          <a
            href="/#pricing"
            className="shrink-0 text-[9px] font-black text-white hover:opacity-75 transition-opacity whitespace-nowrap"
          >
            Get Source Code →
          </a>
        </div>
      )}

      {/* Subtle Background Glow */}
      <div
        className="absolute top-0 left-0 right-0 h-96 pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--color-accent) 10%, transparent), transparent)' }}
      />

      <header className="pt-8 sm:pt-12 pb-4 px-6 sticky top-0 bg-background-dark/90 backdrop-blur-xl z-30 border-b border-white/5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-white">{restaurantName || 'Restaurant'}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-[10px] text-text-secondary font-black uppercase tracking-[0.2em]">Now Open</p>
              {selectedTableNumber && (
                <div className="ml-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/20">
                  <span className="material-symbols-outlined text-[12px] text-white">table_restaurant</span>
                  <span className="text-[10px] font-black text-white uppercase tracking-wider">Table {selectedTableNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search menu…"
            className="w-full h-10 pl-10 pr-10 rounded-full bg-white/5 border border-white/10 text-white text-sm placeholder:text-text-secondary/40 focus:outline-none focus:border-accent-ring transition-colors"
          />
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/40 text-[18px] pointer-events-none">
            search
          </span>
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 size-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <span className="material-symbols-outlined text-[14px] text-text-secondary">close</span>
            </button>
          )}
        </div>
      </header>

      {/* Categories Scroller */}
      <div className="px-6 py-4 sticky top-[116px] sm:top-[132px] z-20 bg-background-dark/90 backdrop-blur-xl">
        <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
          {categoriesWithMatches.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`flex-none px-6 py-3 rounded-full text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                activeCategory === cat && !isSearching
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105'
                  : 'bg-white/5 text-text-secondary border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 overflow-y-auto no-scrollbar pb-32 px-6 pt-2">
        {filteredItems.length === 0 && isSearching ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-[48px] text-text-secondary/20 mb-4">search_off</span>
            <h3 className="text-lg font-black text-white mb-2">No matches for "{searchQuery}"</h3>
            <p className="text-sm text-text-secondary mb-6">Try a different search term</p>
            <button
              onClick={handleClearSearch}
              className="px-6 py-2.5 rounded-full bg-primary text-white text-sm font-black uppercase tracking-wider"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:gap-8">
            {filteredItems.map(item => (
              <article
                key={item.id}
                className="group bg-surface-dark rounded-[2.5rem] p-5 shadow-2xl border border-white/5 transition-all cursor-pointer relative active:scale-[0.98]"
                onClick={() => onItemClick(item)}
              >
                <div className="relative aspect-[16/11] rounded-[2rem] overflow-hidden mb-5 border border-white/5">
                  <div
                    className="w-full h-full bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                    style={{ backgroundImage: `url(${item.image})` }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                  {/* Quick Add Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickAdd(item);
                    }}
                    className="absolute top-4 right-4 z-10 size-12 rounded-full bg-accent text-white border border-white/20 flex items-center justify-center active:scale-90 hover:bg-accent-hover transition-all shadow-xl"
                  >
                    <span className="material-symbols-outlined text-[28px]">add</span>
                  </button>

                  {item.isSpicy && (
                    <div className="absolute bottom-5 left-5 flex gap-2">
                       <span className="px-3 py-1 bg-accent-soft text-[9px] font-black uppercase tracking-widest text-accent rounded-full shadow-lg border border-accent/20">Spicy</span>
                    </div>
                  )}
                </div>

                <div className="px-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-black text-white tracking-tight">{item.name}</h3>
                    <span className="text-lg font-black text-price tracking-tighter">€{item.price.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-text-secondary font-medium leading-relaxed line-clamp-2 opacity-60">
                    {item.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Floating Navigation with Bounce */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-[340px] lg:max-w-[400px] z-50">
        <nav className="bg-surface-elevated/95 backdrop-blur-2xl border border-white/10 rounded-full h-[72px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center px-2">
          <button 
            className="flex-1 flex flex-col items-center justify-center gap-1 text-primary transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant_menu</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Menu</span>
          </button>
          
          <div className="w-px h-8 bg-white/10"></div>
          
          <button 
            onClick={onOpenCart}
            className={`flex-1 flex flex-col items-center justify-center gap-1 text-text-secondary transition-all active:scale-95 relative ${isBouncing ? 'animate-bounce-subtle' : ''}`}
          >
            <div className="relative">
              <span className="material-symbols-outlined text-[28px]">table_restaurant</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-white shadow-lg ring-2 ring-background-dark">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">Table</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default MenuView;
