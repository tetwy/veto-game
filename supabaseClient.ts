import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL ve Key bilgisi .env dosyasında bulunamadı!');
}

const memoryStorage = {
  getItem: (key: string) => {
    return null;
  },
  setItem: (key: string, value: string) => {
    // Hiçbir şey yapma (Diske yazma)
  },
  removeItem: (key: string) => {
    // Hiçbir şey yapma
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
    storage: memoryStorage,
  },
  global: {
    headers: { 'x-my-custom-header': 'veto-game' },
  },
});