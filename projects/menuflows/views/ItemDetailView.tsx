
import React, { useState, useEffect, useMemo } from 'react';
import { MenuItem, SelectedModifier, CartItem } from '../types';
import ModifierSelector from '../components/ModifierSelector';
import {
  getDefaultModifiers,
  hasAllRequiredModifiers,
  calculateModifiersTotal,
  createCartItem,
} from '../lib/menu-modifiers';

interface ItemDetailViewProps {
  item: MenuItem;
  onClose: () => void;
  onAddToCart: (cartItem: CartItem) => void;
}

const ItemDetailView: React.FC<ItemDetailViewProps> = ({ item, onClose, onAddToCart }) => {
  const hasModifiers = item.modifierGroups && item.modifierGroups.length > 0;

  // Initialize with default modifiers
  const [selectedModifiers, setSelectedModifiers] = useState<SelectedModifier[]>(() => {
    if (hasModifiers) {
      return getDefaultModifiers(item.modifierGroups!);
    }
    return [];
  });

  // Calculate if all required modifiers are selected
  const isValid = useMemo(() => {
    if (!hasModifiers) return true;
    return hasAllRequiredModifiers(item.modifierGroups!, selectedModifiers);
  }, [hasModifiers, item.modifierGroups, selectedModifiers]);

  // Calculate total price with modifiers
  const modifiersTotal = useMemo(() => {
    return calculateModifiersTotal(selectedModifiers);
  }, [selectedModifiers]);

  const totalPrice = item.price + modifiersTotal;

  const handleAddToCart = () => {
    if (!isValid) return;

    const cartItem = createCartItem(item, selectedModifiers, 1);
    onAddToCart(cartItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black animate-fade-in flex flex-col max-w-md mx-auto">
      <div className="relative h-[48%] w-full shrink-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${item.image})` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/20"></div>
        <button
          onClick={onClose}
          className="absolute top-14 left-6 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 backdrop-blur-xl text-white border border-white/10 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
      </div>

      <div className="relative flex-1 -mt-12 flex flex-col bg-background-dark rounded-t-[3rem] shadow-[0_-20px_60px_rgba(0,0,0,0.8)] z-10 overflow-hidden border-t border-white/5">
        <div className="w-full flex justify-center pt-6 pb-2 shrink-0">
          <div className="h-1.5 w-14 rounded-full bg-white/10"></div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 pt-6 pb-36 no-scrollbar">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-4xl font-black text-white tracking-tighter leading-[0.9]">
              {item.name}
            </h1>
          </div>

          <div className="text-3xl font-black text-price mb-8 tracking-tight">
            €{item.price.toFixed(2)}
            {modifiersTotal !== 0 && (
              <span className="text-lg text-white/60 ml-2">
                {modifiersTotal > 0 ? '+' : ''}€{modifiersTotal.toFixed(2)}
              </span>
            )}
          </div>

          {/* Quick Badges */}
          <div className="flex flex-wrap gap-2.5 mb-10">
            {item.isSpicy && (
              <div className="flex items-center gap-2 px-4 py-2 bg-accent-soft border border-accent/20 rounded-xl text-accent text-[11px] font-black uppercase tracking-widest">
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                Spicy
              </div>
            )}
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-500 text-[11px] font-black uppercase tracking-widest">
                <span className="material-symbols-outlined text-[16px]">eco</span>
                Sustainable
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-500 text-[11px] font-black uppercase tracking-widest">
                <span className="material-symbols-outlined text-[16px]">stars</span>
                Signature
            </div>
          </div>

          <div className="mb-12">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-text-secondary/30 mb-4">Description</h4>
            <p className="text-lg text-white leading-relaxed font-medium opacity-90 tracking-tight">
              {item.description}
            </p>
          </div>

          {/* Modifier Selector */}
          {hasModifiers && (
            <div className="mb-12 pt-10 border-t border-white/5">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-text-secondary/30 mb-6">Customize Your Order</h4>
              <ModifierSelector
                modifierGroups={item.modifierGroups!}
                selectedModifiers={selectedModifiers}
                onSelectionChange={setSelectedModifiers}
              />
            </div>
          )}

          {/* Health & Allergens with Icons */}
          <div className="space-y-6 pt-10 border-t border-white/5">
            <div>
               <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-text-secondary/30 mb-6">Ingredients & Safety</h4>
               <div className="grid grid-cols-2 gap-3">
                  {item.allergens?.map(allergen => (
                    <div key={allergen} className="flex items-center gap-3 p-4 bg-surface-dark rounded-[1.25rem] border border-white/5 shadow-xl">
                      <div className="size-8 rounded-full bg-white/5 flex items-center justify-center text-amber-500/80">
                        <span className="material-symbols-outlined text-[18px]">
                          {allergen === 'Dairy' ? 'egg_alt' : allergen === 'Gluten' ? 'grass' : 'warning'}
                        </span>
                      </div>
                      <span className="text-[11px] font-black text-white uppercase tracking-widest">{allergen}</span>
                    </div>
                  ))}
                  {item.containsPeanuts && (
                    <div className="flex items-center gap-3 p-4 bg-surface-dark rounded-[1.25rem] border border-white/5 shadow-xl">
                      <div className="size-8 rounded-full bg-white/5 flex items-center justify-center text-amber-500/80">
                        <span className="material-symbols-outlined text-[18px]">grain</span>
                      </div>
                      <span className="text-[11px] font-black text-white uppercase tracking-widest">Peanuts</span>
                    </div>
                  )}
               </div>

               {item.additives && (
                 <div className="mt-4 p-4 bg-white/5 rounded-2xl border border-dashed border-white/10">
                    <div className="flex items-center gap-2 mb-2 text-text-secondary/40">
                      <span className="material-symbols-outlined text-[16px]">science</span>
                      <span className="text-[9px] font-black uppercase tracking-widest">Additive Notice</span>
                    </div>
                    <p className="text-[11px] text-text-secondary font-medium leading-relaxed">
                      Contains: {item.additives.join(', ')}. Please check with your server for more details.
                    </p>
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Floating Action Button */}
        <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-[#170e10] via-[#170e10] to-transparent pt-16 z-20">
          <button
            onClick={handleAddToCart}
            disabled={!isValid}
            className={`
              w-full rounded-full h-16 text-white font-black text-xl transition-all flex items-center justify-center gap-3
              ${isValid
                ? 'bg-primary active:scale-[0.98]'
                : 'bg-gray-600 cursor-not-allowed opacity-60'
              }
            `}
            style={isValid ? { boxShadow: '0 12px 40px color-mix(in srgb, var(--color-accent) 40%, transparent)' } : undefined}
          >
            {isValid ? (
              <>
                <span>Add to Table</span>
                <div className="w-px h-6 bg-white/20"></div>
                <span className="opacity-80">€{totalPrice.toFixed(2)}</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">warning</span>
                <span>Select Required Options</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailView;
