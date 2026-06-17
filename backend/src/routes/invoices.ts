import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { generateInvoicePdfBuffer } from '../utils/pdf';
import { authMiddleware } from '../utils/auth';

export default function(prisma: PrismaClient) {
  const router = Router();

  router.get('/', authMiddleware, async (req: any, res) => {
    const invoices = await prisma.invoice.findMany({ include: { items: true, site: true } });
    res.json(invoices);
  });

  router.post('/', authMiddleware, async (req: any, res) => {
    try {
      const { siteId, customerName, items, dueDate } = req.body
      // calculate subtotal, tax (18%), total
      const computedItems = Array.isArray(items) ? items : []
      const subtotal = computedItems.reduce((s: number, it: any) => s + (Number(it.quantity) * Number(it.unitPrice)), 0)
      const tax = +(subtotal * 0.18).toFixed(2)
      const total = +(subtotal + tax).toFixed(2)

      const invoiceNumber = `INV-${Date.now()}`

      const created = await prisma.invoice.create({
        data: {
          invoiceNumber,
          siteId: Number(siteId),
          customerName,
          subtotal,
          tax,
          total,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          items: { create: computedItems.map((it: any) => ({ description: it.description, quantity: Number(it.quantity), unitPrice: Number(it.unitPrice), total: Number(it.quantity) * Number(it.unitPrice) })) }
        },
        include: { items: true, site: true }
      })

      // emit socket event if needed (socket not implemented here)
      res.json(created)
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Failed to create invoice' })
    }
  })

  router.get('/:id', authMiddleware, async (req: any, res) => {
    const id = Number(req.params.id);
    const invoice = await prisma.invoice.findUnique({ where: { id }, include: { items: true, site: true } });
    if (!invoice) return res.status(404).json({ error: 'Not found' });
    res.json(invoice);
  });

  router.get('/:id/download', authMiddleware, async (req: any, res) => {
    const id = Number(req.params.id);
    const invoice = await prisma.invoice.findUnique({ where: { id }, include: { items: true, site: true } });
    if (!invoice) return res.status(404).json({ error: 'Not found' });

    // Log audit entry
    try {
      await prisma.audit.create({ data: { userId: req.user.id, action: 'download_invoice', invoiceId: id } });
    } catch (e) {
      console.warn('Audit log failed', e);
    }

    const pdfBuffer = await generateInvoicePdfBuffer(invoice as any);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);
    res.send(pdfBuffer);
  });

  return router;
}
