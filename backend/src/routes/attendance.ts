import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../utils/auth';

function toDateString(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function (prisma: PrismaClient) {
  const router = Router();
  router.use(authMiddleware);

  // Check In
  router.post('/checkin', async (req: any, res) => {
    const { lat, lng, notes } = req.body;
    const today = toDateString(new Date());
    const userId = req.user.id;

    try {
      const existing = await prisma.attendance.findUnique({ where: { userId_date: { userId, date: today } } });
      if (existing?.checkIn) return res.status(400).json({ error: 'Already checked in today' });

      const record = existing
        ? await prisma.attendance.update({
            where: { userId_date: { userId, date: today } },
            data: { checkIn: new Date(), checkInLat: lat, checkInLng: lng, notes },
            include: { user: { select: { name: true, email: true, role: true } } },
          })
        : await prisma.attendance.create({
            data: { userId, date: today, checkIn: new Date(), checkInLat: lat, checkInLng: lng, notes },
            include: { user: { select: { name: true, email: true, role: true } } },
          });

      res.json(record);
    } catch (err) {
      res.status(500).json({ error: 'Check-in failed' });
    }
  });

  // Check Out
  router.post('/checkout', async (req: any, res) => {
    const { lat, lng } = req.body;
    const today = toDateString(new Date());
    const userId = req.user.id;

    try {
      const existing = await prisma.attendance.findUnique({ where: { userId_date: { userId, date: today } } });
      if (!existing?.checkIn) return res.status(400).json({ error: 'Must check in first' });
      if (existing.checkOut) return res.status(400).json({ error: 'Already checked out today' });

      const checkOutTime = new Date();
      const hours = (checkOutTime.getTime() - existing.checkIn!.getTime()) / 3600000;

      const record = await prisma.attendance.update({
        where: { userId_date: { userId, date: today } },
        data: { checkOut: checkOutTime, checkOutLat: lat, checkOutLng: lng, hoursWorked: +hours.toFixed(2) },
        include: { user: { select: { name: true, email: true, role: true } } },
      });
      res.json(record);
    } catch (err) {
      res.status(500).json({ error: 'Check-out failed' });
    }
  });

  // My attendance (own user)
  router.get('/my', async (req: any, res) => {
    const records = await prisma.attendance.findMany({
      where: { userId: req.user.id },
      orderBy: { date: 'desc' },
      take: 30,
    });
    res.json(records);
  });

  // Today's record for current user
  router.get('/today', async (req: any, res) => {
    const today = toDateString(new Date());
    const record = await prisma.attendance.findUnique({
      where: { userId_date: { userId: req.user.id, date: today } },
    });
    res.json(record || null);
  });

  // Admin: all attendance for a date
  router.get('/all', async (req: any, res) => {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'MANAGER') {
      return res.status(403).json({ error: 'Access denied' });
    }
    const { date } = req.query;
    const where = date ? { date: String(date) } : {};
    const records = await prisma.attendance.findMany({
      where,
      orderBy: [{ date: 'desc' }, { checkIn: 'asc' }],
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
    });
    res.json(records);
  });

  return router;
}
