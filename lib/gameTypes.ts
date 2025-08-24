export interface Player {
  id: string;
  name: string;
  answers: CategoryAnswers;
  hasSubmitted: boolean;
  score: number;
}

export interface CategoryAnswers {
  girl: string;
  boy: string;
  object: string;
  food: string;
  animal: string;
  country: string;
}

export interface GameRoom {
  id: string;
  players: Player[];
  currentLetter: string;
  gameState: 'waiting' | 'playing' | 'roundEnd' | 'gameEnd';
  currentRound: number;
  totalRounds: number;
  usedLetters: string[];
  roundScores: Record<string, number[]>;
  host: string;
}

export const CATEGORIES: (keyof CategoryAnswers)[] = [
  'girl',
  'boy',
  'object',
  'food',
  'animal',
  'country'
];

export const CATEGORY_LABELS: Record<keyof CategoryAnswers, string> = {
  girl: 'Girl Name',
  boy: 'Boy Name',
  object: 'Object',
  food: 'Food',
  animal: 'Animal',
  country: 'Country'
};

export const LETTERS = 'ABCDEFGHIJKLMNOPRSTUVWYZ'.split('');
