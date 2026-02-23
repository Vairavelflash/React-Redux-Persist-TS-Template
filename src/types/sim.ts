export type TeamId = string;
export type GameId = string;
export type Position = 'A' | 'M' | 'D' | 'LSM' | 'FO' | 'G';

export interface Conference {
  id: string;
  name: string;
}

export interface Team {
  id: TeamId;
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

export interface TeamRecord {
  wins: number;
  losses: number;
  confWins: number;
  confLosses: number;
  pointsFor: number;
  pointsAgainst: number;
}

export interface CompactTeamGameStats {
  goals: number;
  shots: number;
  saves: number;
  turnovers: number;
  groundBalls: number;
  penalties: number;
  faceoffPct: number;
}

export interface ScheduledGame {
  id: GameId;
  weekIndex: number;
  homeTeamId: TeamId;
  awayTeamId: TeamId;
  conferenceGame: boolean;
}

export interface TopPerformer {
  playerId: string;
  name: string;
  teamId: TeamId;
  position: Position;
  goals: number;
  assists: number;
  saves: number;
}

export interface GameSummary {
  id: GameId;
  weekIndex: number;
  homeTeamId: TeamId;
  awayTeamId: TeamId;
  homeScore: number;
  awayScore: number;
  teamStatsHome: CompactTeamGameStats;
  teamStatsAway: CompactTeamGameStats;
  topPerformers?: TopPerformer[];
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

export type PlayoffRoundName = 'ROUND1' | 'QUARTERFINAL' | 'SEMIFINAL' | 'FINAL';

export interface PlayoffSeed {
  seed: number;
  teamId: TeamId;
}

export interface PlayoffGame {
  id: string;
  round: PlayoffRoundName;
  slot: number;
  homeSeed: number;
  awaySeed: number;
  homeTeamId: TeamId;
  awayTeamId: TeamId;
  winnerTeamId: TeamId | null;
  result: GameSummary | null;
}

export interface PlayoffState {
  seeds: PlayoffSeed[];
  rounds: Record<PlayoffRoundName, PlayoffGame[]>;
  currentRound: PlayoffRoundName;
  championTeamId: TeamId | null;
}

export type SeasonPhase = 'REGULAR' | 'PLAYOFF' | 'DONE';

export interface SeasonState {
  seasonSeed: number;
  currentWeekIndex: number;
  scheduleByWeek: ScheduledGame[][];
  resultsByWeek: GameSummary[][];
  recordsByTeamId: Record<TeamId, TeamRecord>;
  phase: SeasonPhase;
  playoffState?: PlayoffState | null;
}

export interface LeagueData {
  conferences: Conference[];
  teams: Team[];
}
