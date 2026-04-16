import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';

export default function MomentumCurve() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '0px 0px -100px 0px' });
  const shouldReduce = useReducedMotion();

  const curveWithMomentum = "M 40 280 C 80 275, 120 260, 160 240 C 200 220, 240 180, 280 130 C 320 80, 360 40, 420 20";
  const curveWithout = "M 40 180 L 420 180";
  const thresholdLine = "M 180 20 L 180 300";

  return (
    <div ref={ref} className="mc-container">
      <svg viewBox="0 0 460 320" className="mc-svg">
        {/* Grid lines */}
        {[60, 120, 180, 240].map((y) => (
          <line key={y} x1="40" y1={y} x2="420" y2={y} stroke="#1f2937" strokeWidth="0.5" />
        ))}
        {[100, 180, 260, 340].map((x) => (
          <line key={x} x1={x} y1="20" x2={x} y2="280" stroke="#1f2937" strokeWidth="0.5" />
        ))}

        {/* Threshold zone */}
        <motion.rect
          x="170" y="20" width="20" height="260" rx="4"
          fill="#1de2c4" opacity={0}
          animate={isInView ? { opacity: 0.08 } : {}}
          transition={shouldReduce ? { duration: 0 } : { delay: 1.5, duration: 0.8 }}
        />

        {/* Without momentum - flat line */}
        <motion.path
          d={curveWithout}
          fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="6 4" opacity="0.5"
          initial={shouldReduce ? {} : { pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : {}}
          transition={shouldReduce ? { duration: 0 } : { delay: 0.5, duration: 1.2, ease: 'easeOut' }}
        />

        {/* With momentum - exponential curve */}
        <motion.path
          d={curveWithMomentum}
          fill="none" stroke="#1de2c4" strokeWidth="2.5"
          initial={shouldReduce ? {} : { pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : {}}
          transition={shouldReduce ? { duration: 0 } : { delay: 0.8, duration: 1.5, ease: 'easeOut' }}
        />

        {/* Threshold label */}
        <motion.g
          initial={shouldReduce ? {} : { opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={shouldReduce ? { duration: 0 } : { delay: 1.8, duration: 0.6 }}
        >
          <line x1="180" y1="20" x2="180" y2="290" stroke="#1de2c4" strokeWidth="1" strokeDasharray="4 3" opacity="0.4" />
          <text x="180" y="306" fill="#1de2c4" fontSize="9" textAnchor="middle" fontFamily="monospace" opacity="0.7">ESCAPE VELOCITY</text>
        </motion.g>

        {/* Axis labels */}
        <text x="230" y="310" fill="#6b7280" fontSize="9" textAnchor="middle" fontFamily="monospace">TIME + INVESTMENT</text>
        <text x="16" y="150" fill="#6b7280" fontSize="9" textAnchor="middle" fontFamily="monospace" transform="rotate(-90, 16, 150)">GROWTH OUTPUT</text>

        {/* Legend */}
        <motion.g
          initial={shouldReduce ? {} : { opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={shouldReduce ? { duration: 0 } : { delay: 2.2, duration: 0.5 }}
        >
          <line x1="300" y1="290" x2="320" y2="290" stroke="#1de2c4" strokeWidth="2.5" />
          <text x="325" y="293" fill="#9ca3af" fontSize="9" fontFamily="monospace">With momentum</text>
          <line x1="300" y1="303" x2="320" y2="303" stroke="#ef4444" strokeWidth="2" strokeDasharray="6 4" opacity="0.5" />
          <text x="325" y="306" fill="#9ca3af" fontSize="9" fontFamily="monospace">Without (treadmill)</text>
        </motion.g>
      </svg>
    </div>
  );
}
