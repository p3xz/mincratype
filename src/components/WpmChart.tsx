/** Blocky per-second WPM line chart for the results screen. Drawn as an SVG
 *  with a stepped path so it keeps the pixel look: no smoothing, crisp edges. */

interface Props {
  /** Raw WPM samples, one per elapsed second. */
  data: number[];
}

const W = 600;
const H = 170;
const PAD_L = 40;
const PAD_R = 12;
const PAD_T = 14;
const PAD_B = 26;

export default function WpmChart({ data }: Props) {
  const n = data.length;
  const iw = W - PAD_L - PAD_R;
  const ih = H - PAD_T - PAD_B;
  const max = Math.max(10, ...data);
  const step = n > 1 ? max / 3 : max;

  const x = (i: number) => (n <= 1 ? PAD_L : PAD_L + (i / (n - 1)) * iw);
  const y = (v: number) => PAD_T + ih - (v / max) * ih;

  // Stepped path: horizontal then vertical between samples, for the blocky feel.
  let d = `M ${x(0).toFixed(1)} ${y(data[0]).toFixed(1)}`;
  for (let i = 1; i < n; i++) {
    d += ` H ${x(i).toFixed(1)} V ${y(data[i]).toFixed(1)}`;
  }
  const fill = `${d} L ${x(n - 1).toFixed(1)} ${(PAD_T + ih).toFixed(1)} L ${x(0).toFixed(1)} ${(PAD_T + ih).toFixed(1)} Z`;

  const ticks = [0, 1, 2, 3].map((t) => t * step);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-auto"
      role="img"
      aria-label={`WPM per second, peak ${Math.round(max)}`}
    >
      {ticks.map((t, i) => (
        <g key={i}>
          <line
            x1={PAD_L}
            x2={W - PAD_R}
            y1={y(t)}
            y2={y(t)}
            stroke="#2b241c"
            strokeWidth={1}
            strokeDasharray={t === 0 ? undefined : "4 4"}
          />
          <text
            x={PAD_L - 6}
            y={y(t) + 3}
            textAnchor="end"
            fontSize={10}
            fill="#6e6a61"
            fontFamily="JetBrains Mono, monospace"
          >
            {Math.round(t)}
          </text>
        </g>
      ))}
      <text
        x={W - PAD_R}
        y={H - 8}
        textAnchor="end"
        fontSize={10}
        fill="#6e6a61"
        fontFamily="JetBrains Mono, monospace"
      >
        {n}s
      </text>
      <text
        x={PAD_L - 6}
        y={PAD_T - 4}
        textAnchor="end"
        fontSize={9}
        fill="#6e6a61"
        fontFamily="'Press Start 2P', monospace"
      >
        WPM
      </text>
      <path d={fill} fill="rgba(156, 204, 101, 0.16)" stroke="none" />
      <path
        d={d}
        fill="none"
        stroke="#9ccc65"
        strokeWidth={3}
        strokeLinejoin="miter"
        shapeRendering="crispEdges"
      />
      {data.map((v, i) => (
        <rect
          key={i}
          x={x(i) - 3}
          y={y(v) - 3}
          width={6}
          height={6}
          fill="#0d0b09"
          stroke="#9ccc65"
          strokeWidth={2}
        />
      ))}
    </svg>
  );
}
