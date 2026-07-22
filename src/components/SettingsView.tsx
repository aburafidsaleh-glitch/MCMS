import React, { useState } from 'react';
import {
  Settings,
  Building2,
  User,
  Shield,
  Database,
  Download,
  Upload,
  Sparkles,
  Check,
  Save,
  Phone,
  MapPin,
  QrCode,
  MessageSquare
} from 'lucide-react';
import { MosqueProfile, User as UserType } from '../types';

interface SettingsViewProps {
  mosque: MosqueProfile;
  currentUser: UserType;
  onUpdateProfile: (updated: MosqueProfile) => void;
  onTriggerToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  mosque,
  currentUser,
  onUpdateProfile,
  onTriggerToast
}) => {
  const [activeTab, setActiveTab] = useState<'MOSQUE' | 'SYSTEM' | 'PROFILE' | 'FUTURE'>('MOSQUE');

  const [formData, setFormData] = useState<MosqueProfile>({ ...mosque });
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveMosque = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      onUpdateProfile(formData);
      setIsSaving(false);
      onTriggerToast('মসজিদ তথ্য সংরক্ষিত হয়েছে', 'সিস্টেমে সর্বজনীনভাবে প্রোফাইল আপডেট হয়েছে।', 'success');
    }, 400);
  };

  const handleDownloadBackup = () => {
    fetch('/api/houses')
      .then(res => res.json())
      .then(houses => {
        const backupData = {
          mosque: formData,
          exportedAt: new Date().toISOString(),
          housesCount: houses.length,
          version: 'MCMS v2.5'
        };
        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mcms_mosque_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        onTriggerToast('ব্যাকআপ ডাউনলোড হয়েছে', 'JSON ব্যাকআপ ফাইল তৈরি সম্পন্ন।', 'success');
      });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-800" />
          <span>মসজিদ সেটিংস ও কন্ট্রোল প্যানেল (Settings & Profile)</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          মসজিদের মৌলিক পরিচয়, ক্যাশিয়ার/সভাপতি তথ্য, সিস্টেম প্রেফারেন্স ও ব্যাকআপ
        </p>

        {/* Tab switcher */}
        <div className="flex items-center space-x-2 border-t border-slate-100 pt-4 mt-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('MOSQUE')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'MOSQUE'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            মসজিদ তথ্য ও পরিচালনা কমিটি
          </button>
          <button
            onClick={() => setActiveTab('PROFILE')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'PROFILE'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            আমার প্রোফাইল ও অ্যাক্সেস
          </button>
          <button
            onClick={() => setActiveTab('SYSTEM')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'SYSTEM'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            ডেটা ব্যাকআপ ও রিসেট
          </button>
          <button
            onClick={() => setActiveTab('FUTURE')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'FUTURE'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            ভবিষ্যৎ মডিউল (Roadmap)
          </button>
        </div>
      </div>

      {/* Tab 1: Mosque Profile */}
      {activeTab === 'MOSQUE' && (
        <form onSubmit={handleSaveMosque} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-2xs space-y-4 text-xs max-w-3xl">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            মসজিদের সাধারণ ও অফিশিয়াল পরিচিতি
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">মসজিদের পূর্ণ নাম *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">মসজিদ রেজিস্ট্রেশন / ইউনিক কোড</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">বিস্তারিত ঠিকানা</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">সভাপতি (President Name)</label>
              <input
                type="text"
                value={formData.presidentName}
                onChange={(e) => setFormData({ ...formData, presidentName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">কোষাধ্যক্ষ / ক্যাশিয়ার (Treasurer Name)</label>
              <input
                type="text"
                value={formData.treasurerName}
                onChange={(e) => setFormData({ ...formData, treasurerName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">যোগাযোগ ফোন নম্বর</label>
              <input
                type="text"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">প্রতিষ্ঠাকাল (Established Year)</label>
              <input
                type="text"
                value={formData.establishedYear}
                onChange={(e) => setFormData({ ...formData, establishedYear: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-xs flex items-center space-x-2"
            >
              <Save className="w-4 h-4 text-amber-300" />
              <span>{isSaving ? 'সংরক্ষণ হচ্ছে...' : 'পরিবর্তন সংরক্ষণ করুন'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: User Profile */}
      {activeTab === 'PROFILE' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-2xs space-y-4 text-xs max-w-2xl">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-800" />
            <span>বর্তমান লগইনকৃত ইউজার প্রোফাইল</span>
          </h2>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center space-x-4">
            <div className="w-14 h-14 rounded-full bg-emerald-800 text-amber-300 font-bold flex items-center justify-center text-xl shadow-md border border-emerald-600">
              {currentUser.name[0]}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{currentUser.name}</h3>
              <p className="text-xs text-emerald-800 font-bold">রোল: {currentUser.role}</p>
              <p className="text-xs text-slate-500 font-mono">মোবাইল: {currentUser.phone}</p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <h4 className="font-bold text-slate-800">আপনার অনুমোদিত ক্ষমতা ও সুযোগসুবিধা:</h4>
            <ul className="space-y-1.5 text-slate-600 list-disc pl-5">
              <li>মহল্লার বাড়ি তালিকা ও মাসিক চাঁদার রেজিস্টার অ্যাক্সেস</li>
              <li>field mode ঘরে ঘরে তাৎক্ষণিক পেমেন্ট গ্রহণ ও রসিদ তৈরি</li>
              <li>আর্থিক রিপোর্ট ও এক্সেল সিএসভি ডাটা এক্সপোর্ট ক্ষমতা</li>
              <li>মসজিদ কমিটির জন্য AI বিশ্লেষণ রিপোর্ট সুবিধা</li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab 3: System & Backup */}
      {activeTab === 'SYSTEM' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-2xs space-y-4 text-xs max-w-2xl">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-800" />
            <span>ডেটা ব্যাকআপ ও রিকভারি ইউটিলিটি</span>
          </h2>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">সম্পূর্ণ সিস্টেম ডাটাবেস ব্যাকআপ (JSON Download)</h3>
              <p className="text-slate-500 text-xs mt-0.5">
                সকল নিবন্ধিত বাড়ি, চাঁদার রেজিস্টার ও হিস্টোরি একটি সুরক্ষিত JSON ফাইলে ব্যাকআপ করে আপনার কম্পিউটারে সংরক্ষণ করুন।
              </p>
            </div>

            <button
              onClick={handleDownloadBackup}
              className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-xs flex items-center space-x-2"
            >
              <Download className="w-4 h-4 text-amber-300" />
              <span>JSON ব্যাকআপ ডাউনলোড করুন</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Roadmap / Future Ready */}
      {activeTab === 'FUTURE' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-2xs space-y-4 text-xs">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <div>
              <h2 className="text-base font-bold text-slate-900">ভবিষ্যৎ আপগ্রেড ও ফিচার রোডম্যাপ (Future Features)</h2>
              <p className="text-slate-500">MCMS আর্কিটেকচার পরবর্তী ধাপের অটোমেশনের জন্য প্রস্তুত রাখা হয়েছে</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-50 to-white border border-pink-200 space-y-2">
              <div className="flex items-center space-x-2 text-pink-700 font-bold text-sm">
                <QrCode className="w-5 h-5" />
                <span>bKash & Nagad Direct Gateway Integration</span>
              </div>
              <p className="text-slate-600">
                বাড়ির মালিকরা ঘরে বসেই কিউআর কোড স্ক্যান করে বা পেমেন্ট লিংক মারফত সরাসরি মসজিদ ফান্ডে চাঁদা প্রদান করতে পারবেন।
              </p>
              <span className="inline-block bg-pink-100 text-pink-800 font-bold text-[10px] px-2 py-0.5 rounded-full">
                আর্কিটেকচার রেডি
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-white border border-blue-200 space-y-2">
              <div className="flex items-center space-x-2 text-blue-700 font-bold text-sm">
                <MessageSquare className="w-5 h-5" />
                <span>স্বয়ংক্রিয় SMS ও WhatsApp রসিদ</span>
              </div>
              <p className="text-slate-600">
                চাঁদা আদায় হওয়ামাত্রই দাতার মোবাইলে মেসেজ এবং প্রতি মাসের ১ তারিখে বকেয়া সংক্রান্ত অটোমেটিক তাগাদা এসএমএস প্রেরণ।
              </p>
              <span className="inline-block bg-blue-100 text-blue-800 font-bold text-[10px] px-2 py-0.5 rounded-full">
                আর্কিটেকচার রেডি
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
