import React from 'react'

// Fixed company / supplier details (We Work Constructions)
export const COMPANY = {
  name: 'WE WORK CONSTRUCTIONS',
  office: 'Office :-Gat No 179, Flat No B-507, Nisarg Raghavendra Soceity. Moshi Pune 412105',
  mobile: '+91 7588077493',
  gst: '27BYOPD3282Q1ZP',
  email: 'weworkconstructions@gmail.com',
  supplierName: 'M/s. WE WORK CONSTRUCTIONS',
  supplierAddr: ['Gat No 179, Flat No B-507,', 'Nisarg Raghavendra Soceity.', 'Moshi Pune 412105'],
  bankAccount: '50200087489444',
  bankName: 'HDFC BANK.',
  bankBranch: 'DEHU ROAD MOSHI.',
  bankIfsc: 'HDFC0008976',
  pan: 'BYOPD3282Q',
}

const inr = (n: number) =>
  '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const num = (n: number) =>
  Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function CompanyLogo() {
  // Orange stacked-bars building mark, recreated in SVG
  return (
    <svg width="70" height="60" viewBox="0 0 70 60" aria-label="We Work logo">
      <polygon points="8,52 8,20 22,10 22,52" fill="#c9ccce" />
      <polygon points="22,52 22,4 38,14 38,52" fill="#f39c12" />
      <polygon points="38,52 38,16 40,16 40,52" fill="#b0b4b7" />
      <rect x="40" y="18" width="6" height="34" fill="#f39c12" />
      <rect x="47" y="22" width="5" height="30" fill="#c9ccce" />
      <rect x="53" y="26" width="5" height="26" fill="#f39c12" />
    </svg>
  )
}

