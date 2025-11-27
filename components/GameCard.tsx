import React from 'react';
import { CardData } from '../types';
import { AlertTriangle, EyeOff } from 'lucide-react';

interface GameCardProps {
  card: CardData;
  isLoading?: boolean;
  isMasked?: boolean;
}

const GameCard: React.FC<GameCardProps> = ({ card, isLoading = false, isMasked = false }) => {
  if (isLoading) {
    return <div className="w-full max-w-sm h-64 bg-slate-800/50 rounded-2xl animate-pulse border border-slate-700 mx-auto" />;
  }

  return (
    <div className="w-full max-w-sm md:max-w-md mx-auto h-full max-h-[55vh] md:max-h-[500px] flex flex-col bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl shadow-2xl border border-slate-700/50 overflow-hidden transform transition-all">
      
      {/* Kart Başlığı (Üst) */}
      <div className={`py-3 md:py-6 px-4 text-center relative flex-shrink-0 ${isMasked ? 'bg-slate-700' : 'bg-brand-primary'}`}>
        <div className="absolute top-0 left-0 w-full h-full bg-white/10 blur-xl pointer-events-none"></div>
        
        {isMasked ? (
          <div className="flex flex-col items-center justify-center py-1">
            <EyeOff size={28} className="text-slate-400 mb-1" />
            <h2 className="text-2xl font-black text-slate-400 tracking-widest">*****</h2>
          </div>
        ) : (
          <>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-wide uppercase relative z-10 drop-shadow-lg leading-tight">
              {card.word}
            </h2>
            <span className="absolute top-2 right-3 text-[10px] bg-white/20 px-2 py-0.5 rounded text-white/90 uppercase tracking-widest font-bold shadow-sm">
              {card.category}
            </span>
          </>
        )}
      </div>

      {/* Yasaklı Kelimeler (Sıkılaştırılmış Aralıklar) */}
      <div className="flex-1 p-4 flex flex-col items-center justify-start overflow-y-auto min-h-0">
        <div className="flex items-center gap-2 text-brand-danger mb-3 mt-1 flex-shrink-0 opacity-90">
          <AlertTriangle size={14} strokeWidth={3} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Yasaklı Kelimeler</span>
        </div>
        
        {/* BOŞLUK AYARI: gap-2 ile araları kıstık, justify-center yerine start verdik */}
        <div className="w-full flex flex-col gap-2 md:gap-3 w-full"> 
          {card.forbidden_words.map((forbidden, index) => (
            <div 
              key={index} 
              className="w-full bg-slate-800/60 py-2.5 px-2 rounded-xl text-center text-slate-200 font-bold text-lg md:text-xl border border-slate-700/50 shadow-sm backdrop-blur-sm"
            >
              {isMasked ? '*****' : forbidden}
            </div>
          ))}
        </div>
      </div>
      
      <div className="h-1.5 w-full bg-gradient-to-r from-brand-secondary to-brand-accent flex-shrink-0"></div>
    </div>
  );
};

export default GameCard;