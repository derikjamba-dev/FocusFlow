import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '../api/tasks';

export function useTasks(params?: any) {
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: async () => {
      const { data } = await taskApi.getTasks(params);
      return data;
    },
    staleTime: 30000,
  });
}

export function useNextTask() {
  return useQuery({
    queryKey: ['tasks', 'next'],
    queryFn: async () => {
      const { data } = await taskApi.getNextTask();
      return data.data;
    },
    staleTime: 60000,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => taskApi.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => taskApi.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => taskApi.completeTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}
