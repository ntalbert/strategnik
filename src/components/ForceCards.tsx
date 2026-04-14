import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';

interface ForceCard {
  name: string;
  color: string;
  icon: string;
  physics: string;
  gtm: string;
  status: 'ready' | 'coming-soon';
  href?: string;
}

const forces: ForceCard[] = [
  {
    name: 'Momentum',
    color: '#1de2c4',
    icon: 'momentum',
    physics: 'Objects in motion tend to stay in motion.',
    gtm: 'The investments that compound are the ones you\'re most tempted to kill.',
    status: 'ready',
    href: '/physics-of-growth/momentum',
  },
  {
    name: 'Friction',
    color: '#ef4444',
    icon: 'friction',
    physics: 'Resistance that converts kinetic energy to heat.',
    gtm: 'Every unnecessary step, handoff, and approval in your buyer journey is energy lost.',
    status: 'ready',
    href: '/physics-of-growth/friction',
  },
  {
    name: 'Mass',
    color: '#f59e0b',
    icon: 'mass',
    physics: 'The more mass an object has, the harder it is to accelerate.',
    gtm: 'Brand credibility and market presence create gravitational pull — but also inertia.',
    status: 'coming-soon',
  },
  {
    name: 'Surface Area',
    color: '#60a5fa',
    icon: 'surface',
    physics: 'The more surface exposed, the more interaction with the environment.',
    gtm: 'How much of your market you\'re actually in contact with determines signal quality.',
    status: 'coming-soon',
  },
  {
    name: 'Escape Velocity',
    color: '#c084fc',
    icon: 'escape',
    physics: 'The minimum speed needed to break free of a gravitational field.',
    gtm: 'The momentum threshold where growth becomes self-sustaining.',
    status: 'coming-soon',
  },
  {
    name: 'Inflection Points',
    color: '#06b6d4',
    icon: 'inflection',
    physics: 'Where acceleration changes direction.',
    gtm: 'The moments when continuing what worked stops working.',
    status: 'ready',
    href: '/thinking/inflection-points',
  },
];

function ForceIcon({ icon, color }: { icon: string; color: string }) {
  const size = 32;
  const stroke = color;

  switch (icon) {
    case 'momentum':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="10" stroke={stroke} strokeWidth="2" opacity={0.3} />
          <path d="M16 6 L16 16 L24 12" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M22 20 L26 24" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'friction':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <path d="M6 22 L12 14 L18 18 L26 8" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 26 L26 26" stroke={stroke} strokeWidth="2" strokeLinecap="round" opacity={0.4} />
          <path d="M8 24 L10 22 M14 24 L16 22 M20 24 L22 22" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" opacity={0.5} />
        </svg>
      );
    case 'mass':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="10" stroke={stroke} strokeWidth="2" />
          <circle cx="16" cy="16" r="5" fill={stroke} opacity={0.2} />
          <circle cx="16" cy="16" r="2" fill={stroke} opacity={0.6} />
        </svg>
      );
    case 'surface':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <rect x="6" y="6" width="20" height="20" rx="2" stroke={stroke} strokeWidth="2" strokeDasharray="3 3" />
          <circle cx="12" cy="12" r="2" fill={stroke} opacity={0.6} />
          <circle cx="20" cy="12" r="2" fill={stroke} opacity={0.6} />
          <circle cx="12" cy="20" r="2" fill={stroke} opacity={0.6} />
          <circle cx="20" cy="20" r="2" fill={stroke} opacity={0.6} />
          <circle cx="16" cy="16" r="2" fill={stroke} opacity={0.4} />
        </svg>
      );
    case 'escape':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <path d="M16 26 C16 26 16 6 16 6" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <path d="M10 12 L16 6 L22 12" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <ellipse cx="16" cy="26" rx="8" ry="2" stroke={stroke} strokeWidth="1.5" opacity={0.3} />
        </svg>
      );
    case 'inflection':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <path d="M6 24 Q16 24 16 16 Q16 8 26 8" stroke={stroke} strokeWidth="2" strokeLinecap="round" fill="none" />
          <circle cx="16" cy="16" r="3" fill={stroke} opacity={0.3} />
          <circle cx="16" cy="16" r="1.5" fill={stroke} opacity={0.7} />
        </svg>
      );
    default:
      return null;
  }
}

export default function ForceCards() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '0px 0px -60px 0px' });
  const shouldReduceMotion = useReducedMotion();

  return (
    <div ref={ref} className="force-cards-grid">
      {forces.map((force, i) => {
        const isReady = force.status === 'ready';

        const cardContent = (
          <motion.div
            className="force-card"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : undefined}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { delay: i * 0.1, duration: 0.45, ease: 'easeOut' }
            }
            whileHover={
              shouldReduceMotion
                ? {}
                : { y: -4, transition: { duration: 0.2 } }
            }
            style={{
              '--card-accent': force.color,
              '--card-accent-dim': `${force.color}20`,
            } as React.CSSProperties}
          >
            <div className="force-card__header">
              <div className="force-card__icon">
                <ForceIcon icon={force.icon} color={force.color} />
              </div>
              <h3 className="force-card__name">{force.name}</h3>
            </div>

            <div className="force-card__body">
              <p className="force-card__physics">
                <span className="force-card__label">Physics</span>
                {force.physics}
              </p>
              <p className="force-card__gtm">
                <span className="force-card__label">GTM Analog</span>
                {force.gtm}
              </p>
            </div>

            <div className="force-card__footer">
              {isReady ? (
                <span className="force-card__link">
                  Explore
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </span>
              ) : (
                <span className="force-card__soon">Coming soon</span>
              )}
            </div>
          </motion.div>
        );

        if (isReady && force.href) {
          return (
            <a key={force.name} href={force.href} className="force-card__anchor">
              {cardContent}
            </a>
          );
        }

        return <div key={force.name}>{cardContent}</div>;
      })}
    </div>
  );
}
