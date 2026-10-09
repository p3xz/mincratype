import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTypingTest, isCodeMode, isDailyMode, isGitMode, isHindiMode, isQuoteMode, isWordMode, isZenMode } from "./hooks/useTypingTest";
import { getAllBests, getBest, saveBest, getDailyBest, saveDailyBest, recordHistory } from "./lib/storage";
import { finishChime, isMuted, keyClick, keyThock, setMuted, warmAudio } from "./lib/sound";
import TypingArea from "./components/TypingArea";
import StartScreen from "./components/StartScreen";
import SettingsModal from "./components/SettingsModal";
import TopBar from "./components/TopBar";
import Footer from "./components/Footer";
import PrivacyNote from "./components/PrivacyNote";
import Results from "./components/Results";
import Keyboard, { pillLabel } from "./components/Keyboard";

export default function App() {
  const test = useTypingTest(30);
  const [phase, setPhase] = useState<"start" | "active">("start");
  const [bests, setBests] = useState(getAllBests);
  const [pressed, setPressed] = useState<Set<string>>(new Set());
  const [recent, setRecent] = useState<string[]>([]);
  const [kbVisible, setKbVisible] = useState(false);
  const [muted, setMutedState] = useState(isMuted());
  const [isNewBest, setIsNewBest] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Hidden input that summons the OS keyboard on touch devices. Phones have
  // no physical keys, so this invisible field captures focus on Start (or on
  // tap) and the keystrokes flow through the normal window key handler.
  const inputRef = useRef<HTMLInputElement>(null);
  const focusInput = useCallback(() => {
    // Must run synchronously inside the user gesture or mobile browsers
    // will refuse to open the keyboard.
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const statusRef = useRef(test.status);
  statusRef.current = test.status;
  const privacyRef = useRef(showPrivacy);
  privacyRef.current = showPrivacy;
  const settingsRef = useRef(showSettings);
  settingsRef.current = showSettings;

  // The keyboard slides up on the first keystroke of a run and hides on reset.
  useEffect(() => {
    if (test.status === "running") setKbVisible(true);
    if (test.status === "idle") {
      setKbVisible(false);
      setRecent([]);
    }
  }, [test.status]);

  // On finish: record personal best and per-mode history, play the XP chime.
  useEffect(() => {
    if (test.status === "finished" && test.result) {
      const daily = isDailyMode(test.result.mode);
      setIsNewBest(
        daily
          ? saveDailyBest(test.result.wpm, test.result.accuracy)
          : saveBest(test.result.mode, test.result.wpm, test.result.accuracy)
      );
      recordHistory(test.result.mode, test.result.wpm, test.result.accuracy);
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

  /** Restart from a button tap: keeps the OS keyboard open on mobile. */
  const restartAndFocus = useCallback(() => {
    test.restart();
    focusInput();
  }, [test, focusInput]);

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
      // The privacy note is a quiet page: keys do not reach the test.
      if (privacyRef.current) {
        if (e.key === "Escape") setShowPrivacy(false);
        return;
      }
      // Settings are a quiet page too: keys do not reach the test.
      if (settingsRef.current) {
        if (e.key === "Escape") setShowSettings(false);
        return;
      }
      pressVisual(e.code, true);
      if (e.key === "Tab") e.preventDefault();
      if (phaseRef.current === "start") {
        // First key only opens the test; it is not typed.
        warmAudio();
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
      if (phaseRef.current === "start") {
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

  const startTest = () => {
    focusInput();
    warmAudio();
    setPhase("active");
  };
  const exitToStart = () => {
    test.restart();
    inputRef.current?.blur();
    setBests(getAllBests());
    setPhase("start");
  };

  const openSettings = () => {
    inputRef.current?.blur();
    setShowSettings(true);
  };
  const closeSettings = () => {
    setShowSettings(false);
    focusInput();
  };
  const pickMode = (m: Parameters<typeof test.changeMode>[0]) => {
    test.changeMode(m);
    closeSettings();
  };
  const pickDifficulty = (d: Parameters<typeof test.changeDifficulty>[0]) => {
    test.changeDifficulty(d);
    closeSettings();
  };
  const pickBlind = (b: boolean) => {
    test.changeBlind(b);
    closeSettings();
  };
  const pickCaretStyle = (c: Parameters<typeof test.changeCaretStyle>[0]) => {
    test.changeCaretStyle(c);
    closeSettings();
  };
  const pickTheme = (t: Parameters<typeof test.changeTheme>[0]) => {
    test.changeTheme(t);
    closeSettings();
  };

  // The theme recolors the whole page through CSS variables, so it lives
  // on the document root where every var() lookup can reach it.
  useEffect(() => {
    document.documentElement.dataset.theme = test.theme;
  }, [test.theme]);

  const live = test.getLive();

  return (
    <div className="min-h-full bg-cave-950 text-stone-200 flex flex-col">
      <div className="cave-bg" />
      <div className="cave-grain" />
      <div className="cave-vignette" />

      {/* Invisible capture field: summons the OS keyboard on touch devices.
          It stays mounted across phases so focus survives the start tap. */}
      <input
        ref={inputRef}
        className="kb-capture"
        type="text"
        aria-hidden="true"
        tabIndex={-1}
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
      />

      <main className="flex-1 flex flex-col w-full max-w-5xl mx-auto px-4 sm:px-6">
        {showPrivacy ? (
          <PrivacyNote onClose={() => setShowPrivacy(false)} />
        ) : (
        <AnimatePresence mode="wait">
          {phase === "start" ? (
            <motion.div
              key="start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex-1 flex items-center justify-center py-10"
            >
              <StartScreen bests={bests} onStart={startTest} />
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
                    : isWordMode(test.mode) || isQuoteMode(test.mode) || isDailyMode(test.mode) || isCodeMode(test.mode) || isHindiMode(test.mode) || isGitMode(test.mode)
                      ? test.words.length
                      : test.mode
                }
                timeLeft={test.timeLeft}
                wpm={live.wpm}
                acc={live.acc}
                muted={muted}
                onToggleMute={toggleMute}
                onRestart={restartAndFocus}
                onExit={exitToStart}
                onEnd={test.finish}
                onOpenSettings={openSettings}
              />
              <div
                className="flex-1 flex flex-col justify-center py-4 sm:py-8"
                onPointerDown={focusInput}
              >
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
                    blind={test.blind}
                    caretStyle={test.caretStyle}
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
                      onRetry={restartAndFocus}
                      onMenu={exitToStart}
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
                <>
                  <p className="mc-kb-hint text-center pt-4 hidden sm:block">
                    {isZenMode(test.mode)
                      ? "TAB TO RESTART - ENTER TO END"
                      : "TAB TO RESTART"}
                  </p>
                  <p className="mc-kb-hint text-center pt-4 sm:hidden">
                    {isZenMode(test.mode)
                      ? "TAP RETRY TO RESTART - TAP END TO FINISH"
                      : "TAP RETRY TO RESTART"}
                  </p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        )}
      </main>

      <SettingsModal
        open={showSettings}
        onClose={closeSettings}
        mode={test.mode}
        difficulty={test.difficulty}
        blind={test.blind}
        caretStyle={test.caretStyle}
        theme={test.theme}
        onMode={pickMode}
        onDifficulty={pickDifficulty}
        onBlind={pickBlind}
        onCaret={pickCaretStyle}
        onTheme={pickTheme}
        bests={bests}
      />

      <Footer onPrivacy={() => setShowPrivacy(true)} />
    </div>
  );
}
