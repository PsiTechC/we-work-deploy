import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../utils/auth';

export default function (prisma: PrismaClient) {
  const router = Router();
  router.use(authMiddleware);

  router.get('/summary', async (req, res) => {
    try {
      const invoices = await prisma.invoice.findMany({ include: { site: true } });
      const expenses = await prisma.expense.findMany({ include: { site: true } });
      const customers = await prisma.customer.findMany();
      const vendors = await prisma.vendor.findMany();

      const totalSales = invoices.reduce((s, i) => s + (i.total || 0), 0);
      const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
      const pendingInvoices = invoices.filter((i: any) => !i.status || i.status === 'PENDING').length;

      const siteExpenses: Record<string, number> = {};
      expenses.forEach((e) => {
        const name = e.site?.name || 'Unknown';
        siteExpenses[name] = (siteExpenses[name] || 0) + e.amount;
      });

      const monthlySales: Record<string, number> = {};
      const monthlyExpenses: Record<string, number> = {};
      invoices.forEach((i) => {
        const k = new Date(i.date).toISOString().slice(0, 7);
        monthlySales[k] = (monthlySales[k] || 0) + (i.total || 0);
      });
      expenses.forEach((e) => {
        const k = new Date(e.date).toISOString().slice(0, 7);
        monthlyExpenses[k] = (monthlyExpenses[k] || 0) + e.amount;
      });

      res.json({
        totalSales,
        totalExpenses,
        pendingInvoices,
        totalCustomers: customers.length,
        totalVendors: vendors.length,
        siteExpenses,
        monthlySales,
        monthlyExpenses,
        recentInvoices: invoices.slice(-5).reverse(),
        recentExpenses: expenses.slice(-5).reverse(),
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch summary' });
    }
  });

  return router;
}
