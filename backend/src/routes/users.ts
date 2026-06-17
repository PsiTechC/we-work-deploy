import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { authMiddleware } from '../utils/auth';

function adminOnly(req: any, res: any, next: any) {
  if (req.user?.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });
  next();
}

export default function (prisma: PrismaClient) {
  const router = Router();
  router.use(authMiddleware);

  // List all users (admin only)
  router.get('/', adminOnly, async (_req, res) => {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, phone: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  });

  // Create user (admin only)
  router.post('/', adminOnly, async (req, res) => {
    const { email, password, name, role, phone } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already exists' });
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hash, name, role: role || 'EMPLOYEE', phone },
      select: { id: true, email: true, name: true, role: true, phone: true, isActive: true, createdAt: true },
    });
    res.json(user);
  });

  // Update user (admin only)
  router.put('/:id', adminOnly, async (req, res) => {
    const id = Number(req.params.id);
    const { name, role, phone, isActive, password } = req.body;
    const data: any = { name, role, phone, isActive };
    if (password) data.password = await bcrypt.hash(password, 10);
    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, name: true, role: true, phone: true, isActive: true, createdAt: true },
    });
    res.json(user);
  });

  // Delete user (admin only)
  router.delete('/:id', adminOnly, async (req: any, res) => {
    const id = Number(req.params.id);
    if (id === req.user?.id) return res.status(400).json({ error: 'Cannot delete yourself' });
    await prisma.user.delete({ where: { id } });
    res.json({ ok: true });
  });

  return router;
}
