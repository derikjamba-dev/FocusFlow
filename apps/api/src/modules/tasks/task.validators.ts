import { z } from 'zod';

export const createTaskSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(1, 'Title is required')
      .max(200, 'Title is too long')
      .trim(),
    dueDate: z.string().datetime().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
  body: z.object({
    title: z.string().min(1).max(200).trim().optional(),
    dueDate: z.string().datetime().optional().nullable(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    status: z.enum(['ACTIVE', 'COMPLETED']).optional(),
  }),
});

export const taskIdSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});
