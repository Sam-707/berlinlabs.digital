
import React from 'react';
import { CartItem, MenuItem } from '../types';
import { getModifiersSummary, calculateLineTotal, calculateCartTotal } from '../lib/menu-modifiers';

interface CartViewProps {
  cart: CartItem[];
  menu: MenuItem[];
  onClose: () => void;
  onRemove: (cartItemId: string) => void;
  onUpdateQuantity: (cartItemId: string, delta: number) => void;
  onCheckout: () => void;
  isCreatingOrder?: boolean;
}

const CartView: React.FC<CartViewProps> = ({ cart, menu, onClose, onRemove, onUpdateQuantity, onCheckout, isCreatingOrder = false }) => {
  const getMenuItem = (id: string) => menu.find(m => m.id === id);

  // Calculate total from cart items (using unitPrice which includes modifiers)
  const total = calculateCartTotal(cart);

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm animate-fade-in flex flex-col justify-end max-w-md lg:max-w-2xl mx-auto">
      <div className="bg-background-dark w-full h-[85%] rounded-t-[2rem] shadow-2xl flex flex-col animate-slide-up">
        <div className="flex flex-col items-center pt-3 pb-2 w-full shrink-0">
          <div className="h-1.5 w-12 rounded-full bg-white/20"></div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 shrink-0">
          <h2 className="text-white text-2xl font-bold tracking-tight">Your Table</h2>
          <button
            onClick={onClose}
            className="group flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 active:scale-95"
          >
            <span className="material-symbols-outlined text-gray-300 group-hover:text-primary text-[24px]">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-2 space-y-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
               <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full transform scale-110"></div>
                <div className="relative flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-[#2a1a1d] to-[#170e10] border border-white/5 shadow-inner">
                  <span className="material-symbols-outlined text-primary/80 text-[64px]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>
                    restaurant
                  </span>
                </div>
                <div className="absolute top-0 right-0 bg-background-dark p-1.5 rounded-full border border-white/5">
                  <span className="material-symbols-outlined text-gray-400 text-[20px] block">heart_broken</span>
                </div>
              </div>
              <p className="text-white text-xl font-bold mb-2">Your table is empty</p>
              <p className="text-gray-400 text-sm max-w-[280px]">Start exploring the menu and select your favorite dishes to see them here.</p>
              <button onClick={onClose} className="mt-8 px-8 py-3 bg-primary text-white rounded-full font-bold">Explore Menu</button>
            </div>
          ) : (
            cart.map(cartItem => {
              const item = getMenuItem(cartItem.menuItemId);
              if (!item) return null;

              const modifiersSummary = getModifiersSummary(cartItem.selectedModifiers);
              const lineTotal = calculateLineTotal(cartItem);

              return (
                <div key={cartItem.id} className="flex items-start gap-4 p-3 pr-4 rounded-2xl bg-surface-dark/50 border border-white/5">
                  <div
                    className="h-20 w-20 rounded-xl bg-gray-800 bg-cover bg-center shrink-0 border border-white/5"
                    style={{ backgroundImage: `url(${item.image})` }}
                  ></div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-1">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-bold text-base truncate">{item.name}</h3>
                        {/* Show selected modifiers */}
                        {modifiersSummary && (
                          <p className="text-[11px] text-text-secondary/70 mt-0.5 truncate">
                            {modifiersSummary}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-price font-bold text-base">€{lineTotal.toFixed(2)}</span>
                        {/* Show unit price breakdown if modifiers exist */}
                        {cartItem.modifiersTotal !== 0 && cartItem.quantity > 1 && (
                          <p className="text-[10px] text-text-secondary/50 mt-0.5">
                            €{cartItem.unitPrice.toFixed(2)} each
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-end mt-2">
                      <p className="text-gray-400 text-xs truncate max-w-[100px]">{item.category}</p>
                      <div className="flex items-center bg-[#1a0f10] rounded-full p-1 gap-3 border border-white/5">
                        <button
                          aria-label={cartItem.quantity > 1 ? 'Decrease quantity' : 'Remove item'}
                          onClick={() => cartItem.quantity > 1 ? onUpdateQuantity(cartItem.id, -1) : onRemove(cartItem.id)}
                          className="w-7 h-7 rounded-full bg-white/10 text-gray-300 flex items-center justify-center hover:bg-white/20 active:scale-90"
                        >
                          <span className="material-symbols-outlined text-[16px]">remove</span>
                        </button>
                        <span className="text-white text-sm font-semibold w-2 text-center">{cartItem.quantity}</span>
                        <button
                          aria-label="Increase quantity"
                          onClick={() => onUpdateQuantity(cartItem.id, 1)}
                          className="w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center hover:bg-accent-hover active:bg-accent-pressed active:scale-90 shadow-lg shadow-accent/20"
                        >
                          <span className="material-symbols-outlined text-[16px]">add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {cart.length > 0 && (
          <div className="bg-background-dark px-6 pt-6 pb-12 border-t border-white/5 shrink-0 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <span className="text-white text-xl font-bold">Total</span>
              <span className="text-price text-2xl font-bold">€{total.toFixed(2)}</span>
            </div>
            <button
              onClick={onCheckout}
              disabled={isCreatingOrder}
              className="w-full flex items-center justify-center gap-3 h-14 rounded-full bg-primary text-white text-lg font-bold tracking-wide shadow-lg shadow-primary/25 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {isCreatingOrder ? (
                <>
                  <span className="material-symbols-outlined animate-spin">sync</span>
                  <span>Creating Order...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">qr_code_2</span>
                  <span>Generate Waiter Code</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartView;
