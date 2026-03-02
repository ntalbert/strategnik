import { CalculatorProvider } from './state/context';
import { TopBar } from './TopBar';
import { InputPanel } from './panels/InputPanel';
import { Dashboard } from './dashboard/Dashboard';
import { EmailCaptureModal } from './export/EmailCaptureModal';

function CalculatorLayout() {
  return (
    <div className="h-screen flex flex-col bg-white text-gray-900" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        {/* Input Panel - hidden on mobile */}
        <div className="hidden lg:block">
          <InputPanel />
        </div>
        {/* Dashboard */}
        <Dashboard />
      </div>
      <EmailCaptureModal />
      {/* Mobile banner */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900 text-white text-xs text-center py-2 px-4 z-50">
        To customize inputs and create scenarios, open on a desktop browser.
      </div>
      {/* Footer disclaimer */}
      <div className="hidden lg:block text-[9px] text-gray-400 text-center py-1 border-t border-gray-100 flex-shrink-0">
        Default assumptions based on typical mid-market B2B SaaS patterns. Actual results vary significantly by industry, deal size, sales cycle, and campaign execution.
      </div>
    </div>
  );
}

export default function FunnelCalculator() {
  return (
    <CalculatorProvider>
      <CalculatorLayout />
    </CalculatorProvider>
  );
}
