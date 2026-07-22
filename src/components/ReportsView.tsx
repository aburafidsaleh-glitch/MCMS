import React, { useState } from 'react';
import { FileText, Download, Search, Calendar, CheckCircle2, ShieldCheck } from 'lucide-react';
import { PaymentTransaction, AuditLog, UserRole } from '../types';
import { formatBDT, formatMonthName, formatDateTime, toBnDigits } from '../utils/formatters';

interface ReportsViewProps {
  transactions: PaymentTransaction[];
  auditLogs: AuditLog[];
  onViewReceipt: (rec: any) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  transactions,
  auditLogs,
  onViewReceipt
}) => {
  const [activeTab, setActiveTab] = useState<'TRANSACTIONS' | 'AUDIT'>('TRANSACTIONS');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('ALL');

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch =
      t.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.familyHead.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.houseNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.collectedBy.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMethod = selectedMethod === 'ALL' || t.paymentMethod === selectedMethod;

    return matchesSearch && matchesMethod;
  });

  const handleExportTransactionsCsv = () => {
    let csv = 'Receipt No,House No,Family Head,Area,Month,Amount,Payment Method,Collected By,Date\n';
    filteredTransactions.forEach(t => {
      csv += `"${t.receiptNo}","${t.houseNo}","${t.familyHead}","${t.area}","${t.month}",${t.amount},"${t.paymentMethod}","${t.collectedBy}","${t.timestamp}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Navigation sub-tabs */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('TRANSACTIONS')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'TRANSACTIONS'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            আদায় ও লেনদেন হিস্ট্রি (Transactions)
          </button>
          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'AUDIT'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            সিস্টেম অডিট লগ (Audit Trails)
          </button>
        </div>

        {activeTab === 'TRANSACTIONS' && (
          <button
            onClick={handleExportTransactionsCsv}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            <span>সিএসভি এক্সপোর্ট</span>
          </button>
        )}
      </div>

      {activeTab === 'TRANSACTIONS' ? (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="রসিদ নম্বর, বাড়ির দাতা বা সংগ্রাহক দিয়ে খুঁজুন..."
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
            >
              <option value="ALL">সকল পেমেন্ট মাধ্যম</option>
              <option value="CASH">নগদ (CASH)</option>
              <option value="BKASH">বিকাশ (BKASH)</option>
              <option value="NAGAD">নগদ ওয়ালেট (NAGAD)</option>
              <option value="BANK">ব্যাংক (BANK)</option>
            </select>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 border-b border-gray-200">
                    <th className="p-3.5 font-bold">রসিদ নম্বর</th>
                    <th className="p-3.5 font-bold">তারিখ ও সময়</th>
                    <th className="p-3.5 font-bold">বাড়ি ও দাতা</th>
                    <th className="p-3.5 font-bold">মাস</th>
                    <th className="p-3.5 font-bold">আদায়কৃত টাকা</th>
                    <th className="p-3.5 font-bold">মাধ্যম</th>
                    <th className="p-3.5 font-bold">সংগ্রহকারী</th>
                    <th className="p-3.5 font-bold text-right">আকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTransactions.map(trx => (
                    <tr key={trx.id} className="hover:bg-emerald-50/20 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-emerald-900">{trx.receiptNo}</td>
                      <td className="p-3.5 text-gray-500">{formatDateTime(trx.timestamp)}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-gray-900">{trx.familyHead}</div>
                        <div className="text-[11px] text-gray-500">বাড়ি: {trx.houseNo} ({trx.area})</div>
                      </td>
                      <td className="p-3.5 font-bold text-gray-700">{formatMonthName(trx.month)}</td>
                      <td className="p-3.5 font-extrabold text-emerald-800 text-sm">{formatBDT(trx.amount)}</td>
                      <td className="p-3.5">
                        <span className="bg-gray-100 text-gray-800 font-bold px-2 py-0.5 rounded text-[11px]">
                          {trx.paymentMethod}
                        </span>
                      </td>
                      <td className="p-3.5 text-gray-700 font-medium">{trx.collectedBy}</td>
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
                          className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>রসিদ দেখুন</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Audit Logs List */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h2 className="text-base font-bold text-gray-900">সিস্টেম অডিট ট্রেইল (Audit Logs)</h2>
          <div className="space-y-2">
            {auditLogs.map(log => (
              <div key={log.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-start space-x-3 text-xs">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">{log.userName} ({log.userRole})</span>
                    <span className="text-[11px] text-gray-400">{formatDateTime(log.timestamp)}</span>
                  </div>
                  <p className="text-gray-700 mt-0.5">{log.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
