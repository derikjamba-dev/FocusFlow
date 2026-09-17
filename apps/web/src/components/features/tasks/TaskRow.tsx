'use client';
import { useState } from 'react';
import { Badge } from '../../ui/Badge';
import { priorityLabel, formatRelative } from '../../../lib/utils';
import type { Task } from '../../../lib/api/tasks';

interface TaskRowProps {
  task: Task;
  onComplete: (id: string) => void;
  onDelete?: (id: string) => void;
  compact?: boolean;
}

export function TaskRow({ task, onComplete, onDelete, compact }: TaskRowProps) {
  const [hovering, setHovering] = useState(false);
  const done = task.status === 'COMPLETED';
  const overdue = !done && task.dueDate && new Date(task.dueDate) < new Date();

  const priorityVariant = task.priority === 'HIGH' ? 'danger' : task.priority === 'MEDIUM' ? 'warning' : 'info';

  return (
    <div
      className="flex items-center gap-3 py-3 border-b border-border last:border-0 group"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* Checkbox */}
      <button
        onClick={() => !done && onComplete(task.id)}
        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
          done ? 'bg-accent border-accent' : 'border-border2 hover:border-accent'
        }`}
      >
        {done && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2.5 2.5L8 3" stroke="#07080d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      {/* Title */}
      <span className={`flex-1 text-sm truncate ${done ? 'line-through text-muted' : 'text-text'}`}>
        {task.title}
      </span>

      {/* Meta */}
      {!compact && (
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge variant={priorityVariant} size="sm">{priorityLabel(task.priority)}</Badge>
          {task.dueDate && (
            <span className={`text-[11px] font-mono ${overdue ? 'text-red' : 'text-muted'}`}>
              {formatRelative(task.dueDate)}
            </span>
          )}
          {task.focusSessionsCount > 0 && (
            <span className="text-[11px] text-muted font-mono">{task.focusSessionsCount}◉</span>
          )}
        </div>
      )}

      {onDelete && (
        <button
          onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 text-muted hover:text-red transition-all p-1"
        >
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
      )}
    </div>
  );
}
