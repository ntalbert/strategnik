import { useState, useCallback } from "react";

const STAGES = ["Pre-Seed", "Seed", "Series A", "Series B", "Series C", "Series D+", "Public"];
const FUNCTIONS = ["Growth", "Sales / Revenue", "Both (CRO / GTM)", "Other"];
const TITLES_GTM = [
  "VP Growth", "CMO", "Head of Growth", "Director of Growth",
  "VP Sales", "CRO", "Head of Sales", "Director of Sales",
  "VP Growth", "Head of GTM", "Other"
];
const OUTCOMES = [
  "I left voluntarily for a better opportunity",
  "I left voluntarily — the role wasn't what was promised",
  "Mutual decision — we agreed it wasn't working",
  "I was let go — missed targets",
  "I was let go — leadership change / reorg",
  "I was let go — budget cuts / runway",
  "Still in the role",
  "Other"
];
const STATED_REASONS = [
  "Performance / missed targets",
  "Strategic misalignment with CEO",
  "Conflict between sales and growth",
  "Company pivot / changed direction",
  "Budget constraints / downsizing",
  "Leadership change above me",
  "Not the right stage-fit",
  "No stated reason — it was amicable on paper",
  "N/A — I'm still in the role",
  "Other"
];
const REAL_REASONS = [
  "Goals didn't match what was actually measurable at that stage",
  "The system was too early — not enough data to prove anything",
  "Inherited broken tooling / no infrastructure",
  "Political dynamics / CEO wanted a different profile",
  "Genuine skill gap — I wasn't right for the role",
  "The go-to-market motion hadn't been figured out yet",
  "Sales and growth were set up to fail separately",
  "The board's timeline was unrealistic for the stage",
  "Honestly, the stated reason was the real reason",
  "Other"
];
const TOOLING_MATURITY = [
  "Almost nothing — spreadsheets and gut feel",
  "Basic CRM but no real attribution or reporting",
  "CRM + some attribution, but major gaps",
  "Functional RevOps stack — could measure most things",
  "Mature infrastructure — clean data, real dashboards"
];
const MEASUREMENT = [
  "I couldn't measure what mattered — the data didn't exist yet",
  "I could measure activity but not outcomes",
  "I could measure outcomes but couldn't attribute them reliably",
  "I could measure and attribute most things that mattered",
  "Full measurement capability — the stack was solid"
];
const LEVERS = [
  "1-2 channels, mostly experimental",
  "3-4 channels, 1-2 producing real results",
  "5+ channels, several producing consistently",
  "Broad multi-channel with clear winners",
  "Full-scale across many channels and segments"
];
const BUILT_OR_INHERITED = [
  "Built from scratch — there was almost nothing",
  "Rebuilt most of it — what existed wasn't usable",
  "Inherited a partial stack and filled gaps",
  "Inherited a functional stack and optimized",
  "Inherited a mature stack — focused on strategy, not plumbing"
];
const SYSTEM_CHANGE = [
  "Nothing meaningful changed — same constraints, new person",
  "Slightly better — my predecessor generated some useful data",
  "Meaningfully different — the company had matured",
  "Completely different — new product, new market, or new funding",
  "I don't know what my predecessor faced"
];
const FOUNDER_GTM_COUNT = ["1", "2", "3", "4", "5+"];
const FOUNDER_WHAT_CHANGED = [
  "We changed the person but not the system",
  "We improved tooling / infrastructure between hires",
  "We adjusted goals to be more stage-appropriate",
  "We changed the GTM model entirely",
  "Each hire faced roughly the same conditions",
  "Other"
];
const FOUNDER_MEASURED = [
  "Pipeline / revenue targets from our fundraising model",
  "Pipeline targets adjusted for stage",
  "Leading indicators (ICP fit, channel viability, sales cycle data)",
  "A mix of revenue targets and leading indicators",
  "Honestly, we weren't sure what to measure",
  "Other"
];

const COLORS = {
  bg: "#FAFAF8",
  card: "#FFFFFF",
  primary: "#1a1a1a",
  secondary: "#5a5a5a",
  accent: "#2C5F2D",
  accentLight: "#E8F0E8",
  border: "#E5E5E3",
  borderFocus: "#2C5F2D",
  error: "#B33A3A",
  muted: "#8a8a8a",
  progress: "#2C5F2D",
  progressBg: "#E5E5E3",
};

