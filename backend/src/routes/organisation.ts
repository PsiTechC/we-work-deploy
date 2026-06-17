import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authMiddleware } from '../utils/auth';

const docsDir = path.join(__dirname, '../../../uploads/org-docs');
if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, docsDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

function adminOnly(req: any, res: any, next: any) {
  if (req.user?.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });
  next();
}

export default function (prisma: PrismaClient) {
  const router = Router();
  router.use(authMiddleware);
  router.use(adminOnly);

  // Get org profile (create if not exists)
  router.get('/profile', async (_req, res) => {
    let org = await (prisma as any).organisation.findFirst();
    if (!org) org = await (prisma as any).organisation.create({ data: {} });
    res.json(org);
  });

  // Update org profile
  router.put('/profile', async (req, res) => {
    const { companyName, tagline, regNumber, gstNumber, panNumber, address, city, state, pincode, phone, email, website } = req.body;
    let org = await (prisma as any).organisation.findFirst();
    if (!org) {
      org = await (prisma as any).organisation.create({ data: { companyName, tagline, regNumber, gstNumber, panNumber, address, city, state, pincode, phone, email, website } });
    } else {
      org = await (prisma as any).organisation.update({
        where: { id: org.id },
        data: { companyName, tagline, regNumber, gstNumber, panNumber, address, city, state, pincode, phone, email, website },
      });
    }
    res.json(org);
  });

  // List documents
  router.get('/documents', async (_req, res) => {
    const docs = await (prisma as any).orgDocument.findMany({ orderBy: { uploadedAt: 'desc' } });
    res.json(docs);
  });

  // Upload document
  router.post('/documents', upload.single('file'), async (req: any, res: any) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const { name, docType } = req.body;
    if (!name) return res.status(400).json({ error: 'Document name is required' });
    const doc = await (prisma as any).orgDocument.create({
      data: { name, docType: docType || 'Other', fileUrl: `/uploads/org-docs/${req.file.filename}` },
    });
    res.json(doc);
  });

  // Delete document
  router.delete('/documents/:id', async (req: any, res: any) => {
    const id = Number(req.params.id);
    const doc = await (prisma as any).orgDocument.findUnique({ where: { id } });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    try {
      const filePath = path.join(__dirname, '../../../', doc.fileUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch {}
    await (prisma as any).orgDocument.delete({ where: { id } });
    res.json({ ok: true });
  });

  return router;
}
