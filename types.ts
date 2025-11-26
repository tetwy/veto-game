export interface CardData {
  id: string;
  word: string;
  forbidden_words: string[];
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Player {
  id: string;
  name: string;
  avatarId?: number;
  isHost: boolean;
  team?: 'A' | 'B'; // <-- YENİ EKLENEN SATIR
}

export interface Team {
  id: 'A' | 'B';
  name: string;
  score: number;
  color: string;
  players: Player[];
  currentNarratorIndex: number;
}

export enum GameState {
  WELCOME = 'WELCOME',
  CREATE_ROOM = 'CREATE_ROOM',
  JOIN_ROOM = 'JOIN_ROOM',
  LOBBY = 'LOBBY',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  ROUND_OVER = 'ROUND_OVER',
  GAME_OVER = 'GAME_OVER'
}

export interface GameSettings {
  roundTime: number;
  targetScore: number;
  passLimit: number;
}