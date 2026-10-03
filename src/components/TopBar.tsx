import { isCodeMode, isDailyMode, isHindiMode, isQuoteMode, isWordMode, isWordPoolMode, isZenMode } from "../hooks/useTypingTest";
import type { Difficulty, TestMode } from "../hooks/useTypingTest";

interface Props {
  mode: TestMode;
  difficulty: Difficulty;
  /** Denominator for the XP progress bar: seconds in timer modes, word count otherwise. */
  total: number;
  timeLeft: number;
  wpm: number;
  acc: number;
  muted: boolean;
  onToggleMute: () => void;
  onRestart: () => void;
  onExit: () => void;
  onEnd: () => void;
}

export default function TopBar({
  mode,
  difficulty,
  total,
  timeLeft,
  wpm,
  acc,
  muted,
  onToggleMute,
  onRestart,
  onExit,
  onEnd,
}: Props) {
  const zen = isZenMode(mode);
  const countMode = isWordMode(mode) || isQuoteMode(mode) || isDailyMode(mode) || isCodeMode(mode) || isHindiMode(mode);
  const showDiff = difficulty !== "all" && isWordPoolMode(mode);
  const pct = zen
    ? 100 // endless run, bar stays full
    : Math.max(0, Math.min(100, (timeLeft / total) * 100));
  return (
    <div className="w-full">
      <div className="flex items-center gap-4 mb-3">
        <span className="mc-logo text-sm cursor-pointer" onClick={onExit}>
          MINCRA<span className="logo-accent">TYPE</span>
        </span>
        <div className="flex-1 xp-bar">
          <div className="xp-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex items-center gap-4 font-type text-sm">
          <span className="pixel-text text-[10px] text-xp-400">
            {zen && "ZEN "}
            {Math.ceil(timeLeft)}
            {countMode ? "w" : "s"}
          </span>
          {showDiff && (
            <span className="pixel-text text-[8px] text-grass-400" title={difficulty === "short" ? "short words only (1-4 letters)" : "long words only (5+ letters)"}>
              {difficulty.toUpperCase()}
            </span>
          )}
          <span className="text-stone-400">
            <span className="text-stone-200 font-bold">{Math.round(wpm)}</span> wpm
          </span>
          <span className="text-stone-400">
            <span className="text-stone-200 font-bold">{Math.round(acc)}%</span> acc
          </span>
        </div>
        <button
          onClick={onToggleMute}
          className="mc-btn mc-btn-sm"
          title="Toggle sound"
        >
          {muted ? "MUTE" : "SND"}
        </button>
        <button onClick={onRestart} className="mc-btn mc-btn-sm" title="Restart (Tab)">
          RETRY
        </button>
        {zen && (
          <button onClick={onEnd} className="mc-btn mc-btn-sm" title="End run, show stats (Enter)">
            END
          </button>
        )}
      </div>
    </div>
  );
}
