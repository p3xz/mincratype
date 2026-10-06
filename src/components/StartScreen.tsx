import { motion } from "framer-motion";
import type { TestMode } from "../hooks/useTypingTest";
import type { PersonalBest } from "../lib/storage";

interface Props {
  bests: Record<TestMode, PersonalBest | null>;
  onStart: () => void;
}

/** First thing a visitor sees: logo, best WPM, one big START button.
 *  No settings here; those live behind the setup button on the test screen. */
export default function StartScreen({ bests, onStart }: Props) {
  const overall = Object.values(bests).reduce(
    (m, b) => Math.max(m, b ? b.wpm : 0),
    0
  );
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex-1 flex flex-col items-center justify-center text-center px-6 py-10"
    >
      <p className="pixel-text text-[10px] text-grass-500 tracking-widest mb-6">
        A BLOCKY TYPING TRIAL
      </p>
      <h1 className="mc-logo text-4xl sm:text-6xl leading-tight animate-float-slow">
        MINCRA<span className="logo-accent">TYPE</span>
      </h1>
      <p className="mt-6 max-w-md text-sm text-stone-400 font-type leading-relaxed">
        How fast can you mine those words? Pick a timer, a word count, a
        quote, code keywords, hindi, zen, or the daily challenge.
      </p>
      <p className="pixel-text text-[10px] text-xp-400 mt-8">
        {overall > 0 ? `PERSONAL BEST ${Math.round(overall)} WPM` : "NO BEST YET - SET ONE"}
      </p>
      <button
        onClick={onStart}
        className="mc-btn mc-btn-primary mt-10 text-base sm:text-lg px-12 sm:px-16 py-5 min-h-[56px]"
      >
        START
      </button>
      <p className="mc-kb-hint mt-6 hidden sm:block">OR PRESS ANY KEY</p>
      <p className="mc-kb-hint mt-6 sm:hidden">TAP START TO PLAY</p>
    </motion.div>
  );
}
