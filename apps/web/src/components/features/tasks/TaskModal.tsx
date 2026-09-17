'use client';
import { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { useCreateTask } from '../../../lib/hooks/use-tasks';

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
}

export function TaskModal({ open, onClose }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const createTask = useCreateTask();

  const handleSubmit = () => {
    if (!title.trim()) { setError('Title is required'); return; }
    createTask.mutate(
      {
        title: title.trim(),
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      },
      {
        onSuccess: () => {
          setTitle(''); setPriority('MEDIUM'); setDueDate(''); setError('');
          onClose();
        },
        onError: () => setError('Failed to create task'),
      },
    );
  };

  return (
    <Modal open={open} onClose={onClose} title="New Task">
      <div className="p-5 space-y-4">
        <Input
          label="Title"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setError(''); }}
          error={error}
          autoFocus
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
        />

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted uppercase tracking-wide">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-text outline-none focus:border-accent/60 transition-colors"
            >
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted uppercase tracking-wide">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-text outline-none focus:border-accent/60 transition-colors [color-scheme:dark]"
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2.5 px-5 py-4 border-t border-border">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit} loading={createTask.isPending}>
          Add Task
        </Button>
      </div>
    </Modal>
  );
}
