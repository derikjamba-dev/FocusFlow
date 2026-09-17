import { apiClient } from './client';

export interface FocusSession {
  id: string;
  taskId?: string;
  startedAt: string;
  endedAt?: string;
  duration: number;
  completed: boolean;
  task?: { id: string; title: string; priority: string };
}

export const sessionsApi = {
  list: async (params?: { page?: number; limit?: number; taskId?: string }) => {
    const res = await apiClient.get('/sessions', { params: { page: 1, limit: 20, ...params } });
    return res.data;
  },
  get: async (id: string) => {
    const res = await apiClient.get('/sessions/' + id);
    return res.data;
  },
  start: async (data?: { taskId?: string }) => {
    const res = await apiClient.post('/sessions', data ?? {});
    return res.data;
  },
  complete: async (id: string) => {
    const res = await apiClient.post('/sessions/' + id + '/complete');
    return res.data;
  },
};
