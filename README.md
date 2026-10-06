# MINCRATYPE

> A Minecraft-inspired typing test that lets you pick a timer and mine words with your keyboard while a blocky on-screen keyboard lights up with every keystroke, a playful personal take on the classic typing-test format wrapped in a Minecraft look.

![Status](https://img.shields.io/badge/status-active-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

A fan-made parody concept. Not affiliated with Mojang or Microsoft. Built in September 2026.

## Features

- **Timer modes**: 15, 30, 60, and 120 second tests with monkeytype-style scoring (WPM, accuracy, consistency).
- **Synced on-screen keyboard**: a blocky keyboard slides up from below on your first keystroke, driven by the same window-level `keydown`/`keyup` listeners as the test, so visual keys depress in sync with your physical keyboard. Keys are also clickable and tappable, which makes the game playable on touch devices.
- **Personal bests**: your best WPM per mode is stored in `localStorage`.
- **Word engine**: random words are drawn from a ~200 common-word list, and the timer starts on your first keystroke.
- **Synthesized audio**: key clicks and a completion chime are generated with the Web Audio API, so the app ships with no audio assets.

## Tech Stack

![TypeScript](https://skillicons.dev/icons?i=ts) ![React](https://skillicons.dev/icons?i=react) ![Vite](https://skillicons.dev/icons?i=vite) ![Tailwind CSS](https://skillicons.dev/icons?i=tailwind)

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Framer Motion
- Web Audio API (synthesized clicks and chime, no audio assets)
- Fonts: Press Start 2P for the pixel UI, JetBrains Mono for the typing text

**Why this stack:** React and TypeScript give a component-based UI with type-safe code for the typing engine and score calculations. Vite provides a fast dev server and production builds for this client-only app. Tailwind CSS v4 offers utility-first styling for the blocky, pixel-art look. Framer Motion powers animations such as the on-screen keyboard sliding up on the first keystroke. Press Start 2P carries the Minecraft theme while JetBrains Mono keeps the typing text readable.

## How it works

- Random words are drawn from a ~200 common-word list. Timer modes: 15, 30, 60, 120 seconds.
- The timer starts on your first keystroke. `Tab` restarts at any time.
- A full on-screen keyboard slides up from below on your first keystroke. It is driven by the same window-level `keydown`/`keyup` listeners as the test, so the visual keys depress in sync with your physical keyboard. Keys are also clickable/tappable, which makes the game playable on touch devices.
- Personal best WPM per mode is stored in `localStorage`.

## Scoring formula

- **WPM** = (correct characters / 5) / minutes elapsed
- **Raw WPM** = (all typed entries / 5) / minutes elapsed
- **Accuracy** = correct keystrokes / total keystrokes (backspace removes the entry)
- **Consistency** = monkeytype-style: `100 * (1 - stddev / mean)` of per-second raw WPM
- Characters are reported as correct / incorrect / extra / missed. A space that completes a word counts as a correct character; extra letters typed past a word's end count as extra.

## Controls

| Key | Action |
| --- | ------ |
| Any key | Start test / type |
| Space | Next word |
| Backspace | Delete char (or jump to previous word) |
| Tab | Restart test |
| Enter | Retry on the results screen |

## Quick Start

### Prerequisites

- Node.js with npm (no pinned version in this repo)
- React 19, TypeScript ~6.0, Vite 8, Tailwind CSS v4, and Framer Motion 13 (all pulled from `package.json`)

### Installation

1. Clone the repo:

   ```bash
   git clone https://github.com/p3xz/mincratype.git
   cd mincratype
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the local dev server:

   ```bash
   npm run dev
   ```

4. Build for production:

   ```bash
   npm run build
   ```

## Usage

Start the dev server with `npm run dev`, open the app in your browser, and press any key to begin a typing test. The timer starts on your first keystroke and `Tab` restarts at any time.

## Contributing

Pull requests are welcome. Keep changes small and in the spirit of a playful, client-only typing game. This project has no env vars or backend configuration.

## License

MIT. See [LICENSE](LICENSE) for the full text.

## Credits

Built by Namish Yadav ([@p3xz](https://github.com/p3xz)). A fan-made parody concept, not affiliated with Mojang or Microsoft.
