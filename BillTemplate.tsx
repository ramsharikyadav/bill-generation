import React from 'react';
import { InvoiceData, COMPANY_DETAILS, BANK_DETAILS, LineItem } from './types';
import { formatCurrency } from './lib/utils';

interface BillTemplateProps {
  data: InvoiceData;
}

const BillTemplate: React.FC<BillTemplateProps> = ({ data }) => {
  const subtotal = data.items.reduce((sum, item) => sum + item.amount, 0);
  
  // Tax calculation logic based on the image example
  // In the image: 
  // 5% tax (2.5% CGST + 2.5% SGST)
  // 12% tax (6% CGST + 6% SGST)
  // 18% tax (9% CGST + 9% SGST)
  
  // For simplicity and matching the image, we'll group items by tax rate if we had that info.
  // Since SAC 996331 seems to be 5% and 996311 seems to be 18% (based on the image math)
  // Let's calculate based on SAC or just provide a way to set it.
  
  const taxGroups = [
    { rate: 5, taxable: 0, cgst: 0, sgst: 0 },
    { rate: 12, taxable: 0, cgst: 0, sgst: 0 },
    { rate: 18, taxable: 0, cgst: 0, sgst: 0 },
  ];

  data.items.forEach(item => {
    let rate = 5;
    if (['997321', '999714', '999729', '996423'].includes(item.sac)) rate = 18;
    else if (['996311', '996331'].includes(item.sac)) rate = 5;
    
    const group = taxGroups.find(g => g.rate === rate);
    if (group) {
      group.taxable += item.amount;
      group.cgst += (item.amount * (rate / 2)) / 100;
      group.sgst += (item.amount * (rate / 2)) / 100;
    }
  });

  const totalCgst = taxGroups.reduce((sum, g) => sum + g.cgst, 0);
  const totalSgst = taxGroups.reduce((sum, g) => sum + g.sgst, 0);
  const grandTotal = subtotal + totalCgst + totalSgst;
  const roundedTotal = Math.round(grandTotal);
  const roundOff = roundedTotal - grandTotal;

  return (
    <div className="bg-white p-6 text-[11px] font-serif max-w-[800px] mx-auto border border-[#d1d5db] shadow-2xl print:border-0 print:p-0 print:shadow-none" id="printable-bill">
      {/* Header */}
      <div className="text-center border-b-2 border-black pb-2 mb-2">
        <h1 className="text-3xl font-bold uppercase tracking-widest" style={{ fontFamily: 'Times New Roman, serif' }}>{COMPANY_DETAILS.name}</h1>
        <p className="font-bold text-[13px] mt-1">{COMPANY_DETAILS.subName}</p>
        <p className="text-[12px]">{COMPANY_DETAILS.address}</p>
        <p className="font-bold text-[12px]">GSTN: {COMPANY_DETAILS.gstn}</p>
        <p className="text-[11px]">{COMPANY_DETAILS.contact}</p>
      </div>

      {/* Bill To & Invoice Info */}
      <div className="grid grid-cols-12 border border-black mb-0">
        <div className="col-span-8 border-r border-black bg-[#E5E4E2] px-2 py-1 font-bold text-[12px]">Bill To</div>
        <div className="col-span-2 border-r border-black bg-[#E5E4E2] px-2 py-1 font-bold text-[12px]">Invoice #{data.invoiceNumber}</div>
        <div className="col-span-2 bg-[#E5E4E2] px-2 py-1 font-bold text-[12px]">Date:{data.date}</div>
      </div>
      
      <div className="grid grid-cols-12 border-x border-b border-black min-h-[100px]">
        <div className="col-span-12 p-3 leading-relaxed text-[12px]">
          <p className="font-bold text-[13px]">{data.customer.name || 'Company Name'}</p>
          <p>{data.customer.address || 'Address'}</p>
          <p>{data.customer.city || 'City'}</p>
          <p className="mt-2 font-bold">GSTN NO. {data.customer.gstn || ''}</p>
        </div>
      </div>

      {/* Main Table */}
      <table className="w-full border-collapse border-x border-black">
        <thead>
          <tr className="bg-[#E5E4E2] border-y border-black">
            <th className="border-r border-black px-2 py-1 w-[12%] text-center">Date</th>
            <th className="border-r border-black px-2 py-1 w-[38%] text-center">Description</th>
            <th className="border-r border-black px-2 py-1 w-[10%] text-center">SAC</th>
            <th className="border-r border-black px-2 py-1 w-[10%] text-center">Qty</th>
            <th className="border-r border-black px-2 py-1 w-[15%] text-center">Rate</th>
            <th className="px-2 py-1 w-[15%] text-center">Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, idx) => (
            <tr key={item.id} className="border-b border-[#e5e7eb]">
              <td className="border-r border-black px-2 py-1 text-center align-top">{item.date}</td>
              <td className="border-r border-black px-2 py-1 align-top">{item.description}</td>
              <td className="border-r border-black px-2 py-1 text-center align-top">{item.sac}</td>
              <td className="border-r border-black px-2 py-1 text-center align-top">{item.qty}</td>
              <td className="border-r border-black px-2 py-1 text-right align-top">{formatCurrency(item.rate)}</td>
              <td className="px-2 py-1 text-right align-top">{formatCurrency(item.amount)}</td>
            </tr>
          ))}
          {/* Fill remaining space if few items */}
          {data.items.length < 5 && Array.from({ length: 5 - data.items.length }).map((_, i) => (
            <tr key={`empty-${i}`} className="border-b border-[#e5e7eb] h-6">
              <td className="border-r border-black"></td>
              <td className="border-r border-black"></td>
              <td className="border-r border-black"></td>
              <td className="border-r border-black"></td>
              <td className="border-r border-black"></td>
              <td></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals Section */}
      <div className="grid grid-cols-12 border border-black border-t-0">
        <div className="col-span-7 border-r border-black"></div>
        <div className="col-span-5">
          <div className="grid grid-cols-2 border-b border-black">
            <div className="px-2 py-1 font-bold">Subtotal</div>
            <div className="px-2 py-1 text-right font-bold">{formatCurrency(subtotal)}</div>
          </div>
          
          {/* Detailed CGST/SGST rows */}
          {taxGroups.filter(g => g.taxable > 0).map((group, idx) => (
            <React.Fragment key={idx}>
              <div className="grid grid-cols-2">
                <div className="px-2 py-0.5">CGST {group.rate/2}%</div>
                <div className="px-2 py-0.5 text-right">{formatCurrency(group.cgst)}</div>
              </div>
              <div className="grid grid-cols-2 border-b border-gray-200 last:border-b-black">
                <div className="px-2 py-0.5">SGST {group.rate/2}%</div>
                <div className="px-2 py-0.5 text-right">{formatCurrency(group.sgst)}</div>
              </div>
            </React.Fragment>
          ))}
          
          <div className="grid grid-cols-2 border-b border-black">
            <div className="px-2 py-1">Round off</div>
            <div className="px-2 py-1 text-right">{formatCurrency(roundOff)}</div>
          </div>
          <div className="grid grid-cols-2 bg-[#F2F2F2]">
            <div className="px-2 py-1 font-bold text-[13px]">TOTAL</div>
            <div className="px-2 py-1 text-right font-bold text-[13px]">{formatCurrency(roundedTotal)}</div>
          </div>
        </div>
      </div>

      {/* Tax Summary Table */}
      <div className="mt-6">
        <table className="w-full border-collapse border border-black text-center text-[10px]">
          <thead>
            <tr className="bg-[#F2F2F2] border-b border-black">
              <th className="border-r border-black px-2 py-1">Tax Rate</th>
              <th className="border-r border-black px-2 py-1">Taxable Amount</th>
              <th className="border-r border-black px-2 py-1">CGST</th>
              <th className="border-r border-black px-2 py-1">SGST</th>
              <th className="px-2 py-1">Total tax</th>
            </tr>
          </thead>
          <tbody>
            {taxGroups.map((group, idx) => (
              <tr key={idx} className="border-b border-black">
                <td className="border-r border-black px-2 py-1">{group.rate}%</td>
                <td className="border-r border-black px-2 py-1 text-right">{formatCurrency(group.taxable)}</td>
                <td className="border-r border-black px-2 py-1 text-right">{formatCurrency(group.cgst)}</td>
                <td className="border-r border-black px-2 py-1 text-right">{formatCurrency(group.sgst)}</td>
                <td className="px-2 py-1 text-right">{formatCurrency(group.cgst + group.sgst)}</td>
              </tr>
            ))}
            <tr className="font-bold bg-[#F2F2F2]">
              <td className="border-r border-black px-2 py-1">TOTAL</td>
              <td className="border-r border-black px-2 py-1 text-right">{formatCurrency(subtotal)}</td>
              <td className="border-r border-black px-2 py-1 text-right">{formatCurrency(totalCgst)}</td>
              <td className="border-r border-black px-2 py-1 text-right">{formatCurrency(totalSgst)}</td>
              <td className="px-2 py-1 text-right">{formatCurrency(totalCgst + totalSgst)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer Details */}
      <div className="mt-6 grid grid-cols-2 border border-black min-h-[150px]">
        <div className="border-r border-black p-3 space-y-2">
          <p className="font-bold underline text-[12px]">Terms & Conditions:</p>
          <ol className="list-decimal ml-5 text-[11px] leading-relaxed">
            {data.terms.map((term, idx) => (
              <li key={idx}>{term}</li>
            ))}
          </ol>
          <div className="mt-3 space-y-1 text-[11px]">
            <p><span className="font-bold">Name -</span> {BANK_DETAILS.name}</p>
            <p><span className="font-bold">Bank Name -</span> {BANK_DETAILS.bankName}</p>
            <p><span className="font-bold">Account No.</span> {BANK_DETAILS.accountNo}</p>
            <p><span className="font-bold">Branch -</span> {BANK_DETAILS.branch}</p>
            <p><span className="font-bold">IFSC -</span> {BANK_DETAILS.ifsc}</p>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="p-3 text-center font-bold text-[12px] border-b border-black">FOR {COMPANY_DETAILS.name}</div>
          <div className="flex-grow"></div>
          <div className="p-3 text-center border-t border-black font-bold text-[12px] uppercase">AUTHORIZED SIGNATORY</div>
        </div>
      </div>

      <div className="text-center mt-6 italic font-bold text-[13px]">
        Thank you for your business !
      </div>
    </div>
  );
};

export default BillTemplate;
