import { AnimatePresence, motion } from "framer-motion";
import SettingsPanel from "./SettingsPanel";
import type { CaretStyle, Difficulty, TestMode, Theme } from "../hooks/useTypingTest";
import type { PersonalBest } from "../lib/storage";

interface Props {
  open: boolean;
  onClose: () => void;
  mode: TestMode;
  difficulty: Difficulty;
  blind: boolean;
  caretStyle: CaretStyle;
  theme: Theme;
  onMode: (m: TestMode) => void;
  onDifficulty: (d: Difficulty) => void;
  onBlind: (b: boolean) => void;
  onCaret: (c: CaretStyle) => void;
  onTheme: (t: Theme) => void;
  bests: Record<TestMode, PersonalBest | null>;
}

/** Settings live here now, behind the setup button on the test screen.
 *  Picking a mode or difficulty applies it and closes the modal. */
export default function SettingsModal({
  open,
  onClose,
  mode,
  difficulty,
  blind,
  caretStyle,
  theme,
  onMode,
  onDifficulty,
  onBlind,
  onCaret,
  onTheme,
  bests,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/70"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 12 }}
            transition={{ duration: 0.2 }}
            className="mc-panel relative w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Test settings"
          >
            <button
              onClick={onClose}
              aria-label="Close settings"
              className="mc-btn mc-btn-sm absolute top-4 right-4"
            >
              X
            </button>
            <p className="pixel-text text-[10px] text-grass-500 tracking-widest mb-6 text-center">
              SETTINGS
            </p>
            <SettingsPanel
              mode={mode}
              difficulty={difficulty}
              blind={blind}
              caretStyle={caretStyle}
              theme={theme}
              onMode={onMode}
              onDifficulty={onDifficulty}
              onBlind={onBlind}
              onCaret={onCaret}
              onTheme={onTheme}
              bests={bests}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
