import type { TestMode } from "../hooks/useTypingTest";

export interface PersonalBest {
  wpm: number;
  acc: number;
  date: string;
}

const key = (mode: TestMode) => `mincratype-pb-${mode}`;

export function getBest(mode: TestMode): PersonalBest | null {
  try {
    const raw = localStorage.getItem(key(mode));
    if (!raw) return null;
    const pb = JSON.parse(raw) as PersonalBest;
    if (typeof pb.wpm !== "number") return null;
    return pb;
  } catch {
    return null;
  }
}

export function getAllBests(): Record<TestMode, PersonalBest | null> {
  return {
    15: getBest(15),
    30: getBest(30),
    60: getBest(60),
    120: getBest(120),
  };
}

/** Saves the PB if beaten. Returns true when it is a new best. */
export function saveBest(mode: TestMode, wpm: number, acc: number): boolean {
  const prev = getBest(mode);
  if (prev && wpm <= prev.wpm) return false;
  try {
    localStorage.setItem(
      key(mode),
      JSON.stringify({ wpm, acc, date: new Date().toISOString() })
    );
  } catch {
    // storage unavailable, ignore
  }
  return true;
}
