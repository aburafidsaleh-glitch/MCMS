import React, { useState } from 'react';
import {
  Building2,
  Plus,
  FileSpreadsheet,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Download,
  FileText,
  MapPin,
  Phone,
  ChevronRight
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
  const [selectedHouseIds, setSelectedHouseIds] = useState<string[]>([]);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [editingHouse, setEditingHouse] = useState<House | null>(null);
  const [viewingHouse, setViewingHouse] = useState<House | null>(null);

  // Form State
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

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedHouseIds(filteredHouses.map(h => h.id));
    } else {
      setSelectedHouseIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedHouseIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedHouseIds.length === 0) return;
    if (confirm(`আপনি কি নিশ্চিত যে নির্বাচন করা ${selectedHouseIds.length} টি বাড়ি তালিকা থেকে মুছে ফেলতে চান? (সফট ডিলিট সংক্রান্ত অডিট ট্রেইল সংরক্ষিত থাকবে)`)) {
      selectedHouseIds.forEach(id => onDeleteHouse(id));
      setSelectedHouseIds([]);
    }
  };

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
    <div className="space-y-5">
      {/* Header & Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-emerald-800" />
            <span>বাড়ি ও দাতা নির্দেশিকা (House Directory)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            নিবন্ধিত বাড়ি: <strong className="text-slate-800 font-mono">{toBnDigits(houses.length)} টি</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedHouseIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="min-h-[48px] px-3.5 py-2.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all"
            >
              <Trash2 className="w-4 h-4 text-red-600 inline mr-1" />
              <span>নির্বাচিত ({selectedHouseIds.length}) টি মুছুন</span>
            </button>
          )}

          <button
            onClick={() => setIsBulkImportOpen(true)}
            className="min-h-[48px] px-3.5 py-2.5 text-xs font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700 inline mr-1" />
            <span>ইমপোর্ট (Excel/CSV)</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="min-h-[48px] px-4 py-2.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition-all shadow-md shadow-emerald-900/10 flex items-center gap-1.5"
          >
            <Plus className="w-4.5 h-4.5 text-amber-300" />
            <span>নতুন বাড়ি নিবন্ধিত করুন</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="বাড়ি নং, দাতা বা ফোন দিয়ে খুঁজুন..."
              className="w-full min-h-[48px] pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
            />
          </div>

          {/* Area Filter */}
          <div>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full min-h-[48px] px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 font-semibold text-slate-700"
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
              className="w-full min-h-[48px] px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 font-semibold text-slate-700"
            >
              <option value="ALL">সকল ক্যাটাগরি</option>
              {categories.filter(c => c !== 'ALL').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Mobile-First Responsive Cards List (Visible on Mobile) */}
      <div className="block md:hidden space-y-3">
        {filteredHouses.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 text-slate-500">
            কোনো বাড়ি পাওয়া যায়নি।
          </div>
        ) : (
          filteredHouses.map(house => {
            const isSelected = selectedHouseIds.includes(house.id);
            return (
              <div
                key={house.id}
                className={`bg-white rounded-2xl p-4 border transition-all ${
                  isSelected ? 'border-emerald-600 bg-emerald-50/20' : 'border-slate-200/80 shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectOne(house.id)}
                      className="w-5 h-5 rounded text-emerald-800 focus:ring-emerald-600"
                    />
                    <span className="bg-emerald-950 text-amber-300 font-mono font-bold text-xs px-2.5 py-1 rounded-lg">
                      {house.houseNo}
                    </span>
                    <span className="text-[11px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-md">
                      {house.area}
                    </span>
                  </div>

                  <span className="font-extrabold text-sm text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    {formatBDT(house.monthlyPledge)}
                  </span>
                </div>

                <div className="mt-2 space-y-1">
                  <h3 className="font-extrabold text-slate-900 text-sm">{house.familyHead}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{house.houseName} ({house.category})</span>
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-mono">{toBnDigits(house.phone)}</span>
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setViewingHouse(house)}
                    className="min-h-[48px] flex-1 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold rounded-xl flex items-center justify-center gap-1"
                  >
                    <FileText className="w-4 h-4" />
                    <span>ইতিহাস দেখুন</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(house)}
                    className="min-h-[48px] px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1"
                  >
                    <Edit className="w-4 h-4" />
                    <span>সম্পাদনা</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`আপনি কি নিশ্চিত যে ${house.houseNo} সফট ডিলিট করতে চান?`)) {
                        onDeleteHouse(house.id);
                      }
                    }}
                    className="min-h-[48px] px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Table View (Visible on MD+) */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <th className="p-3.5 w-10">
                  <input
                    type="checkbox"
                    checked={filteredHouses.length > 0 && selectedHouseIds.length === filteredHouses.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded text-emerald-800 focus:ring-emerald-600"
                  />
                </th>
                <th className="p-3.5 font-bold">বাড়ি নম্বর</th>
                <th className="p-3.5 font-bold">পরিবারের প্রধান ও ভবনের নাম</th>
                <th className="p-3.5 font-bold">মহল্লা / এলাকা</th>
                <th className="p-3.5 font-bold">মোবাইল নম্বর</th>
                <th className="p-3.5 font-bold">মাসিক নির্ধারিত ফি</th>
                <th className="p-3.5 font-bold">ক্যাটাগরি</th>
                <th className="p-3.5 font-bold">স্ট্যাটাস</th>
                <th className="p-3.5 font-bold text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHouses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    কোনো বাড়ি পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredHouses.map(house => {
                  const isSelected = selectedHouseIds.includes(house.id);

                  return (
                    <tr key={house.id} className={`hover:bg-emerald-50/20 transition-colors ${isSelected ? 'bg-emerald-50/40' : ''}`}>
                      <td className="p-3.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(house.id)}
                          className="w-4 h-4 rounded text-emerald-800 focus:ring-emerald-600"
                        />
                      </td>
                      <td className="p-3.5 font-mono font-bold text-emerald-900">
                        {house.houseNo}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{house.familyHead}</div>
                        <div className="text-[11px] text-slate-500">{house.houseName}</div>
                      </td>
                      <td className="p-3.5 text-slate-700 font-medium">{house.area}</td>
                      <td className="p-3.5 font-mono text-slate-700">{toBnDigits(house.phone)}</td>
                      <td className="p-3.5 font-extrabold text-emerald-800">
                        {formatBDT(house.monthlyPledge)}
                      </td>
                      <td className="p-3.5">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
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
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
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
                            className="p-2 text-emerald-800 hover:bg-emerald-100 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(house)}
                            title="সম্পাদনা করুন"
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`আপনি কি নিশ্চিত যে ${house.houseNo} মুছে ফেলতে চান? (অডিট ট্রেইলে সংরক্ষিত থাকবে)`)) {
                                onDeleteHouse(house.id);
                              }
                            }}
                            title="মুছে ফেলুন"
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Add/Edit House */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {editingHouse ? 'বাড়ি সম্পাদনা করুন' : 'নতুন বাড়ি নিবন্ধন করুন'}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">✕</button>
            </div>

            <form onSubmit={handleSubmitHouse} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">বাড়ি নম্বর *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: ১০১/এ"
                    value={formData.houseNo}
                    onChange={(e) => setFormData({ ...formData, houseNo: e.target.value })}
                    className="w-full min-h-[48px] px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ভবন / বাড়ির নাম</label>
                  <input
                    type="text"
                    placeholder="যেমন: বাইতুল আমান ভিলা"
                    value={formData.houseName}
                    onChange={(e) => setFormData({ ...formData, houseName: e.target.value })}
                    className="w-full min-h-[48px] px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">পরিবারের প্রধানের নাম *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: হাজী আব্দুর রশিদ"
                    value={formData.familyHead}
                    onChange={(e) => setFormData({ ...formData, familyHead: e.target.value })}
                    className="w-full min-h-[48px] px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">মোবাইল নম্বর</label>
                  <input
                    type="text"
                    placeholder="01712-000000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full min-h-[48px] px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">মহল্লা / এলাকা</label>
                  <select
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="w-full min-h-[48px] px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-semibold text-slate-800"
                  >
                    {areas.filter(a => a !== 'ALL').map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">মাসিক চাঁদার পরিমাণ (BDT) *</label>
                  <input
                    type="number"
                    required
                    value={formData.monthlyPledge}
                    onChange={(e) => setFormData({ ...formData, monthlyPledge: Number(e.target.value) })}
                    className="w-full min-h-[48px] px-3.5 py-2.5 bg-emerald-50/60 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-bold text-emerald-950 text-base"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ক্যাটাগরি</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as HouseCategory })}
                  className="w-full min-h-[48px] px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-semibold"
                >
                  <option value="General">General (সাধারণ)</option>
                  <option value="Donation Premium">Donation Premium (বিশেষ দানশীল)</option>
                  <option value="Zakat Eligible">Zakat Eligible (মসজিদ সহায়তা)</option>
                  <option value="Business">Business (ব্যবসা প্রতিষ্ঠান / দোকান)</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="min-h-[48px] px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="min-h-[48px] px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-md"
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                <h3 className="text-lg font-bold text-slate-900">একসাথে একাধিক বাড়ি ইমপোর্ট (Bulk CSV)</h3>
              </div>
              <button onClick={() => setIsBulkImportOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-emerald-900 flex justify-between items-center">
                <div>
                  <p className="font-bold">নমুনা সিএসভি ফাইল ব্যবহার করুন</p>
                  <p className="text-[11px] text-emerald-700">houseNo, houseName, familyHead, phone, area, monthlyPledge</p>
                </div>
                <button
                  onClick={handleDownloadSampleCsv}
                  className="min-h-[44px] px-3.5 py-2 bg-emerald-800 text-white font-bold rounded-xl hover:bg-emerald-900 flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>নমুনা ডাউনলোড</span>
                </button>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  সিএসভি ফাইল থেকে কপি করা টেক্সট এখানে পেস্ট করুন:
                </label>
                <textarea
                  rows={6}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder="১০১/এ, মিয়া ভবন, হাজী মোঃ রফিকুল ইসলাম, 01711223344, পূর্ব পাড়া, 500"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  onClick={() => setIsBulkImportOpen(false)}
                  className="min-h-[48px] px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium"
                >
                  বাতিল
                </button>
                <button
                  onClick={handleProcessBulkCsv}
                  disabled={!csvText.trim()}
                  className="min-h-[48px] px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white font-bold rounded-xl shadow-md"
                >
                  ইমপোর্ট সম্পন্ন করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Viewing Individual House Profile */}
      {viewingHouse && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                  {viewingHouse.houseNo}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{viewingHouse.familyHead}</h3>
                <p className="text-xs text-slate-500">{viewingHouse.houseName} - {viewingHouse.area}</p>
              </div>
              <button onClick={() => setViewingHouse(null)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block">মোবাইল:</span>
                  <span className="font-mono font-bold text-slate-800">{toBnDigits(viewingHouse.phone)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">মাসিক ফি:</span>
                  <span className="font-bold text-emerald-800">{formatBDT(viewingHouse.monthlyPledge)}</span>
                </div>
              </div>

              <h4 className="font-bold text-slate-900 pt-2 border-t border-slate-100">মাসিক চাঁদা পরিশোধ ইতিহাস</h4>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {collections.filter(c => c.houseId === viewingHouse.id).map(col => (
                  <div key={col.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 block">{formatMonthName(col.month)}</span>
                      <span className="text-[11px] text-slate-500">
                        {col.status === 'PAID' ? `রসিদ: ${col.receiptNo}` : col.status === 'PARTIAL' ? 'আংশিক জমা' : 'সম্পূর্ণ বকেয়া'}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className={`font-bold block ${col.status === 'PAID' ? 'text-emerald-700' : 'text-red-600'}`}>
                        {formatBDT(col.paidAmount)} / {formatBDT(col.targetAmount)}
                      </span>
                        <span className="text-[10px] text-slate-400">
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
                className="min-h-[48px] w-full sm:w-auto px-6 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl"
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
