import React from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  PieChart as PieIcon,
  Users,
  Building2,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  Percent
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { House, CollectionRecord, PaymentTransaction } from '../types';
import { formatBDT, formatMonthName, toBnDigits } from '../utils/formatters';

interface AnalyticsViewProps {
  houses: House[];
  collections: CollectionRecord[];
  transactions: PaymentTransaction[];
  currentMonth: string;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  houses,
  collections,
  transactions,
  currentMonth
}) => {
  // Monthly Trend Data
  const monthList = ['2026-05', '2026-06', '2026-07', '2026-08'];
  const monthlyComparisonData = monthList.map(m => {
    const monthCols = collections.filter(c => c.month === m);
    const target = monthCols.reduce((sum, c) => sum + c.targetAmount, 0);
    const collected = monthCols.reduce((sum, c) => sum + c.paidAmount, 0);
    const due = monthCols.reduce((sum, c) => sum + c.dueAmount, 0);

    return {
      month: formatMonthName(m),
      লক্ষ্যমাত্রা: target || 10000,
      সংগৃহীত: collected,
      বকেয়া: due
    };
  });

  // Current month stats
  const currentCollections = collections.filter(c => c.month === currentMonth);
  const totalTarget = currentCollections.reduce((sum, c) => sum + c.targetAmount, 0);
  const totalCollected = currentCollections.reduce((sum, c) => sum + c.paidAmount, 0);
  const totalDue = currentCollections.reduce((sum, c) => sum + c.dueAmount, 0);
  const recoveryRate = totalTarget > 0 ? Math.round((totalCollected / totalTarget) * 100) : 0;

  // Area Breakdown
  const areas = ['পূর্ব পাড়া', 'পশ্চিম পাড়া', 'উত্তর পাড়া', 'দক্ষিণ পাড়া', 'মধ্য বাজার'];
  const areaPerformance = areas.map(area => {
    const areaHouses = houses.filter(h => h.area === area && h.isActive);
    const areaHouseIds = new Set(areaHouses.map(h => h.id));

    const areaCols = currentCollections.filter(c => areaHouseIds.has(c.houseId));
    const target = areaCols.reduce((sum, c) => sum + c.targetAmount, 0);
    const collected = areaCols.reduce((sum, c) => sum + c.paidAmount, 0);

    return {
      area,
      target,
      collected,
      rate: target > 0 ? Math.round((collected / target) * 100) : 0
    };
  });

  // Payment method pie
  const methodMap: Record<string, number> = { CASH: 0, BKASH: 0, NAGAD: 0, BANK: 0 };
  transactions.forEach(t => {
    if (t.month === currentMonth) {
      methodMap[t.paymentMethod] = (methodMap[t.paymentMethod] || 0) + t.amount;
    }
  });

  const pieData = [
    { name: 'নগদ (Cash)', value: methodMap.CASH || 0, color: '#059669' },
    { name: 'বিকাশ (bKash)', value: methodMap.BKASH || 0, color: '#db2777' },
    { name: 'নগদ ওয়ালেট', value: methodMap.NAGAD || 0, color: '#ea580c' },
    { name: 'ব্যাংক (Bank)', value: methodMap.BANK || 0, color: '#1d4ed8' }
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Executive Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-800" />
            <span>অ্যাডভান্সড ফাইন্যান্সিয়াল অ্যানালিটিক্স (Analytics Dashboard)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            মসজিদ তহবিলের দীর্ঘমেয়াদী বৃদ্ধি, সংগ্রাহকের দক্ষতা ও এলাকাভিত্তিক আদায় প্রবণতা
          </p>
        </div>

        <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-900 px-3.5 py-1.5 rounded-xl border border-emerald-200 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-emerald-700" />
          <span>আদায় রিকভারি রেট: {toBnDigits(recoveryRate)}%</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold block mb-1">সর্বমোট সংগ্রহ (চলতি মাস)</span>
          <div className="text-2xl font-extrabold text-emerald-900">{formatBDT(totalCollected)}</div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">
            ↑ লক্ষ্যমাত্রার {toBnDigits(recoveryRate)}% অর্জিত
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold block mb-1">মোট সম্ভাব্য বাজেট (Target)</span>
          <div className="text-2xl font-extrabold text-slate-900">{formatBDT(totalTarget)}</div>
          <p className="text-[11px] text-slate-500 mt-1">
            মোট {toBnDigits(houses.length)} টি বাড়ির নিবন্ধিত বাজেট
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold block mb-1">চলতি মাসের অবশিষ্টাংশ/বকেয়া</span>
          <div className="text-2xl font-extrabold text-red-600">{formatBDT(totalDue)}</div>
          <p className="text-[11px] text-red-700 font-medium mt-1">
            সংগ্রহ প্রক্রিয়া চলমান
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold block mb-1">ডিজিটাল কালেকশন শেয়ার</span>
          <div className="text-2xl font-extrabold text-blue-700">
            {toBnDigits(totalCollected > 0 ? Math.round(((totalCollected - (methodMap.CASH || 0)) / totalCollected) * 100) : 0)}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            বিকাশ/নগদ/ব্যাংক পেমেন্টের অনুপাত
          </p>
        </div>
      </div>

      {/* Main Bar Chart: Month-wise Comparison */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">মাসিক চাঁদা আদায়ের প্রবণতা (Monthly Comparison)</h2>
            <p className="text-xs text-slate-500">গত ৩-৪ মাসের মধ্যে লক্ষ্যমাত্রা ও সংগৃহীত পরিমাণের তুলনামূলক গ্রাফ</p>
          </div>
        </div>

        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyComparisonData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#475569' }} />
              <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
              <Tooltip formatter={(val: any) => [`৳${Number(val).toLocaleString()}`, '']} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="লক্ষ্যমাত্রা" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={22} />
              <Bar dataKey="সংগৃহীত" fill="#059669" radius={[4, 4, 0, 0]} barSize={22} />
              <Bar dataKey="বকেয়া" fill="#dc2626" radius={[4, 4, 0, 0]} barSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Area Wise Performance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            এলাকা / পাড়া ভিত্তিক কালেকশন পারফরম্যান্স %
          </h2>

          <div className="space-y-3.5">
            {areaPerformance.map((item) => (
              <div key={item.area} className="space-y-1 text-xs">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-800">{item.area}</span>
                  <div className="space-x-2">
                    <span className="text-slate-500 font-normal">আদায়: {formatBDT(item.collected)} / {formatBDT(item.target)}</span>
                    <span className="text-emerald-800 font-extrabold">{toBnDigits(item.rate)}%</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.rate >= 80 ? 'bg-emerald-600' : item.rate >= 50 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(100, item.rate)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              পেমেন্ট চ্যানেলের ভাগ
            </h2>

            <div className="h-56 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => [`৳${Number(val).toLocaleString()}`, '']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 pt-3">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                <span className="text-slate-600 truncate">{item.name}:</span>
                <span className="font-bold text-slate-900">{formatBDT(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
