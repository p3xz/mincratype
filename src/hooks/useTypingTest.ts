import { useCallback, useEffect, useRef, useState } from "react";
import { WORDS } from "../data/words";
import { CODE_WORDS } from "../data/codeWords";
import { GIT_WORDS } from "../data/gitWords";
import { HINDI_WORDS } from "../data/hindiWords";
import { randomQuote } from "../data/quotes";
import { accuracy, consistency, wpmFromChars } from "../lib/stats";
import { getBlindMode, getCaretStyle, getDifficulty, saveBlindMode, saveCaretStyle, saveDifficulty } from "../lib/storage";

/** Timer modes are plain seconds: 15/30/60/120 are the presets, and users can
 *  also type a custom number of seconds. Everything that is not a word, quote,
 *  or zen mode is treated as a timer mode. */
export type TestMode = number | "w25" | "w50" | "w100" | "quote" | "zen" | "daily" | "code" | "hindi" | "git";
export type TestStatus = "idle" | "running" | "finished";

export type WordMode = "w25" | "w50" | "w100";

/** Caret styles: a thin line, a full block over the next character, a short
 *  underline bar, or an outline box around the next character. */
export type CaretStyle = "line" | "block" | "underline" | "outline";

/** Every caret style, in picker order. */
export const CARET_STYLES: CaretStyle[] = ["line", "block", "underline", "outline"];

/** Difficulty filter for word-list modes: all words, short words only
 *  (1-4 letters), or long words only (5+ letters). */
export type Difficulty = "all" | "short" | "long";

export const DIFFICULTIES: Difficulty[] = ["all", "short", "long"];

/** Words at most this long count as short; everything longer counts as long. */
const SHORT_MAX = 4;

/** The English word pool filtered by difficulty. */
function poolFor(d: Difficulty): string[] {
  if (d === "short") return WORDS.filter((w) => w.length <= SHORT_MAX);
  if (d === "long") return WORDS.filter((w) => w.length > SHORT_MAX);
  return WORDS;
}

/** Compact label for difficulty buttons: "all", "short", or "long". */
export function difficultyShort(d: Difficulty): string {
  return d;
}

/** Human label for a difficulty: "all words", "short words (1-4 letters)",
 *  or "long words (5+ letters)". */
export function difficultyLabel(d: Difficulty): string {
  if (d === "short") return `short words (1-${SHORT_MAX} letters)`;
  if (d === "long") return `long words (${SHORT_MAX + 1}+ letters)`;
  return "all words";
}

/** Type guard: true for word-count modes like "w25". */
export function isWordMode(m: TestMode): m is WordMode {
  return m === "w25" || m === "w50" || m === "w100";
}

/** Type guard: true for timer, word-count, and zen modes, which all draw from
 *  the English word list that the difficulty filter applies to. */
export function isWordPoolMode(m: TestMode): boolean {
  return (
    !isQuoteMode(m) &&
    !isDailyMode(m) &&
    !isCodeMode(m) &&
    !isHindiMode(m) &&
    !isGitMode(m)
  );
}

/** Type guard: true for quote mode. */
export function isQuoteMode(m: TestMode): m is "quote" {
  return m === "quote";
}

/** Type guard: true for zen mode. */
export function isZenMode(m: TestMode): m is "zen" {
  return m === "zen";
}

/** Type guard: true for daily challenge mode. */
export function isDailyMode(m: TestMode): m is "daily" {
  return m === "daily";
}

/** Type guard: true for code mode. */
export function isCodeMode(m: TestMode): m is "code" {
  return m === "code";
}

/** Type guard: true for hindi mode. */
export function isHindiMode(m: TestMode): m is "hindi" {
  return m === "hindi";
}

/** Type guard: true for git mode. */
export function isGitMode(m: TestMode): m is "git" {
  return m === "git";
}

/** Number of words for a word-count mode, or null for timer and quote modes. */
export function wordCountOf(m: TestMode): number | null {
  return isWordMode(m) ? parseInt(m.slice(1), 10) : null;
}

