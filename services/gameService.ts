import { supabase } from '../supabaseClient';
import { CardData, Player, GameSettings } from '../types';

// --- YARDIMCI: Deterministik Rastgelelik (Seeded Random) ---
const cyrb128 = (str: string) => {
    let h1 = 1779033703, h2 = 3144134277,
        h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860223);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860223);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    return (h1^h2^h3^h4) >>> 0;
}

const mulberry32 = (a: number) => {
    return () => {
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
}

const shuffleWithSeed = <T>(array: T[], seed: string): T[] => {
    const seedNumber = cyrb128(seed);
    const random = mulberry32(seedNumber);
    const shuffled = [...array];
    
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
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

// DÜZELTME BURADA YAPILDI: .order('id')
// Artık herkes kartları aynı ham sırada alacak, sonra aynı şekilde karıştıracak.
export const getGameCards = async (roomCode: string): Promise<CardData[]> => {
  const { data } = await supabase
    .from('cards')
    .select('*')
    .order('id', { ascending: true }); // ÖNEMLİ: Sıralamayı sabitledik
    
  if (!data) return [];
  return shuffleWithSeed(data, roomCode) as CardData[];
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

export const createRoom = async (
  hostName: string, 
  hostId: string, 
  settings: GameSettings, 
  teamNames: { teamA: string, teamB: string }
): Promise<string | null> => {
  const code = generateRoomCode();
  
  const { error: roomError } = await supabase
    .from('rooms')
    .insert([{ 
       code, 
       status: 'LOBBY', 
       target_score: settings.targetScore,
       round_time: settings.roundTime,
       pass_limit: settings.passLimit,
       team_a_name: teamNames.teamA,
       team_b_name: teamNames.teamB
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

  const { data: players } = await supabase
    .from('players')
    .select('team')
    .eq('room_code', code);

  const countA = players?.filter(p => p.team === 'A').length || 0;
  const countB = players?.filter(p => p.team === 'B').length || 0;

  const assignedTeam = countA <= countB ? 'A' : 'B';
  
  const { error } = await supabase.from('players').insert([{
      id: playerId,
      room_code: code,
      name: playerName,
      is_host: false,
      team: assignedTeam 
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
    updateData.current_card_index = 0;
    updateData.team_a_narrator_index = 0;
    updateData.team_b_narrator_index = 0;
  }

  await supabase.from('rooms').update(updateData).eq('code', roomCode);
};

export const updateGameState = async (roomCode: string, updates: { 
  scoreA?: number, 
  scoreB?: number, 
  cardIndex?: number,
  passCount?: number 
}) => {
  const dbUpdates: any = {};
  if (updates.scoreA !== undefined) dbUpdates.team_a_score = updates.scoreA;
  if (updates.scoreB !== undefined) dbUpdates.team_b_score = updates.scoreB;
  if (updates.cardIndex !== undefined) dbUpdates.current_card_index = updates.cardIndex;
  if (updates.passCount !== undefined) dbUpdates.pass_count = updates.passCount;

  await supabase.from('rooms').update(dbUpdates).eq('code', roomCode);
};

export const resetGame = async (roomCode: string) => {
  await supabase.from('rooms').update({
    status: 'LOBBY',
    team_a_score: 0,
    team_b_score: 0,
    current_card_index: 0,
    pass_count: 0,
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