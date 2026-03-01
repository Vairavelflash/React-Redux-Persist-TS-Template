import { PlayoffRoundName, PlayoffState, SeasonState, Team } from '../types/sim';

export interface SeasonValidationResult {
  isValid: boolean;
  error?: string;
  phase?: SeasonState['phase'];
}

function countUniqueTeamIdsInWeek(season: SeasonState, weekIndex: number): number {
  const week = season.scheduleByWeek[weekIndex] ?? [];
  const teamIds = new Set<string>();

  week.forEach((game) => {
    teamIds.add(game.homeTeamId);
    teamIds.add(game.awayTeamId);
  });

  return teamIds.size;
}

function validateRegularSeason(season: SeasonState, teamCount: number): SeasonValidationResult | null {
  if (!season.scheduleByWeek || season.scheduleByWeek.length === 0) {
    return {
      isValid: false,
      error: 'Season phase is REGULAR but no schedule exists.',
      phase: season.phase,
    };
  }

  if (season.currentWeekIndex < 0 || season.currentWeekIndex > season.scheduleByWeek.length) {
    return {
      isValid: false,
      error: `Current week index (${season.currentWeekIndex}) is outside schedule bounds (0-${season.scheduleByWeek.length}).`,
      phase: season.phase,
    };
  }

  if (season.completedWeeks !== season.currentWeekIndex) {
    return {
      isValid: false,
      error: `Completed weeks (${season.completedWeeks}) does not match current week index (${season.currentWeekIndex}).`,
      phase: season.phase,
    };
  }

  for (let i = 0; i < season.completedWeeks; i += 1) {
    const scheduledGames = season.scheduleByWeek[i]?.length ?? 0;
    const playedGames = season.gameResults.filter((game) => game.weekIndex === i).length;

    if (playedGames !== scheduledGames) {
      return {
        isValid: false,
        error: `Week ${i + 1} results mismatch: expected ${scheduledGames} games, found ${playedGames}.`,
        phase: season.phase,
      };
    }

    const uniqueTeams = countUniqueTeamIdsInWeek(season, i);
    if (uniqueTeams !== teamCount) {
      return {
        isValid: false,
        error: `Week ${i + 1} schedule expected ${teamCount} unique teams, found ${uniqueTeams}.`,
        phase: season.phase,
      };
    }
  }

  return null;
}

function validatePlayoffRoundShape(playoffs: PlayoffState): string | null {
  const expectedRoundCounts: Record<PlayoffRoundName, number> = {
    ROUND1: 4,
    QUARTERFINAL: 4,
    SEMIFINAL: 2,
    FINAL: 1,
  };

  const roundNames: PlayoffRoundName[] = ['ROUND1', 'QUARTERFINAL', 'SEMIFINAL', 'FINAL'];
  for (const roundName of roundNames) {
    const games = playoffs.rounds[roundName];
    if (games.length > expectedRoundCounts[roundName]) {
      return `${roundName} has too many games (${games.length}).`;
    }
  }

  return null;
}

function validatePlayoffs(season: SeasonState): SeasonValidationResult | null {
  const playoffs = season.playoffs;

  if (!playoffs) {
    return {
      isValid: false,
      error: 'Season phase is PLAYOFF/OFFSEASON but playoff state is missing.',
      phase: season.phase,
    };
  }

  if (playoffs.seeds.length !== 12) {
    return {
      isValid: false,
      error: `Playoff seeds expected 12 entries, found ${playoffs.seeds.length}.`,
      phase: season.phase,
    };
  }

  const uniqueSeedNumbers = new Set(playoffs.seeds.map((seed) => seed.seed));
  const uniqueTeamIds = new Set(playoffs.seeds.map((seed) => seed.teamId));

  if (uniqueSeedNumbers.size !== 12) {
    return {
      isValid: false,
      error: 'Playoff seeds contain duplicate seed numbers.',
      phase: season.phase,
    };
  }

  if (uniqueTeamIds.size !== 12) {
    return {
      isValid: false,
      error: 'Playoff seeds contain duplicate team IDs.',
      phase: season.phase,
    };
  }

  const shapeError = validatePlayoffRoundShape(playoffs);
  if (shapeError) {
    return {
      isValid: false,
      error: shapeError,
      phase: season.phase,
    };
  }

  if (season.phase === 'OFFSEASON' && !playoffs.championTeamId) {
    return {
      isValid: false,
      error: 'Season moved to OFFSEASON but no playoff champion was recorded.',
      phase: season.phase,
    };
  }

  return null;
}

export function validateSeasonState(season: SeasonState, teams: Team[]): SeasonValidationResult {
  if (!teams || teams.length === 0) {
    return {
      isValid: false,
      error: 'League data not loaded (0 teams found). Please refresh or reset.',
      phase: season.phase,
    };
  }

  if (season.phase === 'REGULAR') {
    const regularSeasonError = validateRegularSeason(season, teams.length);
    if (regularSeasonError) return regularSeasonError;
  }

  if (season.phase === 'PLAYOFF' || season.phase === 'OFFSEASON') {
    const playoffError = validatePlayoffs(season);
    if (playoffError) return playoffError;
  }

  return {
    isValid: true,
    phase: season.phase,
  };
}
