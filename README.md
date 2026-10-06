# MINCRATYPE

## What

A Minecraft-inspired typing test. Pick a timer, mine words with your keyboard,
and watch a blocky on-screen keyboard light up with every keystroke. It runs as
a single-page app in the browser, with timer modes of 15, 30, 60, and 120
seconds and monkeytype-style scoring (WPM, accuracy, consistency).

A fan-made parody concept. Not affiliated with Mojang or Microsoft.

## Why

Built as a personal project, a playful take on the classic typing-test format
wrapped in a Minecraft look.

## When

September 2026.

## What we used

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Framer Motion
- Web Audio API (synthesized clicks and chime, no audio assets)
- Fonts: Press Start 2P for the pixel UI, JetBrains Mono for the typing text

## Why we used this

- **React + TypeScript:** component-based UI with type-safe code for the typing
  engine and score calculations.
- **Vite:** fast dev server and production builds for a client-only app.
- **Tailwind CSS v4:** utility-first styling for the blocky, pixel-art look.
- **Framer Motion:** animations such as the on-screen keyboard sliding up on
  first keystroke.
- **Web Audio API:** synthesized key clicks and the completion chime, so the
  app ships with no audio assets.
- **Press Start 2P / JetBrains Mono:** the pixel font carries the Minecraft
  theme while the mono font keeps the typing text readable.

## How it works

- Random words are drawn from a ~200 common-word list. Timer modes: 15, 30, 60, 120 seconds.
- The timer starts on your first keystroke. `Tab` restarts at any time.
- A full on-screen keyboard slides up from below on your first keystroke. It is
  driven by the same window-level `keydown`/`keyup` listeners as the test, so the
  visual keys depress in sync with your physical keyboard. Keys are also
  clickable/tappable, which makes the game playable on touch devices.
- Personal best WPM per mode is stored in `localStorage`.

## Scoring formula

- **WPM** = (correct characters / 5) / minutes elapsed
- **Raw WPM** = (all typed entries / 5) / minutes elapsed
- **Accuracy** = correct keystrokes / total keystrokes (backspace removes the entry)
- **Consistency** = monkeytype-style: `100 * (1 - stddev / mean)` of per-second raw WPM
- Characters are reported as correct / incorrect / extra / missed. A space that
  completes a word counts as a correct character; extra letters typed past a
  word's end count as extra.

## Controls

| Key | Action |
| --- | ------ |
| Any key | Start test / type |
| Space | Next word |
| Backspace | Delete char (or jump to previous word) |
| Tab | Restart test |
| Enter | Retry on the results screen |

## Getting started

```bash
npm install
npm run dev      # local dev server
npm run build    # production build (tsc + vite)
```

## Credits

Built by Namish Yadav ([@p3xz](https://github.com/p3xz)). A fan-made parody
concept, not affiliated with Mojang or Microsoft.
