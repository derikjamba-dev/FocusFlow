export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function formatRelative(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function priorityLabel(p: string): string {
  const labels: Record<string, string> = { LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High' };
  return labels[p] ?? p;
}

export function priorityColor(p: string): string {
  const colors: Record<string, string> = { LOW: 'text-muted', MEDIUM: 'text-amber', HIGH: 'text-red' };
  return colors[p] ?? 'text-muted';
}

export function statusLabel(s: string): string {
  const labels: Record<string, string> = { ACTIVE: 'Active', COMPLETED: 'Done', ARCHIVED: 'Archived' };
  return labels[s] ?? s;
}

export function statusColor(s: string): string {
  const colors: Record<string, string> = { ACTIVE: 'text-accent', COMPLETED: 'text-muted', ARCHIVED: 'text-muted' };
  return colors[s] ?? 'text-muted';
}
