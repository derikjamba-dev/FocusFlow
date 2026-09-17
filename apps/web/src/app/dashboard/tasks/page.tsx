'use client';
import { useState } from 'react';
import { useTasks, useCompleteTask, useDeleteTask } from '../../../lib/hooks/use-tasks';
import { TaskRow } from '../../../components/features/tasks/TaskRow';
import { TaskModal } from '../../../components/features/tasks/TaskModal';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { EmptyState } from '../../../components/ui/EmptyState';
import { cn } from '../../../lib/utils';

const FILTERS = [
  { label: 'All',      status: undefined },
  { label: 'Active',   status: 'ACTIVE' },
  { label: 'Done',     status: 'COMPLETED' },
  { label: 'High',     status: undefined, priority: 'HIGH' },
];

export default function TasksPage() {
  const [filterIdx, setFilterIdx] = useState(0);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);

  const filter = FILTERS[filterIdx];
  const { data, isLoading } = useTasks({
    status: filter.status,
    priority: (filter as any).priority,
    page,
    limit: 25,
    sortBy: 'createdAt',
  });

  const completeTask = useCompleteTask();
  const deleteTask = useDeleteTask();

  const tasks = (data?.tasks ?? []).filter((t: any) =>
    !search || t.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-5 lg:p-7 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-text">Tasks</h1>
          <p className="text-sm text-muted mt-0.5">{data?.total ?? 0} total</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>+ New Task</Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks..."
          className="flex-1 bg-card border border-border rounded-lg px-3.5 py-2.5 text-sm text-text placeholder-muted outline-none focus:border-accent/50 transition-colors"
        />
        <div className="flex gap-1.5">
          {FILTERS.map((f, i) => (
            <button
              key={i}
              onClick={() => { setFilterIdx(i); setPage(1); }}
              className={cn(
                'px-3.5 py-2 rounded-lg text-xs font-medium border transition-all',
                i === filterIdx
                  ? 'bg-accent/10 border-accent/30 text-accent'
                  : 'bg-transparent border-border text-muted hover:border-border2 hover:text-text',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : tasks.length === 0 ? (
          <EmptyState
            icon="◫"
            title={search ? 'No matching tasks' : 'No tasks here'}
            description={search ? 'Try a different search' : 'Create your first task to get started'}
            action={!search ? { label: '+ New Task', onClick: () => setModalOpen(true) } : undefined}
          />
        ) : (
          <div className="px-5 py-1">
            {tasks.map((task: any) => (
              <TaskRow
                key={task.id}
                task={task}
                onComplete={(id) => completeTask.mutate(id)}
                onDelete={(id) => deleteTask.mutate(id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {(data?.total ?? 0) > 25 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-muted">Page {page} of {Math.ceil((data?.total ?? 1) / 25)}</span>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
            <Button size="sm" onClick={() => setPage((p) => p + 1)} disabled={!data?.hasMore}>Next</Button>
          </div>
        </div>
      )}

      <TaskModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
