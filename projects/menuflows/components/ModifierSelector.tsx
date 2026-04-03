import React from 'react';
import { ModifierGroup, Modifier, SelectedModifier } from '../types';
import {
  toggleModifier,
  isModifierSelected,
  canSelectModifier,
  formatPriceAdjustment,
  sortModifierGroups,
  sortModifiers,
} from '../lib/menu-modifiers';

interface ModifierSelectorProps {
  modifierGroups: ModifierGroup[];
  selectedModifiers: SelectedModifier[];
  onSelectionChange: (modifiers: SelectedModifier[]) => void;
}

const ModifierSelector: React.FC<ModifierSelectorProps> = ({
  modifierGroups,
  selectedModifiers,
  onSelectionChange,
}) => {
  const sortedGroups = sortModifierGroups(modifierGroups);

  const handleModifierClick = (group: ModifierGroup, modifier: Modifier) => {
    if (!modifier.isAvailable) return;

    const newSelections = toggleModifier(group, modifier, selectedModifiers);
    onSelectionChange(newSelections);
  };

  const getSelectionCountForGroup = (groupId: string) => {
    return selectedModifiers.filter(m => m.groupId === groupId).length;
  };

  const isSingleSelect = (group: ModifierGroup) => group.maxSelections === 1;

  return (
    <div className="space-y-6">
      {sortedGroups.map((group) => {
        const selectionCount = getSelectionCountForGroup(group.id);
        const isSingle = isSingleSelect(group);
        const sortedModifiers = sortModifiers(group.modifiers);

        return (
          <div key={group.id} className="space-y-3">
            {/* Group Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-text-secondary/30">
                  {group.nameTranslated || group.name}
                </h4>
                {group.isRequired && (
                  <span className="px-2 py-0.5 bg-primary/10 border border-primary/20 rounded-full text-[9px] font-bold text-primary uppercase tracking-wider">
                    Required
                  </span>
                )}
              </div>
              <span className="text-[10px] text-text-secondary/40">
                {isSingle ? 'Choose 1' : `Choose up to ${group.maxSelections}`}
                {selectionCount > 0 && ` (${selectionCount} selected)`}
              </span>
            </div>

            {/* Modifiers */}
            <div className={`grid ${isSingle ? 'grid-cols-1' : 'grid-cols-1'} gap-2`}>
              {sortedModifiers.map((modifier) => {
                const isSelected = isModifierSelected(group.id, modifier.id, selectedModifiers);
                const canSelect = canSelectModifier(group, modifier, selectedModifiers);
                const isDisabled = !modifier.isAvailable || (!isSelected && !canSelect);
                const priceText = formatPriceAdjustment(modifier.priceAdjustment);

                return (
                  <button
                    key={modifier.id}
                    onClick={() => handleModifierClick(group, modifier)}
                    disabled={isDisabled}
                    className={`
                      flex items-center justify-between p-4 rounded-2xl border transition-all
                      ${isSelected
                        ? 'bg-primary/10 border-primary/30 shadow-lg shadow-primary/10'
                        : 'bg-[#1a1a1a] border-white/5 hover:border-white/10'
                      }
                      ${isDisabled && !isSelected ? 'opacity-40 cursor-not-allowed' : 'active:scale-[0.98]'}
                      ${!modifier.isAvailable ? 'grayscale' : ''}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      {/* Selection Indicator */}
                      <div
                        className={`
                          size-5 rounded-full border-2 flex items-center justify-center transition-all
                          ${isSingle ? 'rounded-full' : 'rounded-md'}
                          ${isSelected
                            ? 'bg-primary border-primary'
                            : 'border-white/20 bg-transparent'
                          }
                        `}
                      >
                        {isSelected && (
                          <span className="material-symbols-outlined text-white text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {isSingle ? 'circle' : 'check'}
                          </span>
                        )}
                      </div>

                      {/* Modifier Name */}
                      <div className="text-left">
                        <span className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-white/80'}`}>
                          {modifier.nameTranslated || modifier.name}
                        </span>
                        {!modifier.isAvailable && (
                          <span className="ml-2 text-[10px] text-amber-500/80 uppercase tracking-wider">
                            Unavailable
                          </span>
                        )}
                        {modifier.isDefault && !isSelected && (
                          <span className="ml-2 text-[10px] text-text-secondary/50 uppercase tracking-wider">
                            Default
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price Adjustment */}
                    {priceText && (
                      <span className={`text-sm font-bold ${modifier.priceAdjustment > 0 ? 'text-primary' : 'text-emerald-500'}`}>
                        {modifier.priceAdjustment > 0 ? '+' : ''}€{Math.abs(modifier.priceAdjustment).toFixed(2)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ModifierSelector;