/** Human label for a mode: "25 words", "30s", "quote", "zen", "daily", "code", "hindi", or "git". */
export function modeLabel(m: TestMode): string {
  if (isQuoteMode(m) || isZenMode(m) || isDailyMode(m) || isCodeMode(m) || isHindiMode(m) || isGitMode(m)) return m;
  return isWordMode(m) ? `${wordCountOf(m)} words` : `${m}s`;
}

/** Compact label for mode buttons: "25w", "30s", "quote", "zen", "daily", "code", "hindi", or "git". */
export function modeShort(m: TestMode): string {
  if (isQuoteMode(m) || isZenMode(m) || isDailyMode(m) || isCodeMode(m) || isHindiMode(m) || isGitMode(m)) return m;
  return isWordMode(m) ? `${wordCountOf(m)}w` : `${m}s`;
}

/** Words generated per run: the fixed count in word, daily, code, hindi, and git modes. */
const wordTarget = (m: TestMode): number =>
  wordCountOf(m) ?? (isDailyMode(m) ? DAILY_WORDS : isCodeMode(m) ? CODE_WORD_COUNT : isHindiMode(m) ? HINDI_WORD_COUNT : isGitMode(m) ? GIT_WORD_COUNT : INITIAL_WORDS);

/** Today's daily-challenge date key in local time: YYYY-MM-DD. */
export function dailyKey(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** mulberry32 PRNG, seeded from the date key so everyone gets the same list. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** The daily challenge word list: DAILY_WORDS words, identical for everyone
 *  who plays on the same date. */
export function seededDailyWords(): string[] {
  const rand = mulberry32(hashStr(dailyKey()));
  const out: string[] = [];
  for (let i = 0; i < DAILY_WORDS; i++) {
    out.push(WORDS[Math.floor(rand() * WORDS.length)]);
  }
  return out;
}

/** Word list for a run: a random quote in quote mode, the shared seeded list
 *  in daily mode, random code tokens in code mode, random Hindi words in
 *  hindi mode, random Git keywords in git mode, random words from the
 *  difficulty-filtered pool otherwise. */
function genWords(m: TestMode, d: Difficulty): { words: string[]; author: string | null } {
  if (isQuoteMode(m)) {
    const q = randomQuote();
    return { words: q.text.split(" "), author: q.author };
  }
  if (isDailyMode(m)) {
    return { words: seededDailyWords(), author: null };
  }
  if (isCodeMode(m)) {
    return { words: randomCodeWords(wordTarget(m)), author: null };
  }
  if (isHindiMode(m)) {
    return { words: randomHindiWords(wordTarget(m)), author: null };
  }
  if (isGitMode(m)) {
    return { words: randomGitWords(wordTarget(m)), author: null };
  }
  return { words: randomWords(wordTarget(m), d), author: null };
}

/** Initial HUD value: words remaining in word, quote, daily, code, hindi, and
 *  git modes, seconds in timer modes, and 0 in zen mode where the clock
 *  counts up instead. */
const initialTimeLeft = (m: TestMode, words: string[]): number =>
  isZenMode(m)
    ? 0
    : isWordMode(m) || isQuoteMode(m) || isDailyMode(m) || isCodeMode(m) || isHindiMode(m) || isGitMode(m)
      ? words.length
      : m;

export interface KeyEntry {
  ch: string;
  correct: boolean;
  extra: boolean;
  /** Date.now() at the moment the key was pressed, for per-key latency stats. */
  t: number;
}

/** Per-key typing stats aggregated at finish: average time since the previous
 *  keystroke, total hits, and incorrect hits. Drives the key heatmap. */
export interface KeyStat {
  key: string;
  avgMs: number;
  hits: number;
  misses: number;
}

export interface TestResult {
  mode: TestMode;
  difficulty: Difficulty;
  wpm: number;
  raw: number;
  accuracy: number;
  consistency: number;
  correctChars: number;
  incorrectChars: number;
  extraChars: number;
  missedChars: number;
  durationSec: number;
  /** Raw per-second WPM samples (one per elapsed second) for the results chart. */
  wpmHistory: number[];
  /** Per-key latency and miss stats for the key heatmap. */
  keyStats: KeyStat[];
}

const INITIAL_WORDS = 150;
const EXTEND_AT = 12;
const EXTEND_BY = 60;
const MAX_EXTRA = 8;
const DAILY_WORDS = 50;
const CODE_WORD_COUNT = 50;
const HINDI_WORD_COUNT = 50;
const GIT_WORD_COUNT = 50;

function randomWords(n: number, d: Difficulty = "all"): string[] {
  const pool = poolFor(d);
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    out.push(pool[Math.floor(Math.random() * pool.length)]);
  }
  return out;
}

