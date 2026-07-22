import React, { useState } from 'react';
import { FileText, BarChart3, ShieldCheck } from 'lucide-react';
import { House, CollectionRecord, PaymentTransaction, AuditLog } from '../types';
import { ReportsView } from './ReportsView';
import { AnalyticsView } from './AnalyticsView';
import { AuditLogsView } from './AuditLogsView';

interface ReportsModuleProps {
  houses: House[];
  collections: CollectionRecord[];
  transactions: PaymentTransaction[];
  auditLogs: AuditLog[];
  currentMonth: string;
  onViewReceipt: (rec: any) => void;
  defaultSubTab?: 'reports' | 'analytics' | 'audit';
}

export const ReportsModule: React.FC<ReportsModuleProps> = ({
  houses,
  collections,
  transactions,
  auditLogs,
  currentMonth,
  onViewReceipt,
  defaultSubTab = 'reports'
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'reports' | 'analytics' | 'audit'>(defaultSubTab);

  return (
    <div className="space-y-6">
      {/* Module Navigation Tabs */}
      <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('reports')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 ${
              activeSubTab === 'reports'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-300" />
            <span>আর্থিক রিপোর্ট ও এক্সপোর্ট</span>
          </button>

          <button
            onClick={() => setActiveSubTab('analytics')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 ${
              activeSubTab === 'analytics'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-amber-300" />
            <span>অ্যাডভান্সড অ্যানালিটিক্স</span>
          </button>

          <button
            onClick={() => setActiveSubTab('audit')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 ${
              activeSubTab === 'audit'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <span>অডিট লগ (Audit Trail)</span>
          </button>
        </div>
      </div>

      {/* View Rendering */}
      {activeSubTab === 'reports' && (
        <ReportsView
          transactions={transactions}
          auditLogs={auditLogs}
          onViewReceipt={onViewReceipt}
        />
      )}

      {activeSubTab === 'analytics' && (
        <AnalyticsView
          houses={houses}
          collections={collections}
          transactions={transactions}
          currentMonth={currentMonth}
        />
      )}

      {activeSubTab === 'audit' && (
        <AuditLogsView auditLogs={auditLogs} />
      )}
    </div>
  );
};
