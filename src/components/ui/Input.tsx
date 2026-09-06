import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div style={{ marginBottom: '1.25rem', width: '100%' }}>
        {label && (
          <label htmlFor={inputId} className="input-label">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn('input-field', className)}
          style={{
            borderColor: error ? 'var(--blush-500)' : undefined,
          }}
          {...props}
        />
        {hint && !error && (
          <p style={{ marginTop: '0.35rem', fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
            {hint}
          </p>
        )}
        {error && (
          <p style={{ marginTop: '0.35rem', fontSize: '0.8125rem', color: 'var(--blush-500)', fontWeight: 500 }}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
