
import React from 'react';
import { CardData } from '../types';
import { AlertTriangle, EyeOff } from 'lucide-react';

interface GameCardProps {
  card: CardData;
  isLoading?: boolean;
  isMasked?: boolean; // Kelimelerin gizli olup olmayacağı
}

const GameCard: React.FC<GameCardProps> = ({ card, isLoading = false, isMasked = false }) => {
  if (isLoading) {
    return (
      <div className="w-full max-w-sm h-96 bg-slate-800/50 rounded-2xl animate-pulse border border-slate-700 mx-auto" />
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl shadow-2xl border border-slate-700/50 overflow-hidden transform transition-all duration-300 hover:scale-[1.02]">
      {/* Header - Target Word */}
      <div className={`p-6 text-center relative overflow-hidden ${isMasked ? 'bg-slate-700' : 'bg-brand-primary'}`}>
        <div className="absolute top-0 left-0 w-full h-full bg-white/10 blur-xl pointer-events-none"></div>
        
        {isMasked ? (
          <div className="flex flex-col items-center justify-center py-2 animate-pulse">
            <EyeOff size={32} className="text-slate-400 mb-2" />
            <h2 className="text-3xl font-extrabold text-slate-400 tracking-widest relative z-10">
              *****
            </h2>
            <span className="text-xs text-slate-400 font-medium mt-1 uppercase">Gizli Kelime</span>
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-extrabold text-white tracking-wide uppercase relative z-10 drop-shadow-md">
              {card.word}
            </h2>
            <span className="absolute top-2 right-3 text-xs bg-white/20 px-2 py-0.5 rounded text-white/80 uppercase tracking-widest font-semibold">
              {card.category}
            </span>
          </>
        )}
      </div>

      {/* Body - Forbidden Words */}
      <div className="p-8 flex flex-col items-center justify-center space-y-4 min-h-[300px]">
        <div className="flex items-center space-x-2 text-brand-danger mb-2 opacity-80">
          <AlertTriangle size={18} />
          <span className="text-xs font-bold uppercase tracking-widest">Yasaklı Kelimeler</span>
        </div>
        
        <div className="w-full space-y-3">
          {card.forbidden_words.map((forbidden, index) => (
            <div 
              key={index} 
              className="w-full bg-slate-800/80 p-3 rounded-xl text-center text-slate-300 font-medium border border-slate-700/50 shadow-inner"
            >
              {isMasked ? '*****' : forbidden}
            </div>
          ))}
        </div>
      </div>
      
      {/* Bottom decorative bar */}
      <div className="h-2 w-full bg-gradient-to-r from-brand-secondary to-brand-accent"></div>
    </div>
  );
};

export default GameCard;
