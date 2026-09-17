'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sessionsApi } from '../api/sessions';
import { useAppStore } from '../../store/app-store';

export const SESSIONS_KEY = 'sessions';

export function useSessions(params?: { page?: number; limit?: number; taskId?: string }) {
  return useQuery({
    queryKey: [SESSIONS_KEY, params],
    queryFn: () => sessionsApi.list(params),
  });
}

export function useStartSession() {
  const qc = useQueryClient();
  const setActiveSession = useAppStore((s) => s.setActiveSession);
  return useMutation({
    mutationFn: (data?: { taskId?: string }) => sessionsApi.start(data),
    onSuccess: (res) => {
      setActiveSession(res);
      qc.invalidateQueries({ queryKey: [SESSIONS_KEY] });
    },
  });
}

export function useCompleteSession() {
  const qc = useQueryClient();
  const setActiveSession = useAppStore((s) => s.setActiveSession);
  return useMutation({
    mutationFn: (id: string) => sessionsApi.complete(id),
    onSuccess: () => {
      setActiveSession(null);
      qc.invalidateQueries({ queryKey: [SESSIONS_KEY] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}
