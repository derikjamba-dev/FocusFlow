import { cn } from '../../lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
  const variants = {
    default: 'bg-border/60 text-muted border-border',
    success: 'bg-accent/10 text-accent border-accent/20',
    warning: 'bg-amber/10 text-amber border-amber/20',
    danger:  'bg-red/10 text-red border-red/20',
    info:    'bg-blue/10 text-blue border-blue/20',
    purple:  'bg-purple/10 text-purple2 border-purple/20',
  };
  const sizes = { sm: 'px-2 py-0.5 text-xs', md: 'px-2.5 py-1 text-xs' };
  return (
    <span className={cn('inline-flex items-center font-mono border rounded-md', variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
}
