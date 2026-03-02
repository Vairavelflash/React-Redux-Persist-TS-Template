export type Position = 'A' | 'M' | 'D' | 'LSM' | 'FO' | 'G';

export interface Conference {
  id: string;
  name: string;
  // ... other fields if any
}

export type TeamId = string;

export interface Team {
  id: TeamId;
  schoolName: string;
  nickname: string;
  conferenceId: string;
  region: string;
  prestige: number;
}

export interface TeamSimInput {
  team: Team;
  roster: Player[];
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
  age: number;
  skill: number;
  overall: number;
}

export interface Recruit {
  id: string;
  name: string;
  position: Position;
  stars: number;
  region: string;
  potential: number;
  committedTeamId: string | null;
  motivations: RecruitMotivation[];
  dealbreaker: RecruitingPitch | null;
  interestByTeamId: Record<string, number>;
}

export interface SignedRecruit {
  recruitId: string;
  signedAtYear: number;
  stars: number;
  position: Position;
}

export type RecruitingPitch = 'PLAYING_TIME' | 'PROXIMITY' | 'ACADEMIC' | 'PRESTIGE' | 'CHAMPIONSHIP' | 'CAMPUS_LIFE';

export interface RecruitMotivation {
  pitch: RecruitingPitch;
  importance: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface ScheduledGame {
  id: string;
  weekIndex: number;
  homeTeamId: string;
  awayTeamId: string;
  conferenceGame: boolean;
}

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

export type TopPerformer = PlayerGameStats;

export interface GameResult {
  id?: string;
  weekIndex?: number;
  seed: number;
  teamAId: string;
  teamBId: string;
  teamAName: string;
  teamBName: string;
  scoreA: number;
  scoreB: number;
  statsA: TeamGameStats;
  statsB: TeamGameStats;
  topPlayersA: PlayerGameStats[];
  topPlayersB: PlayerGameStats[];
  highlights: string[];
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
  topPerformers?: PlayerGameStats[];
}

export interface RankingRow {
  rank: number;
  teamId: string;
  points: number;
  record: string;
}

export interface RankingScoreBreakdown {
  overallWinPctPoints: number;
  conferenceWinPctPoints: number;
  pointDifferentialPoints: number;
  prestigePoints: number;
  scoringVolumePoints: number;
  totalPoints: number;
}

export interface TeamRecord {
  wins: number;
  losses: number;
  confWins: number;
  confLosses: number;
  pointsFor: number;
  pointsAgainst: number;
}

export interface Tactics {
  tempo: 'slow' | 'normal' | 'fast';
  rideClear: 'conservative' | 'balanced' | 'aggressive';
  slideAggression: 'early' | 'normal' | 'late';
}

export type PracticeFocus = 'OFFENSE' | 'DEFENSE' | 'CONDITIONING' | 'DISCIPLINE';

export type PlayoffRoundName = 'ROUND1' | 'QUARTERFINAL' | 'SEMIFINAL' | 'FINAL';

export interface PlayoffSeed {
  seed: number;
  teamId: string;
}

export interface PlayoffGame {
  id: string;
  round: PlayoffRoundName;
  slot: number;
  homeSeed: number; // 0 if not applicable
  awaySeed: number; // 0 if not applicable
  homeTeamId: string;
  awayTeamId: string;
  winnerTeamId: string | null;
  result: GameSummary | null;
}

export interface PlayoffState {
  seeds: PlayoffSeed[];
  rounds: {
    ROUND1: PlayoffGame[];
    QUARTERFINAL: PlayoffGame[];
    SEMIFINAL: PlayoffGame[];
    FINAL: PlayoffGame[];
  };
  currentRound: PlayoffRoundName;
  championTeamId: string | null;
}

export interface SeasonState {
  year: number;
  currentWeekIndex: number;
  completedWeeks: number;
  gameResults: GameResult[];
  scheduleByWeek: ScheduledGame[][];
  isComplete: boolean;
  phase: 'PRE' | 'REGULAR' | 'PLAYOFF' | 'OFFSEASON';
  seasonSeed: number;
  playoffs?: PlayoffState | null;
  standings?: RankingRow[];
}

export interface LeagueData {
  conferences: Conference[];
  teams: Team[];
}

export interface SeasonHistoryEntry {
  year: number;
  wins: number;
  losses: number;
  madePlayoffs: boolean;
  champion: boolean;
  recruitsSigned: number;
  avgRecruitStars: number;
  jobSecurityEnd: number;
}

export interface CareerRecord {
  totalWins: number;
  totalLosses: number;
  playoffAppearances: number;
  championships: number;
  seasonsCompleted: number;
}
