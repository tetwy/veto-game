import React from 'react';
import { Team } from '../types';
import { Trophy, RefreshCw, Home } from 'lucide-react';

interface GameOverScreenProps {
  teams: Team[];
  onRestart: () => void;
  onHome: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ teams, onRestart, onHome }) => {
  // Kazananı bul
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
  const winner = sortedTeams[0];
  const isDraw = sortedTeams[0].score === sortedTeams[1].score;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center animate-[fadeIn_0.5s_ease-out]">
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-brand-primary blur-[60px] opacity-30 rounded-full"></div>
        <Trophy size={80} className="text-brand-warning relative z-10 drop-shadow-lg" />
      </div>

      <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
        {isDraw ? "Berabere!" : "Kazanan!"}
      </h1>
      
      {!isDraw && (
        <h2 className={`text-5xl font-extrabold mb-8 ${winner.color} drop-shadow-lg`}>
          {winner.name}
        </h2>
      )}

      <div className="w-full max-w-sm bg-slate-800/50 rounded-2xl p-6 border border-slate-700 backdrop-blur-sm mb-8">
        <h3 className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-4">Skor Tablosu</h3>
        {sortedTeams.map((team, idx) => (
          <div key={team.id} className="flex justify-between items-center py-3 border-b border-slate-700/50 last:border-0">
            <div className="flex items-center gap-3">
              <span className="text-slate-500 font-mono font-bold">#{idx + 1}</span>
              <span className={`font-bold text-lg ${team.color}`}>{team.name}</span>
            </div>
            <span className="text-2xl font-black text-white">{team.score}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col w-full max-w-xs gap-3">
        <button 
          onClick={onRestart}
          className="w-full py-4 bg-brand-primary hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
        >
          <RefreshCw size={20} />
          Tekrar Oyna
        </button>
        
        <button 
          onClick={onHome}
          className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all border border-slate-700 active:scale-95"
        >
          <Home size={20} />
          Ana Ekrana Dön
        </button>
      </div>
    </div>
  );
};

export default GameOverScreen;