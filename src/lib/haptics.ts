// Mobile haptics: a tiny buzz on each keypress via the Vibration API.
// No-op on devices without support (desktop browsers, iOS Safari), so it
// is safe to call unconditionally. Default on: phones get the feedback,
// and the settings toggle turns it off.

let enabled = true;

try {
  const stored = localStorage.getItem("mincratype-haptics");
  if (stored === "0") enabled = false;
  else if (stored === "1") enabled = true;
} catch {
  enabled = true;
}

export function isHapticsEnabled(): boolean {
  return enabled;
}

export function setHapticsEnabled(b: boolean): void {
  enabled = b;
  try {
    localStorage.setItem("mincratype-haptics", b ? "1" : "0");
  } catch {
    // storage unavailable, ignore
  }
}

/** One short buzz, in milliseconds. Ignored where vibration is unsupported. */
function buzz(ms: number): void {
  if (!enabled) return;
  try {
    if ("vibrate" in navigator) navigator.vibrate(ms);
  } catch {
    // vibration unavailable, ignore
  }
}

/** Haptic tap for a keypress: a slightly longer buzz for the big keys
 *  (space / backspace / enter), a short tap for everything else. */
export function keyBuzz(key: string): void {
  if (key === " " || key === "Backspace" || key === "Enter") buzz(15);
  else buzz(8);
}
