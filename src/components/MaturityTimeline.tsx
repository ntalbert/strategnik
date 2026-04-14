import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';

interface Stage {
  num: number;
  label: string;
  sublabel?: string;
  title: string;
  desc: string;
  color: string;
  muted: boolean;
  active: boolean;
}

const stages: Stage[] = [
  {
    num: 1,
    label: 'Stage 1',
    title: 'Fragmented Humans',
    desc: 'All humans, all silos. Strategy briefed to 5+ teams. Handoffs dilute everything. Adding AI makes it worse.',
    color: '#494950',
    muted: true,
    active: false,
  },
  {
    num: 2,
    label: 'Stage 2',
    sublabel: 'The Sprint',
    title: 'Intelligence Layer Built',
    desc: 'All six components encoded. Shared operating context installed. AI tools can now be wired in. 30-90 day engagement.',
    color: '#1de2c4',
    muted: false,
    active: true,
  },
  {
    num: 3,
    label: 'Stages 3-4',
    sublabel: 'The Retainer',
    title: 'Humans + AI + Agents',
    desc: 'Teams prompt from shared context. Agents run content, SEO, nurture autonomously. Precision at scale.',
    color: '#c084fc',
    muted: false,
    active: false,
  },
  {
    num: 4,
    label: 'Stage 5',
    sublabel: 'The Horizon',
    title: 'Proactive Agents',
    desc: 'Agents detect signals and deploy autonomously. Humans govern strategy. Marketing as infrastructure.',
    color: '#494950',
    muted: true,
    active: false,
  },
];

export default function MaturityTimeline() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '0px 0px -80px 0px' });
  const shouldReduceMotion = useReducedMotion();

  return (
    <div ref={ref}>
      {/* Desktop: Horizontal */}
      <div className="hidden md:block relative">
        {/* Track line */}
        <div
          className="absolute top-[14px] left-[8%] right-[8%] h-[2px] z-0"
          style={{
            background: 'linear-gradient(to right, #494950, #1de2c4, #c084fc, #494950)',
          }}
        />

        <div className="grid grid-cols-4 gap-8 relative z-10">
          {stages.map((stage, i) => (
            <motion.div
              key={stage.num}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
              animate={
                isInView
                  ? { opacity: stage.muted ? 0.5 : 1, y: 0 }
                  : shouldReduceMotion
                    ? { opacity: stage.muted ? 0.5 : 1 }
                    : undefined
              }
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { delay: i * 0.15, duration: 0.5, ease: 'easeOut' }
              }
              className="text-center"
            >
              {/* Dot */}
              <div className="flex justify-center mb-4">
                <div
                  className="w-7 h-7 rounded-full relative"
                  style={{
                    background: stage.color,
                    border: '3px solid #0d1117',
                    boxShadow: stage.active
                      ? '0 0 0 4px rgba(29, 226, 196, 0.25)'
                      : 'none',
                  }}
                >
                  {stage.active && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      animate={{ boxShadow: [
                        '0 0 0 4px rgba(29, 226, 196, 0.25)',
                        '0 0 0 8px rgba(29, 226, 196, 0.1)',
                        '0 0 0 4px rgba(29, 226, 196, 0.25)',
                      ]}}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}
                </div>
              </div>

              {/* Badge for active */}
              {stage.active && (
                <div
                  className="inline-block text-[0.625rem] tracking-[0.15em] uppercase font-bold px-2 py-0.5 rounded mb-3"
                  style={{ background: '#1de2c4', color: '#0d1117' }}
                >
                  THE UNLOCK
                </div>
              )}

              {/* Content */}
              <span
                className="block text-xs tracking-wide uppercase font-semibold mb-1"
                style={{ color: stage.color === '#494950' ? '#7a7a85' : stage.color }}
              >
                {stage.label}{stage.sublabel ? ` — ${stage.sublabel}` : ''}
              </span>
              <h3 className="text-base text-white font-bold mb-2">{stage.title}</h3>
              <p className="text-sm leading-relaxed text-[#7a7a85]">{stage.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mobile: Vertical */}
      <div className="md:hidden flex flex-col gap-6">
        {stages.map((stage, i) => (
          <motion.div
            key={stage.num}
            initial={shouldReduceMotion ? false : { opacity: 0, x: -20 }}
            animate={
              isInView
                ? { opacity: stage.muted ? 0.5 : 1, x: 0 }
                : shouldReduceMotion
                  ? { opacity: stage.muted ? 0.5 : 1 }
                  : undefined
            }
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { delay: i * 0.1, duration: 0.4 }
            }
            className="grid gap-3"
            style={{ gridTemplateColumns: '28px 1fr' }}
          >
            {/* Dot */}
            <div
              className="w-6 h-6 rounded-full mt-1"
              style={{
                background: stage.color,
                border: '3px solid #0d1117',
                boxShadow: stage.active
                  ? '0 0 0 4px rgba(29, 226, 196, 0.25)'
                  : 'none',
              }}
            />

            <div>
              {stage.active && (
                <div
                  className="inline-block text-[0.625rem] tracking-[0.15em] uppercase font-bold px-2 py-0.5 rounded mb-2"
                  style={{ background: '#1de2c4', color: '#0d1117' }}
                >
                  THE UNLOCK
                </div>
              )}
              <span
                className="block text-xs tracking-wide uppercase font-semibold mb-1"
                style={{ color: stage.color === '#494950' ? '#7a7a85' : stage.color }}
              >
                {stage.label}{stage.sublabel ? ` — ${stage.sublabel}` : ''}
              </span>
              <h3 className="text-base text-white font-bold mb-1">{stage.title}</h3>
              <p className="text-sm leading-relaxed text-[#7a7a85]">{stage.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
