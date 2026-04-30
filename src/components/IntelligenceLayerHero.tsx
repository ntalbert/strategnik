import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

/* ═══════════════════════════════════════════════════════
   INTELLIGENCE LAYER HERO — CINEMATIC SINGLE VIEWPORT

   Auto-playing 20s loop that tells the three-act story:
   Act 1 (0-6s): The Fracture — signals scatter, outputs break
   Act 2 (6-13s): The Assembly — layer forms, components lock in
   Act 3 (13-20s): The Living System — signals flow, channels pulse
   ═══════════════════════════════════════════════════════ */

const COLORS = {
  bg: "#0a0f1a",
  navy: "#0F1F3D",
  surface: "#141b2d",
  mint: "#1de2c4",
  mintGlow: "rgba(29, 226, 196, 0.15)",
  mintSoft: "rgba(29, 226, 196, 0.08)",
  amber: "#f59e0b",
  amberGlow: "rgba(245, 158, 11, 0.12)",
  blue: "#60a5fa",
  blueGlow: "rgba(96, 165, 250, 0.12)",
  purple: "#c084fc",
  purpleGlow: "rgba(192, 132, 252, 0.1)",
  red: "#ef4444",
  redGlow: "rgba(239, 68, 68, 0.15)",
  text: "#e2e8f0",
  textMuted: "#94a3b8",
  textDim: "#64748b",
  white: "#ffffff",
};

const LOOP_DURATION = 20; // seconds

/* ═══════════════════════════════════════════════════════
   NARRATIVE BUBBLES — sequential messages
   ═══════════════════════════════════════════════════════ */

interface Bubble {
  text: string;
  position: "left" | "right" | "center";
  color: string;
  glowColor: string;
  enterAt: number; // seconds into loop
  exitAt: number;
  x: number; // percentage from left
  y: number; // percentage from top
  icon?: string;
  small?: boolean;
}

const ACT1_BUBBLES: Bubble[] = [
  { text: "Strategy briefed to 5 teams", position: "left", color: COLORS.purple, glowColor: COLORS.purpleGlow, enterAt: 0.5, exitAt: 5.5, x: 8, y: 20, icon: "📋" },
  { text: "Content interprets it one way", position: "right", color: COLORS.red, glowColor: COLORS.redGlow, enterAt: 1.2, exitAt: 5.5, x: 62, y: 15, small: true },
  { text: "Demand gen interprets it another", position: "right", color: COLORS.red, glowColor: COLORS.redGlow, enterAt: 1.8, exitAt: 5.5, x: 65, y: 30, small: true },
  { text: "Web team does their own thing", position: "right", color: COLORS.red, glowColor: COLORS.redGlow, enterAt: 2.4, exitAt: 5.5, x: 68, y: 45, small: true },
  { text: "Buyer sees 5 different companies", position: "center", color: COLORS.amber, glowColor: COLORS.amberGlow, enterAt: 3.5, exitAt: 5.8, x: 25, y: 72 },
  { text: "Adding AI makes it worse — faster.", position: "center", color: COLORS.red, glowColor: COLORS.redGlow, enterAt: 4.5, exitAt: 5.8, x: 20, y: 82, icon: "⚠" },
];

const ACT2_BUBBLES: Bubble[] = [
  { text: "Brand + Voice Spec", position: "left", color: COLORS.purple, glowColor: COLORS.purpleGlow, enterAt: 6.5, exitAt: 12.8, x: 5, y: 18, icon: "/icons/brand_voice.png" },
  { text: "ICP + Buyer Context", position: "left", color: COLORS.blue, glowColor: COLORS.blueGlow, enterAt: 7.0, exitAt: 12.8, x: 5, y: 32, icon: "/icons/icp_buyer.png" },
  { text: "Competitive Framing", position: "left", color: COLORS.amber, glowColor: COLORS.amberGlow, enterAt: 7.5, exitAt: 12.8, x: 5, y: 46, icon: "/icons/competitive.png" },
  { text: "Content Architecture", position: "right", color: COLORS.mint, glowColor: COLORS.mintGlow, enterAt: 8.0, exitAt: 12.8, x: 62, y: 18, icon: "/icons/content_arch.png" },
  { text: "Machine Readability", position: "right", color: COLORS.mint, glowColor: COLORS.mintGlow, enterAt: 8.5, exitAt: 12.8, x: 62, y: 32, icon: "/icons/machine_read.png" },
  { text: "Measurement Targets", position: "right", color: COLORS.blue, glowColor: COLORS.blueGlow, enterAt: 9.0, exitAt: 12.8, x: 62, y: 46, icon: "/icons/measurement.png" },
  { text: "One shared context. Every tool. Every agent.", position: "center", color: COLORS.mint, glowColor: COLORS.mintGlow, enterAt: 10.0, exitAt: 12.8, x: 15, y: 78, icon: "✓" },
];

