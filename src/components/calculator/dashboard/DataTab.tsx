import { useCalculator } from '../state/context';

function formatNum(n: number): string {
  return n < 1 && n > 0 ? n.toFixed(2) : n.toFixed(0);
}

function formatCurrency(n: number): string {
  return '$' + Math.round(n).toLocaleString();
}

function exportCSV(quarterly: any[]) {
  const headers = ['Quarter', 'Leads', 'MQLs', 'Opportunities', 'Closed Won', 'Revenue', 'Frequency Cost', 'CPL Cost', 'Software', 'Agency', 'Total Cost', 'Cum. Revenue', 'Cum. Cost'];
  const rows = quarterly.map(q => [
    q.quarterLabel,
    q.leads.toFixed(1),
    q.mqls.toFixed(1),
    q.opportunities.toFixed(1),
    q.closedWon.toFixed(2),
    Math.round(q.revenue),
    Math.round(q.frequencyCost),
    Math.round(q.cplCost),
    Math.round(q.softwareCost),
    Math.round(q.agencyCost),
    Math.round(q.totalCost),
    Math.round(q.cumulativeRevenue),
    Math.round(q.cumulativeCost),
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'funnel-velocity-data.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export function DataTab() {
  const { state } = useCalculator();
  const { quarterly } = state.outputs;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Quarterly Data</h3>
        <button
          onClick={() => exportCSV(quarterly)}
          className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          Download CSV
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-3 py-2 font-semibold text-gray-700 sticky left-0 bg-gray-50 z-10">Quarter</th>
              <th className="text-right px-3 py-2 font-semibold text-gray-700">Leads</th>
              <th className="text-right px-3 py-2 font-semibold text-gray-700">MQLs</th>
              <th className="text-right px-3 py-2 font-semibold text-gray-700">Opps</th>
              <th className="text-right px-3 py-2 font-semibold text-gray-700">Won</th>
              <th className="text-right px-3 py-2 font-semibold text-gray-700">Revenue</th>
              <th className="text-right px-3 py-2 font-semibold text-gray-700">Freq. Cost</th>
              <th className="text-right px-3 py-2 font-semibold text-gray-700">CPL Cost</th>
              <th className="text-right px-3 py-2 font-semibold text-gray-700">Software</th>
              <th className="text-right px-3 py-2 font-semibold text-gray-700">Agency</th>
              <th className="text-right px-3 py-2 font-semibold text-gray-700">Total Cost</th>
            </tr>
          </thead>
          <tbody>
            {quarterly.map((q, i) => (
              <tr key={q.quarter} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                <td className="px-3 py-2 font-medium text-gray-900 sticky left-0 bg-inherit z-10">{q.quarterLabel}</td>
                <td className="text-right px-3 py-2 text-gray-700">{formatNum(q.leads)}</td>
                <td className="text-right px-3 py-2 text-gray-700">{formatNum(q.mqls)}</td>
                <td className="text-right px-3 py-2 text-gray-700">{formatNum(q.opportunities)}</td>
                <td className="text-right px-3 py-2 text-gray-700">{formatNum(q.closedWon)}</td>
                <td className="text-right px-3 py-2 text-gray-700">{formatCurrency(q.revenue)}</td>
                <td className="text-right px-3 py-2 text-gray-500">{formatCurrency(q.frequencyCost)}</td>
                <td className="text-right px-3 py-2 text-gray-500">{formatCurrency(q.cplCost)}</td>
                <td className="text-right px-3 py-2 text-gray-500">{formatCurrency(q.softwareCost)}</td>
                <td className="text-right px-3 py-2 text-gray-500">{formatCurrency(q.agencyCost)}</td>
                <td className="text-right px-3 py-2 font-medium text-gray-900">{formatCurrency(q.totalCost)}</td>
              </tr>
            ))}
            {/* Totals row */}
            <tr className="bg-gray-100 font-semibold border-t-2 border-gray-200">
              <td className="px-3 py-2 text-gray-900 sticky left-0 bg-gray-100 z-10">Total</td>
              <td className="text-right px-3 py-2">{formatNum(quarterly.reduce((a, q) => a + q.leads, 0))}</td>
              <td className="text-right px-3 py-2">{formatNum(quarterly.reduce((a, q) => a + q.mqls, 0))}</td>
              <td className="text-right px-3 py-2">{formatNum(quarterly.reduce((a, q) => a + q.opportunities, 0))}</td>
              <td className="text-right px-3 py-2">{formatNum(quarterly.reduce((a, q) => a + q.closedWon, 0))}</td>
              <td className="text-right px-3 py-2">{formatCurrency(quarterly.reduce((a, q) => a + q.revenue, 0))}</td>
              <td className="text-right px-3 py-2 text-gray-500">{formatCurrency(quarterly.reduce((a, q) => a + q.frequencyCost, 0))}</td>
              <td className="text-right px-3 py-2 text-gray-500">{formatCurrency(quarterly.reduce((a, q) => a + q.cplCost, 0))}</td>
              <td className="text-right px-3 py-2 text-gray-500">{formatCurrency(quarterly.reduce((a, q) => a + q.softwareCost, 0))}</td>
              <td className="text-right px-3 py-2 text-gray-500">{formatCurrency(quarterly.reduce((a, q) => a + q.agencyCost, 0))}</td>
              <td className="text-right px-3 py-2">{formatCurrency(quarterly.reduce((a, q) => a + q.totalCost, 0))}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
