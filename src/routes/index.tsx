import { useState } from "react";
import { Wordmark, fmtTime, type Hud } from "@/components/wordmark";
import { GlyphMatrix } from "@/components/glyph-matrix";
import { countText } from "@/lib/glyphs";

export const Route = { component: Home };

const NAV = [
  { href: "#stage", label: "interactive" },
  { href: "#concept", label: "concept" },
  { href: "#language", label: "language" },
  { href: "#mark", label: "construction" },
];

const LOCKUP = ["X", "AGENCY"] as const;
const PROMISE =
  "X Marketing မှ လူကြီးမင်းတို့အတွက် ကောင်းမြတ်သော လက်ဆောင်များ၊ အောင်မြင်မှု ပန်းစည်းများနှင့် အနာဂတ်၏ တောက်ပခြင်း အလင်းများကို ဆောင်ယူပေးပါသည်။ ယင်းဆုလက်ဆောင်များ ကိုယ်တိုင်သည်ပင် ကျွန်တော်တို့ X Marketing ကိုယ်တိုင်ပင် ဖြစ်ပါသည်။";

export function Home() {
  const [grid, setGrid] = useState(false);
  const [muted, setMuted] = useState(false);
  const [rules, setRules] = useState(false);
  const [round, setRound] = useState(0);
  const [hud, setHud] = useState<Hud>({
    ms: 0,
    popped: 0,
    left: 0,
    found: 0,
    done: false,
  });
  const dots = countText(LOCKUP.join(""));
  const again = () => setRound((n) => n + 1);

  return (
    <div className="min-h-screen bg-bg text-fg selection:bg-fg selection:text-bg">
      {/* Top Glass Navigation */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-line bg-bg/80 px-5 py-3.5 backdrop-blur-xl md:px-10">
        <div className="flex items-center gap-3">
          <a href="#top" className="font-mono text-base font-bold tracking-widest text-fg hover:opacity-80 transition-opacity">
            X
          </a>
          <span className="hidden sm:inline-block font-mono text-xs text-dim">/ AGENCY DESIGN STUDY</span>
        </div>
        <nav className="flex items-center gap-5 overflow-x-auto font-mono text-xs text-muted md:gap-8 md:text-sm">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className="shrink-0 transition-colors hover:text-fg">
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      <main id="top">
        {/* Antigravity Spatial Hero Stage */}
        <section id="stage" className="relative border-b border-line px-4 py-8 sm:px-6 md:py-14 lg:py-16">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-6">
            
            {/* Header copy */}
            <div className="flex max-w-2xl flex-col items-center gap-3 text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-line bg-[#141414] px-3.5 py-1 font-mono text-xs text-muted shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Responsive Precision Canvas · Hi-DPI</span>
              </div>
              <h1 className="font-display text-3xl leading-none text-fg sm:text-4xl md:text-5xl lg:text-6xl tracking-tight">
                The gift is X.
              </h1>
              <p className="text-sm leading-relaxed text-muted md:text-base">
                X အမည်ရှိ အေဂျင်စီက သင့်အတွက် လက်ဆောင်ယူလာပါသည်။ ဘောလုံးလေးများကို နှိပ်၍ unwrap ဖွင့်ဖောက်ကြည့်ရှုနိုင်ပါသည်။
              </p>
            </div>

            {/* Responsive Antigravity Canvas Stage */}
            <div className="relative w-full max-w-sm sm:max-w-md md:max-w-4xl lg:max-w-5xl">
              <div className="relative w-full aspect-[10/16] md:aspect-[16/10] lg:aspect-[16/9] overflow-hidden rounded-2xl md:rounded-3xl border border-white/10 bg-gradient-to-b from-[#141414] via-[#0c0c0c] to-bg shadow-[0_30px_90px_rgba(0,0,0,0.85)]">
                
                {/* Ambient Radial Illumination */}
                <div
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,rgba(255,255,255,0.06),transparent_65%)]"
                  aria-hidden
                />

                {/* Floating Telemetry Header */}
                <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-5 py-4 font-mono text-[11px] text-dim md:px-8">
                  <div className="flex items-center gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-fg opacity-60" />
                    <span>5×8 MATRIX LOCKUP</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-3">
                    <span>SPRING: 0.06</span>
                    <span>DAMPING: 0.82</span>
                    <span className="text-fg/80">3-PASS SHADER</span>
                  </div>
                </div>

                {/* Interactive Wordmark Canvas */}
                <Wordmark
                  text="X"
                  lines={LOCKUP}
                  playable
                  interactive
                  showGrid={grid}
                  muted={muted}
                  round={round}
                  onHud={setHud}
                  className="absolute inset-0 h-full w-full"
                />

                {/* Victory Completion Modal */}
                {hud.done && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-bg/80 px-4 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="flex max-w-md flex-col items-center gap-4 rounded-2xl border border-white/15 bg-[#121212] px-8 py-10 text-center shadow-2xl">
                      <div className="font-display text-3xl text-fg md:text-5xl tracking-tight">The gift is X.</div>
                      <p className="text-sm leading-relaxed text-muted">
                        လက်ဆောင်က X ကိုယ်တိုင်ပါ။ သင့်အတွက် ယူဆောင်လာသူက ကျွန်ုပ်တို့ X Marketing ဖြစ်ပါသည်။
                      </p>
                      <div className="inline-block rounded-md border border-line bg-black/40 px-3.5 py-1.5 font-mono text-xs text-fg">
                        Completed in {fmtTime(hud.ms)}
                      </div>
                      <button
                        type="button"
                        onClick={again}
                        className="mt-2 h-11 rounded-lg border border-white/20 bg-fg px-6 font-mono text-sm font-semibold text-bg transition hover:bg-white active:scale-95"
                      >
                        Unwrap again
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Floating Action HUD Controls */}
              <div className="mt-4 flex flex-col gap-3 rounded-xl border border-line bg-[#101010]/90 p-4 backdrop-blur-md md:flex-row md:items-center md:justify-between md:px-6">
                
                {/* Stats Counters */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs text-dim">
                  <div className="flex items-center gap-2">
                    <span className="text-muted">TIMER:</span>
                    <span className="font-bold text-fg">{fmtTime(hud.ms)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted">OPENED:</span>
                    <span className="font-bold text-fg">{hud.popped}</span>
                    <span className="text-[10px] text-dim">/ {dots}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted">WRAPPED:</span>
                    <span className="font-bold text-fg">{hud.left}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted">X FOUND:</span>
                    <span className="font-bold text-emerald-400">{hud.found}</span>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setGrid((v) => !v)}
                    className={`h-9 rounded-md border px-3 font-mono text-xs transition ${
                      grid ? "border-fg bg-fg text-bg" : "border-line bg-bg text-muted hover:text-fg"
                    }`}
                  >
                    {grid ? "grid: ON" : "grid: OFF"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMuted((v) => !v)}
                    className={`h-9 rounded-md border px-3 font-mono text-xs transition ${
                      !muted ? "border-line bg-bg text-fg" : "border-line bg-bg text-dim hover:text-fg"
                    }`}
                  >
                    {muted ? "sound: OFF" : "sound: ON"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRules((v) => !v)}
                    className={`h-9 w-9 rounded-md border font-mono text-xs transition ${
                      rules ? "border-fg bg-fg text-bg" : "border-line bg-bg text-muted hover:text-fg"
                    }`}
                    title="How to play"
                  >
                    i
                  </button>
                  <button
                    type="button"
                    onClick={again}
                    className="h-9 rounded-md border border-line bg-bg px-3.5 font-mono text-xs text-fg hover:border-fg transition active:scale-95"
                  >
                    reset
                  </button>
                </div>
              </div>

              {/* Instructions Drawer */}
              {rules && (
                <div className="mt-3 max-w-md rounded-xl border border-line bg-[#121212] p-5 font-mono text-xs leading-relaxed text-muted shadow-xl animate-in slide-in-from-top-2">
                  <div className="mb-2 font-bold text-fg">How to unwrap</div>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Tap or drag across any white 3D sphere.</li>
                    <li>It bursts within 110ms, leaving a revealed gift symbol.</li>
                    <li>Symbols include Flower (အောင်မြင်မှု), Gift Box (ကောင်းမြတ်ခြင်း), Spark (အနာဂတ်အလင်း), or X.</li>
                    <li>Pop all {dots} spheres to complete the lockup.</li>
                    <li>The ultimate gift is X Marketing itself.</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Content sections */}
        <div className="mx-auto flex max-w-3xl flex-col gap-16 px-5 py-14 md:px-8 md:py-20">
          
          {/* Section 01: Concept */}
          <section id="concept" className="reveal flex flex-col gap-5">
            <p className="font-mono text-xs tracking-widest text-dim">01 — DESIGN CONCEPT</p>
            <h2 className="font-display text-3xl leading-none text-fg md:text-4xl">ဆုလက်ဆောင်သည် X Marketing ကိုယ်တိုင်ပါ။</h2>
            <p className="text-base leading-relaxed text-muted">{PROMISE}</p>
            <dl className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2">
              <Fact k="အမည်" v="X Marketing" />
              <Fact k="ပေးအပ်သူ" v="ကျွန်တော်တို့ X Marketing" />
              <Fact k="လူကြီးမင်းတို့အတွက်" v="ကောင်းမြတ်သော လက်ဆောင်၊ အောင်မြင်မှု ပန်းစည်း၊ အနာဂတ်၏ တောက်ပခြင်း အလင်း။" />
              <Fact k="ဆုလက်ဆောင်" v="ယင်းအရာများ ကိုယ်တိုင်သည် X Marketing ကိုယ်တိုင်ပင် ဖြစ်ပါသည်။" />
            </dl>
            <p className="text-base leading-relaxed text-muted">
              Logo က ကြေညာစာတမ်းမဟုတ်ပါ။ လူကြီးမင်းတို့အတွက် ထုပ်ပိုးထားသော ဆုလက်ဆောင်ပါ။ အဖြူဘောလုံးက အထုပ်။ နှိပ်လိုက်လျှင် ပေါက်ကွဲပြီး အောက်တွင် ဖွက်ထားသော ပန်းစည်း၊ လက်ဆောင်၊ အလင်း၊ သို့မဟုတ် X ပေါ်လာပါသည်။ အားလုံးဖွင့်မှ ဆုလက်ဆောင်စစ်ကို မြင်ရပါသည် — The gift is X Marketing.
            </p>
            <p className="text-base leading-relaxed text-muted">
              စာလုံးနှစ်ကြောင်းက ဤအဓိပ္ပာယ်ကို တည်ဆောက်ပုံဖြင့် ပြပါသည်။ အပေါ်က X က ကြီးပါသည်။ နာမည်၊ အလင်း၊ ကျွန်တော်တို့။ အောက်က AGENCY က သေးပါသည်။ သို့သော် တူညီသော အကျယ်အတိုင်း ဆန့်ထားပါသည်။ လူကြီးမင်းတို့ထံ ဆောင်ယူပေးသော အလုပ်သည် X ၏ အောက်တွင်၊ X ၏ အကျယ်အတိုင်း ရပ်တည်ပါသည်။
            </p>
          </section>

          {/* Section 02: Language */}
          <section id="language" className="flex flex-col gap-5 border-t border-line pt-14">
            <p className="font-mono text-xs tracking-widest text-dim">02 — DESIGN LANGUAGE</p>
            <h2 className="font-display text-3xl leading-none md:text-4xl">လက်ဆောင်၊ ပန်းစည်း၊ အလင်း။</h2>
            <p className="text-base leading-relaxed text-muted">
              အရောင်မထည့်ပါ။ လူကြီးမင်းတို့အတွက် ယူဆောင်လာသော အရာကို အရောင်ဖြင့် မပြောပါ — ပုံသဏ္ဌာန်ဖြင့် ပြောပါသည်။ ပန်းစည်းက အောင်မြင်မှု။ သေတ္တာက ကောင်းမြတ်သော လက်ဆောင်။ ကြယ်က အနာဂတ်၏ တောက်ပခြင်း။ X က ကျွန်တော်တို့ ကိုယ်တိုင်။ အားလုံး #f2f2f2။
            </p>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <Swatch name="field" hex="#0a0a0a" className="bg-bg" />
              <Swatch name="sphere" hex="#c8c8c8" className="bg-fg" light />
              <Swatch name="gift" hex="#f2f2f2" className="bg-fg" light />
              <Swatch name="quiet" hex="#9a9a9a" className="bg-muted" light />
            </div>
            <ul className="flex flex-col gap-3.5 text-base leading-relaxed text-muted">
              <li>
                <span className="font-mono text-fg font-semibold">Mark.</span> စာလုံးက font outline မဟုတ်ပါ။ 5×8 အစက်ကွက်ပေါ်က ဘောလုံးပါ။ ဘောလုံး albedo RGB 200။ မီးက အဖြူ။ အရိပ်က #141210 နဲ့ ရောပါသည်။
              </li>
              <li>
                <span className="font-mono text-fg font-semibold">Lockup.</span> ကြောင်းနှစ်ကြောင်း၊ အလယ်တန်း။ Web ရော mobile ရော အချိုးတူ။ တစ်ကြောင်းချင်း အကျယ်ပြည့် ဆန့်ပါသည်။ X ၏ pitch ကြီးပါသည်။ AGENCY ၏ pitch သေးပါသည်။
              </li>
              <li>
                <span className="font-mono text-fg font-semibold">Type.</span> ကြေညာချက် “The gift is X Marketing.” က Archivo Black။ စနစ်စာသားက JetBrains Mono။ မြန်မာစာက Noto Sans Myanmar။
              </li>
              <li>
                <span className="font-mono text-fg font-semibold">Motion.</span> ဘောလုံးသည် pointer ကို ရှောင်ပါသည်။ Spring 0.06၊ damping 0.82။ နှိပ်လျှင် 110ms အတွင်း ဖောင်းပြီး ပေါက်ကွဲပါသည်။ ပန်းစည်း၊ လက်ဆောင်၊ အလင်းသည် နေရာတွင် ကျန်ရစ်ပါသည်။
              </li>
              <li>
                <span className="font-mono text-fg font-semibold">Sound.</span> ဖိုင်မဟုတ်ပါ။ ဖွင့်သံက C major တိုတို။ X Marketing ကို တွေ့လျှင် ပိုမြင့်သော sine။ အားလုံးဖွင့်ပြီးလျှင် arpeggio ဖြင့် ဂုဏ်ပြုပါသည်။
              </li>
            </ul>
          </section>

          {/* Section 03: Construction */}
          <section id="mark" className="flex flex-col gap-6 border-t border-line pt-14">
            <p className="font-mono text-xs tracking-widest text-dim">03 — HOW THE MARK IS BUILT</p>
            <h2 className="font-display text-3xl leading-none md:text-4xl">စာလုံးတစ်လုံးက ဘောလုံးကွက်ပါ။</h2>
            <p className="text-base leading-relaxed text-muted">
              စာလုံးတစ်လုံးကို အလျား ၅ ကော်လံ၊ အမြင့် ၈ တန်း string ဖြင့် ရေးပါသည်။ <span className="font-mono text-fg">X</span> က ဘောလုံး၊ <span className="font-mono text-fg">.</span> က အပေါက်။ လက်မောင်းအထု ၂ စက်၊ အပေါက် ၁ ကော်လံ။ X / AGENCY lockup တွင် စာလုံး ၇ လုံး၊ ဘောလုံး {dots} လုံး ပါဝင်ပါသည်။
            </p>
            <pre className="formula overflow-x-auto rounded-xl border border-line bg-bg p-5 leading-relaxed">{`inner   = width × 0.91 (Mobile) / 0.82 (Desktop)
cols    = 5·L + 1.6·(L − 1)
pitch   = inner / cols          ← one pitch per line
radius  = pitch × 0.44
gap     = pitch of X × 0.38
X      = 5 cols, pitch large
AGENCY = 38 cols, same width`}</pre>
            <p className="text-base leading-relaxed text-muted">
              X က ကော်လံ ၅ သာရှိသောကြောင့် တစ်ကြောင်းပြည့်ချဲ့လျှင် ဘောလုံးကြီးပါသည်။ AGENCY က စာလုံး ၆ လုံး၊ ကော်လံ ၃၈၊ တူညီသော အကျယ်ထဲ ဝင်အောင် pitch သေးပါသည်။ ကြောင်းကြားကွာဟချက်က X pitch ၏ ၀.၃၈။ ဖုန်းတွင် အကျယ်ပြည့်၊ ဝက်ဘ်တွင် အလယ်။ အကျယ် ၃၂rem။ အချိုးတူသောကြောင့် နေရာတူညီစွာ ပြသပါသည်။
            </p>

            <h3 className="font-mono text-sm text-fg uppercase tracking-wider">Glyphs Matrix</h3>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
              {["X", "A", "G", "E", "N", "C", "Y"].map((ch) => (
                <GlyphMatrix key={ch} ch={ch} />
              ))}
            </div>
            <p className="text-base leading-relaxed text-muted">
              X ၏ ခါးကို <span className="font-mono text-fg">.XXX.</span> နှစ်တန်းဖြင့် ဖွင့်ထားသောကြောင့် လက်ဝါးက ၂ စက်အထု ရှိပါသည်။ A ၏ ခါးပတ်က အတန်း ၅။ G ၏ ခွန်းက အတန်း ၄–၆ တွင် <span className="font-mono text-fg">XX.XX</span>။ Y က အပေါ်ခွဲပြီး အောက်ပိုင်းက ကော်လံတစ်ခုတည်း ဖြစ်ပါသည်။
            </p>

            <h3 className="font-mono text-sm text-fg uppercase tracking-wider">Sphere — Pass သုံးဆင့်</h3>
            <ol className="flex list-decimal flex-col gap-3 pl-5 text-base leading-relaxed text-muted">
              <li>အရိပ် (Shadow) — အနက်စက်ဝိုင်း။ Blur = r × (0.5 + highlight × 0.6)။ Offset က မီးရင်းမြစ်ရဲ့ ဆန့်ကျင်ဘက်။</li>
              <li>Additive Glow — Highlight 0.02 ကျော်မှ။ အဖြူ radial၊ alpha 0.12 × highlight။ Composite <span className="font-mono text-fg">lighter</span>။</li>
              <li>ကိုယ်ထည် (Body) — Radial gradient: stop 0 အဖြူ 75% ရော၊ stop 0.35 albedo၊ stop 1 ကို #141210 နဲ့ 55% ရော။ မီးက pointer။ မရှိလျှင် ဘယ်အပေါ်။</li>
            </ol>
            <p className="text-base leading-relaxed text-muted">
              ဘောလုံးတိုင်းတွင် မူလအိမ် <span className="font-mono text-fg">hx, hy</span> ရှိပါသည်။ Physics က <span className="font-mono text-fg">x, y</span> ကို ရွေ့ပြီး အိမ်ကို ပြန်ဆွဲပါသည်။ Pointer field အချင်းဝက် 200px။ နောက်ခံက 1px စတုရန်းကွက်၊ #464646၊ alpha 0.18။ Pointer နားရောက်မှ ပိုမိုတောက်ပလာပါသည်။
            </p>

            <h3 className="font-mono text-sm text-fg uppercase tracking-wider">Unwrap Rules</h3>
            <ol className="flex flex-col gap-4">
              <Step n="1" t="ပထမဆုံး ထိခြင်း" d="ပထမဆုံး ဘောလုံးကို ဖွင့်မှ ဆုလက်ဆောင်များ ချထားပါသည်။ ၁၆% ခန့်က X။ ကျန်သည်မှာ အောင်မြင်မှု ပန်းစည်း၊ ကောင်းမြတ်သော လက်ဆောင်၊ အနာဂတ်၏ အလင်း။" />
              <Step n="2" t="ပေါက်ကွဲခြင်း" d="110ms အတွင်း ဘောလုံးဖောင်းပြီး ပေါက်ကွဲပါသည်။ အမှုန် ၁၆ စက်။ X ဆိုလျှင် ၂၈ စက်၊ အလင်းပိုကြီးပါသည်။" />
              <Step n="3" t="ကျန်ခဲ့သည်" d="ပေါက်သွားသော နေရာတွင် လက်ဆောင်ပုံ ကျန်ရစ်ပါသည်။ ဂဏန်းမရေးပါ။ အန္တရာယ်မရှိပါ။" />
              <Step n="4" t="ဆုလက်ဆောင်" d="ဘောလုံးအားလုံး ပေါက်ပြီးလျှင် “The gift is X Marketing.” ယင်းဆုလက်ဆောင်များ ကိုယ်တိုင်သည် X Marketing ဖြစ်ပါသည်။" />
            </ol>
          </section>
        </div>
      </main>
    </div>
  );
}

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-col gap-1 bg-bg px-4 py-3">
      <dt className="font-mono text-xs text-dim">{k}</dt>
      <dd className="text-sm leading-relaxed text-fg">{v}</dd>
    </div>
  );
}

function Swatch({ name, hex, className, light = false }: { name: string; hex: string; className: string; light?: boolean }) {
  return (
    <div className={`flex h-20 flex-col justify-end rounded-lg border border-line p-3 ${className}`}>
      <span className={`font-mono text-xs ${light ? "text-bg" : "text-fg"}`}>{name}</span>
      <span className={`font-mono text-xs ${light ? "text-ink" : "text-muted"}`}>{hex}</span>
    </div>
  );
}

function Step({ n, t, d }: { n: string; t: string; d: string }) {
  return (
    <li className="grid grid-cols-[2rem_1fr] gap-3 border-t border-line pt-4">
      <span className="font-mono text-sm text-dim">{n}</span>
      <div>
        <h3 className="font-mono text-sm text-fg">{t}</h3>
        <p className="mt-1 text-base leading-relaxed text-muted">{d}</p>
      </div>
    </li>
  );
}
