
import React, { useState } from 'react';
import { Team, GameSettings } from '../types';
import { INITIAL_TEAMS, DEFAULT_SETTINGS } from '../constants';
import { ChevronLeft, Clock, Award, Ban } from 'lucide-react';

interface CreateRoomScreenProps {
  onBack: () => void;
  onConfirm: (settings: GameSettings, teams: Team[]) => void;
  isLoading: boolean;
}

const CreateRoomScreen: React.FC<CreateRoomScreenProps> = ({ onBack, onConfirm, isLoading }) => {
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [teamNames, setTeamNames] = useState({
    A: INITIAL_TEAMS[0].name,
    B: INITIAL_TEAMS[1].name
  });

  const handleCreate = () => {
    const newTeams = [
      { ...INITIAL_TEAMS[0], name: teamNames.A },
      { ...INITIAL_TEAMS[1], name: teamNames.B }
    ];
    onConfirm(settings, newTeams);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors">
          <ChevronLeft className="text-white" />
        </button>
        <h2 className="text-xl font-bold text-white ml-4">Oda Ayarları</h2>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 space-y-6 max-w-lg mx-auto w-full">
        
        {/* Takım İsimleri */}
        <section className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700">
          <h3 className="text-brand-secondary font-bold uppercase text-xs tracking-wider mb-4">Takım İsimleri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-slate-400 text-sm mb-1">1. Takım</label>
              <input 
                type="text" 
                value={teamNames.A}
                onChange={(e) => setTeamNames(prev => ({ ...prev, A: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-brand-primary transition-colors"
                placeholder="Örn: Aslanlar"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1">2. Takım</label>
              <input 
                type="text" 
                value={teamNames.B}
                onChange={(e) => setTeamNames(prev => ({ ...prev, B: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-brand-primary transition-colors"
                placeholder="Örn: Kaplanlar"
              />
            </div>
          </div>
        </section>

        {/* Oyun Kuralları */}
        <section className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700 space-y-6">
          <h3 className="text-brand-success font-bold uppercase text-xs tracking-wider mb-2">Oyun Kuralları</h3>
          
          {/* Süre */}
          <div>
             <div className="flex justify-between mb-2">
                <div className="flex items-center gap-2 text-white font-medium">
                  <Clock size={18} className="text-brand-primary" /> Tur Süresi
                </div>
                <span className="text-brand-primary font-bold">{settings.roundTime} sn</span>
             </div>
             <input 
               type="range" 
               min="30" 
               max="120" 
               step="10" 
               value={settings.roundTime}
               onChange={(e) => setSettings(prev => ({ ...prev, roundTime: parseInt(e.target.value) }))}
               className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-primary"
             />
             <div className="flex justify-between text-xs text-slate-500 mt-1">
               <span>30sn</span>
               <span>120sn</span>
             </div>
          </div>

          {/* Hedef Skor */}
          <div>
             <div className="flex justify-between mb-2">
                <div className="flex items-center gap-2 text-white font-medium">
                  <Award size={18} className="text-brand-warning" /> Hedef Skor
                </div>
                <span className="text-brand-warning font-bold">{settings.targetScore}</span>
             </div>
             <input 
               type="range" 
               min="10" 
               max="100" 
               step="5" 
               value={settings.targetScore}
               onChange={(e) => setSettings(prev => ({ ...prev, targetScore: parseInt(e.target.value) }))}
               className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-warning"
             />
          </div>

          {/* Pas Hakkı */}
          <div>
             <div className="flex justify-between mb-2">
                <div className="flex items-center gap-2 text-white font-medium">
                  <Ban size={18} className="text-brand-danger" /> Pas Hakkı (Tur Başı)
                </div>
                <span className="text-brand-danger font-bold">{settings.passLimit === 0 ? "Sınırsız" : settings.passLimit}</span>
             </div>
             <div className="flex gap-2">
                {[0, 3, 5, 10].map(val => (
                  <button
                    key={val}
                    onClick={() => setSettings(prev => ({ ...prev, passLimit: val }))}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all ${
                      settings.passLimit === val 
                        ? 'bg-brand-danger text-white border-brand-danger' 
                        : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {val === 0 ? "∞" : val}
                  </button>
                ))}
             </div>
          </div>

        </section>
      </div>

      <div className="fixed bottom-0 left-0 w-full p-4 bg-slate-900 border-t border-slate-800">
        <button
          onClick={handleCreate}
          disabled={isLoading}
          className="w-full max-w-lg mx-auto block bg-brand-primary hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : "Oluştur"}
        </button>
      </div>
    </div>
  );
};

export default CreateRoomScreen;
