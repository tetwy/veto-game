import { supabase } from '../supabaseClient';
import { CardData, Player, GameSettings } from '../types';

// --- YARDIMCI: Gerçek Karıştırma (Fisher-Yates Shuffle) ---
// Bu sefer seed yok, tamamen rastgele karıştırır.
const shuffleArray = <T>(array: T[]): T[] => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

// --- SERVİS FONKSİYONLARI ---

const generateRoomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// 1. Tüm kartları ham olarak çeker (Sıralama yapmaz)
export const getAllCardsRaw = async (): Promise<CardData[]> => {
  const { data } = await supabase.from('cards').select('*');
  return (data as CardData[]) || [];
};

// 2. Kart ID'lerini alır, karıştırır ve bir liste olarak döndürür
export const generateNewDeckOrder = async (): Promise<string[]> => {
  const cards = await getAllCardsRaw();
  const ids = cards.map(c => c.id);
  return shuffleArray(ids);
};

export const getPlayersInRoom = async (roomCode: string): Promise<Player[]> => {
  const { data } = await supabase.from('players').select('*').eq('room_code', roomCode);
  return data?.map(p => ({
    id: p.id,
    name: p.name,
    isHost: p.is_host,
    team: p.team, 
    ...p
  })) as Player[] || [];
};

export const getRoomDetails = async (roomCode: string) => {
  const { data } = await supabase.from('rooms').select('*').eq('code', roomCode).single();
  return data;
};

// GÜNCELLENDİ: Odayı kurarken desteyi karıştırıp kaydeder
export const createRoom = async (
  hostName: string, 
  hostId: string, 
  settings: GameSettings,
  teamNames: { teamA: string, teamB: string }
): Promise<string | null> => {
  const code = generateRoomCode();
  
  // ÖNEMLİ: Yeni bir deste sırası oluştur
  const initialDeckOrder = await generateNewDeckOrder();
  
  const { error: roomError } = await supabase
    .from('rooms')
    .insert([{ 
       code, 
       status: 'LOBBY', 
       target_score: settings.targetScore,
       round_time: settings.roundTime,
       pass_limit: settings.passLimit,
       team_a_name: teamNames.teamA,
       team_b_name: teamNames.teamB,
       deck_order: initialDeckOrder // Desteyi kaydet
    }]);

  if (roomError) {
    console.error(roomError);
    return null;
  }

  await supabase.from('players').insert([{
      id: hostId,
      room_code: code,
      name: hostName,
      is_host: true,
      team: 'A'
    }]);
  return code;
};

export const joinRoom = async (code: string, playerName: string, playerId: string): Promise<'SUCCESS' | 'NOT_FOUND' | 'ERROR'> => {
  const { data: room } = await supabase.from('rooms').select('code').eq('code', code).single();
  if (!room) return 'NOT_FOUND';

  const { data: players } = await supabase.from('players').select('team').eq('room_code', code);
  const countA = players?.filter(p => p.team === 'A').length || 0;
  const countB = players?.filter(p => p.team === 'B').length || 0;
  const assignedTeam = countA <= countB ? 'A' : 'B';
  
  const { error } = await supabase.from('players').insert([{
      id: playerId, room_code: code, name: playerName, is_host: false, team: assignedTeam 
    }]);
  return error ? 'ERROR' : 'SUCCESS';
};

export const switchPlayerTeam = async (playerId: string, newTeam: 'A' | 'B') => {
  await supabase.from('players').update({ team: newTeam }).eq('id', playerId);
};

export const leaveRoom = async (roomCode: string, playerId: string) => {
  await supabase.from('players').delete().eq('id', playerId);
  const { count } = await supabase.from('players').select('*', { count: 'exact', head: true }).eq('room_code', roomCode);
  if (count === 0) {
    await supabase.from('rooms').delete().eq('code', roomCode);
  }
};

