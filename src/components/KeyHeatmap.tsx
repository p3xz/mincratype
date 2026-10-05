import type { KeyStat } from "../hooks/useTypingTest";
import { ROWS } from "./Keyboard";

/** Green (fast) to red (slow) tint for a heat value in [0, 1]. */
function heatColor(v: number): string {
  const from = [124, 194, 78]; // xp grass green
  const to = [168, 58, 46]; // tnt red
  const c = from.map((f, i) => Math.round(f + (to[i] - f) * v));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

interface Props {
  stats: KeyStat[];
}

/** Key heatmap on the results screen: keys glow green to red by how slow
 *  they were this run, with a badge on keys that were missed. */
export default function KeyHeatmap({ stats }: Props) {
  const byKey = new Map(stats.map((s) => [s.key, s]));
  // Normalize slowness across keys with enough data to be meaningful.
  const reliable = stats.filter((s) => s.hits >= 3);
  const min = reliable.length > 0 ? Math.min(...reliable.map((s) => s.avgMs)) : 0;
  const max = reliable.length > 0 ? Math.max(...reliable.map((s) => s.avgMs)) : 1;
  const span = Math.max(max - min, 1);

  const slowest = stats[0] ?? null;
  const mostMissed = stats.length > 0 ? [...stats].sort((a, b) => b.misses - a.misses)[0] : null;
  const keyName = (k: string) => (k === " " ? "SPACE" : k.toUpperCase());

  return (
    <div className="mc-panel p-4 mt-8 text-left">
      <div className="pixel-text text-[8px] text-stone-500 mb-1">KEY HEATMAP</div>
      <p className="text-[11px] text-stone-600 font-type mb-3">
        slowest{" "}
        {slowest && (
          <span className="text-stone-300">
            {keyName(slowest.key)} ({Math.round(slowest.avgMs)}ms)
          </span>
        )}
        {" · "}most missed{" "}
        {mostMissed && mostMissed.misses > 0 ? (
          <span className="text-stone-300">
            {keyName(mostMissed.key)} ({mostMissed.misses})
          </span>
        ) : (
          <span className="text-stone-300">none</span>
        )}
      </p>
      <div className="mc-frame">
        {ROWS.map((row, ri) => (
          <div key={ri} className="flex gap-1.5 mb-1.5 last:mb-0">
            {row.map((k, ki) => {
              const s = k.action !== undefined ? byKey.get(k.action) : undefined;
              const hot = s !== undefined && s.hits >= 3;
              const v = hot ? (s.avgMs - min) / span : 0;
              return (
                <div
                  key={k.code}
                  data-var={(ri * 7 + ki * 13) % 3}
                  data-tone={k.tone ?? "stone"}
                  className="mc-key"
                  style={{
                    flexGrow: k.w ?? 1,
                    flexBasis: 0,
                    cursor: "default",
                    ...(hot ? { backgroundColor: heatColor(v) } : {}),
                  }}
                  aria-label={`${k.label}${s ? `, avg ${Math.round(s.avgMs)}ms, ${s.misses} misses` : ""}`}
                >
                  {k.sub && <span className="k-sub">{k.sub}</span>}
                  <span className="k-label">{k.label}</span>
                  {s !== undefined && s.misses > 0 && (
                    <span className="absolute -top-1 -right-1 pixel-text text-[7px] bg-red-700 text-white border border-black px-1 py-0.5">
                      {s.misses}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3">
        <span className="pixel-text text-[7px] text-stone-500">FAST</span>
        <div
          className="flex-1 h-2 border border-black"
          style={{
            background: `linear-gradient(to right, ${heatColor(0)}, ${heatColor(1)})`,
          }}
        />
        <span className="pixel-text text-[7px] text-stone-500">SLOW</span>
      </div>
    </div>
  );
}
