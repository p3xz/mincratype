import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTypingTest } from "./hooks/useTypingTest";
import { getAllBests } from "./lib/storage";
import TypingArea from "./components/TypingArea";
import ModeSelect from "./components/ModeSelect";
import TopBar from "./components/TopBar";
import Footer from "./components/Footer";

export default function App() {
  const test = useTypingTest(30);
  const [phase, setPhase] = useState<"menu" | "active">("menu");
  const [bests, setBests] = useState(getAllBests);

  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const keyRef = useRef(test.handleKey);
  keyRef.current = test.handleKey;
  const restartRef = useRef(test.restart);
  restartRef.current = test.restart;

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        if (phaseRef.current === "active") restartRef.current();
        return;
      }
      if (phaseRef.current === "menu") {
        setPhase("active");
        return;
      }
      if (e.key === " ") e.preventDefault();
      if (!e.repeat) keyRef.current(e.key);
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, []);

  const startTest = () => setPhase("active");
  const exitToMenu = () => {
    test.restart();
    setBests(getAllBests());
    setPhase("menu");
  };

  const live = test.getLive();

  return (
    <div className="min-h-full bg-cave-950 text-stone-200 flex flex-col">
      <div className="cave-bg" />
      <div className="cave-grain" />
      <div className="cave-vignette" />

      <main className="flex-1 flex flex-col w-full max-w-5xl mx-auto px-6">
        <AnimatePresence mode="wait">
          {phase === "menu" ? (
            <motion.div
              key="menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex-1 flex items-center justify-center py-16"
            >
              <ModeSelect
                mode={test.mode}
                onMode={test.changeMode}
                onStart={startTest}
                bests={bests}
              />
            </motion.div>
          ) : (
            <motion.div
              key="game"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex-1 flex flex-col py-8"
            >
              <TopBar
                mode={test.mode}
                timeLeft={test.timeLeft}
                wpm={live.wpm}
                acc={live.acc}
                onRestart={test.restart}
                onExit={exitToMenu}
              />
              <div className="flex-1 flex flex-col justify-center py-10">
                {test.status !== "finished" ? (
                  <TypingArea
                    words={test.words}
                    typed={test.typed}
                    wordIdx={test.wordIdx}
                  />
                ) : (
                  test.result && (
                    <div className="font-type text-sm space-y-1 text-center">
                      <div className="pixel-text text-4xl text-grass-400 mb-6">
                        {Math.round(test.result.wpm)} WPM
                      </div>
                      <div className="text-stone-400">
                        raw {Math.round(test.result.raw)} - acc{" "}
                        {test.result.accuracy.toFixed(1)}% - con{" "}
                        {test.result.consistency.toFixed(1)}%
                      </div>
                      <div className="text-stone-500 text-xs mt-2">
                        press TAB to retry
                      </div>
                    </div>
                  )
                )}
              </div>
              <p className="mc-kb-hint text-center pb-4">
                TAB TO RESTART
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
