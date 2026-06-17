import { Router } from 'express';

const faqs: { patterns: string[]; answer: string }[] = [
  {
    patterns: ['hello', 'hi', 'hey', 'namaste'],
    answer: 'Hello! Welcome to We Work Constructions assistant. I can help you with invoices, expenses, customers, vendors, reports, and more. What would you like to know?',
  },
  {
    patterns: ['invoice', 'bill', 'create invoice', 'new invoice'],
    answer: 'To create an invoice: go to **Invoices → New Invoice**. Select the site (Mumbai/Pune/Satara), enter the customer name, add line items with quantity and unit price. The system auto-calculates **18% GST** and generates a unique invoice number. You can also download invoices as PDF.',
  },
  {
    patterns: ['gst', 'tax', 'percent'],
    answer: 'We Work Constructions applies **18% GST** on all sales invoices. The system auto-calculates: Subtotal → Tax (18%) → Total. This is displayed on the invoice and in the PDF download.',
  },
  {
    patterns: ['expense', 'submit expense', 'add expense'],
    answer: 'To add an expense: go to **Expenses → New Expense**. Select the site, choose a category (Travel / Materials / Office / Labor / Misc), enter the amount and notes. Managers can approve expenses. Receipts can be uploaded for record-keeping.',
  },
  {
    patterns: ['customer', 'client', 'add customer'],
    answer: 'Manage customers under the **Customers** section. You can add name, phone, and address. Each customer has a ledger showing all linked invoices and payment history.',
  },
  {
    patterns: ['vendor', 'supplier', 'add vendor'],
    answer: 'Manage vendors under the **Vendors** section. Add vendor name, agency code, and phone. Purchase history is tracked per vendor.',
  },
  {
    patterns: ['site', 'location', 'mumbai', 'pune', 'satara'],
    answer: 'We Work Constructions operates across **3 sites**: Mumbai, Pune, and Satara. Invoices and expenses are tagged to a specific site. The dashboard shows site-wise expense breakdowns in a pie chart.',
  },
  {
    patterns: ['dashboard', 'analytics', 'overview', 'summary'],
    answer: 'The **Dashboard** shows: Total Sales, Total Expenses, Pending Payments (cards), a Sales vs Expenses bar chart, a site-wise expense pie chart, and a recent transactions table — all updated in real time.',
  },
  {
    patterns: ['report', 'filter', 'date range', 'export'],
    answer: 'Go to **Reports** to view Sales Report, Expense Report, Customer Ledger, and Vendor Purchases. Use the date range and site filters to narrow results. Reports show totals and itemized breakdowns.',
  },
  {
    patterns: ['login', 'password', 'register', 'account'],
    answer: 'Use your email and password to log in. Default admin credentials are **admin@wework.com / adminpass**. Roles include Admin, Manager, and Employee — each with different access levels.',
  },
  {
    patterns: ['role', 'permission', 'access', 'admin', 'manager', 'employee'],
    answer: '**Roles:** Admin — full access to all modules. Manager — can approve expenses and view reports. Employee — can create invoices and submit expenses. Access is controlled via JWT tokens.',
  },
  {
    patterns: ['pdf', 'download', 'print'],
    answer: 'Every invoice has a **Download PDF** button. The PDF includes invoice number, site, customer, line items, subtotal, 18% GST, and total — branded with We Work Constructions.',
  },
  {
    patterns: ['payment', 'pending', 'paid', 'overdue', 'status'],
    answer: 'Invoice statuses: **Paid** (payment received), **Pending** (awaiting payment), **Overdue** (past due date). You can update invoice status from the Invoices list.',
  },
  {
    patterns: ['real time', 'notification', 'socket', 'alert'],
    answer: 'The system uses **Socket.io** for real-time notifications. When a new invoice is created or an expense is submitted, connected users receive an instant notification.',
  },
  {
    patterns: ['help', 'what can you do', 'support', 'question'],
    answer: 'I can answer questions about: **Invoices, Expenses, Customers, Vendors, Sites, Dashboard, Reports, Roles, PDF downloads, GST, Payments, and Real-time features**. Just ask!',
  },
];

function getBotReply(message: string): string {
  const lower = message.toLowerCase();
  for (const faq of faqs) {
    if (faq.patterns.some((p) => lower.includes(p))) {
      return faq.answer;
    }
  }
  return "I'm not sure about that. Try asking about **invoices, expenses, customers, vendors, dashboard, reports, GST, or roles**. You can also contact support at admin@wework.com.";
}

export default function () {
  const router = Router();

  router.post('/', (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'message required' });
    const reply = getBotReply(String(message));
    res.json({ reply });
  });

  return router;
}
