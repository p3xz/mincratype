// Tiny synthesized sound engine: mechanical key clicks and an XP-style
// finish chime. Everything is generated with the Web Audio API, no assets.

let ctx: AudioContext | null = null;
let muted = false;

export type SoundPack = "clacky" | "thocky" | "silent";
export const SOUND_PACKS: SoundPack[] = ["clacky", "thocky", "silent"];

let pack: SoundPack = "clacky";

try {
  muted = localStorage.getItem("mincratype-muted") === "1";
  const stored = localStorage.getItem("mincratype-soundpack");
  if (stored === "clacky" || stored === "thocky" || stored === "silent") {
    pack = stored;
  }
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

export function getSoundPack(): SoundPack {
  return pack;
}

export function setSoundPack(p: SoundPack): void {
  pack = p;
  try {
    localStorage.setItem("mincratype-soundpack", p);
  } catch {
    // ignore
  }
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

/** Short mechanical click for letter keys. Timbre comes from the sound pack. */
export function keyClick(): void {
  switch (pack) {
    case "clacky":
      // Bright, sharp plastic clack.
      blip(1700 + Math.random() * 700, 0.035, "square", 0.045);
      break;
    case "thocky":
      // Deep, creamy thock with a soft body underneath.
      blip(480 + Math.random() * 160, 0.05, "triangle", 0.085);
      blip(220, 0.07, "sine", 0.07, 0.005);
      break;
    case "silent":
      // Barely-there soft tap for quiet rooms.
      blip(1200 + Math.random() * 400, 0.03, "sine", 0.015);
      break;
  }
}

/** Deeper thock for space / enter / backspace. Timbre comes from the sound pack. */
export function keyThock(): void {
  switch (pack) {
    case "clacky":
      blip(300, 0.06, "triangle", 0.11);
      blip(150, 0.09, "sine", 0.1, 0.008);
      break;
    case "thocky":
      blip(190, 0.09, "triangle", 0.12);
      blip(95, 0.12, "sine", 0.11, 0.01);
      break;
    case "silent":
      blip(300, 0.06, "sine", 0.03);
      blip(150, 0.08, "sine", 0.025, 0.008);
      break;
  }
}

/** Original XP-orb-like ascending arpeggio for test finish. */
export function finishChime(): void {
  const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
  notes.forEach((f, i) => blip(f, 0.4, "triangle", 0.085, i * 0.085));
}
