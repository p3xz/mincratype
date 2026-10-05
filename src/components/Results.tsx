import { motion } from "framer-motion";
import { isWordPoolMode, modeLabel } from "../hooks/useTypingTest";
import type { TestResult } from "../hooks/useTypingTest";
import type { PersonalBest } from "../lib/storage";
import WpmChart from "./WpmChart";
import KeyHeatmap from "./KeyHeatmap";

interface Props {
  result: TestResult;
  isNewBest: boolean;
  best: PersonalBest | null;
  onRetry: () => void;
  onMenu: () => void;
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="mc-panel px-4 py-3 text-left">
      <div className="pixel-text text-[8px] text-stone-500 mb-2">{label}</div>
      <div className={`pixel-text text-sm ${accent ? "text-xp-400" : "text-stone-100"}`}>
        {value}
      </div>
    </div>
  );
}

export default function Results({ result, isNewBest, best, onRetry, onMenu }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full max-w-2xl mx-auto text-center"
    >
      <p className="pixel-text text-[10px] text-stone-500 tracking-widest mb-4">
        TEST COMPLETE
      </p>

      <div className="relative inline-block">
        <div className="pixel-text text-6xl sm:text-7xl text-grass-400 mb-2">
          {Math.round(result.wpm)}
        </div>
        <div className="pixel-text text-[10px] text-stone-400">WPM</div>
        {isNewBest && (
          <motion.div
            initial={{ scale: 0, rotate: -12 }}
            animate={{ scale: 1, rotate: 6 }}
            transition={{ type: "spring", stiffness: 300, damping: 14, delay: 0.25 }}
            className="absolute -top-4 -right-16 sm:-right-24 mc-btn mc-btn-primary text-[9px] px-3 py-2"
          >
            NEW BEST
          </motion.div>
        )}
      </div>

      {!isNewBest && best && (
        <p className="pixel-text text-[8px] text-stone-500 mt-3">
          PERSONAL BEST {Math.round(best.wpm)} WPM
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-8 text-left">
        <Stat label="RAW WPM" value={String(Math.round(result.raw))} />
        <Stat label="ACCURACY" value={`${result.accuracy.toFixed(1)}%`} accent />
        <Stat label="CONSISTENCY" value={`${result.consistency.toFixed(1)}%`} />
        <Stat
          label="CHARACTERS"
          value={`${result.correctChars}/${result.incorrectChars}/${result.extraChars}/${result.missedChars}`}
        />
        <Stat label="MODE" value={modeLabel(result.mode) + (result.difficulty !== "all" && isWordPoolMode(result.mode) ? ` ${result.difficulty}` : "")} />
        <Stat label="TIME" value={`${Math.round(result.durationSec)}s`} />
      </div>
      <p className="text-[11px] text-stone-600 font-type mt-3">
        correct / incorrect / extra / missed characters
      </p>

      {result.wpmHistory.length > 1 && (
        <div className="mc-panel p-4 mt-8 text-left">
          <div className="pixel-text text-[8px] text-stone-500 mb-3">WPM PER SECOND</div>
          <WpmChart data={result.wpmHistory} />
        </div>
      )}

      {result.keyStats.length > 0 && <KeyHeatmap stats={result.keyStats} />}

      <div className="flex flex-wrap justify-center gap-4 mt-8">
        <button onClick={onRetry} className="mc-btn mc-btn-primary">
          RETRY
        </button>
        <button onClick={onMenu} className="mc-btn">
          CHANGE MODE
        </button>
      </div>
      <p className="mc-kb-hint mt-6">TAB TO RETRY - ENTER WORKS TOO</p>
    </motion.div>
  );
}
