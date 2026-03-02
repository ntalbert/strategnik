import { useCalculator } from '../state/context';
import { HeroMetrics } from './HeroMetrics';
import { TimelineTab } from './TimelineTab';
import { BudgetTab } from './BudgetTab';
import { CohortsTab } from './CohortsTab';
import { DataTab } from './DataTab';

const TABS = [
  { id: 'timeline' as const, label: 'Timeline' },
  { id: 'budget' as const, label: 'Budget' },
  { id: 'cohorts' as const, label: 'Cohorts' },
  { id: 'data' as const, label: 'Data' },
];

export function Dashboard() {
  const { state, dispatch } = useCalculator();
  const { activeTab } = state.ui;

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50/50 p-4 md:p-6">
      <HeroMetrics />

      {/* Tab Bar */}
      <div className="flex gap-1 mb-4 bg-white rounded-lg border border-gray-100 p-1 sticky top-0 z-10">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => dispatch({ type: 'SET_TAB', tab: tab.id })}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors
              ${activeTab === tab.id
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
            role="tab"
            aria-selected={activeTab === tab.id}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div role="tabpanel">
        {activeTab === 'timeline' && <TimelineTab />}
        {activeTab === 'budget' && <BudgetTab />}
        {activeTab === 'cohorts' && <CohortsTab />}
        {activeTab === 'data' && <DataTab />}
      </div>
    </div>
  );
}
