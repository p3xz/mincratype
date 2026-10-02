import { useState } from "react";
import { motion } from "framer-motion";
import { dailyKey, modeShort } from "../hooks/useTypingTest";
import type { TestMode } from "../hooks/useTypingTest";
import type { PersonalBest } from "../lib/storage";

interface Props {
  mode: TestMode;
  onMode: (m: TestMode) => void;
  onStart: () => void;
  bests: Record<TestMode, PersonalBest | null>;
}

const TIME_MODES: TestMode[] = [15, 30, 60, 120];
const WORD_MODES: TestMode[] = ["w25", "w50", "w100"];
const QUOTE_MODES: TestMode[] = ["quote"];
const ZEN_MODES: TestMode[] = ["zen"];
const DAILY_MODES: TestMode[] = ["daily"];
const CODE_MODES: TestMode[] = ["code"];
const HINDI_MODES: TestMode[] = ["hindi"];

/** Smallest and largest custom timer the game allows, in seconds. */
const CUSTOM_MIN = 5;
const CUSTOM_MAX = 600;

function ModeButtons({
  modes,
  active,
  onMode,
  bests,
}: {
  modes: TestMode[];
  active: TestMode;
  onMode: (m: TestMode) => void;
  bests: Record<TestMode, PersonalBest | null>;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {modes.map((m) => (
        <div key={m} className="flex flex-col items-center gap-2">
          <button
            onClick={() => onMode(m)}
            className={`mc-btn mc-btn-sm ${active === m ? "mc-btn-primary" : ""}`}
          >
            {modeShort(m)}
          </button>
          <span className="pixel-text text-[8px] text-stone-500">
            {bests[m] ? `BEST ${Math.round(bests[m]!.wpm)}` : "NO BEST"}
          </span>
        </div>
      ))}
    </div>
  );
}

function CustomTimer({
  active,
  onMode,
}: {
  active: TestMode;
  onMode: (m: TestMode) => void;
}) {
  const [value, setValue] = useState("");
  const customActive =
    typeof active === "number" && !TIME_MODES.includes(active);
  const apply = () => {
    const secs = Math.round(Number(value));
    if (!Number.isFinite(secs) || secs <= 0) return;
    onMode(Math.min(CUSTOM_MAX, Math.max(CUSTOM_MIN, secs)));
    setValue("");
  };
  return (
    <div className="mt-3 flex items-center justify-center gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value.replace(/\D/g, "").slice(0, 3))}
        onKeyDown={(e) => {
          // Keep keystrokes here: the app routes global keys into the test.
          e.stopPropagation();
          if (e.key === "Enter") apply();
        }}
        placeholder="secs"
        inputMode="numeric"
        aria-label="Custom timer seconds"
        className="w-20 bg-cave-900 border border-stone-700 px-3 py-2 text-center font-type text-sm text-stone-200 placeholder:text-stone-600 outline-none focus:border-grass-500"
      />
      <button
        onClick={apply}
        className={`mc-btn mc-btn-sm ${customActive ? "mc-btn-primary" : ""}`}
      >
        {customActive ? modeShort(active) : "SET"}
      </button>
    </div>
  );
}

export default function ModeSelect({ mode, onMode, onStart, bests }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center text-center px-6"
    >
      <p className="pixel-text text-[10px] text-grass-500 tracking-widest mb-6">
        A BLOCKY TYPING TRIAL
      </p>
      <h1 className="mc-logo text-4xl sm:text-6xl leading-tight animate-float-slow">
        MINCRA<span className="logo-accent">TYPE</span>
      </h1>
      <p className="mt-6 max-w-md text-sm text-stone-400 font-type leading-relaxed">
        How fast can you mine those words? Pick a timer, a word count, a
        quote, code keywords, hindi, zen, or the daily challenge: same 50 words
        for everyone, new list every day.
      </p>

      <div className="mt-10 flex flex-col items-center gap-6">
        <div>
          <p className="pixel-text text-[8px] text-stone-500 tracking-widest mb-3">
            DAILY CHALLENGE
          </p>
          <ModeButtons modes={DAILY_MODES} active={mode} onMode={onMode} bests={bests} />
          <p className="text-[10px] text-stone-600 font-type mt-3 max-w-xs">
            {dailyKey()} - same 50 words for everyone, new list every day.
          </p>
        </div>
        <div>
          <p className="pixel-text text-[8px] text-stone-500 tracking-widest mb-3">
            TIMER
          </p>
          <ModeButtons modes={TIME_MODES} active={mode} onMode={onMode} bests={bests} />
          <CustomTimer active={mode} onMode={onMode} />
        </div>
        <div>
          <p className="pixel-text text-[8px] text-stone-500 tracking-widest mb-3">
            WORDS
          </p>
          <ModeButtons modes={WORD_MODES} active={mode} onMode={onMode} bests={bests} />
        </div>
        <div>
          <p className="pixel-text text-[8px] text-stone-500 tracking-widest mb-3">
            QUOTE
          </p>
          <ModeButtons modes={QUOTE_MODES} active={mode} onMode={onMode} bests={bests} />
        </div>
        <div>
          <p className="pixel-text text-[8px] text-stone-500 tracking-widest mb-3">
            CODE
          </p>
          <ModeButtons modes={CODE_MODES} active={mode} onMode={onMode} bests={bests} />
          <p className="text-[10px] text-stone-600 font-type mt-3 max-w-xs">
            50 programming keywords and symbols, like real code.
          </p>
        </div>
        <div>
          <p className="pixel-text text-[8px] text-stone-500 tracking-widest mb-3">
            HINDI
          </p>
          <ModeButtons modes={HINDI_MODES} active={mode} onMode={onMode} bests={bests} />
          <p className="text-[10px] text-stone-600 font-type mt-3 max-w-xs">
            50 common Hindi words in Roman script, like typing Hinglish.
          </p>
        </div>
        <div>
          <p className="pixel-text text-[8px] text-stone-500 tracking-widest mb-3">
            ZEN
          </p>
          <ModeButtons modes={ZEN_MODES} active={mode} onMode={onMode} bests={bests} />
        </div>
      </div>

      <button onClick={onStart} className="mc-btn mc-btn-primary mt-10 text-sm px-10 py-4">
        START TEST
      </button>
      <p className="mc-kb-hint mt-6">OR PRESS ANY KEY</p>
    </motion.div>
  );
}
