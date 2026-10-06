import { useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface Props {
  words: string[];
  typed: string[];
  wordIdx: number;
}

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
        {words.map((w, wi) => {
          const t = typed[wi] ?? "";
          const isActive = wi === wordIdx;
          return (
            <span
              key={wi}
              data-word={wi}
              data-wordend={wi}
              className={`type-word${isActive ? " type-word-active" : ""}`}
            >
              {w.split("").map((ch, ci) => {
                let cls = "ch-untyped";
                if (ci < t.length) cls = t[ci] === ch ? "ch-ok" : "ch-bad";
                return (
                  <span key={ci} data-pos={`${wi}:${ci}`} className={cls}>
                    {ch}
                  </span>
                );
              })}
              {t.length > w.length &&
                t
                  .slice(w.length)
                  .split("")
                  .map((ch, ei) => (
                    <span key={`e${ei}`} className="ch-extra">
                      {ch}
                    </span>
                  ))}
            </span>
          );
        })}
      </motion.div>
      <motion.div
        className="type-caret"
        animate={{ x: caret.x, y: caret.y, height: caret.h }}
        transition={{ type: "spring", stiffness: 550, damping: 42 }}
      />
    </div>
  );
}
