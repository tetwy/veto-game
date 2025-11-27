import React from 'react';
import { Team } from '../types';
import { Trophy, RefreshCw, Home, ArrowLeft } from 'lucide-react';

interface GameOverScreenProps {
  teams: Team[];
  onRestart: () => void;       // Host için
  onReturnToLobby: () => void; // Misafir için (veya Host'un kişisel dönüşü)
  onHome: () => void;
  isHost: boolean;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ teams, onRestart, onReturnToLobby, onHome, isHost }) => {
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
  const winner = sortedTeams[0];
  const isDraw = sortedTeams[0].score === sortedTeams[1].score;

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] p-6 text-center animate-[fadeIn_0.5s_ease-out] bg-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
      <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-primary to-brand-accent`}></div>

      <div className="mb-6 relative z-10">
        <div className="absolute inset-0 bg-brand-primary blur-[80px] opacity-20 rounded-full"></div>
        <Trophy size={100} className="text-brand-warning relative z-10 drop-shadow-2xl animate-bounce" fill="currentColor" />
      </div>

      <h1 className="text-3xl font-bold text-slate-400 mb-2 tracking-widest uppercase">
        {isDraw ? "Berabere!" : "Kazanan"}
      </h1>
      
      {!isDraw && (
        <h2 className={`text-6xl font-black mb-10 ${winner.color} drop-shadow-lg tracking-tighter`}>
          {winner.name}
        </h2>
      )}

      <div className="w-full max-w-sm bg-slate-800/50 rounded-3xl p-6 border border-slate-700/50 backdrop-blur-md mb-10 shadow-2xl relative z-10">
        {sortedTeams.map((team, idx) => (
          <div key={team.id} className="flex justify-between items-center py-4 border-b border-slate-700/50 last:border-0">
            <div className="flex items-center gap-4">
              <span className={`text-xl font-black ${idx === 0 ? 'text-brand-warning' : 'text-slate-600'}`}>#{idx + 1}</span>
              <span className={`font-bold text-xl ${team.color}`}>{team.name}</span>
            </div>
            <span className="text-3xl font-black text-white">{team.score}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col w-full max-w-xs gap-3 relative z-10">
        {isHost ? (
          <button 
            onClick={onRestart}
            className="w-full py-4 bg-brand-primary hover:bg-indigo-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 text-lg"
          >
            <RefreshCw size={22} />
            Lobiye Dön ve Sıfırla
          </button>
        ) : (
          <button 
            onClick={onReturnToLobby}
            className="w-full py-4 bg-brand-primary hover:bg-indigo-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 text-lg"
          >
             <ArrowLeft size={22} />
             Lobiye Dön
          </button>
        )}
        
        <button 
          onClick={onHome}
          className="w-full py-4 bg-transparent hover:bg-slate-800 text-slate-400 hover:text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Home size={20} />
          Çıkış Yap
        </button>
      </div>
    </div>
  );
};

export default GameOverScreen;