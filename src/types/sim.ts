export type Position = 'A' | 'M' | 'D' | 'LSM' | 'FO' | 'G';

export interface Conference {
  id: string;
  name: string;
}

export interface Team {
  id: string;
  schoolName: string;
  nickname: string;
  conferenceId: string;
  region: string;
  prestige: number;
}

export interface PlayerRatings {
  shooting: number;
  passing: number;
  speed: number;
  defense: number;
  IQ: number;
  stamina: number;
  discipline: number;
}

export interface Player extends PlayerRatings {
  id: string;
  name: string;
  position: Position;
  year: 1 | 2 | 3 | 4;
  overall: number;
}

export interface GameResult {
  id: string;
  week: number;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  played: boolean;
}

export interface RankingRow {
  rank: number;
  teamId: string;
  points: number;
  record: string;
}

export interface Tactics {
  tempo: 'slow' | 'normal' | 'fast';
  rideClear: 'conservative' | 'balanced' | 'aggressive';
  slideAggression: 'early' | 'normal' | 'late';
}

export interface SeasonState {
  year: number;
  currentWeek: number;
  gameResults: GameResult[];
  isComplete: boolean;
}

export interface LeagueData {
  conferences: Conference[];
  teams: Team[];
}
