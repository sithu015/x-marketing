import { useEffect, useRef } from "react";
import { ADVANCE, GLYPHS, RADIUS_RATIO, ROWS, splitWordmark } from "@/lib/glyphs";

export type Hud = {
  ms: number;
  popped: number;
  left: number;
  found: number;
  done: boolean;
};

type Gift = "flower" | "gift" | "spark" | "mark";

type Dot = {
  hx: number;
  hy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  h: number;
  r: number;
  popT?: number;
  dead?: boolean;
  gift: Gift;
  n: number;
};

type Cell = { ch: string; x: number; y: number; pitch: number };
type Speck = { x: number; y: number; vx: number; vy: number; r: number; life: number; decay: number };
type Flash = { x: number; y: number; t0: number; big?: boolean; rad: number };

type Props = {
  text: string;
  lines?: readonly string[];
  interactive?: boolean;
  playable?: boolean;
  showGrid?: boolean;
  muted?: boolean;
  round?: number;
  onHud?: (hud: Hud) => void;
  className?: string;
  label?: string;
};

const BASE = [200, 200, 200] as const;

function mix(a: readonly number[], b: readonly number[], t: number) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}
function rgba(c: number[], a: number) {
  return `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
}

export function fmtTime(ms: number) {
  const s = ms / 1000;
  const m = Math.floor(s / 60);
  return String(m).padStart(2, "0") + ":" + (s % 60).toFixed(2).padStart(5, "0");
}

export function Wordmark() {
  return null;
}
