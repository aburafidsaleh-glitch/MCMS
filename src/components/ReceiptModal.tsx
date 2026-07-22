import React from 'react';
import { X, Printer, Download, CheckCircle2, ShieldCheck, Building2, Phone, Calendar, User, MapPin } from 'lucide-react';
import { MosqueProfile, PaymentTransaction, CollectionRecord, House } from '../types';
import { formatBDT, formatMonthName, formatDateTime, numberToBengaliWords, toBnDigits } from '../utils/formatters';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  mosque: MosqueProfile;
  receiptData: {
    receiptNo: string;
    date: string;
    houseNo: string;
    houseName: string;
    familyHead: string;
    area: string;
    month: string;
    amount: number;
    paymentMethod: string;
    collectedBy: string;
    note?: string;
  } | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, mosque, receiptData }) => {
  if (!isOpen || !receiptData) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    alert('রসিদটি আপনার ডিভাইসে ডাউনলোড সম্পন্ন হয়েছে। (Simulated PDF Export)');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-emerald-100 print:shadow-none print:border-none print:w-full print:p-2">
        {/* Modal Controls (Hidden when printing) */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4 print:hidden">
          <div className="flex items-center space-x-2 text-emerald-800 font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>ডিজিটাল টাকা আদায় রসিদ</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>প্রিন্ট</span>
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>ডাউনলোড</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Money Receipt Design */}
        <div className="border-2 border-emerald-700/80 rounded-xl p-5 bg-gradient-to-b from-emerald-50/20 via-white to-emerald-50/10 relative">
          {/* Watermark / Bismillah */}
          <div className="text-center mb-3">
            <p className="text-emerald-900 font-serif text-sm tracking-wide font-semibold">
              بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </p>
            <p className="text-xs text-emerald-700 font-medium">বিসমিল্লাহির রহমানির রহিম</p>
          </div>

          {/* Mosque Header */}
          <div className="text-center border-b-2 border-emerald-800/30 pb-3 mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-emerald-900 tracking-tight">
              {mosque.name}
            </h2>
            <p className="text-xs text-gray-600 mt-1 flex items-center justify-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-600" />
              {mosque.address}
            </p>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center justify-center gap-2">
              <span>কোড: <strong className="text-gray-700">{mosque.code}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-0.5">
                <Phone className="w-3 h-3 text-emerald-600" />
                {toBnDigits(mosque.contactPhone)}
              </span>
            </p>

            <div className="mt-3 inline-block bg-emerald-800 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-xs">
              মাসিক চাঁদা আদায় রসিদ
            </div>
          </div>

          {/* Meta Information Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs mb-4 bg-emerald-50/60 p-3 rounded-lg border border-emerald-100">
            <div>
              <span className="text-gray-500 block">রসিদ নম্বর:</span>
              <span className="font-mono font-bold text-emerald-900 text-sm">{receiptData.receiptNo}</span>
            </div>
            <div className="text-right">
              <span className="text-gray-500 block">আদায়ের তারিখ:</span>
              <span className="font-semibold text-gray-800">{formatDateTime(receiptData.date)}</span>
            </div>
          </div>

          {/* Member & Collection Details */}
          <div className="space-y-2 text-xs md:text-sm text-gray-800">
            <div className="flex justify-between border-b border-gray-200/60 pb-1.5">
              <span className="text-gray-600">বাড়ি নম্বর & নাম:</span>
              <span className="font-semibold text-emerald-950">{receiptData.houseNo} ({receiptData.houseName})</span>
            </div>
            <div className="flex justify-between border-b border-gray-200/60 pb-1.5">
              <span className="text-gray-600">পরিবারের প্রধানের নাম:</span>
              <span className="font-semibold text-gray-900">{receiptData.familyHead}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200/60 pb-1.5">
              <span className="text-gray-600">মহল্লা / এলাকা:</span>
              <span className="font-medium text-gray-800">{receiptData.area}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200/60 pb-1.5">
              <span className="text-gray-600">চাঁদার মাস:</span>
              <span className="font-bold text-emerald-800">{formatMonthName(receiptData.month)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200/60 pb-1.5">
              <span className="text-gray-600">পেমেন্ট মাধ্যম:</span>
              <span className="font-medium text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded text-xs">
                {receiptData.paymentMethod === 'CASH' && 'নগদ (Cash)'}
                {receiptData.paymentMethod === 'BKASH' && 'বিকাশ (bKash)'}
                {receiptData.paymentMethod === 'NAGAD' && 'নগদ ওয়ালেট (Nagad)'}
                {receiptData.paymentMethod === 'BANK' && 'ব্যাংক পে (Bank)'}
              </span>
            </div>
            {receiptData.note && (
              <div className="flex justify-between border-b border-gray-200/60 pb-1.5">
                <span className="text-gray-600">নোট / মন্তব্য:</span>
                <span className="italic text-gray-700 text-xs">{receiptData.note}</span>
              </div>
            )}
          </div>

          {/* Amount Display */}
          <div className="mt-4 p-3 bg-emerald-900 text-white rounded-xl text-center shadow-inner">
            <div className="text-xs text-emerald-200 uppercase tracking-wider">আদায়কৃত অর্থের পরিমাণ</div>
            <div className="text-2xl md:text-3xl font-extrabold text-amber-300 mt-0.5">
              {formatBDT(receiptData.amount)}
            </div>
            <div className="text-xs text-emerald-100 mt-1 font-medium">
              কথায়: {numberToBengaliWords(receiptData.amount)}
            </div>
          </div>

          {/* Signatures & Footer */}
          <div className="mt-8 pt-4 border-t border-dashed border-gray-300 flex items-end justify-between text-xs">
            <div className="text-center">
              <div className="w-24 border-b border-gray-400 mb-1"></div>
              <p className="text-gray-600">সদস্যের স্বাক্ষর</p>
            </div>

            {/* QR Code Graphic */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 border border-emerald-300 rounded bg-white p-1 flex items-center justify-center shadow-xs">
                <div className="w-10 h-10 bg-emerald-900/10 rounded flex items-center justify-center text-[8px] font-mono font-bold text-emerald-800 text-center leading-tight">
                  MCMS<br/>VERIFIED
                </div>
              </div>
              <span className="text-[10px] text-gray-400 mt-1">ডিজিটাল ভেরিফায়েড</span>
            </div>

            <div className="text-center">
              <p className="font-semibold text-emerald-900 text-xs mb-1">{receiptData.collectedBy}</p>
              <div className="w-28 border-b border-emerald-600 mb-1"></div>
              <p className="text-gray-600">আদায়কারীর স্বাক্ষর</p>
            </div>
          </div>

          <div className="mt-4 text-center text-[10px] text-gray-400 border-t border-gray-100 pt-2">
            মসজিদ কালেকশন ম্যানেজমেন্ট সিস্টেম (MCMS) দ্বারা স্বয়ংক্রিয়ভাবে তৈরি ডিজিটালাইজড রসিদ।
          </div>
        </div>

        {/* Modal Bottom Close */}
        <div className="mt-4 text-right print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
