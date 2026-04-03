
import React from 'react';

interface TableGridViewProps {
  onSelectTable: (tableNumber: string) => void;
  onBack: () => void;
}

const TableGridView: React.FC<TableGridViewProps> = ({ onSelectTable, onBack }) => {
  // Mocking 20 tables
  const tables = Array.from({ length: 20 }, (_, i) => (i + 1).toString().padStart(2, '0'));

  return (
    <div className="flex flex-col h-full bg-[#0d0d0d] text-white animate-fade-in overflow-hidden relative">
      <header className="px-6 pt-12 pb-6 flex items-center justify-between border-b border-white/5 bg-[#0d0d0d]/90 backdrop-blur-xl z-20">
        <button onClick={onBack} className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-all">
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Service Mode</span>
          <h1 className="text-sm font-black tracking-tight">Select Table</h1>
        </div>
        <div className="size-10"></div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar p-6">
        <div className="grid grid-cols-4 gap-3">
          {tables.map(num => (
            <button
              key={num}
              onClick={() => onSelectTable(num)}
              className="aspect-square rounded-2xl bg-[#1a1a1a] border border-white/5 flex flex-col items-center justify-center gap-1 active:scale-90 transition-all shadow-lg active:bg-primary active:border-primary group"
            >
              <span className="text-xl font-black tracking-tighter group-active:text-white">{num}</span>
              <span className="text-[8px] font-bold uppercase tracking-widest text-text-secondary/40 group-active:text-white/50">Table</span>
            </button>
          ))}
        </div>
      </main>

      <footer className="p-8 text-center bg-gradient-to-t from-[#0d0d0d] to-transparent">
        <p className="text-[10px] font-black text-text-secondary/20 uppercase tracking-[0.4em]">Floor Plan v1.0</p>
      </footer>
    </div>
  );
};

export default TableGridView;
