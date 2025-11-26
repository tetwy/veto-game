
import React from 'react';
import { Team, Player } from '../types';
import { Trophy, Mic, User } from 'lucide-react';

interface ScoreBoardProps {
  teams: Team[];
  currentTeamId: string;
  currentNarrator: Player | null;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ teams, currentTeamId, currentNarrator }) => {
  return (
    <>
      {/* Container - Mobilde üstte yan yana, Masaüstünde ayrık ve yanlara sabitlenmiş */}
      <div className="w-full flex md:absolute md:inset-0 md:pointer-events-none justify-between items-start md:items-center px-2 md:px-6 py-2 z-20">
        
        {teams.map((team, index) => {
          const isActive = team.id === currentTeamId;
          const isLeft = index === 0; // A Takımı solda, B Takımı sağda
          
          return (
            <div 
              key={team.id}
              className={`
                relative flex flex-col transition-all duration-500 border overflow-hidden
                ${isActive 
                  ? 'bg-slate-800/95 border-brand-primary shadow-[0_0_30px_-10px_rgba(99,102,241,0.5)] z-10' 
                  : 'bg-slate-900/60 border-slate-700/50 opacity-80 grayscale-[0.8]'}
                ${isLeft ? 'items-center md:items-start rounded-r-2xl rounded-bl-2xl' : 'items-center md:items-end rounded-l-2xl rounded-br-2xl'}
                w-[48%] md:w-64 md:pointer-events-auto
                p-2 md:p-5
                max-h-[160px] md:max-h-[80vh] /* Mobilde yükseklik sınırı */
              `}
            >
              {/* Team Name & Score */}
              <div className={`flex flex-col w-full mb-3 ${isLeft ? 'md:items-start items-center' : 'md:items-end items-center'}`}>
                <h3 className={`font-black text-xs md:text-lg uppercase tracking-wider truncate max-w-full ${team.color}`}>
                  {team.name}
                </h3>
                <div className="relative">
                   <span className="text-3xl md:text-5xl font-black text-white leading-none drop-shadow-md">
                     {team.score}
                   </span>
                   {isActive && team.score > 0 && (
                      <Trophy 
                        size={16} 
                        className="absolute -top-2 -right-3 text-brand-warning animate-bounce hidden md:block" 
                        fill="currentColor" 
                      />
                   )}
                </div>
              </div>

              {/* Player List */}
              <div className={`
                 w-full flex flex-col gap-1.5 overflow-y-auto custom-scrollbar pr-1
                 ${isLeft ? 'md:items-start items-center' : 'md:items-end items-center'}
              `}>
                {team.players.map((player) => {
                  const isNarrator = isActive && currentNarrator?.id === player.id;

                  return (
                    <div 
                      key={player.id} 
                      className={`
                        flex items-center gap-2 px-2 py-1 rounded-lg transition-all w-full md:w-auto max-w-[140px] md:max-w-none justify-center md:justify-start
                        ${isNarrator 
                          ? 'bg-brand-primary text-white shadow-lg font-bold ring-1 ring-white/20' 
                          : 'text-slate-400 font-medium hover:bg-slate-800/50'}
                        ${!isLeft ? 'md:flex-row-reverse' : ''}
                      `}
                    >
                      {/* Icon */}
                      {isNarrator ? (
                        <Mic size={14} className="animate-pulse flex-shrink-0" />
                      ) : (
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isActive ? 'bg-slate-600' : 'bg-slate-700'}`} />
                      )}
                      
                      {/* Name */}
                      <span className="text-xs truncate">{player.name}</span>
                    </div>
                  );
                })}

                {team.players.length === 0 && (
                   <span className="text-[10px] text-slate-600 italic mt-1">Oyuncu bekleniyor...</span>
                )}
              </div>

              {/* Decorative Line */}
              <div className={`absolute bottom-0 ${isLeft ? 'left-0' : 'right-0'} w-2/3 h-1 ${isActive ? 'bg-brand-primary' : 'bg-slate-700'}`}></div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default ScoreBoard;
