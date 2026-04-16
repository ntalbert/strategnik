import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';

interface Indicator {
  label: string;
  positive: boolean;
  value: string;
}

const indicators: Indicator[] = [
  { label: 'CAC trend', positive: true, value: 'Declining' },
  { label: 'Organic share', positive: true, value: 'Growing' },
  { label: 'Brand search', positive: true, value: 'Rising' },
  { label: 'Sales cycles', positive: true, value: 'Shorter' },
  { label: 'Content shelf life', positive: true, value: '6+ months' },
];

const antiIndicators: Indicator[] = [
  { label: 'CAC trend', positive: false, value: 'Rising' },
  { label: 'Channel mix', positive: false, value: 'Paid-dependent' },
  { label: 'Brand search', positive: false, value: 'Flat' },
  { label: 'Sales cycles', positive: false, value: 'Longer' },
  { label: 'Team refrain', positive: false, value: '"Need more leads"' },
];

function IndicatorColumn({ items, title, color }: { items: Indicator[]; title: string; color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '0px 0px -80px 0px' });
  const shouldReduce = useReducedMotion();

  return (
    <div ref={ref} className="mi-column">
      <div className="mi-column__header" style={{ borderColor: color }}>
        <span className="mi-column__dot" style={{ background: color }} />
        <span className="mi-column__title">{title}</span>
      </div>
      <div className="mi-column__items">
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            className="mi-item"
            initial={shouldReduce ? {} : { opacity: 0, x: item.positive ? -20 : 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={shouldReduce ? { duration: 0 } : { delay: 0.2 + i * 0.1, duration: 0.4, ease: 'easeOut' }}
          >
            <span className="mi-item__label">{item.label}</span>
            <span className="mi-item__value" style={{ color }}>{item.value}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function MomentumIndicators() {
  return (
    <div className="mi-container">
      <IndicatorColumn items={indicators} title="Momentum" color="#1de2c4" />
      <IndicatorColumn items={antiIndicators} title="Treadmill" color="#ef4444" />
    </div>
  );
}
