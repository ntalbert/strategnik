import { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';

const VARIANTS = {
  A: { label: 'Get Your Digital Context Audit', event: 'cta_digital_context_audit' },
  B: { label: 'Map Your GTM Context', event: 'cta_context_map' },
} as const;

type Variant = keyof typeof VARIANTS;

function getVariant(): Variant {
  if (typeof window === 'undefined') return 'A';
  const stored = localStorage.getItem('cta_variant');
  if (stored === 'A' || stored === 'B') return stored;
  const picked: Variant = Math.random() < 0.5 ? 'A' : 'B';
  localStorage.setItem('cta_variant', picked);
  return picked;
}

export default function FloatingCta() {
  const [visible, setVisible] = useState(false);
  const [variant, setVariant] = useState<Variant>('A');
  const impressionFired = useRef(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    setVariant(getVariant());
  }, []);

  useEffect(() => {
    if (visible && !impressionFired.current) {
      impressionFired.current = true;
      window.gtag?.('event', 'cta_impression', {
        cta_variant: variant,
        cta_location: 'floating',
      });
    }
  }, [visible, variant]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      const footerCta = document.getElementById('il-footer-cta');

      if (footerCta) {
        const rect = footerCta.getBoundingClientRect();
        const footerVisible = rect.top < window.innerHeight && rect.bottom > 0;
        setVisible(scrollPct > 0.25 && !footerVisible);
      } else {
        setVisible(scrollPct > 0.25);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = () => {
    window.gtag?.('event', 'cta_click', {
      cta_variant: variant,
      cta_location: 'floating',
      cta_label: VARIANTS[variant].label,
    });
  };

  return (
    <motion.a
      href="/digital-context-audit"
      aria-label={VARIANTS[variant].label}
      onClick={handleClick}
      initial={shouldReduceMotion ? { opacity: visible ? 1 : 0 } : { opacity: 0, y: 20 }}
      animate={
        visible
          ? { opacity: 1, y: 0 }
          : { opacity: 0, y: shouldReduceMotion ? 0 : 20 }
      }
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.4, ease: 'easeOut' }}
      className="fixed bottom-6 right-4 md:bottom-8 md:right-8 z-50 inline-flex items-center gap-2 px-6 py-3 min-h-[44px] font-bold text-sm rounded-full no-underline"
      style={{
        background: '#1de2c4',
        color: '#0d1117',
        boxShadow: '0 8px 32px rgba(29, 226, 196, 0.3), 0 2px 8px rgba(0,0,0,0.4)',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      {VARIANTS[variant].label}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-4 h-4"
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    </motion.a>
  );
}

export { getVariant, VARIANTS };
export type { Variant };
