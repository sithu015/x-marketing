import { GLYPHS, dotCount } from "@/lib/glyphs";

export function GlyphMatrix({ ch }: { ch: string }) {
  const rows = GLYPHS[ch] ?? [];
  return (
    <figure className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-display text-2xl leading-none text-fg">{ch === "-" ? "\u2013" : ch}</span>
        <span className="font-mono text-xs tracking-wide text-dim">5\u00d78 \u00b7 {dotCount(ch)} dots</span>
      </div>
      <div className="grid grid-cols-5 gap-1.5" aria-hidden>
        {rows.flatMap((row, ry) =>
          [...row].map((cell, rx) => (
            <span
              key={`${ry}-${rx}`}
              className={cell === "X" ? "dot-on" : "dot-off"}
            />
          )),
        )}
      </div>
      <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-muted">{rows.join("\n")}</pre>
    </figure>
  );
}
