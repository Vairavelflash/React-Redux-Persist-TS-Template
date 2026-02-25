import type { GameSummary, TopPerformer } from '../types/sim.ts';

export interface GameRecap {
  gameId: string;
  summary: string;
  keyEdge: string;
  mvp: TopPerformer | null;
  efficiencyNote: string;
}

function formatPct(numerator: number, denominator: number): string {
  if (denominator <= 0) return '0.0';
  return ((numerator / denominator) * 100).toFixed(1);
}

export function buildGameRecap(game: GameSummary, awayName: string, homeName: string): GameRecap {
  const homeWon = game.homeScore > game.awayScore;
  const winnerName = homeWon ? homeName : awayName;
  const loserName = homeWon ? awayName : homeName;
  const margin = Math.abs(game.homeScore - game.awayScore);

  const awayShooting = formatPct(game.teamStatsAway.goals, game.teamStatsAway.shots);
  const homeShooting = formatPct(game.teamStatsHome.goals, game.teamStatsHome.shots);

  const foEdge = game.teamStatsHome.faceoffPct - game.teamStatsAway.faceoffPct;
  const gbEdge = game.teamStatsHome.groundBalls - game.teamStatsAway.groundBalls;
  const toEdge = game.teamStatsAway.turnovers - game.teamStatsHome.turnovers;

  let keyEdge = `${winnerName} controlled the details.`;
  if (Math.abs(foEdge) >= 8) {
    const isHome = foEdge > 0;
    const team = isHome ? homeName : awayName;
    const stats = isHome
      ? `${game.teamStatsHome.faceoffPct}-${game.teamStatsAway.faceoffPct}`
      : `${game.teamStatsAway.faceoffPct}-${game.teamStatsHome.faceoffPct}`;
    keyEdge = `${team} dominated faceoffs (${stats}).`;
  } else if (Math.abs(gbEdge) >= 4) {
    const isHome = gbEdge > 0;
    const team = isHome ? homeName : awayName;
    const stats = isHome
      ? `${game.teamStatsHome.groundBalls}-${game.teamStatsAway.groundBalls}`
      : `${game.teamStatsAway.groundBalls}-${game.teamStatsHome.groundBalls}`;
    keyEdge = `${team} won the ground-ball battle (${stats}).`;
  } else if (Math.abs(toEdge) >= 3) {
    const isHomeWinner = toEdge > 0;
    const team = isHomeWinner ? homeName : awayName;
    const stats = isHomeWinner
      ? `${game.teamStatsHome.turnovers}-${game.teamStatsAway.turnovers}`
      : `${game.teamStatsAway.turnovers}-${game.teamStatsHome.turnovers}`;
    keyEdge = `${team} protected possession with fewer turnovers (${stats}).`;
  }

  const mvp =
    [...(game.topPerformers ?? [])].sort((a, b) => b.goals + b.assists * 0.7 + b.saves * 0.15 - (a.goals + a.assists * 0.7 + a.saves * 0.15))[0] ??
    null;

  return {
    gameId: game.id,
    summary: `${winnerName} beat ${loserName} by ${margin} (${game.awayScore}-${game.homeScore}).`,
    keyEdge,
    mvp,
    efficiencyNote: `${awayName} shot ${awayShooting}% · ${homeName} shot ${homeShooting}%`,
  };
}
