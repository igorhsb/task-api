import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { z } from 'zod';

interface AuthRequest extends Request {
  user?: { userId: number; email: string };
}

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user?.userId;
  const { completed, page = '1', limit = '10' } = req.query;

  const take = parseInt(limit as string);
  const skip = (parseInt(page as string) - 1) * take;

  const filters: any = {
    userId,
  };

  if (completed !== undefined) {
    filters.completed = completed === 'true';
  }

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where: filters,
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    }),
    prisma.task.count({ where: filters }),
  ]);

  res.json({
    tasks,
    meta: {
      total,
      page: parseInt(page as string),
      limit: take,
      totalPages: Math.ceil(total / take),
    },
  });
};

const createTaskSchema = z.object({
  title: z.string().min(1, 'O título é obrigatório'),
});

export const createTask = async (req: Request, res: Response): Promise<void> => {
  const parse = createTaskSchema.safeParse(req.body);
  const userId = (req as any).user?.userId;

  if (!parse.success) {
    res.status(400).json({ errors: parse.error.flatten().fieldErrors });
    return
  }

  const { title } = parse.data;

  const task = await prisma.task.create({
    data: {
      title,
      userId,
    },
  });

  res.status(201).json(task);
};

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  completed: z.boolean().optional(),
});

export const updateTask = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = (req as any).user?.userId;
  const parse = updateTaskSchema.safeParse(req.body);

  if (!parse.success) {
    res.status(400).json({ errors: parse.error.flatten().fieldErrors });
    return
  }

  const task = await prisma.task.findUnique({
    where: { id: Number(id) },
  });

  if (!task || task.userId !== userId) {
    res.status(404).json({ error: 'Tarefa não encontrada ou acesso negado' });
    return
  }

  const updated = await prisma.task.update({
    where: { id: task.id },
    data: parse.data,
  });

  res.json(updated);
};

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = (req as any).user?.userId;

  const task = await prisma.task.findUnique({
    where: { id: Number(id) },
  });

  if (!task || task.userId !== userId) {
    res.status(404).json({ error: 'Tarefa não encontrada ou acesso negado' });
    return
  }

  const updated = await prisma.task.delete({
    where: { id: task.id }
  });

  res.status(204).send();
}