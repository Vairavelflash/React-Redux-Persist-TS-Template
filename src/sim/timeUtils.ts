export function clockForPossession(pos: number, total: number): { quarter: number; time: string } {
  const gameSeconds = 60 * 60;
  const elapsed = Math.floor((pos / Math.max(total, 1)) * gameSeconds);
  const quarter = Math.min(4, Math.floor(elapsed / 900) + 1);
  const quarterElapsed = elapsed % 900;
  const remain = 900 - quarterElapsed;
  const mins = Math.floor(remain / 60).toString();
  const secs = (remain % 60).toString().padStart(2, '0');
  return { quarter, time: `${mins}:${secs}` };
}
