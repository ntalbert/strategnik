import { useState } from 'react';
import { Modal } from '../shared/Modal';
import { useCalculator } from '../state/context';
import { UNIT_ECONOMICS_THRESHOLDS } from '../engine/defaults';
import type { TrafficLightStatus } from '../engine/types';

function getUnitEconLabel(metric: string, value: number): string {
  const t = UNIT_ECONOMICS_THRESHOLDS;
  let status: TrafficLightStatus;
  if (metric === 'ltvCac') status = value >= t.ltvCac.green ? 'green' : value >= t.ltvCac.amber ? 'amber' : 'red';
  else if (metric === 'cacPayback') status = value <= t.cacPaybackMonths.green ? 'green' : value <= t.cacPaybackMonths.amber ? 'amber' : 'red';
  else status = value <= t.newCacRatio.green ? 'green' : value <= t.newCacRatio.amber ? 'amber' : 'red';

  const labels: Record<TrafficLightStatus, string> = { green: 'HEALTHY', amber: 'WATCH', red: 'AT RISK' };
  return labels[status];
}

export function EmailCaptureModal() {
  const { state, dispatch } = useCalculator();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!firstName.trim()) {
      setError('Please enter your first name.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit lead data
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          first_name: firstName,
          company,
          role,
          source: 'funnel_calculator',
          scenario_name: 'Scenario',
          cohort_count: state.inputs.cohorts.length,
          arr_goal: state.inputs.goals.arrGoal,
          asp: state.inputs.goals.averageSellingPrice,
          true_cpl: state.outputs.summary.trueCPL,
          campaign_profiles: state.inputs.cohorts.map(c => c.profileId),
          ltv_cac_ratio: state.outputs.summary.unitEconomics.ltvCacRatio,
          cac_payback_months: state.outputs.summary.unitEconomics.cacPaybackMonths,
          new_cac_ratio: state.outputs.summary.unitEconomics.newCacRatio,
        }),
      });

      // Generate PDF regardless of API success
      generateAndDownloadPDF();
      dispatch({ type: 'HIDE_EMAIL_CAPTURE' });

      // Mark as captured for this session
      try { localStorage.setItem('strategnik_calc_lead_captured', '1'); } catch {}
    } catch {
      // Still generate PDF even if lead capture fails
      generateAndDownloadPDF();
      dispatch({ type: 'HIDE_EMAIL_CAPTURE' });
    }
  };

  const generateAndDownloadPDF = () => {
    // Dynamic import to avoid loading jsPDF until needed
    import('jspdf').then(({ default: jsPDF }) => {
      const doc = new jsPDF();
      const { summary } = state.outputs;
      const { quarterly } = state.outputs;
      const { inputs } = state;
      const { unitEconomics } = summary;
      const pageW = 210; // A4 width in mm
      const margin = 20;
      const contentW = pageW - 2 * margin;

      // === PAGE 1: Cover ===
      doc.setFontSize(28);
      doc.setTextColor(17, 17, 17);
      doc.text('Funnel Velocity Analysis', margin, 50);
      doc.setFontSize(12);
      doc.setTextColor(107, 107, 107);
      if (firstName) doc.text(`Prepared for ${firstName}`, margin, 65);
      if (company) doc.text(company, margin, 75);
      doc.text(new Date().toLocaleDateString(), margin, company ? 85 : 75);
      doc.setFontSize(10);
      doc.text('strategnik.com', margin, 260);

      // === PAGE 2: Executive Summary ===
      doc.addPage();
      doc.setFontSize(18);
      doc.setTextColor(17, 17, 17);
      doc.text('Executive Summary', margin, 30);

      doc.setFontSize(11);
      doc.setTextColor(107, 107, 107);
      const summaryLines = [
        `First Revenue: ${summary.firstRevenueQuarterLabel}`,
        `Total Investment: $${Math.round(summary.totalInvestment).toLocaleString()}`,
        `Total Revenue: $${Math.round(summary.totalRevenue).toLocaleString()}`,
        `True CPL: $${Math.round(summary.trueCPL).toLocaleString()}`,
        `Effective CAC: $${Math.round(summary.effectiveCAC).toLocaleString()}`,
        `ROI: ${(summary.roi * 100).toFixed(0)}%`,
        `Progress to Goal: ${(summary.progressToGoal * 100).toFixed(0)}%`,
        `Sales Velocity: ${Math.round(summary.currentSalesVelocity)} days`,
        `Days Saved: ${Math.round(summary.daysSavedVsBaseline)} days`,
        '', // spacer
        `LTV:CAC Ratio: ${unitEconomics.ltvCacRatio.toFixed(1)}:1 [${getUnitEconLabel('ltvCac', unitEconomics.ltvCacRatio)}]`,
        `CAC Payback: ${Math.round(unitEconomics.cacPaybackMonths)} months [${getUnitEconLabel('cacPayback', unitEconomics.cacPaybackMonths)}]`,
        `New CAC Ratio: $${unitEconomics.newCacRatio.toFixed(2)} per $1 ARR [${getUnitEconLabel('newCacRatio', unitEconomics.newCacRatio)}]`,
      ];
      summaryLines.forEach((line, i) => {
        doc.text(line, margin, 50 + i * 12);
      });

      // === PAGE 3: How B2B Marketing Works (PRD B.2) ===
      doc.addPage();
      doc.setFontSize(18);
      doc.setTextColor(17, 17, 17);
      doc.text('How B2B Marketing Actually Works', margin, 30);

      let y = 48;

      // Zone 1: Trigger Model
      doc.setFontSize(12);
      doc.setTextColor(17, 17, 17);
      doc.text('The Trigger Model', margin, y);
      y += 10;
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      const triggerText = 'Every dollar spent on B2B marketing performs one function: it triggers a prospect to seek more information. Not to buy. Not to talk to sales. To look something up. A display ad triggers a Google search. A cold email triggers a visit to a competitor comparison page. A conference booth triggers a case study download.';
      const triggerLines = doc.splitTextToSize(triggerText, contentW);
      doc.text(triggerLines, margin, y);
      y += triggerLines.length * 4.5 + 6;

      // The flow
      doc.setFontSize(10);
      doc.setTextColor(17, 17, 17);
      doc.text('TRIGGER  \u2192  INFORMATION SEEKING  \u2192  SALES CONVERSATION', margin, y);
      y += 6;
      doc.setFontSize(8);
      doc.setTextColor(107, 107, 107);
      doc.text('(Marketing dollars)       (Prospect researches)         (Only after bridge is crossed)', margin, y);
      y += 12;

      // Critical annotation
      doc.setFontSize(9);
      doc.setTextColor(146, 64, 14); // amber-800
      const bridgeWarning = 'Without case studies, reviews, product descriptions, explainers, and competitive content in-market, triggers become expensive noise with no follow-up.';
      const bridgeLines = doc.splitTextToSize(bridgeWarning, contentW);
      doc.text(bridgeLines, margin, y);
      y += bridgeLines.length * 4.5 + 10;

      // Zone 2: Sustained vs Spikes
      doc.setFontSize(12);
      doc.setTextColor(17, 17, 17);
      doc.text('Sustained Presence vs. Campaign Spikes', margin, y);
      y += 10;
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      const sustainedText = 'Sustained Presence: Consistent trigger activity across all quarters. Gradually rising conversion. Revenue compounds. The funnel builds hydraulic pressure over time.\n\nCampaign Spikes: Sharp activity bursts with near-zero between. Conversion never builds momentum. Brand awareness resets. Prospects move to competitors who stayed present.';
      const sustainedLines = doc.splitTextToSize(sustainedText, contentW);
      doc.text(sustainedLines, margin, y);
      y += sustainedLines.length * 4.5 + 8;

      doc.setFontSize(8);
      doc.setTextColor(107, 107, 107);
      const hydraulicText = 'Marketing is not a rifle \u2014 it\'s a hydraulic system. Sustained pressure moves accounts through the funnel. Turn the pump off and pressure resets to zero. You don\'t resume from where you stopped; you rebuild from scratch.';
      const hydraulicLines = doc.splitTextToSize(hydraulicText, contentW);
      doc.text(hydraulicLines, margin, y);
      y += hydraulicLines.length * 4.5 + 10;

      // Zone 3: Context Statement
      doc.setFontSize(10);
      doc.setTextColor(17, 17, 17);
      doc.text('What This Report Shows', margin, y);
      y += 8;
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      const contextText = 'The data on the following pages models what to expect when you begin sustained marketing investment. The projected lag between spending and revenue is the characteristic shape of B2B sales cycles when marketing dollars function as triggers, not direct revenue generators. The numbers assume sustained investment and a functional information bridge.';
      const contextLines = doc.splitTextToSize(contextText, contentW);
      doc.text(contextLines, margin, y);
      y += contextLines.length * 4.5 + 10;

      // Zone 4: Information Bridge Checklist
      doc.setFontSize(10);
      doc.setTextColor(17, 17, 17);
      doc.text('Information Bridge Readiness Checklist', margin, y);
      y += 8;
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      const checklist = [
        ['\u25A1  Category Awareness', '"What is this category?" \u2192 Analyst reports, explainers, comparison pages'],
        ['\u25A1  Product Understanding', '"What does this do?" \u2192 Product pages, architecture diagrams, demo videos'],
        ['\u25A1  Social Proof', '"Has anyone like me used this?" \u2192 Case studies, G2/Gartner reviews, customer logos'],
        ['\u25A1  Competitive Positioning', '"How is this different?" \u2192 Competitive teardowns, migration guides'],
        ['\u25A1  Internal Justification', '"How do I get approval?" \u2192 Business case templates, ROI frameworks'],
      ];
      checklist.forEach(([label, desc]) => {
        doc.setTextColor(17, 17, 17);
        doc.text(label, margin, y);
        y += 4;
        doc.setTextColor(107, 107, 107);
        const descLines = doc.splitTextToSize(desc, contentW - 5);
        doc.text(descLines, margin + 5, y);
        y += descLines.length * 4 + 4;
      });

      y += 4;
      doc.setFontSize(7);
      doc.setTextColor(146, 64, 14);
      const checklistFooter = 'Every unchecked row is a leak in your funnel. The conversion rates in this report assume all five categories are addressed.';
      const footerLines = doc.splitTextToSize(checklistFooter, contentW);
      doc.text(footerLines, margin, y);

      // === PAGE 4: Your Inputs (PRD B.3) ===
      doc.addPage();
      doc.setFontSize(18);
      doc.setTextColor(17, 17, 17);
      doc.text('Your Inputs', margin, 30);
      doc.setFontSize(8);
      doc.setTextColor(107, 107, 107);
      doc.text(`Configuration date: ${new Date().toLocaleDateString()}`, margin, 38);

      y = 50;
      const col1 = margin;
      const col2 = 112;

      // Left column: Goals & Cohorts
      doc.setFontSize(10);
      doc.setTextColor(17, 17, 17);
      doc.text('Goals & Economics', col1, y);
      y += 8;
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      const goalLines = [
        `ARR Goal: $${Math.round(inputs.goals.arrGoal).toLocaleString()}`,
        `Average Selling Price: $${Math.round(inputs.goals.averageSellingPrice).toLocaleString()}`,
        `Model Horizon: ${inputs.simulationQuarters} quarters`,
        `Start: Q${inputs.startQ} ${inputs.startYear}`,
      ];
      goalLines.forEach((line, i) => {
        doc.text(line, col1, y + i * 6);
      });

      y += goalLines.length * 6 + 6;
      doc.setFontSize(10);
      doc.setTextColor(17, 17, 17);
      doc.text(`Cohorts (${inputs.cohorts.length})`, col1, y);
      y += 8;
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      inputs.cohorts.forEach((cohort, i) => {
        doc.text(`${cohort.name}: ${cohort.totalAccounts} accounts \u00B7 ${cohort.profileId.toUpperCase()} \u00B7 Q+${cohort.startQuarter}`, col1, y);
        y += 6;
      });

      // Right column: Budget & Advanced
      let yRight = 50;
      doc.setFontSize(10);
      doc.setTextColor(17, 17, 17);
      doc.text('Budget', col2, yRight);
      yRight += 8;
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      const budgetLines = [
        `Blended CPL: $${inputs.budget.blendedCPL}${inputs.userOverrides?.blendedCPL ? ' (custom)' : ' (ASP-adjusted)'}`,
        `Monthly Frequency: ${inputs.budget.frequencyConfig.monthlyFrequency} touches`,
        `Cost per Touch: $${inputs.budget.frequencyConfig.costPerTouch.toFixed(2)}`,
        `Quarterly Software: $${Math.round(inputs.budget.softwareCostPerQuarter).toLocaleString()}`,
        `Content Production: ${inputs.budget.inHouseCreative ? 'In-House (12%)' : `Outsourced (${(inputs.budget.agencyPercent * 100).toFixed(0)}%)`}`,
      ];
      budgetLines.forEach((line, i) => {
        doc.text(line, col2, yRight + i * 6);
      });

      yRight += budgetLines.length * 6 + 6;
      doc.setFontSize(10);
      doc.setTextColor(17, 17, 17);
      doc.text('Advanced', col2, yRight);
      yRight += 8;
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      const advancedLines = [
        `Sales Velocity: ${inputs.advanced.salesVelocityDays}d${inputs.userOverrides?.salesVelocityDays ? ' (custom)' : ' (ASP-adjusted)'}`,
        `Quarterly Dropout: ${(inputs.advanced.quarterlyDropoutRate * 100).toFixed(0)}%`,
        `Max Velocity Improvement: ${(inputs.advanced.maxVelocityImprovement * 100).toFixed(0)}%`,
      ];
      advancedLines.forEach((line, i) => {
        doc.text(line, col2, yRight + i * 6);
      });

      // === PAGE 5: Quarterly Data Table ===
      doc.addPage();
      doc.setFontSize(18);
      doc.setTextColor(17, 17, 17);
      doc.text('Quarterly Data', margin, 30);

      doc.setFontSize(7);
      const headers = ['Quarter', 'Leads', 'MQLs', 'Opps', 'Won', 'Revenue', 'Total Cost'];
      const colW = 25;
      headers.forEach((h, i) => {
        doc.setTextColor(107, 107, 107);
        doc.text(h, margin + i * colW, 45);
      });

      quarterly.forEach((q, i) => {
        const tableY = 52 + i * 8;
        if (tableY > 270) return; // Don't overflow page
        doc.setTextColor(17, 17, 17);
        const vals = [
          q.quarterLabel,
          q.leads.toFixed(0),
          q.mqls.toFixed(0),
          q.opportunities.toFixed(0),
          q.closedWon.toFixed(1),
          `$${Math.round(q.revenue).toLocaleString()}`,
          `$${Math.round(q.totalCost).toLocaleString()}`,
        ];
        vals.forEach((v, j) => doc.text(v, margin + j * colW, tableY));
      });

      // === PAGE 6: Unit Economics (PRD B.4) ===
      doc.addPage();
      doc.setFontSize(18);
      doc.setTextColor(17, 17, 17);
      doc.text('Unit Economics', margin, 30);
      doc.setFontSize(9);
      doc.setTextColor(107, 107, 107);
      doc.text('Can we afford to buy this revenue?', margin, 39);

      y = 52;
      doc.setFontSize(10);
      doc.setTextColor(17, 17, 17);

      const econMetrics = [
        { label: 'LTV:CAC Ratio', value: `${unitEconomics.ltvCacRatio.toFixed(1)}:1`, status: getUnitEconLabel('ltvCac', unitEconomics.ltvCacRatio), desc: `LTV = $${Math.round(unitEconomics.ltv).toLocaleString()} | CAC = $${Math.round(unitEconomics.cac).toLocaleString()} | Target: 3:1 minimum` },
        { label: 'CAC Payback', value: `${Math.round(unitEconomics.cacPaybackMonths)} months`, status: getUnitEconLabel('cacPayback', unitEconomics.cacPaybackMonths), desc: 'Months to recover acquisition cost from gross profit. Target: <18 months.' },
        { label: 'New CAC Ratio', value: `$${unitEconomics.newCacRatio.toFixed(2)} per $1 ARR`, status: getUnitEconLabel('newCacRatio', unitEconomics.newCacRatio), desc: 'Total S&M spend per $1 new ARR. Industry median: $2.00. Target: <$1.50.' },
      ];

      econMetrics.forEach(m => {
        doc.setFontSize(10);
        doc.setTextColor(17, 17, 17);
        doc.text(`${m.label}: ${m.value}`, margin, y);
        doc.setFontSize(8);
        doc.setTextColor(107, 107, 107);
        doc.text(`[${m.status}] ${m.desc}`, margin, y + 6);
        y += 18;
      });

      // Assumptions
      y += 6;
      doc.setFontSize(8);
      doc.setTextColor(107, 107, 107);
      doc.text(`Assumptions: ${(unitEconomics.grossMargin * 100).toFixed(0)}% gross margin, ${(unitEconomics.annualChurnRate * 100).toFixed(0)}% annual churn`, margin, y);

      // Trap warnings if any
      if (summary.trapWarnings.length > 0) {
        y += 16;
        doc.setFontSize(10);
        doc.setTextColor(146, 64, 14);
        doc.text('Model Warnings', margin, y);
        y += 8;
        doc.setFontSize(8);
        summary.trapWarnings.forEach(trap => {
          const warnLines = doc.splitTextToSize(`\u26A0 ${trap.message}`, contentW);
          doc.text(warnLines, margin, y);
          y += warnLines.length * 4.5 + 4;
        });
      }

      // === PAGE 7: Assumptions & Methodology ===
      doc.addPage();
      doc.setFontSize(18);
      doc.setTextColor(17, 17, 17);
      doc.text('Assumptions & Methodology', margin, 30);

      y = 48;
      doc.setFontSize(8);
      doc.setTextColor(107, 107, 107);
      const disclaimer = 'This calculator is a planning tool that models B2B marketing funnel dynamics using adjustable assumptions. Default values are based on typical mid-market B2B SaaS patterns and do not constitute financial advice, revenue projections, or guaranteed outcomes. Actual results vary significantly by industry, deal size, sales cycle, team capabilities, and market conditions.';
      const disclaimerLines = doc.splitTextToSize(disclaimer, contentW);
      doc.text(disclaimerLines, margin, y);
      y += disclaimerLines.length * 4.5 + 6;

      const sustainedDisclaimer = 'This model assumes sustained marketing investment with functional supporting content in-market. If the information ecosystem is incomplete, conversion rates and velocity will be materially lower than modeled. Campaign-spike models with periods of zero activity will produce worse outcomes than the sustained-pressure model shown here.';
      const sustainedLines2 = doc.splitTextToSize(sustainedDisclaimer, contentW);
      doc.text(sustainedLines2, margin, y);
      y += sustainedLines2.length * 4.5 + 12;

      // Revenue Return Benchmarks (PRD 4.11.5)
      doc.setFontSize(10);
      doc.setTextColor(17, 17, 17);
      doc.text('Revenue Return Benchmarks for Growth-Stage B2B SaaS', margin, y);
      y += 10;
      doc.setFontSize(7);
      doc.setTextColor(80, 80, 80);

      const benchmarks = [
        ['First-year ARR per $1 S&M spend', '1x\u20132x common. Best-in-class: 2x+. Below 1x indicates issues.'],
        ['Marketing-sourced pipeline multiple', '3\u20135x pipeline per marketing dollar. 30\u201360% of new ARR.'],
        ['Marketing spend as % of revenue', '10\u201325% typical. VC-backed: 47% of S&M. PE-backed: 33%.'],
        ['Proportional scaling', 'If spend +20%, revenue should grow at least proportionally.'],
      ];

      benchmarks.forEach(([label, desc]) => {
        doc.setTextColor(17, 17, 17);
        doc.text(label, margin, y);
        y += 4;
        doc.setTextColor(107, 107, 107);
        const descLines2 = doc.splitTextToSize(desc, contentW);
        doc.text(descLines2, margin, y);
        y += descLines2.length * 3.5 + 5;
      });

      y += 10;
      doc.setFontSize(8);
      doc.setTextColor(107, 107, 107);
      doc.text('ASP-linked scaling based on: Optifai (N=847, 2025), Winning by Design (2023),', margin, y);
      doc.text('Ebsta/Pavilion (4.2M opportunities, 2024), HubSpot (2024 Sales Trends).', margin, y + 5);

      y += 18;
      doc.setFontSize(9);
      doc.setTextColor(17, 17, 17);
      doc.text('Built by Nick Talbert / Strategnik', margin, y);
      doc.text('strategnik.com', margin, y + 8);

      doc.save('funnel-velocity-analysis.pdf');
    });
  };

  // Check if already captured this session
  let alreadyCaptured = false;
  try { alreadyCaptured = !!localStorage.getItem('strategnik_calc_lead_captured'); } catch {}

  if (alreadyCaptured) {
    // Skip form, generate directly
    if (state.ui.showEmailCapture) {
      generateAndDownloadPDF();
      dispatch({ type: 'HIDE_EMAIL_CAPTURE' });
    }
    return null;
  }

  return (
    <Modal
      isOpen={state.ui.showEmailCapture}
      onClose={() => dispatch({ type: 'HIDE_EMAIL_CAPTURE' })}
      title="Get your branded report"
    >
      <p className="text-sm text-gray-500 mb-4">
        Enter your details below and we'll generate a presentation-ready PDF of your scenario.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Work Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full h-9 px-3 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="you@company.com"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">First Name *</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="w-full h-9 px-3 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Company</label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full h-9 px-3 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full h-9 px-3 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select your role</option>
            <option value="VP/CMO Marketing">VP/CMO Marketing</option>
            <option value="Marketing Ops/RevOps">Marketing Ops/RevOps</option>
            <option value="CEO/CFO">CEO/CFO</option>
            <option value="Consultant/Agency">Consultant/Agency</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-10 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Generating...' : 'Generate Report'}
        </button>

        <p className="text-[10px] text-gray-400 text-center">
          By submitting, you agree to receive occasional emails about B2B marketing strategy from Strategnik. Unsubscribe anytime.{' '}
          <a href="/privacy" className="underline">Privacy Policy</a>
        </p>
      </form>
    </Modal>
  );
}