export const startNextTurn = async (
  roomCode: string, 
  nextTeam: 'A' | 'B', 
  roundTime: number, 
  newNarratorIndices?: { indexA: number, indexB: number },
  isGameStart = false
) => {
  const bufferTime = 2000; 
  const expiresAt = new Date(Date.now() + (roundTime * 1000) + bufferTime).toISOString();
  
  const updateData: any = {
    current_team: nextTeam,
    pass_count: 0,
    turn_expires_at: expiresAt,
  };

  if (newNarratorIndices) {
    updateData.team_a_narrator_index = newNarratorIndices.indexA;
    updateData.team_b_narrator_index = newNarratorIndices.indexB;
  }

  if (isGameStart) {
    updateData.status = 'PLAYING';
    updateData.team_a_score = 0;
    updateData.team_b_score = 0;
    updateData.current_card_index = 0; // Her zaman 0'dan başlar (ama deste sırası farklıdır)
    updateData.team_a_narrator_index = 0;
    updateData.team_b_narrator_index = 0;
  }

  await supabase.from('rooms').update(updateData).eq('code', roomCode);
};

export const updateGameState = async (roomCode: string, updates: { 
  scoreA?: number, scoreB?: number, cardIndex?: number, passCount?: number 
}) => {
  const dbUpdates: any = {};
  if (updates.scoreA !== undefined) dbUpdates.team_a_score = updates.scoreA;
  if (updates.scoreB !== undefined) dbUpdates.team_b_score = updates.scoreB;
  if (updates.cardIndex !== undefined) dbUpdates.current_card_index = updates.cardIndex;
  if (updates.passCount !== undefined) dbUpdates.pass_count = updates.passCount;

  await supabase.from('rooms').update(dbUpdates).eq('code', roomCode);
};

// GÜNCELLENDİ: Reset atarken desteyi YENİDEN KARIŞTIRIR
export const resetGame = async (roomCode: string) => {
  const newDeckOrder = await generateNewDeckOrder();
  
  await supabase.from('rooms').update({
    status: 'LOBBY',
    team_a_score: 0,
    team_b_score: 0,
    current_card_index: 0,
    pass_count: 0,
    deck_order: newDeckOrder // Yeni sırayı kaydet
  }).eq('code', roomCode);
};

export const updateRoomSettings = async (roomCode: string, settings: GameSettings) => {
  await supabase.from('rooms').update({
    round_time: settings.roundTime,
    target_score: settings.targetScore,
    pass_limit: settings.passLimit
  }).eq('code', roomCode);
};

export const subscribeToRoom = (roomCode: string, onUpdate: (payload: any) => void) => {
  const channel = supabase.channel(`room_channel_${roomCode}`);
  channel.on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `room_code=eq.${roomCode}` }, onUpdate);
  channel.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `code=eq.${roomCode}` }, onUpdate);
  return channel.subscribe();
};

// YENİ: Güvenli Kart İlerletme
export const safeIncrementCard = async (roomCode: string) => {
  await supabase.rpc('increment_card_index', { room_code: roomCode, amount: 1 });
};

// YENİ: Güvenli Skor Artırma (Doğru)
export const safeScorePoint = async (roomCode: string, team: 'A' | 'B') => {
  if (team === 'A') {
    await supabase.rpc('increment_score_a', { room_code: roomCode, amount: 1 });
  } else {
    await supabase.rpc('increment_score_b', { room_code: roomCode, amount: 1 });
  }
  // Skoru artırırken kartı da ilerlet
  await safeIncrementCard(roomCode);
};

// YENİ: Güvenli Skor Düşürme (Yasak)
export const safeLosePoint = async (roomCode: string, team: 'A' | 'B') => {
  if (team === 'A') {
    await supabase.rpc('increment_score_a', { room_code: roomCode, amount: -1 });
  } else {
    await supabase.rpc('increment_score_b', { room_code: roomCode, amount: -1 });
  }
  await safeIncrementCard(roomCode);
};

// YENİ: Güvenli Pas
export const safePass = async (roomCode: string) => {
  await supabase.rpc('increment_pass', { room_code: roomCode });
  await safeIncrementCard(roomCode);
};