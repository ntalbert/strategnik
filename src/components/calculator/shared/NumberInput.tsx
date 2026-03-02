import { Tooltip } from './Tooltip';
import type { ValidationResult } from '../engine/types';

interface Props {
  label: string;
  value: number;
  onChange: (value: number) => void;
  tooltip?: string;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  validation?: ValidationResult;
  disabled?: boolean;
  isPercent?: boolean;
}

export function NumberInput({
  label, value, onChange, tooltip, prefix, suffix,
  min, max, step = 1, validation, disabled, isPercent,
}: Props) {
  const displayValue = isPercent ? Math.round(value * 100) : value;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = parseFloat(e.target.value);
    if (isNaN(raw)) return;
    const v = isPercent ? raw / 100 : raw;
    onChange(v);
  };

  const borderColor = validation
    ? validation.severity === 'error' ? 'border-red-400 focus:ring-red-500'
    : validation.severity === 'warning' ? 'border-amber-400 focus:ring-amber-500'
    : 'border-gray-200 focus:ring-blue-500'
    : 'border-gray-200 focus:ring-blue-500';

  return (
    <div className="space-y-1">
      <label className="flex items-center text-xs font-medium text-gray-700">
        {label}
        {tooltip && <Tooltip content={tooltip} />}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={displayValue}
          onChange={handleChange}
          min={isPercent && min !== undefined ? min * 100 : min}
          max={isPercent && max !== undefined ? max * 100 : max}
          step={isPercent ? (step * 100) : step}
          disabled={disabled}
          className={`w-full h-8 text-xs rounded-md border ${borderColor} bg-white
            ${prefix ? 'pl-6' : 'pl-2.5'} ${suffix ? 'pr-8' : 'pr-2.5'}
            focus:outline-none focus:ring-1 transition-colors
            disabled:bg-gray-50 disabled:text-gray-400`}
        />
        {suffix && (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      {validation && (
        <p className={`text-xs ${validation.severity === 'error' ? 'text-red-600' : 'text-amber-600'}`}>
          {validation.message}
        </p>
      )}
    </div>
  );
}
