import React, { useState } from 'react';
import { Team, GameSettings, Player } from '../types';
import { Copy, CheckCircle, Clock, Award, Ban, User, Crown, Play, LogOut, Settings2 } from 'lucide-react';

interface LobbyScreenProps {
  roomCode: string;
  teams: Team[];
  currentUser: Player;
  settings: GameSettings;
  onStartGame: () => void;
  onSwitchTeam: (teamId: 'A' | 'B') => void;
  onLeave: () => void;
  onUpdateSettings?: (newSettings: GameSettings) => void; // Yeni Prop
  isHost: boolean;
}

const LobbyScreen: React.FC<LobbyScreenProps> = ({ 
  roomCode, teams, currentUser, settings, 
  onStartGame, onSwitchTeam, onLeave, onUpdateSettings, isHost 
}) => {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Ayar değiştirme yardımcı fonksiyonu
  const handleChange = (key: keyof GameSettings, value: number) => {
    if (onUpdateSettings) {
      onUpdateSettings({ ...settings, [key]: value });
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-900 p-4 pb-24 flex flex-col items-center overflow-y-auto">
      
      {/* Top Bar */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-6 pt-2">
         <button onClick={onLeave} className="flex items-center gap-2 text-slate-400 hover:text-white hover:bg-slate-800 px-4 py-2 rounded-xl transition-all active:scale-95">
           <LogOut size={20} /> <span className="font-bold text-sm">Çıkış</span>
         </button>
         <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Oda Kodu</span>
            <button onClick={copyCode} className="flex items-center gap-2 text-2xl font-black text-white hover:text-brand-primary transition-colors">
               {roomCode} {copied ? <CheckCircle size={18} className="text-green-500"/> : <Copy size={18}/>}
            </button>
         </div>
      </div>

      <div className="w-full max-w-4xl mb-8">
         <h1 className="text-3xl font-black text-white mb-1">BEKLEME ODASI</h1>
         <div className="flex items-center gap-2 text-brand-success text-sm font-medium animate-pulse">
            <span className="w-2 h-2 bg-brand-success rounded-full"></span>
            {isHost ? "Oyunu başlatmanı bekliyorlar..." : "Oda sahibi oyunu başlatacak..."}
         </div>
      </div>

      {/* Teams Grid */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
         {teams.map((team) => {
           const isMyTeam = team.players.some(p => p.id === currentUser.id);
           return (
             <div key={team.id} className={`relative flex flex-col bg-slate-800/40 rounded-2xl border-2 transition-all overflow-hidden ${isMyTeam ? 'border-brand-primary/50 shadow-[0_0_20px_-5px_rgba(99,102,241,0.2)]' : 'border-slate-700/50'}`}>
                <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/50">
                   <div>
                      <h3 className={`font-black text-lg ${team.color}`}>{team.name}</h3>
                      <p className="text-slate-500 text-[10px] font-bold uppercase">{team.players.length} Oyuncu</p>
                   </div>
                   {!isMyTeam && (
                      <button onClick={() => onSwitchTeam(team.id)} className="px-3 py-1.5 bg-slate-700 hover:bg-white hover:text-slate-900 text-white text-xs font-bold rounded-lg transition-all active:scale-95">
                        Katıl
                      </button>
                   )}
                   {isMyTeam && <span className="px-2 py-1 bg-brand-primary/20 text-brand-primary text-[10px] font-bold rounded border border-brand-primary/30">SEN</span>}
                </div>
                <div className="p-3 space-y-2 min-h-[120px]">
                   {team.players.map(player => (
                       <div key={player.id} className="flex items-center gap-3 p-2 bg-slate-900/50 rounded-lg border border-slate-700/30">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs ${player.isHost ? 'bg-brand-warning' : 'bg-slate-700'}`}>
                             {player.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 flex items-center gap-2">
                             <span className="font-bold text-slate-200 text-sm">{player.name}</span>
                             {player.isHost && <Crown size={12} className="text-brand-warning" fill="currentColor" />}
                          </div>
                       </div>
                   ))}
                   {team.players.length === 0 && <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-2 opacity-50 min-h-[80px]"><User size={24} /><span className="text-xs font-medium">Boş</span></div>}
                </div>
             </div>
           );
         })}
      </div>

      {/* Settings Area (Host için Slider, Diğerleri için Statik) */}
      <div className="w-full max-w-4xl bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50 mb-8">
           <div className="flex items-center gap-2 mb-6 text-slate-300">
              <Settings2 size={20} />
              <h3 className="font-bold uppercase tracking-wider text-sm">Oyun Ayarları</h3>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* SÜRE */}
              <div>
                 <div className="flex justify-between mb-2 text-xs font-bold text-slate-400 uppercase">
                    <span className="flex items-center gap-1"><Clock size={14} /> Süre</span>
                    <span className="text-white">{settings.roundTime}sn</span>
                 </div>
                 {isHost ? (
                   <input type="range" min="30" max="120" step="10" value={settings.roundTime} 
                     onChange={(e) => handleChange('roundTime', parseInt(e.target.value))}
                     className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-primary" />
                 ) : (
                   <div className="h-2 w-full bg-slate-700 rounded-lg overflow-hidden"><div className="h-full bg-brand-primary" style={{width: `${(settings.roundTime/120)*100}%`}}></div></div>
                 )}
              </div>

              {/* SKOR */}
              <div>
                 <div className="flex justify-between mb-2 text-xs font-bold text-slate-400 uppercase">
                    <span className="flex items-center gap-1"><Award size={14} /> Hedef</span>
                    <span className="text-white">{settings.targetScore}</span>
                 </div>
                 {isHost ? (
                   <input type="range" min="5" max="50" step="5" value={settings.targetScore} 
                     onChange={(e) => handleChange('targetScore', parseInt(e.target.value))}
                     className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-warning" />
                 ) : (
                   <div className="h-2 w-full bg-slate-700 rounded-lg overflow-hidden"><div className="h-full bg-brand-warning" style={{width: `${(settings.targetScore/50)*100}%`}}></div></div>
                 )}
              </div>

              {/* PAS */}
              <div>
                 <div className="flex justify-between mb-2 text-xs font-bold text-slate-400 uppercase">
                    <span className="flex items-center gap-1"><Ban size={14} /> Pas Hakkı</span>
                    <span className="text-white">{settings.passLimit === 0 ? "Sınırsız" : settings.passLimit}</span>
                 </div>
                 {isHost ? (
                   <div className="flex gap-1">
                      {[0, 3, 5, 10].map(val => (
                        <button key={val} onClick={() => handleChange('passLimit', val)}
                          className={`flex-1 py-1 rounded text-[10px] font-bold border transition-all ${settings.passLimit === val ? 'bg-brand-danger text-white border-brand-danger' : 'bg-slate-900 text-slate-400 border-slate-700'}`}>
                          {val === 0 ? "∞" : val}
                        </button>
                      ))}
                   </div>
                 ) : (
                   <div className="text-center p-1 bg-slate-900/50 rounded border border-slate-700 text-xs font-bold text-slate-300">
                      {settings.passLimit === 0 ? "Sınırsız Pas" : `${settings.passLimit} Pas Hakkı`}
                   </div>
                 )}
              </div>
           </div>
      </div>

      {/* Start Button */}
      <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent flex justify-center z-50">
         {isHost ? (
             <button onClick={onStartGame} className="w-full max-w-md bg-brand-primary hover:bg-indigo-500 text-white font-bold text-lg py-4 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3">
               <Play fill="currentColor" /> Oyunu Başlat
             </button>
          ) : (
            <div className="text-center p-3 bg-slate-800/90 backdrop-blur rounded-xl border border-slate-700 max-w-sm w-full flex items-center justify-center gap-3">
               <div className="w-4 h-4 border-2 border-slate-500 border-t-brand-primary rounded-full animate-spin"></div>
               <span className="text-white text-sm font-bold">Oyunun Başlaması Bekleniyor</span>
            </div>
          )}
      </div>
    </div>
  );
};

export default LobbyScreen;