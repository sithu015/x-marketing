import { useEffect, useRef, useCallback } from "react";
import { ADVANCE, GLYPHS, RADIUS_RATIO, ROWS } from "@/lib/glyphs";

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
  r: number;
  popT?: number;
  dead?: boolean;
  gift: Gift;
  n: number;
};

type Speck = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
  decay: number;
};

type Flash = {
  x: number;
  y: number;
  t0: number;
  big?: boolean;
  rad: number;
};

type Props = {
  text?: string;
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

export function fmtTime(ms: number) {
  const s = ms / 1000;
  const m = Math.floor(s / 60);
  return String(m).padStart(2, "0") + ":" + (s % 60).toFixed(2).padStart(5, "0");
}

class SoundEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  playPop(isMark: boolean, muted?: boolean) {
    if (muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    if (isMark) {
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.exponentialRampToValueAtTime(1760, t + 0.12);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.18);
    } else {
      osc.frequency.setValueAtTime(523.25, t);
      osc.frequency.exponentialRampToValueAtTime(659.25, t + 0.08);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.12);
    }
  }

  playFanfare(muted?: boolean) {
    if (muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const t = ctx.currentTime + i * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.4);
    });
  }
}

const sounds = new SoundEngine();

export function Wordmark({
  lines = ["X", "AGENCY"],
  playable = true,
  showGrid = false,
  muted = false,
  round = 0,
  onHud,
  className = "",
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dotsRef = useRef<Dot[]>([]);
  const specksRef = useRef<Speck[]>([]);
  const flashesRef = useRef<Flash[]>([]);
  const isDownRef = useRef(false);

  const gameRef = useRef<{
    started: boolean;
    startTime: number;
    done: boolean;
    lastMs: number;
  }>({
    started: false,
    startTime: 0,
    done: false,
    lastMs: 0,
  });

  // Calculate dots layout matching exact lockup specification
  const initDots = useCallback(
    (w: number, h: number) => {
      if (w <= 0 || h <= 0) return;

      const inner = w * 0.91;
      const colsLine0 = 5;
      const colsLine1 = 5 * 6 + 1.6 * 5; // 38 cols

      const pitch0 = inner / colsLine0;
      const pitch1 = inner / colsLine1;
      const r0 = pitch0 * RADIUS_RATIO;
      const r1 = pitch1 * RADIUS_RATIO;

      const height0 = ROWS * pitch0;
      const gap = pitch0 * 0.38;
      const height1 = ROWS * pitch1;
      const totalH = height0 + gap + height1;
      const startY = (h - totalH) / 2;
      const startX = (w - inner) / 2;

      const newDots: Dot[] = [];
      let dotIndex = 0;

      // Line 0: X
      const line0Text = lines[0] ?? "X";
      const line0Y = startY;
      for (let ci = 0; ci < line0Text.length; ci++) {
        const ch = line0Text[ci];
        const charX = startX + ci * (ADVANCE * pitch0);
        const rows = GLYPHS[ch] ?? [];
        for (let r = 0; r < rows.length; r++) {
          const rowStr = rows[r];
          for (let c = 0; c < rowStr.length; c++) {
            if (rowStr[c] === "X") {
              const hx = charX + (c + 0.5) * pitch0;
              const hy = line0Y + (r + 0.5) * pitch0;
              newDots.push({
                hx,
                hy,
                x: hx,
                y: hy,
                r: r0,
                dead: false,
                gift: "mark",
                n: dotIndex++,
              });
            }
          }
        }
      }

      // Line 1: AGENCY
      const line1Text = lines[1] ?? "AGENCY";
      const line1Y = startY + height0 + gap;
      for (let ci = 0; ci < line1Text.length; ci++) {
        const ch = line1Text[ci];
        const charX = startX + ci * (ADVANCE * pitch1);
        const rows = GLYPHS[ch] ?? [];
        for (let r = 0; r < rows.length; r++) {
          const rowStr = rows[r];
          for (let c = 0; c < rowStr.length; c++) {
            if (rowStr[c] === "X") {
              const hx = charX + (c + 0.5) * pitch1;
              const hy = line1Y + (r + 0.5) * pitch1;
              newDots.push({
                hx,
                hy,
                x: hx,
                y: hy,
                r: r1,
                dead: false,
                gift: "flower",
                n: dotIndex++,
              });
            }
          }
        }
      }

      // Distribute gifts
      const total = newDots.length;
      const markCount = Math.max(1, Math.round(total * 0.16));
      const gifts: Gift[] = [];
      for (let i = 0; i < markCount; i++) gifts.push("mark");
      const otherTypes: Gift[] = ["flower", "gift", "spark"];
      while (gifts.length < total) {
        gifts.push(otherTypes[gifts.length % otherTypes.length]);
      }
      for (let i = gifts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [gifts[i], gifts[j]] = [gifts[j], gifts[i]];
      }
      newDots.forEach((dot, idx) => {
        dot.gift = gifts[idx];
      });

      dotsRef.current = newDots;

      if (onHud) {
        onHud({
          ms: 0,
          popped: 0,
          left: newDots.length,
          found: 0,
          done: false,
        });
      }
    },
    [lines, onHud]
  );

  // Initialize or reset dots
  useEffect(() => {
    gameRef.current = {
      started: false,
      startTime: 0,
      done: false,
      lastMs: 0,
    };
    specksRef.current = [];
    flashesRef.current = [];

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    initDots(rect.width, rect.height);
  }, [round, initDots]);

  // Handle window / canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      if (dotsRef.current.length === 0) {
        initDots(rect.width, rect.height);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [initDots]);

  const popDot = (dot: Dot, now: number) => {
    if (dot.dead || dot.popT !== undefined) return;

    if (!gameRef.current.started) {
      gameRef.current.started = true;
      gameRef.current.startTime = now;
    }

    dot.popT = now;
    sounds.playPop(dot.gift === "mark", muted);

    // Spawn specks
    const count = dot.gift === "mark" ? 28 : 16;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 2.8 + 1.2) * (dot.r / 6);
      specksRef.current.push({
        x: dot.x,
        y: dot.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: Math.random() * (dot.r * 0.28) + dot.r * 0.1,
        life: 1.0,
        decay: Math.random() * 0.025 + 0.02,
      });
    }

    // Flash
    flashesRef.current.push({
      x: dot.x,
      y: dot.y,
      t0: now,
      big: dot.gift === "mark",
      rad: dot.r * (dot.gift === "mark" ? 3.5 : 2.2),
    });
  };

  const handlePointerInteraction = (clientX: number, clientY: number) => {
    if (!playable) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;

    const now = performance.now();
    dotsRef.current.forEach((dot) => {
      if (!dot.dead && dot.popT === undefined) {
        const dist = Math.hypot(dot.x - px, dot.y - py);
        if (dist <= dot.r * 1.4) {
          popDot(dot, now);
        }
      }
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId: number;

    // Fixed, calm, consistent lighting from top-left (no moving with mouse)
    const lx = -0.55;
    const ly = -0.75;

    const render = (now: number) => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.max(window.devicePixelRatio || 1, 2);
      const w = rect.width;
      const h = rect.height;

      if (w <= 0 || h <= 0) {
        animId = requestAnimationFrame(render);
        return;
      }

      const targetCanvasW = Math.round(w * dpr);
      const targetCanvasH = Math.round(h * dpr);

      if (canvas.width !== targetCanvasW || canvas.height !== targetCanvasH) {
        canvas.width = targetCanvasW;
        canvas.height = targetCanvasH;
        // Explicitly align style dimensions with CSS layout
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Clean transform per frame
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.clearRect(0, 0, w, h);

      // 1. Static background grid (Zero movement, zero flickering)
      if (showGrid) {
        ctx.save();
        const step = 20;
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(70, 70, 70, 0.18)";
        ctx.beginPath();
        for (let x = 0; x < w; x += step) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
        }
        for (let y = 0; y < h; y += step) {
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
        }
        ctx.stroke();
        ctx.restore();
      }

      // 2. Dots state update (Static positions, no mouse repulsion)
      const dots = dotsRef.current;
      let newlyCompleted = false;

      dots.forEach((dot) => {
        // Popping check (110ms)
        if (dot.popT !== undefined && !dot.dead) {
          if (now - dot.popT >= 110) {
            dot.dead = true;
          }
        }
        // Dots remain 100% steady at their home coordinates
        dot.x = dot.hx;
        dot.y = dot.hy;
      });

      // 3. Update Hud
      if (gameRef.current.started && onHud) {
        const ms = gameRef.current.done ? gameRef.current.lastMs : now - gameRef.current.startTime;
        const popped = dots.filter((d) => d.dead).length;
        const left = dots.length - popped;
        const found = dots.filter((d) => d.dead && d.gift === "mark").length;
        const done = left === 0;

        if (done && !gameRef.current.done) {
          gameRef.current.done = true;
          gameRef.current.lastMs = ms;
          newlyCompleted = true;
        }

        onHud({
          ms,
          popped,
          left,
          found,
          done,
        });

        if (newlyCompleted) {
          sounds.playFanfare(muted);
        }
      }

      // 4. Draw Revealed Gifts (High-Precision Vector Icons matching concept)
      dots.forEach((dot) => {
        if (!dot.dead) return;

        ctx.save();
        const gx = dot.hx;
        const gy = dot.hy;
        const isLarge = dot.r >= 16; // Line 0 (X: Display Scale) vs Line 1 (AGENCY: Micro Scale)

        if (dot.gift === "mark") {
          // 4.1 THE SIGNATURE X MARK (Modern Split-Blade Monogram with Negative Space Intersect)
          ctx.save();
          ctx.translate(gx, gy);
          const R = dot.r * 0.74;
          ctx.fillStyle = "#f2f2f2";
          ctx.strokeStyle = "#f2f2f2";
          ctx.lineCap = "round";
          ctx.lineJoin = "round";

          if (isLarge) {
            ctx.shadowColor = "rgba(255, 255, 255, 0.45)";
            ctx.shadowBlur = dot.r * 0.35;

            const w = R * 0.22;
            const arm = R * 0.88;

            // Forward Blade (\)
            ctx.beginPath();
            ctx.moveTo(-arm + w * 0.5, -arm - w * 0.5);
            ctx.lineTo(-arm - w * 0.5, -arm + w * 0.5);
            ctx.lineTo(arm - w * 0.5, arm + w * 0.5);
            ctx.lineTo(arm + w * 0.5, arm - w * 0.5);
            ctx.closePath();
            ctx.fill();

            // Crossing Slash (/) with Negative Space Clearance Gap in the center
            const gap = w * 1.35;
            // Top-Right arm
            ctx.beginPath();
            ctx.moveTo(gap * 0.7, -gap * 0.7 + w * 0.7);
            ctx.lineTo(arm - w * 0.5, -arm - w * 0.5);
            ctx.lineTo(arm + w * 0.5, -arm + w * 0.5);
            ctx.lineTo(gap * 0.7 + w * 0.7, -gap * 0.7);
            ctx.closePath();
            ctx.fill();

            // Bottom-Left arm
            ctx.beginPath();
            ctx.moveTo(-gap * 0.7, gap * 0.7 - w * 0.7);
            ctx.lineTo(-arm + w * 0.5, arm + w * 0.5);
            ctx.lineTo(-arm - w * 0.5, arm - w * 0.5);
            ctx.lineTo(-gap * 0.7 - w * 0.7, gap * 0.7);
            ctx.closePath();
            ctx.fill();
          } else {
            // Micro Scale: Clean high-contrast crossing cross
            ctx.lineWidth = Math.max(1.2, dot.r * 0.28);
            const arm = R * 0.85;
            ctx.beginPath();
            ctx.moveTo(-arm, -arm);
            ctx.lineTo(arm, arm);
            ctx.moveTo(arm, -arm);
            ctx.lineTo(-arm, arm);
            ctx.stroke();
          }
          ctx.restore();
        } else if (dot.gift === "spark") {
          // 4.2 အနာဂတ်၏ တောက်ပခြင်း အလင်းစက် (Radiant Diamond Starburst & Companion Sparkles)
          ctx.save();
          ctx.translate(gx, gy);
          const R = dot.r * 0.82;
          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = "#ffffff";
          ctx.lineCap = "round";
          ctx.lineJoin = "round";

          if (isLarge) {
            ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
            ctx.shadowBlur = dot.r * 0.4;

            // 4 Primary Radiant Tapered Needles
            const beamL = R * 0.95;
            const beamW = R * 0.12;

            // Vertical beam
            ctx.beginPath();
            ctx.moveTo(0, -beamL);
            ctx.quadraticCurveTo(beamW * 0.45, -beamL * 0.35, beamW, 0);
            ctx.quadraticCurveTo(beamW * 0.45, beamL * 0.35, 0, beamL);
            ctx.quadraticCurveTo(-beamW * 0.45, beamL * 0.35, -beamW, 0);
            ctx.quadraticCurveTo(-beamW * 0.45, -beamL * 0.35, 0, -beamL);
            ctx.closePath();
            ctx.fill();

            // Horizontal beam
            ctx.beginPath();
            ctx.moveTo(-beamL, 0);
            ctx.quadraticCurveTo(-beamL * 0.35, -beamW * 0.45, 0, -beamW);
            ctx.quadraticCurveTo(beamL * 0.35, -beamW * 0.45, beamL, 0);
            ctx.quadraticCurveTo(beamL * 0.35, beamW * 0.45, 0, beamW);
            ctx.quadraticCurveTo(-beamL * 0.35, beamW * 0.45, -beamL, 0);
            ctx.closePath();
            ctx.fill();

            // 4 Diagonal Secondary Glints (8-point brilliance)
            const dL = R * 0.38;
            const dW = R * 0.05;
            const offsets = [
              [-1, -1],
              [1, -1],
              [1, 1],
              [-1, 1],
            ];
            offsets.forEach(([sx, sy]) => {
              ctx.beginPath();
              ctx.moveTo(0, 0);
              ctx.quadraticCurveTo(sx * dW * 2, sy * dL * 0.3, sx * dL * 0.707, sy * dL * 0.707);
              ctx.quadraticCurveTo(sx * dL * 0.3, sy * dW * 2, 0, 0);
              ctx.closePath();
              ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
              ctx.fill();
            });

            // Luminous center star core
            ctx.beginPath();
            ctx.arc(0, 0, R * 0.08, 0, Math.PI * 2);
            ctx.fillStyle = "#ffffff";
            ctx.fill();

            // Companion micro-sparkles
            const s1X = R * 0.58;
            const s1Y = -R * 0.55;
            const s1R = R * 0.25;
            ctx.beginPath();
            ctx.moveTo(s1X, s1Y - s1R);
            ctx.quadraticCurveTo(s1X + s1R * 0.2, s1Y, s1X + s1R, s1Y);
            ctx.quadraticCurveTo(s1X, s1Y + s1R * 0.2, s1X, s1Y + s1R);
            ctx.quadraticCurveTo(s1X - s1R * 0.2, s1Y, s1X - s1R, s1Y);
            ctx.quadraticCurveTo(s1X, s1Y - s1R * 0.2, s1X, s1Y - s1R);
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.arc(-R * 0.52, R * 0.52, Math.max(1, R * 0.05), 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Micro Scale: Crisp 4-point diamond star
            const arm = R * 0.9;
            ctx.beginPath();
            ctx.moveTo(0, -arm);
            ctx.quadraticCurveTo(0, 0, arm, 0);
            ctx.quadraticCurveTo(0, 0, 0, arm);
            ctx.quadraticCurveTo(0, 0, -arm, 0);
            ctx.quadraticCurveTo(0, 0, 0, -arm);
            ctx.closePath();
            ctx.fill();
          }
          ctx.restore();
        } else if (dot.gift === "flower") {
          // 4.3 အောင်မြင်မှု နှင်းဆီပန်း (Stemmed Blooming Rose with Calyx & Leaves)
          ctx.save();
          ctx.translate(gx, gy);
          const R = dot.r * 0.76;
          ctx.strokeStyle = "#f2f2f2";
          ctx.fillStyle = "#f2f2f2";
          ctx.lineCap = "round";
          ctx.lineJoin = "round";

          if (isLarge) {
            const s = R / 55; // Scale factor based on 55px reference coordinate space
            ctx.lineWidth = Math.max(1.3, dot.r * 0.065);

            // Stem
            ctx.beginPath();
            ctx.moveTo(0, 6 * s);
            ctx.quadraticCurveTo(-3 * s, 28 * s, 0, 52 * s);
            ctx.stroke();

            // Left Leaf
            ctx.beginPath();
            ctx.moveTo(-1 * s, 26 * s);
            ctx.bezierCurveTo(-20 * s, 25 * s, -34 * s, 16 * s, -38 * s, 10 * s);
            ctx.bezierCurveTo(-32 * s, 26 * s, -16 * s, 34 * s, -1 * s, 34 * s);
            ctx.closePath();
            ctx.fillStyle = "rgba(242, 242, 242, 0.22)";
            ctx.fill();
            ctx.stroke();

            // Left Leaf Vein
            ctx.beginPath();
            ctx.moveTo(-1 * s, 26 * s);
            ctx.quadraticCurveTo(-22 * s, 21 * s, -36 * s, 12 * s);
            ctx.stroke();

            // Right Leaf
            ctx.beginPath();
            ctx.moveTo(0, 35 * s);
            ctx.bezierCurveTo(20 * s, 34 * s, 34 * s, 25 * s, 38 * s, 19 * s);
            ctx.bezierCurveTo(32 * s, 35 * s, 16 * s, 43 * s, 0, 43 * s);
            ctx.closePath();
            ctx.fillStyle = "rgba(242, 242, 242, 0.22)";
            ctx.fill();
            ctx.stroke();

            // Right Leaf Vein
            ctx.beginPath();
            ctx.moveTo(0, 35 * s);
            ctx.quadraticCurveTo(22 * s, 30 * s, 36 * s, 21 * s);
            ctx.stroke();

            // Calyx Sepals under the bloom
            ctx.beginPath();
            ctx.moveTo(-14 * s, 5 * s);
            ctx.bezierCurveTo(-20 * s, -2 * s, -20 * s, -10 * s, -22 * s, -14 * s);
            ctx.moveTo(14 * s, 5 * s);
            ctx.bezierCurveTo(20 * s, -2 * s, 20 * s, -10 * s, 22 * s, -14 * s);
            ctx.moveTo(-16 * s, 6 * s);
            ctx.quadraticCurveTo(0, 14 * s, 16 * s, 6 * s);
            ctx.stroke();

            // Outer Rose Petal Cup
            ctx.beginPath();
            ctx.moveTo(-24 * s, -15 * s);
            ctx.bezierCurveTo(-28 * s, 3 * s, -16 * s, 12 * s, 0, 12 * s);
            ctx.bezierCurveTo(16 * s, 12 * s, 28 * s, 3 * s, 24 * s, -15 * s);
            ctx.bezierCurveTo(22 * s, -30 * s, 14 * s, -40 * s, 0, -44 * s);
            ctx.bezierCurveTo(-14 * s, -40 * s, -22 * s, -30 * s, -24 * s, -15 * s);
            ctx.closePath();
            ctx.fillStyle = "rgba(242, 242, 242, 0.15)";
            ctx.fill();
            ctx.stroke();

            // Inner Rose Petal Wraps
            ctx.beginPath();
            ctx.moveTo(-23 * s, -12 * s);
            ctx.bezierCurveTo(-16 * s, -20 * s, 6 * s, -20 * s, 18 * s, -32 * s);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(23 * s, -12 * s);
            ctx.bezierCurveTo(16 * s, -20 * s, -6 * s, -20 * s, -18 * s, -32 * s);
            ctx.stroke();

            // Center Spiral Rose Whorl
            ctx.beginPath();
            ctx.moveTo(-9 * s, -32 * s);
            ctx.bezierCurveTo(-14 * s, -42 * s, 14 * s, -42 * s, 9 * s, -32 * s);
            ctx.bezierCurveTo(6 * s, -25 * s, -6 * s, -25 * s, -3 * s, -30 * s);
            ctx.bezierCurveTo(-1 * s, -33 * s, 4 * s, -33 * s, 4 * s, -30 * s);
            ctx.stroke();
          } else {
            // Micro Scale: Rose bud silhouette + stem + leaf
            const s = R / 15;
            ctx.lineWidth = Math.max(1.1, dot.r * 0.2);
            ctx.beginPath();
            ctx.moveTo(0, 2 * s);
            ctx.lineTo(0, 14 * s);
            ctx.stroke();

            // Micro Leaf
            ctx.beginPath();
            ctx.moveTo(0, 7 * s);
            ctx.quadraticCurveTo(-7 * s, 5 * s, -8 * s, 3 * s);
            ctx.quadraticCurveTo(-5 * s, 9 * s, 0, 9 * s);
            ctx.fillStyle = "#f2f2f2";
            ctx.fill();

            // Micro Rose Bud
            ctx.beginPath();
            ctx.arc(0, -4 * s, 7 * s, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0, -4 * s, 4 * s, 0.3 * Math.PI, 1.4 * Math.PI);
            ctx.strokeStyle = "#09090b";
            ctx.lineWidth = Math.max(1, dot.r * 0.15);
            ctx.stroke();
          }
          ctx.restore();
        } else {
          // 4.4 ကောင်းမြတ်သော လက်ဆောင် (Minimalist Jewelry Box & Ribbon Loop)
          ctx.save();
          ctx.translate(gx, gy);
          const R = dot.r * 0.74;
          ctx.strokeStyle = "#f2f2f2";
          ctx.fillStyle = "#f2f2f2";
          ctx.lineCap = "round";
          ctx.lineJoin = "round";

          if (isLarge) {
            ctx.lineWidth = Math.max(1.4, dot.r * 0.08);
            const bw = R * 0.75;
            const topY = -R * 0.15;
            const botY = R * 0.8;
            const h = botY - topY;
            const cr = Math.min(4, bw * 0.2);

            // Box base
            ctx.beginPath();
            ctx.roundRect(-bw, topY, bw * 2, h, [0, 0, cr, cr]);
            ctx.stroke();

            // Lid overhang
            ctx.beginPath();
            ctx.roundRect(-bw * 1.08, topY - h * 0.26, bw * 2.16, h * 0.26, [cr, cr, 0, 0]);
            ctx.stroke();

            // Center vertical ribbon
            ctx.beginPath();
            ctx.moveTo(0, topY - h * 0.26);
            ctx.lineTo(0, botY);
            ctx.stroke();

            // Dual ribbon loops
            const loopW = bw * 0.62;
            const loopH = h * 0.45;
            const bowY = topY - h * 0.26;
            ctx.beginPath();
            ctx.moveTo(0, bowY);
            ctx.bezierCurveTo(-loopW * 0.6, bowY - loopH * 1.1, -loopW * 1.2, bowY - loopH * 0.2, 0, bowY);
            ctx.moveTo(0, bowY);
            ctx.bezierCurveTo(loopW * 0.6, bowY - loopH * 1.1, loopW * 1.2, bowY - loopH * 0.2, 0, bowY);
            ctx.stroke();

            // Knot
            ctx.beginPath();
            ctx.arc(0, bowY, Math.max(1.2, R * 0.09), 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Micro Scale: High-contrast gift box with ribbon cross
            const b = R * 0.7;
            ctx.lineWidth = Math.max(1.2, dot.r * 0.22);
            ctx.strokeRect(-b, -b * 0.35, b * 2, b * 1.35);
            ctx.beginPath();
            ctx.moveTo(0, -b * 0.75);
            ctx.lineTo(0, b);
            ctx.moveTo(-b, -b * 0.35);
            ctx.lineTo(b, -b * 0.35);
            ctx.stroke();
            // Micro bow
            ctx.beginPath();
            ctx.arc(-b * 0.35, -b * 0.55, b * 0.25, 0, Math.PI * 2);
            ctx.arc(b * 0.35, -b * 0.55, b * 0.25, 0, Math.PI * 2);
            ctx.stroke();
          }
          ctx.restore();
        }

        ctx.restore();
      });

      // 5. Draw Living Dots (White 3D Spheres — Razor-sharp, perfectly calm and steady)
      dots.forEach((dot) => {
        if (dot.dead) return;

        let curR = dot.r;
        if (dot.popT !== undefined) {
          const t = Math.min(1, (now - dot.popT) / 110);
          curR = dot.r * (1 + t * 0.5);
        }

        // PASS 1: Fixed Soft Contact Drop Shadow (Static, elegant)
        ctx.save();
        const shadowDistance = Math.min(curR * 0.32, 10);
        const sx = dot.x - lx * shadowDistance;
        const sy = dot.y - ly * shadowDistance;
        const shadowRad = curR * 1.25;

        const sGrad = ctx.createRadialGradient(sx, sy, curR * 0.2, sx, sy, shadowRad);
        sGrad.addColorStop(0, "rgba(0, 0, 0, 0.65)");
        sGrad.addColorStop(0.6, "rgba(0, 0, 0, 0.2)");
        sGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = sGrad;
        ctx.beginPath();
        ctx.arc(sx, sy, shadowRad, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // PASS 2: Crisp, Pure White 3D Sphere Body
        ctx.save();
        const hx = dot.x + lx * curR * 0.38;
        const hy = dot.y + ly * curR * 0.38;

        const bodyGrad = ctx.createRadialGradient(hx, hy, curR * 0.05, dot.x, dot.y, curR);
        bodyGrad.addColorStop(0, "#ffffff");
        bodyGrad.addColorStop(0.28, "#ffffff");
        bodyGrad.addColorStop(0.55, "#e4e4e4");
        bodyGrad.addColorStop(0.82, "#c8c8c8");
        bodyGrad.addColorStop(1, "#3a3836");

        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, curR, 0, Math.PI * 2);
        ctx.fill();

        // Crisp anti-aliased subpixel rim
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = Math.max(0.6, curR * 0.04);
        ctx.stroke();

        ctx.restore();
      });

      // 6. Draw Flashes
      flashesRef.current = flashesRef.current.filter((f) => {
        const age = now - f.t0;
        const maxAge = f.big ? 260 : 160;
        if (age >= maxAge) return false;
        const prog = age / maxAge;
        const curRad = f.rad * (0.4 + prog * 0.8);
        const alpha = (1 - prog) * 0.45;

        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        const fGrad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, curRad);
        fGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        fGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = fGrad;
        ctx.beginPath();
        ctx.arc(f.x, f.y, curRad, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return true;
      });

      // 7. Draw Specks
      specksRef.current = specksRef.current.filter((s) => {
        s.x += s.vx;
        s.y += s.vy;
        s.vx *= 0.94;
        s.vy *= 0.94;
        s.life -= s.decay;
        if (s.life <= 0) return false;

        ctx.save();
        ctx.fillStyle = `rgba(242, 242, 242, ${s.life})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * s.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return true;
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [playable, showGrid, muted]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      onPointerDown={(e) => {
        isDownRef.current = true;
        handlePointerInteraction(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (isDownRef.current) {
          handlePointerInteraction(e.clientX, e.clientY);
        }
      }}
      onPointerUp={() => {
        isDownRef.current = false;
      }}
      onPointerLeave={() => {
        isDownRef.current = false;
      }}
    />
  );
}
