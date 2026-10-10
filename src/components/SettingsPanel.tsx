import { useState } from "react";
import { CARET_STYLES, DIFFICULTIES, THEMES, dailyKey, difficultyLabel, difficultyShort, isWordPoolMode, modeShort } from "../hooks/useTypingTest";
import type { CaretStyle, Difficulty, TestMode, Theme } from "../hooks/useTypingTest";
import type { PersonalBest } from "../lib/storage";
import { SOUND_PACKS } from "../lib/sound";
import type { SoundPack } from "../lib/sound";

interface Props {
  mode: TestMode;
  difficulty: Difficulty;
  blind: boolean;
  caretStyle: CaretStyle;
  theme: Theme;
  soundPack: SoundPack;
  onMode: (m: TestMode) => void;
  onDifficulty: (d: Difficulty) => void;
  onBlind: (b: boolean) => void;
  onCaret: (c: CaretStyle) => void;
  onTheme: (t: Theme) => void;
  onSoundPack: (p: SoundPack) => void;
  bests: Record<TestMode, PersonalBest | null>;
}

const TIME_MODES: TestMode[] = [15, 30, 60, 120];
const WORD_MODES: TestMode[] = ["w25", "w50", "w100"];
const QUOTE_MODES: TestMode[] = ["quote"];
const ZEN_MODES: TestMode[] = ["zen"];
const DAILY_MODES: TestMode[] = ["daily"];
const CODE_MODES: TestMode[] = ["code"];
const HINDI_MODES: TestMode[] = ["hindi"];
const GIT_MODES: TestMode[] = ["git"];

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
        className="w-20 min-h-[44px] bg-cave-900 border border-stone-700 px-3 py-2 text-center font-type text-sm text-stone-200 placeholder:text-stone-600 outline-none focus:border-grass-500"
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

/** All mode and difficulty controls. Lives inside the settings modal now;
 *  the start screen is just a logo and a START button. */
export default function SettingsPanel({ mode, difficulty, blind, caretStyle, theme, soundPack, onMode, onDifficulty, onBlind, onCaret, onTheme, onSoundPack, bests }: Props) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex flex-col items-center gap-6">
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
        {isWordPoolMode(mode) && (
          <div>
            <p className="pixel-text text-[8px] text-stone-500 tracking-widest mb-3">
              DIFFICULTY
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  onClick={() => onDifficulty(d)}
                  title={difficultyLabel(d)}
                  className={`mc-btn mc-btn-sm ${difficulty === d ? "mc-btn-primary" : ""}`}
                >
                  {difficultyShort(d)}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-stone-600 font-type mt-3 max-w-xs">
              Filters the word list for timer, word-count, and zen runs:{" "}
              {difficultyLabel("all")}, {difficultyLabel("short")}, or{" "}
              {difficultyLabel("long")}.
            </p>
          </div>
        )}
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
            GIT
          </p>
          <ModeButtons modes={GIT_MODES} active={mode} onMode={onMode} bests={bests} />
          <p className="text-[10px] text-stone-600 font-type mt-3 max-w-xs">
            50 Git and GitHub keywords, like fork, clone, push, and commit.
          </p>
        </div>
        <div>
          <p className="pixel-text text-[8px] text-stone-500 tracking-widest mb-3">
            ZEN
          </p>
          <ModeButtons modes={ZEN_MODES} active={mode} onMode={onMode} bests={bests} />
        </div>
        <div>
          <p className="pixel-text text-[8px] text-stone-500 tracking-widest mb-3">
            CARET STYLE
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {CARET_STYLES.map((c) => (
              <button
                key={c}
                onClick={() => onCaret(c)}
                aria-pressed={caretStyle === c}
                className={`mc-btn mc-btn-sm ${caretStyle === c ? "mc-btn-primary" : ""}`}
              >
                <span className="caret-preview" data-style={c} aria-hidden="true" />
                {c.toUpperCase()}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-stone-600 font-type mt-3 max-w-xs">
            Pick the caret: a thin line, a block over the next character, a
            short underline, or an outline box.
          </p>
        </div>
        <div>
          <p className="pixel-text text-[8px] text-stone-500 tracking-widest mb-3">
            THEME
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => onTheme(t.id)}
                aria-pressed={theme === t.id}
                className={`mc-btn mc-btn-sm ${theme === t.id ? "mc-btn-primary" : ""}`}
              >
                <span
                  className="theme-swatch"
                  style={{ background: t.swatch }}
                  aria-hidden="true"
                />
                {t.label.toUpperCase()}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-stone-600 font-type mt-3 max-w-xs">
            Recolor the whole test: Overworld greens, Nether reds, End
            purples, or Deep Dark teal.
          </p>
        </div>
        <div>
          <p className="pixel-text text-[8px] text-stone-500 tracking-widest mb-3">
            SOUND PACK
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {SOUND_PACKS.map((p) => (
              <button
                key={p}
                onClick={() => onSoundPack(p)}
                aria-pressed={soundPack === p}
                className={`mc-btn mc-btn-sm ${soundPack === p ? "mc-btn-primary" : ""}`}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-stone-600 font-type mt-3 max-w-xs">
            Clacky is bright and sharp, thocky is deep and creamy, silent
            is a barely-there tap for quiet rooms. Picking a pack plays a
            preview.
          </p>
        </div>
        <div>
          <p className="pixel-text text-[8px] text-stone-500 tracking-widest mb-3">
            BLIND MODE
          </p>
          <button
            onClick={() => onBlind(!blind)}
            aria-pressed={blind}
            className={`mc-btn mc-btn-sm ${blind ? "mc-btn-primary" : ""}`}
          >
            {blind ? "ON" : "OFF"}
          </button>
          <p className="text-[10px] text-stone-600 font-type mt-3 max-w-xs">
            Hide typed feedback on the current word: no green, red, or extra
            letters until the word is done.
          </p>
        </div>
      </div>
    </div>
  );
}
