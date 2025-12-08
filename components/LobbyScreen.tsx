import React, { useState } from 'react';
import { Team, GameSettings, Player } from '../types';
import { Copy, CheckCircle, Clock, Award, Ban, Crown, Play, LogOut, Settings2, Users, Gamepad2 } from 'lucide-react';

interface LobbyScreenProps {
  roomCode: string;
  teams: Team[];
  currentUser: Player;
  settings: GameSettings;
  onStartGame: () => void;
  onSwitchTeam: (teamId: 'A' | 'B') => void;
  onLeave: () => void;
  onUpdateSettings?: (newSettings: GameSettings) => void;
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

  const handleChange = (key: keyof GameSettings, value: number) => {
    if (onUpdateSettings) {
      onUpdateSettings({ ...settings, [key]: value });
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-950 relative overflow-hidden font-sans selection:bg-brand-primary selection:text-white flex flex-col items-center">
      
      {/* --- ARKA PLAN EFEKTLERİ --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[120px] animate-pulse-fast"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-secondary/10 rounded-full blur-[120px] animate-pulse-fast delay-75"></div>
      </div>

      {/* --- İÇERİK CONTAINER --- */}
      {/* GÜNCELLEME: pt-12 md:pt-20 eklenerek yukarıdan boşluk artırıldı. flex-col ile içerik akışı sağlandı. */}
      <div className="relative z-10 w-full max-w-6xl px-4 pb-4 pt-12 md:pt-24 flex flex-col h-full">

        {/* HEADER: Başlık ve Çıkış */}
        <div className="flex justify-between items-center mb-8 md:mb-12">
           <div className="flex flex-col">
              {/* GÜNCELLEME: Yeşil nokta (span) kaldırıldı */}
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white drop-shadow-2xl flex items-center gap-2">
                 BEKLEME ODASI
              </h1>
              <div className="flex items-center gap-2 text-slate-400 text-xs md:text-sm font-medium mt-1 pl-1">
                  {/* Mobildeki nokta da kaldırıldı */}
                  {isHost ? "Ayarları yap ve oyunu başlat." : "Oda sahibinin başlatması bekleniyor..."}
              </div>
           </div>
           
           <button onClick={onLeave} className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/50 border border-white/10 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400 text-slate-400 transition-all active:scale-95 backdrop-blur-md">
             <LogOut size={18} />
             <span className="font-bold text-sm hidden md:block">Çıkış</span>
           </button>
        </div>

        {/* ANA GRID (Masaüstü: Yan Yana, Mobil: Alt Alta) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-24 lg:mb-0">
            
            {/* SOL KOLON: Takımlar ve Oda Kodu (Grid 8) */}
            <div className="lg:col-span-8 flex flex-col gap-6">
                
                {/* ODA KODU KARTI */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl relative overflow-hidden group">
                   <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                   
                   <div className="flex items-center gap-4 z-10">
                      <div className="p-3 bg-slate-800 rounded-xl text-brand-primary">
                         <Gamepad2 size={28} />
                      </div>
                      <div>
                         <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">Oda Kodu</h3>
                         <div className="flex items-center gap-2">
                            <span className="text-3xl md:text-4xl font-black text-white tracking-[0.2em] font-mono">{roomCode}</span>
                         </div>
                      </div>
                   </div>

                   {isHost && (
                      <button onClick={copyCode} className="z-10 w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-brand-primary hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-primary/20 active:scale-95">
                         {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
                         <span>{copied ? "Kopyalandı!" : "Kodu Kopyala"}</span>
                      </button>
                   )}
                </div>

                {/* TAKIMLAR GRİDİ */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {teams.map((team) => {
                     const isMyTeam = team.players.some(p => p.id === currentUser.id);
                     return (
                       <div key={team.id} className={`group relative flex flex-col min-h-[250px] bg-slate-900/40 backdrop-blur-md rounded-[2rem] border-2 transition-all duration-300 overflow-hidden ${isMyTeam ? 'border-brand-primary/50 shadow-[0_0_30px_-10px_rgba(99,102,241,0.3)] bg-slate-900/60' : 'border-white/5 hover:border-white/10'}`}>
                          
                          {/* Takım Header */}
                          <div className="relative p-5 border-b border-white/5 flex justify-between items-center bg-white/5">
                             <div className="flex items-center gap-3">
                                <div className={`w-3 h-8 rounded-full ${team.id === 'A' ? 'bg-brand-secondary' : 'bg-brand-success'}`}></div>
                                <div>
                                   <h3 className={`font-black text-xl tracking-tight ${team.color}`}>{team.name}</h3>
                                   <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">{team.players.length} OYUNCU</p>
                                </div>
                             </div>
                             
                             {!isMyTeam && (
                                <button onClick={() => onSwitchTeam(team.id)} className="px-4 py-1.5 bg-slate-800 hover:bg-white hover:text-slate-900 text-slate-300 text-xs font-bold rounded-lg transition-all active:scale-95 border border-white/10">
                                  Katıl
                                </button>
                             )}
                             {isMyTeam && <span className="px-3 py-1 bg-brand-primary/20 text-brand-primary text-[10px] font-bold rounded-lg border border-brand-primary/30 shadow-sm">SEN</span>}
                          </div>

                          {/* Oyuncu Listesi */}
                          <div className="p-4 space-y-2 flex-1 overflow-y-auto">
                             {team.players.map(player => (
                                 <div key={player.id} className="flex items-center gap-3 p-3 bg-slate-950/50 rounded-xl border border-white/5 group-hover:border-white/10 transition-colors">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-inner ${player.isHost ? 'bg-gradient-to-br from-brand-warning to-orange-600' : 'bg-slate-700'}`}>
                                       {player.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 flex items-center gap-2">
                                       <span className="font-bold text-slate-200 text-sm">{player.name}</span>
                                       {player.isHost && <Crown size={14} className="text-brand-warning drop-shadow-md" fill="currentColor" />}
                                    </div>
                                 </div>
                             ))}
                             {team.players.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-2 opacity-50 min-h-[100px]">
                                   <Users size={32} />
                                   <span className="text-xs font-medium uppercase tracking-widest">Takım Boş</span>
                                </div>
                             )}
                          </div>
                       </div>
                     );
                   })}
                </div>
            </div>

            {/* SAĞ KOLON: Ayarlar (Grid 4) */}
            <div className="lg:col-span-4 flex flex-col h-full">
                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 lg:p-8 flex-1 flex flex-col gap-8 shadow-xl relative overflow-hidden">
                     
                     {/* Başlık */}
                     <div className="flex items-center gap-3 pb-6 border-b border-white/10">
                        <div className="p-2 bg-slate-800 rounded-lg text-slate-300">
                           <Settings2 size={24} />
                        </div>
                        <h3 className="font-bold text-lg text-white tracking-wide">OYUN AYARLARI</h3>
                     </div>

                     <div className="flex-1 space-y-8">
                        {/* SÜRE Slider */}
                        <div className="group">
                           <div className="flex justify-between mb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                              <span className="flex items-center gap-2"><Clock size={14} className="text-brand-primary"/> Tur Süresi</span>
                              <span className="text-white bg-slate-800 px-2 py-0.5 rounded">{settings.roundTime} sn</span>
                           </div>
                           <div className="relative h-10 flex items-center">
                              {isHost ? (
                                <input type="range" min="30" max="120" step="10" value={settings.roundTime} 
                                  onChange={(e) => handleChange('roundTime', parseInt(e.target.value))}
                                  className="w-full h-3 bg-slate-800 rounded-full appearance-none cursor-pointer accent-brand-primary hover:accent-indigo-400 transition-all" />
                              ) : (
                                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-brand-primary shadow-[0_0_10px_#6366f1]" style={{width: `${(settings.roundTime/120)*100}%`}}></div></div>
                              )}
                           </div>
                        </div>

                        {/* HEDEF SKOR Slider */}
                        <div className="group">
                           <div className="flex justify-between mb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                              <span className="flex items-center gap-2"><Award size={14} className="text-brand-warning"/> Hedef Skor</span>
                              <span className="text-white bg-slate-800 px-2 py-0.5 rounded">{settings.targetScore}</span>
                           </div>
                           <div className="relative h-10 flex items-center">
                              {isHost ? (
                                <input type="range" min="10" max="100" step="5" value={settings.targetScore} 
                                  onChange={(e) => handleChange('targetScore', parseInt(e.target.value))}
                                  className="w-full h-3 bg-slate-800 rounded-full appearance-none cursor-pointer accent-brand-warning hover:accent-amber-400 transition-all" />
                              ) : (
                                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-brand-warning shadow-[0_0_10px_#f59e0b]" style={{width: `${(settings.targetScore/100)*100}%`}}></div></div>
                              )}
                           </div>
                        </div>

                        {/* PAS HAKKI */}
                        <div>
                           <div className="flex justify-between mb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                              <span className="flex items-center gap-2"><Ban size={14} className="text-brand-danger"/> Pas Hakkı</span>
                           </div>
                           {isHost ? (
                             <div className="grid grid-cols-4 gap-2">
                                {[0, 3, 5, 10].map(val => (
                                  <button key={val} onClick={() => handleChange('passLimit', val)}
                                    className={`py-2 rounded-xl text-xs font-bold border transition-all duration-300 ${settings.passLimit === val ? 'bg-brand-danger text-white border-brand-danger shadow-[0_0_15px_-5px_#ef4444]' : 'bg-slate-900/50 text-slate-500 border-white/5 hover:border-white/20 hover:text-white'}`}>
                                    {val === 0 ? "∞" : val}
                                  </button>
                                ))}
                             </div>
                           ) : (
                             <div className="text-center p-3 bg-slate-900/50 rounded-xl border border-white/5 text-sm font-bold text-slate-300">
                                {settings.passLimit === 0 ? "Sınırsız Pas Hakkı" : `${settings.passLimit} Pas Hakkı`}
                             </div>
                           )}
                        </div>
                     </div>
                </div>
            </div>
        </div>
      </div>

      {/* START BUTTON (Fixed Bottom) */}
      <div className="fixed bottom-0 left-0 w-full p-6 lg:p-8 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent flex justify-center z-50 pointer-events-none">
         <div className="w-full max-w-lg pointer-events-auto">
             {isHost ? (
                 <button onClick={onStartGame} className="group relative w-full overflow-hidden bg-white text-slate-950 font-black text-xl py-5 rounded-2xl shadow-2xl transition-all hover:scale-[1.02] active:scale-95">
                   <div className="absolute inset-0 bg-gradient-to-r from-brand-primary via-indigo-400 to-brand-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[length:200%_auto] animate-shimmer"></div>
                   <div className="relative flex items-center justify-center gap-3 z-10 group-hover:text-white transition-colors">
                     <Play fill="currentColor" size={24} /> OYUNU BAŞLAT
                   </div>
                 </button>
              ) : (
                <div className="text-center p-4 bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center justify-center gap-3 shadow-lg">
                   <div className="w-5 h-5 border-2 border-slate-500 border-t-brand-primary rounded-full animate-spin"></div>
                   <span className="text-slate-300 text-sm font-bold tracking-wide uppercase">Oyunun Başlaması Bekleniyor</span>
                </div>
              )}
         </div>
      </div>
    </div>
  );
};

export default LobbyScreen;