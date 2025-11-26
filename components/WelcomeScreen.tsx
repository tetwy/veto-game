
import React, { useState } from 'react';
import { Play, Users, User } from 'lucide-react';

interface WelcomeScreenProps {
  onCreateRoom: (playerName: string) => void;
  onJoinRoom: (playerName: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onCreateRoom, onJoinRoom }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState(false);

  const handleCreate = () => {
    if (!name.trim()) {
      setError(true);
      return;
    }
    onCreateRoom(name.trim());
  };

  const handleJoin = () => {
    if (!name.trim()) {
      setError(true);
      return;
    }
    onJoinRoom(name.trim());
  };

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden flex flex-col items-center justify-center p-6">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-primary opacity-20 blur-[100px] rounded-full mix-blend-screen animate-pulse-fast"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-secondary opacity-20 blur-[100px] rounded-full mix-blend-screen"></div>

      <div className="relative z-10 text-center max-w-md w-full">
        {/* Logo/Icon kaldırıldı, sadece tipografi */}
        
        <h1 className="text-7xl font-black text-white mb-2 tracking-tighter drop-shadow-2xl">
          VETO
        </h1>
        <p className="text-slate-400 text-lg mb-12 font-medium">
          Yasaklı kelimeleri kullanmadan anlat.
        </p>

        {/* İsim Giriş Alanı */}
        <div className="mb-8 w-full">
          <label className="block text-left text-slate-400 text-xs uppercase font-bold mb-2 ml-1">
            Oyuncu Adı
          </label>
          <div className={`relative flex items-center bg-slate-800 border-2 rounded-2xl transition-all ${error ? 'border-brand-danger animate-pulse' : 'border-slate-700 focus-within:border-brand-primary'}`}>
             <div className="pl-4 text-slate-500">
               <User size={20} />
             </div>
             <input 
               type="text"
               value={name}
               onChange={(e) => {
                 setName(e.target.value);
                 if (e.target.value) setError(false);
               }}
               placeholder="Adın ne?"
               className="w-full bg-transparent p-4 text-white font-bold outline-none placeholder:font-normal placeholder:text-slate-600"
               maxLength={12}
             />
          </div>
          {error && <p className="text-brand-danger text-xs text-left mt-2 ml-1 font-bold">Lütfen bir isim gir.</p>}
        </div>

        <div className="space-y-4">
          <button
            onClick={handleCreate}
            className="w-full group relative bg-white text-slate-900 font-bold text-xl py-5 rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-brand-primary to-brand-accent opacity-0 group-hover:opacity-10 transition-opacity rounded-2xl"></div>
            <div className="flex items-center justify-center gap-3">
               <Play size={24} fill="currentColor" />
               Oda Oluştur
            </div>
          </button>

          <button
            onClick={handleJoin}
            className="w-full bg-slate-800 text-white font-bold text-xl py-5 rounded-2xl border border-slate-700 shadow-lg transition-all hover:bg-slate-750 active:scale-95 flex items-center justify-center gap-3"
          >
             <Users size={24} />
             Odaya Katıl
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;