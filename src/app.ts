// src/app.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './prisma/client';
import authRoutes from './routes/auth.routes';
import { authMiddleware } from './middlewares/auth.middleware';
import taskRoutes from './routes/task.routes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);
app.use('/private', authMiddleware, (req, res) => {
  res.json({message : 'Rota protegida!'})
});

export default app;
