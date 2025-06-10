import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { z } from 'zod';

interface AuthRequest extends Request {
  user?: { userId: number; email: string };
}

export const getTasks = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  const tasks = await prisma.task.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  res.json(tasks);
};

const createTaskSchema = z.object({
  title: z.string().min(1, 'O título é obrigatório'),
});

export const createTask = async (req: Request, res: Response) => {
  const parse = createTaskSchema.safeParse(req.body);
  const userId = (req as any).user?.userId;

  if (!parse.success) {
    return res.status(400).json({ errors: parse.error.flatten().fieldErrors });
  }

  const { title } = parse.data;

  const task = await prisma.task.create({
    data: {
      title,
      userId,
    },
  });

  return res.status(201).json(task);
};

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  completed: z.boolean().optional(),
});

export const updateTask = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user?.userId;
  const parse = updateTaskSchema.safeParse(req.body);

  if (!parse.success) {
    return res.status(400).json({ errors: parse.error.flatten().fieldErrors });
  }

  const task = await prisma.task.findUnique({
    where: { id: Number(id) },
  });

  if (!task || task.userId !== userId) {
    return res.status(404).json({ error: 'Tarefa não encontrada ou acesso negado' });
  }

  const updated = await prisma.task.update({
    where: { id: task.id },
    data: parse.data,
  });

  return res.json(updated);
};

export const deleteTask = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user?.userId;

  const task = await prisma.task.findUnique({
    where: { id: Number(id) },
  });

  if (!task || task.userId !== userId) {
    return res.status(404).json({ error: 'Tarefa não encontrada ou acesso negado' });
  }

  const updated = await prisma.task.delete({
    where: { id: task.id }
  });

  return res.status(204).send();
}