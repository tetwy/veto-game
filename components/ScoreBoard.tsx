import React from 'react';
import { Team, Player } from '../types';
import { Trophy, Mic } from 'lucide-react';

interface ScoreBoardProps {
  teams: Team[];
  currentTeamId: string;
  currentNarrator: Player | null;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ teams, currentTeamId, currentNarrator }) => {
  // Lideri bulma mantığı
  const maxScore = Math.max(...teams.map(t => t.score));
  const hasScore = maxScore > 0; // Sadece 0'dan büyükse kupa göster

  return (
    <>
      {/* --- MOBİL GÖRÜNÜM --- */}
      <div className="md:hidden w-full flex justify-between items-center bg-slate-800/80 p-3 rounded-2xl mb-4 border border-slate-700/50 backdrop-blur-md shadow-lg">
        {teams.map((team) => {
           const isActive = team.id === currentTeamId;
           const isLeading = hasScore && team.score === maxScore;

           return (
             <div key={team.id} className={`relative flex flex-col items-center w-[48%] p-2 rounded-xl transition-all ${isActive ? 'bg-slate-700/50 ring-1 ring-brand-primary/30' : ''}`}>
                {isLeading && <Trophy size={14} className="absolute -top-2 text-brand-warning drop-shadow-md animate-bounce" fill="currentColor" />}
                <span className={`text-[10px] font-black uppercase tracking-wider mb-1 ${team.color}`}>{team.name}</span>
                <span className="text-2xl font-black text-white leading-none">{team.score}</span>
             </div>
           )
        })}
      </div>

      {/* --- MASAÜSTÜ GÖRÜNÜM --- */}
      <div className="hidden md:flex absolute inset-0 pointer-events-none justify-between items-center px-12 z-0">
        {teams.map((team, index) => {
          const isActive = team.id === currentTeamId;
          const isLeft = index === 0;
          const isLeading = hasScore && team.score === maxScore;
          
          return (
            <div 
              key={team.id}
              className={`
                relative flex flex-col transition-all duration-500 border overflow-hidden pointer-events-auto
                ${isActive 
                  ? 'bg-slate-800/90 border-brand-primary shadow-[0_0_40px_-10px_rgba(99,102,241,0.4)] scale-105 z-10' 
                  : 'bg-slate-900/40 border-slate-700/30 opacity-50 grayscale-[0.5] scale-95'}
                ${isLeft ? 'items-start rounded-r-3xl border-l-0' : 'items-end rounded-l-3xl border-r-0'}
                w-72 p-8 backdrop-blur-xl
              `}
            >
              {/* İsim, Skor ve Kupa */}
              <div className={`flex flex-col w-full mb-6 ${isLeft ? 'items-start' : 'items-end'}`}>
                <div className="flex items-center gap-3 mb-2">
                   {isLeading && !isLeft && <Trophy size={24} className="text-brand-warning animate-bounce" fill="currentColor" />}
                   <h3 className={`font-black text-xl uppercase tracking-widest truncate max-w-[200px] ${team.color}`}>
                     {team.name}
                   </h3>
                   {isLeading && isLeft && <Trophy size={24} className="text-brand-warning animate-bounce" fill="currentColor" />}
                </div>
                <span className="text-7xl font-black text-white leading-none drop-shadow-2xl tracking-tighter">
                  {team.score}
                </span>
              </div>

              {/* Oyuncu Listesi */}
              <div className={`w-full flex flex-col gap-2 ${isLeft ? 'items-start' : 'items-end'}`}>
                {team.players.map((player) => {
                  const isNarrator = isActive && currentNarrator?.id === player.id;
                  return (
                    <div 
                      key={player.id} 
                      className={`
                        flex items-center gap-3 px-4 py-2 rounded-lg transition-all
                        ${isNarrator 
                          ? 'bg-brand-primary text-white shadow-lg font-bold ring-1 ring-white/20 translate-x-2' 
                          : 'text-slate-400 font-medium'}
                        ${!isLeft && isNarrator ? '-translate-x-2' : ''}
                        ${!isLeft ? 'flex-row-reverse' : ''}
                      `}
                    >
                      {isNarrator ? <Mic size={16} className="animate-pulse" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-600"/>}
                      <span className="text-sm">{player.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default ScoreBoard;