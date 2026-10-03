import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTypingTest, isCodeMode, isDailyMode, isHindiMode, isQuoteMode, isWordMode, isZenMode } from "./hooks/useTypingTest";
import { getAllBests, getBest, saveBest, getDailyBest, saveDailyBest } from "./lib/storage";
import { finishChime, isMuted, keyClick, keyThock, setMuted } from "./lib/sound";
import TypingArea from "./components/TypingArea";
import ModeSelect from "./components/ModeSelect";
import TopBar from "./components/TopBar";
import Footer from "./components/Footer";
import Results from "./components/Results";
import Keyboard, { pillLabel } from "./components/Keyboard";

export default function App() {
  const test = useTypingTest(30);
  const [phase, setPhase] = useState<"menu" | "active">("menu");
  const [bests, setBests] = useState(getAllBests);
  const [pressed, setPressed] = useState<Set<string>>(new Set());
  const [recent, setRecent] = useState<string[]>([]);
  const [kbVisible, setKbVisible] = useState(false);
  const [muted, setMutedState] = useState(isMuted());
  const [isNewBest, setIsNewBest] = useState(false);

  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const statusRef = useRef(test.status);
  statusRef.current = test.status;

  // The keyboard slides up on the first keystroke of a run and hides on reset.
  useEffect(() => {
    if (test.status === "running") setKbVisible(true);
    if (test.status === "idle") {
      setKbVisible(false);
      setRecent([]);
    }
  }, [test.status]);

  // On finish: record personal best, play the XP chime.
  useEffect(() => {
    if (test.status === "finished" && test.result) {
      const daily = isDailyMode(test.result.mode);
      setIsNewBest(
        daily
          ? saveDailyBest(test.result.wpm, test.result.accuracy)
          : saveBest(test.result.mode, test.result.wpm, test.result.accuracy)
      );
      setBests(getAllBests());
      finishChime();
    }
  }, [test.status, test.result]);

  const pressVisual = useCallback((code: string, down: boolean) => {
    setPressed((prev) => {
      const next = new Set(prev);
      if (down) next.add(code);
      else next.delete(code);
      return next;
    });
  }, []);

  const pushRecent = useCallback((label: string) => {
    setRecent((prev) => {
      if (prev[prev.length - 1] === label) return prev;
      return [...prev.slice(-5), label];
    });
  }, []);

  const playFor = useCallback((key: string) => {
    if (key === " " || key === "Backspace" || key === "Enter") keyThock();
    else keyClick();
  }, []);

  const doRestart = useCallback(() => {
    test.restart();
  }, [test]);

  /** Single routing point for physical and on-screen key presses. */
  const routeKey = useCallback(
    (key: string) => {
      if (key === "Tab") {
        doRestart();
        return;
      }
      if (statusRef.current === "finished") {
        if (key === "Enter") doRestart();
        return;
      }
      // Zen runs never end on their own: Enter finishes on demand.
      if (key === "Enter" && isZenMode(test.mode)) {
        test.finish();
        return;
      }
      test.handleKey(key);
    },
    [doRestart, test]
  );
  const routeRef = useRef(routeKey);
  routeRef.current = routeKey;

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (document.activeElement instanceof HTMLButtonElement) {
        document.activeElement.blur();
      }
      pressVisual(e.code, true);
      if (e.key === "Tab") e.preventDefault();
      if (phaseRef.current === "menu") {
        // First key only opens the test; it is not typed.
        pushRecent(pillLabel(e.code, e.key));
        playFor(e.key);
        setPhase("active");
        return;
      }
      if (e.key === " ") e.preventDefault();
      if (!e.repeat) {
        pushRecent(pillLabel(e.code, e.key));
        playFor(e.key);
        routeRef.current(e.key);
      }
    };
    const up = (e: KeyboardEvent) => pressVisual(e.code, false);
    const blur = () => setPressed(new Set());
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, [pressVisual, pushRecent, playFor]);

  const onKbPress = useCallback(
    (code: string, action: string | undefined, down: boolean) => {
      pressVisual(code, down);
      if (!down) return;
      pushRecent(pillLabel(code, action ?? code));
      if (action === undefined) return; // pure modifier key
      if (phaseRef.current === "menu") {
        setPhase("active");
        return;
      }
      playFor(action);
      routeRef.current(action);
    },
    [pressVisual, pushRecent, playFor]
  );

  const toggleMute = useCallback(() => {
    setMutedState((m) => {
      setMuted(!m);
      return !m;
    });
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

      <main className="flex-1 flex flex-col w-full max-w-5xl mx-auto px-4 sm:px-6">
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
                difficulty={test.difficulty}
                onMode={test.changeMode}
                onDifficulty={test.changeDifficulty}
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
              className="flex-1 flex flex-col py-6 sm:py-8"
            >
              <TopBar
                mode={test.mode}
                difficulty={test.difficulty}
                total={
                  isZenMode(test.mode)
                    ? 1
                    : isWordMode(test.mode) || isQuoteMode(test.mode) || isDailyMode(test.mode) || isCodeMode(test.mode) || isHindiMode(test.mode)
                      ? test.words.length
                      : test.mode
                }
                timeLeft={test.timeLeft}
                wpm={live.wpm}
                acc={live.acc}
                muted={muted}
                onToggleMute={toggleMute}
                onRestart={test.restart}
                onExit={exitToMenu}
                onEnd={test.finish}
              />
              <div className="flex-1 flex flex-col justify-center py-8">
                {test.quoteAuthor && test.status !== "finished" && (
                  <p className="pixel-text text-[10px] text-stone-500 text-center mb-4">
                    {test.quoteAuthor.toUpperCase()}
                  </p>
                )}
                {test.status !== "finished" ? (
                  <TypingArea
                    words={test.words}
                    typed={test.typed}
                    wordIdx={test.wordIdx}
                  />
                ) : (
                  test.result && (
                    <Results
                      result={test.result}
                      isNewBest={isNewBest}
                      best={
                        isDailyMode(test.result.mode)
                          ? getDailyBest()
                          : getBest(test.result.mode)
                      }
                      onRetry={test.restart}
                      onMenu={exitToMenu}
                    />
                  )
                )}
              </div>
              <Keyboard
                visible={kbVisible}
                pressed={pressed}
                recent={recent}
                onPress={onKbPress}
              />
              {test.status !== "finished" && (
                <p className="mc-kb-hint text-center pt-4">
                  {isZenMode(test.mode)
                    ? "TAB TO RESTART - ENTER TO END"
                    : "TAB TO RESTART"}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
