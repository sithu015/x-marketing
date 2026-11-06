/** 5×8 dot grammar for the X / AGENCY lockup. */

const CORE = {
  G: [".XXXX", "XXXXX", "XX...", "XX.XX", "XX.XX", "XX.XX", "XXXXX", ".XXXX"],
  X: ["XX.XX", "XX.XX", "XXXXX", ".XXX.", ".XXX.", "XXXXX", "XX.XX", "XX.XX"],
} as const;

/** Stroke weight 2, counter 1. */
export const GLYPHS: Record<string, readonly string[]> = {
  ...CORE,
  A: [".XXX.", "XXXXX", "XX.XX", "XX.XX", "XXXXX", "XX.XX", "XX.XX", "XX.XX"],
  C: [".XXXX", "XXXXX", "XX...", "XX...", "XX...", "XX...", "XXXXX", ".XXXX"],
  E: ["XXXXX", "XXXXX", "XX...", "XXXX.", "XXXX.", "XX...", "XXXXX", "XXXX."],
  N: ["XX..X", "XXX.X", "XXXX.", "XX.XX", "X.XXX", "X.XXX", "X..XX", "X..XX"],
  Y: ["XX.XX", "XX.XX", ".XXX.", ".XXX.", "..X..", "..X..", "..X..", "..X.."],
};

export const CELL = 5;
export const ROWS = 8;
export const GAP = 1.6;
export const ADVANCE = CELL + GAP;
export const RADIUS_RATIO = 0.44;

export function dotCount(ch: string): number {
  const g = GLYPHS[ch];
  if (!g) return 0;
  return g.join("").split("X").length - 1;
}

export function countText(text: string): number {
  return [...text].reduce((n, ch) => n + dotCount(ch), 0);
}

export function splitWordmark(width: number, text: string, playable = false): string[] {
  if (playable) {
    const size = width < 760 ? 3 : 4;
    const chars = [...text];
    const lines: string[] = [];
    for (let i = 0; i < chars.length; i += size) lines.push(chars.slice(i, i + size).join(""));
    return lines;
  }
  if (width >= 980 || !text.includes("-")) return [text];
  const i = text.indexOf("-");
  return [text.slice(0, i + 1), text.slice(i + 1)];
}
