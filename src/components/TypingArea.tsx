import { memo, useLayoutEffect, useRef } from "react";

interface Props {
  words: string[];
  typed: string[];
  wordIdx: number;
}

/** One word of the test. Memoized so a keystroke only re-renders the word
 *  being typed: every other word gets identical props (same word string,
 *  same typed string, same active flag) and skips rendering entirely. */
const Word = memo(function Word({
  word,
  typed,
  active,
  index,
}: {
  word: string;
  typed: string;
  active: boolean;
  index: number;
}) {
  return (
    <span
      data-word={index}
      data-wordend={index}
      className={`type-word${active ? " type-word-active" : ""}`}
    >
      {word.split("").map((ch, ci) => {
        let cls = "ch-untyped";
        if (ci < typed.length) cls = typed[ci] === ch ? "ch-ok" : "ch-bad";
        return (
          <span key={ci} data-pos={`${index}:${ci}`} className={cls}>
            {ch}
          </span>
        );
      })}
      {typed.length > word.length &&
        typed
          .slice(word.length)
          .split("")
          .map((ch, ei) => (
            <span key={`e${ei}`} className="ch-extra">
              {ch}
            </span>
          ))}
    </span>
  );
});

export default function TypingArea({ words, typed, wordIdx }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wordsRef = useRef<HTMLDivElement>(null);
  const caretRef = useRef<HTMLDivElement>(null);

  // Caret position and line scroll are written straight to the DOM.
  // Doing this through React state would cost two extra renders plus two
  // framer-motion spring restarts on every keystroke, which is the typing
  // jank. A short CSS transition keeps the motion smooth for free.
  useLayoutEffect(() => {
    const cont = containerRef.current;
    if (!cont) return;
    const slot = (typed[wordIdx] ?? "").length;
    const crect = cont.getBoundingClientRect();

    let x = 0;
    let y = 0;
    let h = 34;
    const anchor = cont.querySelector(`[data-pos="${wordIdx}:${slot}"]`);
    if (anchor) {
      const r = (anchor as HTMLElement).getBoundingClientRect();
      x = r.left - crect.left;
      y = r.top - crect.top;
      h = r.height;
    } else {
      const wend = cont.querySelector(`[data-wordend="${wordIdx}"]`);
      if (wend) {
        const r = (wend as HTMLElement).getBoundingClientRect();
        x = r.right - crect.left;
        y = r.top - crect.top;
        h = r.height;
      }
    }
    const caret = caretRef.current;
    if (caret) {
      caret.style.transform = `translate(${x}px, ${y}px)`;
      caret.style.height = `${h}px`;
    }

    const wordEl = cont.querySelector(`[data-word="${wordIdx}"]`);
    const wordsEl = wordsRef.current;
    if (wordEl && wordsEl) {
      const r = (wordEl as HTMLElement).getBoundingClientRect();
      const targetTop = crect.top + 8;
      const shift = Math.min(0, targetTop - r.top);
      wordsEl.style.transform = `translateY(${shift}px)`;
    }
  }, [words, typed, wordIdx]);

  return (
    <div
      ref={containerRef}
      className="relative h-[7rem] sm:h-[8.5rem] overflow-hidden select-none"
    >
      <div
        ref={wordsRef}
        className="type-words text-[1.15rem] leading-[2rem] sm:text-[1.7rem] sm:leading-[2.8rem] font-type tracking-wide"
      >
        {words.map((w, wi) => (
          <Word
            key={wi}
            word={w}
            typed={typed[wi] ?? ""}
            active={wi === wordIdx}
            index={wi}
          />
        ))}
      </div>
      <div ref={caretRef} className="type-caret" />
    </div>
  );
}
