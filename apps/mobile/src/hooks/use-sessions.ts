import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { completeSession, getSessions, startSession } from '../api/sessions';
import type { SessionListParams } from '../api/sessions';
import { useAppStore } from '../store/app-store';

export function useSessions(params?: SessionListParams) {
  return useQuery({
    queryKey: ['sessions', params],
    queryFn: () => getSessions(params),
  });
}

export function useStartSession() {
  const qc = useQueryClient();
  const setActiveSession = useAppStore((s) => s.setActiveSession);
  return useMutation({
    mutationFn: (taskId?: string) => startSession(taskId),
    onSuccess: (session) => {
      setActiveSession(session);
      qc.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

export function useCompleteSession() {
  const qc = useQueryClient();
  const setActiveSession = useAppStore((s) => s.setActiveSession);
  return useMutation({
    mutationFn: (id: string) => completeSession(id),
    onSuccess: () => {
      setActiveSession(null);
      qc.invalidateQueries({ queryKey: ['sessions'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}