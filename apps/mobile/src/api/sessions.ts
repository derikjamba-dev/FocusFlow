import { apiClient } from './client';
import type { PaginationMeta } from './tasks';

export interface FocusSession {
  id: string;
  taskId?: string | null;
  startedAt: string;
  endedAt?: string | null;
  duration: number;
  completed: boolean;
  task?: { id: string; title: string; priority: string };
}

export interface SessionListResponse {
  data: FocusSession[];
  meta: PaginationMeta;
}

export interface SessionListParams {
  page?: number;
  limit?: number;
}

export async function startSession(taskId?: string): Promise<FocusSession> {
  const res = await apiClient.post<FocusSession>(
    '/sessions',
    taskId ? { taskId } : {},
  );
  return res.data;
}

export async function completeSession(id: string): Promise<FocusSession> {
  const res = await apiClient.post<FocusSession>(`/sessions/${id}/complete`);
  return res.data;
}

export async function getSessions(params?: SessionListParams): Promise<SessionListResponse> {
  const res = await apiClient.get<SessionListResponse>('/sessions', {
    params: { page: 1, limit: 20, ...params },
  });
  return res.data;
}

export async function getSession(id: string): Promise<FocusSession> {
  const res = await apiClient.get<FocusSession>(`/sessions/${id}`);
  return res.data;
}