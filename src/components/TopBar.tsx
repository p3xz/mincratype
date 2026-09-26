import { isWordMode, wordCountOf } from "../hooks/useTypingTest";
import type { TestMode } from "../hooks/useTypingTest";

interface Props {
  mode: TestMode;
  timeLeft: number;
  wpm: number;
  acc: number;
  muted: boolean;
  onToggleMute: () => void;
  onRestart: () => void;
  onExit: () => void;
}

export default function TopBar({
  mode,
  timeLeft,
  wpm,
  acc,
  muted,
  onToggleMute,
  onRestart,
  onExit,
}: Props) {
  const wm = isWordMode(mode);
  const total = wm ? wordCountOf(mode)! : mode;
  const pct = Math.max(0, Math.min(100, (timeLeft / total) * 100));
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
            {Math.ceil(timeLeft)}
            {wm ? "w" : "s"}
          </span>
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
      </div>
    </div>
  );
}
