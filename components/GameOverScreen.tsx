import React from 'react';
import { Team } from '../types';
import { Trophy, RefreshCw, Home, ArrowLeft, Medal } from 'lucide-react';

interface GameOverScreenProps {
  teams: Team[];
  onRestart: () => void;
  onReturnToLobby: () => void;
  onHome: () => void;
  isHost: boolean;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ teams, onRestart, onReturnToLobby, onHome, isHost }) => {
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
  const winner = sortedTeams[0];
  const isDraw = sortedTeams[0].score === sortedTeams[1].score;

  // Kazananın rengini belirle (Arka plan efekti için)
  const winnerColorClass = isDraw 
    ? 'from-slate-500 to-slate-700' 
    : winner.id === 'A' 
      ? 'from-brand-primary to-brand-secondary' // A Takımı (Mor/Mavi)
      : 'from-brand-success to-emerald-600';    // B Takımı (Yeşil)

  const glowColor = isDraw ? 'bg-white' : winner.id === 'A' ? 'bg-brand-secondary' : 'bg-brand-success';

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[100dvh] w-full overflow-hidden bg-slate-950 font-sans selection:bg-brand-primary selection:text-white">
      
      {/* --- ARKA PLAN EFEKTLERİ --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        {/* Ana Glow (Kazanan Rengine Göre) */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[150px] opacity-20 bg-gradient-to-tr ${winnerColorClass} animate-pulse-fast`}></div>
      </div>

      {/* --- İÇERİK --- */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-lg px-6">
        
        {/* KUPA ALANI */}
        <div className="relative mb-8">
           <div className={`absolute inset-0 ${glowColor} blur-[60px] opacity-40 rounded-full animate-pulse`}></div>
           <Trophy size={140} className="text-brand-warning relative z-10 drop-shadow-[0_0_30px_rgba(245,158,11,0.6)] animate-bounce" fill="currentColor" strokeWidth={1} />
           
           {/* Konfetimsi noktalar (CSS ile basit dekor) */}
           <div className="absolute -top-10 -left-10 w-4 h-4 bg-brand-primary rounded-full animate-ping opacity-75"></div>
           <div className="absolute -bottom-10 -right-10 w-4 h-4 bg-brand-success rounded-full animate-ping delay-300 opacity-75"></div>
        </div>

        {/* BAŞLIK VE KAZANAN İSMİ */}
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-sm font-bold text-slate-400 tracking-[0.4em] uppercase">
            {isDraw ? "OYUN SONA ERDİ" : "KAZANAN TAKIM"}
          </h2>
          
          {isDraw ? (
            <h1 className="text-6xl font-black text-white tracking-tight drop-shadow-2xl">
              BERABERE!
            </h1>
          ) : (
            <h1 className={`text-6xl md:text-7xl font-black tracking-tighter drop-shadow-2xl uppercase ${winner.color}`}>
              {winner.name}
            </h1>
          )}
        </div>

        {/* SKOR KARTI */}
        <div className="w-full bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 shadow-2xl mb-8 flex flex-col gap-4">
           {sortedTeams.map((team, idx) => {
             const isWinnerLine = idx === 0 && !isDraw;
             return (
               <div 
                 key={team.id} 
                 className={`
                   flex justify-between items-center p-4 rounded-2xl border transition-all duration-300
                   ${isWinnerLine 
                      ? 'bg-gradient-to-r from-white/10 to-transparent border-brand-warning/30 shadow-[0_0_20px_-5px_rgba(245,158,11,0.2)]' 
                      : 'bg-slate-950/40 border-white/5 opacity-80'}
                 `}
               >
                  <div className="flex items-center gap-4">
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${isWinnerLine ? 'bg-brand-warning text-slate-900 shadow-lg' : 'bg-slate-800 text-slate-500'}`}>
                        {idx === 0 ? <Trophy size={18} fill="currentColor" /> : <span>#{idx + 1}</span>}
                     </div>
                     <div className="flex flex-col">
                        <span className={`font-black text-lg uppercase tracking-wide ${team.color}`}>{team.name}</span>
                        {isWinnerLine && <span className="text-[10px] text-brand-warning font-bold uppercase tracking-widest flex items-center gap-1"><Medal size={10} /> Şampiyon</span>}
                     </div>
                  </div>
                  <span className={`text-4xl font-black ${isWinnerLine ? 'text-white drop-shadow-md' : 'text-slate-500'}`}>
                    {team.score}
                  </span>
               </div>
             );
           })}
        </div>

        {/* BUTONLAR */}
        <div className="flex flex-col gap-3 w-full">
          {isHost ? (
            <button 
              onClick={onRestart}
              className="group relative w-full overflow-hidden bg-white text-slate-950 font-black text-lg py-4 rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-brand-primary via-indigo-400 to-brand-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[length:200%_auto] animate-shimmer"></div>
              <div className="relative flex items-center justify-center gap-2 z-10 group-hover:text-white transition-colors">
                <RefreshCw size={20} strokeWidth={3} />
                <span>YENİDEN OYNA</span>
              </div>
            </button>
          ) : (
            <button 
              onClick={onReturnToLobby}
              className="w-full py-4 bg-brand-primary hover:bg-indigo-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
            >
               <ArrowLeft size={20} strokeWidth={3} />
               <span>Lobiye Dön</span>
            </button>
          )}
          
          <button 
            onClick={onHome}
            className="w-full py-4 bg-slate-900/50 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 text-slate-400 border border-white/5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Home size={18} />
            <span>Ana Ekrana Dön</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default GameOverScreen;