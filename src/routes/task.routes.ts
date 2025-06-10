import { Router } from 'express';
import { createTask, deleteTask, getTasks, updateTask } from '../controllers/task.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const taskRoutes = Router();

taskRoutes.use(authMiddleware);
taskRoutes.get('/', getTasks);
taskRoutes.post('/', createTask)
taskRoutes.patch('/:id', updateTask)
taskRoutes.delete('/:id', deleteTask)

export default taskRoutes