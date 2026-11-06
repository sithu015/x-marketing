import { useEffect, useRef, useState, useCallback } from "react";
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
  id: number;
  line: number;
  ch: string;
  gridRow: number;
  gridCol: number;
  hx: number;
  hy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  h: number; // highlight 0..1
  r: number;
  baseR: number;
  popT?: number;
  dead?: boolean;
  gift: Gift;
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
      osc.frequency.exponentialRampToValueAtTime(1760, t + 0.14);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.2);
    } else {
      osc.frequency.setValueAtTime(523.25, t);
      osc.frequency.exponentialRampToValueAtTime(659.25, t + 0.09);
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.14);
    }
  }

  playFanfare(muted?: boolean) {
    if (muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const t = ctx.currentTime + i * 0.085;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.42);
    });
  }
}

const sounds = new SoundEngine();

export function Wordmark({
  lines = ["X", "AGENCY"],
  interactive = true,
  playable = true,
  showGrid = false,
  muted = false,
  round = 0,
  onHud,
  className = "",
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dotsRef = useRef<Dot[]>([]);
  const specksRef = useRef<Speck[]>([]);
  const flashesRef = useRef<Flash[]>([]);

  const [dprState, setDprState] = useState(2);
  const sizeRef = useRef<{ w: number; h: number; dpr: number }>({ w: 0, h: 0, dpr: 2 });

  const pointerRef = useRef<{ x: number; y: number; active: boolean; isDown: boolean }>({
    x: -9999,
    y: -9999,
    active: false,
    isDown: false,
  });

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

  // Calculate layout coordinates for all dots based on container dimensions
  const computeLayout = useCallback(
    (w: number, h: number) => {
      if (w <= 0 || h <= 0) return [];

      const isDesktop = w >= 768;
      // Provide comfortable breathing padding
      const maxAvailableW = isDesktop ? w * 0.82 : w * 0.90;
      const maxAvailableH = isDesktop ? h * 0.80 : h * 0.84;

      // Lockup geometry:
      // Line 0: "X" (5 columns)
      // Line 1: "AGENCY" (38 columns)
      // Both lines stretch to the exact same width W
      // Height 0 = 8 * (W / 5) = 1.6 * W
      // Gap = 0.38 * (W / 5) = 0.076 * W
      // Height 1 = 8 * (W / 38) = 0.210526 * W
      // Total lockup height = (1.6 + 0.076 + 0.210526) * W = 1.886526 * W
      const ratioHeightToWidth = 1.886526;

      // Fit inside BOTH available width and available height
      const targetW = Math.min(maxAvailableW, maxAvailableH / ratioHeightToWidth);
      const targetH = targetW * ratioHeightToWidth;

      const pitch0 = targetW / 5;
      const pitch1 = targetW / 38;
      const r0 = pitch0 * RADIUS_RATIO;
      const r1 = pitch1 * RADIUS_RATIO;

      const height0 = ROWS * pitch0;
      const gap = pitch0 * 0.38;

      const startX = (w - targetW) / 2;
      const startY = (h - targetH) / 2;

      const calculatedDots: {
        id: number;
        line: number;
        ch: string;
        gridRow: number;
        gridCol: number;
        hx: number;
        hy: number;
        r: number;
      }[] = [];

      let idCounter = 0;

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
              calculatedDots.push({
                id: idCounter++,
                line: 0,
                ch,
                gridRow: r,
                gridCol: c,
                hx,
                hy,
                r: r0,
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
              calculatedDots.push({
                id: idCounter++,
                line: 1,
                ch,
                gridRow: r,
                gridCol: c,
                hx,
                hy,
                r: r1,
              });
            }
          }
        }
      }

      return calculatedDots;
    },
    [lines]
  );

  // Initialize or re-layout dots
  const updateDotsLayout = useCallback(
    (w: number, h: number, isReset: boolean) => {
      const layout = computeLayout(w, h);
      if (layout.length === 0) return;

      const currentDots = dotsRef.current;

      if (isReset || currentDots.length !== layout.length) {
        // Full initialization with new random gift assignment
        const total = layout.length;
        const markCount = Math.max(1, Math.round(total * 0.16));
        const gifts: Gift[] = [];
        for (let i = 0; i < markCount; i++) gifts.push("mark");
        const otherTypes: Gift[] = ["flower", "gift", "spark"];
        while (gifts.length < total) {
          gifts.push(otherTypes[gifts.length % otherTypes.length]);
        }
        // Fisher-Yates shuffle
        for (let i = gifts.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [gifts[i], gifts[j]] = [gifts[j], gifts[i]];
        }

        const newDots: Dot[] = layout.map((item, idx) => ({
          ...item,
          x: item.hx,
          y: item.hy,
          vx: 0,
          vy: 0,
          h: 0,
          baseR: item.r,
          dead: false,
          gift: gifts[idx],
        }));

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
      } else {
        // Smooth resize: update target home positions and radii without resetting game progress
        currentDots.forEach((dot, idx) => {
          const target = layout[idx];
          if (target) {
            dot.hx = target.hx;
            dot.hy = target.hy;
            dot.r = target.r;
            dot.baseR = target.r;
            // If living and near home, smoothly transition
            if (!dot.dead && dot.popT === undefined) {
              dot.x = target.hx;
              dot.y = target.hy;
            }
          }
        });
      }
    },
    [computeLayout, onHud]
  );

  // Handle round changes (reset game)
  useEffect(() => {
    gameRef.current = {
      started: false,
      startTime: 0,
      done: false,
      lastMs: 0,
    };
    specksRef.current = [];
    flashesRef.current = [];

    const { w, h } = sizeRef.current;
    if (w > 0 && h > 0) {
      updateDotsLayout(w, h, true);
    }
  }, [round, updateDotsLayout]);

  // ResizeObserver for rock-solid responsive sizing across mobile and desktop
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.max(window.devicePixelRatio || 1, 2); // Ensure crystal-clear rendering
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);

      if (w <= 0 || h <= 0) return;

      const sizeChanged = sizeRef.current.w !== w || sizeRef.current.h !== h || sizeRef.current.dpr !== dpr;
      if (sizeChanged) {
        sizeRef.current = { w, h, dpr };
        setDprState(dpr);

        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = Math.round(w * dpr);
          canvas.height = Math.round(h * dpr);
          canvas.style.width = `${w}px`;
          canvas.style.height = `${h}px`;
        }

        const isInitial = dotsRef.current.length === 0;
        updateDotsLayout(w, h, isInitial);
      }
    };

    const ro = new ResizeObserver(handleResize);
    ro.observe(container);
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [updateDotsLayout]);

  const popDot = (dot: Dot, now: number) => {
    if (dot.dead || dot.popT !== undefined) return;

    if (!gameRef.current.started) {
      gameRef.current.started = true;
      gameRef.current.startTime = now;
    }

    dot.popT = now;
    sounds.playPop(dot.gift === "mark", muted);

    // Particles explosion
    const count = dot.gift === "mark" ? 28 : 16;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 2.8 + 1.2) * (dot.r / 5);
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

    // Flash burst
    flashesRef.current.push({
      x: dot.x,
      y: dot.y,
      t0: now,
      big: dot.gift === "mark",
      rad: dot.r * (dot.gift === "mark" ? 3.6 : 2.4),
    });
  };

  const handlePointerInteraction = (clientX: number, clientY: number, triggerPop: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;

    pointerRef.current.x = px;
    pointerRef.current.y = py;
    pointerRef.current.active = true;

    if (triggerPop && playable) {
      const now = performance.now();
      dotsRef.current.forEach((dot) => {
        if (!dot.dead && dot.popT === undefined) {
          const dist = Math.hypot(dot.x - px, dot.y - py);
          if (dist <= Math.max(dot.r * 1.4, 18)) {
            popDot(dot, now);
          }
        }
      });
    }
  };

  // Main Render Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId: number;

    const render = (now: number) => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const { w, h, dpr } = sizeRef.current;
      if (w <= 0 || h <= 0) {
        animId = requestAnimationFrame(render);
        return;
      }

      // Reset transform to exact device pixels
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.clearRect(0, 0, w, h);

      const pointer = pointerRef.current;

      // 1. Antigravity Subtle Spatial Background Glow & Grid
      if (showGrid) {
        ctx.save();
        const step = w >= 768 ? 24 : 18;
        ctx.lineWidth = 1;
        for (let x = 0; x < w; x += step) {
          let alpha = 0.12;
          if (pointer.active) {
            const dx = Math.abs(x - pointer.x);
            if (dx < 200) alpha += (1 - dx / 200) * 0.28;
          }
          ctx.strokeStyle = `rgba(80, 80, 80, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let y = 0; y < h; y += step) {
          let alpha = 0.12;
          if (pointer.active) {
            const dy = Math.abs(y - pointer.y);
            if (dy < 200) alpha += (1 - dy / 200) * 0.28;
          }
          ctx.strokeStyle = `rgba(80, 80, 80, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 2. Physics & State update
      const dots = dotsRef.current;
      let newlyCompleted = false;

      dots.forEach((dot) => {
        // Popping transition (110ms)
        if (dot.popT !== undefined && !dot.dead) {
          if (now - dot.popT >= 110) {
            dot.dead = true;
          }
        }

        if (interactive) {
          // Pointer field physics (200px field radius)
          if (pointer.active) {
            const dx = dot.x - pointer.x;
            const dy = dot.y - pointer.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 200) {
              const th = Math.max(0, 1 - dist / 200);
              dot.h += (th - dot.h) * 0.25;
              if (dist > 1) {
                const force = (1 - dist / 200) * 1.8;
                dot.vx += (dx / dist) * force;
                dot.vy += (dy / dist) * force;
              }
            } else {
              dot.h += (0 - dot.h) * 0.15;
            }
          } else {
            dot.h += (0 - dot.h) * 0.15;
          }

          // Spring physics: spring = 0.06, damping = 0.82
          const ax = (dot.hx - dot.x) * 0.06;
          const ay = (dot.hy - dot.y) * 0.06;
          dot.vx = (dot.vx + ax) * 0.82;
          dot.vy = (dot.vy + ay) * 0.82;
          dot.x += dot.vx;
          dot.y += dot.vy;
        }
      });

      // 3. Hud calculation
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

      // 4. Draw Revealed Gifts (Behind dead spheres)
      dots.forEach((dot) => {
        if (!dot.dead) return;

        ctx.save();
        const gx = dot.hx;
        const gy = dot.hy;
        const s = dot.r * 1.25;

        ctx.strokeStyle = "#f2f2f2";
        ctx.fillStyle = "#f2f2f2";
        ctx.lineWidth = Math.max(1.3, dot.r * 0.28);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        if (dot.gift === "mark") {
          // X mark
          const arm = s * 0.7;
          ctx.beginPath();
          ctx.moveTo(gx - arm, gy - arm);
          ctx.lineTo(gx + arm, gy + arm);
          ctx.moveTo(gx + arm, gy - arm);
          ctx.lineTo(gx - arm, gy + arm);
          ctx.stroke();
        } else if (dot.gift === "flower") {
          // 4-petal flower
          const pr = s * 0.38;
          const offsets = [
            [0, -pr],
            [pr, 0],
            [0, pr],
            [-pr, 0],
          ];
          offsets.forEach(([ox, oy]) => {
            ctx.beginPath();
            ctx.arc(gx + ox, gy + oy, pr * 0.72, 0, Math.PI * 2);
            ctx.stroke();
          });
          ctx.beginPath();
          ctx.arc(gx, gy, pr * 0.45, 0, Math.PI * 2);
          ctx.fill();
        } else if (dot.gift === "gift") {
          // Gift box
          const b = s * 0.65;
          ctx.strokeRect(gx - b, gy - b, b * 2, b * 2);
          ctx.beginPath();
          ctx.moveTo(gx, gy - b);
          ctx.lineTo(gx, gy + b);
          ctx.moveTo(gx - b, gy);
          ctx.lineTo(gx + b, gy);
          ctx.stroke();
        } else {
          // Spark / star
          const arm = s * 0.85;
          const diag = s * 0.32;
          ctx.beginPath();
          ctx.moveTo(gx, gy - arm);
          ctx.lineTo(gx, gy + arm);
          ctx.moveTo(gx - arm, gy);
          ctx.lineTo(gx + arm, gy);
          ctx.moveTo(gx - diag, gy - diag);
          ctx.lineTo(gx + diag, gy + diag);
          ctx.moveTo(gx + diag, gy - diag);
          ctx.lineTo(gx - diag, gy + diag);
          ctx.stroke();
        }
        ctx.restore();
      });

      // 5. Draw Living 3D Spheres with 3-Pass Precision Shader
      dots.forEach((dot) => {
        if (dot.dead) return;

        let curR = dot.r;
        if (dot.popT !== undefined) {
          const t = Math.min(1, (now - dot.popT) / 110);
          curR = dot.r * (1 + t * 0.5);
        }

        // Light direction calculation
        let lx = -0.55;
        let ly = -0.75;
        if (pointer.active) {
          const dx = pointer.x - dot.x;
          const dy = pointer.y - dot.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 1) {
            lx = dx / dist;
            ly = dy / dist;
          }
        }

        // PASS 1: Realistic Soft Diffused Drop Shadow (Weightless spatial illusion)
        ctx.save();
        const shadowDistance = curR * 0.42;
        const sx = dot.x - lx * shadowDistance;
        const sy = dot.y - ly * shadowDistance;
        const shadowRadius = curR * (1.25 + dot.h * 0.35);

        const sGrad = ctx.createRadialGradient(sx, sy, curR * 0.3, sx, sy, shadowRadius);
        sGrad.addColorStop(0, "rgba(0, 0, 0, 0.75)");
        sGrad.addColorStop(0.5, "rgba(0, 0, 0, 0.35)");
        sGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = sGrad;
        ctx.beginPath();
        ctx.arc(sx, sy, shadowRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // PASS 2: Additive Atmospheric Glow
        if (dot.h > 0.02) {
          ctx.save();
          ctx.globalCompositeOperation = "lighter";
          const glowGrad = ctx.createRadialGradient(dot.x, dot.y, curR * 0.2, dot.x, dot.y, curR * 2.3);
          glowGrad.addColorStop(0, `rgba(255, 255, 255, ${0.18 * dot.h})`);
          glowGrad.addColorStop(0.6, `rgba(220, 220, 220, ${0.06 * dot.h})`);
          glowGrad.addColorStop(1, "rgba(255, 255, 255, 0)");

          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, curR * 2.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // PASS 3: Hyper-Refined 3D Metallic/Specular Sphere Body
        ctx.save();
        // Specular highlight offset
        const hx = dot.x + lx * curR * 0.42;
        const hy = dot.y + ly * curR * 0.42;

        const bodyGrad = ctx.createRadialGradient(hx, hy, curR * 0.04, dot.x, dot.y, curR);
        // Pure crisp white specular highlight stop
        bodyGrad.addColorStop(0, "#ffffff");
        // Specular falloff
        bodyGrad.addColorStop(0.18, "#ececec");
        // Concept Albedo: RGB 200 (#c8c8c8)
        bodyGrad.addColorStop(0.48, "#c8c8c8");
        // Shading terminator
        bodyGrad.addColorStop(0.82, "#585552");
        // Deep ink shade rim (#141210)
        bodyGrad.addColorStop(1, "#141210");

        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, curR, 0, Math.PI * 2);
        ctx.fill();

        // Subpixel rim stroke to guarantee zero edge pixelation
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = Math.max(0.6, curR * 0.06);
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
        const alpha = (1 - prog) * 0.5;

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
  }, [interactive, playable, showGrid, muted]);

  return (
    <div ref={containerRef} className={`relative h-full w-full overflow-hidden select-none ${className}`}>
      <canvas
        ref={canvasRef}
        className="block h-full w-full cursor-crosshair touch-manipulation"
        onPointerDown={(e) => {
          pointerRef.current.isDown = true;
          handlePointerInteraction(e.clientX, e.clientY, true);
        }}
        onPointerMove={(e) => {
          handlePointerInteraction(e.clientX, e.clientY, pointerRef.current.isDown);
        }}
        onPointerUp={() => {
          pointerRef.current.isDown = false;
        }}
        onPointerLeave={() => {
          pointerRef.current.active = false;
          pointerRef.current.isDown = false;
        }}
      />
    </div>
  );
}
