
import React, { useState } from 'react';
import { Team, GameSettings, Player } from '../types';
import { Copy, CheckCircle, Clock, Award, Ban, User, Crown, Play, LogOut } from 'lucide-react';

interface LobbyScreenProps {
  roomCode: string;
  teams: Team[];
  currentUser: Player;
  settings: GameSettings;
  onStartGame: () => void;
  onSwitchTeam: (teamId: 'A' | 'B') => void;
  onLeave: () => void;
  isHost: boolean;
}

const LobbyScreen: React.FC<LobbyScreenProps> = ({ 
  roomCode, 
  teams, 
  currentUser,
  settings, 
  onStartGame, 
  onSwitchTeam,
  onLeave,
  isHost 
}) => {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-900 p-4 pb-24 flex flex-col items-center">
      
      {/* Top Navigation Bar */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-4 pt-2">
         <button 
           onClick={onLeave}
           className="flex items-center gap-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-all px-4 py-2 rounded-xl active:scale-95 group"
         >
           <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
           <span className="font-bold text-sm">Çıkış</span>
         </button>
      </div>

      {/* Header Info */}
      <div className="w-full max-w-4xl flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
         <div className="flex flex-col items-center md:items-start">
            <h1 className="text-2xl font-black text-white">BEKLEME ODASI</h1>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
               <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
               Oyuncular bekleniyor...
            </div>
         </div>

         {/* Room Code Card */}
         <button 
            onClick={copyCode}
            className="flex items-center gap-4 bg-slate-800 border border-slate-700 rounded-xl px-6 py-3 hover:bg-slate-750 hover:border-brand-primary transition-all active:scale-95 group"
          >
            <div className="flex flex-col items-start">
               <span className="text-[10px] uppercase font-bold text-slate-500">Oda Kodu</span>
               <span className="text-3xl font-mono font-black text-white tracking-widest">{roomCode}</span>
            </div>
            <div className="bg-slate-700 p-2 rounded-lg text-brand-primary group-hover:bg-slate-600 transition-colors">
              {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
            </div>
         </button>
      </div>

      {/* Teams Grid */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
         {teams.map((team) => {
           const isMyTeam = team.players.some(p => p.id === currentUser.id);
           
           return (
             <div key={team.id} className={`relative flex flex-col bg-slate-800/40 rounded-3xl border-2 transition-all overflow-hidden ${isMyTeam ? 'border-brand-primary/50 shadow-[0_0_30px_-10px_rgba(99,102,241,0.3)]' : 'border-slate-700/50'}`}>
                
                {/* Team Header */}
                <div className="p-5 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/50">
                   <div>
                      <h3 className={`font-black text-xl ${team.color}`}>{team.name}</h3>
                      <p className="text-slate-500 text-xs font-bold uppercase">{team.players.length} Oyuncu</p>
                   </div>
                   {!isMyTeam && (
                      <button 
                        onClick={() => onSwitchTeam(team.id)}
                        className="px-4 py-2 bg-slate-700 hover:bg-white hover:text-slate-900 text-white text-sm font-bold rounded-lg transition-all active:scale-95"
                      >
                        Katıl
                      </button>
                   )}
                   {isMyTeam && (
                     <span className="px-3 py-1 bg-brand-primary/20 text-brand-primary text-xs font-bold rounded-lg border border-brand-primary/30">
                       Senin Takımın
                     </span>
                   )}
                </div>

                {/* Players List */}
                <div className="p-4 space-y-2 min-h-[200px]">
                   {team.players.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-2 opacity-50 min-h-[150px]">
                         <User size={32} />
                         <span className="text-sm font-medium">Kimse yok</span>
                      </div>
                   ) : (
                     team.players.map(player => (
                       <div key={player.id} className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl border border-slate-700/50 animate-[fadeIn_0.3s_ease-out]">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${player.isHost ? 'bg-brand-warning' : 'bg-slate-700'}`}>
                             {player.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                             <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-200">{player.name}</span>
                                {player.isHost && <Crown size={14} className="text-brand-warning" fill="currentColor" />}
                             </div>
                             {player.id === currentUser.id && <span className="text-[10px] text-slate-500 font-bold uppercase">Sen</span>}
                          </div>
                       </div>
                     ))
                   )}
                </div>
             </div>
           );
         })}
      </div>

      {/* Settings Summary Bar */}
      <div className="w-full max-w-4xl bg-slate-800/30 rounded-2xl p-4 border border-slate-700/50 flex justify-around items-center mb-8">
           <div className="flex flex-col items-center text-center">
              <Clock size={20} className="text-brand-primary mb-1" />
              <span className="text-white font-bold">{settings.roundTime}sn</span>
           </div>
           <div className="w-px h-8 bg-slate-700"></div>
           <div className="flex flex-col items-center text-center">
              <Award size={20} className="text-brand-warning mb-1" />
              <span className="text-white font-bold">{settings.targetScore}</span>
           </div>
           <div className="w-px h-8 bg-slate-700"></div>
           <div className="flex flex-col items-center text-center">
              <Ban size={20} className="text-brand-danger mb-1" />
              <span className="text-white font-bold">
                {settings.passLimit === 0 ? "∞" : settings.passLimit}
              </span>
           </div>
      </div>

      {/* Footer / Start Game */}
      <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent flex justify-center">
         {isHost ? (
             <button
               onClick={onStartGame}
               className="w-full max-w-md bg-brand-primary hover:bg-indigo-500 text-white font-bold text-lg py-5 rounded-2xl shadow-xl transition-all active:scale-95 animate-pulse flex items-center justify-center gap-3"
             >
               <Play fill="currentColor" />
               Oyunu Başlat
             </button>
          ) : (
            <div className="text-center p-4 bg-slate-800/80 backdrop-blur rounded-xl border border-slate-700 max-w-sm w-full">
               <div className="flex items-center justify-center gap-3 mb-1">
                 <div className="w-5 h-5 border-2 border-slate-500 border-t-brand-primary rounded-full animate-spin"></div>
                 <span className="text-white font-bold">Oyunun Başlaması Bekleniyor</span>
               </div>
               <p className="text-slate-400 text-xs">Oda sahibi ayarları tamamladığında oyun başlayacak.</p>
            </div>
          )}
      </div>

    </div>
  );
};

export default LobbyScreen;
