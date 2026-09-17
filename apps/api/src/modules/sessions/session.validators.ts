import { z } from 'zod';

export const startSessionSchema = z.object({
  body: z.object({
    taskId: z.string().cuid().optional(),
  }),
});

export const completeSessionSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});
