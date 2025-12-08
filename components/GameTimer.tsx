import React from 'react';
import { Timer } from 'lucide-react';

interface GameTimerProps {
  timeLeft: number;
  totalTime: number;
  isActive: boolean;
  onTimeUp: () => void;
}

const GameTimer: React.FC<GameTimerProps> = ({ timeLeft, totalTime, isActive }) => {
  const percentage = Math.max(0, (timeLeft / totalTime) * 100);
  
  let colorClass = 'bg-brand-primary shadow-[0_0_15px_rgba(99,102,241,0.6)]';
  if (percentage < 30) colorClass = 'bg-brand-danger shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-pulse';
  else if (percentage < 60) colorClass = 'bg-brand-warning shadow-[0_0_15px_rgba(245,158,11,0.6)]';

  return (
    <div className="w-full max-w-4xl mx-auto mb-4 relative z-50">
      <div className="flex items-end justify-between mb-1.5 px-1">
         <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${timeLeft < 10 ? 'text-brand-danger' : 'text-slate-500'}`}>
            Kalan Süre
         </span>
         <div className="flex items-center gap-1.5">
            <Timer size={14} className={timeLeft < 10 ? 'text-brand-danger animate-bounce' : 'text-slate-400'} />
            <span className="font-mono text-lg leading-none font-black text-white tabular-nums tracking-wide">{timeLeft}</span>
         </div>
      </div>
      
      {/* Progress Bar Container */}
      <div className="h-2 w-full bg-slate-800/50 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
        <div 
          className={`h-full transition-all duration-1000 ease-linear rounded-full ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default GameTimer;