const fonts = {
  heading: "'Newsreader', 'Georgia', serif",
  body: "'DM Sans', 'Helvetica Neue', sans-serif",
  mono: "'JetBrains Mono', monospace",
};

interface RadioProps {
  name: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
  other?: boolean;
}

function Radio({ name, options, value, onChange, other = false }: RadioProps) {
  const [otherText, setOtherText] = useState("");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {options.map((opt) => (
        <label
          key={opt}
          style={{
            display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer",
            padding: "10px 14px", borderRadius: 8,
            border: `1.5px solid ${value === opt ? COLORS.borderFocus : COLORS.border}`,
            background: value === opt ? COLORS.accentLight : COLORS.card,
            transition: "all 0.15s ease",
            fontFamily: fonts.body, fontSize: 14.5, color: COLORS.primary, lineHeight: 1.5,
          }}
        >
          <span style={{
            width: 18, height: 18, borderRadius: "50%", marginTop: 1, flexShrink: 0,
            border: `2px solid ${value === opt ? COLORS.accent : COLORS.border}`,
            background: value === opt ? COLORS.accent : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.15s ease",
          }}>
            {value === opt && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />}
          </span>
          <input
            type="radio"
            name={name}
            value={opt}
            checked={value === opt}
            onChange={() => onChange(opt)}
            style={{ display: "none" }}
          />
          {opt}
        </label>
      ))}
      {other && value === "Other" && (
        <input
          type="text"
          placeholder="Please specify..."
          value={otherText}
          onChange={(e) => { setOtherText(e.target.value); onChange("Other: " + e.target.value); }}
          style={{
            marginLeft: 28, padding: "10px 14px", borderRadius: 8,
            border: `1.5px solid ${COLORS.border}`, fontFamily: fonts.body, fontSize: 14,
            outline: "none", width: "calc(100% - 56px)",
          }}
          onFocus={(e) => e.target.style.borderColor = COLORS.borderFocus}
          onBlur={(e) => e.target.style.borderColor = COLORS.border}
        />
      )}
    </div>
  );
}

interface SelectProps {
  options: string[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

function Select({ options, value, onChange, placeholder }: SelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        padding: "12px 14px", borderRadius: 8, border: `1.5px solid ${COLORS.border}`,
        fontFamily: fonts.body, fontSize: 14.5, color: value ? COLORS.primary : COLORS.muted,
        background: COLORS.card, cursor: "pointer", outline: "none", width: "100%",
        appearance: "auto",
      }}
      onFocus={(e) => e.target.style.borderColor = COLORS.borderFocus}
      onBlur={(e) => e.target.style.borderColor = COLORS.border}
    >
      <option value="" disabled>{placeholder || "Select..."}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

interface TextAreaProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
}

function TextArea({ value, onChange, placeholder, rows = 3 }: TextAreaProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{
        padding: "12px 14px", borderRadius: 8, border: `1.5px solid ${COLORS.border}`,
        fontFamily: fonts.body, fontSize: 14.5, color: COLORS.primary, width: "100%",
        resize: "vertical", outline: "none", boxSizing: "border-box", lineHeight: 1.6,
      }}
      onFocus={(e) => e.target.style.borderColor = COLORS.borderFocus}
      onBlur={(e) => e.target.style.borderColor = COLORS.border}
    />
  );
}

interface QuestionProps {
  number: number;
  label: string;
  sublabel?: string;
  children: React.ReactNode;
  required?: boolean;
}

function Question({ number, label, sublabel, children, required = true }: QuestionProps) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ marginBottom: 10 }}>
        <span style={{
          fontFamily: fonts.mono, fontSize: 11, color: COLORS.accent,
          textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600,
        }}>
          Q{number}{required && " *"}
        </span>
        <h3 style={{
          fontFamily: fonts.heading, fontSize: 18, fontWeight: 500,
          color: COLORS.primary, margin: "6px 0 0", lineHeight: 1.4,
        }}>
          {label}
        </h3>
        {sublabel && (
          <p style={{
            fontFamily: fonts.body, fontSize: 13, color: COLORS.muted,
            margin: "4px 0 0", lineHeight: 1.5, fontStyle: "italic",
          }}>{sublabel}</p>
        )}
      </div>
      {children}
    </div>
  );
}

