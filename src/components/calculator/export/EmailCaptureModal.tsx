import { useState } from 'react';
import { Modal } from '../shared/Modal';
import { useCalculator } from '../state/context';

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

      // Cover page
      doc.setFontSize(28);
      doc.setTextColor(17, 17, 17);
      doc.text('Funnel Velocity Analysis', 20, 50);
      doc.setFontSize(12);
      doc.setTextColor(107, 107, 107);
      if (firstName) doc.text(`Prepared for ${firstName}`, 20, 65);
      doc.text(new Date().toLocaleDateString(), 20, 75);
      doc.setFontSize(10);
      doc.text('strategnik.com', 20, 260);

      // Summary page
      doc.addPage();
      doc.setFontSize(18);
      doc.setTextColor(17, 17, 17);
      doc.text('Executive Summary', 20, 30);

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
      ];
      summaryLines.forEach((line, i) => {
        doc.text(line, 20, 50 + i * 12);
      });

      // Data table page
      doc.addPage();
      doc.setFontSize(18);
      doc.setTextColor(17, 17, 17);
      doc.text('Quarterly Data', 20, 30);

      doc.setFontSize(7);
      const headers = ['Quarter', 'Leads', 'MQLs', 'Opps', 'Won', 'Revenue', 'Total Cost'];
      const colW = 25;
      headers.forEach((h, i) => {
        doc.setTextColor(107, 107, 107);
        doc.text(h, 20 + i * colW, 45);
      });

      quarterly.forEach((q, i) => {
        const y = 52 + i * 8;
        if (y > 270) return; // Don't overflow page
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
        vals.forEach((v, j) => doc.text(v, 20 + j * colW, y));
      });

      // Disclaimer page
      doc.addPage();
      doc.setFontSize(18);
      doc.setTextColor(17, 17, 17);
      doc.text('Assumptions & Methodology', 20, 30);
      doc.setFontSize(8);
      doc.setTextColor(107, 107, 107);
      const disclaimer = 'This calculator is a planning tool that models B2B marketing funnel dynamics using adjustable assumptions. Default values are based on typical mid-market B2B SaaS patterns and do not constitute financial advice, revenue projections, or guaranteed outcomes. Actual results vary significantly by industry, deal size, sales cycle, team capabilities, and market conditions.';
      const lines = doc.splitTextToSize(disclaimer, 170);
      doc.text(lines, 20, 45);
      doc.setFontSize(9);
      doc.setTextColor(17, 17, 17);
      doc.text('Built by Nick Talbert / Strategnik', 20, 80);
      doc.text('strategnik.com', 20, 88);

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
