import React, { useState } from 'react';
import {
  Smartphone,
  Wallet,
  CheckCircle2,
  Clock,
  Search,
  Building2,
  ArrowRight,
  TrendingUp,
  User,
  MapPin,
  Phone,
  FileText
} from 'lucide-react';
import { House, CollectionRecord, PaymentTransaction, User as UserType } from '../types';
import { formatBDT, formatDateTime, toBnDigits } from '../utils/formatters';

interface CollectorDashboardProps {
  currentUser: UserType;
  houses: House[];
  collections: CollectionRecord[];
  transactions: PaymentTransaction[];
  currentMonth: string;
  onNavigateTab: (tab: string) => void;
  onViewReceipt: (data: any) => void;
}

export const CollectorDashboard: React.FC<CollectorDashboardProps> = ({
  currentUser,
  houses,
  collections,
  transactions,
  currentMonth,
  onNavigateTab,
  onViewReceipt
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter houses assigned to this collector area or all active houses
  const assignedArea = currentUser.assignedArea || '';
  const myAssignedHouses = houses.filter(h =>
    h.isActive && (!assignedArea || h.area.includes(assignedArea) || assignedArea.includes(h.area))
  );

  const displayHouses = myAssignedHouses.length > 0 ? myAssignedHouses : houses.filter(h => h.isActive);

  // Current month collections for these houses
  const currentCollections = collections.filter(c => c.month === currentMonth);
  const houseMap = new Map(displayHouses.map(h => [h.id, h]));

  const myCollectionRecords = currentCollections.filter(c => houseMap.has(c.houseId));

  const totalAssignedCount = displayHouses.length;
  const paidCount = myCollectionRecords.filter(c => c.status === 'PAID').length;
  const remainingCount = totalAssignedCount - paidCount;

  // Collected today by this collector
  const todayStr = new Date().toISOString().split('T')[0];
  const myTodayTrx = transactions.filter(t =>
    t.collectedBy === currentUser.name && t.timestamp.startsWith(todayStr)
  );
  const collectedTodayAmount = myTodayTrx.reduce((sum, t) => sum + t.amount, 0);

  // Search filtered houses
  const filteredHouses = displayHouses.filter(h => {
    return (
      h.houseNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.familyHead.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.phone.includes(searchTerm) ||
      h.area.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Welcome Banner for Collector */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 text-white p-6 rounded-2xl shadow-md border border-emerald-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-amber-400 text-slate-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              フィールド コレクター モード (FIELD COLLECTOR)
            </span>
            <span className="text-xs text-emerald-200">দায়িত্বপ্রাপ্ত এলাকা: {currentUser.assignedArea}</span>
          </div>
          <h1 className="text-2xl font-black mt-2 tracking-tight">
            আসসালামু আলাইকুম, {currentUser.name}!
          </h1>
          <p className="text-xs text-emerald-100 mt-1">
            আজকের টার্গেট সম্পন্ন করতে নিচের বড় <strong className="text-amber-300">"চাঁদা গ্রহণ করুন"</strong> বাটনে ট্যাপ করুন।
          </p>
        </div>

        {/* Large Collect Button */}
        <button
          onClick={() => onNavigateTab('collector')}
          className="w-full md:w-auto px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-amber-950/30 flex items-center justify-center space-x-2 transform active:scale-98 transition-all shrink-0 cursor-pointer"
        >
          <Smartphone className="w-5 h-5 text-slate-950" />
          <span>সরাসরি চাঁদা গ্রহণ করুন →</span>
        </button>
      </div>

      {/* 4 Collector KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today Collected */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block mb-1">আজকের মোট সংগ্রহ</span>
          <div className="text-2xl font-black text-emerald-900">{formatBDT(collectedTodayAmount)}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">আজকের জমা রেকর্ড</p>
        </div>

        {/* Assigned Houses */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block mb-1">আজকের বরাদ্দকৃত বাড়ি</span>
          <div className="text-2xl font-black text-slate-900">{toBnDigits(totalAssignedCount)} টি</div>
          <p className="text-[10px] text-slate-400 mt-0.5">{currentUser.assignedArea}</p>
        </div>

        {/* Paid Houses */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block mb-1">পরিশোধিত বাড়ি</span>
          <div className="text-2xl font-black text-emerald-700">{toBnDigits(paidCount)} টি</div>
          <p className="text-[10px] text-emerald-600 mt-0.5">চলতি মাসে সম্পন্ন</p>
        </div>

        {/* Remaining Houses */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block mb-1">অবশিষ্ট বাকি বাড়ি</span>
          <div className="text-2xl font-black text-amber-600">{toBnDigits(remainingCount)} টি</div>
          <p className="text-[10px] text-amber-700 mt-0.5">আদায় বাকি আছে</p>
        </div>
      </div>

      {/* Assigned Houses Quick List & Action */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">বরাদ্দকৃত বাড়ির তালিকা ({toBnDigits(filteredHouses.length)})</h2>
            <p className="text-xs text-slate-500">যে কোনো বাড়িতে সরাসরি ট্যাপ করে চাঁদা আদায় করুন</p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="বাড়ি নং বা দাতার নাম..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredHouses.slice(0, 6).map((house) => {
            const col = currentCollections.find(c => c.houseId === house.id);
            const status = col?.status || 'DUE';
            const paid = col?.paidAmount || 0;

            return (
              <div
                key={house.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-emerald-50/50 hover:border-emerald-300 transition-all flex flex-col justify-between space-y-2"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                      বাড়ি {house.houseNo}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                      status === 'PARTIAL' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {status === 'PAID' ? 'পরিশোধিত' : status === 'PARTIAL' ? 'আংশিক' : 'বকেয়া'}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 mt-1.5">{house.familyHead}</h3>
                  <p className="text-[11px] text-slate-500">{house.area} • {formatBDT(house.monthlyPledge)}/মাস</p>
                </div>

                <button
                  onClick={() => onNavigateTab('collector')}
                  className="w-full py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center space-x-1"
                >
                  <Wallet className="w-3.5 h-3.5 text-amber-300" />
                  <span>{status === 'PAID' ? 'পুনরায় দেখুন' : 'টাকা গ্রহণ করুন'}</span>
                </button>
              </div>
            );
          })}
        </div>

        {filteredHouses.length > 6 && (
          <div className="text-center pt-2">
            <button
              onClick={() => onNavigateTab('collector')}
              className="text-xs font-bold text-emerald-800 hover:underline inline-flex items-center gap-1"
            >
              <span>সকল {toBnDigits(filteredHouses.length)} টি বাড়ি দেখুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Recent Payments Collected by Me */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs space-y-3">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
          আমার সংগ্রহকৃত সাম্প্রতিক রসিদসমূহ
        </h2>

        {myTodayTrx.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">আজকে এখনো কোনো পেমেন্ট রেকর্ড করা হয়নি।</p>
        ) : (
          <div className="space-y-2">
            {myTodayTrx.map(trx => (
              <div key={trx.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900">{trx.familyHead} (বাড়ি {trx.houseNo})</span>
                  <div className="text-[10px] text-slate-500 font-mono">{trx.receiptNo} • {formatDateTime(trx.timestamp)}</div>
                </div>

                <div className="text-right">
                  <div className="font-black text-emerald-800">{formatBDT(trx.amount)}</div>
                  <button
                    onClick={() => onViewReceipt(trx)}
                    className="text-[10px] text-emerald-700 hover:underline font-bold"
                  >
                    রসিদ
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
