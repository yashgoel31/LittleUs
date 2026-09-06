import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const variantClasses = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      ghost: 'btn-ghost',
      danger: 'btn-primary', // Styled with warm red
    };

    const sizeStyles = {
      sm: { padding: '0.45rem 0.9rem', fontSize: '0.8125rem' },
      md: {},
      lg: { padding: '0.9rem 1.8rem', fontSize: '1.0625rem' },
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(variantClasses[variant], className)}
        style={{
          ...sizeStyles[size],
          opacity: disabled || isLoading ? 0.6 : 1,
          cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        }}
        {...props}
      >
        {isLoading ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <span
              style={{
                display: 'inline-block',
                width: '12px',
                height: '12px',
                border: '2px solid currentColor',
                borderRightColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 0.6s linear infinite',
              }}
            />
            {children}
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
