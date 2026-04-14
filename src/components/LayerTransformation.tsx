import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const scenarios = [
  {
    prompt: "Write me a blog post about container orchestration",
    without: {
      label: "Without the layer",
      output: "Container orchestration is a technology that helps manage containers at scale. There are several popular tools including Kubernetes, Docker Swarm, and Apache Mesos. In this article, we'll explore the benefits of container orchestration for modern enterprises...",
      verdict: "Generic. Off-brand. Zero ICP awareness. No competitive framing. Starts from scratch every time."
    },
    withLayer: {
      label: "With the Intelligence Layer",
      output: "For platform engineering teams drowning in YAML configs and tribal knowledge, container orchestration isn't a technology choice — it's an operational bottleneck that determines whether your developers ship in hours or weeks. Here's why the teams that solve this first win the infrastructure budget war...",
      verdict: "On-brand voice. ICP pain points. Competitive framing. Ships with schema markup. Took 90 seconds."
    }
  },
  {
    prompt: "Draft a competitive battlecard vs. Datadog",
    without: {
      label: "Without the layer",
      output: "Datadog is a monitoring and analytics platform. Our product differs in several key ways: pricing, features, and support. Strengths: they have broad integrations. Weaknesses: they can be expensive at scale...",
      verdict: "Wikipedia-level analysis. No displacement narrative. No win/loss data. No objection handling."
    },
    withLayer: {
      label: "With the Intelligence Layer",
      output: "When a prospect says 'we're evaluating Datadog': they're feeling pain at $180K+ annual spend with 40% utilization. Lead with the cost-per-host comparison at their scale. The switching trigger is always the invoice shock after Q3 expansion. Handle the 'but everyone knows Datadog' objection with the Acme Corp case study — same team size, 60% cost reduction, 3-week migration...",
      verdict: "Pulls from win/loss history. Uses their objections. Cites real case data. Updated this morning."
    }
  },
  {
    prompt: "Create a nurture sequence for Series B CFOs",
    without: {
      label: "Without the layer",
      output: "Subject: How [Company] Can Help Your Business\n\nHi [Name],\n\nI wanted to reach out because I think our platform could be a great fit for your organization. We help companies like yours save time and money...",
      verdict: "Spray and pray. Wrong persona voice. No stage awareness. This goes to spam."
    },
    withLayer: {
      label: "With the Intelligence Layer",
      output: "Subject: The $2.3M question your board is about to ask\n\nThe median Series B CFO gets asked 'what's our CAC payback period?' within 60 days of close. If the answer involves a spreadsheet and a guess, this framework gives you the model your board actually wants — benchmarked against 47 SaaS companies at your stage...",
      verdict: "Persona-specific hook. Stage-aware data. Speaks CFO language. Maps to buying trigger. Auto-personalized."
    }
  }
];

