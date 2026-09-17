export interface User {
  id: string;
  email: string;
  name: string | null;
  proStatus: boolean;
  createdAt: Date;
  lastActiveAt: Date | null;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: Date | null;
  userId: string;
  focusSessionsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  taskId: string | null;
  duration: number;
  startedAt: Date;
  endedAt: Date | null;
}

export interface DailyStat {
  id: string;
  userId: string;
  date: Date;
  tasksCompleted: number;
  focusSessions: number;
  focusMinutes: number;
  streakCount: number;
}

export type TimerMode = 'pomodoro' | 'long' | 'deep';

export interface BlockedApp {
  packageName: string;
  label: string;
}
