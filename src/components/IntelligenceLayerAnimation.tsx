import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useInView,
} from "motion/react";

/* ═══════════════════════════════════════════════════════
   HAND-DRAWN SVG PRIMITIVES
   These create the "confident ink stroke" aesthetic —
   lines that overshoot corners, wobble slightly, and
   feel sketched on a whiteboard.
   ═══════════════════════════════════════════════════════ */

// Seeded pseudo-random for deterministic wobble
function seededRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function sketchRect(
  x: number, y: number, w: number, h: number,
  seed = 0, overshoot = 4, wobble = 1.5
) {
  const r = seededRand(seed);
  const wo = () => (r() - 0.5) * wobble;
  const os = () => (r() - 0.3) * overshoot;
  return `M ${x - os()} ${y + wo()}
    L ${x + w + os()} ${y + wo()}
    L ${x + w + wo()} ${y + h + os()}
    L ${x - os()} ${y + h + wo()}
    Z`;
}

function sketchLine(
  x1: number, y1: number, x2: number, y2: number,
  seed = 0, wobble = 1.2
) {
  const r = seededRand(seed);
  const wo = () => (r() - 0.5) * wobble;
  const mx = (x1 + x2) / 2 + wo() * 3;
  const my = (y1 + y2) / 2 + wo() * 3;
  return `M ${x1 + wo()} ${y1 + wo()} Q ${mx} ${my} ${x2 + wo()} ${y2 + wo()}`;
}

function sketchArrow(
  x1: number, y1: number, x2: number, y2: number,
  seed = 0
) {
  const r = seededRand(seed);
  const wo = () => (r() - 0.5) * 1.2;
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const headLen = 10;
  const path = sketchLine(x1, y1, x2, y2, seed);
  const h1x = x2 - headLen * Math.cos(angle - 0.4) + wo();
  const h1y = y2 - headLen * Math.sin(angle - 0.4) + wo();
  const h2x = x2 - headLen * Math.cos(angle + 0.4) + wo();
  const h2y = y2 - headLen * Math.sin(angle + 0.4) + wo();
  return `${path} M ${h1x} ${h1y} L ${x2} ${y2} L ${h2x} ${h2y}`;
}

/* ═══════════════════════════════════════════════════════
   STYLE TOKENS
   ═══════════════════════════════════════════════════════ */

const COLORS = {
  ink: "#1a1a1a",
  inkLight: "#444",
  bg: "#fafaf8",
  mint: "#1de2c4",
  mintZone: "rgba(29, 226, 196, 0.12)",
  amber: "#f59e0b",
  amberZone: "rgba(245, 158, 11, 0.12)",
  blue: "#60a5fa",
  blueZone: "rgba(96, 165, 250, 0.12)",
  purple: "#c084fc",
  purpleZone: "rgba(192, 132, 252, 0.12)",
  red: "#ef4444",
  redZone: "rgba(239, 68, 68, 0.10)",
  teal: "#0D9488",
  navy: "#0F1F3D",
};

/* ═══════════════════════════════════════════════════════
   PILL HEADER — the "designed" element
   ═══════════════════════════════════════════════════════ */

