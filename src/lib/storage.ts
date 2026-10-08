import type { CaretStyle, Difficulty, TestMode } from "../hooks/useTypingTest";
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
    git: getBest("git"),
  };
}

const difficultyKey = "mincratype-difficulty";

/** Reads the saved word-list difficulty, defaulting to "all". */
export function getDifficulty(): Difficulty {
  try {
    const raw = localStorage.getItem(difficultyKey);
    if (raw === "short" || raw === "long" || raw === "all") return raw;
  } catch {
    // storage unavailable, ignore
  }
  return "all";
}

/** Persists the word-list difficulty across sessions. */
export function saveDifficulty(d: Difficulty): void {
  try {
    localStorage.setItem(difficultyKey, d);
  } catch {
    // storage unavailable, ignore
  }
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

const blindModeKey = "mincratype-blind-mode";

/** Reads the saved blind-mode setting, defaulting to off. */
export function getBlindMode(): boolean {
  try {
    return localStorage.getItem(blindModeKey) === "1";
  } catch {
    // storage unavailable, ignore
  }
  return false;
}

/** Persists the blind-mode setting across sessions. */
export function saveBlindMode(b: boolean): void {
  try {
    localStorage.setItem(blindModeKey, b ? "1" : "0");
  } catch {
    // storage unavailable, ignore
  }
}

const caretStyleKey = "mincratype-caret-style";

/** Reads the saved caret style, defaulting to "line". */
export function getCaretStyle(): CaretStyle {
  try {
    const raw = localStorage.getItem(caretStyleKey);
    if (raw === "line" || raw === "block" || raw === "underline" || raw === "outline") return raw;
  } catch {
    // storage unavailable, ignore
  }
  return "line";
}

/** Persists the caret style across sessions. */
export function saveCaretStyle(c: CaretStyle): void {
  try {
    localStorage.setItem(caretStyleKey, c);
  } catch {
    // storage unavailable, ignore
  }
}

const MAX_HISTORY = 30;
const historyKey = (mode: TestMode) => `mincratype-pbh-${mode}`;

/** Reads the saved per-mode result history (oldest first), used for the
 *  personal-best sparkline. Returns an empty list when nothing is stored. */
export function getHistory(mode: TestMode): PersonalBest[] {
  try {
    const raw = localStorage.getItem(historyKey(mode));
    if (!raw) return [];
    const list = JSON.parse(raw) as PersonalBest[];
    if (!Array.isArray(list)) return [];
    return list.filter(
      (e) => e && typeof e.wpm === "number" && typeof e.acc === "number"
    );
  } catch {
    return [];
  }
}

/** Records one finished run in the per-mode history, capped at the newest
 *  MAX_HISTORY entries. Every run is recorded, not just new bests, so the
 *  sparkline shows progress over time. */
export function recordHistory(mode: TestMode, wpm: number, acc: number): void {
  try {
    const list = getHistory(mode);
    list.push({ wpm, acc, date: new Date().toISOString() });
    localStorage.setItem(
      historyKey(mode),
      JSON.stringify(list.slice(-MAX_HISTORY))
    );
  } catch {
    // storage unavailable, ignore
  }
}
