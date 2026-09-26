import { motion } from "framer-motion";
import { isWordMode, wordCountOf } from "../hooks/useTypingTest";
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
            {isWordMode(m) ? `${wordCountOf(m)}w` : `${m}s`}
          </button>
          <span className="pixel-text text-[8px] text-stone-500">
            {bests[m] ? `BEST ${Math.round(bests[m]!.wpm)}` : "NO BEST"}
          </span>
        </div>
      ))}
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
        How fast can you mine those words? Pick a timer or a word count, then
        type like the cave is collapsing.
      </p>

      <div className="mt-10 flex flex-col items-center gap-6">
        <div>
          <p className="pixel-text text-[8px] text-stone-500 tracking-widest mb-3">
            TIMER
          </p>
          <ModeButtons modes={TIME_MODES} active={mode} onMode={onMode} bests={bests} />
        </div>
        <div>
          <p className="pixel-text text-[8px] text-stone-500 tracking-widest mb-3">
            WORDS
          </p>
          <ModeButtons modes={WORD_MODES} active={mode} onMode={onMode} bests={bests} />
        </div>
      </div>

      <button onClick={onStart} className="mc-btn mc-btn-primary mt-10 text-sm px-10 py-4">
        START TEST
      </button>
      <p className="mc-kb-hint mt-6">OR PRESS ANY KEY</p>
    </motion.div>
  );
}
