import React, { useState } from 'react';
import { ShieldCheck, Search, Filter, Calendar, Clock, User, CheckCircle2 } from 'lucide-react';
import { AuditLog } from '../types';
import { formatDateTime, toBnDigits } from '../utils/formatters';

interface AuditLogsViewProps {
  auditLogs: AuditLog[];
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ auditLogs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const actionTypes = [
    'ALL',
    'PAYMENT_COLLECTED',
    'HOUSE_CREATED',
    'HOUSE_UPDATED',
    'SHEET_GENERATED',
    'BULK_IMPORTED'
  ];

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch =
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-800" />
            <span>সিস্টেম অডিট ট্রেইল ও অ্যাক্টিভিটি লগ (Audit Trail)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            সফটওয়্যারে সকল অ্যাডমিন, কোষাধ্যক্ষ ও সংগ্রাহকদের কার্যক্রমের স্বয়ংক্রিয় ডিজিটাল রেকর্ড
          </p>
        </div>

        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
          মোট সিস্টেম লগ: {toBnDigits(auditLogs.length)} টি
        </span>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ইউজার নাম, অ্যাকশন বা বিবরণ দিয়ে খুঁজুন..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
            />
          </div>

          <div>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="ALL">সকল অ্যাকশন টাইপ (All Actions)</option>
              {actionTypes.filter(a => a !== 'ALL').map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <th className="p-3.5 font-bold">তারিখ ও সময়</th>
                <th className="p-3.5 font-bold">ইউজার ও রোল</th>
                <th className="p-3.5 font-bold">অ্যাকশন টাইপ</th>
                <th className="p-3.5 font-bold">বিস্তারিত কার্যক্রম বিবরণ</th>
                <th className="p-3.5 font-bold text-right">স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    কোনো অডিট লগ রেকর্ড পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-mono text-slate-600 text-[11px] whitespace-nowrap">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{log.userName}</div>
                      <div className="text-[10px] text-emerald-800 font-semibold">{log.userRole}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="bg-slate-100 text-slate-800 font-mono font-bold px-2 py-0.5 rounded text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-700 font-medium leading-relaxed">
                      {log.details}
                    </td>
                    <td className="p-3.5 text-right">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>ভেরিফাইড</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