interface ProgressBarProps {
  current: number;
  total: number;
}

function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = Math.round((current / total) * 100);
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 8,
      }}>
        <span style={{ fontFamily: fonts.mono, fontSize: 11, color: COLORS.muted, letterSpacing: 1 }}>
          SECTION {current} OF {total}
        </span>
        <span style={{ fontFamily: fonts.mono, fontSize: 11, color: COLORS.accent, fontWeight: 600 }}>
          {pct}%
        </span>
      </div>
      <div style={{
        height: 3, background: COLORS.progressBg, borderRadius: 2, overflow: "hidden",
      }}>
        <div style={{
          height: "100%", width: `${pct}%`, background: COLORS.progress,
          borderRadius: 2, transition: "width 0.4s ease",
        }} />
      </div>
    </div>
  );
}

const GTM_SECTIONS = [
  { id: "role", title: "Your Role" },
  { id: "tenure", title: "Tenure & Outcome" },
  { id: "system", title: "The System You Inherited" },
  { id: "structural", title: "The Structural Question" },
  { id: "contact", title: "Optional Info" },
];
const FOUNDER_SECTIONS = [
  { id: "context", title: "Your Company" },
  { id: "hiring", title: "GTM Hiring Pattern" },
  { id: "structural", title: "The Structural Question" },
  { id: "contact", title: "Optional Info" },
];

