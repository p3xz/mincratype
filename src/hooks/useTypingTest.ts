import { useCallback, useEffect, useRef, useState } from "react";
import { WORDS } from "../data/words";
import { accuracy, consistency, wpmFromChars } from "../lib/stats";

export type TestMode = 15 | 30 | 60 | 120;
export type TestStatus = "idle" | "running" | "finished";

export interface KeyEntry {
  ch: string;
  correct: boolean;
  extra: boolean;
}

export interface TestResult {
  mode: TestMode;
  wpm: number;
  raw: number;
  accuracy: number;
  consistency: number;
  correctChars: number;
  incorrectChars: number;
  extraChars: number;
  missedChars: number;
  durationSec: number;
}

const INITIAL_WORDS = 150;
const EXTEND_AT = 12;
const EXTEND_BY = 60;
const MAX_EXTRA = 8;

function randomWords(n: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    out.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
  }
  return out;
}

export function useTypingTest(initialMode: TestMode = 30) {
  const [mode, setMode] = useState<TestMode>(initialMode);
  const [words, setWords] = useState<string[]>(() => randomWords(INITIAL_WORDS));
  const [typed, setTyped] = useState<string[]>(() => Array(INITIAL_WORDS).fill(""));
  const [wordIdx, setWordIdx] = useState(0);
  const [status, setStatus] = useState<TestStatus>("idle");
  const [timeLeft, setTimeLeft] = useState<number>(initialMode);
  const [result, setResult] = useState<TestResult | null>(null);

  const entriesRef = useRef<KeyEntry[]>([]);
  const startRef = useRef<number | null>(null);
  const secRef = useRef({ whole: 0, count: 0, samples: [] as number[] });
  const timerRef = useRef<number | null>(null);
  const modeRef = useRef<TestMode>(initialMode);
  modeRef.current = mode;

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
    const minutes = modeRef.current / 60;

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

    setResult({
      mode: modeRef.current,
      wpm: wpmFromChars(correctLetters + correctSpaces, minutes),
      raw: wpmFromChars(total, minutes),
      accuracy: accuracy(correct, total),
      consistency: consistency(secRef.current.samples),
      correctChars: correctLetters + correctSpaces,
      incorrectChars: incorrectLetters + incorrectSpaces,
      extraChars: extra,
      missedChars: missed,
      durationSec: modeRef.current,
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
      const left = Math.max(0, modeRef.current - elapsed);
      setTimeLeft(left);
      if (left <= 0) finishRef.current();
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
        entriesRef.current.push({ ch: " ", correct: t === expected, extra: false });
        secRef.current.count++;
        if (s.wordIdx + 1 + EXTEND_AT >= s.words.length) {
          const nw = [...s.words, ...randomWords(EXTEND_BY)];
          const nt = [...s.typed];
          while (nt.length < nw.length) nt.push("");
          setWords(nw);
          setTyped(nt);
        }
        setWordIdx(s.wordIdx + 1);
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
      entriesRef.current.push({ ch: key, correct, extra });
      secRef.current.count++;
    },
    [ensureStarted]
  );

  const restart = useCallback(() => {
    stopTimer();
    startRef.current = null;
    entriesRef.current = [];
    secRef.current = { whole: 0, count: 0, samples: [] };
    const w = randomWords(INITIAL_WORDS);
    setWords(w);
    setTyped(Array(w.length).fill(""));
    setWordIdx(0);
    setStatus("idle");
    setTimeLeft(modeRef.current);
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
    words,
    typed,
    wordIdx,
    status,
    timeLeft,
    result,
    handleKey,
    restart,
    changeMode,
    getLive,
  };
}
