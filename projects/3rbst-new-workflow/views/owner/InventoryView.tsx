
import React, { useState, useRef } from 'react';
import { MenuItem } from '../../types';
import { CATEGORIES } from '../../constants';
import { api } from '../../api';

interface InventoryViewProps {
  menu: MenuItem[];
  setMenu: (menu: MenuItem[]) => void;
  onBack: () => void;
  onImport?: () => void;
}

const InventoryView: React.FC<InventoryViewProps> = ({ menu, setMenu, onBack, onImport }) => {
  const [activeCategory, setActiveCategory] = useState('Burgers');
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [showSyncToast, setShowSyncToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerSyncToast = () => {
    setShowSyncToast(true);
    setTimeout(() => setShowSyncToast(false), 2000);
  };

  const toggleAvailability = (id: string) => {
    const updated = menu.map(item => item.id === id ? { ...item, isAvailable: !item.isAvailable } : item);
    setMenu(updated);
    triggerSyncToast();
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem({ ...item });
  };

  const handleAddNew = () => {
    setEditingItem({
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      description: '',
      price: 0,
      image: 'https://via.placeholder.com/300x300?text=No+Image',
      category: activeCategory,
      isAvailable: true
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingItem) {
      const base64 = await api.uploadImage(file);
      setEditingItem({ ...editingItem, image: base64 });
    }
  };

  const saveItem = () => {
    if (!editingItem || !editingItem.name || !editingItem.id) return;
    
    const exists = menu.find(i => i.id === editingItem.id);
    let updatedMenu: MenuItem[];
    
    if (exists) {
      updatedMenu = menu.map(i => i.id === editingItem.id ? (editingItem as MenuItem) : i);
    } else {
      updatedMenu = [...menu, editingItem as MenuItem];
    }
    
    setMenu(updatedMenu);
    setEditingItem(null);
    triggerSyncToast();
  };

  const filteredItems = menu.filter(item => item.category === activeCategory);

  return (
    <div className="flex flex-col h-full bg-[#170e10] text-white animate-fade-in overflow-hidden relative">
      <header className="px-6 pt-12 pb-6 bg-[#170e10]/90 backdrop-blur-xl border-b border-white/5 sticky top-0 z-30">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white active:scale-90 transition-all">
              <span className="material-symbols-outlined text-[24px]">chevron_left</span>
            </button>
            <div>
              <h1 className="text-xl font-black tracking-tight">Inventory</h1>
              <p className="text-text-secondary text-[10px] font-bold uppercase tracking-widest opacity-60">Manage Menu</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onImport && (
              <button
                onClick={onImport}
                className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-text-secondary hover:text-white active:scale-90 transition-all"
                title="Import Menu"
              >
                <span className="material-symbols-outlined text-[20px]">upload_file</span>
              </button>
            )}
            <button
              onClick={handleAddNew}
              className="size-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary active:scale-90 shadow-lg shadow-primary/10"
            >
              <span className="material-symbols-outlined text-[24px]">add</span>
            </button>
          </div>
        </div>
        
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {CATEGORIES.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all active:scale-95 ${
                activeCategory === cat ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 border border-white/5 text-text-secondary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6 pb-36 no-scrollbar">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[10px] font-black text-text-secondary/50 uppercase tracking-[0.2em]">{activeCategory} List</h2>
          <span className="text-[10px] font-black text-primary uppercase tracking-widest">{filteredItems.length} Live Items</span>
        </div>
        
        <div className="space-y-4">
          {filteredItems.map(item => (
            <div key={item.id} className={`group bg-[#241619] rounded-[1.75rem] p-5 border border-white/5 shadow-2xl transition-all ${!item.isAvailable ? 'grayscale opacity-60 scale-[0.98]' : 'hover:scale-[1.01]'}`}>
              <div className="flex gap-5">
                <div className="size-24 rounded-2xl overflow-hidden flex-shrink-0 border border-white/10 shadow-lg">
                  <img src={item.image} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-lg text-white truncate tracking-tight">{item.name}</h3>
                      <p className="text-text-secondary text-[11px] font-bold tracking-tight opacity-60">#{item.id.padStart(4, '0')}</p>
                    </div>
                    <button 
                      onClick={() => handleEdit(item)}
                      className="size-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-text-secondary active:scale-90"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-lg font-black text-primary tracking-tight">€{item.price.toFixed(2)}</div>
                    <div className="flex items-center gap-3 bg-black/20 rounded-full px-1 py-1 pr-3 border border-white/5">
                      <button 
                        onClick={() => toggleAvailability(item.id)}
                        className={`relative w-11 h-6 transition-all duration-500 rounded-full shadow-inner ${item.isAvailable ? 'bg-emerald-500' : 'bg-white/10'}`}
                      >
                        <div className={`absolute top-1 size-4 bg-white rounded-full transition-all duration-500 shadow-md ${item.isAvailable ? 'right-1' : 'left-1'}`}></div>
                      </button>
                      <span className={`text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${item.isAvailable ? 'text-emerald-400' : 'text-text-secondary'}`}>
                        {item.isAvailable ? 'In Stock' : 'Sold Out'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Sync Toast */}
      {showSyncToast && (
        <div className="fixed top-32 left-1/2 -translate-x-1/2 z-[110] animate-bounce">
           <div className="bg-emerald-500 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
             <span className="material-symbols-outlined text-[16px]">cloud_done</span>
             Menu Updated Live
           </div>
        </div>
      )}

      {/* Item Editor Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-end justify-center animate-fade-in">
          <div className="w-full max-w-md bg-[#1a0f11] rounded-t-[3rem] p-8 pb-12 animate-slide-up border-t border-white/10 shadow-[0_-20px_100px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-2xl font-black">{editingItem.name ? 'Edit Item' : 'New Dish'}</h2>
               <button onClick={() => setEditingItem(null)} className="size-10 rounded-full bg-white/5 flex items-center justify-center">
                 <span className="material-symbols-outlined">close</span>
               </button>
            </div>

            <div className="space-y-6">
               <div className="flex items-center gap-6">
                  <div className="relative group">
                    <div className="size-24 rounded-2xl border-2 border-white/5 overflow-hidden bg-white/5">
                       <img src={editingItem.image} className="w-full h-full object-cover" />
                    </div>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-2 -right-2 size-10 rounded-full bg-primary text-white border-4 border-[#1a0f11] flex items-center justify-center shadow-lg active:scale-90"
                    >
                      <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </div>
                  <div className="flex-1 space-y-4">
                     <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Name</label>
                        <input 
                          className="w-full bg-white/5 border-none rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary mt-1" 
                          value={editingItem.name} 
                          onChange={e => setEditingItem({...editingItem, name: e.target.value})}
                          placeholder="Double Smash..."
                        />
                     </div>
                     <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Price (€)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="w-full bg-white/5 border-none rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary mt-1"
                          value={editingItem.price}
                          onChange={e => setEditingItem({...editingItem, price: parseFloat(e.target.value) || 0})}
                        />
                     </div>
                  </div>
               </div>

               <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Description</label>
                  <textarea 
                    className="w-full bg-white/5 border-none rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary mt-1 h-24 resize-none" 
                    value={editingItem.description}
                    onChange={e => setEditingItem({...editingItem, description: e.target.value})}
                    placeholder="Describe your masterpiece..."
                  />
               </div>

               <button 
                onClick={saveItem}
                className="w-full py-5 rounded-full bg-primary text-white font-black text-lg shadow-xl shadow-primary/20 active:scale-95 transition-all"
               >
                 Confirm Changes
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Command Dock */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-[340px] z-50">
        <nav className="bg-[#1c1113]/95 backdrop-blur-2xl border border-white/10 rounded-full h-[72px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center px-2">
          <button 
            onClick={onBack}
            className="flex-1 flex flex-col items-center justify-center gap-1 text-text-secondary active:scale-95"
          >
            <span className="material-symbols-outlined text-[28px]">grid_view</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Home</span>
          </button>
          
          <button className="flex-1 flex flex-col items-center justify-center gap-1 text-primary active:scale-95">
            <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant_menu</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Menu</span>
          </button>

          <button className="flex-1 flex flex-col items-center justify-center gap-1 text-text-secondary active:scale-95">
            <span className="material-symbols-outlined text-[28px]">palette</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Style</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default InventoryView;
