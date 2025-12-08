import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { GameState, Team, CardData, GameSettings, Player } from './types';
import { INITIAL_TEAMS, DEFAULT_SETTINGS } from './constants';
import { 
  getAllCardsRaw, 
  createRoom, 
  joinRoom, 
  leaveRoom, 
  getPlayersInRoom, 
  subscribeToRoom, 
  startNextTurn, 
  getRoomDetails,
  switchPlayerTeam,
  resetGame,
  updateRoomSettings,
  safeScorePoint,
  safeLosePoint,
  safePass,
  safeIncrementCard
} from './services/gameService';
import { supabase } from './supabaseClient';
import { Loader2 } from 'lucide-react';

import WelcomeScreen from './components/WelcomeScreen';
import LobbyScreen from './components/LobbyScreen';
import GameCard from './components/GameCard';
import ScoreBoard from './components/ScoreBoard';
import GameControls from './components/GameControls';
import GameOverScreen from './components/GameOverScreen';
import GameTimer from './components/GameTimer';

// --- YARDIMCI: Güvenli Storage Erişimi ---
const safeStorage = {
  getItem: (key: string) => {
    try { return sessionStorage.getItem(key); } catch (e) { return null; }
  },
  setItem: (key: string, value: string) => {
    try { sessionStorage.setItem(key, value); } catch (e) { }
  },
  removeItem: (key: string) => {
    try { sessionStorage.removeItem(key); } catch (e) { }
  }
};

