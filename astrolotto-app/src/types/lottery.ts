export type LotteryType = 'euromillones' | 'primitiva' | 'medellin' | 'nacional';

export interface LotteryConfig {
  id: LotteryType;
  name: string;
  country: string;
  flag: string;
  color: string;
  accentColor: string;
  drawDays: string[];
  nextDrawText: string;
  mainNumbersCount: number;
  mainRange: [number, number]; // e.g. [1, 50]
  extraType: 'stars' | 'reintegro' | 'serie';
  extraLabel: string;
  extraRange: [number, number]; // e.g. [1, 12] or [0, 9] or [0, 999]
  extraCount: number;
  formatSerie?: boolean; // If true, formatted as 000-999
  formatMainAsDigits?: boolean; // For Medellin (4 digits) & Nacional (5 digits)
  officialJackpotEstimate: string;
}

export interface UserAstralProfile {
  name: string;
  birthDate: string; // YYYY-MM-DD
  zodiacSign: string;
  lifePathNumber: number;
  favoriteNumbers: number[];
  luckyCharm: string;
  drawDate: string; // Target draw date YYYY-MM-DD
  weights: {
    history: number; // 0-100
    astrology: number; // 0-100
    numerology: number; // 0-100
    favorites: number; // 0-100
  };
}

export interface AstroInfluence {
  moonPhase: {
    name: string;
    illumination: number; // 0-100%
    significance: string;
    icon: string;
  };
  dominantPlanet: {
    name: string;
    symbol: string;
    energy: string;
    resonantNumbers: number[];
  };
  zodiacAspect: {
    sign: string;
    element: 'Fuego' | 'Tierra' | 'Aire' | 'Agua';
    luckyHarmony: string;
  };
  celestialVibration: number; // 1-9
}

export interface NumerologyBreakdown {
  lifePath: number;
  universalDayVibration: number;
  personalDayNumber: number;
  masterNumbersPresent: number[];
  harmoniousMatrix: number[];
}

export interface HistoricalDraw {
  id: string;
  drawNumber?: string;
  date: string;
  numbers: number[];
  extra: number[];
  complementario?: number;
  joker?: string;
  segundoPremio?: number[];
  reintegros?: number[];
  extracciones4?: number[];
  extracciones3?: number[];
  extracciones2?: number[];
  prizePool?: string;
  jackpotWon?: boolean;
  verifiedLive?: boolean;
  source?: string;
}

export interface PredictedTicket {
  id: string;
  mainNumbers: number[];
  extraNumbers: number[];
  confidence: number; // e.g. 96.4%
  astralAffinity: number; // %
  mathematicalAffinity: number; // %
  vibrationalHarmony: number; // %
  rationale: {
    title: string;
    details: string[];
  };
  cosmicSign: string;
  timestamp: string;
}

export interface OracleLog {
  id: string;
  timestamp: string;
  stage: 'network' | 'historical' | 'astral' | 'numerology' | 'synthesis' | 'complete';
  message: string;
  detail?: string;
  status: 'info' | 'success' | 'process' | 'highlight';
}

export interface LotteryStats {
  hotNumbers: { number: number; frequency: number }[];
  coldNumbers: { number: number; frequency: number; gap: number }[];
  dueNumbers: { number: number; gap: number }[];
  parityRatio: { even: number; odd: number };
  averageSum: number;
}
