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
    <section className="pt-8 pb-24">
      <div className="container-content">
        <div ref={ref} className="max-w-2xl">
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
                AI made everything faster.
              </span>
              <span className="block text-5xl md:text-6xl lg:text-7xl text-accent">
                Except growth.
              </span>
            </h1>
            <p className="text-xl text-gray-200 max-w-xl leading-relaxed mb-10">
              Your team has AI. Output went up. Revenue didn't. The problem isn't the
              tools — it's that none of them know who you are, who you serve, or how
              you win. We build the Gravity Field: one operating context that every tool
              and every person works from. Then AI starts compounding instead of just typing.
            </p>
            <div className="flex flex-wrap items-center gap-4 mb-12">
              <a href="/gravity-audit" className="hp-btn hp-btn--primary">
                Run the Gravity Audit →
              </a>
              <a
                href="/physics-of-growth"
                className="text-accent hover:text-white transition-colors font-bold text-sm"
              >
                See the Physics of Growth →
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
        </div>
      </div>
    </section>
  );
}
