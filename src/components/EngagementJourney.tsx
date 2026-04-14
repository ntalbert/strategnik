import { useRef } from 'react';
import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'motion/react';

interface Step {
  number: string;
  label: string;
  description: string;
}

const steps: Step[] = [
  {
    number: '01',
    label: 'Conversation',
    description: '30 minutes. No pitch — just signal.',
  },
  {
    number: '02',
    label: 'Diagnostic',
    description: '2-4 weeks. Map every gap.',
  },
  {
    number: '03',
    label: 'Build',
    description: '30-90 days. Deploy the layer.',
  },
];

export default function EngagementJourney() {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const isInView = useInView(containerRef, { once: true, margin: '0px 0px -100px 0px' });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end center'],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <div ref={containerRef} className="ej-container">
      {/* Vertical connecting line */}
      <div className="ej-line-track">
        <motion.div
          className="ej-line-fill"
          style={
            shouldReduceMotion
              ? { height: isInView ? '100%' : '0%' }
              : { height: lineHeight }
          }
        />
      </div>

      {/* Steps */}
      <div className="ej-steps">
        {steps.map((step, i) => (
          <StepNode key={step.number} step={step} index={i} isInView={isInView} shouldReduceMotion={shouldReduceMotion} />
        ))}
      </div>

      <style>{`
        .ej-container {
          position: relative;
          display: flex;
          gap: 2rem;
          padding: 1.5rem 0;
          min-height: 280px;
        }

        .ej-line-track {
          position: relative;
          width: 2px;
          flex-shrink: 0;
          margin-left: 15px;
          background: rgba(29, 226, 196, 0.12);
          border-radius: 1px;
        }

        .ej-line-fill {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          background: linear-gradient(180deg, #1de2c4, rgba(29, 226, 196, 0.4));
          border-radius: 1px;
        }

        .ej-steps {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
          flex: 1;
        }

        .ej-step {
          display: flex;
          align-items: flex-start;
          gap: 1.25rem;
          position: relative;
        }

        .ej-dot-wrap {
          position: absolute;
          left: -3.25rem;
          top: 0.375rem;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ej-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #1de2c4;
          box-shadow: 0 0 0 4px rgba(29, 226, 196, 0.15);
        }

        .ej-dot-pulse {
          position: absolute;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 1px solid rgba(29, 226, 196, 0.3);
        }

        .ej-step-content {
          padding-top: 0;
        }

        .ej-step-number {
          font-family: 'Sohne Mono', 'JetBrains Mono', monospace;
          font-size: 0.6875rem;
          color: #1de2c4;
          letter-spacing: 0.08em;
          margin-bottom: 0.25rem;
          font-weight: 700;
        }

        .ej-step-label {
          font-family: 'Soehne Breit', system-ui, sans-serif;
          font-size: 1.125rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 0.375rem;
          letter-spacing: -0.01em;
        }

        .ej-step-desc {
          font-size: 0.875rem;
          line-height: 1.6;
          color: #95959d;
        }

        @media (max-width: 768px) {
          .ej-container {
            min-height: 240px;
          }
        }
      `}</style>
    </div>
  );
}

function StepNode({
  step,
  index,
  isInView,
  shouldReduceMotion,
}: {
  step: Step;
  index: number;
  isInView: boolean;
  shouldReduceMotion: boolean | null;
}) {
  const delay = 0.3 + index * 0.2;

  return (
    <motion.div
      className="ej-step"
      initial={shouldReduceMotion ? false : { opacity: 0, x: 20 }}
      animate={isInView ? { opacity: 1, x: 0 } : shouldReduceMotion ? {} : undefined}
      transition={shouldReduceMotion ? { duration: 0 } : { delay, duration: 0.45, ease: 'easeOut' }}
    >
      {/* Dot on the line */}
      <div className="ej-dot-wrap">
        <motion.div
          className="ej-dot-pulse"
          initial={shouldReduceMotion ? false : { scale: 0, opacity: 0 }}
          animate={isInView ? { scale: [0, 1.2, 1], opacity: [0, 0.6, 0.3] } : shouldReduceMotion ? {} : undefined}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { delay: delay + 0.1, duration: 0.6, ease: 'easeOut' }
          }
        />
        <motion.div
          className="ej-dot"
          initial={shouldReduceMotion ? false : { scale: 0 }}
          animate={isInView ? { scale: 1 } : shouldReduceMotion ? {} : undefined}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { delay, duration: 0.3, type: 'spring', stiffness: 400, damping: 20 }
          }
        />
      </div>

      {/* Content */}
      <div className="ej-step-content">
        <p className="ej-step-number">{step.number}</p>
        <p className="ej-step-label">{step.label}</p>
        <p className="ej-step-desc">{step.description}</p>
      </div>
    </motion.div>
  );
}
