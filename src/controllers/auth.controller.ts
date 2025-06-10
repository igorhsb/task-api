import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../prisma/client';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

// Validação dos dados com Zod
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'A senha precisa ter no mínimo 6 caracteres'),
});

const inputSchema = z.object({
  login : z.string(),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 carcateres')
});

export const register = async (req: Request, res: Response) => {
  const parse = registerSchema.safeParse(req.body);

  if (!parse.success) {
    return res.status(400).json({ errors: parse.error.flatten().fieldErrors });
  }

  const { email, password } = parse.data;

  // Verifica se o e-mail já existe
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    return res.status(409).json({ error: 'Email já está em uso' });
  }

  // Hash da senha
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });

  return res.status(201).json({ message: 'Usuário criado com sucesso!', user: { id: user.id, email: user.email } });
};


const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const login = async (req: Request, res: Response) => {
  const parse = loginSchema.safeParse(req.body);

  if (!parse.success) {
    return res.status(400).json({ errors: parse.error.flatten().fieldErrors });
  }

  const { email, password } = parse.data;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }
  
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );

  return res.json({ token });
};