import { useState } from 'react';

/**
 * GravityAuditFlow — 3-step qualifier → diagnosis → book a call.
 *
 * Replaces form in src/pages/gravity-audit.astro.
 *
 * Wire up: POSTs to `/api/leads` (your existing endpoint) with {email, arr, pain}.
 * Adjust the fetch URL if your endpoint name differs.
 *
 * Import: import GravityAuditFlow from '../components/GravityAuditFlow';
 * Use:    <GravityAuditFlow client:visible />
 */

const ARRS = ['<$10M', '$10–30M', '$30–75M', '$75–150M', '$150M+'];
const PAINS = [
  'Pipeline velocity stalled',
  'AI output feels fragmented',
  'Brand reach ≠ conversion',
  'Sales cycle lengthening',
  'Positioning no longer lands',
];

// Rough diagnostic mapping — a pain → a dominant force.
// The real read-out should come from a back-end scoring model once built.
const DIAGNOSIS: Record<string, { force: string; color: string; insight: string }> = {
  'Pipeline velocity stalled': {
    force: 'Friction',
    color: '#ef4444',
    insight:
      "72% of companies with stalled velocity are losing pipeline at unnecessary handoffs. We'll map where the energy goes.",
  },
  'AI output feels fragmented': {
    force: 'Friction',
    color: '#ef4444',
    insight:
      "No shared operating context. Every agent writes a slightly different company. Fix is the Intelligence Layer itself.",
  },
  'Brand reach ≠ conversion': {
    force: 'Mass',
    color: '#f59e0b',
    insight:
      "You have brand credibility without the structural pull to convert it. Position + content architecture rebuild.",
  },
  'Sales cycle lengthening': {
    force: 'Friction',
    color: '#ef4444',
    insight:
      "Decision friction. Each stage resets the buying committee's momentum. We diagnose the worst handoff.",
  },
  'Positioning no longer lands': {
    force: 'Inflection Points',
    color: '#06b6d4',
    insight:
      "The market moved and your positioning didn't. Field observation, not theory. Needs a re-map.",
  },
};

export default function GravityAuditFlow() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ email: '', arr: '', pain: '' });
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, source: 'gravity-audit' }),
      });
    } catch (e) {
      // Silent-fail — user still sees result. Real impl should surface an error toast.
      console.warn('lead post failed', e);
    }
    setStep(3);
    setSubmitting(false);
  };

  const dx = data.pain ? DIAGNOSIS[data.pain] : null;

  return (
    <section className="py-20 md:py-28 bg-black relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 70% 20%, rgba(29,226,196,0.05), transparent 50%)' }}
      />
      <div className="container-content relative max-w-3xl">
        <p className="text-caption text-accent tracking-wide mb-4 font-bold uppercase">
          Gravity Audit · 60 seconds
        </p>
        <h1 className="text-display-xl font-display italic text-white font-extrabold mb-6">
          Find out which growth force is breaking.
        </h1>
        <p className="text-body-lg text-gray-300 max-w-xl">
          Three questions. Same-day pipeline-health read-out. No sales call — you get a real answer
          whether you engage or not.
        </p>

        <div className="mt-12 p-9 rounded-xl border border-[#2b363b]" style={{ background: '#0f1419' }}>
          {/* progress */}
          <div className="flex gap-2 mb-7">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex-1 h-[3px] rounded transition-colors"
                style={{ background: step >= i ? 'var(--accent)' : '#2b363b' }}
              />
            ))}
          </div>

          {step === 0 && (
            <div>
              <h3 className="text-xl text-white font-bold mb-4">What's your work email?</h3>
              <input
                type="email"
                placeholder="you@company.com"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                className="w-full text-base px-4 py-3.5 bg-black border border-[#2b363b] text-white rounded outline-none focus:border-accent transition-colors mb-5"
              />
              <button
                onClick={() => setStep(1)}
                disabled={!data.email}
                className="hp-btn hp-btn--primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue →
              </button>
            </div>
          )}

          {step === 1 && (
            <div>
              <h3 className="text-xl text-white font-bold mb-4">What's your ARR band?</h3>
              <div className="grid grid-cols-3 gap-2.5 mb-5">
                {ARRS.map((a) => (
                  <button
                    key={a}
                    onClick={() => setData({ ...data, arr: a })}
                    className="py-3.5 text-sm rounded border transition-colors"
                    style={{
                      background: data.arr === a ? 'var(--accent)' : 'transparent',
                      color: data.arr === a ? '#0d1117' : '#cacace',
                      borderColor: data.arr === a ? 'var(--accent)' : '#2b363b',
                      fontWeight: data.arr === a ? 700 : 400,
                    }}
                  >
                    {a}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={!data.arr}
                className="hp-btn hp-btn--primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue →
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="text-xl text-white font-bold mb-4">Which sounds most like you?</h3>
              <div className="flex flex-col gap-2.5 mb-5">
                {PAINS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setData({ ...data, pain: p })}
                    className="text-left px-5 py-3.5 text-sm rounded border transition-colors"
                    style={{
                      background: data.pain === p ? '#0f1419' : '#000',
                      color: data.pain === p ? '#fff' : '#cacace',
                      borderColor: data.pain === p ? 'var(--accent)' : '#2b363b',
                    }}
                  >
                    {data.pain === p && <span className="text-accent mr-2.5">→</span>}
                    {p}
                  </button>
                ))}
              </div>
              <button
                onClick={submit}
                disabled={!data.pain || submitting}
                className="hp-btn hp-btn--primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting…' : 'See my result →'}
              </button>
            </div>
          )}

          {step === 3 && dx && (
            <div>
              <p className="font-mono text-[11px] text-accent uppercase tracking-wider mb-4 font-bold">
                Result · Preliminary diagnosis
              </p>
              <h3 className="text-2xl text-white font-bold mb-4">
                Your dominant force is <span style={{ color: dx.color }}>{dx.force}</span>.
              </h3>
              <p className="text-body text-gray-300 mb-6">{dx.insight}</p>
              <p className="text-sm text-gray-400 mb-6">
                Full report (12 pages, anonymized benchmarks) in your inbox within 4 hours.
              </p>
              <div className="p-5 border border-accent rounded-lg bg-black mb-5">
                <p className="text-xs font-bold text-accent uppercase tracking-wider mb-1.5">
                  Next step — if you want it
                </p>
                <p className="text-base text-white font-bold mb-1.5">30-min diagnostic call</p>
                <p className="text-sm text-gray-400 mb-4">
                  I'll walk through your friction map and tell you if the Sprint is worth exploring.
                  No pitch.
                </p>
                <a href="mailto:nick@strategnik.com?subject=Gravity Audit follow-up" className="hp-btn hp-btn--primary">
                  Book the call →
                </a>
              </div>
              <button
                onClick={() => {
                  setStep(0);
                  setData({ email: '', arr: '', pain: '' });
                }}
                className="bg-transparent border-none text-gray-500 text-xs underline cursor-pointer"
              >
                Start over
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
