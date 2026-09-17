import { Badge } from '../../ui/Badge';

const TYPE_MAP: Record<string, { label: string; variant: 'purple' | 'success' | 'info' | 'default' }> = {
  POMODORO:    { label: 'Pomodoro', variant: 'purple' },
  DEEP_WORK:   { label: 'Deep Work', variant: 'success' },
  SHORT_BREAK: { label: 'Short Break', variant: 'info' },
  LONG_BREAK:  { label: 'Long Break', variant: 'info' },
};

export function SessionBadge({ type }: { type: string }) {
  const cfg = TYPE_MAP[type] ?? { label: type, variant: 'default' as const };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
