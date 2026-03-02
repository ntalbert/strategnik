import { useEffect, useRef } from 'react';
import { useCalculator } from '../state/context';
import { NumberInput } from '../shared/NumberInput';
import { TOOLTIPS } from '../engine/defaults';

export function GoalsSection() {
  const { state, dispatch } = useCalculator();
  const { goals } = state.inputs;
  const notification = state.ui.aspNotification;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-dismiss ASP notification after 8 seconds
  useEffect(() => {
    if (notification) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        dispatch({ type: 'DISMISS_ASP_NOTIFICATION' });
      }, 8000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [notification, dispatch]);

  return (
    <div className="space-y-3">
      <NumberInput
        label="ARR Goal"
        value={goals.arrGoal}
        onChange={(v) => dispatch({ type: 'SET_GOALS', payload: { arrGoal: v } })}
        tooltip={TOOLTIPS.arrGoal}
        prefix="$"
        min={100000}
        max={100000000}
        step={100000}
      />
      <NumberInput
        label="Average Selling Price (ACV)"
        value={goals.averageSellingPrice}
        onChange={(v) => dispatch({ type: 'ASP_CHANGED', newASP: v })}
        tooltip={TOOLTIPS.averageSellingPrice}
        prefix="$"
        min={10000}
        max={1000000}
        step={5000}
      />
      {/* ASP Change Notification (PRD C.4) */}
      {notification && (
        <div
          className="rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 text-[11px] text-blue-800 transition-opacity duration-300"
          onClick={() => dispatch({ type: 'DISMISS_ASP_NOTIFICATION' })}
        >
          <div className="font-medium">
            Adjusted for {notification.bandLabel} deal dynamics
          </div>
          {notification.adjustedFields.length > 0 && (
            <div className="text-blue-600 mt-0.5">
              Updated: {notification.adjustedFields.join(', ')}
            </div>
          )}
          {notification.preservedFields.length > 0 && (
            <div className="text-blue-500 mt-0.5">
              Custom values preserved: {notification.preservedFields.join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
