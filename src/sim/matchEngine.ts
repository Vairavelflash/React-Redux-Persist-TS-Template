import { Player, Team } from '../types/sim';
import { makeRng, normalish, pickOne, randInt } from './rng';

export interface Tactics {
  tempo: 'slow' | 'normal' | 'fast';
  rideClear: 'conservative' | 'balanced' | 'aggressive';
  slideAggression: 'early' | 'normal' | 'late';
}

export interface TeamSimInput {
  team: Team;
  roster: Player[];
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
  position: Player['position'];
  goals: number;
  assists: number;
  saves: number;
}

export interface GameResult {
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

interface TeamRatings {
  offense: number;
  defense: number;
  goalie: number;
  faceoff: number;
  discipline: number;
  attackers: Player[];
  middies: Player[];
  goaliePlayer: Player;
}

function average(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);
}

function calcRatings(roster: Player[]): TeamRatings {
  const attackers = roster.filter((p) => p.position === 'A');
  const middies = roster.filter((p) => p.position === 'M');
  const defenders = roster.filter((p) => p.position === 'D' || p.position === 'LSM');
  const faceoffPlayers = roster.filter((p) => p.position === 'FO');
  const goalies = roster.filter((p) => p.position === 'G');
  const goaliePlayer = goalies[0] ?? roster[0];

  const offense = average([...attackers, ...middies].map((p) => p.shooting * 0.55 + p.passing * 0.25 + p.IQ * 0.2));
  const defense = average([...defenders, ...middies].map((p) => p.defense * 0.6 + p.speed * 0.2 + p.IQ * 0.2));
  const goalie = goaliePlayer.defense * 0.7 + goaliePlayer.IQ * 0.3;
  const faceoff = average(faceoffPlayers.map((p) => p.passing * 0.15 + p.speed * 0.2 + p.discipline * 0.2 + p.overall * 0.45));
  const discipline = average(roster.map((p) => p.discipline));

  return { offense, defense, goalie, faceoff, discipline, attackers, middies, goaliePlayer };
}

function tempoModifier(tempo: Tactics['tempo']): number {
  if (tempo === 'slow') return -8;
  if (tempo === 'fast') return 8;
  return 0;
}

function offenseBoostFromTactics(tactics: Tactics): number {
  let boost = 0;
  if (tactics.rideClear === 'aggressive') boost += 1.8;
  if (tactics.rideClear === 'conservative') boost -= 1.2;
  if (tactics.slideAggression === 'late') boost += 1;
  if (tactics.slideAggression === 'early') boost -= 0.7;
  return boost;
}

function defenseBoostFromTactics(tactics: Tactics): number {
  let boost = 0;
  if (tactics.slideAggression === 'early') boost += 1.7;
  if (tactics.slideAggression === 'late') boost -= 1.3;
  if (tactics.rideClear === 'aggressive') boost += 0.8;
  return boost;
}

function clockForPossession(pos: number, total: number): { quarter: number; time: string } {
  const gameSeconds = 60 * 60;
  const elapsed = Math.floor((pos / Math.max(total, 1)) * gameSeconds);
  const quarter = Math.min(4, Math.floor(elapsed / 900) + 1);
  const quarterElapsed = elapsed % 900;
  const remain = 900 - quarterElapsed;
  const mins = Math.floor(remain / 60).toString();
  const secs = (remain % 60).toString().padStart(2, '0');
  return { quarter, time: `${mins}:${secs}` };
}

function weightedPlayerForGoal(rng: () => number, ratings: TeamRatings): Player {
  const core = [...ratings.attackers, ...ratings.middies];
  if (core.length === 0) return ratings.goaliePlayer;
  return pickOne(rng, core);
}