function randomCodeWords(n: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    out.push(CODE_WORDS[Math.floor(Math.random() * CODE_WORDS.length)]);
  }
  return out;
}

function randomHindiWords(n: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    out.push(HINDI_WORDS[Math.floor(Math.random() * HINDI_WORDS.length)]);
  }
  return out;
}

function randomGitWords(n: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    out.push(GIT_WORDS[Math.floor(Math.random() * GIT_WORDS.length)]);
  }
  return out;
}

export function useTypingTest(initialMode: TestMode = 30) {
  const [mode, setMode] = useState<TestMode>(initialMode);
  const [difficulty, setDifficulty] = useState<Difficulty>(() => getDifficulty());
  /** Blind mode: typed feedback on the active word stays hidden until the
   *  word is done. Pure display state, so no ref is needed. */
  const [blind, setBlind] = useState<boolean>(() => getBlindMode());
  /** Caret style: pure display state, so no ref is needed. */
  const [caretStyle, setCaretStyle] = useState<CaretStyle>(() => getCaretStyle());
  const [initial] = useState(() => genWords(initialMode, getDifficulty()));
  const [words, setWords] = useState<string[]>(initial.words);
  const [quoteAuthor, setQuoteAuthor] = useState<string | null>(initial.author);
  const [typed, setTyped] = useState<string[]>(() =>
    Array(initial.words.length).fill("")
  );
  const [wordIdx, setWordIdx] = useState(0);
  const [status, setStatus] = useState<TestStatus>("idle");
  const [timeLeft, setTimeLeft] = useState<number>(() =>
    initialTimeLeft(initialMode, initial.words)
  );
  const [result, setResult] = useState<TestResult | null>(null);

  const entriesRef = useRef<KeyEntry[]>([]);
  const startRef = useRef<number | null>(null);
  const secRef = useRef({ whole: 0, count: 0, samples: [] as number[] });
  const timerRef = useRef<number | null>(null);
  const modeRef = useRef<TestMode>(initialMode);
  modeRef.current = mode;
  const difficultyRef = useRef<Difficulty>(difficulty);
  difficultyRef.current = difficulty;

  // Fresh-state mirror so timer callbacks and handlers never go stale.
  const stateRef = useRef({ words, typed, wordIdx, status });
  stateRef.current = { words, typed, wordIdx, status };

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const finish = useCallback(() => {
    stopTimer();
    const s = stateRef.current;
    const entries = entriesRef.current;
    const correct = entries.reduce((a, e) => a + (e.correct ? 1 : 0), 0);
    const total = entries.length;
    const m = modeRef.current;
    const elapsedSec =
      startRef.current !== null ? (Date.now() - startRef.current) / 1000 : 0;
    // Word, quote, daily, code, hindi, git, and zen modes score over the actual elapsed time; timer modes over the mode.
    const untimed = isWordMode(m) || isQuoteMode(m) || isZenMode(m) || isDailyMode(m) || isCodeMode(m) || isHindiMode(m) || isGitMode(m);
    const minutes = untimed ? Math.max(elapsedSec / 60, 1 / 600) : m / 60;
    const durationSec = untimed ? elapsedSec : m;

    let correctLetters = 0;
    let incorrectLetters = 0;
    let extra = 0;
    let correctSpaces = 0;
    let incorrectSpaces = 0;
    for (const e of entries) {
      if (e.ch === " ") {
        if (e.correct) correctSpaces++;
        else incorrectSpaces++;
      } else if (e.extra) {
        extra++;
      } else if (e.correct) {
        correctLetters++;
      } else {
        incorrectLetters++;
      }
    }

    let missed = 0;
    const last = Math.min(s.wordIdx, s.words.length - 1);
    for (let i = 0; i <= last; i++) {
      const w = s.words[i];
      const t = s.typed[i] ?? "";
      for (let p = t.length; p < w.length; p++) missed++;
    }

    // Include the trailing partial second so the chart does not drop the
    // final burst (word modes often finish mid-second).
    const sr = secRef.current;
    if (sr.count > 0) {
      sr.samples.push(sr.count * 12);
      sr.count = 0;
      sr.whole++;
    }

    // Per-key stats: average time since the previous keystroke (capped so a
    // mid-test pause does not distort the numbers) plus miss counts. Letters
    // are folded to lowercase so shifted keystrokes still map to their key.
    const agg = new Map<string, { delay: number; hits: number; misses: number }>();
    for (let i = 1; i < entries.length; i++) {
      const e = entries[i];
      if (e.ch.length !== 1) continue;
      const key = e.ch === " " ? " " : e.ch.toLowerCase();
      const prev = agg.get(key) ?? { delay: 0, hits: 0, misses: 0 };
      prev.delay += Math.min(e.t - entries[i - 1].t, 2000);
      prev.hits++;
      if (!e.correct) prev.misses++;
      agg.set(key, prev);
    }
    const keyStats: KeyStat[] = [...agg.entries()]
      .map(([key, a]) => ({ key, avgMs: a.delay / a.hits, hits: a.hits, misses: a.misses }))
      .sort((a, b) => b.avgMs - a.avgMs);

    setResult({
      mode: modeRef.current,
      difficulty: difficultyRef.current,
      wpm: wpmFromChars(correctLetters + correctSpaces, minutes),
      raw: wpmFromChars(total, minutes),
      accuracy: accuracy(correct, total),
      consistency: consistency(secRef.current.samples),
      correctChars: correctLetters + correctSpaces,
      incorrectChars: incorrectLetters + incorrectSpaces,
      extraChars: extra,
      missedChars: missed,
      durationSec,
      wpmHistory: [...secRef.current.samples],
      keyStats,
    });
    setStatus("finished");
    setTimeLeft(0);
  }, [stopTimer]);

  const finishRef = useRef(finish);
  finishRef.current = finish;

  const ensureStarted = useCallback(() => {
    if (startRef.current !== null) return;
    startRef.current = Date.now();
    secRef.current = { whole: 0, count: 0, samples: [] };
    setStatus("running");
    timerRef.current = window.setInterval(() => {
      if (startRef.current === null) return;
      const elapsed = (Date.now() - startRef.current) / 1000;
      const whole = Math.floor(elapsed);
      const sr = secRef.current;
      while (sr.whole < whole) {
        sr.samples.push(sr.count * 12); // per-second raw WPM
        sr.count = 0;
        sr.whole++;
      }
      const m = modeRef.current;
      if (isZenMode(m)) {
        // Zen has no timer: the HUD clock counts up, the run never ends on its own.
        setTimeLeft(elapsed);
      } else if (!isWordMode(m) && !isQuoteMode(m) && !isDailyMode(m) && !isCodeMode(m) && !isHindiMode(m) && !isGitMode(m)) {
        // Word, quote, daily, code, hindi, and git modes end on the final word, not on a timer.
        const left = Math.max(0, m - elapsed);
        setTimeLeft(left);
        if (left <= 0) finishRef.current();
      }
    }, 200);
  }, []);

  const handleKey = useCallback(
    (key: string) => {
      const s = stateRef.current;
      if (s.status === "finished") return;

      if (key === "Backspace") {
        const t = s.typed[s.wordIdx] ?? "";
        if (t.length > 0) {
          const nt = [...s.typed];
          nt[s.wordIdx] = t.slice(0, -1);
          setTyped(nt);
          entriesRef.current.pop();
        } else if (s.wordIdx > 0) {
          setWordIdx(s.wordIdx - 1);
        }
        return;
      }

      if (key === " ") {
        const t = s.typed[s.wordIdx] ?? "";
        if (t.length === 0) return;
        ensureStarted();
        const expected = s.words[s.wordIdx];
        entriesRef.current.push({ ch: " ", correct: t === expected, extra: false, t: Date.now() });
        secRef.current.count++;
        const nextIdx = s.wordIdx + 1;
        // Word, quote, daily, code, hindi, and git modes end on the final word, not on a timer.
        const endsByWords =
          isWordMode(modeRef.current) ||
          isQuoteMode(modeRef.current) ||
          isDailyMode(modeRef.current) ||
          isCodeMode(modeRef.current) ||
          isHindiMode(modeRef.current) ||
          isGitMode(modeRef.current);
        if (!endsByWords && nextIdx + EXTEND_AT >= s.words.length) {
          const nw = [...s.words, ...randomWords(EXTEND_BY, difficultyRef.current)];
          const nt = [...s.typed];
          while (nt.length < nw.length) nt.push("");
          setWords(nw);
          setTyped(nt);
        }
        setWordIdx(nextIdx);
        if (endsByWords) {
          setTimeLeft(s.words.length - nextIdx);
          if (nextIdx >= s.words.length) {
            finishRef.current();
            return;
          }
        }
        return;
      }

      if (key.length !== 1) return;
      ensureStarted();
      const expected = s.words[s.wordIdx];
      const t = s.typed[s.wordIdx] ?? "";
      if (t.length >= expected.length + MAX_EXTRA) return;
      const pos = t.length;
      const extra = pos >= expected.length;
      const correct = !extra && key === expected[pos];
      const nt = [...s.typed];
      nt[s.wordIdx] = t + key;
      setTyped(nt);
      entriesRef.current.push({ ch: key, correct, extra, t: Date.now() });
      secRef.current.count++;
    },
    [ensureStarted]
  );

  const restart = useCallback(() => {
    stopTimer();
    startRef.current = null;
    entriesRef.current = [];
    secRef.current = { whole: 0, count: 0, samples: [] };
    const g = genWords(modeRef.current, difficultyRef.current);
    setWords(g.words);
    setQuoteAuthor(g.author);
    setTyped(Array(g.words.length).fill(""));
    setWordIdx(0);
    setStatus("idle");
    setTimeLeft(initialTimeLeft(modeRef.current, g.words));
    setResult(null);
  }, [stopTimer]);

  const changeMode = useCallback(
    (m: TestMode) => {
      setMode(m);
      modeRef.current = m;
      restart();
    },
    [restart]
  );

  const changeDifficulty = useCallback(
    (d: Difficulty) => {
      setDifficulty(d);
      difficultyRef.current = d;
      saveDifficulty(d);
      restart();
    },
    [restart]
  );

  /** Toggling blind mode needs no restart: it only changes how the active
   *  word renders, so the current run keeps going untouched. */
  const changeBlind = useCallback((b: boolean) => {
    setBlind(b);
    saveBlindMode(b);
  }, []);

  /** Switching caret style needs no restart: it only changes how the caret
   *  renders, so the current run keeps going untouched. */
  const changeCaretStyle = useCallback((c: CaretStyle) => {
    setCaretStyle(c);
    saveCaretStyle(c);
  }, []);

  useEffect(() => stopTimer, [stopTimer]);

  const getLive = useCallback(() => {
    const entries = entriesRef.current;
    const correct = entries.reduce((a, e) => a + (e.correct ? 1 : 0), 0);
    const elapsed =
      startRef.current !== null ? (Date.now() - startRef.current) / 1000 : 0;
    const minutes = elapsed / 60;
    return {
      wpm: wpmFromChars(correct, minutes),
      acc: accuracy(correct, entries.length),
    };
  }, []);

  return {
    mode,
    difficulty,
    blind,
    caretStyle,
    words,
    quoteAuthor,
    typed,
    wordIdx,
    status,
    timeLeft,
    result,
    handleKey,
    restart,
    changeMode,
    changeDifficulty,
    changeBlind,
    changeCaretStyle,
    finish,
    getLive,
  };
}
