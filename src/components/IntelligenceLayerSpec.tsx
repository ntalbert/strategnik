import { useState, useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';

/**
 * IntelligenceLayerSpec — the tabbed spec artifact viewer.
 *
 * This is the single highest-impact conversion component in the redesign.
 * Shows 6 realistic, detailed Intelligence Layer artifacts (YAML/JSON) with
 * line numbers, validation status, and an "agents consuming" footer.
 *
 * Placement: replaces the six-component grid in src/pages/intelligence-layer.astro.
 * Import: import IntelligenceLayerSpec from '../components/IntelligenceLayerSpec';
 * Use:    <IntelligenceLayerSpec client:visible />
 *
 * NOTE: The YAML/JSON content is realistic but fabricated.
 * Swap with sanitized real artifacts before shipping to production if possible.
 */

type Tab = {
  t: string;
  color: string;
  filename: string;
  meta: string;
  lines: string[];
};

const TABS: Tab[] = [
  {
    t: 'Brand & Voice',
    color: '#1de2c4',
    filename: 'voice-spec.yaml',
    meta: '142 rules · v3.1.2 · validates in CI',
    lines: [
      '# voice-spec.yaml · compiled artifact · sha: 8a41cf2',
      '# imports: ./tenets.md · ./forbidden-terms.json · ./cadence-rules.yaml',
      '# consumed by: 14 agents · 3 LLM fine-tunes · Grammarly corpus',
      '',
      'schema_version: "2026.04"',
      'last_validated: "2026-04-19T09:12:44Z"',
      '',
      'archetype:',
      '  primary: "The Navigator"',
      '  secondary: "The Engineer"',
      '  conflicts_with: ["The Hero", "The Sage"]',
      '  tension_resolution: "lead with Navigator, earn Engineer"',
      '',
      'tone:',
      '  axes:',
      '    formal_casual: 0.35       # 0=casual, 1=formal',
      '    serious_playful: 0.15     # 0=serious, 1=playful',
      '    respectful_irreverent: 0.72',
      '    enthusiastic_matter_of_fact: 0.22',
      '  register_shifts:',
      '    - context: "C-suite email"     → {formal: +0.2, serious: +0.15}',
      '    - context: "Field Notes post"  → {irreverent: +0.1}',
      '    - context: "case study"        → {matter_of_fact: +0.3}',
      '',
      'lexicon:',
      '  forbidden:       # 47 terms · regex-enforced in CI',
      '    - { term: "synergy",    severity: block, replace_with: ["fit", "alignment"] }',
      '    - { term: "unlock",     severity: block, replace_with: ["enable", "surface"] }',
      '    - { term: "leverage",   severity: block, replace_with: ["use", "apply"] }',
      '    - { term: "empower",    severity: block, replace_with: ["equip", "enable"] }',
      '    - { term: "disrupt",    severity: warn,  context: "ok if literal" }',
      '    - { term: "revolutionary", severity: block }',
      '    - { term: "game-changer",  severity: block }',
      '    # … 40 more',
      '  preferred:',
      '    - { term: "infrastructure", boost: 2.0, applies: [all] }',
      '    - { term: "compound",       boost: 1.5, applies: [long-form] }',
      '    - { term: "physics",        boost: 1.4, applies: [framework] }',
      '',
      'cadence:',
      '  sentence_length:',
      '    target_median: 14',
      '    max: 32',
      '    variance_required: 0.4       # force variation — no same-length runs',
      '  rhythm_rules:',
      '    - "open with ≤8-word sentence 70% of time"',
      '    - "no 3 consecutive sentences > 20 words"',
      '    - "em-dash allowed · semicolon forbidden"',
      '    - "contractions: yes in field notes, no in legal/contracts"',
      '',
      'tenets:  # always citable · used in about, decks, onboarding',
      '  - id: T01, text: "Infrastructure, not advice"',
      '  - id: T02, text: "AI amplifies output, not quality"',
      '  - id: T03, text: "The strategy persists after we leave"',
      '  - id: T04, text: "Diagnose before prescribing"',
      '  - id: T05, text: "Physics, not frameworks"',
      '',
      'validation:',
      '  ci_hooks: ["pre-commit", "pre-publish", "newsletter-send"]',
      '  blocks_on: [forbidden_term, tone_axis_drift > 0.15, tenet_contradiction]',
      '  notify: ["nick@strategnik.com", "#brand-ci"]',
      '',
      'consumers:',
      '  - { agent: "writer-gpt",     reads: [tone, lexicon, cadence] }',
      '  - { agent: "sdr-copilot",    reads: [lexicon, tenets] }',
      '  - { agent: "proposal-bot",   reads: [*, archetype] }',
      '  - { corpus: "finetune-v4",   trained_on: [lexicon, tenets, 340_samples] }',
    ],
  },
  {
    t: 'ICP + Buyer',
    color: '#60a5fa',
    filename: 'icp-context.yaml',
    meta: '3 personas · 48 trigger signals · refreshed weekly',
    lines: [
      '# icp-context.yaml · v2026.04.15',
      '# sources: salesforce_exports.json · 6sense_feed.live · 47_closed_won.csv',
      '# refresh: weekly · owner: @nick · validators: @revops · @marketing-ops',
      '',
      'ideal_company:',
      '  firmographic:',
      '    stage: { in: [Series B, Series C, pre-IPO] }',
      '    arr:   { min: 10_000_000, max: 150_000_000, sweet_spot: [25M, 75M] }',
      '    employees: { min: 80, max: 600 }',
      '    motion: { in: [product-led, sales-led-hybrid], excluded: [enterprise-only] }',
      '    geography: { primary: [US, CA], secondary: [UK, AU], excluded: [EU-data-res] }',
      '    funding_recency_months: { max: 18 }',
      '  technographic:',
      '    required_stack:',
      '      - "Salesforce | HubSpot"',
      '      - "any marketing automation"',
      '      - "≥ 1 AI/LLM tool in production (Jasper, Writer, in-house)"',
      '    disqualifying_stack:',
      '      - "has recently hired fractional CMO in last 90 days"',
      '      - "in active RFP with named competitor"',
      '  behavioral:',
      '    content_velocity: { min_posts_per_month: 4 }',
      '    ai_initiative_status: { in: ["stalled", "fragmented", "exploratory"] }',
      '    pipeline_signal: { conversion_rate_pct: { max: 18 } }     # we help worst',
      '',
      'personas:',
      '  - id: P01',
      '    title: "CRO / VP Revenue"',
      '    weight: 0.45',
      '    priorities:       [pipeline_velocity, forecast_accuracy, cycle_compression]',
      '    reports_to:       [CEO, Board]',
      '    buys_because:     "predictable pipeline, not more leads"',
      '    objects_with:     ["we have marketing already", "fractional CMO is cheaper"]',
      '    counters:         ["/objections/cro-have-marketing.md"]',
      '    proof_assets:     ["/case/series-c-cro.pdf", "/benchmarks/conversion.json"]',
      '  - id: P02',
      '    title: "CMO / VP Marketing"',
      '    weight: 0.30',
      '    priorities:       [brand_consistency, ai_adoption, content_roi]',
      '  - id: P03',
      '    title: "Founder / CEO (ARR < $30M)"',
      '    weight: 0.25',
      '',
      'trigger_signals:    # ranked · scored · consumed by outbound agent',
      '  high_intent:    # score ≥ 80',
      '    - { signal: "new CRO in role < 90 days",         score: 94, source: 6sense }',
      '    - { signal: "Series C closed in last 180 days",  score: 88, source: crunchbase }',
      '    - { signal: "posted AI-native GTM role",         score: 85, source: linkedin_jobs }',
      '    - { signal: "content velocity dropped 30%+",      score: 82, source: clearbit_pulse }',
      '  medium_intent:  # score 50–79',
      '    - { signal: "CMO tenure > 24 months",            score: 68, rationale: "restless" }',
      '    - { signal: "competitor announced AI product",    score: 62 }',
      '    - { signal: "Q2 pipeline miss (public)",         score: 58 }',
      '    # … 42 more',
      '',
      'buying_committee:',
      '  typical_size: 4.3',
      '  required_stakeholders: [CRO, CMO, 1_of:{CEO, CFO}]',
      '  blocker_roles: ["VP Eng (build vs buy)", "Legal (data residency)"]',
      '  decision_path: "CMO → CRO co-sign → CEO 15-min review → CFO signoff"',
      '',
      'data_sources:',
      '  - { name: salesforce_exports, refresh: daily,  owner: @revops }',
      '  - { name: 6sense_feed,        refresh: live,   owner: @marketing-ops }',
      '  - { name: 47_closed_won.csv,  refresh: weekly, owner: @nick }',
      '  - { name: win_loss_interviews, refresh: monthly, n: 12 }',
    ],
  },
  {
    t: 'Position',
    color: '#f59e0b',
    filename: 'positioning.json',
    meta: '4 axes · 6 competitors · refreshed monthly',
    lines: [
      '{',
      '  "$schema": "https://strategnik.com/schema/positioning/v3.json",',
      '  "version": "3.2.0",',
      '  "last_updated": "2026-04-08",',
      '  "owner": "nick@strategnik.com",',
      '  "reviewed_by": ["board_advisor_A", "pmm_lead"],',
      '',
      '  "category": {',
      '    "claimed": "AI-native marketing infrastructure",',
      '    "parent":  "B2B GTM services",',
      '    "not":     ["fractional CMO", "agency", "consultancy", "SaaS tool"],',
      '    "creation_strategy": "expand",   // expand | challenge | redefine',
      '    "analogues":        ["dbt for analytics", "Stripe for payments"],',
      '    "category_proof": [',
      '      "/writing/intelligence-layer-thesis.md",',
      '      "/writing/ai-amplifies-output.md",',
      '      "/case/series-c-friction-build.md"',
      '    ]',
      '  },',
      '',
      '  "value_axes": [',
      '    { "axis": "durability",       "we": 0.92, "benchmark": 0.34,',
      '      "claim": "Infrastructure persists after engagement ends" },',
      '    { "axis": "machine_readable","we": 0.95, "benchmark": 0.08,',
      '      "claim": "Every artifact is schema-valid and agent-queryable" },',
      '    { "axis": "diagnostic_rigor","we": 0.88, "benchmark": 0.42,',
      '      "claim": "Physics of Growth diagnoses force before prescribing play" },',
      '    { "axis": "speed_to_value",  "we": 0.71, "benchmark": 0.79,',
      '      "claim": null,  // we concede this — fractional CMO is faster at month-1',
      '    }',
      '  ],',
      '',
      '  "competitive_set": [',
      '    {',
      '      "name": "Traditional B2B agencies",',
      '      "examples": ["Bluewire", "Refine Labs-alike"],',
      '      "overlap_pct": 35,',
      '      "we_win_when": [',
      '        "buyer wants the strategy to outlive the engagement",',
      '        "AI stack is already in production and fragmented",',
      '        "team has matured past needing creative throughput"',
      '      ],',
      '      "they_win_when": [',
      '        "need is pure creative production capacity",',
      '        "sub-Series-B with < $10M ARR"',
      '      ],',
      '      "positioning_delta": "we leave infrastructure, they leave decks",',
      '      "battlecard": "/battlecards/vs-agencies.md"',
      '    },',
      '    {',
      '      "name": "AI content tools (Jasper, Writer, Copy.ai)",',
      '      "overlap_pct": 18,',
      '      "positioning_delta": "we build the context they plug into",',
      '      "partnership_eligible": true,',
      '      "integration_spec": "/integrations/writer-v2.yaml"',
      '    },',
      '    {',
      '      "name": "Fractional CMO networks (Chief Outsiders, etc.)",',
      '      "overlap_pct": 52,',
      '      "positioning_delta": "they are the operator; we are the operating system",',
      '      "battlecard": "/battlecards/vs-fractional.md"',
      '    }',
      '    // … 3 more',
      '  ],',
      '',
      '  "messaging_hierarchy": {',
      '    "primary_claim":      "The Intelligence Layer for AI-native marketing",',
      '    "secondary_claims":   ["Infrastructure, not advice", "Physics, not frameworks"],',
      '    "proof_points":       ["/proof/47-builds.json", "/proof/$1.2B-pipeline.json"],',
      '    "forbidden_claims":   ["best-in-class", "industry-leading", "#1 ranked"]',
      '  }',
      '}',
    ],
  },
  {
    t: 'Measurement',
    color: '#78eddc',
    filename: 'measurement.yaml',
    meta: '3 KPI tiers · 12 dashboards · warehouse-connected',
    lines: [
      '# measurement.yaml · source of truth for pipeline KPIs',
      '# warehouse: snowflake://strategnik-prod · dbt models: /models/gtm/',
      '# dashboards: /looker/gtm-health · /hex/pipeline-velocity · /notion/weekly-review',
      '# last_calibrated: 2026-03-28 · next: 2026-06-28',
      '',
      'philosophy:',
      '  tenet: "Measure energy transfer, not activity."',
      '  corollary: "Every KPI must tie to pipeline within 2 hops."',
      '  blast_radius: "If the KPI moves, can you name what you\'d do differently? If no, it\'s vanity."',
      '',
      'tiers:',
      '  north_star:',
      '    - name: pipeline_velocity',
      '      sql_model: models/gtm/velocity.sql',
      '      formula: "(qualified_opps × avg_acv × win_rate) / avg_cycle_days"',
      '      cadence: weekly',
      '      target_2026Q2: $2.4M/mo',
      '      owner: CRO',
      '      alerts: ["drop > 15% wow → #alert-pipeline"]',
      '',
      '  tier_1_inputs:      # levers that move the north star',
      '    - { name: qualified_opp_creation, owner: VP-Marketing, target: 82/mo,',
      '        upstream_of: pipeline_velocity }',
      '    - { name: sales_cycle_days,       owner: CRO,          target_2026Q2: 71,',
      '        baseline:  120,  trend: "−41% since IL deploy" }',
      '    - { name: icp_fit_score,          owner: RevOps,       target: 0.82,',
      '        method: "6sense × manual override × win_history" }',
      '    - { name: content_to_pipeline,    owner: Marketing,    target: 3.2x,',
      '        definition: "attributed SQLs per published asset, 90-day window" }',
      '',
      '  tier_2_leading:',
      '    - intelligence_layer_coverage: pct_of_agents_reading_spec',
      '    - voice_compliance_ci_pass_rate:  target ≥ 0.96',
      '    - position_drift:                measured vs. positioning.json monthly',
      '',
      'retired_metrics:   # explicitly ignored — do not rebuild',
      '  - { metric: MQL_count,          retired: 2026-01-15,',
      '      reason: "activity, not energy · no correlation to closed-won" }',
      '  - { metric: organic_traffic,    retired: 2025-11-02,',
      '      reason: "vanity unless tied to ICP account view" }',
      '  - { metric: social_engagement,  retired: 2025-08-10,',
      '      reason: "noise · zero predictive power for pipeline" }',
      '  - { metric: lead_volume,        retired: 2026-02-01,',
      '      reason: "replaced by qualified_opp_creation" }',
      '',
      'review_ritual:',
      '  weekly:   { day: Monday, attendees: [CRO, VP-M, RevOps], duration: 25min }',
      '  monthly:  { scope: "recalibrate tier_1 targets · review retired candidates" }',
      '  quarterly:{ scope: "full Physics of Growth re-diagnosis · force rotation" }',
      '',
      'integrations:',
      '  - { warehouse: snowflake,  tables: 14, refresh: hourly }',
      '  - { bi: looker,            dashboards: 7 }',
      '  - { alerting: pagerduty,   routes: ["#alert-pipeline", "#alert-velocity"] }',
      '  - { agent_feed: kpi_oracle_v3, read_by: [forecast-bot, board-deck-bot] }',
    ],
  },
];

export default function IntelligenceLayerSpec() {
  const [tab, setTab] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '0px 0px -80px 0px' });
  const reduce = useReducedMotion();
  const active = TABS[tab];

  return (
    <section ref={ref} className="py-20 md:py-32 bg-black">
      <div className="container-content">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.3fr] items-start">
          {/* Left — narrative + tab list */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.5 }}
          >
            <p className="text-caption text-accent tracking-wide mb-4 font-bold uppercase">
              The Intelligence Layer
            </p>
            <h2 className="text-display font-display italic text-white font-extrabold mb-6">
              The artifact you actually walk away with.
            </h2>
            <p className="text-body-lg text-gray-300 mb-8">
              Not a PDF. Not a Notion doc. A machine-readable operating context that every tool in
              your stack queries — and every new hire onboards against.
            </p>

            <div className="flex flex-col gap-1 mt-8">
              {TABS.map((x, i) => (
                <button
                  key={x.t}
                  onClick={() => setTab(i)}
                  className="text-left py-3 px-4 cursor-pointer transition-all rounded-r-md border-l-[3px]"
                  style={{
                    background: tab === i ? '#0f1419' : 'transparent',
                    borderLeftColor: tab === i ? x.color : 'transparent',
                    color: tab === i ? '#fff' : '#95959d',
                  }}
                >
                  <span
                    className="inline-block w-4 font-mono text-[11px]"
                    style={{ color: tab === i ? x.color : '#494950' }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="ml-3 font-body text-[15px]" style={{ fontWeight: tab === i ? 500 : 400 }}>
                    {x.t}
                  </span>
                </button>
              ))}
              <p className="mt-4 py-3 px-4 text-gray-500 text-[13px] italic">
                + Content Architecture + Machine Readability
              </p>
            </div>
          </motion.div>

          {/* Right — spec viewer */}
          <motion.div
            key={tab}
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-[10px] overflow-hidden flex flex-col max-h-[640px]"
            style={{
              background: '#0a0d11',
              border: `1px solid ${active.color}40`,
              boxShadow: `0 20px 60px ${active.color}15`,
            }}
          >
            {/* file header */}
            <div className="flex items-center gap-2 border-b border-[#1a2328] bg-[#0f1419] px-[18px] py-3 shrink-0">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="w-2 h-2 rounded-full" style={{ background: active.color }} />
              <span className="font-mono text-[10px] text-gray-500 ml-3 flex-1 truncate">
                {active.filename}
              </span>
              <span className="font-mono text-[9px] text-gray-600 uppercase tracking-wider">
                {active.lines.length} lines
              </span>
            </div>

            {/* validation strip */}
            <div className="px-[18px] py-1.5 border-b border-[#1a2328] bg-[#06080a] font-mono text-[10px] text-gray-500 shrink-0">
              <span style={{ color: active.color }}>●</span> valid ·{' '}
              <span style={{ color: active.color }}>{active.meta}</span>
            </div>

            {/* code */}
            <pre className="m-0 py-5 font-mono text-[11.5px] leading-[1.7] text-gray-300 overflow-auto flex-1">
              {active.lines.map((ln, i) => {
                const isComment = ln.trim().startsWith('#') || ln.trim().startsWith('//');
                const isHeader = i < 4 && isComment;
                let color: string = '#b4b4be';
                if (isHeader) color = active.color;
                else if (isComment) color = '#495963';
                else if (ln.trim().startsWith('-') || ln.includes(':')) color = '#cacace';
                return (
                  <div key={i} className="flex" style={{ color }}>
                    <span className="inline-block w-10 pr-3.5 text-right text-[#2b363b] select-none shrink-0">
                      {i + 1}
                    </span>
                    <span className="pr-7 whitespace-pre">{ln || ' '}</span>
                  </div>
                );
              })}
            </pre>

            {/* footer */}
            <div
              className="px-[18px] py-2.5 border-t border-[#1a2328] bg-[#06080a] flex justify-between font-mono text-[10px] shrink-0"
              style={{ color: '#495963' }}
            >
              <span>schema: strategnik/v3 · validated 4h ago</span>
              <span>
                referenced by <span style={{ color: active.color }}>14 agents</span> ·{' '}
                <span style={{ color: active.color }}>7 dashboards</span>
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
