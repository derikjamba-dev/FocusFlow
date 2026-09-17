'use client';
import { useStreak, useWeeklyStats, useMonthlyStats, useDailyStats } from '../../../lib/hooks/use-stats';
import { useTasks } from '../../../lib/hooks/use-tasks';
import { Card } from '../../../components/ui/Card';
import { Spinner } from '../../../components/ui/Spinner';

function StatCard({ label, value, sub, color = 'text-text' }: { label: string; value: React.ReactNode; sub?: string; color?: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 hover:border-border2 transition-colors">
      <p className="text-[11px] font-medium text-muted uppercase tracking-wider mb-2">{label}</p>
      <p className={`font-mono text-2xl font-semibold leading-none mb-1.5 ${color}`}>{value}</p>
      {sub && <p className="text-[11px] text-muted">{sub}</p>}
    </div>
  );
}

function BarChart({ data, valueKey, labelKey, color = '#7c6af7', height = 120 }: {
  data: any[];
  valueKey: string;
  labelKey: string;
  color?: string;
  height?: number;
}) {
  if (!data?.length) return <div className="text-center text-sm text-muted py-8">No data</div>;
  const max = Math.max(...data.map((d) => d[valueKey] ?? 0), 1);
  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {data.map((d, i) => {
        const pct = Math.max(((d[valueKey] ?? 0) / max) * 100, 2);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
            <div
              title={`${d[valueKey]}`}
              className="w-full rounded-t-sm hover:opacity-80 transition-opacity cursor-pointer"
              style={{ height: `${pct}%`, background: color }}
            />
            {data.length <= 14 && (
              <span className="text-[8px] text-muted font-mono truncate w-full text-center">
                {d[labelKey]}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function HeatMap({ days }: { days: any[] }) {
  if (!days?.length) return null;
  const max = Math.max(...days.map((d) => d.focusMinutes ?? 0), 1);
  return (
    <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(14px, 1fr))' }}>
      {days.slice(-84).map((d, i) => {
        const intensity = (d.focusMinutes ?? 0) / max;
        const opacity = intensity < 0.1 ? 0.1 : intensity < 0.3 ? 0.3 : intensity < 0.6 ? 0.6 : 1;
        return (
          <div
            key={i}
            title={`${new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}: ${Math.round((d.focusMinutes ?? 0) / 60 * 10) / 10}h`}
            className="aspect-square rounded-sm cursor-pointer transition-opacity hover:opacity-80"
            style={{ background: `rgba(110, 231, 183, ${opacity})` }}
          />
        );
      })}
    </div>
  );
}

export default function AnalyticsPage() {
  const { data: streak } = useStreak();
  const { data: weekly } = useWeeklyStats();
  const { data: monthly } = useMonthlyStats();
  const { data: daily } = useDailyStats();
  const { data: activeTasks } = useTasks({ status: 'ACTIVE', limit: 1 });
  const { data: doneTasks } = useTasks({ status: 'COMPLETED', limit: 1 });

  const totalTasks = (activeTasks?.total ?? 0) + (doneTasks?.total ?? 0);
  const completionRate = totalTasks > 0 ? Math.round(((doneTasks?.total ?? 0) / totalTasks) * 100) : 0;
  const avgDaily = monthly?.days?.length
    ? Math.round(monthly.days.reduce((s: number, d: any) => s + (d.focusMinutes ?? 0), 0) / monthly.days.length)
    : 0;

  const weekDays = (weekly?.days ?? []).map((d: any) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString('en', { weekday: 'short' }).slice(0, 1),
  }));

  const monthDays = (monthly?.days ?? []).map((d: any) => ({
    ...d,
    label: new Date(d.date).getDate().toString(),
  }));

  return (
    <div className="p-5 lg:p-7 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-text">Analytics</h1>
        <p className="text-sm text-muted mt-0.5">Your productivity insights</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Avg Daily Focus" value={`${Math.round(avgDaily / 60 * 10) / 10}h`} sub="this month" color="text-purple2" />
        <StatCard label="Completion Rate" value={`${completionRate}%`} sub="all time" color="text-accent" />
        <StatCard label="Best Streak" value={`${streak?.streak ?? 0}`} sub="days" color="text-amber" />
        <StatCard label="Tasks Done" value={doneTasks?.total ?? 0} sub="all time" color="text-blue" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <Card header={<span className="text-sm font-semibold text-text">This Week — Focus Minutes</span>}>
          <div className="px-5 pb-5 pt-2">
            <BarChart data={weekDays} valueKey="focusMinutes" labelKey="label" color="#7c6af7" height={110} />
          </div>
        </Card>

        <Card header={<span className="text-sm font-semibold text-text">This Month — Tasks Completed</span>}>
          <div className="px-5 pb-5 pt-2">
            <BarChart data={monthDays} valueKey="tasksCompleted" labelKey="label" color="#6ee7b7" height={110} />
          </div>
        </Card>
      </div>

      {/* Priority breakdown */}
      {monthly?.priorityBreakdown && (
        <Card header={<span className="text-sm font-semibold text-text">Tasks by Priority</span>}>
          <div className="px-5 py-4 space-y-3">
            {Object.entries(monthly.priorityBreakdown).map(([p, count]: [string, any]) => {
              const total = Object.values(monthly.priorityBreakdown as Record<string, number>).reduce((a: number, b: number) => a + b, 0);
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              const color = p === 'HIGH' ? '#f87171' : p === 'MEDIUM' ? '#fbbf24' : '#60a5fa';
              return (
                <div key={p} className="flex items-center gap-3">
                  <span className="text-xs text-muted w-16">{p.charAt(0) + p.slice(1).toLowerCase()}</span>
                  <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                  </div>
                  <span className="text-xs font-mono text-muted w-8 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Heatmap */}
      {monthly?.days?.length > 0 && (
        <Card header={
          <div className="flex items-center justify-between w-full">
            <span className="text-sm font-semibold text-text">Activity Heatmap</span>
            <div className="flex items-center gap-1.5 text-[10px] text-muted">
              <span>Less</span>
              {[0.1, 0.3, 0.6, 1].map((o) => (
                <div key={o} className="w-3 h-3 rounded-sm" style={{ background: `rgba(110,231,183,${o})` }} />
              ))}
              <span>More</span>
            </div>
          </div>
        }>
          <div className="px-5 py-4">
            <HeatMap days={monthly.days} />
          </div>
        </Card>
      )}
    </div>
  );
}