export default function LayerTransformation() {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [phase, setPhase] = useState<'typing' | 'without' | 'transforming' | 'with'>('typing');
  const [typedText, setTypedText] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const scenario = scenarios[currentScenario];

  useEffect(() => {
    // Reset on scenario change
    setPhase('typing');
    setTypedText('');

    let charIndex = 0;
    const text = scenario.prompt;

    const typeInterval = setInterval(() => {
      if (charIndex <= text.length) {
        setTypedText(text.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typeInterval);
        timeoutRef.current = setTimeout(() => setPhase('without'), 600);
      }
    }, 35);

    return () => {
      clearInterval(typeInterval);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [currentScenario]);

  useEffect(() => {
    if (phase === 'without') {
      timeoutRef.current = setTimeout(() => setPhase('transforming'), 3000);
    } else if (phase === 'transforming') {
      timeoutRef.current = setTimeout(() => setPhase('with'), 1200);
    } else if (phase === 'with') {
      timeoutRef.current = setTimeout(() => {
        setCurrentScenario((prev) => (prev + 1) % scenarios.length);
      }, 5000);
    }
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [phase]);

  const isWithPhase = phase === 'with';
  const showOutput = phase !== 'typing';

  return (
    <div ref={containerRef} style={{
      maxWidth: '900px',
      margin: '0 auto',
      fontFamily: 'Roboto, system-ui, sans-serif',
    }}>
      {/* Scenario selector pills */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '32px',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        {scenarios.map((s, i) => (
          <button
            key={i}
            onClick={() => setCurrentScenario(i)}
            style={{
              padding: '6px 16px',
              borderRadius: '100px',
              fontSize: '0.75rem',
              fontWeight: 600,
              border: `1px solid ${i === currentScenario ? '#1de2c4' : '#30363d'}`,
              background: i === currentScenario ? 'rgba(29, 226, 196, 0.1)' : 'transparent',
              color: i === currentScenario ? '#1de2c4' : '#8b949e',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {s.prompt.split(' ').slice(0, 4).join(' ')}...
          </button>
        ))}
      </div>

      {/* Chat interface */}
      <div style={{
        background: '#161b22',
        borderRadius: '16px',
        border: '1px solid #30363d',
        overflow: 'hidden',
      }}>
        {/* Header bar */}
        <div style={{
          padding: '12px 20px',
          borderBottom: '1px solid #30363d',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
          <span style={{
            marginLeft: '12px',
            fontSize: '0.75rem',
            color: '#8b949e',
            fontWeight: 500,
          }}>
            {phase === 'transforming' ? '⚡ Intelligence Layer activating...' :
             isWithPhase ? '✓ Intelligence Layer connected' :
             'AI Assistant — no context loaded'}
          </span>
        </div>

        {/* Chat body */}
        <div style={{ padding: '24px' }}>
          {/* User prompt */}
          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '24px',
            alignItems: 'flex-start',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: '#21262d', border: '1px solid #30363d',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', color: '#8b949e', flexShrink: 0,
            }}>You</div>
            <div style={{
              background: '#21262d',
              borderRadius: '12px',
              padding: '12px 16px',
              color: '#c9d1d9',
              fontSize: '0.9375rem',
              lineHeight: 1.6,
              minHeight: '44px',
            }}>
              {typedText}
              {phase === 'typing' && (
                <span style={{
                  display: 'inline-block',
                  width: 2,
                  height: '1.1em',
                  background: '#1de2c4',
                  marginLeft: 2,
                  animation: 'blink 0.8s step-end infinite',
                  verticalAlign: 'text-bottom',
                }} />
              )}
            </div>
          </div>

          {/* AI Response */}
          <AnimatePresence mode="wait">
            {showOutput && (
              <motion.div
                key={`${currentScenario}-${isWithPhase ? 'with' : 'without'}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4 }}
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: isWithPhase ? 'linear-gradient(135deg, #1de2c4, #60a5fa)' : '#21262d',
                  border: `1px solid ${isWithPhase ? '#1de2c4' : '#30363d'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.625rem', color: isWithPhase ? '#0d1117' : '#8b949e',
                  flexShrink: 0, fontWeight: 700,
                  transition: 'all 0.3s',
                }}>AI</div>
                <div style={{ flex: 1 }}>
                  {/* Phase label */}
                  <div style={{
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.08em',
                    marginBottom: '8px',
                    color: isWithPhase ? '#1de2c4' : '#ef4444',
                  }}>
                    {phase === 'transforming' ? '⚡ TRANSFORMING...' :
                     isWithPhase ? scenario.withLayer.label : scenario.without.label}
                  </div>

                  {/* Output card */}
                  <div style={{
                    background: phase === 'transforming' ? 'rgba(29, 226, 196, 0.05)' : '#0d1117',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    border: `1px solid ${isWithPhase ? 'rgba(29, 226, 196, 0.3)' : '#30363d'}`,
                    transition: 'all 0.5s',
                  }}>
                    <p style={{
                      color: isWithPhase ? '#e6edf3' : '#8b949e',
                      fontSize: '0.875rem',
                      lineHeight: 1.75,
                      fontStyle: phase === 'transforming' ? 'italic' : 'normal',
                    }}>
                      {phase === 'transforming' ? 'Loading brand spec... ICP context... competitive framing... content architecture...' :
                       isWithPhase ? scenario.withLayer.output : scenario.without.output}
                    </p>
                  </div>

                  {/* Verdict */}
                  {phase !== 'transforming' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      style={{
                        marginTop: '12px',
                        padding: '10px 16px',
                        borderLeft: `3px solid ${isWithPhase ? '#1de2c4' : '#ef4444'}`,
                        background: isWithPhase ? 'rgba(29, 226, 196, 0.04)' : 'rgba(239, 68, 68, 0.04)',
                        borderRadius: '0 8px 8px 0',
                        fontSize: '0.8125rem',
                        color: isWithPhase ? '#a8d8c8' : '#b87070',
                        lineHeight: 1.6,
                      }}
                    >
                      {isWithPhase ? scenario.withLayer.verdict : scenario.without.verdict}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        @keyframes blink {
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
