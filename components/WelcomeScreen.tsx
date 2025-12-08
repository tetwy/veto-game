import React, { useState } from 'react';
import { Play, Users, User, Zap, Gamepad2, Sparkles, Hash, ArrowRight, Crown } from 'lucide-react';

interface WelcomeScreenProps {
  onCreateRoom: (playerName: string) => void;
  onJoinRoom: (playerName: string, roomCode: string) => void;
  isJoining?: boolean;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onCreateRoom, onJoinRoom, isJoining = false }) => {
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [error, setError] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleCreate = () => {
    if (!name.trim()) {
      setError('Lütfen bir isim gir.');
      return;
    }
    onCreateRoom(name.trim());
  };

  const handleJoin = () => {
    if (!name.trim()) {
      setError('Lütfen bir isim gir.');
      return;
    }
    if (!roomCode.trim() || roomCode.length < 6) {
      setError('Geçerli bir oda kodu gir.');
      return;
    }
    onJoinRoom(name.trim(), roomCode.trim().toUpperCase());
  };

  return (
    <div className="min-h-[100dvh] bg-slate-950 relative flex overflow-hidden font-sans selection:bg-brand-primary selection:text-white">
      
      {/* --- ARKA PLAN EFEKTLERİ --- */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-primary/20 rounded-full blur-[120px] animate-pulse-fast"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-secondary/20 rounded-full blur-[120px] animate-pulse-fast delay-75"></div>
        {/* Ortaya eklenen hafif mor ışık */}
        <div className="absolute top-[40%] left-[50%] translate-x-[-50%] w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px]"></div>
      </div>

      {/* LAYOUT DÜZENLEMESİ: 
         - justify-between KALDIRILDI -> justify-center EKLENDİ (Ortalamak için)
         - gap-12 -> lg:gap-24 (İki öge birbirine çok girmesin diye masaüstünde boşluk artırıldı)
      */}
      <div className="container mx-auto px-4 relative z-10 flex flex-col lg:flex-row items-center justify-center h-full min-h-[100dvh] gap-12 lg:gap-24 py-12">
        
        {/* --- SOL TARAF --- 
            - flex-1 KALDIRILDI (Sağa doğru tüm boşluğu itmemesi için)
            - w-full lg:w-auto EKLENDİ (Kendi alanını koruması için)
        */}
        <div className="w-full lg:w-auto flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 max-w-2xl">
           <div className="relative">
              <div className="absolute -top-12 -left-12 text-brand-primary/10 animate-bounce duration-[3000ms]">
                 <Gamepad2 size={120} strokeWidth={1} />
              </div>
              <h1 className="text-8xl md:text-9xl font-black tracking-tighter text-white drop-shadow-2xl">
                VETO
                <span className="text-brand-primary">.</span>
              </h1>
              <div className="flex items-center gap-3 mt-2 justify-center lg:justify-start">
                 <span className="px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/30 text-brand-primary text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                    <Zap size={12} fill="currentColor" /> Hızlı
                 </span>
                 <span className="px-3 py-1 rounded-full bg-brand-secondary/10 border border-brand-secondary/30 text-brand-secondary text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                    <Sparkles size={12} fill="currentColor" /> Eğlenceli
                 </span>
              </div>
           </div>

           <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed max-w-lg">
             Yasaklı kelimeleri kullanmadan takımına hedef kelimeyi anlat. <br className="hidden md:block"/>
             <span className="text-white font-semibold">Arkadaşlarınla rekabet et, süreyi iyi kullan!</span>
           </p>

           <div className="hidden lg:block relative w-full h-64 mt-8 perspective-[1000px]">
              <div className="absolute left-10 top-0 w-48 h-64 bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl transform rotate-[-12deg] opacity-60 scale-90"></div>
              <div className="absolute left-24 top-4 w-48 h-64 bg-slate-800 rounded-2xl border border-slate-600 shadow-2xl transform rotate-[-6deg] opacity-80 scale-95 flex flex-col items-center justify-center p-4">
                 <div className="w-full h-2 bg-slate-700 rounded mb-4"></div>
                 <div className="w-3/4 h-2 bg-slate-700 rounded"></div>
              </div>
              <div className="absolute left-40 top-8 w-48 h-64 bg-gradient-to-br from-brand-primary to-indigo-600 rounded-2xl shadow-[0_20px_50px_-12px_rgba(99,102,241,0.5)] transform rotate-[6deg] hover:rotate-[8deg] hover:-translate-y-4 transition-all duration-500 border border-white/20 flex flex-col p-4">
                 <div className="text-center mt-2 mb-6">
                    <h3 className="text-white font-black text-2xl tracking-widest uppercase">ELMA</h3>
                 </div>
                 <div className="flex-1 space-y-3 px-2">
                    <div className="bg-black/20 p-2 rounded text-center text-white/80 text-xs font-bold">Kırmızı</div>
                    <div className="bg-black/20 p-2 rounded text-center text-white/80 text-xs font-bold">Ağaç</div>
                    <div className="bg-black/20 p-2 rounded text-center text-white/80 text-xs font-bold">Meyve</div>
                 </div>
              </div>
           </div>
        </div>

        {/* --- SAĞ TARAF: YENİLENMİŞ MODERN GİRİŞ KARTI --- 
            - lg:mr-8 KALDIRILDI (Artık ortalandığı için sağ margin'e gerek yok, optik dengeyi bozuyordu)
        */}
        <div className="w-full max-w-md">
           
           {/* Kart Container */}
           <div className="group relative bg-slate-900/60 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-500 hover:shadow-[0_0_60px_-15px_rgba(79,70,229,0.15)] hover:border-white/20">
             
             {/* Dekoratif Işık Topları (Kart İçi) */}
             <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-secondary/20 rounded-full blur-3xl pointer-events-none"></div>
             <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-brand-primary/20 rounded-full blur-3xl pointer-events-none"></div>

             {/* Kart Başlığı */}
             <div className="relative mb-8 text-center">
                <div className="inline-flex p-3 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-inner border border-white/5 mb-4">
                   <User className="text-brand-primary" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Oyuna Hoş Geldin</h2>
                <p className="text-slate-400 text-sm mt-1">Başlamak için detayları gir.</p>
             </div>

             {/* İsim Input */}
             <div className="space-y-6">
                <div>
                   <label className={`text-xs font-bold uppercase tracking-wider ml-1 transition-colors duration-300 ${focusedInput === 'name' ? 'text-brand-primary' : 'text-slate-500'}`}>
                      Kullanıcı Adı
                   </label>
                   <div className={`mt-2 relative group transition-all duration-300 transform ${focusedInput === 'name' ? 'scale-[1.02]' : ''}`}>
                      <div className={`absolute inset-0 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-2xl opacity-0 transition-opacity duration-300 blur-md -z-10 ${focusedInput === 'name' ? 'opacity-40' : ''}`}></div>
                      <div className={`relative flex items-center bg-slate-950/50 border transition-all duration-300 rounded-2xl h-14 overflow-hidden ${error && !name ? 'border-red-500/50 shadow-[0_0_20px_-5px_rgba(239,68,68,0.3)]' : focusedInput === 'name' ? 'border-brand-primary/50 bg-slate-900/80' : 'border-white/10 hover:border-white/20'}`}>
                         <div className={`pl-4 transition-colors ${focusedInput === 'name' ? 'text-brand-primary' : 'text-slate-500'}`}>
                            <User size={18} />
                         </div>
                         <input 
                           type="text"
                           value={name}
                           onFocus={() => setFocusedInput('name')}
                           onBlur={() => setFocusedInput(null)}
                           onChange={(e) => {
                             setName(e.target.value);
                             if (e.target.value) setError('');
                           }}
                           placeholder="Nickname gir..."
                           className="w-full bg-transparent px-4 text-white font-semibold text-lg outline-none placeholder:font-medium placeholder:text-slate-600 h-full"
                           maxLength={12}
                         />
                         <div className="pr-4 text-xs font-bold text-slate-600">
                           {name.length}/12
                         </div>
                      </div>
                   </div>
                </div>

                {/* Sekmeler (Tabs) */}
                <div className="p-1.5 bg-slate-950/80 rounded-2xl border border-white/5 flex relative">
                   {/* Kayan Arkaplan */}
                   <div 
                      className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-slate-800 rounded-xl shadow-lg transition-all duration-300 ease-out border border-white/10 ${activeTab === 'create' ? 'left-1.5' : 'left-[calc(50%+1.5px)]'}`}
                   ></div>

                   <button 
                     onClick={() => { setActiveTab('create'); setError(''); }}
                     className={`flex-1 relative z-10 py-3 rounded-xl text-sm font-bold transition-colors duration-300 flex items-center justify-center gap-2 ${activeTab === 'create' ? 'text-white' : 'text-slate-500 hover:text-slate-400'}`}
                   >
                      <Crown size={16} className={activeTab === 'create' ? 'text-brand-primary' : ''} />
                      Oda Kur
                   </button>
                   <button 
                     onClick={() => { setActiveTab('join'); setError(''); }}
                     className={`flex-1 relative z-10 py-3 rounded-xl text-sm font-bold transition-colors duration-300 flex items-center justify-center gap-2 ${activeTab === 'join' ? 'text-white' : 'text-slate-500 hover:text-slate-400'}`}
                   >
                      <Users size={16} className={activeTab === 'join' ? 'text-brand-secondary' : ''} />
                      Katıl
                   </button>
                </div>

                {/* Değişen İçerik */}
                <div className="min-h-[90px]">
                   {activeTab === 'create' ? (
                      <button
                        onClick={handleCreate}
                        disabled={isJoining}
                        className="w-full h-16 group relative overflow-hidden bg-white text-slate-950 font-bold text-lg rounded-2xl shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none animate-fadeIn"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-brand-primary via-indigo-400 to-brand-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[length:200%_auto] animate-shimmer"></div>
                        <div className="relative flex items-center justify-center gap-3 z-10 group-hover:text-white transition-colors">
                           {isJoining ? (
                             <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                           ) : (
                             <>
                               <Play size={20} fill="currentColor" />
                               HEMEN BAŞLA
                             </>
                           )}
                        </div>
                      </button>
                   ) : (
                      <div className="space-y-4 animate-fadeIn">
                         <div className={`relative flex items-center bg-slate-950/50 border transition-all duration-300 rounded-2xl h-16 overflow-hidden ${error && !roomCode ? 'border-red-500/50' : focusedInput === 'code' ? 'border-brand-secondary/50 bg-slate-900/80 shadow-[0_0_20px_-5px_rgba(34,197,94,0.2)]' : 'border-white/10'}`}>
                            <div className={`pl-5 transition-colors ${focusedInput === 'code' ? 'text-brand-secondary' : 'text-slate-500'}`}>
                               <Hash size={20} />
                            </div>
                            <input 
                              type="text"
                              value={roomCode}
                              onFocus={() => setFocusedInput('code')}
                              onBlur={() => setFocusedInput(null)}
                              onChange={(e) => {
                                setRoomCode(e.target.value.toUpperCase().slice(0, 6));
                                if (e.target.value) setError('');
                              }}
                              placeholder="ODA KODU"
                              className="w-full bg-transparent px-4 text-white font-mono font-bold text-xl tracking-[0.2em] outline-none placeholder:font-sans placeholder:text-slate-700 placeholder:font-bold placeholder:tracking-normal h-full uppercase"
                            />
                            <button 
                              onClick={handleJoin}
                              disabled={isJoining}
                              className="h-full px-6 bg-brand-success hover:bg-green-500 text-white transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                              {isJoining ? (
                                 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              ) : (
                                 <ArrowRight size={24} />
                              )}
                            </button>
                         </div>
                      </div>
                   )}
                </div>

                {/* Hata Mesajı */}
                {error && (
                   <div className="flex items-center gap-2 text-red-400 text-xs font-bold bg-red-500/10 border border-red-500/20 p-3 rounded-xl animate-fadeIn">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                      {error}
                   </div>
                )}
             </div>
             
             {/* Alt Bilgi */}
             <div className="mt-8 pt-6 border-t border-white/5 text-center">
                <p className="text-slate-500 text-[10px] font-medium tracking-widest uppercase opacity-60">
                   v1.2.0 • Designed for Fun
                </p>
             </div>

           </div>
        </div>

      </div>
    </div>
  );
};

export default WelcomeScreen;