import { memo, useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

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
  const [caret, setCaret] = useState({ x: 0, y: 0, h: 34 });
  const [shift, setShift] = useState(0);

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
    setCaret({ x, y, h });

    const wordEl = cont.querySelector(`[data-word="${wordIdx}"]`);
    if (wordEl) {
      const r = (wordEl as HTMLElement).getBoundingClientRect();
      const targetTop = crect.top + 8;
      setShift(Math.min(0, targetTop - r.top));
    }
  }, [words, typed, wordIdx]);

  return (
    <div
      ref={containerRef}
      className="relative h-[7rem] sm:h-[8.5rem] overflow-hidden select-none"
    >
      <motion.div
        animate={{ y: shift }}
        transition={{ type: "spring", stiffness: 320, damping: 34 }}
        className="text-[1.15rem] leading-[2rem] sm:text-[1.7rem] sm:leading-[2.8rem] font-type tracking-wide"
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
      </motion.div>
      <motion.div
        className="type-caret"
        animate={{ x: caret.x, y: caret.y, height: caret.h }}
        transition={{ type: "spring", stiffness: 550, damping: 42 }}
      />
    </div>
  );
}
