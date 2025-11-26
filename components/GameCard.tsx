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
    // DÜZELTME: h-full ve min-h-0 ekleyerek kartın taşmasını engelliyoruz.
    // Ekranda ne kadar yer varsa o kadar uzayacak, fazlasında scroll çıkacak.
    <div className="w-full max-w-sm mx-auto h-full max-h-[60vh] md:max-h-[500px] flex flex-col bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl shadow-2xl border border-slate-700/50 overflow-hidden transform transition-all">
      
      {/* Kart Başlığı (Sabit Üst Kısım) */}
      <div className={`p-4 text-center relative flex-shrink-0 ${isMasked ? 'bg-slate-700' : 'bg-brand-primary'}`}>
        <div className="absolute top-0 left-0 w-full h-full bg-white/10 blur-xl pointer-events-none"></div>
        
        {isMasked ? (
          <div className="flex flex-col items-center justify-center py-1 animate-pulse">
            <EyeOff size={24} className="text-slate-400 mb-1" />
            <h2 className="text-xl font-extrabold text-slate-400 tracking-widest relative z-10">*****</h2>
          </div>
        ) : (
          <>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide uppercase relative z-10 drop-shadow-md leading-tight">
              {card.word}
            </h2>
            <span className="absolute top-2 right-2 text-[9px] md:text-[10px] bg-white/20 px-1.5 py-0.5 rounded text-white/90 uppercase tracking-widest font-semibold">
              {card.category}
            </span>
          </>
        )}
      </div>

      {/* Yasaklı Kelimeler (Esnek Orta Kısım - Scroll Olur) */}
      <div className="flex-1 p-3 md:p-5 flex flex-col items-center overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-slate-600">
        <div className="flex items-center space-x-2 text-brand-danger mb-2 flex-shrink-0 sticky top-0 bg-inherit z-10">
          <AlertTriangle size={14} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Yasaklı Kelimeler</span>
        </div>
        
        <div className="w-full space-y-2 my-auto"> 
          {card.forbidden_words.map((forbidden, index) => (
            <div 
              key={index} 
              className="w-full bg-slate-800/80 py-2 px-1 rounded-lg text-center text-slate-200 font-semibold text-sm md:text-base border border-slate-700/50 shadow-sm"
            >
              {isMasked ? '*****' : forbidden}
            </div>
          ))}
        </div>
      </div>
      
      {/* Alt Çizgi */}
      <div className="h-1 w-full bg-gradient-to-r from-brand-secondary to-brand-accent flex-shrink-0"></div>
    </div>
  );
};

export default GameCard;