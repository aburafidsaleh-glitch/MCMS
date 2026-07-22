import React, { useState } from 'react';
import { ShieldCheck, Search, Filter, Calendar, Clock, User, CheckCircle2, ChevronDown, ChevronUp, History, ArrowRight, Tag } from 'lucide-react';
import { AuditLog, AuditCategory } from '../types';
import { formatDateTime, toBnDigits } from '../utils/formatters';

interface AuditLogsViewProps {
  auditLogs: AuditLog[];
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ auditLogs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const categories: { key: string; label: string; bg: string; text: string }[] = [
    { key: 'ALL', label: 'সকল অ্যাক্টিভিটি (All)', bg: 'bg-slate-100', text: 'text-slate-800' },
    { key: 'PAYMENT', label: 'চাঁদা গ্রহণ (Payment)', bg: 'bg-emerald-50', text: 'text-emerald-800' },
    { key: 'CREATE', label: 'নতুন এন্ট্রি (Create)', bg: 'bg-blue-50', text: 'text-blue-800' },
    { key: 'UPDATE', label: 'তথ্য পরিবর্তন (Update)', bg: 'bg-amber-50', text: 'text-amber-800' },
    { key: 'AMOUNT_CHANGE', label: 'চাঁদা পরিবর্তন (Amount)', bg: 'bg-purple-50', text: 'text-purple-800' },
    { key: 'DELETE', label: 'মুছে ফেলা (Delete)', bg: 'bg-rose-50', text: 'text-rose-800' },
    { key: 'ROLE_CHANGE', label: 'রোল পরিবর্তন (Role)', bg: 'bg-indigo-50', text: 'text-indigo-800' },
  ];

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch =
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.oldValue && log.oldValue.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.newValue && log.newValue.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.reason && log.reason.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'ALL' ||
      log.category === selectedCategory ||
      (selectedCategory === 'PAYMENT' && log.action === 'PAYMENT_COLLECTED') ||
      (selectedCategory === 'CREATE' && (log.action === 'HOUSE_CREATED' || log.action === 'SHEET_GENERATED' || log.action === 'BULK_IMPORTED')) ||
      (selectedCategory === 'UPDATE' && log.action === 'HOUSE_UPDATED') ||
      (selectedCategory === 'DELETE' && log.action === 'HOUSE_DELETED');

    return matchesSearch && matchesCategory;
  });

  const toggleExpand = (id: string) => {
    setExpandedLogId(prev => (prev === id ? null : id));
  };

  const getCategoryBadge = (cat?: AuditCategory, action?: string) => {
    if (cat === 'PAYMENT' || action === 'PAYMENT_COLLECTED') {
      return <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-lg text-[10px]">চাঁদা আদায়</span>;
    }
    if (cat === 'CREATE' || action === 'HOUSE_CREATED' || action === 'SHEET_GENERATED' || action === 'BULK_IMPORTED') {
      return <span className="bg-blue-100 text-blue-800 font-bold px-2.5 py-1 rounded-lg text-[10px]">নতুন এন্ট্রি</span>;
    }
    if (cat === 'AMOUNT_CHANGE' || action === 'AMOUNT_CHANGED') {
      return <span className="bg-purple-100 text-purple-800 font-bold px-2.5 py-1 rounded-lg text-[10px]">চাঁদা আপডেট</span>;
    }
    if (cat === 'UPDATE' || action === 'HOUSE_UPDATED') {
      return <span className="bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-lg text-[10px]">সংশোধন</span>;
    }
    if (cat === 'DELETE' || action === 'HOUSE_DELETED') {
      return <span className="bg-rose-100 text-rose-800 font-bold px-2.5 py-1 rounded-lg text-[10px]">মুছে ফেলা</span>;
    }
    return <span className="bg-slate-100 text-slate-800 font-bold px-2.5 py-1 rounded-lg text-[10px]">{action}</span>;
  };

  return (
    <div className="space-y-5">
      {/* Title Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-800" />
            <span>সিস্টেম অডিট ট্রেইল ও অ্যাক্টিভিটি লগ (Audit Trail)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            মসজিদ কমিটির সকল সদস্যের কার্যক্রমের পরিবর্তন ইতিহাস, পূর্বের ও বর্তমান মান সহ সম্পূর্ণ স্বচ্ছ অডিট রেকর্ড
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-bold text-emerald-900 bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-xl">
            মোট লগ: {toBnDigits(auditLogs.length)} টি
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ইউজার, অ্যাকশন, পুরাতন বা নতুন মান লিখে খুঁজুন..."
            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 px-2 py-0.5 rounded"
            >
              ক্লিয়ার
            </button>
          )}
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`min-h-[44px] px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all border ${
                selectedCategory === cat.key
                  ? 'bg-emerald-800 text-white border-emerald-800 shadow-2xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Logs List (Mobile First Cards & Desktop Responsive Table) */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="bg-white p-10 text-center rounded-2xl border border-slate-200 text-slate-500 space-y-2">
            <History className="w-10 h-10 mx-auto text-slate-300" />
            <p className="font-bold text-slate-700 text-sm">কোনো অডিট লগ রেকর্ড পাওয়া যায়নি</p>
            <p className="text-xs text-slate-400">অন্য কোনো ফিল্টার বা ফিল্ড নির্বাচন করে চেষ্টা করুন।</p>
          </div>
        ) : (
          filteredLogs.map(log => {
            const isExpanded = expandedLogId === log.id;
            const hasDiff = log.oldValue || log.newValue;

            return (
              <div
                key={log.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden transition-all hover:border-emerald-200"
              >
                {/* Main Row / Header */}
                <div
                  onClick={() => toggleExpand(log.id)}
                  className="p-4 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl shrink-0 mt-0.5">
                      <ShieldCheck className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {getCategoryBadge(log.category, log.action)}
                        <span className="font-bold text-slate-900 text-sm">{log.userName}</span>
                        <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                          {log.userRole}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 font-medium mt-1 leading-relaxed">
                        {log.details}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1.5">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {formatDateTime(log.timestamp)}
                        </span>
                        {log.reason && (
                          <span className="text-slate-500 font-sans italic truncate max-w-xs">
                            কারণ: {log.reason}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      ভেরিফাইড
                    </span>
                    <button
                      type="button"
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details / Diff Box */}
                {isExpanded && (
                  <div className="bg-slate-50 p-4 border-t border-slate-200/80 space-y-3 text-xs animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Old Value */}
                      <div className="p-3 bg-rose-50/70 border border-rose-200/80 rounded-xl space-y-1">
                        <div className="text-[10px] font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          <span>পূর্বের মান (Old Value)</span>
                        </div>
                        <p className="text-xs font-mono text-rose-950 font-medium break-words">
                          {log.oldValue || 'তথ্য পূর্বে বিদ্যমান ছিল না (N/A)'}
                        </p>
                      </div>

                      {/* New Value */}
                      <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-1">
                        <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>নতুন পরিবর্তিত মান (New Value)</span>
                        </div>
                        <p className="text-xs font-mono text-emerald-950 font-bold break-words">
                          {log.newValue || log.details}
                        </p>
                      </div>
                    </div>

                    {/* Metadata Footer */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 gap-1">
                      <span>লগ আইডি: <strong className="font-mono">{log.id}</strong></span>
                      {log.reason && <span>পরিবর্তনের কারণ: <strong className="text-slate-700">{log.reason}</strong></span>}
                      <span>ইউজার আইডি: <strong className="font-mono">{log.userId}</strong></span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