const ACT3_BUBBLES: Bubble[] = [
  { text: "⚡ Ranking drop detected", position: "left", color: COLORS.blue, glowColor: COLORS.blueGlow, enterAt: 13.5, exitAt: 19.5, x: 3, y: 15, small: true },
  { text: "⚡ Competitor launches feature", position: "left", color: COLORS.amber, glowColor: COLORS.amberGlow, enterAt: 14.0, exitAt: 19.5, x: 3, y: 28, small: true },
  { text: "⚡ CPA spike on paid search", position: "left", color: COLORS.red, glowColor: COLORS.redGlow, enterAt: 14.5, exitAt: 19.5, x: 3, y: 41, small: true },
  { text: "Tier 1 → Auto-adjusting bids", position: "right", color: COLORS.mint, glowColor: COLORS.mintGlow, enterAt: 15.2, exitAt: 19.5, x: 60, y: 15, small: true },
  { text: "Tier 2 → Counter-narrative drafted", position: "right", color: COLORS.blue, glowColor: COLORS.blueGlow, enterAt: 15.8, exitAt: 19.5, x: 60, y: 28, small: true },
  { text: "👤 CMO approves in 1 hour", position: "right", color: COLORS.purple, glowColor: COLORS.purpleGlow, enterAt: 16.4, exitAt: 19.5, x: 60, y: 41, small: true },
  { text: "→ Ads updated  → Email adjusted  → Site live", position: "center", color: COLORS.mint, glowColor: COLORS.mintGlow, enterAt: 17.2, exitAt: 19.5, x: 12, y: 72 },
  { text: "Same-day response. All channels.", position: "center", color: COLORS.mint, glowColor: COLORS.mintGlow, enterAt: 18.0, exitAt: 19.5, x: 18, y: 83, icon: "✓" },
];

const ALL_BUBBLES = [...ACT1_BUBBLES, ...ACT2_BUBBLES, ...ACT3_BUBBLES];

/* ═══════════════════════════════════════════════════════
   CENTRAL APPARATUS — the machine visualization
   Orbital rings + core node + connection lines
   ═══════════════════════════════════════════════════════ */

