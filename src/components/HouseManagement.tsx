import React, { useState } from 'react';
import {
  Building2,
  Plus,
  FileSpreadsheet,
  Search,
  Filter,
  Edit,
  Trash2,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
  Download,
  Upload,
  UserCheck,
  FileText
} from 'lucide-react';
import { House, CollectionRecord, HouseCategory, User } from '../types';
import { formatBDT, formatMonthName, toBnDigits } from '../utils/formatters';

interface HouseManagementProps {
  houses: House[];
  collections: CollectionRecord[];
  currentUser: User;
  currentMonth: string;
  onAddHouse: (house: Partial<House>) => void;
  onUpdateHouse: (id: string, house: Partial<House>) => void;
  onDeleteHouse: (id: string) => void;
  onBulkImport: (items: Partial<House>[]) => void;
}

export const HouseManagement: React.FC<HouseManagementProps> = ({
  houses,
  collections,
  currentUser,
  currentMonth,
  onAddHouse,
  onUpdateHouse,
  onDeleteHouse,
  onBulkImport
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [editingHouse, setEditingHouse] = useState<House | null>(null);
  const [viewingHouse, setViewingHouse] = useState<House | null>(null);

  // Add/Edit House Form State
  const [formData, setFormData] = useState({
    houseNo: '',
    houseName: '',
    familyHead: '',
    phone: '',
    area: 'পূর্ব পাড়া',
    monthlyPledge: 500,
    category: 'General' as HouseCategory,
    address: '',
    notes: ''
  });

  // CSV text for bulk import
  const [csvText, setCsvText] = useState('');

  const areas = ['ALL', 'পূর্ব পাড়া', 'পশ্চিম পাড়া', 'উত্তর পাড়া', 'দক্ষিণ পাড়া', 'মধ্য বাজার'];
  const categories = ['ALL', 'General', 'Donation Premium', 'Zakat Eligible', 'Business'];

  const filteredHouses = houses.filter(h => {
    const matchesSearch =
      h.houseNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.houseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.familyHead.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.phone.includes(searchTerm) ||
      h.address.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesArea = selectedArea === 'ALL' || h.area === selectedArea;
    const matchesCategory = selectedCategory === 'ALL' || h.category === selectedCategory;

    return matchesSearch && matchesArea && matchesCategory;
  });

  const handleOpenAdd = () => {
    setFormData({
      houseNo: '',
      houseName: '',
      familyHead: '',
      phone: '',
      area: 'পূর্ব পাড়া',
      monthlyPledge: 500,
      category: 'General',
      address: '',
      notes: ''
    });
    setEditingHouse(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (h: House) => {
    setFormData({
      houseNo: h.houseNo,
      houseName: h.houseName,
      familyHead: h.familyHead,
      phone: h.phone,
      area: h.area,
      monthlyPledge: h.monthlyPledge,
      category: h.category,
      address: h.address,
      notes: h.notes || ''
    });
    setEditingHouse(h);
    setIsAddModalOpen(true);
  };

  const handleSubmitHouse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.houseNo || !formData.familyHead) return;

    if (editingHouse) {
      onUpdateHouse(editingHouse.id, formData);
    } else {
      onAddHouse(formData);
    }
    setIsAddModalOpen(false);
  };

  const handleDownloadSampleCsv = () => {
    const csvContent =
      'houseNo,houseName,familyHead,phone,area,monthlyPledge,category,address\n' +
      '১০৫/এ,মিয়া ভবন,হাজী মোঃ রফিকুল ইসলাম,01711223344,পূর্ব পাড়া,500,General,রোড-১\n' +
      '১০৬/বি,রহমান কুটির,মোঃ শফিক রহমান,01811223344,পূর্ব পাড়া,1000,Donation Premium,রোড-২\n' +
      '২০৪/এ,চৌধুরী নিড়,ডাঃ আনোয়ার চৌধুরী,01911223344,পশ্চিম পাড়া,300,General,রোড-৩';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_mosque_houses_import.csv';
    a.click();
  };

  const handleProcessBulkCsv = () => {
    if (!csvText.trim()) return;

    const lines = csvText.trim().split('\n');
    const items: Partial<House>[] = [];

    // skip header if contains houseNo
    const startIdx = lines[0].toLowerCase().includes('houseno') ? 1 : 0;

    for (let i = startIdx; i < lines.length; i++) {
      const parts = lines[i].split(',').map(s => s.trim());
      if (parts.length >= 3) {
        items.push({
          houseNo: parts[0],
          houseName: parts[1] || 'বাড়ি',
          familyHead: parts[2],
          phone: parts[3] || '',
          area: parts[4] || 'পূর্ব পাড়া',
          monthlyPledge: Number(parts[5]) || 500,
          category: (parts[6] as HouseCategory) || 'General',
          address: parts[7] || ''
        });
      }
    }

    if (items.length > 0) {
      onBulkImport(items);
      setCsvText('');
      setIsBulkImportOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Main Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-700" />
            <span>বাড়ি ও দাতা তালিকা পরিচালনা (House Directory)</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            মসজিদের মহল্লাভিত্তিক নিবন্ধিত বাড়ি, দাতার নাম ও নির্ধারিত চাঁদার হিসাব
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsBulkImportOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>বাল্ক ইমপোর্ট (Excel / CSV)</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition-all shadow-md shadow-emerald-900/10"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>নতুন বাড়ি যুক্ত করুন</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative col-span-1 sm:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="বাড়ি নম্বর, দাতা বা ফোন দিয়ে খুঁজুন..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Area Filter */}
          <div>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-gray-700"
            >
              <option value="ALL">সকল মহল্লা / পাড়া</option>
              {areas.filter(a => a !== 'ALL').map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-gray-700"
            >
              <option value="ALL">সকল ক্যাটাগরি</option>
              {categories.filter(c => c !== 'ALL').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* House Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-600 border-b border-gray-200">
                <th className="p-3.5 font-bold">বাড়ি নম্বর</th>
                <th className="p-3.5 font-bold">পরিবারের প্রধান ও ভবনের নাম</th>
                <th className="p-3.5 font-bold">মহল্লা / এলাকা</th>
                <th className="p-3.5 font-bold">মোবাইল নম্বর</th>
                <th className="p-3.5 font-bold">মাসিক নির্ধারিত ফি</th>
                <th className="p-3.5 font-bold">ক্যাটাগরি</th>
                <th className="p-3.5 font-bold">স্ট্যাটাস</th>
                <th className="p-3.5 font-bold text-right">আকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredHouses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    কোনো বাড়ি পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredHouses.map(house => (
                  <tr key={house.id} className="hover:bg-emerald-50/20 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-emerald-900">
                      {house.houseNo}
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-gray-900">{house.familyHead}</div>
                      <div className="text-[11px] text-gray-500">{house.houseName}</div>
                    </td>
                    <td className="p-3.5 text-gray-700 font-medium">{house.area}</td>
                    <td className="p-3.5 font-mono text-gray-700">{toBnDigits(house.phone)}</td>
                    <td className="p-3.5 font-extrabold text-emerald-800">
                      {formatBDT(house.monthlyPledge)}
                    </td>
                    <td className="p-3.5">
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[11px] font-medium">
                        {house.category}
                      </span>
                    </td>
                    <td className="p-3.5">
                      {house.isActive ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle className="w-3 h-3" />
                          <span>সক্রিয়</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          <XCircle className="w-3 h-3" />
                          <span>নিষ্ক্রিয়</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => setViewingHouse(house)}
                          title="প্রোফাইল ও হিসাবের ইতিহাস"
                          className="p-1.5 text-emerald-800 hover:bg-emerald-100 rounded-lg transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(house)}
                          title="সম্পাদনা করুন"
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`আপনি কি নিশ্চিত যে ${house.houseNo} মুছে ফেলতে চান?`)) {
                              onDeleteHouse(house.id);
                            }
                          }}
                          title="মুছে ফেলুন"
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Add/Edit House */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900">
                {editingHouse ? 'বাড়ি সম্পাদনা করুন' : 'নতুন বাড়ি নিবন্ধন করুন'}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleSubmitHouse} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">বাড়ি নম্বর *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: ১০১/এ"
                    value={formData.houseNo}
                    onChange={(e) => setFormData({ ...formData, houseNo: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">ভবন / বাড়ির নাম</label>
                  <input
                    type="text"
                    placeholder="যেমন: বাইতুল আমান ভিলা"
                    value={formData.houseName}
                    onChange={(e) => setFormData({ ...formData, houseName: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">পরিবারের প্রধানের নাম *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: হাজী আব্দুর রশিদ"
                    value={formData.familyHead}
                    onChange={(e) => setFormData({ ...formData, familyHead: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">মোবাইল নম্বর</label>
                  <input
                    type="text"
                    placeholder="01712-000000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">মহল্লা / এলাকা</label>
                  <select
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  >
                    {areas.filter(a => a !== 'ALL').map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">মাসিক চাঁদার পরিমাণ (BDT) *</label>
                  <input
                    type="number"
                    required
                    value={formData.monthlyPledge}
                    onChange={(e) => setFormData({ ...formData, monthlyPledge: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">ক্যাটাগরি</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as HouseCategory })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="General">General (সাধারণ)</option>
                  <option value="Donation Premium">Donation Premium (বিশেষ দানশীল)</option>
                  <option value="Zakat Eligible">Zakat Eligible (মসজিদ সহায়তা)</option>
                  <option value="Business">Business (ব্যবসা প্রতিষ্ঠান / দোকান)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">বিস্তারিত ঠিকানা</label>
                <input
                  type="text"
                  placeholder="যেমন: রোড # ২, ব্লক-বি"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-md"
                >
                  {editingHouse ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Bulk Import */}
      {isBulkImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                <h3 className="text-lg font-bold text-gray-900">একসাথে একাধিক বাড়ি ইমপোর্ট (Bulk CSV)</h3>
              </div>
              <button onClick={() => setIsBulkImportOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-emerald-900 flex justify-between items-center">
                <div>
                  <p className="font-bold">নমুনা সিএসভি ফাইল ব্যবহার করুন</p>
                  <p className="text-[11px] text-emerald-700">houseNo, houseName, familyHead, phone, area, monthlyPledge</p>
                </div>
                <button
                  onClick={handleDownloadSampleCsv}
                  className="px-3 py-1.5 bg-emerald-800 text-white font-bold rounded-lg hover:bg-emerald-900 flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>নমুনা ডাউনলোড</span>
                </button>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  সিএসভি ফাইল থেকে কপি করা টেক্সট এখানে পেস্ট করুন:
                </label>
                <textarea
                  rows={6}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder="১০১/এ, মিয়া ভবন, হাজী মোঃ রফিকুল ইসলাম, 01711223344, পূর্ব পাড়া, 500"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  onClick={() => setIsBulkImportOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium"
                >
                  বাতিল
                </button>
                <button
                  onClick={handleProcessBulkCsv}
                  disabled={!csvText.trim()}
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white font-bold rounded-xl shadow-md"
                >
                  ইমপোর্ট সম্পন্ন করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Viewing Individual House Profile & Payment History */}
      {viewingHouse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                  {viewingHouse.houseNo}
                </span>
                <h3 className="text-lg font-bold text-gray-900 mt-1">{viewingHouse.familyHead}</h3>
                <p className="text-xs text-gray-500">{viewingHouse.houseName} - {viewingHouse.area}</p>
              </div>
              <button onClick={() => setViewingHouse(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div>
                  <span className="text-gray-400 block">মোবাইল:</span>
                  <span className="font-mono font-bold text-gray-800">{toBnDigits(viewingHouse.phone)}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">মাসিক ফি:</span>
                  <span className="font-bold text-emerald-800">{formatBDT(viewingHouse.monthlyPledge)}</span>
                </div>
              </div>

              <h4 className="font-bold text-gray-900 pt-2 border-t border-gray-100">মাসিক চাঁদা পরিশোধ ইতিহাস</h4>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {collections.filter(c => c.houseId === viewingHouse.id).map(col => (
                  <div key={col.id} className="p-2.5 bg-white border border-gray-200 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-bold text-gray-800 block">{formatMonthName(col.month)}</span>
                      <span className="text-[11px] text-gray-500">
                        {col.status === 'PAID' ? `রসিদ: ${col.receiptNo}` : col.status === 'PARTIAL' ? 'আংশিক জমা' : 'সম্পূর্ণ বকেয়া'}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className={`font-bold block ${col.status === 'PAID' ? 'text-emerald-700' : 'text-red-600'}`}>
                        {formatBDT(col.paidAmount)} / {formatBDT(col.targetAmount)}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {col.lastPaidDate || 'পরিশোধ হয়নি'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setViewingHouse(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-xl"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
