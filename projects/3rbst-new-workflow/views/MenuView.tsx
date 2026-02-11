
import React, { useState, useEffect } from 'react';
import { MenuItem } from '../types';
import { CATEGORIES } from '../constants';

interface MenuViewProps {
  menu: MenuItem[];
  cartCount: number;
  onItemClick: (item: MenuItem) => void;
  onOpenCart: () => void;
  onQuickAdd: (item: MenuItem) => void;
}

const MenuView: React.FC<MenuViewProps> = ({ menu, cartCount, onItemClick, onOpenCart, onQuickAdd }) => {
  const [activeCategory, setActiveCategory] = useState('Burgers');
  const [isBouncing, setIsBouncing] = useState(false);

  useEffect(() => {
    if (cartCount > 0) {
      setIsBouncing(true);
      const timer = setTimeout(() => setIsBouncing(false), 500);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  const filteredItems = menu.filter(item => item.category === activeCategory && item.isAvailable);

  return (
    <div className="flex flex-col h-full bg-[#170e10] view-transition relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-[radial-gradient(circle_at_50%_0%,rgba(194,30,58,0.1),transparent)] pointer-events-none z-0"></div>
      
      <header className="pt-12 pb-6 px-6 flex items-center justify-between sticky top-0 bg-[#170e10]/90 backdrop-blur-xl z-30 border-b border-white/5">
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-white">The Burger Lab</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <p className="text-[10px] text-text-secondary font-black uppercase tracking-[0.2em]">Live in Mitte</p>
          </div>
        </div>
        <button className="flex items-center justify-center size-10 rounded-full bg-white/5 border border-white/10 text-white active:scale-95 transition-all">
          <span className="material-symbols-outlined text-[20px]">search</span>
        </button>
      </header>

      {/* Categories Scroller */}
      <div className="px-6 py-4 sticky top-[88px] z-20 bg-[#170e10]/90 backdrop-blur-xl">
        <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
          {CATEGORIES.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-none px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                activeCategory === cat 
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
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:gap-8">
          {filteredItems.map(item => (
            <article 
              key={item.id}
              className="group bg-[#241619] rounded-[2.5rem] p-5 shadow-2xl border border-white/5 transition-all cursor-pointer relative active:scale-[0.98]"
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
                  className="absolute top-4 right-4 z-10 size-12 rounded-full bg-primary text-white border border-white/20 flex items-center justify-center active:scale-90 hover:bg-primary/90 transition-all shadow-xl"
                >
                  <span className="material-symbols-outlined text-[28px]">add</span>
                </button>

                {item.isSpicy && (
                  <div className="absolute bottom-5 left-5 flex gap-2">
                     <span className="px-3 py-1 bg-primary text-[9px] font-black uppercase tracking-widest text-white rounded-full shadow-lg border border-white/10">Spicy</span>
                  </div>
                )}
              </div>

              <div className="px-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-black text-white tracking-tight">{item.name}</h3>
                  <span className="text-lg font-black text-primary tracking-tighter">€{item.price.toFixed(2)}</span>
                </div>
                <p className="text-xs text-text-secondary font-medium leading-relaxed line-clamp-2 opacity-60">
                  {item.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* Floating Navigation with Bounce */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-[340px] lg:max-w-[400px] z-50">
        <nav className="bg-[#1c1113]/95 backdrop-blur-2xl border border-white/10 rounded-full h-[72px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center px-2">
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
                <span className="absolute -top-1 -right-2 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-white shadow-lg ring-2 ring-[#1c1113]">
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
