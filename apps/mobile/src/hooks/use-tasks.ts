import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  completeTask,
  createTask,
  deleteTask,
  getTasks,
} from '../api/tasks';
import type { CreateTaskInput, TaskListParams } from '../api/tasks';

export function useTasks(params?: TaskListParams) {
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: () => getTasks(params),
    staleTime: 30_000,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTaskInput) => createTask(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useCompleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => completeTask(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}