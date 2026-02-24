import { GameSummary, TopPerformer } from '../types/sim';

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
    const team = foEdge > 0 ? homeName : awayName;
    keyEdge = `${team} dominated faceoffs (${game.teamStatsAway.faceoffPct}-${game.teamStatsHome.faceoffPct}).`;
  } else if (Math.abs(gbEdge) >= 4) {
    const team = gbEdge > 0 ? homeName : awayName;
    keyEdge = `${team} won the ground-ball battle (${game.teamStatsAway.groundBalls}-${game.teamStatsHome.groundBalls}).`;
  } else if (Math.abs(toEdge) >= 3) {
    const team = toEdge > 0 ? homeName : awayName;
    keyEdge = `${team} protected possession with fewer turnovers (${game.teamStatsAway.turnovers}-${game.teamStatsHome.turnovers}).`;
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
