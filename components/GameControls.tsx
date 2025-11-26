
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
  onCorrect, 
  onTaboo, 
  onPass, 
  disabled = false,
  passCount,
  passLimit
}) => {
  // Pas hakkı kaldı mı? (Eğer limit 0 ise sınırsızdır)
  const isPassLimitReached = passLimit > 0 && passCount >= passLimit;
  const remainingPasses = passLimit > 0 ? passLimit - passCount : 999;

  return (
    <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-slate-950 via-slate-900 to-transparent z-50">
      <div className="max-w-md mx-auto flex justify-between items-end gap-4">
        
        {/* Taboo Button (Renamed to YASAK) */}
        <button
          onClick={onTaboo}
          disabled={disabled}
          className="flex-1 flex flex-col items-center justify-center gap-2 py-4 rounded-2xl bg-slate-800 text-brand-danger border border-slate-700 active:scale-95 transition-all hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <div className="p-3 bg-brand-danger/10 rounded-full group-hover:bg-brand-danger/20 transition-colors">
            <X size={32} strokeWidth={3} />
          </div>
          <span className="text-sm font-bold tracking-wider">YASAK (-1)</span>
        </button>

        {/* Pass Button */}
        <button
          onClick={onPass}
          disabled={disabled || isPassLimitReached}
          className="flex-1 flex flex-col items-center justify-center gap-2 py-4 rounded-2xl bg-slate-800 text-brand-warning border border-slate-700 active:scale-95 transition-all hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
        >
          <div className="p-3 bg-brand-warning/10 rounded-full group-hover:bg-brand-warning/20 transition-colors">
            <SkipForward size={32} strokeWidth={3} />
          </div>
          <span className="text-sm font-bold tracking-wider">PAS</span>
          
          {/* Pas Hakkı Göstergesi */}
          {passLimit > 0 && (
             <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-slate-700 text-[10px] flex items-center justify-center font-bold text-slate-300 border border-slate-600">
               {remainingPasses}
             </div>
          )}
        </button>

        {/* Correct Button */}
        <button
          onClick={onCorrect}
          disabled={disabled}
          className="flex-1 flex flex-col items-center justify-center gap-2 py-6 -mt-6 rounded-2xl bg-brand-success text-white shadow-[0_0_30px_-5px_rgba(34,197,94,0.4)] active:scale-95 transition-all hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          <div className="p-1 bg-white/20 rounded-full">
            <Check size={40} strokeWidth={4} />
          </div>
          <span className="text-sm font-bold tracking-wider">DOĞRU (+1)</span>
        </button>

      </div>
    </div>
  );
};

export default GameControls;