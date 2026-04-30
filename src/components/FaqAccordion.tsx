import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';

interface FaqItem {
  question: string;
  answer: string;
}

const faqData: FaqItem[] = [
  {
    question: 'What is the Context Layer?',
    answer:
      'The Context Layer is a machine-readable operating context \u2014 the encoded knowledge of your brand, your buyers, your competitive position, your content architecture, and your measurement framework \u2014 built so that every AI tool, every agent, and every team member works from the same shared foundation. It is not a document, a prompt template, or a one-time brand exercise. It is a living operating system that updates as the market moves.',
  },
  {
    question: 'How is this different from hiring a fractional CMO?',
    answer:
      'A fractional CMO provides leadership and strategy. When they leave, the strategy leaves with them. The Context Layer is infrastructure \u2014 it persists after the engagement ends. Your team and your agents operate from it indefinitely. Building it requires simultaneous fluency in GTM strategy, technical infrastructure, creative production systems, and AI-native thinking \u2014 four disciplines that almost never coexist in a single hire.',
  },
  {
    question: 'How long does it take to build the Context Layer?',
    answer:
      'The diagnostic takes 2\u20134 weeks. The full build sprint takes 30\u201390 days depending on company complexity. This is not a digital transformation initiative or an enterprise software deployment. It is a focused build that encodes the brand knowledge, market intelligence, and measurement framework that already exist in your organization \u2014 scattered across people\u2019s heads, old decks, and CRM fields \u2014 into a machine-readable operating context.',
  },
  {
    question: 'What does the Context Layer cost?',
    answer:
      'The diagnostic ranges from $2,500\u2013$25,000 depending on scope (external audit vs. deep internal audit). The full build sprint ranges from $25,000\u2013$75,000. The ongoing advisor retainer is $5,000\u2013$15,000 per month. A full transformation engagement runs $75,000\u2013$150,000+. For comparison: a single CMO hire costs $350K+ fully loaded per year. The Context Layer sprint costs less than one quarter of that salary and produces infrastructure that persists.',
  },
  {
    question: 'Can we build this internally?',
    answer:
      'Your team can run the system once it is built. Building the Context Layer requires understanding how AI models ingest context, how agents learn from data structures, and how to encode brand and competitive intelligence in formats agents can actually use. That is not marketing ops \u2014 it is a different discipline. Strategnik builds it, trains your team, and hands it off. They operate it.',
  },
  {
    question: 'We already have a CMO and marketing team. Is this a replacement?',
    answer:
      'No. The Context Layer is not here to replace your CMO or your team. It gives them a new set of operating instructions for a world where agents are part of the team. The CMO stays. The team stays. What changes is the infrastructure they operate from. The CMO steers the layer. The layer steers everything else.',
  },
  {
    question: 'What happens after the build?',
    answer:
      'The layer is delivered with full training for your internal team. Some companies operate it independently from day one. Others engage in an ongoing advisor retainer \u2014 a monthly signal review that asks what ranked, what converted, what messaging missed, and what shifted in the competitive landscape. The layer updates. New context pushes to all connected agents and tools. The layer does not go stale because the retainer is the update cycle.',
  },
];

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <div className="max-w-[65ch]">
      {faqData.map((faq, i) => (
        <div
          key={i}
          className="border-b"
          style={{ borderColor: '#2b363b' }}
        >
          <button
            onClick={() => toggle(i)}
            className="flex justify-between items-center w-full py-6 min-h-[44px] bg-transparent border-none cursor-pointer text-left gap-4"
            aria-expanded={openIndex === i}
            aria-controls={`faq-content-${i}`}
          >
            <span className="text-lg text-white font-bold leading-snug">
              {faq.question}
            </span>
            <motion.svg
              animate={{ rotate: openIndex === i ? 180 : 0 }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 300, damping: 25 }
              }
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 flex-shrink-0"
              style={{ color: openIndex === i ? '#1de2c4' : '#7a7a85' }}
            >
              <polyline points="6 9 12 15 18 9" />
            </motion.svg>
          </button>

          <AnimatePresence initial={false}>
            {openIndex === i && (
              <motion.div
                id={`faq-content-${i}`}
                role="region"
                initial={shouldReduceMotion ? { height: 'auto' } : { height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={shouldReduceMotion ? {} : { height: 0, opacity: 0 }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 300, damping: 30 }
                }
                style={{ overflow: 'hidden' }}
              >
                <p className="text-base leading-7 text-[#95959d] pb-6">
                  {faq.answer}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
