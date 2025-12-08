import React from 'react';
import { Team, Player } from '../types';
import { Trophy, Mic, Activity } from 'lucide-react';

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
      {/* App.tsx'te ScoreBoard Timer'dan önce geldiği için, mobilde üstte yer alır. */}
      {/* px-4 ve mt-2 ile kenarlardan ve üstten güvenli boşluk bırakıyoruz. */}
      <div className="md:hidden w-full px-4 mt-2 mb-2 relative z-20">
        <div className="flex justify-between items-stretch bg-slate-900/60 backdrop-blur-xl p-1.5 rounded-3xl border border-white/10 shadow-2xl">
          {teams.map((team) => {
             const isActive = team.id === currentTeamId;
             const isLeading = hasScore && team.score === maxScore;

             return (
               <div 
                 key={team.id} 
                 className={`
                   relative flex flex-col items-center justify-center w-[49%] py-2 rounded-2xl transition-all duration-300
                   ${isActive 
                     ? `bg-slate-800/80 shadow-lg border border-white/10 ${team.id === 'A' ? 'shadow-brand-secondary/20' : 'shadow-brand-success/20'}` 
                     : 'opacity-60 grayscale-[0.5]'}
                 `}
               >
                  {/* Aktiflik Göstergesi (Nokta) */}
                  {isActive && (
                    <div className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full animate-pulse ${team.color.replace('text-', 'bg-')}`}></div>
                  )}

                  {/* Liderlik Kupası (Mobilde küçük ikon) */}
                  {isLeading && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 p-1 rounded-full shadow-lg z-10">
                      <Trophy size={12} className="text-brand-warning animate-bounce" fill="currentColor" />
                    </div>
                  )}

                  <span className={`text-[10px] font-black uppercase tracking-widest mb-0.5 ${team.color}`}>{team.name}</span>
                  <span className="text-2xl font-black text-white leading-none tracking-tight">{team.score}</span>
               </div>
             )
          })}
        </div>
      </div>

      {/* --- MASAÜSTÜ GÖRÜNÜM (Yan Kanatlar) --- */}
      {/* absolute inset-0: Ana ekranı tamamen kaplar */}
      {/* items-center: Kanatları dikeyde ortalar */}
      <div className="hidden md:flex absolute inset-0 pointer-events-none justify-between items-center px-6 lg:px-12 z-0">
        {teams.map((team, index) => {
          const isActive = team.id === currentTeamId;
          const isLeft = index === 0;
          const isLeading = hasScore && team.score === maxScore;
          
          return (
            <div 
              key={team.id}
              className={`
                relative flex flex-col transition-all duration-700 border overflow-hidden pointer-events-auto
                ${isActive 
                  ? `bg-slate-900/80 border-white/20 scale-100 z-10 opacity-100 ${team.id === 'A' ? 'shadow-[0_0_50px_-20px_rgba(168,85,247,0.4)]' : 'shadow-[0_0_50px_-20px_rgba(34,197,94,0.4)]'}` 
                  : 'bg-slate-950/40 border-white/5 opacity-40 hover:opacity-60 scale-95 grayscale-[0.8]'}
                ${isLeft ? 'items-start rounded-r-[3rem] border-l-0 pr-8 pl-4' : 'items-end rounded-l-[3rem] border-r-0 pl-8 pr-4'}
                w-64 lg:w-72 py-10 backdrop-blur-2xl
              `}
            >
              {/* Arkaplan Efekti (Sadece Aktifken) */}
              {isActive && (
                <div className={`absolute top-0 ${isLeft ? 'left-0' : 'right-0'} w-1/2 h-full bg-gradient-to-b ${team.id === 'A' ? 'from-brand-secondary/10' : 'from-brand-success/10'} to-transparent opacity-50`}></div>
              )}

              {/* İsim, Skor ve Kupa */}
              <div className={`relative flex flex-col w-full mb-8 z-10 ${isLeft ? 'items-start' : 'items-end'}`}>
                <div className="flex items-center gap-3 mb-1">
                   {isLeading && !isLeft && <Trophy size={20} className="text-brand-warning animate-bounce drop-shadow-md" fill="currentColor" />}
                   <h3 className={`font-black text-lg lg:text-xl uppercase tracking-[0.2em] truncate max-w-[180px] ${team.color}`}>
                     {team.name}
                   </h3>
                   {isLeading && isLeft && <Trophy size={20} className="text-brand-warning animate-bounce drop-shadow-md" fill="currentColor" />}
                </div>
                
                <div className="relative">
                  <span className="text-7xl lg:text-8xl font-black text-white leading-none tracking-tighter drop-shadow-2xl">
                    {team.score}
                  </span>
                  {/* Skor Altı Çizgi */}
                  <div className={`h-1 w-full mt-2 rounded-full ${isActive ? (team.id === 'A' ? 'bg-brand-secondary' : 'bg-brand-success') : 'bg-slate-700'}`}></div>
                </div>
              </div>

              {/* Oyuncu Listesi */}
              <div className={`w-full flex flex-col gap-2.5 relative z-10 ${isLeft ? 'items-start' : 'items-end'}`}>
                <div className="flex items-center gap-2 mb-2 text-slate-500">
                  <Activity size={12} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Kadro</span>
                </div>

                {team.players.map((player) => {
                  const isNarrator = isActive && currentNarrator?.id === player.id;
                  return (
                    <div 
                      key={player.id} 
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300
                        ${isNarrator 
                          ? `bg-white/10 text-white font-bold ring-1 ring-white/20 backdrop-blur-md shadow-lg ${isLeft ? 'translate-x-2' : '-translate-x-2'}` 
                          : 'text-slate-500 font-medium hover:text-slate-300'}
                        ${!isLeft ? 'flex-row-reverse text-right' : ''}
                      `}
                    >
                      {isNarrator ? (
                        <div className={`p-1 rounded-full ${team.id === 'A' ? 'bg-brand-secondary text-white' : 'bg-brand-success text-white'}`}>
                          <Mic size={12} className="animate-pulse" />
                        </div>
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-700"/>
                      )}
                      <span className="text-xs lg:text-sm truncate max-w-[120px]">{player.name}</span>
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