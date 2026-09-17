import { apiClient } from './client';

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string | null;
  focusSessionsCount: number;
  createdAt: string;
  updatedAt: string;
}

export const taskApi = {
  getTasks: (params?: any) =>
    apiClient.get('/tasks', { params }),

  getNextTask: () =>
    apiClient.get('/tasks/next'),

  getTask: (id: string) =>
    apiClient.get(`/tasks/${id}`),

  createTask: (data: any) =>
    apiClient.post('/tasks', data),

  updateTask: (id: string, data: any) =>
    apiClient.patch(`/tasks/${id}`, data),

  deleteTask: (id: string) =>
    apiClient.delete(`/tasks/${id}`),

  completeTask: (id: string) =>
    apiClient.post(`/tasks/${id}/complete`),

  getCompletedToday: () =>
    apiClient.get('/tasks/completed-today'),

  getOverdue: () =>
    apiClient.get('/tasks/overdue'),
};
