import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Wordmark, fmtTime, type Hud } from "@/components/wordmark";
import { GlyphMatrix } from "@/components/glyph-matrix";
import { countText } from "@/lib/glyphs";

export const Route = createFileRoute("/")({ component: Home });

const NAV = [
  { href: "#concept", label: "concept" },
  { href: "#language", label: "language" },
  { href: "#mark", label: "construction" },
];

const LOCKUP = ["X", "AGENCY"] as const;
const PROMISE =
  "X Marketing မှ လူကြီးမင်းတို့အတွက် ကောင်းမြတ်သော လက်ဆောင်များ၊ အောင်မြင်မှု ပန်းစည်းများနှင့် အနာဂတ်၏ တော်ပျခြင်း အလင်းများကို ဆောင်ယူပေးပါသည်။ ယင်းဆုလက်ဆောင်များ ကိုယ်တိုင်သည်ပင် ကျွန်တော်တို့ X Marketing ကိုယ်တိုင်ပင် ဖြစ်ပါသည်။";

function Home() {
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
    <div className="min-h-screen bg-bg text-fg">
      <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-line bg-bg/85 px-5 py-3 backdrop-blur-md md:px-8">
        <a href="#top" className="font-mono text-sm font-bold tracking-widest text-fg">
          X
        </a>
        <nav className="flex items-center gap-4 overflow-x-auto font-mono text-xs text-muted md:gap-7 md:text-sm">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className="shrink-0 hover:text-fg">
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      <main id="top">
        <section className="relative border-b border-line">
          <div className="relative mx-auto aspect-[10/17] w-full max-w-lg">
            <Wordmark
              text="X"
              lines={LOCKUP}
              playable
              interactive
              showGrid={grid}
              muted={muted}
              round={round}
              onHud={setHud}
              className="absolute inset-0 h-full w-full cursor-crosshair touch-manipulation"
            />
            {hud.done && (
              <div className="absolute inset-0 flex items-center justify-center bg-bg/80 px-4 backdrop-blur-md">
                <div className="flex max-w-md flex-col items-center gap-3 rounded-card border border-line bg-bg px-6 py-8 text-center">
                  <div className="font-display text-3xl text-fg md:text-5xl">The gift is X.</div>
                  <p className="text-sm leading-relaxed text-muted">လက်ဆောင်က X ကိုယ်တိုင်ပါ။ သင့်အတွက် ယူဆောင်လာသူက ကျွန်ုပ်တို့ပါ။</p>
                  <div className="font-mono text-xs text-dim">{fmtTime(hud.ms)}</div>
                  <button type="button" onClick={again} className="h-11 rounded-control border border-line px-4 font-mono text-sm text-fg">
                    Unwrap again
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="mx-auto flex max-w-lg flex-col gap-3 px-5 py-3">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs text-dim">
              <span className="text-fg">{fmtTime(hud.ms)}</span>
              <span>
                <span className="text-fg">{hud.popped}</span> opened
              </span>
              <span>
                <span className="text-fg">{hud.left}</span> wrapped
              </span>
              <span>
                <span className="text-fg">{hud.found}</span> X
              </span>
              <span className="text-muted">unwrap · the gift is already here</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => setGrid((v) => !v)} className="h-11 rounded-control border border-line bg-bg px-4 font-mono text-sm text-fg">
                {grid ? "grid on" : "grid off"}
              </button>
              <button type="button" onClick={() => setMuted((v) => !v)} className="h-11 rounded-control border border-line bg-bg px-4 font-mono text-sm text-fg">
                {muted ? "sound off" : "sound on"}
              </button>
              <button type="button" onClick={() => setRules((v) => !v)} className="h-11 w-11 rounded-full border border-line font-mono text-sm text-fg">
                i
              </button>
              <button type="button" onClick={again} className="h-11 rounded-control border border-line bg-bg px-4 font-mono text-sm text-fg">
                reset
              </button>
            </div>
            {rules && (
              <div className="max-w-sm rounded-pop border border-line p-4 font-mono text-xs leading-relaxed text-muted">
                <div className="mb-2 text-fg">How to unwrap</div>
                <div>1. Tap a white sphere.</div>
                <div>2. It bursts. A gift stays behind.</div>
                <div>3. Flower, box, spark — or an X.</div>
                <div>4. Open every sphere.</div>
                <div>5. The gift is X.</div>
              </div>
            )}
          </div>
          <div className="mx-auto flex max-w-xl flex-col items-center gap-2 px-5 pb-8 text-center">
            <h1 className="font-display text-3xl leading-none text-fg md:text-5xl">The gift is X.</h1>
            <p className="text-sm leading-relaxed text-muted md:text-base">
              X အမည်ရှိ အေဂျင်စီက သင့်အတွက် လက်ဆောင်ယူလာပါတယ်။ ပန်း၊ လက်ဆောင်၊ အလင်းစ။ အဲဒီလက်ဆောင်က X ကိုယ်တိုင် — ကျွန်ုပ်တို့ပါ။
            </p>
          </div>
        </section>

        <div className="mx-auto flex max-w-3xl flex-col gap-16 px-5 py-14 md:px-8 md:py-20">
          <section id="concept" className="reveal flex flex-col gap-5">
            <p className="font-mono text-xs tracking-widest text-dim">01 — design concept</p>
            <h2 className="font-display text-3xl leading-none text-fg md:text-4xl">ဆုလက်ဆောင်သည် X Marketing ကိုယ်တိုင်ပါ။</h2>
            <p className="text-base leading-relaxed text-muted">{PROMISE}</p>
            <dl className="grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2">
              <Fact k="အမည်" v="X Marketing" />
              <Fact k="ပေးအပ်သူ" v="ကျွန်တော်တို့ X Marketing" />
              <Fact k="လူကြီးမင်းတို့အတွက်" v="ကောင်းမြတ်သော လက်ဆောင်၊ အောင်မြင်မှု ပန်းစည်း၊ အနာဂတ်၏ တော်ပျခြင်း အလင်း။" />
              <Fact k="ဆုလက်ဆောင်" v="ယင်းအရားများ ကိုယ်တိုင်သည် X Marketing ကိုယ်တိုင်ပင် ဖြစ်ပါသည်။" />
            </dl>
            <p className="text-base leading-relaxed text-muted">
              Logo က ကြေညာစာတမ်းမဟုတ်ပါ။ လူကြီးမင်းတို့အတွက် ထုပ်ပိုးထားသော ဆုလက်ဆောင်ပါ။ အဖြူဘောလုံးက အထုပ်။ နှိပ်လိုက်လျှင် ပော်ကွဲပြီး အောက်တွင် ဖွက်ထားသော ပန်းစည်း၊ လက်ဆောင်၊ အလင်း၊ သို့မဟုတ် X ပော်လာပါသည်။ အားလုံးဖွင့်မှ ဆုလက်ဆောင်စစ်ကို မြင်ရပါသည် — The gift is X Marketing.
            </p>
            <p className="text-base leading-relaxed text-muted">
              စာလုံးနှစ်ကြောင်းက ဤအဓိပ္ပာယ်ကို တည်ဆောက်ပုံဖြင့် ပြပါသည်။ အပော်က X က ကြီးပါသည်။ နာမည်၊ အလင်း၊ ကျွန်တော်တို့။ အောက်က AGENCY က သေးပါသည်။ သို့သော် တူည်းသော အကျယ်အတိုင်း ဆန့်ထားပါသည်။ လူကြီးမင်းတို့ထံး ဆောင်ယူပေးသော အလုပ်သည် X ၏ အောက်တွင်၊ X ၏ အကျယ်အတိုင်း ရပ်ပါသည်။
            </p>
          </section>

          <section id="language" className="flex flex-col gap-5">
            <p className="font-mono text-xs tracking-widest text-dim">02 — design language</p>
            <h2 className="font-display text-3xl leading-none md:text-4xl">လက်ဆောင်၊ ပန်းစည်း၊ အလင်း။</h2>
            <p className="text-base leading-relaxed text-muted">
              အရောင်မထည့်ပါ။ လူကြီးမင်းတို့အတွက် ယူဆောင်လာသော အရာကို အရောင်ဖြင့် မပြောပါ — ပုံသဏ္ဌာန်ဖြင့် ပြောပါသည်။ ပန်းစည်းက အောင်မြင်မှု။ သေတ္တာက ကောင်းမြတ်သော လက်ဆောင်။ ကြယ်က အနာဂတ်၏ တော်ပျခြင်း။ X က ကျွန်တော်တို့ ကိုယ်တိုင်။ အားလုံး #f2f2f2။
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Swatch name="field" hex="#0a0a0a" className="bg-bg" />
              <Swatch name="sphere" hex="#c8c8c8" className="bg-fg" light />
              <Swatch name="gift" hex="#f2f2f2" className="bg-fg" light />
              <Swatch name="quiet" hex="#9a9a9a" className="bg-muted" light />
            </div>
            <ul className="flex flex-col gap-3 text-base leading-relaxed text-muted">
              <li>
                <span className="font-mono text-fg">Mark.</span> စာလုံးက font outline မဟုတ်ပါ။ 5×8 အစက်ကွက်ပော်က ဘောလုံးပါ။ ဘောလုံး albedo RGB 200။ မီးက အဖြူ။ အရိပ်က #141210 နဲ့ ရောပါတယ်။
              </li>
              <li>
                <span className="font-mono text-fg">Lockup.</span> ကြောင်းနှစ်ကြောင်း၊ အလယ်တန်း။ Web ရော mobile ရော အခိုးတူ။ တစ်ကြောင်းခင်း အကျယ်ပြည့် ဆန့်ပါသည်။ X ၏ pitch ကြီးပါသည်။ AGENCY ၏ pitch သေးပါသည်။
              </li>
              <li>
                <span className="font-mono text-fg">Type.</span> ကြေညာချက် “The gift is X Marketing.” က Archivo Black။ စနစ်စာသားက JetBrains Mono။ မြန်မာစာက Noto Sans Myanmar။
              </li>
              <li>
                <span className="font-mono text-fg">Motion.</span> ဘောလုံးသည် pointer ကို ရှောင်ပါသည်။ Spring 0.06၊ damping 0.82။ နှိပ်လျှင် 110ms အတွင်း ဖောင်းပြီး ပော်ကပါသည်။ ပန်းစည်း၊ လက်ဆောင်၊ အလင်းသည် နေရာ။ ကျန်ပါသည်။
              </li>
              <li>
                <span className="font-mono text-fg">Sound.</span> ဖိုင်မဟုတ်ပါ။ ဖွင့်သံက C major တိုတို။ X Marketing ကို တွေ့လျှင် ပိုမြင့်သော sine။ အားလုံးဖွင့်လျှင် arpeggio။
              </li>
            </ul>
          </section>

          <section id="mark" className="flex flex-col gap-6">
            <p className="font-mono text-xs tracking-widest text-dim">03 — how the mark is built</p>
            <h2 className="font-display text-3xl leading-none md:text-4xl">စာလုံးတစ်လုံးက ဘောလုံးကွက်ပါ။</h2>
            <p className="text-base leading-relaxed text-muted">
              စာလုံးတစ်လုံးကို အလျား ၅ ကော်လံ၊ အမြင့် ၈ တန်း string ဖြင့် ရေးပါသည်။ <span className="font-mono text-fg">X</span> က ဘောလုံး၊ <span className="font-mono text-fg">.</span> က အပော်က။ လက်မောင်းအထု ၂ စက်၊ အပော်က ၁ ကော်လံ။ X / AGENCY lockup တွင် စာလုံး ၇ လုံး၊ ဘောလုံး {dots} လုံး။
            </p>
            <pre className="formula overflow-x-auto rounded-card border border-line bg-bg p-4">{`inner   = width × 0.91
cols    = 5·L + 1.6·(L − 1)
pitch   = inner / cols          ← one pitch per line
radius  = pitch × 0.44
gap     = pitch of X × 0.38
X      = 5 cols, pitch large
AGENCY = 38 cols, same width`}</pre>
            <p className="text-base leading-relaxed text-muted">
              X က ကော်လံ ၅ သာရှိသောင်းကြောင့် တစ်ကြောင်းပြည့်ချဲ့လျှင် ဘောလုံးကြီးပါသည်။ AGENCY က စာလုံး ၆ လုံး၊ ကော်လံ ၃၈၊ တူည်းသော အကျယ်ထဲ ဝင်အောင် pitch သေးပါသည်။ ကြောင်းကြားကွာဟချက်က X pitch ၏ ၀.၃၈။ ဖုန်းတွင် အကျယ်ပြည့်၊ ဝက်ဘ်တွင် အလယ်။ အကျယ် ၃၂rem။ အခိုးတူသောင်းကြောင့် နေရာတူပါသည်။
            </p>

            <h3 className="font-mono text-sm text-fg">Glyphs</h3>
            <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
              {["X", "A", "G", "E", "N", "C", "Y"].map((ch) => (
                <GlyphMatrix key={ch} ch={ch} />
              ))}
            </div>
            <p className="text-base leading-relaxed text-muted">
              X ၏ ခါးကို <span className="font-mono text-fg">.XXX.</span> နှစ်တန်းဖြင့် ဖွင့်ထားသောင်းကြောင့် လက်ဝါးက ၂ စက်အထု ရှိပါသည်။ A ၏ ခါးပတ်က အတန်း ၅။ G ၏ ခွန်းက အတန်း ၄–၆ တွင် <span className="font-mono text-fg">XX.XX</span>။ Y က အပော်ခွဲပြီး အောက်ပိုင်းက ကော်လံတစ်ခုတည်း။
            </p>

            <h3 className="font-mono text-sm text-fg">Sphere — pass သုံးဆင့်</h3>
            <ol className="flex list-decimal flex-col gap-3 pl-5 text-base leading-relaxed text-muted">
              <li>အရိပ်။ အနက်စက်ဝိုင်း။ Blur = r × (0.5 + highlight × 0.6)။ Offset က မီးရင်းမြစ်ရဲ့ ဆန့်ကျင်ဘက်။</li>
              <li>Additive glow။ Highlight 0.02 ကျော်မှ။ အဖြူ radial၊ alpha 0.12 × highlight။ Composite <span className="font-mono text-fg">lighter</span>။</li>
              <li>ကိုယ်ထည်။ Radial gradient — stop 0 အဖြူ 75% ရော၊ stop 0.35 albedo၊ stop 1 ကို #141210 နဲ့ 55% ရော။ မီးက pointer။ မရှိရင် ဘယ်အပော်။</li>
            </ol>
            <p className="text-base leading-relaxed text-muted">
              ဘောလုံးတိုင်းမှာ အိမ် <span className="font-mono text-fg">hx, hy</span> ရှိပါတယ်။ Physics က <span className="font-mono text-fg">x, y</span> ကို ရွေ့ပြီး အိမ်ကို ပြန်ဆွဲပါတယ်။ Pointer field အချင်းဝက် 200px။ နောက်ရေခံက 1px စတုရန်းကွက်၊ #464646၊ alpha 0.18။ Pointer နားရောက်မှ ဖြူလာပါတယ်။
            </p>

            <h3 className="font-mono text-sm text-fg">Unwrap</h3>
            <ol className="flex flex-col gap-4">
              <Step n="1" t="ပထမဆုံး ထိခြင်း" d="ပထမဆုံး ဘောလုံးကို ဖွင့်မှ ဆုလက်ဆောင်များ ချထားပါသည်။ ၁၆% ခန့်က X။ ကျန်သည်မှာ အောင်မြင်မှု ပန်းစည်း၊ ကောင်းမြတ်သော လက်ဆောင်၊ အနာဂတ်၏ အလင်း။" />
              <Step n="2" t="ပော်ကွဲခြင်း" d="110ms အတွင်း ဘောလုံးဖောင်းပြီး ပော်ကပါသည်။ အမှုန် ၁၆ စက်။ X ဆိုလျှင် ၂၈ စက်၊ အလင်းပိုကြီးပါသည်။" />
              <Step n="3" t="ကျန်ခဲ့သည်" d="ပော်ကသွားသော နေရာတွင် လက်ဆောင်ပုံ ကျန်ပါသည်။ ဂဏာန်မရေးပါ။ အန္တရာယ်မရှိပါ။" />
              <Step n="4" t="ဆုလက်ဆောင်" d="ဘောလုံးအားလုံး ပော်ကပြီးလျှင် “The gift is X Marketing.” ယင်းဆုလက်ဆောင်များ ကိုယ်တိုင်သည် X Marketing ဖြစ်ပါသည်။" />
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
    <div className={`flex h-20 flex-col justify-end rounded-control border border-line p-3 ${className}`}>
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
