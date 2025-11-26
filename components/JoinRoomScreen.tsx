
import React, { useState } from 'react';
import { ChevronLeft, ArrowRight } from 'lucide-react';

interface JoinRoomScreenProps {
  onBack: () => void;
  onJoin: (code: string) => void;
  isLoading: boolean;
}

const JoinRoomScreen: React.FC<JoinRoomScreenProps> = ({ onBack, onJoin, isLoading }) => {
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6) {
      onJoin(code);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col p-4">
      <div className="flex items-center mb-12">
        <button onClick={onBack} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors">
          <ChevronLeft className="text-white" />
        </button>
        <h2 className="text-xl font-bold text-white ml-4">Odaya Katıl</h2>
      </div>

      <div className="max-w-md mx-auto w-full">
        <label className="block text-center text-slate-400 text-sm mb-4">
          Arkadaşının oluşturduğu 6 haneli oda kodunu gir.
        </label>
        
        <form onSubmit={handleSubmit}>
          <input 
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
            className="w-full bg-slate-800 border-2 border-slate-700 text-center text-4xl font-mono tracking-[0.5em] text-white py-6 rounded-2xl focus:outline-none focus:border-brand-primary transition-colors mb-8 placeholder:text-slate-700"
            placeholder="KODGİR"
          />

          <button
            type="submit"
            disabled={code.length !== 6 || isLoading}
            className="w-full bg-brand-success hover:bg-green-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
             {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
             ) : (
                <>
                  Katıl <ArrowRight size={20} />
                </>
             )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinRoomScreen;
