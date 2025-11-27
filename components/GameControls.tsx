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
    <div className="flex items-end gap-3 w-full max-w-md mx-auto h-24 pb-2">
      
      {/* YASAK (Sol) */}
      <button
        onClick={onTaboo}
        disabled={disabled}
        className="flex-1 h-20 flex flex-col items-center justify-center gap-1 rounded-2xl bg-slate-800 text-brand-danger border-2 border-slate-700 active:scale-95 hover:bg-slate-800 hover:border-brand-danger transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        <div className="p-1 bg-brand-danger/10 rounded-full group-hover:bg-brand-danger/20 transition-colors">
           <X size={28} strokeWidth={3} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest">Yasak</span>
      </button>

      {/* PAS (Orta) */}
      <button
        onClick={onPass}
        disabled={disabled || isPassLimitReached}
        className="flex-1 h-20 flex flex-col items-center justify-center gap-1 rounded-2xl bg-slate-800 text-brand-warning border-2 border-slate-700 active:scale-95 hover:bg-slate-800 hover:border-brand-warning transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
      >
        <div className="p-1 bg-brand-warning/10 rounded-full group-hover:bg-brand-warning/20 transition-colors">
           <SkipForward size={28} strokeWidth={3} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest">Pas</span>
        
        {passLimit > 0 && (
           <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-slate-700 text-[9px] flex items-center justify-center font-bold text-slate-300 border border-slate-600">
             {remainingPasses}
           </div>
        )}
      </button>

      {/* DOĞRU (Sağ) */}
      <button
        onClick={onCorrect}
        disabled={disabled}
        // GÜNCELLEME: hover:shadow (parlama) ve hover:border (çerçeve) eklendi
        className="flex-1 h-24 -mt-4 flex flex-col items-center justify-center gap-1 rounded-2xl bg-brand-success text-white shadow-[0_0_20px_-5px_rgba(34,197,94,0.4)] hover:shadow-[0_0_40px_-5px_rgba(34,197,94,0.8)] hover:bg-green-500 hover:border-green-300 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-white/10"
      >
        <div className="p-1.5 bg-white/20 rounded-full mb-0.5">
          <Check size={36} strokeWidth={4} />
        </div>
        <span className="text-xs font-black uppercase tracking-widest">DOĞRU</span>
      </button>

    </div>
  );
};

export default GameControls;