function Pill({
  children,
  color = "mint",
  className = "",
}: {
  children: React.ReactNode;
  color?: "mint" | "amber" | "blue" | "purple";
  className?: string;
}) {
  const bgMap = {
    mint: COLORS.mintZone,
    amber: COLORS.amberZone,
    blue: COLORS.blueZone,
    purple: COLORS.purpleZone,
  };
  const borderMap = {
    mint: COLORS.mint,
    amber: COLORS.amber,
    blue: COLORS.blue,
    purple: COLORS.purple,
  };
  return (
    <span
      className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold tracking-wide ${className}`}
      style={{
        background: bgMap[color],
        border: `1.5px solid ${borderMap[color]}`,
        color: borderMap[color],
      }}
    >
      {children}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════
   HAND-DRAWN ANNOTATION
   ═══════════════════════════════════════════════════════ */

function Annotation({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-block text-xs tracking-widest ${className}`}
      style={{
        fontFamily: "'Caveat', 'Segoe Print', cursive",
        fontSize: "0.85rem",
        color: COLORS.inkLight,
        letterSpacing: "0.05em",
      }}
    >
      {children}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════
   SKETCHED BOX COMPONENT
   ═══════════════════════════════════════════════════════ */

function SketchBox({
  x, y, w, h, seed = 0, fill = "none", strokeWidth = 2, className = "",
}: {
  x: number; y: number; w: number; h: number;
  seed?: number; fill?: string; strokeWidth?: number; className?: string;
}) {
  return (
    <path
      d={sketchRect(x, y, w, h, seed)}
      fill={fill}
      stroke={COLORS.ink}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
      className={className}
    />
  );
}

/* ═══════════════════════════════════════════════════════
   ACT 1: THE FRACTURE
   Strategy → 5 silos → broken outputs
   ═══════════════════════════════════════════════════════ */

function ActOne() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });

  const silos = [
    { label: "CONTENT", sub: "4 writers, 2 editors", x: 30 },
    { label: "DEMAND GEN", sub: "2 campaign, 1 ops", x: 200 },
    { label: "WEB", sub: "2 dev, 1 designer", x: 370 },
    { label: "EVENTS", sub: "2 field, 1 logistics", x: 540 },
    { label: "MKTG OPS", sub: "2 rev ops, 1 analyst", x: 710 },
  ];

  const outputs = [
    "Off-brand blog posts",
    "Wrong ICP campaigns",
    "Stale web positioning",
    "Inconsistent event story",
    "Wrong metrics tracked",
  ];

  return (
    <div ref={ref} className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20">
      {/* Zone background */}
      <div
        className="absolute inset-0 rounded-3xl mx-4"
        style={{ background: COLORS.amberZone }}
      />

      <div className="relative z-10 max-w-5xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <Pill color="amber">ACT 1 — THE FRACTURE</Pill>
          <h2
            className="text-4xl md:text-5xl font-black mt-6 mb-3"
            style={{ fontFamily: "'Inter', system-ui, sans-serif", color: COLORS.navy }}
          >
            Strategy enters. Control degrades.
          </h2>
          <Annotation>[WHAT MOST MARKETING ORGS ACTUALLY LOOK LIKE]</Annotation>
        </motion.div>

        {/* SVG Diagram */}
        <motion.svg
          viewBox="0 0 860 520"
          className="w-full max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Strategy source box */}
          <motion.g
            initial={{ opacity: 0, y: -20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <SketchBox x={310} y={10} w={240} h={50} seed={1} fill={COLORS.purpleZone} strokeWidth={2.5} />
            <text x={430} y={42} textAnchor="middle" fontFamily="'Inter', sans-serif" fontWeight={700} fontSize={15} fill={COLORS.navy}>
              CMO / LEADERSHIP STRATEGY
            </text>
          </motion.g>

          {/* Solid arrows from strategy to silos */}
          {silos.map((s, i) => (
            <motion.path
              key={`arrow-${i}`}
              d={sketchArrow(430, 65, s.x + 70, 120, i * 7 + 10)}
              fill="none"
              stroke={COLORS.ink}
              strokeWidth={1.5}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
            />
          ))}

          {/* Silo boxes */}
          {silos.map((s, i) => (
            <motion.g
              key={`silo-${i}`}
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.7 + i * 0.1 }}
            >
              <SketchBox x={s.x} y={120} w={140} h={65} seed={i * 3 + 20} fill={COLORS.purpleZone} />
              <text x={s.x + 70} y={148} textAnchor="middle" fontFamily="'Inter', sans-serif" fontWeight={700} fontSize={11} fill={COLORS.navy}>
                {s.label}
              </text>
              <text x={s.x + 70} y={165} textAnchor="middle" fontFamily="'Caveat', cursive" fontSize={10} fill={COLORS.inkLight}>
                {s.sub}
              </text>
            </motion.g>
          ))}

          {/* Annotation */}
          <motion.text
            x={860}
            y={155}
            textAnchor="end"
            fontFamily="'Caveat', cursive"
            fontSize={12}
            fill={COLORS.inkLight}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 1.2 }}
          >
            [EACH INTERPRETS DIFFERENTLY]
          </motion.text>

          {/* Dashed red arrows from silos to outputs */}
          {silos.map((s, i) => (
            <motion.path
              key={`red-arrow-${i}`}
              d={sketchArrow(s.x + 70, 190, s.x + 70, 260, i * 5 + 50)}
              fill="none"
              stroke={COLORS.red}
              strokeWidth={1.5}
              strokeDasharray="6 4"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={isInView ? { pathLength: 1, opacity: 0.8 } : {}}
              transition={{ duration: 0.4, delay: 1.3 + i * 0.1 }}
            />
          ))}

          {/* Output boxes — red */}
          {outputs.map((label, i) => {
            const x = silos[i].x;
            return (
              <motion.g
                key={`output-${i}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.3, delay: 1.6 + i * 0.1 }}
              >
                <SketchBox x={x} y={260} w={140} h={45} seed={i * 4 + 70} fill={COLORS.redZone} />
                <text x={x + 70} y={287} textAnchor="middle" fontFamily="'Inter', sans-serif" fontWeight={600} fontSize={10} fill={COLORS.red}>
                  {label}
                </text>
              </motion.g>
            );
          })}

          {/* Bottom bar */}
          <motion.g
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 2.0 }}
          >
            <rect x={20} y={330} width={820} height={50} rx={6} fill={COLORS.navy} />
            <text x={430} y={358} textAnchor="middle" fontFamily="'Inter', sans-serif" fontWeight={600} fontSize={12} fill="white">
              The buyer encounters five different companies. Brand dilutes. Pipeline slows.
            </text>
            <text x={430} y={373} textAnchor="middle" fontFamily="'Inter', sans-serif" fontWeight={600} fontSize={12} fill={COLORS.amber}>
              Adding AI makes it worse — not better.
            </text>
          </motion.g>

          {/* Three amber callout cards */}
          {[
            { title: "AI AMPLIFIES OUTPUT", desc: "More fragmented content, faster", x: 40 },
            { title: "AGENTS NEED CONTEXT", desc: "Every prompt starts from zero", x: 310 },
            { title: "PIPELINE PAYS THE PRICE", desc: "Longer cycles, higher CAC", x: 580 },
          ].map((card, i) => (
            <motion.g
              key={`card-${i}`}
              initial={{ opacity: 0, y: 15 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 2.3 + i * 0.15 }}
            >
              <SketchBox x={card.x} y={400} w={240} h={55} seed={i * 6 + 90} fill={COLORS.amberZone} />
              <text x={card.x + 120} y={425} textAnchor="middle" fontFamily="'Inter', sans-serif" fontWeight={800} fontSize={11} fill={COLORS.amber}>
                {card.title}
              </text>
              <text x={card.x + 120} y={442} textAnchor="middle" fontFamily="'Caveat', cursive" fontSize={12} fill={COLORS.inkLight}>
                {card.desc}
              </text>
            </motion.g>
          ))}
        </motion.svg>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ACT 2: THE ASSEMBLY
   Six components → unified Intelligence Layer
   ═══════════════════════════════════════════════════════ */

function ActTwo() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });

  const components = [
    { label: "Brand + Voice", icon: "🎙", color: COLORS.purple, zone: COLORS.purpleZone },
    { label: "ICP + Buyer", icon: "🎯", color: COLORS.blue, zone: COLORS.blueZone },
    { label: "Competitive\nFraming", icon: "⚔", color: COLORS.amber, zone: COLORS.amberZone },
    { label: "Content\nArchitecture", icon: "🏗", color: COLORS.mint, zone: COLORS.mintZone },
    { label: "Machine\nReadability", icon: "🤖", color: COLORS.mint, zone: COLORS.mintZone },
    { label: "Measurement\nTargets", icon: "📊", color: COLORS.blue, zone: COLORS.blueZone },
  ];

  // Arrange in 2 rows of 3
  const positions = [
    { x: 80, y: 80 }, { x: 330, y: 80 }, { x: 580, y: 80 },
    { x: 80, y: 220 }, { x: 330, y: 220 }, { x: 580, y: 220 },
  ];

  return (
    <div ref={ref} className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <div
        className="absolute inset-0 rounded-3xl mx-4"
        style={{ background: COLORS.mintZone }}
      />

      <div className="relative z-10 max-w-5xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <Pill color="mint">ACT 2 — THE ASSEMBLY</Pill>
          <h2
            className="text-4xl md:text-5xl font-black mt-6 mb-3"
            style={{ fontFamily: "'Inter', system-ui, sans-serif", color: COLORS.navy }}
          >
            Six components. One source of truth.
          </h2>
          <Annotation>[THE INTELLIGENCE LAYER — ASSEMBLED]</Annotation>
        </motion.div>

        <motion.svg
          viewBox="0 0 860 480"
          className="w-full max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Central layer zone */}
          <motion.rect
            x={40}
            y={50}
            width={780}
            height={290}
            rx={12}
            fill={COLORS.mintZone}
            stroke={COLORS.mint}
            strokeWidth={2}
            strokeDasharray="8 4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          />

          {/* Layer label */}
          <motion.text
            x={430}
            y={35}
            textAnchor="middle"
            fontFamily="'Inter', sans-serif"
            fontWeight={900}
            fontSize={14}
            fill={COLORS.teal}
            letterSpacing="0.1em"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.4 }}
          >
            THE INTELLIGENCE LAYER
          </motion.text>

          {/* Six component cards */}
          {components.map((comp, i) => {
            const pos = positions[i];
            return (
              <motion.g
                key={`comp-${i}`}
                initial={{ opacity: 0, x: i < 3 ? -40 : 40, y: i < 3 ? -30 : 30 }}
                animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
                transition={{
                  duration: 0.5,
                  delay: 0.6 + i * 0.15,
                  type: "spring",
                  stiffness: 120,
                }}
              >
                <SketchBox
                  x={pos.x}
                  y={pos.y}
                  w={190}
                  h={100}
                  seed={i * 8 + 100}
                  fill={comp.zone}
                  strokeWidth={2}
                />
                <text
                  x={pos.x + 95}
                  y={pos.y + 35}
                  textAnchor="middle"
                  fontSize={22}
                >
                  {comp.icon}
                </text>
                {comp.label.split("\n").map((line, li) => (
                  <text
                    key={li}
                    x={pos.x + 95}
                    y={pos.y + 60 + li * 16}
                    textAnchor="middle"
                    fontFamily="'Inter', sans-serif"
                    fontWeight={700}
                    fontSize={12}
                    fill={COLORS.navy}
                  >
                    {line}
                  </text>
                ))}
              </motion.g>
            );
          })}

          {/* Connecting lines between components */}
          {[
            [0, 1], [1, 2], [3, 4], [4, 5], [0, 3], [1, 4], [2, 5],
          ].map(([from, to], i) => (
            <motion.path
              key={`conn-${i}`}
              d={sketchLine(
                positions[from].x + 190, positions[from].y + 50,
                positions[to].x, positions[to].y + 50,
                i * 3 + 200
              )}
              fill="none"
              stroke={COLORS.mint}
              strokeWidth={1.5}
              strokeDasharray="4 3"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={isInView ? { pathLength: 1, opacity: 0.5 } : {}}
              transition={{ duration: 0.4, delay: 1.5 + i * 0.08 }}
            />
          ))}

          {/* Heartbeat pulse */}
          <motion.circle
            cx={430}
            cy={195}
            r={8}
            fill={COLORS.mint}
            initial={{ opacity: 0, scale: 0 }}
            animate={
              isInView
                ? {
                    opacity: [0, 0.8, 0.3, 0.8, 0.3],
                    scale: [0, 1, 1.8, 1, 1.8],
                  }
                : {}
            }
            transition={{
              duration: 2,
              delay: 2.0,
              repeat: Infinity,
              repeatType: "loop",
            }}
          />

          {/* Annotations */}
          <motion.text
            x={430}
            y={375}
            textAnchor="middle"
            fontFamily="'Caveat', cursive"
            fontSize={15}
            fill={COLORS.inkLight}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 2.2 }}
          >
            [ONE SHARED CONTEXT → EVERY TOOL, EVERY AGENT, EVERY PERSON]
          </motion.text>

          {/* Bottom result bar */}
          <motion.g
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 2.4 }}
          >
            <rect x={120} y={400} width={620} height={45} rx={6} fill={COLORS.navy} />
            <text x={430} y={428} textAnchor="middle" fontFamily="'Inter', sans-serif" fontWeight={600} fontSize={13} fill={COLORS.mint}>
              Change it once, and it changes everywhere.
            </text>
          </motion.g>
        </motion.svg>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ACT 3: THE LIVING SYSTEM
   Signals → Classification → Propagation
   ═══════════════════════════════════════════════════════ */

function ActThree() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });

  const signals = [
    { label: "RANKING DROP", x: 30, y: 60, color: COLORS.blue },
    { label: "COMPETITOR MOVE", x: 30, y: 140, color: COLORS.amber },
    { label: "PIPELINE SHIFT", x: 30, y: 220, color: COLORS.purple },
    { label: "CPA SPIKE", x: 30, y: 300, color: COLORS.red },
  ];

  const tiers = [
    { label: "TIER 1", sub: "AUTOMATED", desc: "Minutes", y: 80, color: COLORS.mint, zone: COLORS.mintZone },
    { label: "TIER 2", sub: "SEMI-AUTO", desc: "Hours", y: 180, color: COLORS.blue, zone: COLORS.blueZone },
    { label: "TIER 3", sub: "STRATEGIC", desc: "Days", y: 280, color: COLORS.purple, zone: COLORS.purpleZone },
  ];

  const channels = [
    { label: "GOOGLE ADS", y: 60 },
    { label: "LINKEDIN", y: 130 },
    { label: "EMAIL", y: 200 },
    { label: "WEBSITE", y: 270 },
    { label: "SALES DECK", y: 340 },
  ];

  return (
    <div ref={ref} className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <div
        className="absolute inset-0 rounded-3xl mx-4"
        style={{ background: COLORS.blueZone }}
      />

      <div className="relative z-10 max-w-5xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <Pill color="blue">ACT 3 — THE LIVING SYSTEM</Pill>
          <h2
            className="text-4xl md:text-5xl font-black mt-6 mb-3"
            style={{ fontFamily: "'Inter', system-ui, sans-serif", color: COLORS.navy }}
          >
            Detect. Classify. Propagate.
          </h2>
          <Annotation>[REAL-TIME SIGNAL → RESPONSE ARCHITECTURE]</Annotation>
        </motion.div>

        <motion.svg
          viewBox="0 0 900 440"
          className="w-full max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Column labels */}
          {[
            { label: "SIGNALS", x: 100 },
            { label: "INTELLIGENCE LAYER", x: 420 },
            { label: "CHANNELS", x: 760 },
          ].map((col, i) => (
            <motion.text
              key={`col-${i}`}
              x={col.x}
              y={30}
              textAnchor="middle"
              fontFamily="'Inter', sans-serif"
              fontWeight={800}
              fontSize={11}
              fill={COLORS.inkLight}
              letterSpacing="0.15em"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.3 }}
            >
              {col.label}
            </motion.text>
          ))}

          {/* Signal boxes — left side */}
          {signals.map((sig, i) => (
            <motion.g
              key={`sig-${i}`}
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.5 + i * 0.12 }}
            >
              <SketchBox x={sig.x} y={sig.y} w={150} h={40} seed={i * 5 + 300} fill="white" strokeWidth={1.5} />
              <circle cx={sig.x + 20} cy={sig.y + 20} r={5} fill={sig.color} />
              <text x={sig.x + 35} y={sig.y + 25} fontFamily="'Inter', sans-serif" fontWeight={700} fontSize={10} fill={COLORS.navy}>
                {sig.label}
              </text>
            </motion.g>
          ))}

          {/* Central layer — the classifier */}
          <motion.g
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <rect x={280} y={50} width={280} height={320} rx={10} fill={COLORS.mintZone} stroke={COLORS.mint} strokeWidth={2} />

            {/* Tier classification boxes */}
            {tiers.map((tier, i) => (
              <motion.g
                key={`tier-${i}`}
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 1.0 + i * 0.15 }}
              >
                <SketchBox x={300} y={tier.y} w={240} h={60} seed={i * 4 + 350} fill={tier.zone} />
                <text x={320} y={tier.y + 25} fontFamily="'Inter', sans-serif" fontWeight={800} fontSize={12} fill={tier.color}>
                  {tier.label}
                </text>
                <text x={390} y={tier.y + 25} fontFamily="'Inter', sans-serif" fontWeight={600} fontSize={11} fill={COLORS.navy}>
                  {tier.sub}
                </text>
                <text x={320} y={tier.y + 45} fontFamily="'Caveat', cursive" fontSize={12} fill={COLORS.inkLight}>
                  {tier.desc}
                </text>
                {/* Human gate for tier 2 */}
                {i === 1 && (
                  <motion.g
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ delay: 1.5 }}
                  >
                    <circle cx={510} cy={tier.y + 30} r={12} fill="white" stroke={COLORS.blue} strokeWidth={1.5} />
                    <text x={510} y={tier.y + 34} textAnchor="middle" fontSize={12}>👤</text>
                  </motion.g>
                )}
                {/* Leadership node for tier 3 */}
                {i === 2 && (
                  <motion.g
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ delay: 1.6 }}
                  >
                    <circle cx={510} cy={tier.y + 30} r={12} fill="white" stroke={COLORS.purple} strokeWidth={1.5} />
                    <text x={510} y={tier.y + 34} textAnchor="middle" fontSize={12}>👔</text>
                  </motion.g>
                )}
              </motion.g>
            ))}
          </motion.g>

          {/* Arrows: signals → layer */}
          {signals.map((sig, i) => (
            <motion.path
              key={`sig-arrow-${i}`}
              d={sketchArrow(180, sig.y + 20, 280, tiers[Math.min(i, 2)].y + 30, i * 3 + 400)}
              fill="none"
              stroke={sig.color}
              strokeWidth={1.5}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={isInView ? { pathLength: 1, opacity: 0.7 } : {}}
              transition={{ duration: 0.5, delay: 1.2 + i * 0.1 }}
            />
          ))}

          {/* Channel boxes — right side */}
          {channels.map((ch, i) => (
            <motion.g
              key={`ch-${i}`}
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: 1.8 + i * 0.1 }}
            >
              <SketchBox x={660} y={ch.y} w={140} h={40} seed={i * 6 + 500} fill="white" strokeWidth={1.5} />
              <text x={730} y={ch.y + 25} textAnchor="middle" fontFamily="'Inter', sans-serif" fontWeight={600} fontSize={11} fill={COLORS.navy}>
                {ch.label}
              </text>
              {/* Pulse dot */}
              <motion.circle
                cx={670}
                cy={ch.y + 20}
                r={4}
                fill={COLORS.mint}
                initial={{ opacity: 0 }}
                animate={
                  isInView
                    ? {
                        opacity: [0, 1, 0.3, 1, 0.3],
                        scale: [0.5, 1, 1.3, 1, 1.3],
                      }
                    : {}
                }
                transition={{
                  duration: 1.5,
                  delay: 2.2 + i * 0.2,
                  repeat: Infinity,
                  repeatType: "loop",
                }}
              />
            </motion.g>
          ))}

          {/* Arrows: layer → channels */}
          {channels.map((ch, i) => (
            <motion.path
              key={`ch-arrow-${i}`}
              d={sketchArrow(560, tiers[Math.min(i, 2)].y + 30, 660, ch.y + 20, i * 4 + 600)}
              fill="none"
              stroke={COLORS.mint}
              strokeWidth={1.5}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={isInView ? { pathLength: 1, opacity: 0.6 } : {}}
              transition={{ duration: 0.4, delay: 2.0 + i * 0.1 }}
            />
          ))}

          {/* Annotation */}
          <motion.text
            x={730}
            y={410}
            textAnchor="middle"
            fontFamily="'Caveat', cursive"
            fontSize={13}
            fill={COLORS.inkLight}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 2.8 }}
          >
            [ALL CHANNELS UPDATE — THE SYSTEM BREATHES]
          </motion.text>
        </motion.svg>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   CTA SECTION
   ═══════════════════════════════════════════════════════ */

function CTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.5 });

  return (
    <div ref={ref} className="relative min-h-[60vh] flex flex-col items-center justify-center px-6 py-20">
      <motion.div
        className="text-center max-w-2xl"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <h2
          className="text-4xl md:text-5xl font-black mb-6"
          style={{ fontFamily: "'Inter', system-ui, sans-serif", color: COLORS.navy }}
        >
          Before you hire, build, or buy —
        </h2>
        <p
          className="text-lg mb-8"
          style={{ color: COLORS.inkLight, fontFamily: "'Inter', sans-serif" }}
        >
          Know what you're actually missing. The Intelligence Layer Diagnostic maps your
          marketing function across all 6 components and delivers the gap analysis, the
          architecture blueprint, and the build plan.
        </p>
        <Annotation className="block mb-8">[2 WEEKS. ONE DELIVERABLE. THE FOUNDATION FOR EVERYTHING THAT COMES NEXT.]</Annotation>

        <motion.a
          href="mailto:nick@strategnik.com?subject=Intelligence%20Layer%20Diagnostic"
          className="inline-block px-8 py-4 rounded-full text-white font-bold text-lg"
          style={{ background: COLORS.teal }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          Book the Diagnostic
        </motion.a>

        <p className="mt-4 text-sm" style={{ color: COLORS.inkLight }}>
          nick@strategnik.com
        </p>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */

export default function IntelligenceLayerAnimation() {
  const prefersReduced = useReducedMotion();
  const containerRef = useRef(null);

  // For scroll progress indicator
  const { scrollYProgress } = useScroll({ target: containerRef });

  if (prefersReduced) {
    // Static fallback — show all three acts without animation
    return (
      <div className="relative" style={{ background: COLORS.bg }}>
        <div className="max-w-5xl mx-auto px-6 py-20 space-y-20">
          <div className="text-center">
            <h1 className="text-5xl font-black" style={{ color: COLORS.navy }}>The Intelligence Layer</h1>
            <p className="mt-4 text-lg" style={{ color: COLORS.inkLight }}>
              From fragmented marketing to a unified, signal-responsive operating system.
            </p>
          </div>
          <p className="text-center text-sm" style={{ color: COLORS.inkLight }}>
            [Animation reduced for accessibility — enable motion to see the full experience]
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative" style={{ background: COLORS.bg }}>
      {/* Scroll progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 z-50 origin-left"
        style={{
          scaleX: scrollYProgress,
          background: `linear-gradient(90deg, ${COLORS.amber}, ${COLORS.mint}, ${COLORS.blue})`,
        }}
      />

      {/* Hero */}
      <div className="min-h-[50vh] flex flex-col items-center justify-center px-6 py-16">
        <motion.div
          className="text-center max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Pill color="mint" className="mb-6">STRATEGNIK</Pill>
          <h1
            className="text-5xl md:text-7xl font-black mb-4"
            style={{ fontFamily: "'Inter', system-ui, sans-serif", color: COLORS.navy }}
          >
            The Intelligence Layer
          </h1>
          <p className="text-xl mb-6" style={{ color: COLORS.inkLight, fontFamily: "'Inter', sans-serif" }}>
            From fragmented marketing to a unified, signal-responsive operating system.
          </p>
          <Annotation className="block">[SCROLL TO SEE THE FULL STORY ↓]</Annotation>
        </motion.div>
      </div>

      {/* Three Acts */}
      <ActOne />
      <ActTwo />
      <ActThree />
      <CTA />

      {/* Footer attribution */}
      <div className="text-center py-8">
        <Annotation>strategnik.com — Nick Talbert</Annotation>
      </div>
    </div>
  );
}
