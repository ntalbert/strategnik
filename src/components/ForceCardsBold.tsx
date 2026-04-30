import { useState } from 'react';

/**
 * ForceCardsBold — orbital diagram + live detail panel.
 *
 * Replaces the card grid in src/pages/physics-of-growth/index.astro
 * (or the current <ForceCards> on the homepage if you want the bigger treatment).
 *
 * Import:  import ForceCardsBold from '../components/ForceCardsBold';
 * Use:     <ForceCardsBold client:visible />
 *
 * Each force links to /physics-of-growth/[slug] — use pages/physics-of-growth-force.astro
 * as the template for the detail pages.
 */

type Force = {
  name: string;
  slug: string;
  color: string;
  icon: 'momentum' | 'friction' | 'mass' | 'surface' | 'escape' | 'gravity';
  physics: string;
  gtm: string;
  diagnostic: string;
};

const FORCES: Force[] = [
  {
    name: 'Momentum',
    slug: 'momentum',
    color: '#1de2c4',
    icon: 'momentum',
    physics: 'Objects in motion tend to stay in motion.',
    gtm: "The investments that compound are the ones you're most tempted to kill.",
    diagnostic: 'Do you have 12+ months of sustained GTM effort in any single channel?',
  },
  {
    name: 'Friction',
    slug: 'friction',
    color: '#ef4444',
    icon: 'friction',
    physics: 'Resistance converts kinetic energy to heat.',
    gtm: 'Every unnecessary step in the buyer journey is energy lost.',
    diagnostic: 'How many steps between first touch and first "yes"?',
  },
  {
    name: 'Mass',
    slug: 'mass',
    color: '#f59e0b',
    icon: 'mass',
    physics: 'More mass, harder to accelerate.',
    gtm: 'Brand credibility creates gravitational pull — and inertia.',
    diagnostic: 'Does your brand reach exceed your pipeline conversion?',
  },
  {
    name: 'Surface Area',
    slug: 'surface-area',
    color: '#60a5fa',
    icon: 'surface',
    physics: 'More surface, more environmental interaction.',
    gtm: 'The market you touch determines signal quality.',
    diagnostic: 'How many ICP accounts have meaningful surface area with your brand?',
  },
  {
    name: 'Escape Velocity',
    slug: 'escape-velocity',
    color: '#c084fc',
    icon: 'escape',
    physics: 'Minimum speed to break gravitational field.',
    gtm: 'The threshold where growth becomes self-sustaining.',
    diagnostic: 'Is inbound > outbound? For how many quarters?',
  },
  {
    name: 'Context Field',
    slug: 'context-field',
    color: '#06b6d4',
    icon: 'gravity',
    physics: 'Mass curves spacetime. The field tells objects how to move.',
    gtm: 'Without shared operating context, every tool and channel drifts.',
    diagnostic: 'Does every AI tool, agent, and team member work from the same encoded source of truth?',
  },
];

function ForceIcon({ type, color, size = 26 }: { type: Force['icon']; color: string; size?: number }) {
  switch (type) {
    case 'momentum':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="10" stroke={color} strokeWidth="2" opacity="0.3" />
          <path d="M16 6 L16 16 L24 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'friction':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <path d="M6 22 L12 14 L18 18 L26 8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 24 L10 22 M14 24 L16 22 M20 24 L22 22" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        </svg>
      );
    case 'mass':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="10" stroke={color} strokeWidth="2" />
          <circle cx="16" cy="16" r="4" fill={color} opacity="0.3" />
          <circle cx="16" cy="16" r="1.5" fill={color} />
        </svg>
      );
    case 'surface':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <rect x="6" y="6" width="20" height="20" rx="2" stroke={color} strokeWidth="2" strokeDasharray="3 3" />
          <circle cx="12" cy="12" r="1.5" fill={color} />
          <circle cx="20" cy="12" r="1.5" fill={color} />
          <circle cx="12" cy="20" r="1.5" fill={color} />
          <circle cx="20" cy="20" r="1.5" fill={color} />
        </svg>
      );
    case 'escape':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <path d="M16 26 L16 6" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <path d="M10 12 L16 6 L22 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'gravity':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="12" stroke={color} strokeWidth="1" strokeDasharray="2 3" opacity="0.4" />
          <circle cx="16" cy="16" r="7" stroke={color} strokeWidth="1.5" strokeDasharray="2 3" opacity="0.6" />
          <circle cx="16" cy="16" r="3" fill={color} opacity="0.8" />
          <circle cx="16" cy="16" r="1.5" fill={color} />
        </svg>
      );
  }
}