export default function GTMSurvey() {
  const [path, setPath] = useState<string | null>(null);
  const [section, setSection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = useCallback((key: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [key]: val }));
  }, []);

  const sections = path === "gtm" ? GTM_SECTIONS : path === "founder" ? FOUNDER_SECTIONS : [];
  const totalSections = sections.length;

  const canAdvance = () => {
    if (path === "gtm") {
      if (section === 0) return answers.function && answers.title && answers.stageStart;
      if (section === 1) return answers.tenure && answers.outcome && answers.statedReason && answers.realReason;
      if (section === 2) return answers.tooling && answers.measurement && answers.levers && answers.builtInherited;
      if (section === 3) return answers.systemChange && answers.wishBoard;
      return true;
    }
    if (path === "founder") {
      if (section === 0) return answers.currentStage && answers.companySize;
      if (section === 1) return answers.gtmCount && answers.whatChanged && answers.measuredAgainst;
      if (section === 2) return answers.founderWish;
      return true;
    }
    return false;
  };

  const submitSurvey = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        timestamp: new Date().toISOString(),
        path,
        ...answers,
      };

      const response = await fetch('/api/survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Submission failed');
      }

      setSubmitted(true);
    } catch (err) {
      console.error('Survey submission error:', err);
      setError('There was an error submitting your response. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={{
        minHeight: "100vh", background: COLORS.bg, display: "flex",
        alignItems: "center", justifyContent: "center", padding: 24,
      }}>
        <div style={{
          maxWidth: 560, width: "100%", background: COLORS.card, borderRadius: 16,
          padding: "56px 40px", border: `1px solid ${COLORS.border}`, textAlign: "center",
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%", background: COLORS.accentLight,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 24px", fontSize: 24,
          }}>✓</div>
          <h2 style={{
            fontFamily: fonts.heading, fontSize: 26, fontWeight: 500,
            color: COLORS.primary, margin: "0 0 12px",
          }}>Response recorded.</h2>
          <p style={{
            fontFamily: fonts.body, fontSize: 15, color: COLORS.secondary,
            lineHeight: 1.6, margin: "0 0 24px",
          }}>
            Thank you for contributing to this research. Every response helps build
            the dataset that's missing from the GTM tenure conversation.
          </p>
          {answers.email && (
            <p style={{
              fontFamily: fonts.body, fontSize: 14, color: COLORS.muted,
              lineHeight: 1.5, padding: "16px", background: COLORS.accentLight,
              borderRadius: 8,
            }}>
              You'll receive the full analysis when it's published.
            </p>
          )}
          <a
            href="/thinking/physics-of-growth-why-early-stage-growth-fails"
            style={{
              display: "inline-block", marginTop: 24, padding: "12px 24px",
              background: COLORS.accent, color: "#fff", borderRadius: 8,
              textDecoration: "none", fontFamily: fonts.body, fontSize: 14, fontWeight: 500,
            }}
          >
            Read the research article
          </a>
        </div>
      </div>
    );
  }

  if (!path) {
    return (
      <div style={{
        minHeight: "100vh", background: COLORS.bg, display: "flex",
        alignItems: "center", justifyContent: "center", padding: 24,
      }}>
        <div style={{ maxWidth: 600, width: "100%", textAlign: "center" }}>
          <p style={{
            fontFamily: fonts.mono, fontSize: 11, color: COLORS.accent,
            textTransform: "uppercase", letterSpacing: 2, marginBottom: 16, fontWeight: 600,
          }}>Research Survey</p>
          <h1 style={{
            fontFamily: fonts.heading, fontSize: 34, fontWeight: 500,
            color: COLORS.primary, margin: "0 0 16px", lineHeight: 1.3,
          }}>
            The GTM Tenure Study
          </h1>
          <p style={{
            fontFamily: fonts.body, fontSize: 16, color: COLORS.secondary,
            lineHeight: 1.7, margin: "0 0 12px", maxWidth: 480, marginLeft: "auto", marginRight: "auto",
          }}>
            There's plenty of opinion on why GTM leaders churn. There's almost no cross-functional data by stage. This survey aims to change that.
          </p>
          <p style={{
            fontFamily: fonts.body, fontSize: 14, color: COLORS.muted,
            lineHeight: 1.6, margin: "0 0 40px", maxWidth: 440, marginLeft: "auto", marginRight: "auto",
          }}>
            3–5 minutes. Anonymous by default. Your responses will inform original research on why GTM leader tenure follows structural patterns — and what to do about it.
          </p>

          <p style={{
            fontFamily: fonts.heading, fontSize: 16, fontWeight: 500,
            color: COLORS.primary, marginBottom: 20, fontStyle: "italic",
          }}>Which describes you?</p>

          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { id: "gtm", label: "I've held a GTM leadership role", sub: "VP+ in Growth, Sales, or Revenue" },
              { id: "founder", label: "I've hired GTM leaders", sub: "Founder, CEO, or Board member" },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setPath(opt.id)}
                style={{
                  flex: "1 1 220px", maxWidth: 260, padding: "28px 24px", background: COLORS.card,
                  border: `1.5px solid ${COLORS.border}`, borderRadius: 12, cursor: "pointer",
                  textAlign: "left", transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = COLORS.accent;
                  e.currentTarget.style.background = COLORS.accentLight;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = COLORS.border;
                  e.currentTarget.style.background = COLORS.card;
                }}
              >
                <div style={{
                  fontFamily: fonts.body, fontSize: 15.5, fontWeight: 500,
                  color: COLORS.primary, marginBottom: 6,
                }}>{opt.label}</div>
                <div style={{
                  fontFamily: fonts.body, fontSize: 13, color: COLORS.muted,
                }}>{opt.sub}</div>
              </button>
            ))}
          </div>

          <p style={{
            fontFamily: fonts.body, fontSize: 12, color: COLORS.muted,
            marginTop: 40, lineHeight: 1.5,
          }}>
            By Nick Talbert · <a href="https://strategnik.com" style={{ color: COLORS.accent, textDecoration: "none" }}>strategnik.com</a>
          </p>
        </div>
      </div>
    );
  }

  const renderGTMSection = () => {
    switch (section) {
      case 0:
        return (
          <>
            <Question number={1} label="What function were you leading?">
              <Radio name="function" options={FUNCTIONS} value={answers.function || ""} onChange={(v) => set("function", v)} other />
            </Question>
            <Question number={2} label="What was your title?">
              <Select options={TITLES_GTM} value={answers.title || ""} onChange={(v) => set("title", v)} placeholder="Select your title..." />
              {answers.title === "Other" && (
                <div style={{ marginTop: 8 }}>
                  <input type="text" placeholder="Your title..." value={answers.titleOther || ""}
                    onChange={(e) => set("titleOther", e.target.value)}
                    style={{ padding: "10px 14px", borderRadius: 8, border: `1.5px solid ${COLORS.border}`, fontFamily: fonts.body, fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" }}
                  />
                </div>
              )}
            </Question>
            <Question number={3} label="What stage was the company when you started?">
              <Radio name="stageStart" options={STAGES} value={answers.stageStart || ""} onChange={(v) => set("stageStart", v)} />
            </Question>
            <Question number={4} label="What stage was the company when you left (or is it now, if you're still there)?">
              <Radio name="stageEnd" options={STAGES} value={answers.stageEnd || ""} onChange={(v) => set("stageEnd", v)} />
            </Question>
          </>
        );
      case 1:
        return (
          <>
            <Question number={5} label="How long were you in the role?" sublabel="In months. If still in the role, how long so far.">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input type="number" min={1} max={240} value={answers.tenure || ""}
                  onChange={(e) => set("tenure", e.target.value)}
                  placeholder="e.g. 14"
                  style={{
                    padding: "12px 14px", borderRadius: 8, border: `1.5px solid ${COLORS.border}`,
                    fontFamily: fonts.body, fontSize: 15, width: 100, outline: "none",
                  }}
                />
                <span style={{ fontFamily: fonts.body, fontSize: 14, color: COLORS.muted }}>months</span>
              </div>
            </Question>
            <Question number={6} label="How did the role end?">
              <Radio name="outcome" options={OUTCOMES} value={answers.outcome || ""} onChange={(v) => set("outcome", v)} other />
            </Question>
            <Question number={7} label="What was the stated reason for departure?" sublabel="The official narrative — what was said in the all-hands or the announcement.">
              <Radio name="statedReason" options={STATED_REASONS} value={answers.statedReason || ""} onChange={(v) => set("statedReason", v)} other />
            </Question>
            <Question number={8} label="What do you think the real reason was?" sublabel="Be honest. This is the most valuable question in the survey.">
              <Radio name="realReason" options={REAL_REASONS} value={answers.realReason || ""} onChange={(v) => set("realReason", v)} other />
            </Question>
          </>
        );
      case 2:
        return (
          <>
            <Question number={9} label="What was the tooling / tech maturity when you arrived?" sublabel="CRM, attribution, reporting, RevOps infrastructure.">
              <Radio name="tooling" options={TOOLING_MATURITY} value={answers.tooling || ""} onChange={(v) => set("tooling", v)} />
            </Question>
            <Question number={10} label="Could you measure what mattered?" sublabel="Could you actually track the metrics that would prove your strategy was working?">
              <Radio name="measurement" options={MEASUREMENT} value={answers.measurement || ""} onChange={(v) => set("measurement", v)} />
            </Question>
            <Question number={11} label="How many channels / levers did you have?" sublabel="Growth channels, sales motions, partner programs — things you could actively work.">
              <Radio name="levers" options={LEVERS} value={answers.levers || ""} onChange={(v) => set("levers", v)} />
            </Question>
            <Question number={12} label="Did you build the stack or inherit it?">
              <Radio name="builtInherited" options={BUILT_OR_INHERITED} value={answers.builtInherited || ""} onChange={(v) => set("builtInherited", v)} />
            </Question>
          </>
        );
      case 3:
        return (
          <>
            <Question number={13} label="Compared to your predecessor, how different was the system you inherited?" sublabel="If you were the first GTM hire, select 'I don't know what my predecessor faced.'">
              <Radio name="systemChange" options={SYSTEM_CHANGE} value={answers.systemChange || ""} onChange={(v) => set("systemChange", v)} />
            </Question>
            <Question number={14} label="What do you wish the board or CEO had understood about the stage you were operating in?" sublabel="Open text. Say what you actually think.">
              <TextArea value={answers.wishBoard || ""} onChange={(v) => set("wishBoard", v)}
                placeholder="The thing you wanted to say in the exit interview but didn't..." rows={4} />
            </Question>
          </>
        );
      case 4:
        return (
          <>
            <Question number={15} label="Email address" sublabel="Optional. You'll receive the full analysis when published." required={false}>
              <input type="email" value={answers.email || ""} onChange={(e) => set("email", e.target.value)}
                placeholder="you@company.com"
                style={{
                  padding: "12px 14px", borderRadius: 8, border: `1.5px solid ${COLORS.border}`,
                  fontFamily: fonts.body, fontSize: 14.5, outline: "none", width: "100%", boxSizing: "border-box",
                }} />
            </Question>
            <Question number={16} label="Name and LinkedIn" sublabel="Optional. Only if you're open to a follow-up conversation." required={false}>
              <input type="text" value={answers.name || ""} onChange={(e) => set("name", e.target.value)}
                placeholder="Name"
                style={{
                  padding: "12px 14px", borderRadius: 8, border: `1.5px solid ${COLORS.border}`,
                  fontFamily: fonts.body, fontSize: 14.5, outline: "none", width: "100%", boxSizing: "border-box",
                  marginBottom: 8,
                }} />
              <input type="text" value={answers.linkedin || ""} onChange={(e) => set("linkedin", e.target.value)}
                placeholder="LinkedIn URL"
                style={{
                  padding: "12px 14px", borderRadius: 8, border: `1.5px solid ${COLORS.border}`,
                  fontFamily: fonts.body, fontSize: 14.5, outline: "none", width: "100%", boxSizing: "border-box",
                }} />
            </Question>
            <div style={{
              padding: "16px 20px", background: COLORS.accentLight, borderRadius: 10,
              fontFamily: fonts.body, fontSize: 13, color: COLORS.secondary, lineHeight: 1.6,
            }}>
              Responses are anonymous by default. If you provide your name, it will only be used to reach out for a follow-up conversation — never published without explicit permission.
            </div>
          </>
        );
      default: return null;
    }
  };

  const renderFounderSection = () => {
    switch (section) {
      case 0:
        return (
          <>
            <Question number={1} label="What stage is your company currently?">
              <Radio name="currentStage" options={STAGES} value={answers.currentStage || ""} onChange={(v) => set("currentStage", v)} />
            </Question>
            <Question number={2} label="Approximate company size (employees)?">
              <Select options={["1-10", "11-25", "26-50", "51-100", "101-250", "251-500", "500+"]} value={answers.companySize || ""} onChange={(v) => set("companySize", v)} placeholder="Select range..." />
            </Question>
          </>
        );
      case 1:
        return (
          <>
            <Question number={3} label="How many GTM leaders (VP+ growth or sales) has your company had in the last 3 years?">
              <Radio name="gtmCount" options={FOUNDER_GTM_COUNT} value={answers.gtmCount || ""} onChange={(v) => set("gtmCount", v)} />
            </Question>
            <Question number={4} label="Between hires, what changed?" sublabel="Select the option that best describes the pattern.">
              <Radio name="whatChanged" options={FOUNDER_WHAT_CHANGED} value={answers.whatChanged || ""} onChange={(v) => set("whatChanged", v)} other />
            </Question>
            <Question number={5} label="What did you measure your GTM leaders against?" sublabel="What defined success or failure.">
              <Radio name="measuredAgainst" options={FOUNDER_MEASURED} value={answers.measuredAgainst || ""} onChange={(v) => set("measuredAgainst", v)} other />
            </Question>
            <Question number={6} label="Looking back, were those the right metrics for the stage?" sublabel="Honest reflection.">
              <Radio name="rightMetrics" options={[
                "Yes — the metrics were appropriate and we gave enough time",
                "The metrics were right but the timeline was too short",
                "The metrics were wrong — we were measuring the wrong things",
                "We didn't have clear metrics — it was more gut feel",
                "I'm not sure in hindsight"
              ]} value={answers.rightMetrics || ""} onChange={(v) => set("rightMetrics", v)} />
            </Question>
          </>
        );
      case 2:
        return (
          <>
            <Question number={7} label="What do you wish your GTM leaders had understood about your constraints as a founder/CEO?" sublabel="Open text. The other side of the story.">
              <TextArea value={answers.founderWish || ""} onChange={(v) => set("founderWish", v)}
                placeholder="What you wanted them to understand but couldn't articulate at the time..." rows={4} />
            </Question>
            <Question number={8} label="If you could go back, what would you change about how you set up your first GTM leader for success?" required={false}>
              <TextArea value={answers.founderHindsight || ""} onChange={(v) => set("founderHindsight", v)}
                placeholder="Optional — but this is where the real insight often lives." rows={4} />
            </Question>
          </>
        );
      case 3:
        return (
          <>
            <Question number={9} label="Email address" sublabel="Optional. You'll receive the full analysis when published." required={false}>
              <input type="email" value={answers.email || ""} onChange={(e) => set("email", e.target.value)}
                placeholder="you@company.com"
                style={{
                  padding: "12px 14px", borderRadius: 8, border: `1.5px solid ${COLORS.border}`,
                  fontFamily: fonts.body, fontSize: 14.5, outline: "none", width: "100%", boxSizing: "border-box",
                }} />
            </Question>
            <Question number={10} label="Name and LinkedIn" sublabel="Optional. Only if you're open to a follow-up conversation." required={false}>
              <input type="text" value={answers.name || ""} onChange={(e) => set("name", e.target.value)}
                placeholder="Name"
                style={{
                  padding: "12px 14px", borderRadius: 8, border: `1.5px solid ${COLORS.border}`,
                  fontFamily: fonts.body, fontSize: 14.5, outline: "none", width: "100%", boxSizing: "border-box",
                  marginBottom: 8,
                }} />
              <input type="text" value={answers.linkedin || ""} onChange={(e) => set("linkedin", e.target.value)}
                placeholder="LinkedIn URL"
                style={{
                  padding: "12px 14px", borderRadius: 8, border: `1.5px solid ${COLORS.border}`,
                  fontFamily: fonts.body, fontSize: 14.5, outline: "none", width: "100%", boxSizing: "border-box",
                }} />
            </Question>
            <div style={{
              padding: "16px 20px", background: COLORS.accentLight, borderRadius: 10,
              fontFamily: fonts.body, fontSize: 13, color: COLORS.secondary, lineHeight: 1.6,
            }}>
              Responses are anonymous by default. If you provide your name, it will only be used to reach out for a follow-up conversation — never published without explicit permission.
            </div>
          </>
        );
      default: return null;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, padding: "40px 24px" }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => { if (section === 0) { setPath(null); setAnswers({}); } else setSection(section - 1); }}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontFamily: fonts.body, fontSize: 13, color: COLORS.muted,
              padding: "4px 0", display: "flex", alignItems: "center", gap: 4,
            }}>
            ← {section === 0 ? "Back" : "Previous"}
          </button>
          <span style={{
            fontFamily: fonts.mono, fontSize: 11, color: COLORS.muted, letterSpacing: 1,
          }}>
            {path === "gtm" ? "GTM LEADER" : "FOUNDER / CEO"} PATH
          </span>
        </div>

        <ProgressBar current={section + 1} total={totalSections} />

        <h2 style={{
          fontFamily: fonts.heading, fontSize: 24, fontWeight: 500,
          color: COLORS.primary, margin: "0 0 8px",
        }}>
          {sections[section]?.title}
        </h2>
        <div style={{
          height: 2, width: 40, background: COLORS.accent, borderRadius: 1,
          marginBottom: 32,
        }} />

        {path === "gtm" ? renderGTMSection() : renderFounderSection()}

        {error && (
          <div style={{
            padding: "12px 16px", background: "#FEE2E2", borderRadius: 8,
            fontFamily: fonts.body, fontSize: 14, color: COLORS.error, marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16, gap: 12 }}>
          {section < totalSections - 1 ? (
            <button
              disabled={!canAdvance()}
              onClick={() => setSection(section + 1)}
              style={{
                padding: "14px 32px", borderRadius: 10,
                background: canAdvance() ? COLORS.accent : COLORS.border,
                color: canAdvance() ? "#fff" : COLORS.muted,
                border: "none", cursor: canAdvance() ? "pointer" : "not-allowed",
                fontFamily: fonts.body, fontSize: 15, fontWeight: 500,
                transition: "all 0.15s ease",
              }}
            >
              Continue →
            </button>
          ) : (
            <button
              disabled={submitting}
              onClick={submitSurvey}
              style={{
                padding: "14px 32px", borderRadius: 10, background: COLORS.accent,
                color: "#fff", border: "none", cursor: submitting ? "wait" : "pointer",
                fontFamily: fonts.body, fontSize: 15, fontWeight: 500,
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? "Submitting..." : "Submit Response"}
            </button>
          )}
        </div>

        <p style={{
          fontFamily: fonts.body, fontSize: 12, color: COLORS.muted,
          textAlign: "center", marginTop: 48, lineHeight: 1.5,
        }}>
          The GTM Tenure Study · Nick Talbert · <a href="https://strategnik.com" style={{ color: COLORS.accent, textDecoration: "none" }}>strategnik.com</a>
        </p>
      </div>
    </div>
  );
}
