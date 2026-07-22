import React, { useState } from 'react';
import {
  Calendar,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Clock,
  Printer,
  Download,
  PlusCircle,
  FileText,
  DollarSign,
  Wallet
} from 'lucide-react';
import { House, CollectionRecord, User, PaymentMethod } from '../types';
import { formatBDT, formatMonthName, toBnDigits } from '../utils/formatters';

interface MonthlyCollectionProps {
  houses: House[];
  collections: CollectionRecord[];
  currentMonth: string;
  currentUser: User;
  onMonthChange: (m: string) => void;
  onGenerateSheet: (m: string) => void;
  onCollectPayment: (data: {
    houseId: string;
    month: string;
    amount: number;
    paymentMethod: PaymentMethod;
    collectorName: string;
    collectorId: string;
    note?: string;
  }) => void;
  onViewReceipt: (rec: any) => void;
}

export const MonthlyCollection: React.FC<MonthlyCollectionProps> = ({
  houses,
  collections,
  currentMonth,
  currentUser,
  onMonthChange,
  onGenerateSheet,
  onCollectPayment,
  onViewReceipt
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Quick collect modal
  const [collectingHouse, setCollectingHouse] = useState<{ house: House; record?: CollectionRecord } | null>(null);
  const [collectAmount, setCollectAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [note, setNote] = useState('');

  const months = ['2026-07', '2026-06', '2026-05', '2026-08'];
  const areas = ['ALL', 'পূর্ব পাড়া', 'পশ্চিম পাড়া', 'উত্তর পাড়া', 'দক্ষিণ পাড়া', 'মধ্য বাজার'];

  const houseMap = new Map<string, House>();
  houses.forEach(h => houseMap.set(h.id, h));

  const monthRecords = collections.filter(c => c.month === currentMonth);

  // Totals for this month
  const totalTarget = monthRecords.reduce((s, r) => s + r.targetAmount, 0);
  const totalCollected = monthRecords.reduce((s, r) => s + r.paidAmount, 0);
  const totalDue = monthRecords.reduce((s, r) => s + r.dueAmount, 0);
  const percent = totalTarget > 0 ? Math.round((totalCollected / totalTarget) * 100) : 0;

  const filteredRecords = monthRecords.filter(rec => {
    const house = houseMap.get(rec.houseId);
    if (!house) return false;

    const matchesSearch =
      house.houseNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      house.familyHead.toLowerCase().includes(searchTerm.toLowerCase()) ||
      house.houseName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesArea = selectedArea === 'ALL' || house.area === selectedArea;
    const matchesStatus = statusFilter === 'ALL' || rec.status === statusFilter;

    return matchesSearch && matchesArea && matchesStatus;
  });

  const handleOpenCollectModal = (rec: CollectionRecord) => {
    const house = houseMap.get(rec.houseId);
    if (!house) return;
    setCollectingHouse({ house, record: rec });
    setCollectAmount(rec.dueAmount > 0 ? rec.dueAmount : rec.targetAmount);
    setPaymentMethod('CASH');
    setNote('');
  };

  const handleConfirmCollect = () => {
    if (!collectingHouse || collectAmount <= 0) return;
    onCollectPayment({
      houseId: collectingHouse.house.id,
      month: currentMonth,
      amount: collectAmount,
      paymentMethod,
      collectorName: currentUser.name,
      collectorId: currentUser.id,
      note
    });
    setCollectingHouse(null);
  };

  const handleExportCsv = () => {
    let csv = 'House No,Family Head,Area,Target,Paid,Due,Status,Receipt No,Collector\n';
    filteredRecords.forEach(r => {
      const h = houseMap.get(r.houseId);
      if (h) {
        csv += `"${h.houseNo}","${h.familyHead}","${h.area}",${r.targetAmount},${r.paidAmount},${r.dueAmount},"${r.status}","${r.receiptNo || ''}","${r.collectedBy || ''}"\n`;
      }
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monthly_collection_${currentMonth}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Month Picker */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-emerald-700" />
            <h1 className="text-xl font-bold text-gray-900">
              মাসিক চাঁদা রেজিস্টার (Monthly Collection Sheet)
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            মাস নির্বাচন করে চাঁদা সংগ্রহ পরিস্থিতি দেখুন ও পেমেন্ট এন্ট্রি করুন
          </p>
        </div>

        {/* Month Selector & Sheet Generator */}
        <div className="flex items-center space-x-2">
          <select
            value={currentMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            {months.map(m => (
              <option key={m} value={m}>{formatMonthName(m)}</option>
            ))}
          </select>

          {monthRecords.length === 0 ? (
            <button
              onClick={() => onGenerateSheet(currentMonth)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span>এই মাসের শীট তৈরি করুন</span>
            </button>
          ) : (
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl"
            >
              <Download className="w-4 h-4 text-emerald-700" />
              <span>এক্সেল/সিএসভি ডাউনলোড</span>
            </button>
          )}
        </div>
      </div>

      {/* Monthly Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-4 rounded-2xl shadow-md">
        <div>
          <span className="text-[11px] text-emerald-200 block">মোট নির্ধারিত লক্ষ্য</span>
          <span className="text-lg font-bold">{formatBDT(totalTarget)}</span>
        </div>
        <div>
          <span className="text-[11px] text-emerald-200 block">সংগৃহীত টাকা</span>
          <span className="text-lg font-bold text-amber-300">{formatBDT(totalCollected)}</span>
        </div>
        <div>
          <span className="text-[11px] text-emerald-200 block">মোট বকেয়া</span>
          <span className="text-lg font-bold text-red-300">{formatBDT(totalDue)}</span>
        </div>
        <div>
          <span className="text-[11px] text-emerald-200 block">সংগ্রহের হার</span>
          <span className="text-lg font-extrabold text-amber-300">{toBnDigits(percent)}%</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="বাড়ি নম্বর বা নাম লিখে খুঁজুন..."
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <select
          value={selectedArea}
          onChange={(e) => setSelectedArea(e.target.value)}
          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
        >
          {areas.map(a => <option key={a} value={a}>{a === 'ALL' ? 'সকল মহল্লা' : a}</option>)}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
        >
          <option value="ALL">সকল স্ট্যাটাস</option>
          <option value="DUE">বকেয়া (DUE)</option>
          <option value="PARTIAL">আংশিক (PARTIAL)</option>
          <option value="PAID">পরিশোধিত (PAID)</option>
        </select>
      </div>

      {/* Sheet Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-600 border-b border-gray-200">
                <th className="p-3.5 font-bold">বাড়ি নং</th>
                <th className="p-3.5 font-bold">পরিবারের প্রধান</th>
                <th className="p-3.5 font-bold">মহল্লা</th>
                <th className="p-3.5 font-bold">ধার্যকৃত চাঁদা</th>
                <th className="p-3.5 font-bold">জমা টাকা</th>
                <th className="p-3.5 font-bold">বকেয়া</th>
                <th className="p-3.5 font-bold">স্ট্যাটাস</th>
                <th className="p-3.5 font-bold">রসিদ নং</th>
                <th className="p-3.5 font-bold text-right">আকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-500">
                    এই মাসের জন্য কোনো রেকর্ড পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredRecords.map(rec => {
                  const house = houseMap.get(rec.houseId);
                  if (!house) return null;

                  return (
                    <tr key={rec.id} className="hover:bg-emerald-50/20 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-emerald-900">{house.houseNo}</td>
                      <td className="p-3.5 font-bold text-gray-900">{house.familyHead}</td>
                      <td className="p-3.5 text-gray-700">{house.area}</td>
                      <td className="p-3.5 font-bold text-gray-800">{formatBDT(rec.targetAmount)}</td>
                      <td className="p-3.5 font-bold text-emerald-700">{formatBDT(rec.paidAmount)}</td>
                      <td className="p-3.5 font-bold text-red-600">{formatBDT(rec.dueAmount)}</td>
                      <td className="p-3.5">
                        {rec.status === 'PAID' && (
                          <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>পরিশোধিত</span>
                          </span>
                        )}
                        {rec.status === 'PARTIAL' && (
                          <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>আংশিক</span>
                          </span>
                        )}
                        {rec.status === 'DUE' && (
                          <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-red-800 bg-red-100 px-2 py-0.5 rounded-full">
                            <AlertCircle className="w-3 h-3 text-red-600" />
                            <span>বকেয়া</span>
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 font-mono text-gray-600">{rec.receiptNo || '-'}</td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {rec.receiptNo && (
                            <button
                              onClick={() => onViewReceipt({
                                receiptNo: rec.receiptNo,
                                date: rec.lastPaidDate || new Date().toISOString(),
                                houseNo: house.houseNo,
                                houseName: house.houseName,
                                familyHead: house.familyHead,
                                area: house.area,
                                month: currentMonth,
                                amount: rec.paidAmount,
                                paymentMethod: rec.paymentMethod || 'CASH',
                                collectedBy: rec.collectedBy || currentUser.name,
                                note: rec.collectorNote
                              })}
                              className="px-2 py-1 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg"
                            >
                              রসিদ
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenCollectModal(rec)}
                            className="px-3 py-1 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-xs"
                          >
                            আদায়
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Collect Dialog Modal */}
      {collectingHouse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">
                চাঁদা আদায় - {collectingHouse.house.houseNo} ({collectingHouse.house.familyHead})
              </h3>
              <button onClick={() => setCollectingHouse(null)} className="text-gray-400">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">আদায়কৃত পরিমাণ (BDT)</label>
                <input
                  type="number"
                  value={collectAmount}
                  onChange={(e) => setCollectAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-emerald-50 border border-emerald-200 text-lg font-bold text-emerald-900 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">পেমেন্ট মাধ্যম</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium"
                >
                  <option value="CASH">নগদ (Cash)</option>
                  <option value="BKASH">বিকাশ (bKash)</option>
                  <option value="NAGAD">নগদ ওয়ালেট (Nagad)</option>
                  <option value="BANK">ব্যাংক স্থানান্তর (Bank)</option>
                </select>
              </div>

              <div>
                <label className="font-medium text-gray-600 block mb-1">নোট / মন্তব্য (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="যেমন: আংশিক প্রদান..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  onClick={() => setCollectingHouse(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  onClick={handleConfirmCollect}
                  className="px-5 py-2 bg-emerald-800 text-white font-bold rounded-xl shadow-md"
                >
                  পেমেন্ট নিশ্চিত করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
