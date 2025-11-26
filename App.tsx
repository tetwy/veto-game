import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GameState, Team, CardData, GameSettings, Player } from './types';
import { INITIAL_TEAMS, DEFAULT_SETTINGS } from './constants';
import { 
  getGameCards, 
  createRoom, 
  joinRoom, 
  leaveRoom, 
  getPlayersInRoom, 
  subscribeToRoom, 
  startNextTurn, 
  updateGameState, 
  getRoomDetails,
  switchPlayerTeam 
} from './services/gameService';
import { supabase } from './supabaseClient';
import { Mic } from 'lucide-react';

import WelcomeScreen from './components/WelcomeScreen';
import CreateRoomScreen from './components/CreateRoomScreen';
import JoinRoomScreen from './components/JoinRoomScreen';
import LobbyScreen from './components/LobbyScreen';
import GameCard from './components/GameCard';
import ScoreBoard from './components/ScoreBoard';
import GameControls from './components/GameControls';
import GameTimer from './components/GameTimer';
import GameOverScreen from './components/GameOverScreen';

function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.WELCOME);
  const [currentUser, setCurrentUser] = useState<Player | null>(null);
  const [cards, setCards] = useState<CardData[]>([]);
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [gameSettings, setGameSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [roomCode, setRoomCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Synced State
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0); // 0=A, 1=B
  const [passCount, setPassCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [turnExpiresAt, setTurnExpiresAt] = useState<string | null>(null);

  // Computed Properties
  const activeTeam = teams[currentTeamIndex];
  
  const currentNarrator = useMemo(() => {
    if (activeTeam.players.length === 0) return null;
    return activeTeam.players[activeTeam.currentNarratorIndex % activeTeam.players.length];
  }, [activeTeam]);

  const isMeNarrator = currentUser?.id === currentNarrator?.id;
  const isMyTeamActive = activeTeam.players.some(p => p.id === currentUser?.id);
  const shouldMaskCard = isMyTeamActive && !isMeNarrator;

  // --- SETUP & LOBBY ---

  const handleCreateRoomInit = useCallback((playerName: string) => {
    const myId = `p_${Date.now()}`;
    setCurrentUser({ id: myId, name: playerName, isHost: true });
    setGameState(GameState.CREATE_ROOM);
  }, []);

  const handleConfirmRoom = useCallback(async (settings: GameSettings, initialTeams: Team[]) => {
    if (!currentUser) return;
    setIsLoading(true);
    
    // Ayarların tamamını gönderiyoruz
    const code = await createRoom(currentUser.name, currentUser.id, settings);
    
    if (code) {
      setRoomCode(code);
      setGameSettings(settings);
      setTeams(prev => {
         const t = [...prev];
         t[0].players = [currentUser];
         t[1].players = [];
         return t;
      });
      setGameState(GameState.LOBBY);
    }
    setIsLoading(false);
  }, [currentUser]);

  const handleJoinRoomInit = useCallback((playerName: string) => {
    const myId = `p_${Date.now()}`;
    setCurrentUser({ id: myId, name: playerName, isHost: false });
    setGameState(GameState.JOIN_ROOM);
  }, []);

  const handleJoinRoomSubmit = useCallback(async (code: string) => {
    if (!currentUser) return;
    setIsLoading(true);
    const result = await joinRoom(code, currentUser.name, currentUser.id);
    if (result === 'SUCCESS') {
      setRoomCode(code);
      setGameState(GameState.LOBBY);
    } else {
      alert("Hata: Oda bulunamadı.");
    }
    setIsLoading(false);
  }, [currentUser]);

  const handleLeaveLobby = useCallback(async () => {
    if (roomCode && currentUser) {
      await leaveRoom(roomCode, currentUser.id);
    }
    setGameState(GameState.WELCOME);
    setCurrentUser(null);
    setRoomCode('');
  }, [roomCode, currentUser]);

  const switchTeam = useCallback(async (teamId: 'A' | 'B') => {
    if (!currentUser) return;
    await switchPlayerTeam(currentUser.id, teamId);
  }, [currentUser]);

  // --- SYNC & REALTIME ---

  useEffect(() => {
    if ((gameState === GameState.LOBBY || gameState === GameState.PLAYING) && roomCode) {
      
      const syncData = async () => {
        const players = await getPlayersInRoom(roomCode);
        const teamA = players.filter(p => p.team === 'A');
        const teamB = players.filter(p => p.team === 'B');

        const roomData = await getRoomDetails(roomCode);
        
        // Ayarları Eşitle
        if (roomData) {
           setGameSettings({
             targetScore: roomData.target_score ?? DEFAULT_SETTINGS.targetScore,
             roundTime: roomData.round_time ?? DEFAULT_SETTINGS.roundTime,
             passLimit: roomData.pass_limit ?? DEFAULT_SETTINGS.passLimit
           });
        }

        setTeams(prev => [
          { 
            ...prev[0], 
            players: teamA, 
            score: roomData?.team_a_score || 0,
            currentNarratorIndex: roomData?.team_a_narrator_index || 0 
          },
          { 
            ...prev[1], 
            players: teamB, 
            score: roomData?.team_b_score || 0,
            currentNarratorIndex: roomData?.team_b_narrator_index || 0
          }
        ]);

        if (roomData) {
            setCurrentTeamIndex(roomData.current_team === 'A' ? 0 : 1);
            setCurrentCardIndex(roomData.current_card_index || 0);
            setPassCount(roomData.pass_count || 0);
            setTurnExpiresAt(roomData.turn_expires_at);

            if (roomData.status === 'PLAYING' && gameState === GameState.LOBBY) {
                if (cards.length === 0) {
                    // Seed'li kart çekimi (Herkes aynı kartı görsün)
                    const c = await getGameCards(roomCode);
                    setCards(c);
                }
                setGameState(GameState.PLAYING);
            }
            
            if (roomData.status === 'FINISHED') {
                setGameState(GameState.GAME_OVER);
            }
        }
      };

      syncData();

      const subscription = subscribeToRoom(roomCode, (payload) => {
        syncData();
      });

      const handleBeforeUnload = async () => {
         if (currentUser) await leaveRoom(roomCode, currentUser.id);
      };
      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        subscription.unsubscribe();
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [gameState, roomCode, currentUser, cards.length]);

  // --- TIMER LOGIC ---
  useEffect(() => {
    if (gameState !== GameState.PLAYING || !turnExpiresAt) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(turnExpiresAt).getTime();
      const diff = Math.ceil((end - now) / 1000);

      if (diff <= 0) {
        setTimeLeft(0);
        if (currentUser?.isHost && diff > -2) { 
           handleTimeUp(); 
        }
      } else {
        setTimeLeft(diff);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [turnExpiresAt, gameState, currentUser]);

  // --- GAME ACTIONS (OPTIMISTIC UI - HIZLANDIRILMIŞ) ---

  const startGame = useCallback(async () => {
    setIsLoading(true);
    const fetchedCards = await getGameCards(roomCode); 
    setCards(fetchedCards);
    await startNextTurn(roomCode, 'A', gameSettings.roundTime, undefined, true);
    setIsLoading(false);
  }, [roomCode, gameSettings]);

  const handleNextTurn = async () => {
     const nextTeam = currentTeamIndex === 0 ? 'B' : 'A';
     const newIndexA = teams[0].currentNarratorIndex + (currentTeamIndex === 0 ? 1 : 0);
     const newIndexB = teams[1].currentNarratorIndex + (currentTeamIndex === 1 ? 1 : 0);

     // 1. ANINDA GÖRÜNTÜ (Optimistic Update)
     setCurrentTeamIndex(currentTeamIndex === 0 ? 1 : 0);
     setTeams(prev => {
        const newTeams = [...prev];
        newTeams[currentTeamIndex].currentNarratorIndex += 1;
        return newTeams;
     });
     setCurrentCardIndex((prev) => (prev + 1) % cards.length);
     setTimeLeft(gameSettings.roundTime); // Görsel reset

     // 2. ARKA PLANDA GÖNDER
     await startNextTurn(roomCode, nextTeam, gameSettings.roundTime, {
       indexA: newIndexA,
       indexB: newIndexB
     });
     await updateGameState(roomCode, { cardIndex: (currentCardIndex + 1) % cards.length });
  };

  const handleTimeUp = useCallback(() => {
    handleNextTurn();
  }, [currentTeamIndex, currentCardIndex, cards.length, roomCode]);

  const handleCorrect = async () => {
    const isTeamA = currentTeamIndex === 0;
    const newScore = teams[currentTeamIndex].score + 1;

    // 1. ANINDA GÖRÜNTÜ
    setTeams(prev => {
      const updated = [...prev];
      updated[currentTeamIndex].score = newScore;
      return updated;
    });
    setCurrentCardIndex((prev) => (prev + 1) % cards.length);

    // 2. ARKA PLANDA GÖNDER (Bitiş Kontrolü Dahil)
    if (newScore >= gameSettings.targetScore) {
       await supabase.from('rooms').update({ 
          status: 'FINISHED',
          [isTeamA ? 'team_a_score' : 'team_b_score']: newScore
       }).eq('code', roomCode);
    } else {
       await updateGameState(roomCode, { 
          scoreA: isTeamA ? newScore : undefined,
          scoreB: !isTeamA ? newScore : undefined,
          cardIndex: (currentCardIndex + 1) % cards.length
       });
    }
  };

  const handleTaboo = async () => {
    const isTeamA = currentTeamIndex === 0;
    const newScore = teams[currentTeamIndex].score - 1;

    // 1. ANINDA GÖRÜNTÜ
    setTeams(prev => {
      const updated = [...prev];
      updated[currentTeamIndex].score = newScore;
      return updated;
    });
    setCurrentCardIndex((prev) => (prev + 1) % cards.length);

    // 2. ARKA PLANDA GÖNDER
    await updateGameState(roomCode, { 
        scoreA: isTeamA ? newScore : undefined,
        scoreB: !isTeamA ? newScore : undefined,
        cardIndex: (currentCardIndex + 1) % cards.length
    });
  };

  const handlePass = async () => {
    if (gameSettings.passLimit > 0 && passCount >= gameSettings.passLimit) return;
    
    // 1. ANINDA GÖRÜNTÜ
    setPassCount(prev => prev + 1);
    setCurrentCardIndex((prev) => (prev + 1) % cards.length);

    // 2. ARKA PLANDA GÖNDER
    await updateGameState(roomCode, { 
        passCount: passCount + 1,
        cardIndex: (currentCardIndex + 1) % cards.length
    });
  };

  // --- RENDER ---

  if (gameState === GameState.WELCOME) return <WelcomeScreen onCreateRoom={handleCreateRoomInit} onJoinRoom={handleJoinRoomInit} />;
  if (gameState === GameState.CREATE_ROOM) return <CreateRoomScreen onBack={() => setGameState(GameState.WELCOME)} onConfirm={handleConfirmRoom} isLoading={isLoading} />;
  if (gameState === GameState.JOIN_ROOM) return <JoinRoomScreen onBack={() => setGameState(GameState.WELCOME)} onJoin={handleJoinRoomSubmit} isLoading={isLoading} />;
  
  if (gameState === GameState.LOBBY && currentUser) {
    return (
      <LobbyScreen 
        roomCode={roomCode} teams={teams} currentUser={currentUser} settings={gameSettings}
        onStartGame={startGame} onSwitchTeam={switchTeam} onLeave={handleLeaveLobby} isHost={currentUser.isHost}
      />
    );
  }

  if (gameState === GameState.GAME_OVER) {
    return <GameOverScreen teams={teams} onRestart={startGame} onHome={handleLeaveLobby} />;
  }

  if (gameState === GameState.PLAYING) {
    const currentCard = cards[currentCardIndex];
    let roleText = isMeNarrator ? "ANLATIYORSUN" : (isMyTeamActive ? "TAHMİN ET!" : "YASAK KONTROLÜ!");
    let roleColor = isMeNarrator ? "text-brand-primary" : (isMyTeamActive ? "text-brand-secondary" : "text-brand-danger");

    return (
      <div className="min-h-screen flex flex-col items-center bg-slate-900 relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${currentTeamIndex === 0 ? 'from-brand-primary to-transparent' : 'from-transparent to-brand-success'}`}></div>
        
        <div className="w-full pt-4 px-4 z-20">
          <GameTimer timeLeft={timeLeft} totalTime={gameSettings.roundTime} isActive={true} onTimeUp={() => {}} />
        </div>

        <ScoreBoard teams={teams} currentTeamId={activeTeam.id} currentNarrator={currentNarrator} />

        <div className="flex-1 w-full max-w-md flex flex-col items-center justify-center p-4 z-10 -mt-10">
          <div className="mb-6 flex flex-col items-center animate-[fadeIn_0.5s_ease-out]">
            <div className={`px-4 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold tracking-widest uppercase mb-2 ${roleColor}`}>
              {roleText}
            </div>
            {currentNarrator && (
              <div className="flex items-center gap-2 text-slate-300">
                 <div className="p-2 bg-slate-800 rounded-full"><Mic size={16} className="text-white animate-pulse" /></div>
                 <span className="font-bold text-lg">{currentNarrator.name}</span>
              </div>
            )}
          </div>

          {currentCard && <GameCard card={currentCard} isMasked={shouldMaskCard} />}
        </div>

        {isMeNarrator && (
          <GameControls 
            onCorrect={handleCorrect} onTaboo={handleTaboo} onPass={handlePass}
            passCount={passCount} passLimit={gameSettings.passLimit}
          />
        )}
      </div>
    );
  }

  return null;
}

export default App;