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
    // Responsive Yükseklik: Ekran küçüldükçe kart da küçülür, maks yükseklik belirlenir
    <div className="w-full max-w-sm mx-auto bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl shadow-2xl border border-slate-700/50 overflow-hidden transform transition-all duration-300 flex flex-col max-h-[60vh] md:max-h-[500px]">
      
      {/* Kart Başlığı (Hedef Kelime) */}
      <div className={`p-4 md:p-6 text-center relative flex-shrink-0 ${isMasked ? 'bg-slate-700' : 'bg-brand-primary'}`}>
        <div className="absolute top-0 left-0 w-full h-full bg-white/10 blur-xl pointer-events-none"></div>
        
        {isMasked ? (
          <div className="flex flex-col items-center justify-center py-2 animate-pulse">
            <EyeOff size={24} className="text-slate-400 mb-1" />
            <h2 className="text-2xl font-extrabold text-slate-400 tracking-widest relative z-10">*****</h2>
          </div>
        ) : (
          <>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide uppercase relative z-10 drop-shadow-md">
              {card.word}
            </h2>
            <span className="absolute top-2 right-3 text-[10px] bg-white/20 px-2 py-0.5 rounded text-white/80 uppercase tracking-widest font-semibold">
              {card.category}
            </span>
          </>
        )}
      </div>

      {/* Yasaklı Kelimeler (Scroll eklendi) */}
      <div className="p-4 md:p-6 flex flex-col items-center flex-1 overflow-y-auto min-h-0">
        <div className="flex items-center space-x-2 text-brand-danger mb-3 opacity-80 flex-shrink-0">
          <AlertTriangle size={16} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Yasaklı Kelimeler</span>
        </div>
        
        <div className="w-full space-y-2 md:space-y-3">
          {card.forbidden_words.map((forbidden, index) => (
            <div 
              key={index} 
              className="w-full bg-slate-800/80 p-2 md:p-3 rounded-xl text-center text-slate-300 font-medium text-sm md:text-base border border-slate-700/50 shadow-inner"
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