function CentralApparatus({ phase }: { phase: number }) {
  // Phase 0 = fracture (red, chaotic), 1 = assembly (mint, forming), 2 = living (mint, pulsing)
  const coreColor = phase === 0 ? COLORS.red : COLORS.mint;
  const coreGlow = phase === 0 ? COLORS.redGlow : COLORS.mintGlow;
  const ringOpacity = phase === 0 ? 0.15 : 0.3;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="relative" style={{ width: 420, height: 420 }}>
        {/* Ambient glow */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 300,
            height: 300,
            left: 60,
            top: 60,
            background: `radial-gradient(circle, ${coreGlow} 0%, transparent 70%)`,
            filter: "blur(40px)",
          }}
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Orbital rings */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={`ring-${i}`}
            className="absolute rounded-full border"
            style={{
              width: 180 + i * 80,
              height: 180 + i * 80,
              left: 120 - i * 40,
              top: 120 - i * 40,
              borderColor: coreColor,
              opacity: ringOpacity - i * 0.05,
            }}
            animate={{
              rotate: [0, 360],
              rotateX: [15 + i * 10, 15 + i * 10],
            }}
            transition={{
              rotate: { duration: 12 + i * 4, repeat: Infinity, ease: "linear" },
            }}
          >
            {/* Orbital dot */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: 6,
                height: 6,
                background: coreColor,
                top: -3,
                left: "50%",
                marginLeft: -3,
                boxShadow: `0 0 8px ${coreColor}`,
              }}
            />
          </motion.div>
        ))}

        {/* Core hexagon / node */}
        <div
          className="absolute flex items-center justify-center"
          style={{ width: 100, height: 100, left: 160, top: 160 }}
        >
          <motion.div
            className="rounded-2xl flex items-center justify-center"
            style={{
              width: 80,
              height: 80,
              background: `linear-gradient(135deg, ${COLORS.surface}, ${COLORS.navy})`,
              border: `2px solid ${coreColor}`,
              boxShadow: `0 0 30px ${coreGlow}, inset 0 0 20px ${coreGlow}`,
            }}
            animate={{
              boxShadow: [
                `0 0 30px ${coreGlow}, inset 0 0 20px ${coreGlow}`,
                `0 0 50px ${coreGlow}, inset 0 0 30px ${coreGlow}`,
                `0 0 30px ${coreGlow}, inset 0 0 20px ${coreGlow}`,
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="text-2xl font-black" style={{ color: coreColor }}>
              {phase === 0 ? "?" : "IL"}
            </span>
          </motion.div>
        </div>

        {/* Connection lines radiating out — phase 1+ only */}
        {phase >= 1 && (
          <svg className="absolute inset-0" viewBox="0 0 420 420" style={{ opacity: 0.4 }}>
            {[0, 60, 120, 180, 240, 300].map((angle, i) => {
              const rad = (angle * Math.PI) / 180;
              const x1 = 210 + Math.cos(rad) * 55;
              const y1 = 210 + Math.sin(rad) * 55;
              const x2 = 210 + Math.cos(rad) * 170;
              const y2 = 210 + Math.sin(rad) * 170;
              return (
                <motion.line
                  key={`line-${i}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={COLORS.mint}
                  strokeWidth={1}
                  strokeDasharray="4 6"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.5 }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                />
              );
            })}
          </svg>
        )}

        {/* Data particles flowing in — phase 2 only */}
        {phase === 2 &&
          [0, 1, 2, 3, 4, 5].map((i) => {
            const angle = i * 60;
            const rad = (angle * Math.PI) / 180;
            const startX = 210 + Math.cos(rad) * 190;
            const startY = 210 + Math.sin(rad) * 190;
            return (
              <motion.div
                key={`particle-${i}`}
                className="absolute rounded-full"
                style={{
                  width: 4,
                  height: 4,
                  background: [COLORS.blue, COLORS.amber, COLORS.mint, COLORS.purple, COLORS.mint, COLORS.blue][i],
                  boxShadow: `0 0 6px ${[COLORS.blue, COLORS.amber, COLORS.mint, COLORS.purple, COLORS.mint, COLORS.blue][i]}`,
                }}
                animate={{
                  left: [startX, 210],
                  top: [startY, 210],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.35,
                  repeat: Infinity,
                  ease: "easeIn",
                }}
              />
            );
          })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MESSAGE BUBBLE COMPONENT
   ═══════════════════════════════════════════════════════ */

function MessageBubble({ bubble }: { bubble: Bubble }) {
  const isIconPath = bubble.icon?.startsWith("/");

  return (
    <motion.div
      className="absolute flex items-start gap-2"
      style={{
        left: `${bubble.x}%`,
        top: `${bubble.y}%`,
        maxWidth: bubble.small ? 220 : 320,
      }}
      initial={{ opacity: 0, y: 12, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div
        className="rounded-xl px-4 py-2.5 backdrop-blur-md"
        style={{
          background: `linear-gradient(135deg, ${bubble.glowColor}, rgba(20, 27, 45, 0.85))`,
          border: `1px solid ${bubble.color}33`,
          boxShadow: `0 4px 20px ${bubble.glowColor}`,
        }}
      >
        <div className="flex items-center gap-2">
          {bubble.icon && !isIconPath && (
            <span className="text-sm">{bubble.icon}</span>
          )}
          {bubble.icon && isIconPath && (
            <img
              src={bubble.icon}
              alt=""
              className="w-5 h-5 opacity-80"
              style={{ filter: "brightness(2) saturate(0)" }}
            />
          )}
          <span
            className={`font-semibold ${bubble.small ? "text-xs" : "text-sm"}`}
            style={{ color: COLORS.text, fontFamily: "'Inter', system-ui, sans-serif" }}
          >
            {bubble.text}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   PHASE INDICATOR — act labels
   ═══════════════════════════════════════════════════════ */

function PhaseLabel({ phase }: { phase: number }) {
  const labels = [
    { title: "The Fracture", sub: "Strategy degrades at every handoff", color: COLORS.red },
    { title: "The Assembly", sub: "Six components. One source of truth.", color: COLORS.mint },
    { title: "The Living System", sub: "Detect. Classify. Propagate.", color: COLORS.blue },
  ];
  const current = labels[phase];

  return (
    <motion.div
      className="absolute top-6 left-8 z-20"
      key={phase}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-3 mb-1">
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: current.color, boxShadow: `0 0 8px ${current.color}` }}
        />
        <span
          className="text-xs font-bold tracking-[0.2em] uppercase"
          style={{ color: current.color }}
        >
          Act {phase + 1}
        </span>
      </div>
      <h3
        className="text-xl font-bold ml-5"
        style={{ color: COLORS.white, fontFamily: "'Inter', system-ui, sans-serif" }}
      >
        {current.title}
      </h3>
      <p className="text-xs ml-5 mt-0.5" style={{ color: COLORS.textMuted }}>
        {current.sub}
      </p>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   PROGRESS BAR
   ═══════════════════════════════════════════════════════ */

function ProgressBar({ elapsed }: { elapsed: number }) {
  const progress = (elapsed % LOOP_DURATION) / LOOP_DURATION;
  const phase = elapsed < 6 ? 0 : elapsed < 13 ? 1 : 2;
  const phaseColors = [COLORS.red, COLORS.mint, COLORS.blue];

  return (
    <div className="absolute bottom-6 left-8 right-8 z-20">
      <div className="flex gap-1 mb-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-0.5 flex-1 rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.1)" }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                background: phaseColors[i],
                width:
                  i < phase
                    ? "100%"
                    : i === phase
                      ? `${((progress * 3 - i) / 1) * 100}%`
                      : "0%",
              }}
              transition={{ duration: 0.1 }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between">
        {["Fracture", "Assembly", "Living System"].map((label, i) => (
          <span
            key={i}
            className="text-[10px] font-medium tracking-wider uppercase"
            style={{ color: i === phase ? phaseColors[i] : COLORS.textDim }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN HERO COMPONENT
   ═══════════════════════════════════════════════════════ */

export default function IntelligenceLayerHero() {
  const prefersReduced = useReducedMotion();
  const [elapsed, setElapsed] = useState(0);

  // Timer loop
  useEffect(() => {
    if (prefersReduced) return;
    const interval = setInterval(() => {
      setElapsed((t) => (t + 0.05) % LOOP_DURATION);
    }, 50);
    return () => clearInterval(interval);
  }, [prefersReduced]);

  const phase = elapsed < 6 ? 0 : elapsed < 13 ? 1 : 2;

  // Determine which bubbles are visible
  const visibleBubbles = ALL_BUBBLES.filter(
    (b) => elapsed >= b.enterAt && elapsed < b.exitAt
  );

  if (prefersReduced) {
    return (
      <div
        className="relative w-full flex items-center justify-center"
        style={{ height: "100vh", background: COLORS.bg }}
      >
        <div className="text-center max-w-2xl px-6">
          <h1
            className="text-5xl font-black mb-4"
            style={{ color: COLORS.white, fontFamily: "'Inter', system-ui, sans-serif" }}
          >
            The Context Layer
          </h1>
          <p style={{ color: COLORS.textMuted }}>
            From fragmented marketing to a unified, signal-responsive operating system.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        height: "100vh",
        background: `radial-gradient(ellipse at 50% 40%, ${COLORS.navy} 0%, ${COLORS.bg} 70%)`,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Central apparatus */}
      <CentralApparatus phase={phase} />

      {/* Title — centered, persistent */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
        <motion.h1
          className="text-5xl md:text-7xl font-black text-center mb-2"
          style={{ color: COLORS.white }}
          animate={{ opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          The Context Layer
        </motion.h1>
        <motion.p
          className="text-base md:text-lg text-center max-w-lg px-4"
          style={{ color: COLORS.textMuted }}
        >
          From fragmented marketing to a unified, signal-responsive operating system.
        </motion.p>
      </div>

      {/* Phase label — top left */}
      <AnimatePresence mode="wait">
        <PhaseLabel phase={phase} key={phase} />
      </AnimatePresence>

      {/* Narrative bubbles */}
      <AnimatePresence>
        {visibleBubbles.map((bubble, i) => (
          <MessageBubble bubble={bubble} key={`${bubble.text}-${bubble.enterAt}`} />
        ))}
      </AnimatePresence>

      {/* Progress bar — bottom */}
      <ProgressBar elapsed={elapsed} />

      {/* CTA — bottom right */}
      <div className="absolute bottom-16 right-8 z-20">
        <motion.a
          href="mailto:nick@strategnik.com?subject=Digital%20Context%20Audit"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold"
          style={{
            background: `linear-gradient(135deg, ${COLORS.mint}, ${COLORS.teal || "#0D9488"})`,
            color: COLORS.bg,
          }}
          whileHover={{ scale: 1.04, boxShadow: `0 0 25px ${COLORS.mintGlow}` }}
          whileTap={{ scale: 0.97 }}
        >
          Book the Audit
          <span className="text-base">→</span>
        </motion.a>
      </div>

      {/* Strategnik watermark */}
      <div className="absolute top-6 right-8 z-20">
        <span
          className="text-xs font-bold tracking-[0.15em] uppercase"
          style={{ color: COLORS.textDim }}
        >
          Strategnik
        </span>
      </div>
    </div>
  );
}
