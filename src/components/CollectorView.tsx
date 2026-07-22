import React, { useState } from 'react';
import { Search, MapPin, Phone, CheckCircle, AlertCircle, DollarSign, Wallet, ArrowRight, ShieldCheck, CreditCard, Clock, FileText, Smartphone } from 'lucide-react';
import { House, CollectionRecord, User, PaymentMethod } from '../types';
import { formatBDT, formatMonthName, toBnDigits } from '../utils/formatters';

interface CollectorViewProps {
  houses: House[];
  collections: CollectionRecord[];
  currentMonth: string;
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
  onViewReceipt: (rec: any) => void;
}

export const CollectorView: React.FC<CollectorViewProps> = ({
  houses,
  collections,
  currentMonth,
  currentUser,
  onCollectPayment,
  onViewReceipt
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DUE' | 'PARTIAL' | 'PAID'>('DUE');
  
  // Selected house for quick collection modal
  const [activeHouse, setActiveHouse] = useState<House | null>(null);
  const [collectAmount, setCollectAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successTrx, setSuccessTrx] = useState<any>(null);

  const areas = ['ALL', 'পূর্ব পাড়া', 'পশ্চিম পাড়া', 'উত্তর পাড়া', 'দক্ষিণ পাড়া', 'মধ্য বাজার'];

  // Map collection status by houseId for current month
  const collectionMap = new Map<string, CollectionRecord>();
  collections.forEach(c => {
    if (c.month === currentMonth) {
      collectionMap.set(c.houseId, c);
    }
  });

  // Filter houses
  const filteredHouses = houses.filter(h => {
    if (!h.isActive) return false;

    const matchesSearch =
      h.houseNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.houseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.familyHead.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.phone.includes(searchTerm) ||
      h.area.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesArea = selectedArea === 'ALL' || h.area === selectedArea;

    const col = collectionMap.get(h.id);
    const status = col ? col.status : 'DUE';

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'DUE' && status === 'DUE') ||
      (statusFilter === 'PARTIAL' && status === 'PARTIAL') ||
      (statusFilter === 'PAID' && status === 'PAID');

    return matchesSearch && matchesArea && matchesStatus;
  });

  const handleOpenCollectModal = (house: House) => {
    const col = collectionMap.get(house.id);
    const due = col ? col.dueAmount : house.monthlyPledge;
    setActiveHouse(house);
    setCollectAmount(due > 0 ? due : house.monthlyPledge);
    setPaymentMethod('CASH');
    setNote('');
    setSuccessTrx(null);
  };

  const handleConfirmCollection = () => {
    if (!activeHouse || collectAmount <= 0) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onCollectPayment({
        houseId: activeHouse.id,
        month: currentMonth,
        amount: collectAmount,
        paymentMethod,
        collectorName: currentUser.name,
        collectorId: currentUser.id,
        note: note.trim()
      });

      const receiptNo = collectionMap.get(activeHouse.id)?.receiptNo || `REC-${currentMonth.replace('-', '')}-${Math.floor(100 + Math.random() * 900)}`;

      setSuccessTrx({
        receiptNo,
        date: new Date().toISOString(),
        houseNo: activeHouse.houseNo,
        houseName: activeHouse.houseName,
        familyHead: activeHouse.familyHead,
        area: activeHouse.area,
        month: currentMonth,
        amount: collectAmount,
        paymentMethod,
        collectedBy: currentUser.name,
        note: note.trim()
      });

      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Collector Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-900/60 text-emerald-200 text-xs px-3 py-1 rounded-full font-medium mb-2 border border-emerald-500/30">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>ঘরে ঘরে দ্রুত কালেকশন ইন্টারফেস (Mobile First)</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">
              চাঁদা আদায় স্পেশাল মোড
            </h1>
            <p className="text-emerald-100 text-xs md:text-sm mt-1">
              মাস: <span className="font-bold text-amber-300">{formatMonthName(currentMonth)}</span> | সংগ্রাহক: <span className="font-semibold">{currentUser.name}</span>
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 text-center min-w-[140px]">
            <span className="text-[11px] text-emerald-100 uppercase tracking-wider block">ডিফল্ট এলাকা</span>
            <span className="text-sm font-bold text-amber-300">{currentUser.assignedArea || 'সকল পাড়া'}</span>
          </div>
        </div>
      </div>

      {/* Quick Search & Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100/80 space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="বাড়ি নম্বর (১০১/এ), নাম, পরিবার প্রধান বা ফোন নম্বর লিখে খুঁজুন..."
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium text-gray-800"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 bg-gray-200 px-2 py-1 rounded-md"
            >
              মুছে ফেলুন
            </button>
          )}
        </div>

        {/* Mahalla Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
          {areas.map(area => (
            <button
              key={area}
              onClick={() => setSelectedArea(area)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                selectedArea === area
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {area === 'ALL' ? 'সব এলাকা (All)' : area}
            </button>
          ))}
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
          <span className="text-gray-500 font-medium">স্ট্যাটাস অনুযায়ী দেখুন:</span>
          <div className="flex space-x-1">
            <button
              onClick={() => setStatusFilter('DUE')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                statusFilter === 'DUE'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              বকেয়া (DUE)
            </button>
            <button
              onClick={() => setStatusFilter('PARTIAL')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                statusFilter === 'PARTIAL'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              আংশিক (PARTIAL)
            </button>
            <button
              onClick={() => setStatusFilter('PAID')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                statusFilter === 'PAID'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              পরিশোধিত (PAID)
            </button>
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                statusFilter === 'ALL'
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              সকল
            </button>
          </div>
        </div>
      </div>

      {/* Houses Collection Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredHouses.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-8 text-center text-gray-500 border border-dashed border-gray-300">
            <AlertCircle className="w-10 h-10 mx-auto text-gray-400 mb-2" />
            <p className="font-semibold text-gray-700">কোনো বাড়ির তথ্য পাওয়া যায়নি</p>
            <p className="text-xs text-gray-400 mt-1">অন্য কোনো নাম, নম্বর বা এলাকা নির্বাচন করে চেষ্টা করুন।</p>
          </div>
        ) : (
          filteredHouses.map(house => {
            const col = collectionMap.get(house.id);
            const status = col ? col.status : 'DUE';
            const paid = col ? col.paidAmount : 0;
            const target = col ? col.targetAmount : house.monthlyPledge;
            const due = col ? col.dueAmount : house.monthlyPledge;

            return (
              <div
                key={house.id}
                className={`bg-white rounded-2xl p-4 border transition-all duration-200 hover:shadow-md flex flex-col justify-between ${
                  status === 'PAID'
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : status === 'PARTIAL'
                    ? 'border-amber-200 bg-amber-50/10'
                    : 'border-red-200'
                }`}
              >
                <div>
                  {/* Top Bar inside Card */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="bg-emerald-900 text-amber-300 font-mono font-bold text-xs px-2.5 py-1 rounded-lg shadow-xs">
                        {house.houseNo}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-700 font-medium px-2 py-0.5 rounded-md">
                        {house.area}
                      </span>
                    </div>

                    {/* Status Badge */}
                    {status === 'PAID' && (
                      <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>পরিশোধিত</span>
                      </span>
                    )}
                    {status === 'PARTIAL' && (
                      <span className="inline-flex items-center space-x-1 text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-300">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>আংশিক</span>
                      </span>
                    )}
                    {status === 'DUE' && (
                      <span className="inline-flex items-center space-x-1 text-xs font-bold text-red-800 bg-red-100 px-2.5 py-1 rounded-full border border-red-300">
                        <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                        <span>বকেয়া</span>
                      </span>
                    )}
                  </div>

                  {/* House Details */}
                  <h3 className="font-bold text-gray-900 text-base flex items-center justify-between">
                    <span>{house.familyHead}</span>
                  </h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>{house.houseName} - {house.address}</span>
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span className="font-mono">{toBnDigits(house.phone)}</span>
                  </p>

                  {/* Financial status indicators */}
                  <div className="mt-3 p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-gray-400 block text-[10px]">নির্ধারিত চাঁদা</span>
                      <span className="font-bold text-gray-800">{formatBDT(target)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">পরিশোধিত</span>
                      <span className="font-bold text-emerald-700">{formatBDT(paid)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-400 block text-[10px]">বকেয়া পরিমাণ</span>
                      <span className={`font-extrabold text-sm ${due > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                        {formatBDT(due)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="mt-4 pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                  {col && col.receiptNo && (
                    <button
                      onClick={() => onViewReceipt({
                        receiptNo: col.receiptNo,
                        date: col.lastPaidDate || new Date().toISOString(),
                        houseNo: house.houseNo,
                        houseName: house.houseName,
                        familyHead: house.familyHead,
                        area: house.area,
                        month: currentMonth,
                        amount: col.paidAmount,
                        paymentMethod: col.paymentMethod || 'CASH',
                        collectedBy: col.collectedBy || currentUser.name,
                        note: col.collectorNote
                      })}
                      className="inline-flex items-center space-x-1 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200 rounded-xl transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>রসিদ দেখুন</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenCollectModal(house)}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-xs transition-all ${
                      status === 'PAID'
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-emerald-800 hover:bg-emerald-900 text-white shadow-emerald-900/20'
                    }`}
                  >
                    <Wallet className="w-4 h-4 text-amber-300" />
                    <span>{status === 'PAID' ? 'পুনরায় চাঁদা গ্রহণ' : status === 'PARTIAL' ? 'বাকী টাকা আদায়' : 'চাঁদা আদায় করুন'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Collection Dialog Drawer */}
      {activeHouse && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-5">
            {successTrx ? (
              /* Success State inside modal */
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">টাকা সফলভাবে আদায় হয়েছে!</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    বাড়ি: <strong className="text-gray-800">{activeHouse.houseNo} ({activeHouse.familyHead})</strong>
                  </p>
                  <p className="text-2xl font-extrabold text-emerald-800 mt-2">
                    {formatBDT(collectAmount)}
                  </p>
                  <p className="text-xs text-emerald-600 font-mono mt-1">রসিদ নম্বর: {successTrx.receiptNo}</p>
                </div>

                <div className="pt-4 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      onViewReceipt(successTrx);
                      setActiveHouse(null);
                    }}
                    className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-sm shadow-md flex items-center justify-center space-x-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>ডিজিটাল রসিদ প্রদর্শন / প্রিন্ট</span>
                  </button>
                  <button
                    onClick={() => setActiveHouse(null)}
                    className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium text-xs"
                  >
                    বন্ধ করুন
                  </button>
                </div>
              </div>
            ) : (
              /* Form State */
              <>
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <span className="text-[11px] text-emerald-700 font-bold uppercase tracking-wider block">ক্যাশ কালেকশন কনফার্মেশন</span>
                    <h2 className="text-lg font-bold text-gray-900">{activeHouse.familyHead}</h2>
                    <p className="text-xs text-gray-500">বাড়ি: {activeHouse.houseNo} ({activeHouse.area})</p>
                  </div>
                  <button
                    onClick={() => setActiveHouse(null)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    ✕
                  </button>
                </div>

                {/* Amount Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 block">আদায়কৃত পরিমাণ (BDT):</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-emerald-800 text-lg">৳</span>
                    <input
                      type="number"
                      value={collectAmount || ''}
                      onChange={(e) => setCollectAmount(Number(e.target.value))}
                      className="w-full pl-9 pr-4 py-3 text-xl font-extrabold text-emerald-950 bg-emerald-50/50 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  {/* Preset Buttons */}
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {[200, 300, 500, 1000].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setCollectAmount(amt)}
                        className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                          collectAmount === amt
                            ? 'bg-emerald-800 text-white border-emerald-800'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        ৳{toBnDigits(amt)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Method Toggle */}
                <div className="space-y-2 pt-1">
                  <label className="text-xs font-bold text-gray-700 block">পেমেন্ট মাধ্যম নির্বাচন করুন:</label>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('CASH')}
                      className={`py-2 text-xs font-bold rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                        paymentMethod === 'CASH'
                          ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>নগদ</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('BKASH')}
                      className={`py-2 text-xs font-bold rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                        paymentMethod === 'BKASH'
                          ? 'bg-pink-600 text-white border-pink-600 shadow-xs'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>বিকাশ</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('NAGAD')}
                      className={`py-2 text-xs font-bold rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                        paymentMethod === 'NAGAD'
                          ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>নগদ ওয়ালেট</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('BANK')}
                      className={`py-2 text-xs font-bold rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                        paymentMethod === 'BANK'
                          ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <Wallet className="w-4 h-4" />
                      <span>ব্যাংক</span>
                    </button>
                  </div>
                </div>

                {/* Optional Note */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600 block">মন্তব্য / নোট (ঐচ্ছিক):</label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="যেমন: বাকী ৫০০ টাকা আগামী জুমাবারে দেবেন..."
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Confirm Action */}
                <div className="pt-3">
                  <button
                    disabled={isSubmitting || collectAmount <= 0}
                    onClick={handleConfirmCollection}
                    className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-900/20 flex items-center justify-center space-x-2 transition-all"
                  >
                    {isSubmitting ? (
                      <span>প্রসেসিং হচ্ছে...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5 text-amber-300" />
                        <span>পেমেন্ট নিশ্চিত করুন ({formatBDT(collectAmount)})</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
