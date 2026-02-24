import { Conference, ScheduledGame, Team } from '../types/sim';
import { makeRng, randInt } from './rng';

const TOTAL_WEEKS = 12;

function gameId(weekIndex: number, home: string, away: string): string {
  return `w${weekIndex}-${home}-vs-${away}`;
}

function rotateRoundRobin(teamIds: string[]): string[][] {
  const teams = [...teamIds];
  const rounds: string[][] = [];

  for (let round = 0; round < teams.length - 1; round += 1) {
    const pairings: string[] = [];
    for (let i = 0; i < teams.length / 2; i += 1) {
      pairings.push(`${teams[i]}|${teams[teams.length - 1 - i]}`);
    }
    rounds.push(pairings);

    const fixed = teams[0];
    const rest = teams.slice(1);
    rest.unshift(rest.pop() as string);
    teams.splice(0, teams.length, fixed, ...rest);
  }

  return rounds;
}

function buildConferenceWeeks(teams: Team[], conferences: Conference[], rng: () => number): ScheduledGame[][] {
  const weeks = Array.from({ length: TOTAL_WEEKS }, () => [] as ScheduledGame[]);

  conferences.forEach((conference) => {
    const confTeams = teams.filter((team) => team.conferenceId === conference.id).map((team) => team.id);
    const rounds = rotateRoundRobin(confTeams);

    rounds.forEach((roundGames, roundIndex) => {
      roundGames.forEach((pair) => {
        const [a, b] = pair.split('|');
        const homeTeamId = rng() < 0.5 ? a : b;
        const awayTeamId = homeTeamId === a ? b : a;

        weeks[roundIndex].push({
          id: gameId(roundIndex, homeTeamId, awayTeamId),
          weekIndex: roundIndex,
          homeTeamId,
          awayTeamId,
          conferenceGame: true,
        });
      });
    });
  });

  return weeks;
}

function tryBuildWeekMatchups(
  weekIndex: number,
  teams: Team[],
  playedOpponents: Map<string, Set<string>>,
  homeCounts: Map<string, number>,
  rng: () => number,
): ScheduledGame[] | null {
  const teamIds = teams.map((team) => team.id);
  const confByTeam = new Map(teams.map((team) => [team.id, team.conferenceId]));
  const scheduled: [string, string][] = [];
  const used = new Set<string>();

  // Pre-group teams by conference to avoid scanning all 128 teams per candidate check.
  // candidatesFor only considers cross-conference opponents, so we can exclude
  // same-conference teams up front.
  const teamsByConf = new Map<string, string[]>();
  for (const team of teams) {
    let arr = teamsByConf.get(team.conferenceId);
    if (!arr) {
      arr = [];
      teamsByConf.set(team.conferenceId, arr);
    }
    arr.push(team.id);
  }

  function candidatesFor(teamId: string): string[] {
    const conf = confByTeam.get(teamId)!;
    const played = playedOpponents.get(teamId);
    const result: string[] = [];
    for (const [c, ids] of teamsByConf) {
      if (c === conf) continue;
      for (const candidate of ids) {
        if (used.has(candidate)) continue;
        if (played?.has(candidate)) continue;
        result.push(candidate);
      }
    }
    return result;
  }

  function recurse(): boolean {
    if (used.size === teamIds.length) return true;

    // Find the most constrained unused team (fewest candidates)
    let bestTeam = '';
    let bestCount = Infinity;
    for (const id of teamIds) {
      if (used.has(id)) continue;
      const count = candidatesFor(id).length;
      if (count < bestCount) {
        bestCount = count;
        bestTeam = id;
        if (count === 0) return false;
      }
    }

    const candidates = candidatesFor(bestTeam);

    for (let i = candidates.length - 1; i > 0; i -= 1) {
      const j = randInt(rng, 0, i);
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }

    for (const opponent of candidates) {
      used.add(bestTeam);
      used.add(opponent);
      scheduled.push([bestTeam, opponent]);

      if (recurse()) return true;

      scheduled.pop();
      used.delete(opponent);
      used.delete(bestTeam);
    }

    return false;
  }

  if (!recurse()) {
    return null;
  }

  return scheduled.map(([a, b]) => {
    const homeA = homeCounts.get(a) ?? 0;
    const homeB = homeCounts.get(b) ?? 0;

    let homeTeamId = a;
    let awayTeamId = b;

    if (homeB < homeA || (homeA === homeB && rng() < 0.5)) {
      homeTeamId = b;
      awayTeamId = a;
    }

    homeCounts.set(homeTeamId, (homeCounts.get(homeTeamId) ?? 0) + 1);

    return {
      id: gameId(weekIndex, homeTeamId, awayTeamId),
      weekIndex,
      homeTeamId,
      awayTeamId,
      conferenceGame: false,
    };
  });
}

