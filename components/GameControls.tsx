import React from 'react';
import { Check, X, SkipForward } from 'lucide-react';

interface GameControlsProps {
  onCorrect: () => void;
  onTaboo: () => void;
  onPass: () => void;
  disabled?: boolean;
  passCount: number;
  passLimit: number;
}

const GameControls: React.FC<GameControlsProps> = ({ 
  onCorrect, onTaboo, onPass, disabled = false, passCount, passLimit
}) => {
  const isPassLimitReached = passLimit > 0 && passCount >= passLimit;
  const remainingPasses = passLimit > 0 ? passLimit - passCount : 999;

  return (
    <div className="flex justify-between items-end gap-3 h-24"> {/* Yükseklik sabitlendi */}
      
      {/* YASAK (Sol) */}
      <button
        onClick={onTaboo}
        disabled={disabled}
        className="flex-1 h-20 flex flex-col items-center justify-center gap-1 rounded-2xl bg-slate-800 text-brand-danger border-2 border-slate-700 active:scale-95 active:bg-slate-700 transition-all hover:border-brand-danger/50 disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        <X size={28} strokeWidth={3} />
        <span className="text-[10px] font-black uppercase tracking-widest">Yasak</span>
      </button>

      {/* PAS (Orta - Küçük) */}
      <button
        onClick={onPass}
        disabled={disabled || isPassLimitReached}
        className="w-20 h-20 flex flex-col items-center justify-center gap-1 rounded-2xl bg-slate-800 text-brand-warning border-2 border-slate-700 active:scale-95 active:bg-slate-700 transition-all hover:border-brand-warning/50 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
      >
        <SkipForward size={28} strokeWidth={3} />
        <span className="text-[10px] font-black uppercase tracking-widest">Pas</span>
        {passLimit > 0 && (
           <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-slate-700 text-[8px] flex items-center justify-center font-bold text-slate-300 border border-slate-600">
             {remainingPasses}
           </div>
        )}
      </button>

      {/* DOĞRU (Sağ - En Büyük ve Renkli) */}
      <button
        onClick={onCorrect}
        disabled={disabled}
        className="flex-1 h-24 -mt-4 flex flex-col items-center justify-center gap-1 rounded-2xl bg-brand-success text-white shadow-[0_0_20px_-5px_rgba(34,197,94,0.5)] active:scale-95 transition-all hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="p-1 bg-white/20 rounded-full mb-1">
          <Check size={32} strokeWidth={4} />
        </div>
        <span className="text-xs font-black uppercase tracking-widest">DOĞRU</span>
      </button>

    </div>
  );
};

export default GameControls;