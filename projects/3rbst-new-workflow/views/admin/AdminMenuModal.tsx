import React, { useState, useEffect } from 'react';
import { adminApi, RestaurantWithStats } from '../../api.admin';
import { MenuItem, ModifierGroup, Modifier } from '../../types';
import {
  getCategoriesForBusinessType,
  normalizeCategory,
  detectAllergens,
  detectSpicy,
  getDefaultCategory,
} from '../../lib/menu-categories';
import { getModifierTemplatesForBusinessType } from '../../lib/menu-modifiers';

interface AdminMenuModalProps {
  restaurant: RestaurantWithStats;
  onClose: () => void;
}

type TabType = 'current' | 'import' | 'add' | 'modifiers';

const AdminMenuModal: React.FC<AdminMenuModalProps> = ({ restaurant, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('current');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Import state
  const [jsonInput, setJsonInput] = useState('');
  const [previewItems, setPreviewItems] = useState<MenuItem[]>([]);
  const [importing, setImporting] = useState(false);

  // Quick add state
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemCategory, setNewItemCategory] = useState(() => getDefaultCategory(restaurant.business_type));
  const [addingItem, setAddingItem] = useState(false);

  // Clear menu state
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);

  // Modifier groups state
  const [modifierGroups, setModifierGroups] = useState<ModifierGroup[]>([]);
  const [loadingModifiers, setLoadingModifiers] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ModifierGroup | null>(null);
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [showAddModifierModal, setShowAddModifierModal] = useState<string | null>(null);

  // New group form state
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupMinSelections, setNewGroupMinSelections] = useState(0);
  const [newGroupMaxSelections, setNewGroupMaxSelections] = useState(1);
  const [newGroupIsRequired, setNewGroupIsRequired] = useState(false);

  // New modifier form state
  const [newModifierName, setNewModifierName] = useState('');
  const [newModifierPrice, setNewModifierPrice] = useState('0');
  const [newModifierIsDefault, setNewModifierIsDefault] = useState(false);

  const loadMenu = async () => {
    setLoading(true);
    const items = await adminApi.getRestaurantMenu(restaurant.id);
    setMenuItems(items);
    setLoading(false);
  };

  const loadModifierGroups = async () => {
    setLoadingModifiers(true);
    const groups = await adminApi.getModifierGroups(restaurant.id);
    setModifierGroups(groups);
    setLoadingModifiers(false);
  };

  useEffect(() => {
    loadMenu();
  }, [restaurant.id]);

  useEffect(() => {
    if (activeTab === 'modifiers') {
      loadModifierGroups();
    }
  }, [activeTab, restaurant.id]);

  const processJson = () => {
    setError(null);
    setPreviewItems([]);

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
      const processed: MenuItem[] = items
        .filter(item => item.name || item.title || item.itemName)
        .map((item) => {
          const name = item.name || item.title || item.itemName || 'Unnamed';
          const description = item.description || item.desc || '';
          const rawPrice = item.price || item.itemPrice || item.priceAmount || 0;
          const price = typeof rawPrice === 'string'
            ? parseFloat(rawPrice.replace(/[€$£,]/g, '').replace(',', '.')) || 0
            : rawPrice;
          const image = item.image || item.imageUrl || item.photo || '';
          const category = normalizeCategory(item.category || item.categoryName || item.section || 'Mains', restaurant.business_type);
          const allergens = detectAllergens(description);

          return {
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
          };
        });

      setPreviewItems(processed);
      setSuccess(`Found ${processed.length} items to import`);
    } catch (e) {
      setError(`Invalid JSON: ${e instanceof Error ? e.message : 'Parse error'}`);
    }
  };

  const handleImport = async () => {
    if (previewItems.length === 0) return;

    setImporting(true);
    setError(null);

    const result = await adminApi.importMenuForRestaurant(restaurant.id, previewItems);

    if (result.success) {
      setSuccess(`Successfully imported ${previewItems.length} items!`);
      setJsonInput('');
      setPreviewItems([]);
      loadMenu();
      setActiveTab('current');
    } else {
      setError(result.error || 'Import failed');
    }

    setImporting(false);
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemPrice) return;

    setAddingItem(true);
    setError(null);

    const price = parseFloat(newItemPrice.replace(',', '.'));
    if (isNaN(price)) {
      setError('Invalid price');
      setAddingItem(false);
      return;
    }

    const result = await adminApi.addMenuItem(restaurant.id, {
      name: newItemName.trim(),
      description: newItemDescription.trim(),
      price,
      category: newItemCategory,
      image: '',
      isAvailable: true,
    });

    if (result.item) {
      setSuccess(`Added "${newItemName}"`);
      setNewItemName('');
      setNewItemPrice('');
      setNewItemDescription('');
      loadMenu();
    } else {
      setError(result.error || 'Failed to add item');
    }

    setAddingItem(false);
  };

  const handleDeleteItem = async (itemId: string) => {
    const success = await adminApi.deleteMenuItem(restaurant.id, itemId);
    if (success) {
      setMenuItems(prev => prev.filter(item => item.id !== itemId));
    }
  };

  const handleClearMenu = async () => {
    setClearing(true);
    const success = await adminApi.clearRestaurantMenu(restaurant.id);
    if (success) {
      setMenuItems([]);
      setSuccess('Menu cleared');
    } else {
      setError('Failed to clear menu');
    }
    setClearing(false);
    setShowClearConfirm(false);
  };

  // Modifier group handlers
  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;

    const result = await adminApi.createModifierGroup(restaurant.id, {
      name: newGroupName.trim(),
      minSelections: newGroupMinSelections,
      maxSelections: newGroupMaxSelections,
      isRequired: newGroupIsRequired,
      displayOrder: modifierGroups.length,
    });

    if (result.group) {
      setModifierGroups(prev => [...prev, result.group!]);
      setNewGroupName('');
      setNewGroupMinSelections(0);
      setNewGroupMaxSelections(1);
      setNewGroupIsRequired(false);
      setShowAddGroupModal(false);
      setSuccess(`Created modifier group "${result.group.name}"`);
    } else {
      setError(result.error || 'Failed to create group');
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    const success = await adminApi.deleteModifierGroup(groupId);
    if (success) {
      setModifierGroups(prev => prev.filter(g => g.id !== groupId));
      setSuccess('Modifier group deleted');
    } else {
      setError('Failed to delete modifier group');
    }
  };

  const handleAddModifier = async (groupId: string) => {
    if (!newModifierName.trim()) return;

    const price = parseFloat(newModifierPrice.replace(',', '.')) || 0;

    const group = modifierGroups.find(g => g.id === groupId);
    const result = await adminApi.addModifier(groupId, {
      name: newModifierName.trim(),
      priceAdjustment: price,
      isAvailable: true,
      isDefault: newModifierIsDefault,
      displayOrder: group ? group.modifiers.length : 0,
    });

    if (result.modifier) {
      setModifierGroups(prev => prev.map(g =>
        g.id === groupId
          ? { ...g, modifiers: [...g.modifiers, result.modifier!] }
          : g
      ));
      setNewModifierName('');
      setNewModifierPrice('0');
      setNewModifierIsDefault(false);
      setShowAddModifierModal(null);
      setSuccess(`Added modifier "${result.modifier.name}"`);
    } else {
      setError(result.error || 'Failed to add modifier');
    }
  };

  const handleDeleteModifier = async (groupId: string, modifierId: string) => {
    const success = await adminApi.deleteModifier(modifierId);
    if (success) {
      setModifierGroups(prev => prev.map(g =>
        g.id === groupId
          ? { ...g, modifiers: g.modifiers.filter(m => m.id !== modifierId) }
          : g
      ));
    } else {
      setError('Failed to delete modifier');
    }
  };

  const handleImportTemplates = async () => {
    const templates = getModifierTemplatesForBusinessType(restaurant.business_type);
    const result = await adminApi.importModifierTemplates(restaurant.id, templates);

    if (result.success) {
      loadModifierGroups();
      setSuccess(`Imported ${templates.length} modifier templates for ${restaurant.business_type}`);
    } else {
      setError(result.error || 'Failed to import templates');
    }
  };

  // Group items by category for display
  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'current', label: 'Current', icon: 'restaurant_menu' },
    { id: 'import', label: 'Import JSON', icon: 'upload_file' },
    { id: 'add', label: 'Quick Add', icon: 'add_circle' },
    { id: 'modifiers', label: 'Modifiers', icon: 'tune' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-[#1c1113] rounded-3xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-[#1c1113] px-6 py-5 border-b border-white/5 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div
              className="size-10 rounded-xl flex items-center justify-center text-white font-black text-lg"
              style={{ backgroundColor: restaurant.accent_color || '#c21e3a' }}
            >
              {restaurant.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Menu Manager</h2>
              <p className="text-[11px] text-text-secondary/50">{restaurant.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-text-secondary/50 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-text-secondary/50 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Status Messages */}
        {(error || success) && (
          <div className="px-6 pt-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-emerald-400 text-sm">
                {success}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Current Menu Tab */}
          {activeTab === 'current' && (
            <div className="space-y-4">
              {/* Stats Bar */}
              <div className="flex items-center justify-between bg-white/5 rounded-xl p-4">
                <div>
                  <p className="text-2xl font-black text-white">{menuItems.length}</p>
                  <p className="text-[10px] text-text-secondary/50 uppercase tracking-wider">Items</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">{Object.keys(groupedItems).length}</p>
                  <p className="text-[10px] text-text-secondary/50 uppercase tracking-wider">Categories</p>
                </div>
                {menuItems.length > 0 && (
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {loading ? (
                <div className="py-12 text-center">
                  <span className="material-symbols-outlined animate-spin text-[32px] text-primary">progress_activity</span>
                  <p className="text-text-secondary/60 text-sm mt-4">Loading menu...</p>
                </div>
              ) : menuItems.length === 0 ? (
                <div className="py-12 text-center">
                  <span className="material-symbols-outlined text-[48px] text-text-secondary/30">restaurant_menu</span>
                  <p className="text-text-secondary/60 text-sm mt-4">No menu items yet</p>
                  <p className="text-text-secondary/40 text-xs mt-1">Import JSON or add items manually</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(groupedItems).map(([category, items]) => (
                    <div key={category} className="space-y-2">
                      <h3 className="text-[10px] font-black text-text-secondary/50 uppercase tracking-[0.2em] px-1">
                        {category} ({items.length})
                      </h3>
                      <div className="space-y-2">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="bg-white/5 rounded-xl p-3 flex items-center gap-3"
                          >
                            {item.image && (
                              <img
                                src={item.image}
                                alt=""
                                className="size-10 rounded-lg object-cover bg-black/20"
                                onError={(e) => (e.currentTarget.style.display = 'none')}
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-white truncate">{item.name}</p>
                              <p className="text-xs text-text-secondary/50 truncate">{item.description || 'No description'}</p>
                            </div>
                            <p className="text-sm font-bold text-primary">{item.price.toFixed(2)}</p>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="size-8 rounded-full bg-white/5 flex items-center justify-center text-text-secondary/50 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Import JSON Tab */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60 px-1">
                  Paste JSON Data
                </label>
                <textarea
                  value={jsonInput}
                  onChange={(e) => {
                    setJsonInput(e.target.value);
                    setPreviewItems([]);
                    setError(null);
                    setSuccess(null);
                  }}
                  placeholder={`[
  {
    "name": "Döner Teller",
    "description": "Mit Salat und Reis",
    "price": 12.50,
    "category": "Hauptgerichte"
  },
  ...
]

Or grouped format:
{
  "Hauptgerichte": [
    { "name": "Döner Teller", "price": 12.50 }
  ],
  "Getränke": [
    { "name": "Ayran", "price": 2.50 }
  ]
}`}
                  className="w-full h-48 bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-mono text-white/80 placeholder:text-white/20 resize-none focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>

              <button
                onClick={processJson}
                disabled={!jsonInput.trim()}
                className="w-full h-12 bg-white/10 border border-white/10 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-white/15 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">preview</span>
                Preview Items
              </button>

              {previewItems.length > 0 && (
                <>
                  <div className="bg-white/5 rounded-xl p-4 space-y-3 max-h-48 overflow-y-auto">
                    <p className="text-xs font-bold text-text-secondary/60 uppercase tracking-wider">
                      Preview ({previewItems.length} items)
                    </p>
                    {previewItems.slice(0, 5).map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="text-white font-medium truncate flex-1">{item.name}</span>
                        <span className="text-text-secondary/50">{item.category}</span>
                        <span className="text-primary font-bold">{item.price.toFixed(2)}</span>
                      </div>
                    ))}
                    {previewItems.length > 5 && (
                      <p className="text-xs text-text-secondary/40">...and {previewItems.length - 5} more</p>
                    )}
                  </div>

                  <button
                    onClick={handleImport}
                    disabled={importing}
                    className="w-full h-12 bg-primary rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {importing ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                        Importing...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">upload</span>
                        Import {previewItems.length} Items
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Quick Add Tab */}
          {activeTab === 'add' && (
            <form onSubmit={handleQuickAdd} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60 px-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g., Döner Teller"
                  className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 transition-all"
                  disabled={addingItem}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60 px-1">
                    Price *
                  </label>
                  <div className="flex items-center h-12 bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                    <span className="px-3 text-text-secondary/40 text-sm">EUR</span>
                    <input
                      type="text"
                      value={newItemPrice}
                      onChange={(e) => setNewItemPrice(e.target.value.replace(/[^0-9.,]/g, ''))}
                      placeholder="12.50"
                      className="flex-1 h-full px-0 bg-transparent text-white placeholder:text-white/30 focus:outline-none"
                      disabled={addingItem}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60 px-1">
                    Category
                  </label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
                    disabled={addingItem}
                  >
                    {getCategoriesForBusinessType(restaurant.business_type).map((cat) => (
                      <option key={cat} value={cat} className="bg-[#1c1113]">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60 px-1">
                  Description
                </label>
                <textarea
                  value={newItemDescription}
                  onChange={(e) => setNewItemDescription(e.target.value)}
                  placeholder="Optional description..."
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/30 resize-none focus:outline-none focus:border-primary/50 transition-all"
                  disabled={addingItem}
                />
              </div>

              <button
                type="submit"
                disabled={!newItemName.trim() || !newItemPrice || addingItem}
                className="w-full h-12 bg-primary rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
              >
                {addingItem ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                    Adding...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Add Item
                  </>
                )}
              </button>
            </form>
          )}

          {/* Modifiers Tab */}
          {activeTab === 'modifiers' && (
            <div className="space-y-4">
              {/* Action Bar */}
              <div className="flex items-center justify-between bg-white/5 rounded-xl p-4">
                <div>
                  <p className="text-2xl font-black text-white">{modifierGroups.length}</p>
                  <p className="text-[10px] text-text-secondary/50 uppercase tracking-wider">Groups</p>
                </div>
                <div className="flex gap-2">
                  {modifierGroups.length === 0 && (
                    <button
                      onClick={handleImportTemplates}
                      className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400 text-xs font-bold hover:bg-purple-500/20 transition-all flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                      Import Templates
                    </button>
                  )}
                  <button
                    onClick={() => setShowAddGroupModal(true)}
                    className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl text-primary text-xs font-bold hover:bg-primary/20 transition-all flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    Add Group
                  </button>
                </div>
              </div>

              {loadingModifiers ? (
                <div className="py-12 text-center">
                  <span className="material-symbols-outlined animate-spin text-[32px] text-primary">progress_activity</span>
                  <p className="text-text-secondary/60 text-sm mt-4">Loading modifier groups...</p>
                </div>
              ) : modifierGroups.length === 0 ? (
                <div className="py-12 text-center">
                  <span className="material-symbols-outlined text-[48px] text-text-secondary/30">tune</span>
                  <p className="text-text-secondary/60 text-sm mt-4">No modifier groups yet</p>
                  <p className="text-text-secondary/40 text-xs mt-1">Create groups like "Size" or "Extras" to customize menu items</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {modifierGroups.map((group) => (
                    <div key={group.id} className="bg-white/5 rounded-xl p-4 space-y-3">
                      {/* Group Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">{group.name}</h3>
                          {group.isRequired && (
                            <span className="px-2 py-0.5 bg-primary/10 border border-primary/20 rounded-full text-[9px] font-bold text-primary uppercase tracking-wider">
                              Required
                            </span>
                          )}
                          <span className="text-[10px] text-text-secondary/50">
                            {group.maxSelections === 1 ? 'Single choice' : `Up to ${group.maxSelections}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setShowAddModifierModal(group.id)}
                            className="size-7 rounded-full bg-white/5 flex items-center justify-center text-text-secondary/50 hover:text-primary hover:bg-primary/10 transition-all"
                          >
                            <span className="material-symbols-outlined text-[14px]">add</span>
                          </button>
                          <button
                            onClick={() => handleDeleteGroup(group.id)}
                            className="size-7 rounded-full bg-white/5 flex items-center justify-center text-text-secondary/50 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          >
                            <span className="material-symbols-outlined text-[14px]">delete</span>
                          </button>
                        </div>
                      </div>

                      {/* Modifiers */}
                      {group.modifiers.length === 0 ? (
                        <p className="text-xs text-text-secondary/40 py-2">No modifiers in this group</p>
                      ) : (
                        <div className="space-y-2">
                          {group.modifiers.map((modifier) => (
                            <div
                              key={modifier.id}
                              className="flex items-center justify-between p-2 bg-white/5 rounded-lg"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-white/80">{modifier.name}</span>
                                {modifier.isDefault && (
                                  <span className="text-[9px] text-blue-400 uppercase">Default</span>
                                )}
                                {!modifier.isAvailable && (
                                  <span className="text-[9px] text-amber-500 uppercase">Unavailable</span>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={`text-sm font-bold ${modifier.priceAdjustment > 0 ? 'text-primary' : modifier.priceAdjustment < 0 ? 'text-emerald-500' : 'text-text-secondary/50'}`}>
                                  {modifier.priceAdjustment > 0 ? '+' : ''}
                                  {modifier.priceAdjustment !== 0 ? `€${modifier.priceAdjustment.toFixed(2)}` : 'Free'}
                                </span>
                                <button
                                  onClick={() => handleDeleteModifier(group.id, modifier.id)}
                                  className="size-6 rounded-full bg-white/5 flex items-center justify-center text-text-secondary/50 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                >
                                  <span className="material-symbols-outlined text-[12px]">close</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="absolute inset-0 z-60 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowClearConfirm(false)}></div>
          <div className="relative bg-[#241619] rounded-2xl border border-white/10 p-6 max-w-sm w-full">
            <h3 className="text-lg font-black text-white mb-2">Clear Menu?</h3>
            <p className="text-sm text-text-secondary/60 mb-6">
              This will permanently delete all {menuItems.length} menu items for {restaurant.name}. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 h-10 bg-white/5 border border-white/10 rounded-xl font-bold text-sm text-text-secondary"
                disabled={clearing}
              >
                Cancel
              </button>
              <button
                onClick={handleClearMenu}
                disabled={clearing}
                className="flex-1 h-10 bg-red-500 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2"
              >
                {clearing ? (
                  <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                ) : (
                  'Clear All'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Group Modal */}
      {showAddGroupModal && (
        <div className="absolute inset-0 z-60 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowAddGroupModal(false)}></div>
          <div className="relative bg-[#241619] rounded-2xl border border-white/10 p-6 max-w-sm w-full">
            <h3 className="text-lg font-black text-white mb-4">Add Modifier Group</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60">
                  Group Name *
                </label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g., Size, Extras, Toppings"
                  className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-primary/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60">
                    Min Selections
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newGroupMinSelections}
                    onChange={(e) => setNewGroupMinSelections(parseInt(e.target.value) || 0)}
                    className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60">
                    Max Selections
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newGroupMaxSelections}
                    onChange={(e) => setNewGroupMaxSelections(parseInt(e.target.value) || 1)}
                    className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={newGroupIsRequired}
                  onChange={(e) => setNewGroupIsRequired(e.target.checked)}
                  className="w-4 h-4 rounded accent-primary"
                />
                <span className="text-sm text-white/80">Required (customer must select)</span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddGroupModal(false)}
                className="flex-1 h-10 bg-white/5 border border-white/10 rounded-xl font-bold text-sm text-text-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={!newGroupName.trim()}
                className="flex-1 h-10 bg-primary rounded-xl font-bold text-sm text-white disabled:opacity-50"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modifier Modal */}
      {showAddModifierModal && (
        <div className="absolute inset-0 z-60 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowAddModifierModal(null)}></div>
          <div className="relative bg-[#241619] rounded-2xl border border-white/10 p-6 max-w-sm w-full">
            <h3 className="text-lg font-black text-white mb-4">Add Modifier</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60">
                  Modifier Name *
                </label>
                <input
                  type="text"
                  value={newModifierName}
                  onChange={(e) => setNewModifierName(e.target.value)}
                  placeholder="e.g., Large, Extra Cheese"
                  className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-primary/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60">
                  Price Adjustment (€)
                </label>
                <input
                  type="text"
                  value={newModifierPrice}
                  onChange={(e) => setNewModifierPrice(e.target.value.replace(/[^0-9.,-]/g, ''))}
                  placeholder="0.00"
                  className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-primary/50"
                />
                <p className="text-[10px] text-text-secondary/40">Use negative values for discounts (e.g., -1.00)</p>
              </div>

              <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={newModifierIsDefault}
                  onChange={(e) => setNewModifierIsDefault(e.target.checked)}
                  className="w-4 h-4 rounded accent-primary"
                />
                <span className="text-sm text-white/80">Pre-selected by default</span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModifierModal(null)}
                className="flex-1 h-10 bg-white/5 border border-white/10 rounded-xl font-bold text-sm text-text-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAddModifier(showAddModifierModal)}
                disabled={!newModifierName.trim()}
                className="flex-1 h-10 bg-primary rounded-xl font-bold text-sm text-white disabled:opacity-50"
              >
                Add Modifier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMenuModal;
