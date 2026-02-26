'use client';

import { useState, useCallback, InputHTMLAttributes } from 'react';

interface CurrencyInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'type'> {
  label?: string;
  error?: string;
  currency?: string;
  value: string;
  onChange: (value: string) => void;
}

function getCurrencySymbol(currency: string): string {
  try {
    const parts = new Intl.NumberFormat('es-ES', { style: 'currency', currency }).formatToParts(0);
    const symbolPart = parts.find((p) => p.type === 'currency');
    return symbolPart?.value || currency;
  } catch {
    return currency;
  }
}

function formatDisplay(raw: string, currency: string): string {
  const num = Number.parseFloat(raw);
  if (Number.isNaN(num)) return '';
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function CurrencyInput({
  label,
  error,
  currency = 'USD',
  value,
  onChange,
  className = '',
  id,
  ...props
}: CurrencyInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputId = id || label?.toLowerCase().replaceAll(/\s+/g, '-');
  const symbol = getCurrencySymbol(currency);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      // Allow digits and at most one decimal point
      if (/^\d*\.?\d*$/.test(raw)) {
        onChange(raw);
      }
    },
    [onChange],
  );

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const displayValue = isFocused ? value : formatDisplay(value, currency);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-[var(--color-text)] mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] text-sm pointer-events-none select-none">
          {symbol}
        </span>
        <input
          id={inputId}
          inputMode="decimal"
          className={`
            w-full pl-10 pr-3 py-2 min-h-[44px] rounded-lg border
            bg-[var(--color-surface)] text-[var(--color-text)]
            border-[var(--color-border)]
            focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent
            placeholder:text-[var(--color-text-secondary)]
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-[var(--color-danger)] focus:ring-[var(--color-danger)]' : ''}
            ${className}
          `}
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm text-[var(--color-danger)]">{error}</p>}
    </div>
  );
}
