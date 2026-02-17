'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-[var(--color-text)] mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-3 py-2 min-h-[44px] rounded-lg border
            bg-[var(--color-surface)] text-[var(--color-text)]
            border-[var(--color-border)]
            focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent
            placeholder:text-[var(--color-text-secondary)]
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-[var(--color-danger)] focus:ring-[var(--color-danger)]' : ''}
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-[var(--color-danger)]">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