function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.WELCOME);
  const [currentUser, setCurrentUser] = useState<Player | null>(null);
  
  const [allCardsMap, setAllCardsMap] = useState<Record<string, CardData>>({}); 
  const [activeDeck, setActiveDeck] = useState<CardData[]>([]); 
  
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [gameSettings, setGameSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [roomCode, setRoomCode] = useState<string>('');
  
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Synced State
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [passCount, setPassCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [turnExpiresAt, setTurnExpiresAt] = useState<string | null>(null);
  const [currentDeckOrderStr, setCurrentDeckOrderStr] = useState<string>(''); 
  
  // KİLİT MEKANİZMALARI
  const [isProcessingTurn, setIsProcessingTurn] = useState(false);
  const lastHandledTurnRef = useRef<string | null>(null);
  const [userManuallyReturnedToLobby, setUserManuallyReturnedToLobby] = useState(false);

  // REFS
  const lastActionTimeRef = useRef<number>(0);
  const gameStateRef = useRef(gameState);
  const currentCardIndexRef = useRef(currentCardIndex);
  const teamsRef = useRef(teams); 
  const currentUserRef = useRef(currentUser); 

  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { currentCardIndexRef.current = currentCardIndex; }, [currentCardIndex]);
  useEffect(() => { teamsRef.current = teams; }, [teams]);
  useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);

  const activeTeam = teams[currentTeamIndex];
  const currentNarrator = useMemo(() => {
    if (activeTeam.players.length === 0) return null;
    return activeTeam.players[activeTeam.currentNarratorIndex % activeTeam.players.length];
  }, [activeTeam]);
  const isMeNarrator = currentUser?.id === currentNarrator?.id;
  const isMyTeamActive = activeTeam.players.some(p => p.id === currentUser?.id);
  const shouldMaskCard = isMyTeamActive && !isMeNarrator;

  // --- BAŞLANGIÇ ---
  useEffect(() => {
    const initApp = async () => {
      try {
        const cards = await getAllCardsRaw();
        const map: Record<string, CardData> = {};
        cards.forEach(c => map[c.id] = c);
        setAllCardsMap(map);

        const savedSession = safeStorage.getItem('VETO_SESSION');
        if (savedSession) {
          const { roomCode: savedCode, user } = JSON.parse(savedSession);
          const roomData = await getRoomDetails(savedCode);
          if (roomData) {
             setRoomCode(savedCode);
             setCurrentUser(user);
             setGameState(GameState.LOBBY); 
             const players = await getPlayersInRoom(savedCode);
             if (!players.some(p => p.id === user.id)) {
                await joinRoom(savedCode, user.name, user.id);
             }
          } else {
             safeStorage.removeItem('VETO_SESSION');
          }
        }
      } catch (e) {
        console.error("Başlatma hatası", e);
        safeStorage.removeItem('VETO_SESSION');
      } finally {
        setIsRestoringSession(false);
      }
    };
    initApp();
  }, []);

  const saveSession = (code: string, user: Player) => {
    safeStorage.setItem('VETO_SESSION', JSON.stringify({ roomCode: code, user }));
  };

  const clearSession = () => {
    safeStorage.removeItem('VETO_SESSION');
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (roomCode && currentUser) {
        e.preventDefault();
        e.returnValue = ''; 
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [roomCode, currentUser]);


  // --- SETUP ACTIONS ---
  
  // 1. Oda Oluşturma
  const handleCreateRoom = useCallback(async (playerName: string) => {
    setIsLoading(true);
    const myId = `p_${Date.now()}`;
    const defaultTeamNames = { teamA: INITIAL_TEAMS[0].name, teamB: INITIAL_TEAMS[1].name };
    
    const code = await createRoom(playerName, myId, DEFAULT_SETTINGS, defaultTeamNames);
    
    if (code) {
      const hostUser = { id: myId, name: playerName, isHost: true };
      setCurrentUser(hostUser);
      setRoomCode(code);
      setGameSettings(DEFAULT_SETTINGS);
      setTeams(prev => { 
        const t = [...prev]; 
        t[0].players = [hostUser]; 
        t[1].players = []; 
        return t; 
      });
      setGameState(GameState.LOBBY);
      setUserManuallyReturnedToLobby(false);
      saveSession(code, hostUser);
    }
    setIsLoading(false);
  }, []);

  // 2. Odaya Direkt Katılma (GÜNCELLENDİ: Alert kaldırıldı, Promise<boolean> dönüyor)
  const handleJoinRoomDirect = useCallback(async (playerName: string, code: string): Promise<boolean> => {
    setIsLoading(true);
    const myId = `p_${Date.now()}`;
    const userToJoin = { id: myId, name: playerName, isHost: false };
    
    // Önce odaya katılmayı dene
    const result = await joinRoom(code, playerName, myId);
    
    setIsLoading(false);

    if (result === 'SUCCESS') {
      setCurrentUser(userToJoin);
      setRoomCode(code);
      setGameState(GameState.LOBBY);
      setUserManuallyReturnedToLobby(false);
      saveSession(code, userToJoin);
      return true;
    } else {
      return false;
    }
  }, []);

  const handleLeaveLobby = useCallback(async () => {
    if (roomCode && currentUser) await leaveRoom(roomCode, currentUser.id);
    setGameState(GameState.WELCOME);
    setCurrentUser(null);
    setRoomCode('');
    setUserManuallyReturnedToLobby(false);
    clearSession();
  }, [roomCode, currentUser]);

  const switchTeam = useCallback(async (teamId: 'A' | 'B') => {
    if (!currentUser) return;
    await switchPlayerTeam(currentUser.id, teamId);
  }, [currentUser]);

  const handleRestartGame = useCallback(async () => {
    if (!currentUser?.isHost) return;
    setIsLoading(true);
    await resetGame(roomCode);
    setGameState(GameState.LOBBY);
    setUserManuallyReturnedToLobby(false);
    setIsLoading(false);
  }, [roomCode, currentUser]);

  const handleReturnToLobby = useCallback(() => {
    setUserManuallyReturnedToLobby(true);
    setGameState(GameState.LOBBY);
  }, []);

  const handleUpdateSettings = useCallback(async (newSettings: GameSettings) => {
    setGameSettings(newSettings); 
    await updateRoomSettings(roomCode, newSettings);
  }, [roomCode]);

  // --- SYNC & REALTIME ---
  const syncData = useCallback(async () => {
    if (!roomCode) return;

    const players = await getPlayersInRoom(roomCode);
    const teamA = players.filter(p => p.team === 'A');
    const teamB = players.filter(p => p.team === 'B');
    const roomData = await getRoomDetails(roomCode);
    
    if (!roomData) return;

    setGameSettings({
      targetScore: roomData.target_score ?? DEFAULT_SETTINGS.targetScore,
      roundTime: roomData.round_time ?? DEFAULT_SETTINGS.roundTime,
      passLimit: roomData.pass_limit ?? DEFAULT_SETTINGS.passLimit
    });

    if (roomData.deck_order && Array.isArray(roomData.deck_order)) {
      const orderStr = JSON.stringify(roomData.deck_order);
      if (orderStr !== currentDeckOrderStr && Object.keys(allCardsMap).length > 0) {
          const sortedDeck = roomData.deck_order
              .map((id: string) => allCardsMap[id])
              .filter((c: CardData | undefined) => c !== undefined);
          
          setActiveDeck(sortedDeck);
          setCurrentDeckOrderStr(orderStr);
      }
    }

    const activeTeamIdFromDB = roomData.current_team;
    const teamIdx = activeTeamIdFromDB === 'A' ? 0 : 1;
    const teamPlayers = teamIdx === 0 ? teamA : teamB;
    const narratorIdx = teamIdx === 0 ? roomData.team_a_narrator_index : roomData.team_b_narrator_index;
    const activeNarrator = teamPlayers.length > 0 ? teamPlayers[narratorIdx % teamPlayers.length] : null;
    
    const amINarrator = currentUserRef.current?.id === activeNarrator?.id;
    const isNewTurn = turnExpiresAt !== roomData.turn_expires_at;

    if (amINarrator && !isNewTurn) {
        setTeams(prev => [
          { ...prev[0], name: roomData.team_a_name || prev[0].name, players: teamA }, 
          { ...prev[1], name: roomData.team_b_name || prev[1].name, players: teamB }
        ]);
    } else {
        setTeams(prev => [
          { ...prev[0], name: roomData.team_a_name || prev[0].name, players: teamA, score: roomData.team_a_score || 0, currentNarratorIndex: roomData.team_a_narrator_index || 0 },
          { ...prev[1], name: roomData.team_b_name || prev[1].name, players: teamB, score: roomData.team_b_score || 0, currentNarratorIndex: roomData.team_b_narrator_index || 0 }
        ]);
        setCurrentCardIndex(roomData.current_card_index || 0);
        setPassCount(roomData.pass_count || 0);
    }

    setCurrentTeamIndex(roomData.current_team === 'A' ? 0 : 1);
    
    if (isNewTurn) {
        setTurnExpiresAt(roomData.turn_expires_at);
        setIsProcessingTurn(false);
    }
    
    const serverStatus = roomData.status;
    if (serverStatus === 'LOBBY' && gameStateRef.current !== GameState.LOBBY) {
        setGameState(GameState.LOBBY);
        setUserManuallyReturnedToLobby(false);
    } 
    else if (serverStatus === 'PLAYING' && gameStateRef.current !== GameState.PLAYING) {
        setGameState(GameState.PLAYING);
        setUserManuallyReturnedToLobby(false);
    }
    else if (serverStatus === 'FINISHED' && gameStateRef.current !== GameState.GAME_OVER) {
        if (!userManuallyReturnedToLobby) {
            setGameState(GameState.GAME_OVER);
        }
    }
  }, [roomCode, allCardsMap, currentDeckOrderStr, turnExpiresAt]);

  useEffect(() => {
    if ((gameStateRef.current === GameState.WELCOME || gameStateRef.current === GameState.JOIN_ROOM) || !roomCode) return;
    
    syncData();
    const sub = subscribeToRoom(roomCode, () => { syncData(); });
    return () => { sub.unsubscribe(); };
  }, [roomCode, allCardsMap, syncData]); 

  // --- ACTIONS ---
  const handleNextTurn = useCallback(async () => {
     if (isProcessingTurn) return;
     setIsProcessingTurn(true);

     const currentTeams = teamsRef.current;
     const currentIdx = currentTeamIndex; 

     const nextTeam = currentIdx === 0 ? 'B' : 'A';
     const newIndexA = currentTeams[0].currentNarratorIndex + (currentIdx === 0 ? 1 : 0);
     const newIndexB = currentTeams[1].currentNarratorIndex + (currentIdx === 1 ? 1 : 0);
     
     setCurrentTeamIndex(currentIdx === 0 ? 1 : 0);
     
     await startNextTurn(roomCode, nextTeam, gameSettings.roundTime, { indexA: newIndexA, indexB: newIndexB });
     await safeIncrementCard(roomCode);
  }, [isProcessingTurn, currentTeamIndex, roomCode, gameSettings]);

  const handleTimeUp = useCallback(() => { 
    handleNextTurn(); 
  }, [handleNextTurn]);

  // --- ARKA PLAN FIX ---
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [syncData]);

  // --- TIMER ---
  useEffect(() => {
    if (gameState !== GameState.PLAYING || !turnExpiresAt) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(turnExpiresAt).getTime();
      const diff = Math.ceil((end - now) / 1000);
      
      if (diff <= 0) {
        setTimeLeft(0);
        
        const isTurnAlreadyHandled = lastHandledTurnRef.current === turnExpiresAt;
        
        if (currentUser?.isHost && !isTurnAlreadyHandled && !isProcessingTurn) { 
           lastHandledTurnRef.current = turnExpiresAt; 
           handleTimeUp(); 
        }
        else if (diff <= -2 && !isTurnAlreadyHandled && !isProcessingTurn) {
           lastHandledTurnRef.current = turnExpiresAt; 
           handleTimeUp();
        }

      } else {
        if (isProcessingTurn && diff > gameSettings.roundTime - 1) {
           setIsProcessingTurn(false);
        }
        setTimeLeft(Math.min(diff, gameSettings.roundTime));
      }
    }, 500);

    return () => clearInterval(interval);
  }, [turnExpiresAt, gameState, currentUser, isProcessingTurn, gameSettings.roundTime, handleTimeUp]);

  const startGame = useCallback(async () => {
    setIsLoading(true);
    await startNextTurn(roomCode, 'A', gameSettings.roundTime, undefined, true);
    setIsLoading(false);
  }, [roomCode, gameSettings]);

  const advanceCardOptimistically = () => {
    const deckLen = activeDeck.length > 0 ? activeDeck.length : 1;
    setCurrentCardIndex((prev) => (prev + 1) % deckLen);
    return deckLen;
  };

  const handleCorrect = async () => {
    const isTeamA = currentTeamIndex === 0;
    const teamKey = isTeamA ? 'A' : 'B';
    const newScore = teams[currentTeamIndex].score + 1;
    
    setTeams(prev => { const u = [...prev]; u[currentTeamIndex].score = newScore; return u; });
    advanceCardOptimistically(); 
    
    if (newScore >= gameSettings.targetScore) {
       await supabase.from('rooms').update({ status: 'FINISHED', [isTeamA ? 'team_a_score' : 'team_b_score']: newScore }).eq('code', roomCode);
    } else {
       await safeScorePoint(roomCode, teamKey);
    }
  };

  const handleTaboo = async () => {
    const isTeamA = currentTeamIndex === 0;
    const teamKey = isTeamA ? 'A' : 'B';
    const newScore = teams[currentTeamIndex].score - 1;

    setTeams(prev => { const u = [...prev]; u[currentTeamIndex].score = newScore; return u; });
    advanceCardOptimistically(); 
    
    await safeLosePoint(roomCode, teamKey);
  };

  const handlePass = async () => {
    if (gameSettings.passLimit > 0 && passCount >= gameSettings.passLimit) return;
    
    setPassCount(prev => prev + 1);
    advanceCardOptimistically(); 
    
    await safePass(roomCode);
  };

  if (isRestoringSession) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
         <Loader2 size={48} className="text-brand-primary animate-spin mb-4" />
         <h2 className="text-xl font-bold tracking-widest animate-pulse">OYUNA BAĞLANILIYOR...</h2>
      </div>
    );
  }

  // --- RENDER ---
  if (gameState === GameState.WELCOME) {
    return (
      <WelcomeScreen 
        onCreateRoom={handleCreateRoom} 
        onJoinRoom={handleJoinRoomDirect} 
        isJoining={isLoading}
      />
    );
  }
  
  if (gameState === GameState.LOBBY && currentUser) {
    return (
      <LobbyScreen 
        roomCode={roomCode} teams={teams} currentUser={currentUser} 
        settings={gameSettings} 
        onStartGame={startGame} onSwitchTeam={switchTeam} onLeave={handleLeaveLobby} 
        onUpdateSettings={handleUpdateSettings} 
        isHost={currentUser.isHost}
      />
    );
  }

  if (gameState === GameState.GAME_OVER) {
    return (
      <GameOverScreen 
        teams={teams} 
        onRestart={handleRestartGame} 
        onReturnToLobby={handleReturnToLobby} 
        onHome={handleLeaveLobby} 
        isHost={currentUser?.isHost ?? false} 
      />
    );
  }

  if (gameState === GameState.PLAYING) {
    const currentCard = activeDeck.length > 0 ? activeDeck[currentCardIndex] : null;
    let roleText = isMeNarrator ? "ANLATIYORSUN" : (isMyTeamActive ? "TAHMİN ET!" : "YASAK KONTROLÜ!");
    let roleColor = isMeNarrator 
      ? "text-brand-primary border-brand-primary/30 bg-brand-primary/10" 
      : (isMyTeamActive 
          ? "text-brand-secondary border-brand-secondary/30 bg-brand-secondary/10" 
          : "text-brand-danger border-brand-danger/30 bg-brand-danger/10"
        );

    return (
      <div className="h-[100dvh] w-full flex flex-col bg-slate-950 overflow-hidden relative font-sans">
        
        {/* --- ORTAK ARKA PLAN --- */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          {/* Takım Rengine Göre Parlama */}
          <div className={`absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full blur-[120px] opacity-30 transition-colors duration-700 ${currentTeamIndex === 0 ? 'bg-brand-secondary' : 'bg-brand-success'}`}></div>
        </div>

        {/* --- SCOREBOARD HEADER DIŞINDA --- */}
        <ScoreBoard teams={teams} currentTeamId={activeTeam.id} currentNarrator={currentNarrator} />

        {/* --- HEADER: Timer --- */}
        {/* z-50 ile ScoreBoard'un üzerinde kalır */}
        <div className="flex-shrink-0 w-full pt-4 px-4 z-50 relative">
           <GameTimer timeLeft={timeLeft} totalTime={gameSettings.roundTime} isActive={true} onTimeUp={() => {}} />
        </div>

        {/* --- ANA OYUN ALANI --- */}
        <div className="flex-1 relative w-full max-w-3xl mx-auto px-4 flex flex-col justify-center items-center min-h-0 z-20">
           
           {/* Rol Göstergesi */}
           <div className="mb-6 flex flex-col items-center flex-shrink-0 animate-fadeIn">
              <div className={`px-6 py-2 rounded-full border backdrop-blur-md text-xs md:text-sm font-black tracking-[0.3em] uppercase mb-2 shadow-lg transition-colors duration-500 ${roleColor}`}>
                {roleText}
              </div>
              {currentNarrator && (
                 <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-60">Anlatan</span>
                    <span className="text-white font-bold text-lg drop-shadow-md">{currentNarrator.name}</span>
                 </div>
              )}
           </div>

           {/* Kart Alanı */}
           <div className="w-full flex-1 flex flex-col justify-center min-h-0 max-h-[550px]">
              {isProcessingTurn || !currentCard ? (
                 <div className="animate-pulse text-center text-slate-500 flex flex-col items-center gap-4">
                    <div className="p-4 bg-slate-900/50 rounded-full border border-white/10 shadow-xl"><Loader2 className="animate-spin text-brand-primary" size={32} /></div>
                    <span className="text-xs font-bold uppercase tracking-widest">Hazırlanıyor...</span>
                 </div>
              ) : (
                 <GameCard card={currentCard} isMasked={shouldMaskCard} />
              )}
           </div>
        </div>

        {/* --- CONTROLS --- */}
        {isMeNarrator && !isProcessingTurn && (
          <div className="flex-shrink-0 w-full p-4 md:p-8 z-40 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent">
             <div className="max-w-xl mx-auto"><GameControls onCorrect={handleCorrect} onTaboo={handleTaboo} onPass={handlePass} passCount={passCount} passLimit={gameSettings.passLimit} /></div>
          </div>
        )}
      </div>
    );
  }
  return null;
}

export default App;