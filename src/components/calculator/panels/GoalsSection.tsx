import { useCalculator } from '../state/context';
import { NumberInput } from '../shared/NumberInput';
import { TOOLTIPS } from '../engine/defaults';

export function GoalsSection() {
  const { state, dispatch } = useCalculator();
  const { goals } = state.inputs;

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
        onChange={(v) => dispatch({ type: 'SET_GOALS', payload: { averageSellingPrice: v } })}
        tooltip={TOOLTIPS.averageSellingPrice}
        prefix="$"
        min={10000}
        max={1000000}
        step={5000}
      />
    </div>
  );
}
