
export interface UserProfile {
  name: string;
  email: string;
  bio: string;
  location?: string;
  theme: 'light' | 'dark' | 'system';
  joinedAt: string;
  securityPin?: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string; // ISO String
  mood: Mood;
  tags: string[];
  images?: string[]; // Base64 strings (limit to 3 for performance)
  location?: string;
  isFavorite?: boolean;
  aiSummary?: string; // Short generated summary
}

export enum Mood {
  GREAT = '🥰',
  GOOD = '🙂',
  NEUTRAL = '😐',
  DOWN = '😔',
  STRESSED = '😫',
  ANGRY = '😡',
  INSPIRED = '✨'
}

export interface AIInsight {
  text: string;
  type: 'encouragement' | 'observation' | 'challenge';
}
