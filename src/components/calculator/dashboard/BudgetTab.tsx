import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Legend, ResponsiveContainer, ComposedChart, Line } from 'recharts';
import { useCalculator } from '../state/context';
import { Tooltip } from '../shared/Tooltip';
import { TOOLTIPS, UNIT_ECONOMICS_THRESHOLDS } from '../engine/defaults';
import type { TrafficLightStatus } from '../engine/types';

const COLORS = {
  frequency: '#3B82F6',  // blue
  cpl: '#06B6D4',        // cyan
  software: '#8B5CF6',   // purple
  agency: '#F59E0B',     // amber
  cumCost: '#DC2626',    // red line
  cumRevenue: '#10B981', // green line
};

function formatCurrency(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function getUnitEconStatus(metric: string, value: number): TrafficLightStatus {
  const t = UNIT_ECONOMICS_THRESHOLDS;
  if (metric === 'ltvCac') return value >= t.ltvCac.green ? 'green' : value >= t.ltvCac.amber ? 'amber' : 'red';
  if (metric === 'cacPayback') return value <= t.cacPaybackMonths.green ? 'green' : value <= t.cacPaybackMonths.amber ? 'amber' : 'red';
  if (metric === 'newCacRatio') return value <= t.newCacRatio.green ? 'green' : value <= t.newCacRatio.amber ? 'amber' : 'red';
  return 'green';
}

const STATUS_COLORS: Record<TrafficLightStatus, string> = {
  green: 'bg-green-50 border-green-200 text-green-700',
  amber: 'bg-amber-50 border-amber-200 text-amber-700',
  red: 'bg-red-50 border-red-200 text-red-700',
};

export function BudgetTab() {
  const { state } = useCalculator();
  const { quarterly } = state.outputs;
  const { summary } = state.outputs;
  const { unitEconomics } = summary;

  const budgetData = quarterly.map(q => ({
    name: q.quarterLabel,
    'Frequency Targeting': Math.round(q.frequencyCost),
    'CPL Lead Gen': Math.round(q.cplCost),
    Software: Math.round(q.softwareCost),
    Agency: Math.round(q.agencyCost),
  }));

  const crossoverData = quarterly.map(q => ({
    name: q.quarterLabel,
    'Cumulative Cost': q.cumulativeCost,
    'Cumulative Revenue': q.cumulativeRevenue,
  }));

  return (
    <div className="space-y-4">
      {/* Quarterly Budget Breakdown */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Quarterly Budget Breakdown</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={budgetData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={formatCurrency} />
              <RTooltip
                contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e7eb' }}
                formatter={(value: number) => [formatCurrency(value)]}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Frequency Targeting" stackId="a" fill={COLORS.frequency} />
              <Bar dataKey="CPL Lead Gen" stackId="a" fill={COLORS.cpl} />
              <Bar dataKey="Software" stackId="a" fill={COLORS.software} />
              <Bar dataKey="Agency" stackId="a" fill={COLORS.agency} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cumulative Spend vs Revenue */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Cumulative Investment vs. Revenue</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={crossoverData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={formatCurrency} />
              <RTooltip
                contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e7eb' }}
                formatter={(value: number) => [formatCurrency(value)]}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="Cumulative Cost" stroke={COLORS.cumCost} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Cumulative Revenue" stroke={COLORS.cumRevenue} strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="text-gray-500">Total Investment</div>
            <div className="font-semibold text-gray-900">{formatCurrency(summary.totalInvestment)}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="text-gray-500">Total Revenue</div>
            <div className="font-semibold text-gray-900">{formatCurrency(summary.totalRevenue)}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="text-gray-500">Effective CAC</div>
            <div className="font-semibold text-gray-900">{formatCurrency(summary.effectiveCAC)}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="text-gray-500">Freq:CPL Ratio</div>
            <div className="font-semibold text-gray-900">{summary.frequencyToCPLRatio.toFixed(1)}x</div>
          </div>
        </div>
      </div>

      {/* Unit Economics Card (PRD C.3) */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Unit Economics
          <span className="text-[10px] font-normal text-gray-400 ml-2">Can we afford to buy this revenue?</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {/* LTV:CAC */}
          <div className={`rounded-lg border p-3 ${STATUS_COLORS[getUnitEconStatus('ltvCac', unitEconomics.ltvCacRatio)]}`}>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-medium uppercase tracking-wider opacity-70">LTV:CAC</span>
              <Tooltip content={TOOLTIPS.ltvCac}>
                <span className="text-[9px] opacity-50 cursor-help">?</span>
              </Tooltip>
            </div>
            <div className="text-xl font-light mt-1">
              {unitEconomics.ltvCacRatio > 0 ? `${unitEconomics.ltvCacRatio.toFixed(1)}:1` : '\u2014'}
            </div>
            <div className="text-[10px] opacity-70 mt-0.5">
              {getUnitEconStatus('ltvCac', unitEconomics.ltvCacRatio) === 'green' && 'Sustainable'}
              {getUnitEconStatus('ltvCac', unitEconomics.ltvCacRatio) === 'amber' && 'Stretched'}
              {getUnitEconStatus('ltvCac', unitEconomics.ltvCacRatio) === 'red' && 'Unsustainable'}
            </div>
          </div>

          {/* CAC Payback */}
          <div className={`rounded-lg border p-3 ${STATUS_COLORS[getUnitEconStatus('cacPayback', unitEconomics.cacPaybackMonths)]}`}>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-medium uppercase tracking-wider opacity-70">CAC Payback</span>
              <Tooltip content={TOOLTIPS.cacPayback}>
                <span className="text-[9px] opacity-50 cursor-help">?</span>
              </Tooltip>
            </div>
            <div className="text-xl font-light mt-1">
              {unitEconomics.cacPaybackMonths > 0 ? `${Math.round(unitEconomics.cacPaybackMonths)}mo` : '\u2014'}
            </div>
            <div className="text-[10px] opacity-70 mt-0.5">
              {getUnitEconStatus('cacPayback', unitEconomics.cacPaybackMonths) === 'green' && 'Strong'}
              {getUnitEconStatus('cacPayback', unitEconomics.cacPaybackMonths) === 'amber' && 'Moderate'}
              {getUnitEconStatus('cacPayback', unitEconomics.cacPaybackMonths) === 'red' && 'Too long'}
            </div>
          </div>

          {/* New CAC Ratio */}
          <div className={`rounded-lg border p-3 ${STATUS_COLORS[getUnitEconStatus('newCacRatio', unitEconomics.newCacRatio)]}`}>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-medium uppercase tracking-wider opacity-70">New CAC Ratio</span>
              <Tooltip content={TOOLTIPS.newCacRatio}>
                <span className="text-[9px] opacity-50 cursor-help">?</span>
              </Tooltip>
            </div>
            <div className="text-xl font-light mt-1">
              {unitEconomics.newCacRatio > 0 ? `$${unitEconomics.newCacRatio.toFixed(2)}` : '\u2014'}
            </div>
            <div className="text-[10px] opacity-70 mt-0.5">
              {getUnitEconStatus('newCacRatio', unitEconomics.newCacRatio) === 'green' && 'Efficient'}
              {getUnitEconStatus('newCacRatio', unitEconomics.newCacRatio) === 'amber' && 'Typical'}
              {getUnitEconStatus('newCacRatio', unitEconomics.newCacRatio) === 'red' && 'Inefficient'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