export function simulateGame(
  teamA: TeamSimInput,
  teamB: TeamSimInput,
  tacticsA: Tactics,
  tacticsB: Tactics,
  seed: number,
): GameResult {
  const rng = makeRng(seed);
  const ratingA = calcRatings(teamA.roster);
  const ratingB = calcRatings(teamB.roster);

  const totalPossessions = Math.max(60, 78 + tempoModifier(tacticsA.tempo) + tempoModifier(tacticsB.tempo));
  const faceoffEdge = (ratingA.faceoff - ratingB.faceoff) / 40;
  const shareA = Math.min(0.62, Math.max(0.38, 0.5 + faceoffEdge * 0.08 + normalish(rng) * 0.03));
  const possessionsA = Math.round(totalPossessions * shareA);
  const possessionsB = totalPossessions - possessionsA;

  const statsA: TeamGameStats = { teamId: teamA.team.id, goals: 0, shots: 0, saves: 0, turnovers: 0, groundBalls: randInt(rng, 22, 35), penalties: 0, faceoffPct: Math.round(shareA * 1000) / 10 };
  const statsB: TeamGameStats = { teamId: teamB.team.id, goals: 0, shots: 0, saves: 0, turnovers: 0, groundBalls: randInt(rng, 22, 35), penalties: 0, faceoffPct: Math.round((1 - shareA) * 1000) / 10 };

  const pStatsA = new Map<string, PlayerGameStats>();
  const pStatsB = new Map<string, PlayerGameStats>();
  const highlights: string[] = [];

  function ensurePlayerStats(target: Map<string, PlayerGameStats>, player: Player, teamId: string): PlayerGameStats {
    const existing = target.get(player.id);
    if (existing) return existing;
    const created: PlayerGameStats = { playerId: player.id, teamId, name: player.name, position: player.position, goals: 0, assists: 0, saves: 0 };
    target.set(player.id, created);
    return created;
  }

  function runPossession(offenseInput: TeamSimInput, defenseInput: TeamSimInput, offenseRatings: TeamRatings, defenseRatings: TeamRatings, offenseTactics: Tactics, defenseTactics: Tactics, offenseStats: TeamGameStats, defenseStats: TeamGameStats, playerStats: Map<string, PlayerGameStats>, defensePlayerStats: Map<string, PlayerGameStats>, possessionIndex: number): void {
    const disciplineGap = (100 - offenseRatings.discipline) / 140;
    const turnoverChance = 0.15 + disciplineGap + (offenseTactics.rideClear === 'aggressive' ? 0.02 : 0);
    const penaltyChance = 0.045 + (100 - offenseRatings.discipline) / 220 + (defenseTactics.slideAggression === 'early' ? 0.015 : 0);

    if (rng() < penaltyChance) {
      offenseStats.penalties += 1;
      if (highlights.length < 20 && rng() < 0.25) {
        const c = clockForPossession(possessionIndex, totalPossessions);
        highlights.push(`Q${c.quarter} ${c.time} — ${offenseInput.team.schoolName} flagged for a push, possession flips.`);
      }
      return;
    }

    if (rng() < turnoverChance) {
      offenseStats.turnovers += 1;
      if (rng() < 0.45) {
        defenseStats.groundBalls += 1;
      }
      if (highlights.length < 20 && rng() < 0.2) {
        const c = clockForPossession(possessionIndex, totalPossessions);
        highlights.push(`Q${c.quarter} ${c.time} — ${defenseInput.team.schoolName} forces a turnover in the alley.`);
      }
      return;
    }

    const offensePower = offenseRatings.offense + offenseBoostFromTactics(offenseTactics);
    const defensePower = defenseRatings.defense + defenseBoostFromTactics(defenseTactics);
    const quality = (offensePower - defensePower) / 110 + normalish(rng) * 0.06;

    const shotChance = Math.min(0.88, Math.max(0.48, 0.66 + quality));
    if (rng() > shotChance) {
      return;
    }

    offenseStats.shots += 1;
    const shooter = weightedPlayerForGoal(rng, offenseRatings);

    const saveChance = Math.min(0.58, Math.max(0.2, 0.34 + (defenseRatings.goalie - offensePower) / 180));
    const missChance = Math.min(0.22, Math.max(0.06, 0.12 - quality / 4));

    if (rng() < missChance) {
      return;
    }

    if (rng() < saveChance) {
      defenseStats.saves += 1;
      const goalieStats = ensurePlayerStats(defensePlayerStats, defenseRatings.goaliePlayer, defenseInput.team.id);
      goalieStats.saves += 1;
      return;
    }

    offenseStats.goals += 1;
    const scorerStats = ensurePlayerStats(playerStats, shooter, offenseInput.team.id);
    scorerStats.goals += 1;

    if (rng() < 0.64) {
      const assister = weightedPlayerForGoal(rng, offenseRatings);
      if (assister.id !== shooter.id) {
        const assisterStats = ensurePlayerStats(playerStats, assister, offenseInput.team.id);
        assisterStats.assists += 1;
      }
    }

    if (highlights.length < 20 && (rng() < 0.5 || offenseStats.goals <= 3)) {
      const c = clockForPossession(possessionIndex, totalPossessions);
      const phrases = ['scores on a fast break', 'buries a step-down rip', 'finishes after a slick feed', 'beats the goalie high stick'];
      highlights.push(`Q${c.quarter} ${c.time} — ${offenseInput.team.schoolName} ${pickOne(rng, phrases)}.`);
    }
  }

  for (let i = 0; i < possessionsA; i += 1) {
    runPossession(teamA, teamB, ratingA, ratingB, tacticsA, tacticsB, statsA, statsB, pStatsA, pStatsB, i);
  }

  for (let i = 0; i < possessionsB; i += 1) {
    runPossession(teamB, teamA, ratingB, ratingA, tacticsB, tacticsA, statsB, statsA, pStatsB, pStatsA, possessionsA + i);
  }

  if (highlights.length < 10) {
    const fillerCount = 10 - highlights.length;
    for (let i = 0; i < fillerCount; i += 1) {
      const c = clockForPossession(randInt(rng, 0, totalPossessions), totalPossessions);
      const line = pickOne(rng, [
        `${teamA.team.schoolName} wins a tough ground ball scrum.`,
        `${teamB.team.schoolName} clears through pressure.`,
        'Big save in tight keeps momentum alive.',
        'The ride causes chaos between the restraining lines.',
      ]);
      highlights.push(`Q${c.quarter} ${c.time} — ${line}`);
    }
  }

  const topA = [...pStatsA.values()].sort((a, b) => b.goals + b.assists + b.saves - (a.goals + a.assists + a.saves)).slice(0, 5);
  const topB = [...pStatsB.values()].sort((a, b) => b.goals + b.assists + b.saves - (a.goals + a.assists + a.saves)).slice(0, 5);

  return {
    seed,
    teamAId: teamA.team.id,
    teamBId: teamB.team.id,
    teamAName: `${teamA.team.schoolName} ${teamA.team.nickname}`,
    teamBName: `${teamB.team.schoolName} ${teamB.team.nickname}`,
    scoreA: statsA.goals,
    scoreB: statsB.goals,
    statsA,
    statsB,
    topPlayersA: topA,
    topPlayersB: topB,
    highlights: highlights.slice(0, randInt(rng, 10, 20)),
  };
}
