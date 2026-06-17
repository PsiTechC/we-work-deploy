import PDFDocument from 'pdfkit';

export async function generateInvoicePdfBuffer(invoice: any): Promise<Buffer> {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    doc.fontSize(20).text('We Work Constructions', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Invoice #: ${invoice.invoiceNumber}`);
    doc.text(`Date: ${invoice.date?.toISOString?.() || invoice.date}`);
    doc.text(`Site: ${invoice.site?.name || ''}`);
    doc.moveDown();

    doc.text('Items:');
    invoice.items?.forEach((it: any) => {
      doc.text(`${it.description} — ${it.quantity} x ${it.unitPrice} = ${it.total}`);
    });

    doc.moveDown();
    doc.text(`Subtotal: ${invoice.subtotal || ''}`);
    doc.text(`Tax: ${invoice.tax || ''}`);
    doc.text(`Total: ${invoice.total || ''}`);

    doc.end();
  });
}
