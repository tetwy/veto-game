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
  
  let colorClass = 'bg-brand-primary shadow-[0_0_10px_rgba(99,102,241,0.5)]';
  if (percentage < 30) colorClass = 'bg-brand-danger shadow-[0_0_15px_rgba(239,68,68,0.6)]';
  else if (percentage < 60) colorClass = 'bg-brand-warning shadow-[0_0_10px_rgba(245,158,11,0.5)]';

  return (
    <div className="w-full max-w-2xl mx-auto mb-2 md:mb-6">
      {/* Üst Yazı */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center space-x-2 text-slate-200">
           <Timer size={18} className={timeLeft < 10 && isActive ? 'animate-bounce text-brand-danger' : ''} />
           <span className="font-mono text-xl font-black tracking-widest">{timeLeft}sn</span>
        </div>
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
          Süre
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/50 relative">
        <div 
          className={`h-full transition-all duration-1000 ease-linear rounded-full ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default GameTimer;