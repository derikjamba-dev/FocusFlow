'use client';
import { useState } from 'react';
import { useDailyStats, useStreak, useWeeklyStats } from '../../lib/hooks/use-stats';
import { useTasks, useCompleteTask } from '../../lib/hooks/use-tasks';
import { useSessions, useCompleteSession } from '../../lib/hooks/use-sessions';
import { useAppStore } from '../../store/app-store';
import { FocusTimer } from '../../components/features/timer/FocusTimer';
import { TaskRow } from '../../components/features/tasks/TaskRow';
import { TaskModal } from '../../components/features/tasks/TaskModal';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { formatDuration, formatRelative, formatTime } from '../../lib/utils';

function StatCard({ label, value, sub, color = 'text-text' }: { label: string; value: React.ReactNode; sub?: string; color?: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 hover:border-border2 transition-colors">
      <p className="text-[11px] font-medium text-muted uppercase tracking-wider mb-2">{label}</p>
      <p className={`font-mono text-2xl font-semibold leading-none mb-1.5 ${color}`}>{value}</p>
      {sub && <p className="text-[11px] text-muted">{sub}</p>}
    </div>
  );
}

function WeekChart({ data }: { data: any[] }) {
  if (!data?.length) return null;
  const max = Math.max(...data.map((d: any) => d.focusMinutes ?? 0), 1);
  const days = ['S','M','T','W','T','F','S'];
  return (
    <div className="flex items-end gap-1.5 h-16 mt-2">
      {data.slice(-7).map((d: any, i: number) => {
        const pct = Math.max(((d.focusMinutes ?? 0) / max) * 100, 4);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              title={`${Math.round((d.focusMinutes ?? 0) / 60 * 10) / 10}h focus`}
              className="w-full bg-purple/60 hover:bg-purple rounded-t transition-colors cursor-pointer"
              style={{ height: `${pct}%` }}
            />
            <span className="text-[9px] text-muted font-mono">{days[new Date(d.date).getDay()]}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardPage() {
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const { activeSession } = useAppStore();
  const completeSession = useCompleteSession();

  const { data: daily, isLoading: dailyLoading } = useDailyStats();
  const { data: streakData } = useStreak();
  const { data: weekly } = useWeeklyStats();
  const { data: tasksData } = useTasks({ status: 'ACTIVE', limit: 5, sortBy: 'createdAt' });
  const { data: sessionsData } = useSessions({ limit: 5 });
  const completeTask = useCompleteTask();

  const focusHours = daily ? (daily.focusMinutes / 60).toFixed(1) : '—';
  const streak = streakData?.streak ?? 0;

  return (
    <div className="p-5 lg:p-7 max-w-[1400px] mx-auto">

      {/* Active session banner */}
      {activeSession && (
        <div className="flex items-center gap-3 bg-accent/8 border border-accent/20 rounded-xl px-4 py-3 mb-6">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse-slow flex-shrink-0" />
          <span className="text-sm text-accent font-medium">Focus session active</span>
          <span className="text-sm text-muted ml-1">— {activeSession.task?.title ?? 'No task'}</span>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto text-muted hover:text-red"
            onClick={() => completeSession.mutate(activeSession.id)}
          >
            End Session
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-text">Dashboard</h1>
          <p className="text-sm text-muted mt-0.5">{new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setTaskModalOpen(true)}>
          + New Task
        </Button>
      </div>

      {/* Stats */}
      {dailyLoading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <StatCard label="Tasks Done" value={`${daily?.tasksCompleted ?? 0}`} sub="today" color="text-accent" />
          <StatCard label="Focus Time" value={`${focusHours}h`} sub="today" color="text-purple2" />
          <StatCard label="Sessions" value={`${daily?.focusSessions ?? 0}`} sub="today" color="text-blue" />
          <StatCard label="Streak" value={`${streak}`} sub={streak === 1 ? 'day' : 'days'} color="text-amber" />
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">

        {/* Left column */}
        <div className="space-y-5">

          {/* Weekly chart */}
          {weekly?.dailyBreakdown?.length > 0 && (
            <Card header={<span className="text-sm font-semibold text-text">Weekly Focus</span>}>
              <div className="px-5 pb-4">
                <WeekChart data={weekly.dailyBreakdown ?? []} />
              </div>
            </Card>
          )}

          {/* Today's tasks */}
          <Card
            header={
              <>
                <span className="text-sm font-semibold text-text">Active Tasks</span>
                <Button variant="ghost" size="sm" onClick={() => setTaskModalOpen(true)}>+ Add</Button>
              </>
            }
          >
            <div className="px-5 py-1">
              {tasksData?.tasks?.length === 0 && (
                <p className="text-sm text-muted text-center py-6">No active tasks — great work!</p>
              )}
              {(tasksData?.tasks ?? []).map((task: any) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onComplete={(id) => completeTask.mutate(id)}
                  compact={false}
                />
              ))}
            </div>
          </Card>

          {/* Recent sessions */}
          <Card header={<span className="text-sm font-semibold text-text">Recent Sessions</span>}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-5 py-2.5 text-[11px] text-muted font-medium uppercase tracking-wide">Task</th>
                    <th className="text-left px-3 py-2.5 text-[11px] text-muted font-medium uppercase tracking-wide">Duration</th>
                    <th className="text-left px-3 py-2.5 text-[11px] text-muted font-medium uppercase tracking-wide">When</th>
                  </tr>
                </thead>
                <tbody>
                  {(sessionsData?.data ?? []).slice(0, 5).map((s: any) => (
                    <tr key={s.id} className="border-b border-border last:border-0 hover:bg-surface/50 transition-colors">
                      <td className="px-5 py-3 text-xs text-text truncate max-w-[160px]">{s.task?.title ?? <span className="text-muted italic">No task</span>}</td>
                      <td className="px-3 py-3 text-xs font-mono text-muted">{formatDuration(s.duration)}</td>
                      <td className="px-3 py-3 text-xs text-muted">{formatRelative(s.startedAt)}</td>
                    </tr>
                  ))}
                  {!sessionsData?.data?.length && (
                    <tr><td colSpan={3} className="px-5 py-6 text-center text-sm text-muted">No sessions yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right column — Timer */}
        <div>
          <Card header={<span className="text-sm font-semibold text-text">Focus Timer</span>}>
            <FocusTimer />
          </Card>
        </div>
      </div>

      <TaskModal open={taskModalOpen} onClose={() => setTaskModalOpen(false)} />
    </div>
  );
}
