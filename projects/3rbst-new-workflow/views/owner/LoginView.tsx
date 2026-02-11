
import React, { useState, useEffect } from 'react';

interface LoginViewProps {
  onLogin: (pin: string) => Promise<boolean>;
  onBack: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, onBack }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
      setError(false);
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  useEffect(() => {
    if (pin.length === 4) {
      const verify = async () => {
        setLoading(true);
        const success = await onLogin(pin);
        if (!success) {
          setError(true);
          setPin('');
          setLoading(false);
        }
      };
      verify();
    }
  }, [pin, onLogin]);

  return (
    <div className="flex flex-col h-full bg-[#11090a] text-white animate-fade-in relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"></div>
      
      <header className="px-6 pt-12 flex items-center justify-between z-10">
        <button onClick={onBack} className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-all">
          <span className="material-symbols-outlined">close</span>
        </button>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary/60">Staff Authentication</span>
        <div className="size-10"></div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8 z-10">
        <div className="mb-12 text-center">
          <div className="inline-flex size-14 rounded-2xl bg-primary/10 border border-primary/20 items-center justify-center text-primary mb-4">
            <span className="material-symbols-outlined text-[32px]">lock</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight mb-2">Access Portal</h1>
          <p className="text-text-secondary text-xs font-medium opacity-60">Enter your 4-digit staff passcode</p>
        </div>

        {/* PIN Indicators */}
        <div className={`flex gap-6 mb-16 ${error ? 'animate-shake' : ''}`}>
          {[0, 1, 2, 3].map(i => (
            <div 
              key={i} 
              className={`size-4 rounded-full border-2 transition-all duration-300 ${
                pin.length > i 
                  ? 'bg-primary border-primary scale-110 shadow-[0_0_15px_rgba(194,30,58,0.5)]' 
                  : 'bg-transparent border-white/20'
              } ${error ? 'border-primary bg-primary/20' : ''}`}
            ></div>
          ))}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-6 w-full max-w-[280px]">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              disabled={loading}
              onClick={() => handleKeyPress(num)}
              className="size-20 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-2xl font-black hover:bg-white/10 active:scale-90 transition-all shadow-xl disabled:opacity-50"
            >
              {num}
            </button>
          ))}
          <div className="size-20"></div>
          <button
            disabled={loading}
            onClick={() => handleKeyPress('0')}
            className="size-20 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-2xl font-black hover:bg-white/10 active:scale-90 transition-all shadow-xl disabled:opacity-50"
          >
            0
          </button>
          <button
            disabled={loading}
            onClick={handleBackspace}
            className="size-20 rounded-full flex items-center justify-center text-text-secondary/40 hover:text-white transition-colors active:scale-90 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[28px]">backspace</span>
          </button>
        </div>
      </main>

      <footer className="p-10 text-center opacity-20">
        <p className="text-[9px] font-black uppercase tracking-[0.5em]">Terminal Node 42-A</p>
      </footer>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}</style>
    </div>
  );
};

export default LoginView;
