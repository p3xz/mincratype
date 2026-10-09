/** Compact blocky sparkline of the per-mode WPM history for the results
 *  screen. Stepped path like the main WPM chart, no smoothing, crisp edges. */

interface Props {
  /** WPM of each recorded run, oldest first. */
  values: number[];
}

const W = 300;
const H = 64;
const PAD = 8;

export default function PbSparkline({ values }: Props) {
  const n = values.length;
  const max = Math.max(10, ...values);
  const min = Math.min(...values);
  const span = Math.max(1, max - min);

  const x = (i: number) =>
    n <= 1 ? W / 2 : PAD + (i / (n - 1)) * (W - PAD * 2);
  const y = (v: number) => PAD + (H - PAD * 2) - ((v - min) / span) * (H - PAD * 2);

  let d = `M ${x(0).toFixed(1)} ${y(values[0]).toFixed(1)}`;
  for (let i = 1; i < n; i++) {
    d += ` H ${x(i).toFixed(1)} V ${y(values[i]).toFixed(1)}`;
  }

  // Dashed marker at the all-time best of this history.
  const bestIdx = values.indexOf(max);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-auto"
      role="img"
      aria-label={`WPM history across ${n} runs, best ${Math.round(max)}`}
    >
      <line
        x1={PAD}
        x2={W - PAD}
        y1={y(max)}
        y2={y(max)}
        stroke="var(--color-grass-400)"
        strokeWidth={1}
        strokeDasharray="5 4"
        opacity={0.5}
      />
      <path
        d={d}
        fill="none"
        stroke="var(--color-grass-400)"
        strokeWidth={2.5}
        strokeLinejoin="miter"
        shapeRendering="crispEdges"
      />
      {values.map((v, i) => (
        <rect
          key={i}
          x={x(i) - 2.5}
          y={y(v) - 2.5}
          width={5}
          height={5}
          fill={i === bestIdx ? "var(--color-grass-400)" : "var(--color-cave-950)"}
          stroke="var(--color-grass-400)"
          strokeWidth={i === bestIdx ? 0 : 2}
        />
      ))}
    </svg>
  );
}
