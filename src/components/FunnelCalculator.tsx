import { useState } from 'react';

/**
 * FunnelCalculator — live pipeline velocity model.
 *
 * Replaces src/pages/calculator.astro body. Four sliders, three outputs,
 * a +60% benchmark target based on typical Sprint engagement outcomes.
 *
 * Import: import FunnelCalculator from '../components/FunnelCalculator';
 * Use:    <FunnelCalculator client:visible />
 */

type Slider = {
  label: string;
  value: number;
  setValue: (v: number) => void;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
};

export default function FunnelCalculator() {
  const [leads, setLeads] = useState(1000);
  const [conv, setConv] = useState(12);
  const [acv, setAcv] = useState(25000);
  const [cycle, setCycle] = useState(120);

  const pipeline = leads * (conv / 100) * acv;
  const velocity = (pipeline / cycle) * 30;
  const target = pipeline * 1.6;

  const sliders: Slider[] = [
    { label: 'Monthly qualified leads', value: leads, setValue: setLeads, min: 100, max: 5000, step: 100, format: (v) => v.toLocaleString() },
    { label: 'Lead → closed-won (%)', value: conv, setValue: setConv, min: 2, max: 30, step: 1, format: (v) => `${v}%` },
    { label: 'Average deal size ($)', value: acv, setValue: setAcv, min: 5000, max: 200000, step: 5000, format: (v) => `$${v.toLocaleString()}` },
    { label: 'Sales cycle (days)', value: cycle, setValue: setCycle, min: 14, max: 365, step: 7, format: (v) => `${v} days` },
  ];

  return (
    <section className="py-20 md:py-28 bg-black">
      <div className="container-content max-w-5xl">
        <p className="text-caption text-accent tracking-wide mb-4 font-bold uppercase">
          Funnel Velocity Calculator
        </p>
        <h1 className="text-display-xl font-display italic text-white font-extrabold mb-6">
          Your pipeline, modeled live.
        </h1>
        <p className="text-body-lg text-gray-300 max-w-xl">
          Move the sliders. See where friction lives. Get a personalized read-out.
        </p>

        <div className="grid gap-12 md:grid-cols-2 mt-14">
          <div className="flex flex-col gap-7">
            {sliders.map((s) => (
              <div key={s.label}>
                <div className="flex justify-between items-baseline mb-2.5">
                  <span className="text-xs text-gray-400 uppercase tracking-wider">{s.label}</span>
                  <span className="font-display italic text-accent font-extrabold text-xl">
                    {s.format(s.value)}
                  </span>
                </div>
                <input
                  type="range"
                  min={s.min}
                  max={s.max}
                  step={s.step}
                  value={s.value}
                  onChange={(e) => s.setValue(+e.target.value)}
                  className="w-full"
                  style={{ accentColor: 'var(--accent)' }}
                />
              </div>
            ))}
          </div>

          <div
            className="p-8 rounded-xl border border-accent"
            style={{ background: '#0f1419', boxShadow: '0 12px 48px rgba(29,226,196,0.12)' }}
          >
            <div className="mb-6">
              <p className="text-caption text-gray-400 uppercase tracking-wider mb-1.5 font-bold">
                Current pipeline generated
              </p>
              <p className="font-display italic text-white font-extrabold text-5xl tracking-tight">
                ${pipeline.toLocaleString()}
              </p>
            </div>
            <div className="mb-6">
              <p className="text-caption text-gray-400 uppercase tracking-wider mb-1.5 font-bold">
                Velocity (per 30 days)
              </p>
              <p className="font-display italic text-white font-extrabold text-3xl">
                ${Math.round(velocity).toLocaleString()}
              </p>
            </div>
            <div className="pt-6 border-t border-[#1a2328]">
              <p className="text-caption text-accent uppercase tracking-wider mb-1.5 font-bold">
                Post-Context Layer target
              </p>
              <p className="font-display italic text-accent font-extrabold text-3xl">
                ${target.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-1 italic">
                +60% typical Sprint engagement lift
              </p>
            </div>
            <a
              href="/gravity-audit"
              className="block text-center mt-6 hp-btn hp-btn--primary w-full justify-center"
            >
              Get this in your inbox →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
