import { create } from 'zustand';

interface AppStore {
  selectedTask: any | null;
  setSelectedTask: (task: any | null) => void;
  timerState: { running: boolean; seconds: number };
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  activeSession: any | null;
  setActiveSession: (session: any | null) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppStore>()(
  (set) => ({
    selectedTask: null,
    timerState: { running: false, seconds: 25 * 60 },
    setSelectedTask: (task) => set({ selectedTask: task }),
    startTimer: () =>
      set((state) => ({
        timerState: { ...state.timerState, running: true },
      })),
    pauseTimer: () =>
      set((state) => ({
        timerState: { ...state.timerState, running: false },
      })),
    resetTimer: () =>
      set({ timerState: { running: false, seconds: 25 * 60 } }),
    activeSession: null,
    setActiveSession: (session) => set({ activeSession: session }),
    sidebarOpen: true,
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
  })
);
