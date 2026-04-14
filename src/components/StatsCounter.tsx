import { useRef, useEffect, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';

interface Stat {
  value: number;
  suffix: string;
  label: string;
  detail: string;
  source: string;
}

const stats: Stat[] = [
  {
    value: 60,
    suffix: '%',
    label: 'Agentic AI adoption by 2028',
    detail: 'Gartner projects 60% of brands will use agentic AI for 1:1 interactions, replacing channel-based marketing.',
    source: 'Gartner',
  },
  {
    value: 50,
    suffix: '%',
    label: 'CMOs rank AI top-3 investment',
    detail: 'Half of CMOs rank generative AI as a top-three investment priority — but it ranked 17th of 20 in actual execution.',
    source: 'McKinsey',
  },
  {
    value: 62,
    suffix: '%',
    label: 'Experimenting, not scaling',
    detail: '62% experimenting. Only 23% scaling. The 39-point gap is where the Intelligence Layer operates.',
    source: 'Industry data',
  },
];

function AnimatedNumber({ value, suffix, inView }: { value: number; suffix: string; inView: boolean }) {
  const [display, setDisplay] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!inView) return;
    if (shouldReduceMotion) {
      setDisplay(value);
      return;
    }

    const duration = 1200;
    const startTime = performance.now();

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }, [inView, value, shouldReduceMotion]);

  return (
    <span>
      {display}
      {suffix}
    </span>
  );
}

export default function StatsCounter() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '0px 0px -60px 0px' });
  const shouldReduceMotion = useReducedMotion();

  return (
    <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : shouldReduceMotion ? {} : undefined}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { delay: i * 0.15, duration: 0.5, ease: 'easeOut' }
          }
          className="p-8 rounded-xl border transition-colors duration-300"
          style={{
            background: '#161b22',
            borderColor: '#2b363b',
          }}
        >
          <div
            className="text-[3.5rem] lg:text-[4rem] font-bold font-display leading-none mb-3"
            style={{ color: '#1de2c4' }}
          >
            <AnimatedNumber value={stat.value} suffix={stat.suffix} inView={isInView} />
          </div>
          <h3 className="text-base text-white font-bold mb-2">{stat.label}</h3>
          <p className="text-sm leading-relaxed text-[#95959d] mb-3">{stat.detail}</p>
          <span className="text-xs text-[#62626a] uppercase tracking-wider font-medium">
            {stat.source}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
