import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';

/**
 * HeroBold — replaces the homepage hero grid in src/pages/index.astro
 *
 * Usage in index.astro (inside <BrandGravityHero>):
 *   <HeroBold client:load />
 *
 * Keep the <BrandGravityHero> wrapper for the background — this component
 * only renders the hero content. Drop the existing <section class="min-h-screen ..."> block
 * (hp-hero__grid + hp-rotating-words + hp-stat-inline) and replace with <HeroBold />.
 */
export default function HeroBold() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const reduce = useReducedMotion();

  return (
    <section className="min-h-screen flex items-center py-24">
      <div className="container-content">
        <div ref={ref} className="grid gap-12 lg:gap-16 lg:grid-cols-[1.1fr_0.9fr] items-center">
          {/* Left — copy */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <p className="text-caption text-accent tracking-wide mb-6 font-bold uppercase">
              Strategnik · Gravity Audit
            </p>
            <h1
              className="font-black text-white tracking-tight mb-8 leading-[1.05]"
              style={{ textShadow: '0 2px 20px rgba(0,0,0,0.6), 0 4px 40px rgba(0,0,0,0.4)' }}
            >
              <span className="block text-5xl md:text-6xl lg:text-7xl mb-2">
                Your AI stack is faster.
              </span>
              <span className="block text-5xl md:text-6xl lg:text-7xl text-accent">
                Your output is worse.
              </span>
            </h1>
            <p className="text-xl text-gray-200 max-w-xl leading-relaxed mb-10">
              Without shared operating context, agents produce fragmented work faster. We build the
              Intelligence Layer — so every tool, writer, and rep pulls from the same source.
            </p>
            <div className="flex flex-wrap items-center gap-4 mb-12">
              <a href="/gravity-audit" className="hp-btn hp-btn--primary">
                Run the Gravity Audit →
              </a>
              <a
                href="/intelligence-layer"
                className="text-accent hover:text-white transition-colors font-bold text-sm"
              >
                See a real Intelligence Layer →
              </a>
            </div>
            <div className="flex flex-wrap gap-8 text-sm text-gray-400">
              <span>
                <strong className="text-white">20+ yrs</strong> B2B GTM
              </span>
              <span>
                <strong className="text-white">$10M–$150M ARR</strong> served
              </span>
              <span>
                <strong className="text-white">30–90 day</strong> builds
              </span>
            </div>
          </motion.div>

          {/* Right — artifact peek */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 32 }}
            animate={isInView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
            className="hidden lg:block"
          >
            <div
              className="rounded-lg border border-accent/80 bg-[#0f1419] shadow-[0_20px_60px_rgba(29,226,196,0.18)]"
              style={{ transform: 'perspective(1200px) rotateY(-6deg) rotateX(2deg)' }}
            >
              <div className="flex items-center gap-2 border-b border-[#1a2328] px-4 py-3">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                <span className="font-mono text-[10px] text-gray-500 ml-3">
                  acme-intelligence-layer.json
                </span>
              </div>
              <pre className="px-6 py-5 font-mono text-xs leading-[1.9] text-gray-300 m-0 overflow-x-auto">
{`{
  "brand":        "/specs/voice.md",
  "icp":          "/context/buyer.yaml",
  "position":     "/map/v3.json",
  "content_model":"/schema/v2",
  "measurement":  "/kpis/pipeline.yaml",
  // machine-readable, agent-queryable
  "health":         0.72,
  "friction_score": "HIGH"
}`}
              </pre>
            </div>
            <p className="text-xs text-gray-500 italic mt-4 text-right">
              Excerpt — actual client artifact, anonymized
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
