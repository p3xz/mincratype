import type { TestMode } from "../hooks/useTypingTest";
import { dailyKey } from "../hooks/useTypingTest";

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
    w25: getBest("w25"),
    w50: getBest("w50"),
    w100: getBest("w100"),
    quote: getBest("quote"),
    zen: getBest("zen"),
    daily: getDailyBest(),
    code: getBest("code"),
    hindi: getBest("hindi"),
  };
}

/** Daily-challenge bests are stored per date, since everyone plays the same
 *  seeded list once per day. */
const dailyStorageKey = () => `mincratype-pb-daily-${dailyKey()}`;

export function getDailyBest(): PersonalBest | null {
  try {
    const raw = localStorage.getItem(dailyStorageKey());
    if (!raw) return null;
    const pb = JSON.parse(raw) as PersonalBest;
    if (typeof pb.wpm !== "number") return null;
    return pb;
  } catch {
    return null;
  }
}

/** Saves today's daily-challenge PB if beaten. Returns true when it is a new best. */
export function saveDailyBest(wpm: number, acc: number): boolean {
  const prev = getDailyBest();
  if (prev && wpm <= prev.wpm) return false;
  try {
    localStorage.setItem(
      dailyStorageKey(),
      JSON.stringify({ wpm, acc, date: new Date().toISOString() })
    );
  } catch {
    // storage unavailable, ignore
  }
  return true;
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
