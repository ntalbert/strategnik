import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';

interface Discipline {
  title: string;
  desc: string;
  color: string;
  icon: string;
}

const disciplines: Discipline[] = [
  {
    title: 'GTM Strategy',
    desc: 'ICP definition, positioning architecture, pipeline mechanics, competitive framing, buying committee mapping.',
    color: '#1de2c4',
    icon: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z',
  },
  {
    title: 'Technical Infrastructure',
    desc: 'Data architecture, CRM design, platform orchestration, API integrations, signal mapping.',
    color: '#60a5fa',
    icon: 'rect1',
  },
  {
    title: 'Creative Production Systems',
    desc: 'Brand voice encoding, editorial standards, content frameworks, style specifications.',
    color: '#f59e0b',
    icon: 'star',
  },
  {
    title: 'AI-Native Thinking',
    desc: 'How models ingest context, how agents learn from structured data, how to build systems they can reliably operate within.',
    color: '#c084fc',
    icon: 'pie',
  },
];

function DisciplineIcon({ type, color }: { type: string; color: string }) {
  const commonProps = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: 'w-10 h-10',
  };

  if (type === 'rect1') {
    return (
      <svg {...commonProps}>
        <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
        <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
        <line x1="6" y1="6" x2="6.01" y2="6" />
        <line x1="6" y1="18" x2="6.01" y2="18" />
      </svg>
    );
  }

  if (type === 'star') {
    return (
      <svg {...commonProps}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    );
  }

  if (type === 'pie') {
    return (
      <svg {...commonProps}>
        <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
        <path d="M20.66 7A10 10 0 0 0 14 2v5.34z" />
      </svg>
    );
  }

  // Book (default - GTM)
  return (
    <svg {...commonProps}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

export default function DisciplineGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '0px 0px -60px 0px' });
  const shouldReduceMotion = useReducedMotion();

  return (
    <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
      {disciplines.map((disc, i) => (
        <motion.div
          key={disc.title}
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.95, y: 16 }}
          animate={isInView ? { opacity: 1, scale: 1, y: 0 } : shouldReduceMotion ? {} : undefined}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { delay: i * 0.1, duration: 0.45, ease: 'easeOut' }
          }
          whileHover={
            shouldReduceMotion
              ? {}
              : {
                  y: -4,
                  transition: { duration: 0.2 },
                }
          }
          className="p-8 lg:p-10 rounded-xl cursor-default transition-shadow duration-300 group"
          style={{
            background: '#161b22',
            border: `1px solid #2b363b`,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = disc.color;
            (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${disc.color}15`;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = '#2b363b';
            (e.currentTarget as HTMLElement).style.boxShadow = 'none';
          }}
        >
          <div className="mb-5">
            <DisciplineIcon type={disc.icon} color={disc.color} />
          </div>
          <h3 className="text-lg text-white font-bold mb-3">{disc.title}</h3>
          <p className="text-sm leading-relaxed text-[#95959d]">{disc.desc}</p>
        </motion.div>
      ))}
    </div>
  );
}
