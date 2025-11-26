
import { CardData, Team, GameSettings } from './types';

// Bu veri seti, ileride Supabase'den çekilecek 'cards' tablosunu temsil eder.
export const MOCK_CARDS: CardData[] = [
  {
    id: '1',
    word: 'İNTERNET',
    forbidden_words: ['Bilgisayar', 'Ağ', 'Wifi', 'Web', 'Bağlantı'],
    category: 'Teknoloji',
    difficulty: 'easy'
  },
  {
    id: '2',
    word: 'FUTBOL',
    forbidden_words: ['Top', 'Kale', 'Gol', 'Maç', 'Penaltı'],
    category: 'Spor',
    difficulty: 'easy'
  },
  {
    id: '3',
    word: 'PİRAMİT',
    forbidden_words: ['Mısır', 'Firavun', 'Üçgen', 'Mezar', 'Mumya'],
    category: 'Tarih',
    difficulty: 'medium'
  },
  {
    id: '4',
    word: 'HAMBURGER',
    forbidden_words: ['Fast Food', 'Köfte', 'Ekmek', 'Patates', 'Ketçap'],
    category: 'Yemek',
    difficulty: 'easy'
  },
  {
    id: '5',
    word: 'ASTRONOT',
    forbidden_words: ['Uzay', 'Ay', 'Nasa', 'Roket', 'Elbise'],
    category: 'Meslek',
    difficulty: 'medium'
  },
  {
    id: '6',
    word: 'OKUL',
    forbidden_words: ['Öğrenci', 'Öğretmen', 'Sınıf', 'Ders', 'Teneffüs'],
    category: 'Eğitim',
    difficulty: 'easy'
  },
  {
    id: '7',
    word: 'SİNEMA',
    forbidden_words: ['Film', 'Beyaz Perde', 'Oyuncu', 'Salon', 'Patlamış Mısır'],
    category: 'Sanat',
    difficulty: 'easy'
  },
  {
    id: '8',
    word: 'DOKTOR',
    forbidden_words: ['Hastane', 'Hasta', 'Reçete', 'İlaç', 'Hemşire'],
    category: 'Meslek',
    difficulty: 'easy'
  },
  {
    id: '9',
    word: 'KÜTÜPHANE',
    forbidden_words: ['Kitap', 'Sessiz', 'Okumak', 'Raf', 'Ödünç'],
    category: 'Eğitim',
    difficulty: 'medium'
  },
  {
    id: '10',
    word: 'PENGUEN',
    forbidden_words: ['Kutup', 'Buz', 'Kuş', 'Soğuk', 'Güney'],
    category: 'Hayvanlar',
    difficulty: 'medium'
  },
  {
    id: '11',
    word: 'SELFIE',
    forbidden_words: ['Fotoğraf', 'Çekmek', 'Kamera', 'Telefon', 'Özçekim'],
    category: 'Teknoloji',
    difficulty: 'easy'
  },
  {
    id: '12',
    word: 'KAHVE',
    forbidden_words: ['Kafein', 'Sıcak', 'Fincan', 'Sabah', 'Çekirdek'],
    category: 'İçecek',
    difficulty: 'easy'
  },
  {
    id: '13',
    word: 'GİTAR',
    forbidden_words: ['Müzik', 'Tel', 'Çalmak', 'Enstrüman', 'Akustik'],
    category: 'Müzik',
    difficulty: 'medium'
  },
  {
    id: '14',
    word: 'DEPREM',
    forbidden_words: ['Fay', 'Sarsıntı', 'Yıkım', 'Doğal Afet', 'Richter'],
    category: 'Doğa',
    difficulty: 'hard'
  },
  {
    id: '15',
    word: 'PARAŞÜT',
    forbidden_words: ['Uçak', 'Atlamak', 'Hava', 'İnmek', 'Yamaç'],
    category: 'Spor',
    difficulty: 'medium'
  }
];

export const INITIAL_TEAMS: Team[] = [
  { id: 'A', name: 'A Takımı', score: 0, color: 'text-brand-secondary', players: [], currentNarratorIndex: 0 },
  { id: 'B', name: 'B Takımı', score: 0, color: 'text-brand-success', players: [], currentNarratorIndex: 0 }
];

export const DEFAULT_SETTINGS: GameSettings = {
  roundTime: 60, // 60 saniye
  targetScore: 20,
  passLimit: 3 // Tur başına 3 pas hakkı
};