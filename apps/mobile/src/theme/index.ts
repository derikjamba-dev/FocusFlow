export const COLORS = {
  bg: '#07080d',
  surface: '#0e0f17',
  card: '#13151f',
  border: '#1e2130',
  border2: '#2d3a5c',
  accent: '#6ee7b7',
  accent2: '#34d399',
  text: '#e2e8f0',
  muted: '#94a3b8',
  purple: '#a78bfa',
  blue: '#60a5fa',
  red: '#f87171',
  amber: '#fbbf24',
};

export const PRIORITY_COLORS: Record<string, string> = {
  HIGH: COLORS.red,
  MEDIUM: COLORS.amber,
  LOW: COLORS.blue,
};

export const PRIORITY_LABELS: Record<string, string> = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};

export const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Active',
  COMPLETED: 'Done',
  DELETED: 'Deleted',
};