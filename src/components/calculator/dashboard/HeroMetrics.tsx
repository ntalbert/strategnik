import { useCalculator } from '../state/context';
import { Tooltip } from '../shared/Tooltip';
import { TOOLTIPS } from '../engine/defaults';

function formatCurrency(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function getTrafficLight(metric: string, value: number | null, state: any): { color: string; label: string } {
  if (metric === 'firstRevenue') {
    if (value === null) return { color: 'text-red-600 bg-red-50', label: 'At Risk' };
    if (value > 5) return { color: 'text-red-600 bg-red-50', label: 'At Risk' };
    if (value > 3) return { color: 'text-amber-600 bg-amber-50', label: 'Watch' };
    return { color: 'text-green-600 bg-green-50', label: 'On Track' };
  }
  if (metric === 'investment') {
    const roi = state.outputs.summary.roi;
    if (roi > 2) return { color: 'text-green-600 bg-green-50', label: 'Strong ROI' };
    if (roi > 0) return { color: 'text-amber-600 bg-amber-50', label: 'Positive' };
    return { color: 'text-red-600 bg-red-50', label: 'Investing' };
  }
  if (metric === 'trueCPL') {
    if (value !== null && value < 5000) return { color: 'text-green-600 bg-green-50', label: 'Efficient' };
    if (value !== null && value < 8000) return { color: 'text-amber-600 bg-amber-50', label: 'Typical' };
    return { color: 'text-red-600 bg-red-50', label: 'High' };
  }
  return { color: 'text-gray-600 bg-gray-50', label: '' };
}

export function HeroMetrics() {
  const { state } = useCalculator();
  const { summary } = state.outputs;

  // Investment period: quarters from first spend to first revenue (PRD C.1)
  const investmentPeriodQ = summary.firstRevenueQuarter !== null
    ? summary.firstRevenueQuarter + 1
    : null;

  const metrics = [
    {
      id: 'firstRevenue',
      label: 'First Revenue',
      value: summary.firstRevenueQuarterLabel,
      sub: investmentPeriodQ !== null
        ? `${investmentPeriodQ}Q investment period \u00B7 ${formatCurrency(summary.firstRevenueAmount)}`
        : 'No revenue within model horizon',
      tooltip: TOOLTIPS.investmentPeriod,
      traffic: getTrafficLight('firstRevenue', summary.firstRevenueQuarter, state),
    },
    {
      id: 'investment',
      label: 'Total Investment',
      value: formatCurrency(summary.totalInvestment),
      sub: `ROI: ${(summary.roi * 100).toFixed(0)}%`,
      tooltip: TOOLTIPS.cumulativeRevenueVsSpend,
      traffic: getTrafficLight('investment', summary.totalInvestment, state),
    },
    {
      id: 'trueCPL',
      label: 'True CPL',
      value: formatCurrency(summary.trueCPL),
      sub: `${summary.frequencyToCPLRatio.toFixed(1)}x freq:CPL ratio`,
      tooltip: TOOLTIPS.trueCPL,
      traffic: getTrafficLight('trueCPL', summary.trueCPL, state),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
      {metrics.map((m) => (
        <div key={m.id} className={`rounded-xl border border-gray-100 p-4 ${m.traffic.color}`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-medium uppercase tracking-wider opacity-70">
              {m.label}
            </span>
            <Tooltip content={m.tooltip}>
              <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${m.traffic.color}`}>
                {m.traffic.label}
              </span>
            </Tooltip>
          </div>
          <div className="text-2xl font-light tracking-tight text-gray-900">
            {m.value}
          </div>
          {m.sub && (
            <div className="text-xs text-gray-500 mt-0.5">{m.sub}</div>
          )}
        </div>
      ))}
    </div>
  );
}
