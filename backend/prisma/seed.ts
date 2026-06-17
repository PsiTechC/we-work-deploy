import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt'

const prisma = new PrismaClient();

async function main() {
  const sites = ['Mumbai', 'Pune', 'Satara'];
  for (const name of sites) {
    await prisma.site.upsert({ where: { name }, update: {}, create: { name } });
  }

  const adminEmail = 'admin@wework.com'
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (!existing) {
    const hash = await bcrypt.hash('adminpass', 10)
    await prisma.user.create({ data: { email: adminEmail, name: 'Admin', password: hash, role: 'ADMIN' } as any })
    console.log('Created admin user: admin@wework.com / adminpass')
  }

  const mumbai = await prisma.site.findUnique({ where: { name: 'Mumbai' } });
  if (mumbai) {
    const inv = await prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-1001',
        siteId: mumbai.id,
        customerName: 'ABC Constructions',
        subtotal: 100000,
        tax: 18000,
        total: 118000,
        items: {
          create: [
            { description: 'Cement', quantity: 100, unitPrice: 500, total: 50000 },
            { description: 'Labor', quantity: 1, unitPrice: 68000, total: 68000 }
          ]
        }
      }
    });
    console.log('Created sample invoice', inv.invoiceNumber);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
