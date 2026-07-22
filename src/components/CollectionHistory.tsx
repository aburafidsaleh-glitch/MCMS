import React, { useState } from 'react';
import { History, Search, Download, FileText, Calendar, Filter, Smartphone, CreditCard, Wallet, DollarSign } from 'lucide-react';
import { PaymentTransaction, PaymentMethod } from '../types';
import { formatBDT, formatDateTime, formatMonthName, toBnDigits } from '../utils/formatters';

interface CollectionHistoryProps {
  transactions: PaymentTransaction[];
  currentMonth: string;
  onViewReceipt: (rec: any) => void;
}

export const CollectionHistory: React.FC<CollectionHistoryProps> = ({
  transactions,
  currentMonth,
  onViewReceipt
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');

  const methods: PaymentMethod[] = ['CASH', 'BKASH', 'NAGAD', 'BANK'];
  const months = ['ALL', '2026-07', '2026-06', '2026-05'];

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch =
      t.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.familyHead.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.houseNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.houseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.collectedBy.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMethod = selectedMethod === 'ALL' || t.paymentMethod === selectedMethod;
    const matchesMonth = selectedMonth === 'ALL' || t.month === selectedMonth;

    return matchesSearch && matchesMethod && matchesMonth;
  });

  const totalAmountInView = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);

  const handleExportCsv = () => {
    let csv = 'ReceiptNo,Date,HouseNo,FamilyHead,Area,Month,Amount,PaymentMethod,Collector\n';
    filteredTransactions.forEach(t => {
      csv += `"${t.receiptNo}","${t.timestamp}","${t.houseNo}","${t.familyHead}","${t.area}","${t.month}",${t.amount},"${t.paymentMethod}","${t.collectedBy}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mcms_collection_history_${selectedMonth}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-800" />
            <span>চাঁদা আদায়ের ইতিহাস ও লেনদেন রেজিস্টার (Collection History)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            সকল ডিজিটাল ও ক্যাশ আদায়ের পূর্ণাঙ্গ রসিদ রেজিস্টার, ফিল্টার ও এক্সপোর্ট সার্ভিস
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all"
        >
          <Download className="w-4 h-4 text-emerald-700" />
          <span>এক্সেল / CSV ডাউনলোড</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="রসিদ নং, দাতার নাম, বাড়ি নং বা কালেক্টর..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
            />
          </div>

          {/* Month Filter */}
          <div>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="ALL">সকল মাস (All Months)</option>
              {months.filter(m => m !== 'ALL').map(m => (
                <option key={m} value={m}>{formatMonthName(m)}</option>
              ))}
            </select>
          </div>

          {/* Method Filter */}
          <div>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="ALL">সকল পেমেন্ট মাধ্যম</option>
              {methods.map(m => (
                <option key={m} value={m}>{m === 'CASH' ? 'নগদ (CASH)' : m === 'BKASH' ? 'বিকাশ (bKash)' : m === 'NAGAD' ? 'নগদ (NAGAD)' : 'ব্যাংক (BANK)'}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Total Summary Strip */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
          <span>মোট প্রদর্শিত রেকর্ড: <strong className="text-slate-900">{toBnDigits(filteredTransactions.length)} টি</strong></span>
          <span>সর্বমোট আদায়কৃত টাকা: <strong className="text-emerald-900 font-extrabold text-sm">{formatBDT(totalAmountInView)}</strong></span>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <th className="p-3.5 font-bold">রসিদ নম্বর</th>
                <th className="p-3.5 font-bold">তারিখ ও সময়</th>
                <th className="p-3.5 font-bold">বাড়ি ও পরিবারের প্রধান</th>
                <th className="p-3.5 font-bold">মহল্লা</th>
                <th className="p-3.5 font-bold">মাস</th>
                <th className="p-3.5 font-bold">আদায়কৃত টাকা</th>
                <th className="p-3.5 font-bold">মাধ্যম</th>
                <th className="p-3.5 font-bold">সংগ্রহকারী</th>
                <th className="p-3.5 font-bold text-right">রসিদ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    কোনো লেনদেনের তথ্য পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(trx => (
                  <tr key={trx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-emerald-900">
                      {trx.receiptNo}
                    </td>
                    <td className="p-3.5 text-slate-500 text-[11px]">
                      {formatDateTime(trx.timestamp)}
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{trx.familyHead}</div>
                      <div className="text-[11px] text-slate-500">বাড়ি: {trx.houseNo} ({trx.houseName})</div>
                    </td>
                    <td className="p-3.5 text-slate-700 font-medium">{trx.area}</td>
                    <td className="p-3.5 text-slate-700 font-semibold">{formatMonthName(trx.month)}</td>
                    <td className="p-3.5 font-extrabold text-emerald-900 text-sm">
                      {formatBDT(trx.amount)}
                    </td>
                    <td className="p-3.5">
                      <span className="bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded text-[10px]">
                        {trx.paymentMethod}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-700 font-medium">{trx.collectedBy}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => onViewReceipt({
                          receiptNo: trx.receiptNo,
                          date: trx.timestamp,
                          houseNo: trx.houseNo,
                          houseName: trx.houseName,
                          familyHead: trx.familyHead,
                          area: trx.area,
                          month: trx.month,
                          amount: trx.amount,
                          paymentMethod: trx.paymentMethod,
                          collectedBy: trx.collectedBy,
                          note: trx.notes
                        })}
                        className="inline-flex items-center space-x-1 text-emerald-800 hover:text-emerald-950 font-bold bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>প্রিন্ট/ভিউ</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
