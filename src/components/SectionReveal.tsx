import { useRef, type ReactNode } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';

interface SectionRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'left' | 'right';
}

export default function SectionReveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
}: SectionRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '0px 0px -60px 0px' });
  const shouldReduceMotion = useReducedMotion();

  const initialOffset = {
    up: { y: 30, x: 0 },
    left: { y: 0, x: -40 },
    right: { y: 0, x: 40 },
  }[direction];

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={
        shouldReduceMotion
          ? false
          : { opacity: 0, ...initialOffset }
      }
      animate={
        isInView
          ? { opacity: 1, x: 0, y: 0 }
          : shouldReduceMotion
            ? {}
            : undefined
      }
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : { delay, duration: 0.5, ease: 'easeOut' }
      }
    >
      {children}
    </motion.div>
  );
}
