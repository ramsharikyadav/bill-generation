import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Printer, Download, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { InvoiceData, LineItem, DEFAULT_TERMS } from './types';
import BillTemplate from './BillTemplate';
import { cn } from './lib/utils';

export default function App() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: 'SEE' + Math.floor(1000 + Math.random() * 9000),
    date: format(new Date(), 'dd/MM/yy'),
    customer: {
      name: '',
      address: '',
      city: '',
      gstn: '',
    },
    items: [
      {
        id: crypto.randomUUID(),
        date: format(new Date(), 'dd/MM/yyyy'),
        description: 'Breakfast',
        sac: '996331',
        qty: 1,
        rate: 0,
        amount: 0,
      }
    ],
    terms: DEFAULT_TERMS,
  });

  const [isPreview, setIsPreview] = useState(false);

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInvoiceData(prev => ({
      ...prev,
      customer: { ...prev.customer, [name]: value }
    }));
  };

  const handleInvoiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInvoiceData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (id: string, field: keyof LineItem, value: string | number) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'qty' || field === 'rate') {
            updatedItem.amount = Number(updatedItem.qty) * Number(updatedItem.rate);
          }
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const addItem = () => {
    setInvoiceData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: crypto.randomUUID(),
          date: format(new Date(), 'dd/MM/yyyy'),
          description: '',
          sac: '996331',
          qty: 1,
          rate: 0,
          amount: 0,
        }
      ]
    }));
  };

  const removeItem = (id: string) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('printable-bill');
    if (!element) return;

    // @ts-ignore - html2pdf is not typed in standard @types
    const html2pdf = (await import('html2pdf.js')).default;
    
    const opt = {
      margin: 10,
      filename: `Invoice_${invoiceData.invoiceNumber}_${invoiceData.date.replace(/\//g, '-')}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };

    html2pdf().from(element).set(opt).save();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 print:p-0 print:bg-white">
      <div className={cn("max-w-5xl mx-auto", isPreview ? "print:max-w-none" : "")}>
        
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 print:hidden">
          <div className="flex items-center gap-2">
            <div className="bg-black p-2 rounded-lg">
              <FileText className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Shawn Elizey Bill Gen</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPreview(!isPreview)}
              className={cn(
                "px-4 py-2 rounded-full font-medium transition-all duration-200 flex items-center gap-2",
                isPreview 
                  ? "bg-gray-200 text-gray-800 hover:bg-gray-300" 
                  : "bg-black text-white hover:bg-gray-800"
              )}
            >
              {isPreview ? "Edit Details" : "Preview Bill"}
            </button>
            
            {isPreview && (
              <div className="flex gap-2">
                <button
                  onClick={handleDownloadPDF}
                  className="bg-gray-800 text-white px-4 py-2 rounded-full font-medium hover:bg-black transition-all duration-200 flex items-center gap-2 shadow-lg shadow-gray-200"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
                <button
                  onClick={handlePrint}
                  className="bg-orange-600 text-white px-4 py-2 rounded-full font-medium hover:bg-orange-700 transition-all duration-200 flex items-center gap-2 shadow-lg shadow-orange-200"
                >
                  <Printer className="w-4 h-4" />
                  Print Bill
                </button>
              </div>
            )}
          </div>
        </div>

        {!isPreview ? (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-8 space-y-8">
              {/* Invoice Meta */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8 border-bottom border-gray-100">
                <div className="space-y-4">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Invoice Details</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 uppercase">Invoice #</label>
                      <input
                        type="text"
                        name="invoiceNumber"
                        value={invoiceData.invoiceNumber}
                        onChange={handleInvoiceChange}
                        className="w-full px-4 py-2 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-black transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 uppercase">Date</label>
                      <input
                        type="text"
                        name="date"
                        value={invoiceData.date}
                        onChange={handleInvoiceChange}
                        placeholder="DD/MM/YY"
                        className="w-full px-4 py-2 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-black transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Bill To (Customer)</h2>
                  <div className="space-y-3">
                    <input
                      type="text"
                      name="name"
                      placeholder="Company Name"
                      value={invoiceData.customer.name}
                      onChange={handleCustomerChange}
                      className="w-full px-4 py-2 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-black transition-all"
                    />
                    <textarea
                      name="address"
                      placeholder="Address"
                      value={invoiceData.customer.address}
                      onChange={handleCustomerChange}
                      rows={2}
                      className="w-full px-4 py-2 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-black transition-all resize-none"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        name="city"
                        placeholder="City"
                        value={invoiceData.customer.city}
                        onChange={handleCustomerChange}
                        className="w-full px-4 py-2 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-black transition-all"
                      />
                      <input
                        type="text"
                        name="gstn"
                        placeholder="GSTN NO."
                        value={invoiceData.customer.gstn}
                        onChange={handleCustomerChange}
                        className="w-full px-4 py-2 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-black transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Line Items</h2>
                  <button
                    onClick={addItem}
                    className="text-xs font-bold uppercase tracking-tighter bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Add Item
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b border-gray-100">
                        <th className="pb-3 font-semibold text-gray-500 uppercase text-[10px]">Date</th>
                        <th className="pb-3 font-semibold text-gray-500 uppercase text-[10px]">Description</th>
                        <th className="pb-3 font-semibold text-gray-500 uppercase text-[10px]">SAC</th>
                        <th className="pb-3 font-semibold text-gray-500 uppercase text-[10px] text-center">Qty</th>
                        <th className="pb-3 font-semibold text-gray-500 uppercase text-[10px] text-right">Rate</th>
                        <th className="pb-3 font-semibold text-gray-500 uppercase text-[10px] text-right">Amount</th>
                        <th className="pb-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {invoiceData.items.map((item) => (
                        <tr key={item.id} className="group">
                          <td className="py-3 pr-2">
                            <input
                              type="text"
                              value={item.date}
                              onChange={(e) => handleItemChange(item.id, 'date', e.target.value)}
                              className="w-24 px-2 py-1 bg-transparent border-0 focus:ring-0 text-xs"
                            />
                          </td>
                          <td className="py-3 pr-2">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                              placeholder="Item description..."
                              className="w-full px-2 py-1 bg-transparent border-0 focus:ring-0 text-xs font-medium"
                            />
                          </td>
                          <td className="py-3 pr-2">
                            <select
                              value={item.sac}
                              onChange={(e) => handleItemChange(item.id, 'sac', e.target.value)}
                              className="px-2 py-1 bg-transparent border-0 focus:ring-0 text-xs"
                            >
                              <option value="996311">996311 (5%)</option>
                              <option value="996331">996331 (5%)</option>
                              <option value="997321">997321 (18%)</option>
                              <option value="999714">999714 (18%)</option>
                              <option value="999729">999729 (18%)</option>
                              <option value="996423">996423 (18%)</option>
                            </select>
                          </td>
                          <td className="py-3 pr-2">
                            <input
                              type="number"
                              value={item.qty}
                              onChange={(e) => handleItemChange(item.id, 'qty', Number(e.target.value))}
                              className="w-16 px-2 py-1 bg-transparent border-0 focus:ring-0 text-xs text-center"
                            />
                          </td>
                          <td className="py-3 pr-2">
                            <input
                              type="number"
                              value={item.rate}
                              onChange={(e) => handleItemChange(item.id, 'rate', Number(e.target.value))}
                              className="w-24 px-2 py-1 bg-transparent border-0 focus:ring-0 text-xs text-right"
                            />
                          </td>
                          <td className="py-3 text-right font-semibold text-gray-900">
                            {item.amount.toFixed(2)}
                          </td>
                          <td className="py-3 pl-4 text-right">
                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-1 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <BillTemplate data={invoiceData} />
          </div>
        )}
      </div>
      
      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background: white; }
          .print\\:hidden { display: none !important; }
          .print\\:p-0 { padding: 0 !important; }
          .print\\:max-w-none { max-width: none !important; }
          #printable-bill { border: none !important; box-shadow: none !important; }
        }
      `}} />
    </div>
  );
}
