import React from 'react';
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Building2,
  Calendar,
  Sparkles,
  ArrowUpRight,
  PlusCircle,
  FileSpreadsheet,
  FileText,
  Users,
  CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import { MosqueProfile, House, CollectionRecord, PaymentTransaction } from '../types';
import { formatBDT, formatMonthName, formatDateTime, toBnDigits } from '../utils/formatters';

interface DashboardProps {
  mosque: MosqueProfile;
  houses: House[];
  collections: CollectionRecord[];
  transactions: PaymentTransaction[];
  currentMonth: string;
  onGenerateNextMonth: () => void;
  onOpenAiSummary: () => void;
  onNavigateTab: (tab: string) => void;
  onViewReceipt: (data: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  mosque,
  houses,
  collections,
  transactions,
  currentMonth,
  onGenerateNextMonth,
  onOpenAiSummary,
  onNavigateTab,
  onViewReceipt
}) => {
  // Current month collections
  const currentCollections = collections.filter(c => c.month === currentMonth);

  const totalTarget = currentCollections.reduce((sum, c) => sum + c.targetAmount, 0);
  const totalCollected = currentCollections.reduce((sum, c) => sum + c.paidAmount, 0);
  const totalDueThisMonth = currentCollections.reduce((sum, c) => sum + c.dueAmount, 0);
  const percentAchieved = totalTarget > 0 ? Math.round((totalCollected / totalTarget) * 100) : 0;

  // Total Dues across all recorded months
  const totalOverdueAll = collections.reduce((sum, c) => sum + c.dueAmount, 0);

  // Active houses
  const activeHousesCount = houses.filter(h => h.isActive).length;

  // Area Breakdown Data
  const areas = ['পূর্ব পাড়া', 'পশ্চিম পাড়া', 'উত্তর পাড়া', 'দক্ষিণ পাড়া', 'মধ্য বাজার'];
  const areaChartData = areas.map(area => {
    const areaHouses = houses.filter(h => h.area === area && h.isActive);
    const areaHouseIds = new Set(areaHouses.map(h => h.id));

    const areaRecords = currentCollections.filter(c => areaHouseIds.has(c.houseId));
    const target = areaRecords.reduce((acc, c) => acc + c.targetAmount, 0);
    const collected = areaRecords.reduce((acc, c) => acc + c.paidAmount, 0);
    const due = areaRecords.reduce((acc, c) => acc + c.dueAmount, 0);

    return {
      name: area,
      লক্ষ্যমাত্রা: target,
      আদায়: collected,
      বকেয়া: due
    };
  });

  // Payment Method Breakdown for Pie Chart
  const methodCounts: Record<string, number> = { CASH: 0, BKASH: 0, NAGAD: 0, BANK: 0 };
  transactions.forEach(t => {
    if (t.month === currentMonth) {
      methodCounts[t.paymentMethod] = (methodCounts[t.paymentMethod] || 0) + t.amount;
    }
  });

  const pieData = [
    { name: 'নগদ (Cash)', value: methodCounts.CASH || 0, color: '#059669' },
    { name: 'বিকাশ (bKash)', value: methodCounts.BKASH || 0, color: '#db2777' },
    { name: 'নগদ ওয়ালেট', value: methodCounts.NAGAD || 0, color: '#ea580c' },
    { name: 'ব্যাংক (Bank)', value: methodCounts.BANK || 0, color: '#1d4ed8' }
  ].filter(d => d.value > 0);

  // Recent Transactions (limit 5)
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Executive Welcome Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200">
              {mosque.code}
            </span>
            <span className="text-xs text-gray-500 font-medium">কমিটি ওভারভিউ</span>
          </div>
          <h1 className="text-2xl font-bold text-emerald-950 mt-1">
            {mosque.name} - অ্যাডমিন ড্যাশবোর্ড
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            চলতি মাস: <strong className="text-emerald-800 font-semibold">{formatMonthName(currentMonth)}</strong> | মোট নিবন্ধিত বাড়ি: <strong className="text-gray-800">{toBnDigits(activeHousesCount)} টি</strong>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenAiSummary}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-all shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>AI রিপোর্ট সারসংক্ষেপ</span>
          </button>

          <button
            onClick={onGenerateNextMonth}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition-all shadow-md shadow-emerald-900/10"
          >
            <PlusCircle className="w-4 h-4 text-amber-300" />
            <span>নতুন মাসের চাঁদা তৈরি</span>
          </button>
        </div>
      </div>

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Collected */}
        <div className="bg-gradient-to-br from-emerald-900 to-emerald-800 text-white p-5 rounded-2xl shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">চলতি মাসের সংগৃহীত চাঁদা</span>
            <div className="p-2 bg-emerald-800/80 rounded-xl border border-emerald-700/50">
              <DollarSign className="w-5 h-5 text-amber-300" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-extrabold text-amber-300">
              {formatBDT(totalCollected)}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-emerald-100">
              <span>লক্ষ্যমাত্রার {toBnDigits(percentAchieved)}% অর্জিত</span>
              <span className="font-bold text-white">লক্ষ্য: {formatBDT(totalTarget)}</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-emerald-950/60 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, percentAchieved)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Card 2: Target Amount */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">নির্ধারিত লক্ষ্যমাত্রা</span>
            <div className="p-2 bg-blue-50 rounded-xl text-blue-700">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-gray-900">{formatBDT(totalTarget)}</div>
            <p className="text-xs text-gray-500 mt-1">
              মোট নিবন্ধিত <strong className="text-gray-800">{toBnDigits(activeHousesCount)}</strong> টি বাড়ির মাসিক ফি
            </p>
          </div>
        </div>

        {/* Card 3: Total Dues */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">চলতি মাসের বকেয়া</span>
            <div className="p-2 bg-red-50 rounded-xl text-red-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-red-600">{formatBDT(totalDueThisMonth)}</div>
            <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
              <span>সর্বমোট বকেয়া (সব মাস):</span>
              <span className="font-bold text-red-700">{formatBDT(totalOverdueAll)}</span>
            </div>
          </div>
        </div>

        {/* Card 4: Active Houses */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">মোট দাতা / বাড়ি</span>
            <div className="p-2 bg-amber-50 rounded-xl text-amber-700">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-gray-900">{toBnDigits(activeHousesCount)} টি</div>
            <div className="flex items-center justify-between text-xs text-emerald-700 font-semibold mt-1">
              <span>পরিশোধিত বাড়ি: {toBnDigits(currentCollections.filter(c => c.status === 'PAID').length)} টি</span>
              <button
                onClick={() => onNavigateTab('houses')}
                className="text-emerald-800 hover:underline inline-flex items-center"
              >
                <span>তালিকা</span>
                <ArrowUpRight className="w-3 h-3 ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Area-wise Collection Breakdown (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-gray-900">মহল্লা / পাড়া-ভিত্তিক আদায় চিত্র</h2>
              <p className="text-xs text-gray-500">চলতি মাসে বিভিন্ন পাড়া থেকে সংগৃহীত ও বকেয়া টাকার তুলনা</p>
            </div>
            <button
              onClick={() => onNavigateTab('due')}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100"
            >
              বকেয়া তালিকা দেখুন
            </button>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={areaChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                <Tooltip
                  formatter={(val: any) => [`৳${Number(val).toLocaleString()}`, '']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="লক্ষ্যমাত্রা" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={18} />
                <Bar dataKey="আদায়" fill="#059669" radius={[4, 4, 0, 0]} barSize={18} />
                <Bar dataKey="বকেয়া" fill="#dc2626" radius={[4, 4, 0, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Payment Method Pie Chart */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">পেমেন্ট মেথড অনুপাত</h2>
            <p className="text-xs text-gray-500">নগদ বনাম মোবাইল ব্যাংকিং ও ব্যাংক পেমেন্ট</p>

            <div className="h-56 w-full mt-2">
              {pieData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-gray-400">
                  এখনো পেমেন্ট তথ্য নেই
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
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
              )}
            </div>
          </div>

          {/* Custom Pie Legend */}
          <div className="grid grid-cols-2 gap-2 text-xs border-t border-gray-100 pt-3">
            {pieData.map(item => (
              <div key={item.name} className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                <span className="text-gray-600 truncate">{item.name}:</span>
                <span className="font-bold text-gray-900">{formatBDT(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Live Transactions Section */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-gray-900">সাম্প্রতিক চাঁদা আদায় লেনদেন</h2>
            <p className="text-xs text-gray-500">সর্বশেষ আদায়কৃত টাকা ও ডিজিটালাইজড রসিদ বিবরণী</p>
          </div>
          <button
            onClick={() => onNavigateTab('receipts')}
            className="text-xs font-bold text-emerald-800 hover:underline"
          >
            সকল রসিদ ইতিহাস →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-600 border-b border-gray-200">
                <th className="p-3 font-semibold">রসিদ নম্বর</th>
                <th className="p-3 font-semibold">বাড়ি ও পরিবারের প্রধান</th>
                <th className="p-3 font-semibold">মহল্লা</th>
                <th className="p-3 font-semibold">পরিমাণ</th>
                <th className="p-3 font-semibold">পেমেন্ট মাধ্যম</th>
                <th className="p-3 font-semibold">সংগ্রহকারী</th>
                <th className="p-3 font-semibold text-right">আকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentTransactions.map(trx => (
                <tr key={trx.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="p-3 font-mono font-bold text-emerald-900">
                    {trx.receiptNo}
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-gray-900">{trx.familyHead}</div>
                    <div className="text-[11px] text-gray-500">বাড়ি: {trx.houseNo} ({trx.houseName})</div>
                  </td>
                  <td className="p-3 text-gray-700 font-medium">{trx.area}</td>
                  <td className="p-3 font-extrabold text-emerald-800 text-sm">
                    {formatBDT(trx.amount)}
                  </td>
                  <td className="p-3">
                    <span className="inline-block bg-gray-100 text-gray-800 font-semibold px-2 py-0.5 rounded">
                      {trx.paymentMethod}
                    </span>
                  </td>
                  <td className="p-3 text-gray-700">{trx.collectedBy}</td>
                  <td className="p-3 text-right">
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
                      <span>রসিদ</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
