import React, { useState, useCallback } from 'react';
import Papa from 'papaparse';
import { MenuItem } from '../../types';
import { multiTenantApi as api } from '../../api.multitenant';

interface CsvRow {
  category: string;
  name: string;
  price: string;
  description?: string;
  image_url?: string;
  available?: string;
  display_order?: string;
}

interface ParsedItem {
  category: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
  available: boolean;
  display_order?: number;
  isValid: boolean;
  error?: string;
}

interface MenuImportModalProps {
  onClose: () => void;
  onImportSuccess: () => void;
  existingMenu: MenuItem[];
}

const MenuImportModal: React.FC<MenuImportModalProps> = ({ onClose, onImportSuccess, existingMenu }) => {
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

  // Download sample CSV template
  const downloadSampleCsv = useCallback(() => {
    const headers = ['category', 'name', 'price', 'description', 'image_url', 'available'];
    const sampleRows = [
      ['Burgers', 'Classic Smash', '9.50', 'Double patty with cheese', '', 'true'],
      ['Burgers', 'Spicy Chicken', '11.00', 'Crispy chicken with spicy sauce', '', 'true'],
      ['Sides', 'Fries', '3.50', 'Crispy golden fries', '', 'true'],
      ['Drinks', 'Cola', '2.50', 'Ice cold cola', '', 'true'],
    ];

    const csvContent = [
      headers.join(','),
      ...sampleRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'menu-import-template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // Validate a single row
  const validateRow = useCallback((row: CsvRow, index: number): ParsedItem => {
    // Check required fields
    if (!row.category || row.category.trim() === '') {
      return {
        category: row.category || '',
        name: row.name || '',
        price: 0,
        description: row.description || '',
        image_url: row.image_url || '',
        available: true,
        isValid: false,
        error: 'Missing category'
      };
    }

    if (!row.name || row.name.trim() === '') {
      return {
        category: row.category,
        name: row.name || '',
        price: 0,
        description: row.description || '',
        image_url: row.image_url || '',
        available: true,
        isValid: false,
        error: 'Missing name'
      };
    }

    if (!row.price || row.price.trim() === '') {
      return {
        category: row.category,
        name: row.name,
        price: 0,
        description: row.description || '',
        image_url: row.image_url || '',
        available: true,
        isValid: false,
        error: 'Missing price'
      };
    }

    // Validate category — accept any non-empty string (categories are DB-driven)
    const normalizedCategory = row.category.trim();
    if (!normalizedCategory) {
      return {
        category: row.category,
        name: row.name,
        price: 0,
        description: row.description || '',
        image_url: row.image_url || '',
        available: true,
        isValid: false,
        error: 'Category cannot be empty'
      };
    }

    // Validate price format
    const priceNum = parseFloat(row.price.trim());
    if (isNaN(priceNum) || priceNum < 0) {
      return {
        category: row.category,
        name: row.name,
        price: 0,
        description: row.description || '',
        image_url: row.image_url || '',
        available: true,
        isValid: false,
        error: `Invalid price: "${row.price}". Must be a positive number.`
      };
    }

    // Parse available field
    let available = true;
    if (row.available !== undefined && row.available.trim() !== '') {
      const lower = row.available.trim().toLowerCase();
      if (lower === 'false' || lower === '0' || lower === 'no') {
        available = false;
      }
    }

    // Parse display_order if provided
    let displayOrder: number | undefined;
    if (row.display_order !== undefined && row.display_order.trim() !== '') {
      const orderNum = parseInt(row.display_order.trim());
      if (!isNaN(orderNum)) {
        displayOrder = orderNum;
      }
    }

    return {
      category: normalizedCategory,
      name: row.name.trim(),
      price: priceNum,
      description: row.description?.trim() || '',
      image_url: row.image_url?.trim() || 'https://via.placeholder.com/300x300?text=No+Image',
      available,
      display_order: displayOrder,
      isValid: true
    };
  }, []);

  // Parse CSV file
  const parseCsvFile = useCallback((file: File) => {
    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as CsvRow[];
        const parsed = rows.map((row, index) => validateRow(row, index));

        if (parsed.length === 0) {
          alert('CSV file is empty or has no valid rows.');
          return;
        }

        if (parsed.length > 100) {
          alert(`Warning: CSV has ${parsed.length} rows. Only the first 100 items will be imported.`);
          setParsedItems(parsed.slice(0, 100));
        } else {
          setParsedItems(parsed);
        }
      },
      error: (error) => {
        alert(`Error parsing CSV: ${error.message}`);
      }
    });
  }, [validateRow]);

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        alert('Please upload a CSV file.');
        return;
      }
      parseCsvFile(file);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        alert('Please upload a CSV file.');
        return;
      }
      parseCsvFile(file);
    }
  };

  // Import menu items
  const handleImport = async () => {
    const validItems = parsedItems.filter(item => item.isValid);

    if (validItems.length === 0) {
      alert('No valid items to import.');
      return;
    }

    try {
      // Generate IDs for new items
      const newItems: MenuItem[] = validItems.map((item, index) => ({
        id: crypto.randomUUID(),
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image_url,
        category: item.category,
        isAvailable: item.available
      }));

      // Merge with existing menu (append new items)
      const updatedMenu = [...existingMenu, ...newItems];

      // Use existing API
      await api.updateMenu(updatedMenu);

      onImportSuccess();
      onClose();
    } catch (error) {
      console.error('[MenuImportModal] Import failed:', error);
      alert(`Failed to import menu: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const validCount = parsedItems.filter(item => item.isValid).length;
  const invalidCount = parsedItems.filter(item => !item.isValid).length;
  const hasInvalidItems = invalidCount > 0;
  const canImport = parsedItems.length > 0 && !hasInvalidItems;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-end justify-center animate-fade-in">
      <div className="w-full max-w-2xl bg-[#1a0f11] rounded-t-[3rem] p-8 pb-12 animate-slide-up border-t border-white/10 shadow-[0_-20px_100px_rgba(0,0,0,0.8)] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black">Import Menu</h2>
          <button onClick={onClose} className="size-10 rounded-full bg-white/5 flex items-center justify-center">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-6">
          {/* Download Sample CSV */}
          <button
            onClick={downloadSampleCsv}
            className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-text-secondary font-bold text-sm hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">download</span>
            Download Sample CSV Template
          </button>

          {/* File Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
              isDragging
                ? 'border-primary bg-primary/10'
                : 'border-white/10 bg-white/5 hover:border-white/20'
            }`}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <span className="material-symbols-outlined text-4xl text-text-secondary mb-2 block">upload_file</span>
              <p className="text-text-secondary font-bold text-sm">
                {fileName || 'Drag & drop CSV or click to browse'}
              </p>
              <p className="text-text-secondary/50 text-xs mt-1">Supports .csv files up to 100 rows</p>
            </label>
          </div>

          {/* Preview Table */}
          {parsedItems.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-widest text-text-secondary">Preview</h3>
                <div className="flex gap-4 text-xs font-bold">
                  <span className="text-emerald-400">Valid: {validCount}</span>
                  {hasInvalidItems && (
                    <span className="text-red-400">Invalid: {invalidCount}</span>
                  )}
                </div>
              </div>

              <div className="bg-black/30 rounded-2xl overflow-hidden border border-white/5">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-4 py-3 text-left font-black uppercase tracking-wider text-text-secondary">Cat</th>
                        <th className="px-4 py-3 text-left font-black uppercase tracking-wider text-text-secondary">Name</th>
                        <th className="px-4 py-3 text-left font-black uppercase tracking-wider text-text-secondary">Price</th>
                        <th className="px-4 py-3 text-left font-black uppercase tracking-wider text-text-secondary">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {parsedItems.map((item, index) => (
                        <tr
                          key={index}
                          className={item.isValid ? '' : 'bg-red-500/10'}
                        >
                          <td className="px-4 py-3 font-bold">{item.category}</td>
                          <td className="px-4 py-3">{item.name}</td>
                          <td className="px-4 py-3 font-mono text-price">€{item.isValid ? item.price.toFixed(2) : '-'}</td>
                          <td className="px-4 py-3">
                            {item.isValid ? (
                              <span className="text-emerald-400 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                Valid
                              </span>
                            ) : (
                              <span className="text-red-400" title={item.error}>
                                <span className="material-symbols-outlined text-[16px]">error</span>
                                Invalid
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Show errors for invalid rows */}
              {hasInvalidItems && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <p className="text-red-400 text-xs font-bold mb-2">Validation Errors:</p>
                  <ul className="text-red-300 text-xs space-y-1">
                    {parsedItems
                      .filter(item => !item.isValid)
                      .map((item, index) => (
                        <li key={index}>
                          Row {parsedItems.indexOf(item) + 1}: <strong>{item.name}</strong> - {item.error}
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-4 rounded-full bg-white/5 border border-white/10 text-text-secondary font-black text-sm active:scale-95 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!canImport}
              className={`flex-1 py-4 rounded-full font-black text-sm active:scale-95 transition-all ${
                canImport
                  ? 'bg-primary text-white shadow-xl shadow-primary/20'
                  : 'bg-white/5 text-text-secondary cursor-not-allowed'
              }`}
            >
              {parsedItems.length > 0
                ? canImport
                  ? `Import ${validCount} Items`
                  : 'Fix Errors to Import'
                : 'Import Menu'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuImportModal;
