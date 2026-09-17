import { cn } from '../../lib/utils';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function EmptyState({ icon = '◻', title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      <div className="text-4xl mb-4 opacity-30">{icon}</div>
      <p className="text-sm font-medium text-text mb-1">{title}</p>
      {description && <p className="text-xs text-muted mb-4 max-w-xs">{description}</p>}
      {action && <Button variant="secondary" size="sm" onClick={action.onClick}>{action.label}</Button>}
    </div>
  );
}
