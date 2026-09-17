'use client';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({ variant = 'secondary', size = 'md', loading, className, children, disabled, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-sans font-medium rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary:   'bg-accent text-bg hover:bg-accent2 active:scale-95',
    secondary: 'bg-card border border-border text-text hover:border-border2 hover:bg-surface active:scale-95',
    ghost:     'bg-transparent text-muted hover:text-text hover:bg-card active:scale-95',
    danger:    'bg-red/10 border border-red/20 text-red hover:bg-red/20 active:scale-95',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2',
  };
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
      )}
      {children}
    </button>
  );
}
