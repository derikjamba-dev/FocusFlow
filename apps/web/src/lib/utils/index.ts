export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const h = Math.floor(m / 60);
  const mins = m % 60;
  if (h > 0) return `${h}h ${mins > 0 ? `${mins}m` : ''}`.trim();
  return `${m}m`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
}

export function formatRelative(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dStr = d.toDateString();
  if (dStr === today.toDateString()) return 'Today';
  if (dStr === yesterday.toDateString()) return 'Yesterday';
  return formatDate(d);
}

export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
}

export function priorityColor(priority: string): string {
  switch (priority) {
    case 'HIGH': return 'text-red bg-red/10 border-red/20';
    case 'MEDIUM': return 'text-amber bg-amber/10 border-amber/20';
    case 'LOW': return 'text-blue bg-blue/10 border-blue/20';
    default: return 'text-muted bg-border/40 border-border';
  }
}

export function priorityLabel(priority: string): string {
  switch (priority) {
    case 'HIGH': return 'High';
    case 'MEDIUM': return 'Medium';
    case 'LOW': return 'Low';
    default: return priority;
  }
}

export function statusLabel(status: string): string {
  switch (status) {
    case 'ACTIVE': return 'Active';
    case 'COMPLETED': return 'Done';
    case 'DELETED': return 'Deleted';
    default: return status;
  }
}

export function statusColor(status: string): string {
  switch (status) {
    case 'ACTIVE': return 'text-blue bg-blue/10 border-blue/20';
    case 'COMPLETED': return 'text-accent bg-accent/10 border-accent/20';
    default: return 'text-muted bg-border/40 border-border';
  }
}
