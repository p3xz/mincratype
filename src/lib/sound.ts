// Tiny synthesized sound engine: mechanical key clicks and an XP-style
// finish chime. Everything is generated with the Web Audio API, no assets.

let ctx: AudioContext | null = null;
let muted = false;

try {
  muted = localStorage.getItem("mincratype-muted") === "1";
} catch {
  muted = false;
}

function ac(): AudioContext | null {
  try {
    if (!ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      ctx = new AC();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

export function isMuted(): boolean {
  return muted;
}

/** Create/resume the AudioContext early (inside a user gesture) so the
 *  first keystroke does not pay context-creation cost mid-test. */
export function warmAudio(): void {
  ac();
}

export function setMuted(m: boolean): void {
  muted = m;
  try {
    localStorage.setItem("mincratype-muted", m ? "1" : "0");
  } catch {
    // ignore
  }
}

function blip(
  freq: number,
  dur: number,
  type: OscillatorType,
  gain: number,
  when = 0
): void {
  const c = ac();
  if (!c || muted) return;
  const t = c.currentTime + when;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq * (1 + (Math.random() - 0.5) * 0.07), t);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.03);
}

/** Short mechanical click for letter keys. Slight pitch wobble per press. */
export function keyClick(): void {
  blip(1700 + Math.random() * 700, 0.035, "square", 0.045);
}

/** Deeper thock for space / enter / backspace. */
export function keyThock(): void {
  blip(300, 0.06, "triangle", 0.11);
  blip(150, 0.09, "sine", 0.1, 0.008);
}

/** Original XP-orb-like ascending arpeggio for test finish. */
export function finishChime(): void {
  const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
  notes.forEach((f, i) => blip(f, 0.4, "triangle", 0.085, i * 0.085));
}
