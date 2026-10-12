import { modeLabel } from "../hooks/useTypingTest";
import type { TestResult } from "../hooks/useTypingTest";

const CARD_W = 1200;
const CARD_H = 630;
const PX_FONT = '"Press Start 2P", monospace';

/** Draws a Minecraft-styled result card and downloads it as a PNG. */
export async function downloadResultCard(result: TestResult): Promise<void> {
  // Try to make the bundled pixel font available to the canvas.
  try {
    await Promise.race([
      document.fonts.load(`24px ${PX_FONT}`),
      new Promise((resolve) => setTimeout(resolve, 1200)),
    ]);
  } catch {
    /* fall back to monospace */
  }

  const canvas = document.createElement("canvas");
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Dirt background with a subtle seeded checker texture.
  ctx.fillStyle = "#1a1714";
  ctx.fillRect(0, 0, CARD_W, CARD_H);
  let seed = 1337;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  for (let y = 0; y < CARD_H; y += 32) {
    for (let x = 0; x < CARD_W; x += 32) {
      if (rand() > 0.72) {
        ctx.fillStyle = rand() > 0.5 ? "#211d19" : "#161311";
        ctx.fillRect(x, y, 32, 32);
      }
    }
  }

  // Grass strip along the top, like a grass block.
  ctx.fillStyle = "#5f9e3a";
  ctx.fillRect(0, 0, CARD_W, 64);
  for (let x = 0; x < CARD_W; x += 48) {
    const drop = 8 + Math.floor(rand() * 24);
    ctx.fillStyle = "#4c7f2f";
    ctx.fillRect(x, 64, 48, drop);
  }

  // Outer pixel border.
  ctx.fillStyle = "#5f9e3a";
  ctx.fillRect(0, 0, CARD_W, 12);
  ctx.fillRect(0, CARD_H - 12, CARD_W, 12);
  ctx.fillRect(0, 0, 12, CARD_H);
  ctx.fillRect(CARD_W - 12, 0, 12, CARD_H);

  ctx.textAlign = "center";
  ctx.fillStyle = "#f5f5f4";

  // Title.
  ctx.font = `44px ${PX_FONT}`;
  ctx.fillText("MINCRATYPE", CARD_W / 2, 168);

  ctx.font = `14px ${PX_FONT}`;
  ctx.fillStyle = "#a8a29e";
  ctx.fillText("TYPING TEST RESULT", CARD_W / 2, 212);

  // Big WPM.
  ctx.fillStyle = "#a3e635";
  ctx.font = `150px ${PX_FONT}`;
  ctx.fillText(String(Math.round(result.wpm)), CARD_W / 2, 380);

  ctx.fillStyle = "#a8a29e";
  ctx.font = `18px ${PX_FONT}`;
  ctx.fillText("WPM", CARD_W / 2, 424);

  // Stat row.
  const stats: Array<[string, string]> = [
    ["ACCURACY", `${result.accuracy.toFixed(1)}%`],
    ["CONSISTENCY", `${result.consistency.toFixed(1)}%`],
    ["RAW WPM", String(Math.round(result.raw))],
    ["TIME", `${Math.round(result.durationSec)}s`],
  ];
  ctx.font = `13px ${PX_FONT}`;
  const slot = CARD_W / stats.length;
  stats.forEach(([label, value], i) => {
    const x = slot * i + slot / 2;
    ctx.fillStyle = "#78716c";
    ctx.fillText(label, x, 486);
    ctx.fillStyle = "#f5f5f4";
    ctx.font = `22px ${PX_FONT}`;
    ctx.fillText(value, x, 528);
    ctx.font = `13px ${PX_FONT}`;
  });

  // Footer: mode, date, site.
  ctx.fillStyle = "#78716c";
  ctx.font = `13px ${PX_FONT}`;
  const date = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  ctx.fillText(
    `${modeLabel(result.mode).toUpperCase()}  -  ${date.toUpperCase()}  -  MINCRATYPE.VERCEL.APP`,
    CARD_W / 2,
    584
  );

  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = `mincratype-${Math.round(result.wpm)}wpm.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
}
