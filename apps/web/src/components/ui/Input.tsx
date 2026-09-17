'use client';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export function Input({ label, error, helper, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-muted uppercase tracking-wide">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'w-full bg-card border rounded-lg px-3 py-2.5 text-sm text-text placeholder-muted',
          'transition-colors duration-150 outline-none',
          error ? 'border-red/50 focus:border-red' : 'border-border focus:border-accent/60',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-red">{error}</p>}
      {helper && !error && <p className="text-xs text-muted">{helper}</p>}
    </div>
  );
}
