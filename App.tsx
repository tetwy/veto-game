import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { GameState, Team, CardData, GameSettings, Player } from './types';
import { INITIAL_TEAMS, DEFAULT_SETTINGS } from './constants';
import { 
  getAllCardsRaw, // GÜNCELLENDİ
  createRoom, 
  joinRoom, 
  leaveRoom, 
  getPlayersInRoom, 
  subscribeToRoom, 
  startNextTurn, 
  updateGameState, 
  getRoomDetails,
  switchPlayerTeam,
  resetGame,
  updateRoomSettings
} from './services/gameService';
import { supabase } from './supabaseClient';
import { Mic, Loader2 } from 'lucide-react';

import WelcomeScreen from './components/WelcomeScreen';
import JoinRoomScreen from './components/JoinRoomScreen';
import LobbyScreen from './components/LobbyScreen';
import GameCard from './components/GameCard';
import ScoreBoard from './components/ScoreBoard';
import GameControls from './components/GameControls';
import GameOverScreen from './components/GameOverScreen';
import GameTimer from './components/GameTimer';

function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.WELCOME);
  const [currentUser, setCurrentUser] = useState<Player | null>(null);
  
  // KART YÖNETİMİ
  const [allCardsMap, setAllCardsMap] = useState<Record<string, CardData>>({}); // ID -> Card Haritası
  const [activeDeck, setActiveDeck] = useState<CardData[]>([]); // O anki sıralı deste
  
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [gameSettings, setGameSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [roomCode, setRoomCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Synced State
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [passCount, setPassCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [turnExpiresAt, setTurnExpiresAt] = useState<string | null>(null);
  const [currentDeckOrderStr, setCurrentDeckOrderStr] = useState<string>(''); // Sıralama değişti mi kontrolü
  
  const [isProcessingTurn, setIsProcessingTurn] = useState(false);
  const lastHandledTurnRef = useRef<string | null>(null);
  const [userManuallyReturnedToLobby, setUserManuallyReturnedToLobby] = useState(false);

  const activeTeam = teams[currentTeamIndex];
  const currentNarrator = useMemo(() => {
    if (activeTeam.players.length === 0) return null;
    return activeTeam.players[activeTeam.currentNarratorIndex % activeTeam.players.length];
  }, [activeTeam]);
  const isMeNarrator = currentUser?.id === currentNarrator?.id;
  const isMyTeamActive = activeTeam.players.some(p => p.id === currentUser?.id);
  const shouldMaskCard = isMyTeamActive && !isMeNarrator;

  // --- 1. Başlangıçta Tüm Kartları Çek ve Haritala ---
  useEffect(() => {
    const fetchAllCards = async () => {
      const cards = await getAllCardsRaw();
      const map: Record<string, CardData> = {};
      cards.forEach(c => map[c.id] = c);
      setAllCardsMap(map);
    };
    fetchAllCards();
  }, []);

  // --- SETUP ACTIONS ---
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
      setTeams(prev => { const t = [...prev]; t[0].players = [hostUser]; t[1].players = []; return t; });
      setGameState(GameState.LOBBY);
      setUserManuallyReturnedToLobby(false);
    }
    setIsLoading(false);
  }, []);

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
      setUserManuallyReturnedToLobby(false);
    } else {
      alert("Hata: Oda bulunamadı.");
    }
    setIsLoading(false);
  }, [currentUser]);

  const handleLeaveLobby = useCallback(async () => {
    if (roomCode && currentUser) await leaveRoom(roomCode, currentUser.id);
    setGameState(GameState.WELCOME);
    setCurrentUser(null);
    setRoomCode('');
    setUserManuallyReturnedToLobby(false);
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
  useEffect(() => {
    if ((gameState !== GameState.WELCOME && gameState !== GameState.JOIN_ROOM) && roomCode) {
      const syncData = async () => {
        const players = await getPlayersInRoom(roomCode);
        const teamA = players.filter(p => p.team === 'A');
        const teamB = players.filter(p => p.team === 'B');
        const roomData = await getRoomDetails(roomCode);
        
        if (roomData) {
           setGameSettings({
             targetScore: roomData.target_score ?? DEFAULT_SETTINGS.targetScore,
             roundTime: roomData.round_time ?? DEFAULT_SETTINGS.roundTime,
             passLimit: roomData.pass_limit ?? DEFAULT_SETTINGS.passLimit
           });

           // YENİ: Deste Sırasını Kontrol Et ve Oluştur
           if (roomData.deck_order && Array.isArray(roomData.deck_order)) {
              const orderStr = JSON.stringify(roomData.deck_order);
              // Eğer veritabanındaki sıra değişmişse (Yeni oyun başladıysa)
              if (orderStr !== currentDeckOrderStr && Object.keys(allCardsMap).length > 0) {
                  const sortedDeck = roomData.deck_order
                      .map((id: string) => allCardsMap[id]) // ID'leri karta çevir
                      .filter((c: CardData | undefined) => c !== undefined); // Boşları at
                  
                  setActiveDeck(sortedDeck);
                  setCurrentDeckOrderStr(orderStr);
              }
           }
        }

        setTeams(prev => [
          { ...prev[0], name: roomData?.team_a_name || prev[0].name, players: teamA, score: roomData?.team_a_score || 0, currentNarratorIndex: roomData?.team_a_narrator_index || 0 },
          { ...prev[1], name: roomData?.team_b_name || prev[1].name, players: teamB, score: roomData?.team_b_score || 0, currentNarratorIndex: roomData?.team_b_narrator_index || 0 }
        ]);

        if (roomData) {
            setCurrentTeamIndex(roomData.current_team === 'A' ? 0 : 1);
            setCurrentCardIndex(roomData.current_card_index || 0);
            setPassCount(roomData.pass_count || 0);
            setTurnExpiresAt(roomData.turn_expires_at);
            setIsProcessingTurn(false);

            const serverStatus = roomData.status;
            if (serverStatus === 'LOBBY' && gameState !== GameState.LOBBY) {
                setGameState(GameState.LOBBY);
                setUserManuallyReturnedToLobby(false);
            } 
            else if (serverStatus === 'PLAYING' && gameState !== GameState.PLAYING) {
                setGameState(GameState.PLAYING);
                setUserManuallyReturnedToLobby(false);
            }
            else if (serverStatus === 'FINISHED' && gameState !== GameState.GAME_OVER) {
                if (!userManuallyReturnedToLobby) {
                    setGameState(GameState.GAME_OVER);
                }
            }
        }
      };
      syncData();
      const sub = subscribeToRoom(roomCode, () => syncData());
      const handleBeforeUnload = async () => { if (currentUser) await leaveRoom(roomCode, currentUser.id); };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => { sub.unsubscribe(); window.removeEventListener('beforeunload', handleBeforeUnload); };
    }
  }, [gameState, roomCode, currentUser, allCardsMap, currentDeckOrderStr, userManuallyReturnedToLobby]);

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
      } else {
        setTimeLeft(Math.min(diff, gameSettings.roundTime));
      }
    }, 250);
    return () => clearInterval(interval);
  }, [turnExpiresAt, gameState, currentUser, isProcessingTurn, gameSettings.roundTime]);

  // --- ACTIONS ---
  const startGame = useCallback(async () => {
    setIsLoading(true);
    // Kart çekme işlemi artık LOBBY'de veya oluşturulurken yapılıyor ve sync ile geliyor
    await startNextTurn(roomCode, 'A', gameSettings.roundTime, undefined, true);
    setIsLoading(false);
  }, [roomCode, gameSettings]);

  const handleNextTurn = async () => {
     if (isProcessingTurn) return;
     setIsProcessingTurn(true);
     const nextTeam = currentTeamIndex === 0 ? 'B' : 'A';
     const newIndexA = teams[0].currentNarratorIndex + (currentTeamIndex === 0 ? 1 : 0);
     const newIndexB = teams[1].currentNarratorIndex + (currentTeamIndex === 1 ? 1 : 0);
     setCurrentTeamIndex(currentTeamIndex === 0 ? 1 : 0);
     setTimeLeft(gameSettings.roundTime); 
     await startNextTurn(roomCode, nextTeam, gameSettings.roundTime, { indexA: newIndexA, indexB: newIndexB });
     await updateGameState(roomCode, { cardIndex: (currentCardIndex + 1) % activeDeck.length });
  };

  const handleTimeUp = useCallback(() => { handleNextTurn(); }, [handleNextTurn]);

  const handleCorrect = async () => {
    const isTeamA = currentTeamIndex === 0;
    const newScore = teams[currentTeamIndex].score + 1;
    setTeams(prev => { const u = [...prev]; u[currentTeamIndex].score = newScore; return u; });
    setCurrentCardIndex((prev) => (prev + 1) % activeDeck.length);
    if (newScore >= gameSettings.targetScore) {
       await supabase.from('rooms').update({ status: 'FINISHED', [isTeamA ? 'team_a_score' : 'team_b_score']: newScore }).eq('code', roomCode);
    } else {
       await updateGameState(roomCode, { scoreA: isTeamA ? newScore : undefined, scoreB: !isTeamA ? newScore : undefined, cardIndex: (currentCardIndex + 1) % activeDeck.length });
    }
  };

  const handleTaboo = async () => {
    const isTeamA = currentTeamIndex === 0;
    const newScore = teams[currentTeamIndex].score - 1;
    setTeams(prev => { const u = [...prev]; u[currentTeamIndex].score = newScore; return u; });
    setCurrentCardIndex((prev) => (prev + 1) % activeDeck.length);
    await updateGameState(roomCode, { scoreA: isTeamA ? newScore : undefined, scoreB: !isTeamA ? newScore : undefined, cardIndex: (currentCardIndex + 1) % activeDeck.length });
  };

  const handlePass = async () => {
    if (gameSettings.passLimit > 0 && passCount >= gameSettings.passLimit) return;
    setPassCount(prev => prev + 1);
    setCurrentCardIndex((prev) => (prev + 1) % activeDeck.length);
    await updateGameState(roomCode, { passCount: passCount + 1, cardIndex: (currentCardIndex + 1) % activeDeck.length });
  };

  // --- RENDER ---
  if (gameState === GameState.WELCOME) return <WelcomeScreen onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoomInit} />;
  if (gameState === GameState.JOIN_ROOM) return <JoinRoomScreen onBack={() => setGameState(GameState.WELCOME)} onJoin={handleJoinRoomSubmit} isLoading={isLoading} />;
  if (gameState === GameState.LOBBY && currentUser) return <LobbyScreen roomCode={roomCode} teams={teams} currentUser={currentUser} settings={gameSettings} onStartGame={startGame} onSwitchTeam={switchTeam} onLeave={handleLeaveLobby} onUpdateSettings={handleUpdateSettings} isHost={currentUser.isHost} />;
  if (gameState === GameState.GAME_OVER) return <GameOverScreen teams={teams} onRestart={handleRestartGame} onReturnToLobby={handleReturnToLobby} onHome={handleLeaveLobby} isHost={currentUser?.isHost ?? false} />;

  if (gameState === GameState.PLAYING) {
    const currentCard = activeDeck[currentCardIndex]; // ARTIK activeDeck'ten ÇEKİYOR
    let roleText = isMeNarrator ? "ANLATIYORSUN" : (isMyTeamActive ? "TAHMİN ET!" : "YASAK KONTROLÜ!");
    let roleColor = isMeNarrator ? "text-brand-primary" : (isMyTeamActive ? "text-brand-secondary" : "text-brand-danger");

    return (
      <div className="h-[100dvh] w-full flex flex-col bg-slate-900 overflow-hidden relative">
        <div className={`absolute top-0 left-0 w-full h-1 z-50 bg-gradient-to-r transition-all duration-500 ${currentTeamIndex === 0 ? 'from-brand-primary to-transparent' : 'from-transparent to-brand-success'}`}></div>
        <div className="flex-shrink-0 w-full pt-4 px-4 z-30">
           <GameTimer timeLeft={timeLeft} totalTime={gameSettings.roundTime} isActive={true} onTimeUp={() => {}} />
           <div className="max-w-5xl mx-auto"><ScoreBoard teams={teams} currentTeamId={activeTeam.id} currentNarrator={currentNarrator} /></div>
        </div>
        <div className="flex-1 relative w-full max-w-3xl mx-auto px-4 flex flex-col justify-center items-center min-h-0 z-20">
           <div className="mb-4 flex flex-col items-center flex-shrink-0 animate-fadeIn">
              <div className={`px-4 py-1 rounded-full bg-slate-800 border border-slate-700 text-[10px] md:text-xs font-black tracking-[0.2em] uppercase mb-2 shadow-lg ${roleColor}`}>{roleText}</div>
              {currentNarrator && (
                 <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-widest">Anlatan:</span>
                    <span className="text-white font-bold text-lg shadow-purple-500/20 drop-shadow-md">{currentNarrator.name}</span>
                 </div>
              )}
           </div>
           <div className="w-full flex-1 flex flex-col justify-center min-h-0 max-h-[600px]">
              {isProcessingTurn ? (
                 <div className="animate-pulse text-center text-slate-500 flex flex-col items-center gap-4">
                    <div className="p-4 bg-slate-800 rounded-full border border-slate-700"><Loader2 className="animate-spin text-brand-primary" size={32} /></div>
                    <span className="text-xs font-bold uppercase tracking-widest">Hazırlanıyor...</span>
                 </div>
              ) : (
                 currentCard && <GameCard card={currentCard} isMasked={shouldMaskCard} />
              )}
           </div>
        </div>
        {isMeNarrator && !isProcessingTurn && (
          <div className="flex-shrink-0 w-full p-4 md:p-6 z-40 bg-gradient-to-t from-slate-900 via-slate-900/90 to-transparent">
             <div className="max-w-xl mx-auto"><GameControls onCorrect={handleCorrect} onTaboo={handleTaboo} onPass={handlePass} passCount={passCount} passLimit={gameSettings.passLimit} /></div>
          </div>
        )}
      </div>
    );
  }
  return null;
}

export default App;