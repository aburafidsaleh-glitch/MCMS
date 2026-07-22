import React, { useState } from 'react';
import { AlertTriangle, Printer, Phone, MapPin, Search, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { House, CollectionRecord, User, PaymentMethod } from '../types';
import { formatBDT, formatMonthName, toBnDigits } from '../utils/formatters';

interface DueListProps {
  houses: House[];
  collections: CollectionRecord[];
  currentUser: User;
  onCollectPayment: (data: {
    houseId: string;
    month: string;
    amount: number;
    paymentMethod: PaymentMethod;
    collectorName: string;
    collectorId: string;
    note?: string;
  }) => void;
}

export const DueList: React.FC<DueListProps> = ({
  houses,
  collections,
  currentUser,
  onCollectPayment
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState('ALL');
  const [selectedHouseReminder, setSelectedHouseReminder] = useState<any>(null);

  // Quick collection modal state
  const [collectingHouse, setCollectingHouse] = useState<{ house: House; month: string; due: number } | null>(null);
  const [collectAmount, setCollectAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');

  const areas = ['ALL', 'পূর্ব পাড়া', 'পশ্চিম পাড়া', 'উত্তর পাড়া', 'দক্ষিণ পাড়া', 'মধ্য বাজার'];

  // Calculate accumulated dues per house
  const houseDuesMap = new Map<string, {
    house: House;
    totalDue: number;
    unpaidMonths: { month: string; dueAmount: number }[];
  }>();

  houses.forEach(h => {
    if (!h.isActive) return;
    const houseRecords = collections.filter(c => c.houseId === h.id && c.dueAmount > 0);
    if (houseRecords.length > 0) {
      const totalDue = houseRecords.reduce((sum, r) => sum + r.dueAmount, 0);
      const unpaidMonths = houseRecords.map(r => ({ month: r.month, dueAmount: r.dueAmount }));
      houseDuesMap.set(h.id, { house: h, totalDue, unpaidMonths });
    }
  });

  const duesList = Array.from(houseDuesMap.values());

  const filteredDues = duesList.filter(item => {
    const matchesSearch =
      item.house.houseNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.house.familyHead.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.house.phone.includes(searchTerm);

    const matchesArea = selectedArea === 'ALL' || item.house.area === selectedArea;

    return matchesSearch && matchesArea;
  });

  const totalOverdueSum = filteredDues.reduce((sum, i) => sum + i.totalDue, 0);

  const handlePrintReminder = (item: any) => {
    setSelectedHouseReminder(item);
  };

  const handleOpenCollect = (house: House, month: string, due: number) => {
    setCollectingHouse({ house, month, due });
    setCollectAmount(due);
    setPaymentMethod('CASH');
  };

  const handleConfirmCollect = () => {
    if (!collectingHouse || collectAmount <= 0) return;

    onCollectPayment({
      houseId: collectingHouse.house.id,
      month: collectingHouse.month,
      amount: collectAmount,
      paymentMethod,
      collectorName: currentUser.name,
      collectorId: currentUser.id,
      note: 'বকেয়া তালিকা থেকে আদায়'
    });

    setCollectingHouse(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span>বকেয়া চাঁদার তালিকা (Overdue List)</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            যে সকল বাড়ির পূর্বের এক বা একাধিক মাসের চাঁদা বকেয়া রয়েছে
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 px-4 py-2 rounded-xl text-right">
          <span className="text-[11px] text-red-700 font-semibold block uppercase">সর্বমোট জমাকৃত বকেয়া</span>
          <span className="text-xl font-extrabold text-red-600">{formatBDT(totalOverdueSum)}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="বাড়ি নং বা নাম লিখে বকেয়া খুঁজুন..."
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <select
          value={selectedArea}
          onChange={(e) => setSelectedArea(e.target.value)}
          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
        >
          {areas.map(a => <option key={a} value={a}>{a === 'ALL' ? 'সকল মহল্লা' : a}</option>)}
        </select>
      </div>

      {/* Dues Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDues.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-8 text-center text-gray-500 border border-dashed border-gray-300">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
            <p className="font-bold text-gray-800">আলহামদুলিল্লাহ! কোনো বকেয়া নেই</p>
            <p className="text-xs text-gray-400 mt-1">নির্বাচিত এলাকায় সমস্ত চাঁদা সংগৃহীত হয়েছে।</p>
          </div>
        ) : (
          filteredDues.map(item => (
            <div key={item.house.id} className="bg-white rounded-2xl p-4 border border-red-200 shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="bg-red-900 text-amber-300 font-mono font-bold text-xs px-2.5 py-0.5 rounded-lg">
                    {item.house.houseNo}
                  </span>
                  <span className="text-xs bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-md">
                    বকেয়া: {formatBDT(item.totalDue)}
                  </span>
                </div>

                <h3 className="font-bold text-gray-900 text-sm mt-2">{item.house.familyHead}</h3>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>{item.house.area} ({item.house.houseName})</span>
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span className="font-mono">{toBnDigits(item.house.phone)}</span>
                </p>

                {/* Unpaid Months Chips */}
                <div className="mt-3 pt-2 border-t border-gray-100">
                  <span className="text-[11px] font-semibold text-gray-500 block mb-1">বকেয়া মাসসমূহ:</span>
                  <div className="flex flex-wrap gap-1">
                    {item.unpaidMonths.map(u => (
                      <button
                        key={u.month}
                        onClick={() => handleOpenCollect(item.house, u.month, u.dueAmount)}
                        className="bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 text-[11px] font-bold px-2 py-0.5 rounded-md inline-flex items-center space-x-1"
                      >
                        <span>{formatMonthName(u.month)}:</span>
                        <span className="text-red-900">{formatBDT(u.dueAmount)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reminder Slip Print Button */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => handlePrintReminder(item)}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>তাগাদা স্লিপ প্রিন্ট</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reminder Slip Printable Modal */}
      {selectedHouseReminder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs print:p-0 print:bg-white print:fixed print:inset-0">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border-2 border-red-700 space-y-4 print:shadow-none print:w-full">
            <div className="text-center border-b pb-3">
              <p className="text-xs text-emerald-800 font-serif font-bold">بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
              <h2 className="text-lg font-bold text-gray-900 mt-1">মসজিদ চাঁদা বকেয়া স্মরণপত্র (তাগাদা স্লিপ)</h2>
            </div>

            <div className="space-y-2 text-xs text-gray-800">
              <p>শ্রদ্ধেয় <strong>{selectedHouseReminder.house.familyHead}</strong>,</p>
              <p>আসসালামু আলাইকুম ওয়া রহমাতুল্লাহ। মসজিদের উন্নয়ন ও ইমাম-মুয়াজ্জিন ছাহেবানের সম্মানী প্রদানের লক্ষ্যে আপনার নিবন্ধিত বাড়ি (<strong>{selectedHouseReminder.house.houseNo}</strong>) এর বকেয়া চাঁদা জমাদানের জন্য বিনীত অনুরোধ করা হচ্ছে।</p>

              <div className="bg-red-50 p-3 rounded-xl border border-red-200 space-y-1">
                <p className="font-bold text-red-900">বকেয়া মাসের তালিকা:</p>
                {selectedHouseReminder.unpaidMonths.map((u: any) => (
                  <div key={u.month} className="flex justify-between">
                    <span>{formatMonthName(u.month)}:</span>
                    <span className="font-bold text-red-700">{formatBDT(u.dueAmount)}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-red-200 pt-1 font-bold text-sm text-red-900">
                  <span>সর্বমোট বকেয়া:</span>
                  <span>{formatBDT(selectedHouseReminder.totalDue)}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-between items-end text-xs">
              <div className="text-center">
                <div className="w-20 border-b border-gray-400 mb-1"></div>
                <span className="text-gray-500">কোষাধ্যক্ষ</span>
              </div>
              <div className="text-center">
                <div className="w-20 border-b border-gray-400 mb-1"></div>
                <span className="text-gray-500">সভাপতি/সেক্রেটারি</span>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end space-x-2 print:hidden">
              <button onClick={() => window.print()} className="px-3 py-1.5 bg-emerald-800 text-white text-xs font-bold rounded-xl">প্রিন্ট করুন</button>
              <button onClick={() => setSelectedHouseReminder(null)} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-xl">বন্ধ</button>
            </div>
          </div>
        </div>
      )}

      {/* Collect Modal from Due List */}
      {collectingHouse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl space-y-3">
            <h3 className="text-base font-bold text-gray-900 border-b pb-2">
              বকেয়া চাঁদা গ্রহণ - {collectingHouse.house.houseNo} ({formatMonthName(collectingHouse.month)})
            </h3>
            <div className="space-y-2 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">পরিমাণ (BDT)</label>
                <input
                  type="number"
                  value={collectAmount}
                  onChange={(e) => setCollectAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-emerald-50 border border-emerald-200 font-bold text-lg text-emerald-900 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">পেমেন্ট মাধ্যম</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                >
                  <option value="CASH">নগদ (Cash)</option>
                  <option value="BKASH">বিকাশ (bKash)</option>
                  <option value="NAGAD">নগদ ওয়ালেট (Nagad)</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button onClick={() => setCollectingHouse(null)} className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-xl">বাতিল</button>
                <button onClick={handleConfirmCollect} className="px-4 py-2 bg-emerald-800 text-white font-bold rounded-xl">জমা গ্রহণ</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
