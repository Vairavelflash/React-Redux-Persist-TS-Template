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

export interface Tactics {
  tempo: 'slow' | 'normal' | 'fast';
  rideClear: 'conservative' | 'balanced' | 'aggressive';
  slideAggression: 'early' | 'normal' | 'late';
}

export interface RankingRow {
  rank: number;
  teamId: string;
  points: number;
  record: string;
}

export interface LeagueData {
  conferences: Conference[];
  teams: Team[];
}

// --- Schedule types ---

export interface ScheduledGame {
  id: string;
  weekIndex: number;
  homeTeamId: string;
  awayTeamId: string;
  conferenceGame: boolean;
}

// --- Game stats types (used by match engine and game summaries) ---

export interface TeamGameStats {
  teamId: string;
  goals: number;
  shots: number;
  saves: number;
  turnovers: number;
  groundBalls: number;
  penalties: number;
  faceoffPct: number;
}

export interface PlayerGameStats {
  playerId: string;
  teamId: string;
  name: string;
  position: Position;
  goals: number;
  assists: number;
  saves: number;
}

export interface GameSummary {
  id: string;
  weekIndex: number;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  teamStatsHome: TeamGameStats;
  teamStatsAway: TeamGameStats;
  topPerformers: PlayerGameStats[];
}

// --- Team record ---

export interface TeamRecord {
  wins: number;
  losses: number;
  confWins: number;
  confLosses: number;
  pointsFor: number;
  pointsAgainst: number;
}

// --- Playoff types ---

export type PlayoffRoundName = 'ROUND1' | 'QUARTERFINAL' | 'SEMIFINAL' | 'FINAL';

export interface PlayoffSeed {
  seed: number;
  teamId: string;
}

export interface PlayoffGame {
  id: string;
  round: PlayoffRoundName;
  slot: number;
  homeSeed: number;
  awaySeed: number;
  homeTeamId: string;
  awayTeamId: string;
  winnerTeamId: string | null;
  result: GameSummary | null;
}

export interface PlayoffState {
  seeds: PlayoffSeed[];
  rounds: Record<PlayoffRoundName, PlayoffGame[]>;
  currentRound: PlayoffRoundName;
  championTeamId: string | null;
}

// --- Season state ---

export type SeasonPhase = 'IDLE' | 'REGULAR' | 'PLAYOFF' | 'COMPLETE';

export interface SeasonState {
  phase: SeasonPhase;
  year: number;
  seasonSeed: number;
  currentWeekIndex: number;
  scheduleByWeek: ScheduledGame[][];
  resultsByWeek: GameSummary[][];
  playoffState: PlayoffState | null;
}
