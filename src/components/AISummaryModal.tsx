import React, { useState } from 'react';
import { Sparkles, X, Building2, RefreshCw, Bot, CheckCircle } from 'lucide-react';
import { MosqueProfile } from '../types';
import { formatMonthName } from '../utils/formatters';

interface AISummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  mosque: MosqueProfile;
  month: string;
}

export const AISummaryModal: React.FC<AISummaryModalProps> = ({
  isOpen,
  onClose,
  mosque,
  month
}) => {
  const [loading, setLoading] = useState(false);
  const [summaryText, setSummaryText] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerateSummary = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month })
      });
      const data = await res.json();
      setSummaryText(data.summary);
    } catch (err) {
      console.error(err);
      setSummaryText('AI সারসংক্ষেপ জেনারেট করতে সাময়িক সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-white rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-purple-100">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">AI সংগ্রাহক ও কমিটি রিপোর্ট সারসংক্ষেপ</h3>
              <p className="text-xs text-gray-500">{mosque.name} - {formatMonthName(month)}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">✕</button>
        </div>

        {!summaryText && !loading && (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner border border-purple-100">
              <Bot className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-base">কমিটি মিটিংয়ের জন্য বুদ্ধিমান সংক্ষেপ তৈরি করুন</h4>
              <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
                Gemini AI এর মাধ্যমে চলতি মাসের সংগৃহীত অর্থ, মহল্লাভিত্তিক বকেয়া বিশ্লেষণ এবং মসজিদ ফান্ডের উন্নতি সম্পর্কিত ৩টি কার্যকর পরামর্শ স্বয়ংক্রিয়ভাবে তৈরি করুন।
              </p>
            </div>
            <button
              onClick={handleGenerateSummary}
              className="px-6 py-3 bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-900/20 inline-flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>রিপোর্ট বিশ্লেষণ শুরু করুন</span>
            </button>
          </div>
        )}

        {loading && (
          <div className="text-center py-12 space-y-3">
            <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
            <p className="font-bold text-gray-800 text-sm">Gemini AI রিপোর্ট বিশ্লেষণ করছে...</p>
            <p className="text-xs text-gray-400">অনুগ্রহ করে কয়েক সেকেন্ড অপেক্ষা করুন</p>
          </div>
        )}

        {summaryText && !loading && (
          <div className="space-y-4">
            <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-100 text-xs text-gray-800 whitespace-pre-wrap leading-relaxed font-sans">
              {summaryText}
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-gray-100">
              <button
                onClick={handleGenerateSummary}
                className="text-xs text-purple-700 font-semibold hover:underline inline-flex items-center space-x-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>পুনরায় তৈরি করুন</span>
              </button>

              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-xs rounded-xl"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