export function generateSeasonSchedule(teams: Team[], conferences: Conference[], seed: number): ScheduledGame[][] {
  const rng = makeRng(seed);
  const weeks = buildConferenceWeeks(teams, conferences, rng);

  const playedOpponents = new Map<string, Set<string>>();
  teams.forEach((team) => playedOpponents.set(team.id, new Set()));

  const homeCounts = new Map<string, number>();
  teams.forEach((team) => homeCounts.set(team.id, 0));

  for (let week = 0; week < 7; week += 1) {
    weeks[week].forEach((game) => {
      playedOpponents.get(game.homeTeamId)?.add(game.awayTeamId);
      playedOpponents.get(game.awayTeamId)?.add(game.homeTeamId);
      homeCounts.set(game.homeTeamId, (homeCounts.get(game.homeTeamId) ?? 0) + 1);
    });
  }

  for (let week = 7; week < TOTAL_WEEKS; week += 1) {
    let created: ScheduledGame[] | null = null;

    for (let attempt = 0; attempt < 80; attempt += 1) {
      const playedClone = new Map<string, Set<string>>();
      playedOpponents.forEach((set, teamId) => playedClone.set(teamId, new Set(set)));
      const homeClone = new Map(homeCounts);

      const weekGames = tryBuildWeekMatchups(week, teams, playedClone, homeClone, rng);
      if (!weekGames) continue;

      weekGames.forEach((game) => {
        playedClone.get(game.homeTeamId)?.add(game.awayTeamId);
        playedClone.get(game.awayTeamId)?.add(game.homeTeamId);
      });

      created = weekGames;
      playedOpponents.clear();
      playedClone.forEach((set, teamId) => playedOpponents.set(teamId, set));
      homeCounts.clear();
      homeClone.forEach((count, teamId) => homeCounts.set(teamId, count));
      break;
    }

    if (!created) {
      throw new Error(`Unable to build non-conference schedule for week ${week}`);
    }

    weeks[week] = created;
  }

  const errors = validateSchedule(weeks, teams);
  if (errors.length > 0) {
    throw new Error(`Generated invalid schedule:\n${errors.join('\n')}`);
  }

  return weeks;
}

export function validateSchedule(scheduleByWeek: ScheduledGame[][], teams: Team[]): string[] {
  const errors: string[] = [];

  if (scheduleByWeek.length !== 12) {
    errors.push(`Expected 12 weeks, got ${scheduleByWeek.length}.`);
  }

  const teamIds = teams.map((team) => team.id);
  const seenMatchups = new Set<string>();
  const gamesByTeam = new Map<string, number>();
  teamIds.forEach((id) => gamesByTeam.set(id, 0));

  scheduleByWeek.forEach((weekGames, weekIndex) => {
    if (weekGames.length !== 64) {
      errors.push(`Week ${weekIndex} expected 64 games, got ${weekGames.length}.`);
    }

    const seenThisWeek = new Set<string>();

    weekGames.forEach((game) => {
      if (seenThisWeek.has(game.homeTeamId) || seenThisWeek.has(game.awayTeamId)) {
        errors.push(`Week ${weekIndex} has team playing twice (${game.homeTeamId} or ${game.awayTeamId}).`);
      }
      seenThisWeek.add(game.homeTeamId);
      seenThisWeek.add(game.awayTeamId);

      const matchupKey = [game.homeTeamId, game.awayTeamId].sort().join('|');
      if (seenMatchups.has(matchupKey)) {
        errors.push(`Duplicate matchup found: ${matchupKey}`);
      }
      seenMatchups.add(matchupKey);

      gamesByTeam.set(game.homeTeamId, (gamesByTeam.get(game.homeTeamId) ?? 0) + 1);
      gamesByTeam.set(game.awayTeamId, (gamesByTeam.get(game.awayTeamId) ?? 0) + 1);
    });

    if (seenThisWeek.size !== teamIds.length) {
      errors.push(`Week ${weekIndex} expected ${teamIds.length} team appearances, got ${seenThisWeek.size}.`);
    }
  });

  gamesByTeam.forEach((count, teamId) => {
    if (count !== 12) {
      errors.push(`Team ${teamId} expected 12 games, got ${count}.`);
    }
  });

  return errors;
}
