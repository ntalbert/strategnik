import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';

export default function FloatingCta() {
  const [visible, setVisible] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const footerCta = document.getElementById('il-footer-cta');

      if (footerCta) {
        const rect = footerCta.getBoundingClientRect();
        const footerVisible = rect.top < window.innerHeight && rect.bottom > 0;
        setVisible(scrollY > 500 && !footerVisible);
      } else {
        setVisible(scrollY > 500);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.a
      href="/gravity-audit"
      aria-label="Get Your Gravity Audit"
      initial={shouldReduceMotion ? { opacity: visible ? 1 : 0 } : { opacity: 0, y: 20 }}
      animate={
        visible
          ? { opacity: 1, y: 0 }
          : { opacity: 0, y: shouldReduceMotion ? 0 : 20 }
      }
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.4, ease: 'easeOut' }}
      className="fixed bottom-8 right-8 z-50 inline-flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-full no-underline"
      style={{
        background: '#1de2c4',
        color: '#0d1117',
        boxShadow: '0 8px 32px rgba(29, 226, 196, 0.3), 0 2px 8px rgba(0,0,0,0.4)',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      Get Your Gravity Audit
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
