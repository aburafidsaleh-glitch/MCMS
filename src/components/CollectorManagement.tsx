import React, { useState } from 'react';
import { Users, Plus, Phone, MapPin, CheckCircle, Smartphone, Award, ShieldAlert, Edit, Trash2 } from 'lucide-react';
import { User, CollectionRecord, House } from '../types';
import { INITIAL_USERS } from '../data/mockData';
import { formatBDT, toBnDigits } from '../utils/formatters';

interface CollectorManagementProps {
  collections: CollectionRecord[];
  houses: House[];
  currentMonth: string;
}

export const CollectorManagement: React.FC<CollectorManagementProps> = ({
  collections,
  houses,
  currentMonth
}) => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    role: 'COLLECTOR' as const,
    phone: '',
    assignedArea: 'পূর্ব পাড়া'
  });

  const collectors = users.filter(u => u.role === 'COLLECTOR' || u.role === 'ADMIN' || u.role === 'TREASURER');

  // Compute collector stats
  const currentCollections = collections.filter(c => c.month === currentMonth);

  const handleSaveCollector = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    if (editingUser) {
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...formData } : u));
    } else {
      const newUser: User = {
        id: `U-${Date.now().toString().slice(-4)}`,
        name: formData.name,
        role: formData.role,
        phone: formData.phone,
        assignedArea: formData.assignedArea
      };
      setUsers(prev => [...prev, newUser]);
    }
    setIsAddModalOpen(false);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      role: user.role as any,
      phone: user.phone,
      assignedArea: user.assignedArea || 'পূর্ব পাড়া'
    });
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-800" />
            <span>সংগ্রাহক ও স্টাফ ডিরেক্টরি (Collector Management)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            মাঠে ঘরে ঘরে কালেকশনকারী সদস্য, এলাকা বরাদ্দ ও লাইভ পারফরম্যান্স ট্র্যাকিং
          </p>
        </div>

        <button
          onClick={() => {
            setEditingUser(null);
            setFormData({ name: '', role: 'COLLECTOR', phone: '', assignedArea: 'পূর্ব পাড়া & উত্তর পাড়া' });
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition-all shadow-xs"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          <span>নতুন সংগ্রাহক যুক্ত করুন</span>
        </button>
      </div>

      {/* Collector Staff Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {collectors.map((collector) => {
          // Calculate collector metrics
          const collectedByThisUser = currentCollections.filter(c => c.collectedBy === collector.name);
          const totalAmountCollected = collectedByThisUser.reduce((sum, c) => sum + c.paidAmount, 0);
          const housesCollectedCount = collectedByThisUser.filter(c => c.status === 'PAID' || c.status === 'PARTIAL').length;

          return (
            <div key={collector.id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4 hover:border-emerald-300 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-900 text-amber-300 font-bold flex items-center justify-center text-base shadow-inner">
                    {collector.name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{collector.name}</h3>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      {collector.role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenEdit(collector)}
                  className="p-1.5 text-slate-400 hover:text-emerald-800 rounded-lg hover:bg-slate-100 transition-colors"
                  title="সম্পাদনা করুন"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>

              {/* Contact Info */}
              <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span className="font-mono text-slate-800 font-semibold">{toBnDigits(collector.phone)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span className="font-medium text-slate-800">দায়িত্বপ্রাপ্ত এলাকা: <strong className="text-emerald-900">{collector.assignedArea}</strong></span>
                </div>
              </div>

              {/* Monthly Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
                  <span className="text-[10px] text-slate-500 block">চলতি মাসে সংগ্রহ</span>
                  <span className="font-extrabold text-emerald-900 text-sm">{formatBDT(totalAmountCollected)}</span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 block">পরিশোধিত বাড়ি</span>
                  <span className="font-extrabold text-slate-900 text-sm">{toBnDigits(housesCollectedCount)} টি</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>সক্রিয় সার্ভিস মোড</span>
                </span>
                <span className="text-slate-400 text-[10px]">ID: {collector.id}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Collector Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingUser ? 'সংগ্রাহকের তথ্য আপডেট করুন' : 'নতুন সংগ্রাহক নিবন্ধিত করুন'}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSaveCollector} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">সংগ্রাহকের পুরো নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: মোঃ জসিম উদ্দিন"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">মোবাইল নম্বর *</label>
                <input
                  type="text"
                  required
                  placeholder="01711-000000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">রোল (Role)</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                >
                  <option value="COLLECTOR">COLLECTOR (ক্যাশ কালেক্টর)</option>
                  <option value="TREASURER">TREASURER (ক্যাশিয়ার / কোষাধ্যক্ষ)</option>
                  <option value="ADMIN">ADMIN (মসজিদ অ্যাডমিন)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">দায়িত্বপ্রাপ্ত এলাকা (Assigned Area)</label>
                <input
                  type="text"
                  placeholder="যেমন: পূর্ব পাড়া & উত্তর পাড়া"
                  value={formData.assignedArea}
                  onChange={(e) => setFormData({ ...formData, assignedArea: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-xs"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
