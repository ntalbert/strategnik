import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Legend, ResponsiveContainer, Line, ComposedChart, ReferenceArea } from 'recharts';
import { useCalculator } from '../state/context';

const COLORS = {
  leads: '#3B82F6',      // blue
  mqls: '#10B981',       // green
  opportunities: '#F59E0B', // amber
  closedWon: '#8B5CF6',  // purple
  revenue: '#EC4899',     // pink (line)
};

function formatNum(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toFixed(0);
}

function formatCurrency(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

export function TimelineTab() {
  const { state } = useCalculator();
  const { quarterly } = state.outputs;
  const { summary } = state.outputs;
  const { arrGoal } = state.inputs.goals;

  const chartData = quarterly.map(q => ({
    name: q.quarterLabel,
    Leads: parseFloat(q.leads.toFixed(1)),
    MQLs: parseFloat(q.mqls.toFixed(1)),
    Opportunities: parseFloat(q.opportunities.toFixed(1)),
    'Closed Won': parseFloat(q.closedWon.toFixed(2)),
    'Cum. Revenue': q.cumulativeRevenue,
  }));

  // Investment period boundaries for shading (PRD C.2)
  const firstRevIdx = summary.firstRevenueQuarter;
  const investmentPeriodStart = quarterly.length > 0 ? quarterly[0].quarterLabel : null;
  const investmentPeriodEnd = firstRevIdx !== null && firstRevIdx < quarterly.length
    ? quarterly[firstRevIdx].quarterLabel
    : null;

  return (
    <div className="space-y-4">
      {/* Funnel Volume Chart */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Funnel Volume by Quarter</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={formatNum} />
              <RTooltip
                contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e7eb' }}
                formatter={(value: number, name: string) => [formatNum(value), name]}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {/* Investment Period Shading (PRD C.2) */}
              {investmentPeriodStart && investmentPeriodEnd && firstRevIdx !== null && firstRevIdx > 0 && (
                <ReferenceArea
                  x1={investmentPeriodStart}
                  x2={investmentPeriodEnd}
                  fill="#FEF3C7"
                  fillOpacity={0.4}
                  label={{ value: 'Investment Period', position: 'insideTop', fontSize: 9, fill: '#92400E' }}
                />
              )}
              <Area type="monotone" dataKey="Leads" stackId="1" fill={COLORS.leads} stroke={COLORS.leads} fillOpacity={0.6} />
              <Area type="monotone" dataKey="MQLs" stackId="1" fill={COLORS.mqls} stroke={COLORS.mqls} fillOpacity={0.6} />
              <Area type="monotone" dataKey="Opportunities" stackId="1" fill={COLORS.opportunities} stroke={COLORS.opportunities} fillOpacity={0.6} />
              <Area type="monotone" dataKey="Closed Won" stackId="1" fill={COLORS.closedWon} stroke={COLORS.closedWon} fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cumulative Revenue vs Goal */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Cumulative Revenue vs. Goal</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={formatCurrency} />
              <RTooltip
                contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e7eb' }}
                formatter={(value: number) => [formatCurrency(value)]}
              />
              <Area type="monotone" dataKey="Cum. Revenue" fill={COLORS.revenue} stroke={COLORS.revenue} fillOpacity={0.2} />
              {/* Goal reference line */}
              <Line
                type="monotone"
                dataKey={() => arrGoal}
                stroke="#DC2626"
                strokeDasharray="5 5"
                strokeWidth={1.5}
                dot={false}
                name="ARR Goal"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
          <span>Progress: <strong className="text-gray-900">{(summary.progressToGoal * 100).toFixed(0)}%</strong> of goal</span>
          {summary.crossoverQuarterLabel !== 'Beyond modeled range' && (
            <span>Crossover: <strong className="text-gray-900">{summary.crossoverQuarterLabel}</strong></span>
          )}
          <span>
            Sales Velocity: <strong className="text-gray-900">{Math.round(summary.currentSalesVelocity)}d</strong>
            {summary.daysSavedVsBaseline > 0 && (
              <span className="text-green-600 ml-1">({Math.round(summary.daysSavedVsBaseline)}d faster)</span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
