import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';

interface Component {
  id: string;
  num: string;
  label: string;
  color: string;
  title: string;
  desc: string;
  bullets: string[];
}

const components: Component[] = [
  {
    id: 'brand',
    num: '01',
    label: 'Brand + Voice',
    color: '#1de2c4',
    title: 'Brand + Voice Spec',
    desc: 'Tone, editorial standards, banned language, writing style rules — encoded so every agent produces on-brand work without requiring human review of every output. Not a style guide PDF. A machine-readable operating spec agents reference autonomously.',
    bullets: [
      'Machine-readable editorial spec',
      'Banned language + style rules',
      'Agent-accessible brand memory',
      'Autonomous on-brand output',
    ],
  },
  {
    id: 'icp',
    num: '02',
    label: 'ICP + Buyers',
    color: '#60a5fa',
    title: 'ICP + Buyer Context',
    desc: 'Ideal customer profiles, buying committee maps, pain hierarchy, objection framing, persona-level messaging — so agents know who they\'re talking to, why it matters, and what the alternatives look like.',
    bullets: [
      'Buying committee maps',
      'Pain hierarchy by persona',
      'Objection framing library',
      'Stage-aware messaging',
    ],
  },
  {
    id: 'competitive',
    num: '03',
    label: 'Competitive',
    color: '#c084fc',
    title: 'Competitive Framing',
    desc: 'Positioning against alternatives, displacement narratives, win/loss context, differentiated value claims — so every piece of content reinforces the market stance. Updated as the competitive landscape shifts.',
    bullets: [
      'Displacement narratives',
      'Win/loss intelligence',
      'Differentiated value claims',
      'Live competitive updates',
    ],
  },
  {
    id: 'content',
    num: '04',
    label: 'Content',
    color: '#f59e0b',
    title: 'Content Architecture',
    desc: 'Topic cluster design with semantic entity relationships. Content atomization frameworks. Template structures per content type that embed schema, heading hierarchy, and entity definitions at creation.',
    bullets: [
      'Topic cluster design',
      'Content atomization framework',
      'Schema-embedded templates',
      'Q&A pair libraries by stage',
    ],
  },
  {
    id: 'machine',
    num: '05',
    label: 'Machine',
    color: '#06b6d4',
    title: 'Machine Readability + Distribution Schema',
    desc: 'JSON-LD structured data per page type. Entity definitions in formats machines parse. AI crawler accessibility via llms.txt and robots.txt policy. Multi-surface optimization for Google Search, AI Overviews, Perplexity, ChatGPT, and Gemini.',
    bullets: [
      'JSON-LD per page type',
      'AI crawler accessibility',
      'Citation architecture',
      'Multi-surface optimization',
    ],
  },
  {
    id: 'measurement',
    num: '06',
    label: 'Measurement',
    color: '#ef4444',
    title: 'Measurement Targets',
    desc: 'Revenue influence metrics, conversion benchmarks, time-to-personalization goals, decision accuracy signals — so the system knows what success looks like and feedback loops can steer toward it.',
    bullets: [
      'Revenue influence metrics',
      'Conversion benchmarks',
      'Feedback loops, not dashboards',
      'Agent learning signals',
    ],
  },
];

export default function ComponentTabs() {
  const [activeIndex, setActiveIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const active = components[activeIndex];

  return (
    <div>
      {/* Tab Bar */}
      <div
        className="flex overflow-x-auto scrollbar-hide"
        role="tablist"
        aria-label="Intelligence Layer Components"
        style={{ borderBottom: '1px solid #2b363b' }}
      >
        {components.map((comp, i) => (
          <button
            key={comp.id}
            role="tab"
            aria-selected={i === activeIndex}
            aria-controls={`panel-${comp.id}`}
            onClick={() => setActiveIndex(i)}
            className="flex-1 min-w-[120px] md:min-w-[140px] px-3 md:px-5 py-4 bg-transparent border-none cursor-pointer font-sans text-sm flex items-center gap-2 whitespace-nowrap transition-colors duration-200"
            style={{
              color: i === activeIndex ? '#fff' : '#7a7a85',
              borderBottom: `3px solid ${i === activeIndex ? comp.color : 'transparent'}`,
            }}
          >
            <span
              className="font-bold font-display"
              style={{ color: i === activeIndex ? comp.color : undefined }}
            >
              {comp.num}
            </span>
            <span className="font-medium hidden md:inline">{comp.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-0 min-h-[280px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: -12 }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { type: 'spring', stiffness: 300, damping: 30 }
            }
            role="tabpanel"
            id={`panel-${active.id}`}
            className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 lg:gap-12"
            style={{
              padding: '2.5rem',
              borderLeft: `4px solid ${active.color}`,
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '0 8px 8px 0',
            }}
          >
            {/* Left: Description */}
            <div>
              <span
                className="block text-[2.5rem] font-bold font-display leading-none mb-3"
                style={{ color: active.color }}
              >
                {active.num}
              </span>
              <h3 className="text-xl text-white font-bold mb-4">{active.title}</h3>
              <p className="text-base leading-7 text-[#afafb6] max-w-[55ch]">
                {active.desc}
              </p>
            </div>

            {/* Right: Bullet Points */}
            <div className="flex flex-col gap-3 pt-2">
              {active.bullets.map((bullet, bi) => (
                <motion.div
                  key={bullet}
                  initial={shouldReduceMotion ? false : { opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : { delay: bi * 0.08, type: 'spring', stiffness: 300, damping: 30 }
                  }
                  className="flex items-center gap-3 py-2 px-4 rounded-lg"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderLeft: `2px solid ${active.color}40`,
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: active.color }}
                  />
                  <span className="text-sm text-[#c9d1d9]">{bullet}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
