import { create } from 'zustand';
import type { FocusSession } from '../api/sessions';
import type { Task } from '../api/tasks';

interface AppStore {
  selectedTask: Task | null;
  setSelectedTask: (task: Task | null) => void;
  activeSession: FocusSession | null;
  setActiveSession: (session: FocusSession | null) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  selectedTask: null,
  setSelectedTask: (task) => set({ selectedTask: task }),
  activeSession: null,
  setActiveSession: (session) => set({ activeSession: session }),
}));