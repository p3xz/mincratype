import { useEffect, useRef } from "react";
import { useTypingTest, type TestMode } from "./hooks/useTypingTest";
import TypingArea from "./components/TypingArea";

const MODES: TestMode[] = [15, 30, 60, 120];

export default function App() {
  const test = useTypingTest(30);
  const keyRef = useRef(test.handleKey);
  keyRef.current = test.handleKey;
  const restartRef = useRef(test.restart);
  restartRef.current = test.restart;

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        restartRef.current();
        return;
      }
      if (e.key === " ") e.preventDefault();
      if (!e.repeat) keyRef.current(e.key);
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, []);

  const live = test.getLive();

  return (
    <div className="min-h-full bg-cave-950 text-stone-200">
      <div className="cave-bg" />
      <div className="cave-grain" />
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="flex items-center gap-2 mb-6">
          {MODES.map((m) => (
            <button
              key={m}
              onClick={() => test.changeMode(m)}
              className={`px-3 py-1 text-sm border ${
                test.mode === m ? "border-grass-500 text-grass-400" : "border-stone-700 text-stone-500"
              }`}
            >
              {m}s
            </button>
          ))}
          <div className="ml-auto flex gap-6 text-sm font-type">
            <span>time {Math.ceil(test.timeLeft)}s</span>
            <span>wpm {Math.round(live.wpm)}</span>
            <span>acc {Math.round(live.acc)}%</span>
          </div>
        </div>

        {test.status !== "finished" ? (
          <TypingArea words={test.words} typed={test.typed} wordIdx={test.wordIdx} />
        ) : (
          test.result && (
            <div className="font-type text-sm space-y-1">
              <div className="text-4xl text-grass-400 mb-4">{Math.round(test.result.wpm)} wpm</div>
              <div>raw {Math.round(test.result.raw)}</div>
              <div>accuracy {test.result.accuracy.toFixed(1)}%</div>
              <div>consistency {test.result.consistency.toFixed(1)}%</div>
              <div>
                chars {test.result.correctChars}/{test.result.incorrectChars}/
                {test.result.extraChars}/{test.result.missedChars}
              </div>
            </div>
          )
        )}

        <button
          onClick={() => test.restart()}
          className="mt-8 px-4 py-2 border border-stone-700 text-sm"
        >
          restart (tab)
        </button>
      </div>
    </div>
  );
}
