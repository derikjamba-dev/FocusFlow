'use client';
import { useState } from 'react';
import { useSessions } from '../../../lib/hooks/use-sessions';
import { useMonthlyStats } from '../../../lib/hooks/use-stats';
import { Card } from '../../../components/ui/Card';
import { Spinner } from '../../../components/ui/Spinner';
import { EmptyState } from '../../../components/ui/EmptyState';
import { formatDuration, formatRelative, formatTime } from '../../../lib/utils';

function StatCard({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <p className="text-[11px] font-medium text-muted uppercase tracking-wider mb-2">{label}</p>
      <p className="font-mono text-2xl font-semibold text-text leading-none mb-1">{value}</p>
      {sub && <p className="text-[11px] text-muted">{sub}</p>}
    </div>
  );
}

export default function SessionsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useSessions({ page, limit: 20 });
  const { data: monthly } = useMonthlyStats();

  const sessions = data?.data ?? [];
  const totalMinutes = monthly?.totalFocusMinutes ?? 0;
  const totalSessions = monthly?.totalSessions ?? 0;

  return (
    <div className="p-5 lg:p-7 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-text">Focus Sessions</h1>
        <p className="text-sm text-muted mt-0.5">Your deep work history</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        <StatCard label="Sessions This Month" value={totalSessions} sub="completed" />
        <StatCard label="Focus Time This Month" value={`${(totalMinutes / 60).toFixed(1)}h`} sub="total" />
        <StatCard label="Avg per Session" value={totalSessions ? `${Math.round(totalMinutes / totalSessions)}m` : '—'} sub="minutes" />
      </div>

      {/* Table */}
      <Card header={<span className="text-sm font-semibold text-text">All Sessions</span>}>
        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : sessions.length === 0 ? (
          <EmptyState icon="◉" title="No sessions yet" description="Start a focus session from the dashboard" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['Task', 'Duration', 'Status', 'Started', 'Date'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] text-muted font-medium uppercase tracking-wide first:pl-5">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sessions.map((s: any) => (
                  <tr key={s.id} className="border-b border-border last:border-0 hover:bg-surface/40 transition-colors">
                    <td className="px-5 py-3.5 text-xs text-text max-w-[180px] truncate">
                      {s.task?.title ?? <span className="text-muted italic">No task</span>}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-mono text-muted">{formatDuration(s.duration)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[11px] font-mono px-2 py-0.5 rounded-md border ${s.completed ? 'bg-accent/10 text-accent border-accent/20' : 'bg-border/40 text-muted border-border'}`}>
                        {s.completed ? 'Completed' : 'Stopped'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-mono text-muted">{formatTime(s.startedAt)}</td>
                    <td className="px-5 py-3.5 text-xs text-muted">{formatRelative(s.startedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {(data?.meta?.totalPages ?? 1) > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-muted">Page {page} of {data?.meta?.totalPages}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 text-xs bg-card border border-border rounded-lg text-muted hover:text-text hover:border-border2 disabled:opacity-40 transition-all">
              Prev
            </button>
            <button onClick={() => setPage((p) => p + 1)} disabled={page >= (data?.meta?.totalPages ?? 1)}
              className="px-3 py-1.5 text-xs bg-card border border-border rounded-lg text-muted hover:text-text hover:border-border2 disabled:opacity-40 transition-all">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
