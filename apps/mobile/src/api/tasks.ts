import { apiClient } from './client';

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'ACTIVE' | 'COMPLETED' | 'DELETED';
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
  focusSessionsCount: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore?: boolean;
}

export interface TaskListResponse {
  data: Task[];
  meta: PaginationMeta;
}

export interface TaskListParams {
  page?: number;
  limit?: number;
  status?: 'ACTIVE' | 'COMPLETED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  sortBy?: string;
}

export async function getTasks(params?: TaskListParams): Promise<TaskListResponse> {
  const res = await apiClient.get<TaskListResponse>('/tasks', { params });
  return res.data;
}

export async function getNextTask(): Promise<{ data: Task | null }> {
  const res = await apiClient.get<{ data: Task | null }>('/tasks/next');
  return res.data;
}

export async function getCompletedToday(): Promise<{ data: Task[] }> {
  const res = await apiClient.get<{ data: Task[] }>('/tasks/completed-today');
  return res.data;
}

export async function getOverdue(): Promise<{ data: Task[] }> {
  const res = await apiClient.get<{ data: Task[] }>('/tasks/overdue');
  return res.data;
}

export async function getTask(id: string): Promise<{ data: Task }> {
  const res = await apiClient.get<{ data: Task }>(`/tasks/${id}`);
  return res.data;
}

export interface CreateTaskInput {
  title: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string | null;
}

export async function createTask(
  data: CreateTaskInput,
): Promise<{ message: string; data: Task }> {
  const res = await apiClient.post<{ message: string; data: Task }>('/tasks', data);
  return res.data;
}

export async function updateTask(
  id: string,
  data: Partial<CreateTaskInput> & { status?: 'ACTIVE' | 'COMPLETED' },
): Promise<{ message: string; data: Task }> {
  const res = await apiClient.patch<{ message: string; data: Task }>(`/tasks/${id}`, data);
  return res.data;
}

export async function deleteTask(id: string): Promise<{ message: string }> {
  const res = await apiClient.delete<{ message: string }>(`/tasks/${id}`);
  return res.data;
}

export async function completeTask(id: string): Promise<{ message: string; data: Task }> {
  const res = await apiClient.post<{ message: string; data: Task }>(`/tasks/${id}/complete`);
  return res.data;
}