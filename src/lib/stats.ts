// Scoring formulas for MINCRATYPE.
// WPM  = (correct characters / 5) / minutes elapsed   (industry standard)
// Raw  = (all typed entries / 5) / minutes elapsed
// Accuracy = correct keystrokes / total keystrokes
// Consistency = monkeytype-style: 100 * (1 - stddev/mean) of per-second raw WPM

export function wpmFromChars(chars: number, minutes: number): number {
  if (minutes <= 0 || chars <= 0) return 0;
  return chars / 5 / minutes;
}

export function accuracy(correct: number, total: number): number {
  if (total === 0) return 100;
  return (correct / total) * 100;
}

export function consistency(perSecondRawWpm: number[]): number {
  const n = perSecondRawWpm.length;
  if (n < 2) return 0;
  const mean = perSecondRawWpm.reduce((a, b) => a + b, 0) / n;
  if (mean <= 0) return 0;
  const variance =
    perSecondRawWpm.reduce((a, b) => a + (b - mean) * (b - mean), 0) / n;
  const value = (1 - Math.sqrt(variance) / mean) * 100;
  return Math.max(0, Math.min(100, value));
}
