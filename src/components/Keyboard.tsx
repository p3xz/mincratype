import { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";

export interface KeyDef {
  code: string;
  label: string;
  sub?: string;
  w?: number;
  tone?: "stone" | "dark" | "tnt" | "grass" | "grassblock";
  /** character typed when the key is clicked, or a special key name */
  action?: string;
}

const letter = (code: string, label: string): KeyDef => ({
  code,
  label,
  w: 1,
  action: label.toLowerCase(),
});

const digit = (code: string, label: string, sub: string): KeyDef => ({
  code,
  label,
  sub,
  w: 1,
  action: label,
});

/** Keyboard row layout, also reused by the results key heatmap. */
export const ROWS: KeyDef[][] = [
  [
    { code: "Escape", label: "ESC", w: 1, tone: "dark" },
    digit("Digit1", "1", "!"),
    digit("Digit2", "2", "@"),
    digit("Digit3", "3", "#"),
    digit("Digit4", "4", "$"),
    digit("Digit5", "5", "%"),
    digit("Digit6", "6", "^"),
    digit("Digit7", "7", "&"),
    digit("Digit8", "8", "*"),
    digit("Digit9", "9", "("),
    digit("Digit0", "0", ")"),
    { code: "Minus", label: "-", sub: "_", w: 1, action: "-" },
    { code: "Equal", label: "=", sub: "+", w: 1, action: "=" },
    { code: "Backspace", label: "BKSP", w: 2, tone: "tnt", action: "Backspace" },
  ],
  [
    { code: "Tab", label: "TAB", w: 1.5, tone: "dark", action: "Tab" },
    letter("KeyQ", "Q"),
    letter("KeyW", "W"),
    letter("KeyE", "E"),
    letter("KeyR", "R"),
    letter("KeyT", "T"),
    letter("KeyY", "Y"),
    letter("KeyU", "U"),
    letter("KeyI", "I"),
    letter("KeyO", "O"),
    letter("KeyP", "P"),
    { code: "BracketLeft", label: "[", sub: "{", w: 1, action: "[" },
    { code: "BracketRight", label: "]", sub: "}", w: 1, action: "]" },
    { code: "Backslash", label: "\\", sub: "|", w: 1.5, action: "\\" },
  ],
  [
    { code: "CapsLock", label: "CAPS", w: 1.75, tone: "dark" },
    letter("KeyA", "A"),
    letter("KeyS", "S"),
    letter("KeyD", "D"),
    letter("KeyF", "F"),
    letter("KeyG", "G"),
    letter("KeyH", "H"),
    letter("KeyJ", "J"),
    letter("KeyK", "K"),
    letter("KeyL", "L"),
    { code: "Semicolon", label: ";", sub: ":", w: 1, action: ";" },
    { code: "Quote", label: "'", sub: '"', w: 1, action: "'" },
    { code: "Enter", label: "ENTER", w: 2.25, tone: "grass", action: "Enter" },
  ],
  [
    { code: "ShiftLeft", label: "SHIFT", w: 2.25, tone: "dark" },
    letter("KeyZ", "Z"),
    letter("KeyX", "X"),
    letter("KeyC", "C"),
    letter("KeyV", "V"),
    letter("KeyB", "B"),
    letter("KeyN", "N"),
    letter("KeyM", "M"),
    { code: "Comma", label: ",", sub: "<", w: 1, action: "," },
    { code: "Period", label: ".", sub: ">", w: 1, action: "." },
    { code: "Slash", label: "/", sub: "?", w: 1, action: "/" },
    { code: "ShiftRight", label: "SHIFT", w: 2.75, tone: "dark" },
  ],
  [
    { code: "ControlLeft", label: "CTRL", w: 1.25, tone: "dark" },
    { code: "MetaLeft", label: "WIN", w: 1.25, tone: "dark" },
    { code: "AltLeft", label: "ALT", w: 1.25, tone: "dark" },
    { code: "Space", label: "SPACE", w: 6.25, tone: "grassblock", action: " " },
    { code: "AltRight", label: "ALT", w: 1.25, tone: "dark" },
    { code: "MetaRight", label: "WIN", w: 1.25, tone: "dark" },
    { code: "Fn", label: "FN", w: 1.25, tone: "dark" },
  ],
];

/** Pretty label for the pressed-key pills. */
export function pillLabel(code: string, key: string): string {
  if (code === "Space") return "SPACE";
  if (key === " ") return "SPACE";
  const named: Record<string, string> = {
    Backspace: "BKSP",
    Enter: "ENTER",
    Tab: "TAB",
    ShiftLeft: "SHIFT",
    ShiftRight: "SHIFT",
    CapsLock: "CAPS",
    Escape: "ESC",
    ControlLeft: "CTRL",
    ControlRight: "CTRL",
    AltLeft: "ALT",
    AltRight: "ALT",
    MetaLeft: "WIN",
    MetaRight: "WIN",
  };
  if (named[code]) return named[code];
  return key.length === 1 ? key.toUpperCase() : key.toUpperCase();
}

interface Props {
  visible: boolean;
  pressed: Set<string>;
  recent: string[];
  onPress: (code: string, action: string | undefined, down: boolean) => void;
}

/** One physical key. Memoized on a per-key `isPressed` boolean so the ~60
 *  keys do not all re-render when the `pressed` Set identity changes on
 *  every keydown/keyup; only the key that changed state re-renders. */
const Key = memo(function Key({
  def,
  isPressed,
  rowIdx,
  keyIdx,
  onPress,
}: {
  def: KeyDef;
  isPressed: boolean;
  rowIdx: number;
  keyIdx: number;
  onPress: Props["onPress"];
}) {
  return (
    <button
      type="button"
      data-pressed={isPressed}
      data-tone={def.tone ?? "stone"}
      data-var={(rowIdx * 7 + keyIdx * 13) % 3}
      className="mc-key"
      style={{ flexGrow: def.w ?? 1, flexBasis: 0 }}
      onPointerDown={(e) => {
        e.preventDefault();
        onPress(def.code, def.action, true);
      }}
      onPointerUp={() => onPress(def.code, undefined, false)}
      onPointerLeave={() => onPress(def.code, undefined, false)}
      onPointerCancel={() => onPress(def.code, undefined, false)}
      onContextMenu={(e) => e.preventDefault()}
      aria-label={def.label}
    >
      {def.sub && <span className="k-sub">{def.sub}</span>}
      <span className="k-label">{def.label}</span>
    </button>
  );
});

export default function Keyboard({ visible, pressed, recent, onPress }: Props) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: "115%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "115%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 230, damping: 25 }}
          className="w-full"
        >
          <div className="flex items-center justify-center gap-2 mb-3 flex-wrap min-h-[30px]">
            {recent.length > 0 ? (
              recent.map((r, i) => (
                <span key={`${r}-${i}`} className="mc-slot">
                  {r}
                </span>
              ))
            ) : (
              <span className="mc-kb-hint">PRESS ANY KEY</span>
            )}
          </div>
          <div className="mc-frame">
            {ROWS.map((row, ri) => (
              <div key={ri} className="flex gap-1.5 mb-1.5 last:mb-0">
                {row.map((k, ki) => (
                  <Key
                    key={k.code}
                    def={k}
                    isPressed={pressed.has(k.code)}
                    rowIdx={ri}
                    keyIdx={ki}
                    onPress={onPress}
                  />
                ))}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