export default function InvoiceDocument({ bill }: { bill: any }) {
  const dateStr = new Date(bill.date).toLocaleDateString('en-GB').replace(/\//g, '.')
  const items: any[] = bill.items || []
  const blankRows = Math.max(0, 8 - items.length)

  const cell: React.CSSProperties = { border: '1px solid #000', padding: '3px 5px', fontSize: 11, verticalAlign: 'top' }
  const th: React.CSSProperties = { ...cell, fontWeight: 700, textAlign: 'center', background: '#fff' }

  return (
    <div style={{
      width: 720, margin: '0 auto', background: '#fff', color: '#000',
      fontFamily: 'Arial, Helvetica, sans-serif', border: '2px solid #000', padding: 0,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderBottom: '1px solid #000' }}>
        <CompanyLogo />
        <div style={{ flex: 1 }}>
          <div style={{ color: '#f39c12', fontWeight: 800, fontSize: 30, fontFamily: 'Georgia, "Times New Roman", serif', letterSpacing: 1 }}>
            {COMPANY.name}
          </div>
          <div style={{ fontSize: 9.5, textAlign: 'center', marginTop: 2 }}>{COMPANY.office}</div>
          <div style={{ fontSize: 9.5, textAlign: 'center' }}>Mobile :- {COMPANY.mobile}</div>
          <div style={{ fontSize: 9.5, textAlign: 'center' }}>GST No :- {COMPANY.gst}</div>
          <div style={{ fontSize: 9.5, textAlign: 'center' }}>Email :- {COMPANY.email}</div>
        </div>
      </div>

      <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 12, borderBottom: '1px solid #000', padding: '3px 0' }}>
        TAX INVOICE
      </div>

      {/* Invoice no / date */}
      <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>
        <div style={{ flex: 1, padding: '3px 8px', fontSize: 11, fontWeight: 700, borderRight: '1px solid #000' }}>
          Invoice No:- {bill.invoiceNumber}
        </div>
        <div style={{ flex: 1, padding: '3px 8px', fontSize: 11, fontWeight: 700, textAlign: 'right' }}>
          Dated:-{dateStr}
        </div>
      </div>

      {/* Supplier / Bill To */}
      <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>
        <div style={{ flex: 1, padding: '6px 8px', borderRight: '1px solid #000', fontSize: 11 }}>
          <div style={{ fontWeight: 700 }}>Supplier Details</div>
          <div style={{ fontWeight: 700 }}>{COMPANY.supplierName}</div>
          {COMPANY.supplierAddr.map((l, i) => <div key={i}>{l}</div>)}
          <div style={{ fontWeight: 700, marginTop: 2 }}>GST NO:- {COMPANY.gst}</div>
        </div>
        <div style={{ flex: 1, padding: '6px 8px', fontSize: 11, textAlign: 'center' }}>
          <div style={{ fontWeight: 700 }}>Bill To:</div>
          <div style={{ fontWeight: 700 }}>{bill.billToName}</div>
          {(bill.billToAddress || '').split('\n').map((l: string, i: number) => <div key={i}>{l}</div>)}
          {bill.billToGst ? <div style={{ fontWeight: 700, marginTop: 2 }}>GST NO:- {bill.billToGst}</div> : null}
        </div>
      </div>

      {/* PO / Project */}
      <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>
        <div style={{ flex: 1, padding: '4px 8px', borderRight: '1px solid #000', fontSize: 11 }}>
          <div style={{ fontWeight: 700 }}>PO Number:- {bill.poNumber || ''}</div>
          <div style={{ fontWeight: 700 }}>PO Date-: {bill.poDate || ''}</div>
          <div style={{ fontWeight: 700 }}>Vendor Coad:- {bill.vendorCode || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '4px 8px', fontSize: 11 }}>
          <div style={{ fontWeight: 700 }}>Project Code:- {bill.projectCode || ''}</div>
          <div style={{ fontWeight: 700 }}>Project Name:-{bill.projectName || ''}</div>
        </div>
      </div>

      {/* Items table */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ ...th, width: 42 }}>Line No</th>
            <th style={{ ...th, width: 210, textAlign: 'left' }}>DESCRIPTION</th>
            <th style={{ ...th, width: 70 }}>HSN/SAC</th>
            <th style={{ ...th, width: 44 }}>UNIT</th>
            <th style={{ ...th, width: 50 }}>QTY</th>
            <th style={{ ...th, width: 70 }}>UNIT PRICE</th>
            <th style={{ ...th, width: 90 }}>AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={i}>
              <td style={{ ...cell, textAlign: 'center' }}>{it.lineNo}</td>
              <td style={cell}>{it.description}</td>
              <td style={{ ...cell, textAlign: 'center' }}>{it.hsnCode}</td>
              <td style={{ ...cell, textAlign: 'center' }}>{it.unit}</td>
              <td style={{ ...cell, textAlign: 'center' }}>{it.quantity}</td>
              <td style={{ ...cell, textAlign: 'right' }}>{num(it.unitPrice)}</td>
              <td style={{ ...cell, textAlign: 'right' }}>{num(it.amount)}</td>
            </tr>
          ))}
          {Array.from({ length: blankRows }).map((_, i) => (
            <tr key={'b' + i}>
              {Array.from({ length: 7 }).map((__, j) => <td key={j} style={{ ...cell, height: 18 }}>&nbsp;</td>)}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td style={{ ...cell, textAlign: 'center', fontWeight: 700 }}>Total Before Taxes</td>
            <td style={{ ...cell, width: 130, textAlign: 'right' }}>{inr(bill.subtotal)}</td>
          </tr>
          <tr>
            <td style={{ ...cell, textAlign: 'center', fontWeight: 700 }}>CGST {bill.gstRate}%</td>
            <td style={{ ...cell, width: 130, textAlign: 'right' }}>{inr(bill.cgst)}</td>
          </tr>
          <tr>
            <td style={{ ...cell, textAlign: 'center', fontWeight: 700 }}>SGST {bill.gstRate}%</td>
            <td style={{ ...cell, width: 130, textAlign: 'right' }}>{inr(bill.sgst)}</td>
          </tr>
          <tr>
            <td style={{ ...cell, textAlign: 'center', fontWeight: 700 }}>Total  with taxes</td>
            <td style={{ ...cell, width: 130, textAlign: 'right' }}>{inr(bill.total)}</td>
          </tr>
          <tr>
            <td style={{ ...cell, textAlign: 'center', fontWeight: 700 }}>Net Payable Amount</td>
            <td style={{ ...cell, width: 130, textAlign: 'right', fontWeight: 700 }}>Rs. {num(bill.total)}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ ...cell, fontWeight: 700, fontSize: 11, borderTop: 'none' }}>
        Total Amount (In words):- {bill.amountInWords}
      </div>

      {/* Bank + signature */}
      <div style={{ display: 'flex', borderTop: '1px solid #000' }}>
        <div style={{ flex: 1, padding: '4px 8px', borderRight: '1px solid #000', fontSize: 11 }}>
          <div style={{ fontWeight: 700 }}>Bank Account No - {COMPANY.bankAccount}.</div>
          <div style={{ fontWeight: 700 }}>Bank Name :- {COMPANY.bankName}</div>
          <div style={{ fontWeight: 700 }}>Branch Name:- {COMPANY.bankBranch}</div>
          <div style={{ fontWeight: 700 }}>Bank Branch IFSC - {COMPANY.bankIfsc}</div>
          <div style={{ fontWeight: 700 }}>PAN NO- {COMPANY.pan}</div>
        </div>
        <div style={{ flex: 1, padding: '4px 8px', fontSize: 11, textAlign: 'center' }}>
          <div style={{ fontWeight: 700 }}>FOR WE WORK CONSTRUCTIONS</div>
          <div style={{ height: 54 }} />
          <div style={{ fontWeight: 700, borderTop: '1px solid #000', paddingTop: 2 }}>Proprietor</div>
        </div>
      </div>
    </div>
  )
}