export default function ForceCardsBold() {
  const [active, setActive] = useState(0);
  const f = FORCES[active];

  return (
    <section className="py-20 md:py-32 bg-black border-t border-gray-800">
      <div className="container-content">
        <p className="text-caption text-white tracking-wide mb-4 font-bold uppercase">
          Physics of Growth
        </p>
        <h2 className="text-display font-display italic text-white font-extrabold mb-4 max-w-3xl">
          Six forces. A system, not a list.
        </h2>

        <div className="grid gap-14 lg:grid-cols-[1.1fr_1fr] items-center mt-14">
          {/* Mobile: vertical force selector */}
          <div className="flex flex-col gap-2 lg:hidden">
            {FORCES.map((fo, i) => {
              const isActive = active === i;
              return (
                <button
                  key={fo.name}
                  onClick={() => setActive(i)}
                  className="flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-lg text-left bg-transparent border cursor-pointer transition-all"
                  style={{
                    borderColor: isActive ? fo.color : '#2b363b',
                    background: isActive ? `${fo.color}12` : 'transparent',
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border"
                    style={{ borderColor: fo.color, background: `${fo.color}18` }}
                  >
                    <span className="font-mono text-xs font-bold" style={{ color: fo.color }}>{i + 1}</span>
                  </div>
                  <span className="font-bold text-sm" style={{ color: isActive ? '#fff' : '#95959d' }}>{fo.name}</span>
                </button>
              );
            })}
          </div>

          {/* Desktop: Orbital diagram */}
          <div className="relative aspect-square max-w-[520px] hidden lg:block">
            <svg viewBox="0 0 400 400" className="w-full h-full">
              <circle cx="200" cy="200" r="140" fill="none" stroke="#1a2328" strokeWidth="1" strokeDasharray="2 4" />
              <circle cx="200" cy="200" r="60" fill="#0f1419" stroke="#2b363b" />
              <text x="200" y="196" textAnchor="middle" fill="#fff" fontFamily="Soehne Breit" fontWeight="700" fontSize="14">
                Growth
              </text>
              <text x="200" y="212" textAnchor="middle" fill="#7a7a85" fontFamily="Roboto" fontSize="10">
                system
              </text>
              {FORCES.map((fo, i) => {
                const angle = (i / FORCES.length) * Math.PI * 2 - Math.PI / 2;
                const x = 200 + Math.cos(angle) * 140;
                const y = 200 + Math.sin(angle) * 140;
                const isActive = active === i;
                return (
                  <g
                    key={fo.name}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => setActive(i)}
                  >
                    <line
                      x1="200"
                      y1="200"
                      x2={x}
                      y2={y}
                      stroke={isActive ? fo.color : '#1a2328'}
                      strokeWidth={isActive ? 1.5 : 0.5}
                      opacity={isActive ? 0.5 : 0.3}
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r={isActive ? 18 : 13}
                      fill="#0f1419"
                      stroke={fo.color}
                      strokeWidth={isActive ? 2 : 1.5}
                    />
                    <text
                      x={x}
                      y={y + 4}
                      textAnchor="middle"
                      fill={fo.color}
                      fontFamily="Soehne Mono"
                      fontSize="11"
                      fontWeight="700"
                    >
                      {i + 1}
                    </text>
                    <text
                      x={x}
                      y={y + (y > 200 ? 38 : -24)}
                      textAnchor="middle"
                      fill={isActive ? '#fff' : '#95959d'}
                      fontFamily="Roboto"
                      fontSize="11"
                      fontWeight={isActive ? 700 : 400}
                    >
                      {fo.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Detail panel (spans both mobile and desktop) */}
          <div key={active}>
            <div className="flex items-center gap-4 mb-5">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center border"
                style={{ background: `${f.color}18`, borderColor: f.color }}
              >
                <ForceIcon type={f.icon} color={f.color} size={22} />
              </div>
              <h3 className="font-display italic text-white font-extrabold text-2xl">{f.name}</h3>
            </div>

            <div className="mb-5">
              <p className="text-caption text-gray-500 uppercase tracking-wider mb-1.5">Physics</p>
              <p className="text-body text-white m-0">{f.physics}</p>
            </div>

            <div className="mb-6">
              <p className="text-caption uppercase tracking-wider mb-1.5" style={{ color: f.color }}>
                GTM Analog
              </p>
              <p className="text-body text-gray-200 m-0">{f.gtm}</p>
            </div>

            <div
              className="rounded-lg px-5 py-4"
              style={{ background: '#0f1419', border: `1px solid ${f.color}40` }}
            >
              <p className="text-caption uppercase tracking-wider mb-1.5" style={{ color: f.color }}>
                Diagnostic question
              </p>
              <p className="font-display italic text-white font-extrabold text-base leading-snug m-0">
                {f.diagnostic}
              </p>
            </div>

            <a
              href={`/physics-of-growth/${f.slug}`}
              className="inline-flex items-center gap-2 mt-6 font-bold text-sm no-underline hover:underline"
              style={{ color: f.color }}
            >
              Read the {f.name} playbook →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
