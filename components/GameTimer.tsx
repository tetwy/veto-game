import React, { useEffect } from 'react';
import { Timer } from 'lucide-react';

interface GameTimerProps {
  timeLeft: number;
  totalTime: number;
  isActive: boolean;
  onTimeUp: () => void;
}

const GameTimer: React.FC<GameTimerProps> = ({ timeLeft, totalTime, isActive, onTimeUp }) => {
  // Hesaplamalar
  const percentage = (timeLeft / totalTime) * 100;
  
  // Renk mantığı
  let colorClass = 'bg-brand-primary';
  if (percentage < 30) colorClass = 'bg-brand-danger';
  else if (percentage < 60) colorClass = 'bg-brand-warning';

  return (
    <div className="w-full max-w-md mx-auto mb-6">
      <div className="flex items-center justify-between mb-2 px-2">
        <div className="flex items-center space-x-2 text-slate-300">
           <Timer size={20} className={timeLeft < 10 && isActive ? 'animate-bounce text-brand-danger' : ''} />
           <span className="font-mono text-xl font-bold">{timeLeft}sn</span>
        </div>
        <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          Süre
        </div>
      </div>
      
      {/* Progress Bar Container */}
      <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
        {/* Fill */}
        <div 
          className={`h-full transition-all duration-1000 ease-linear ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default GameTimer;