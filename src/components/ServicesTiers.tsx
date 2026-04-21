import { motion, useInView, useReducedMotion } from 'motion/react';
import { useRef } from 'react';

/**
 * ServicesTiers — three-tier engagement card row.
 *
 * Replaces the tier cards in src/pages/services.astro or src/pages/pricing.astro
 * (your choice — I'd collapse one into the other).
 *
 * Import: import ServicesTiers from '../components/ServicesTiers';
 * Use:    <ServicesTiers client:visible />
 */

type Tier = {
  name: string;
  price: string;
  duration: string;
  tagline: string;
  includes: string[];
  cta: string;
  href: string;
  highlight?: boolean;
};

const TIERS: Tier[] = [
  {
    name: 'Intelligence Layer Diagnostic',
    price: '$15,000',
    duration: '2–4 weeks',
    tagline: "Teams who suspect something is broken but can't name it.",
    includes: [
      'Audit of current operating context',
      'Friction map across the funnel',
      'Physics of Growth diagnosis',
      '12-page anonymized benchmark report',
      'One 90-min readout',
    ],
    cta: 'Start here',
    href: '/gravity-audit',
  },
  {
    name: 'Intelligence Layer Sprint',
    price: '$60–120K',
    duration: '30–90 days',
    tagline: 'Teams ready to build the infrastructure.',
    includes: [
      'Everything in Diagnostic',
      'Full Intelligence Layer build (6 components)',
      'Machine-readable brand + ICP spec',
      'Content model + schema deployment',
      'KPI framework + dashboard',
      'Agent / tool integration handoff',
      'Weekly Tuesday standups',
    ],
    cta: 'Book a Sprint call',
    href: 'mailto:nick@strategnik.com?subject=Intelligence Layer Sprint',
    highlight: true,
  },
  {
    name: 'Advisor Retainer',
    price: '$8,000/mo',
    duration: 'Ongoing, 6-mo min',
    tagline: 'Teams with an Intelligence Layer in place who want ongoing calibration.',
    includes: [
      'Bi-weekly strategic syncs',
      'Intelligence Layer updates as you scale',
      'GTM leader coaching',
      'Slack + async access',
      'Quarterly physics re-diagnosis',
    ],
    cta: 'Add after Sprint',
    href: 'mailto:nick@strategnik.com?subject=Advisor Retainer',
  },
];

export default function ServicesTiers() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '0px 0px -80px 0px' });
  const reduce = useReducedMotion();

  return (
    <section className="py-20 md:py-32 bg-black border-t border-gray-800">
      <div className="container-content">
        <p className="text-caption text-accent tracking-wide mb-4 font-bold uppercase">
          Services · engagement shape
        </p>
        <h2 className="text-display font-display italic text-white font-extrabold mb-6 max-w-3xl">
          Three shapes. One direction.
        </h2>
        <p className="text-body-lg text-gray-300 max-w-2xl mb-14">
          Most companies start with the Diagnostic and self-select into the Sprint within three weeks.
          Not everyone should buy the Sprint. The Diagnostic tells us both.
        </p>

        <div ref={ref} className="grid gap-5 md:grid-cols-3">
          {TIERS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={reduce ? false : { opacity: 0, y: 32 }}
              animate={isInView ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.45, delay: i * 0.08, ease: 'easeOut' }}
              className="relative rounded-xl p-8"
              style={{
                background: t.highlight ? '#0f1419' : '#0a0d11',
                border: `1px solid ${t.highlight ? 'var(--accent)' : '#2b363b'}`,
                boxShadow: t.highlight ? '0 12px 48px rgba(29,226,196,0.12)' : 'none',
              }}
            >
              {t.highlight && (
                <div
                  className="absolute -top-2.5 left-6 px-2.5 py-0.5 text-[10px] rounded font-bold uppercase tracking-wider"
                  style={{ background: 'var(--accent)', color: '#0d1117' }}
                >
                  Most pick this
                </div>
              )}
              <h3 className="text-lg text-white font-bold mb-2">{t.name}</h3>
              <div className="flex items-baseline gap-2.5 mb-1.5">
                <span
                  className="font-display italic font-extrabold text-3xl"
                  style={{ color: t.highlight ? 'var(--accent)' : '#fff' }}
                >
                  {t.price}
                </span>
                <span className="text-xs text-gray-400">{t.duration}</span>
              </div>
              <p className="text-sm text-gray-400 italic pb-5 mb-5 border-b border-[#1a2328]">
                {t.tagline}
              </p>
              <ul className="list-none p-0 m-0 mb-6 space-y-2.5">
                {t.includes.map((inc) => (
                  <li key={inc} className="flex gap-2.5 text-sm text-gray-300">
                    <span
                      className="shrink-0"
                      style={{ color: t.highlight ? 'var(--accent)' : '#7a7a85' }}
                    >
                      →
                    </span>
                    {inc}
                  </li>
                ))}
              </ul>
              <a
                href={t.href}
                className={
                  t.highlight
                    ? 'block text-center py-3 rounded-full font-bold text-sm no-underline'
                    : 'block text-center py-3 rounded font-bold text-sm no-underline border border-[#2b363b] text-white hover:border-white transition-colors'
                }
                style={
                  t.highlight
                    ? { background: 'var(--accent)', color: '#0d1117' }
                    : undefined
                }
              >
                {t.cta} →
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
