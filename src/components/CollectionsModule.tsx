import React, { useState } from 'react';
import { FileSpreadsheet, History, AlertTriangle } from 'lucide-react';
import { House, CollectionRecord, PaymentTransaction, User } from '../types';
import { MonthlyCollection } from './MonthlyCollection';
import { CollectionHistory } from './CollectionHistory';
import { DueList } from './DueList';

interface CollectionsModuleProps {
  houses: House[];
  collections: CollectionRecord[];
  transactions: PaymentTransaction[];
  currentMonth: string;
  currentUser: User;
  onMonthChange: (m: string) => void;
  onGenerateSheet: (m: string) => Promise<void>;
  onCollectPayment: (payload: any) => void;
  onViewReceipt: (rec: any) => void;
  defaultSubTab?: 'monthly' | 'history' | 'pending';
}

export const CollectionsModule: React.FC<CollectionsModuleProps> = ({
  houses,
  collections,
  transactions,
  currentMonth,
  currentUser,
  onMonthChange,
  onGenerateSheet,
  onCollectPayment,
  onViewReceipt,
  defaultSubTab = 'monthly'
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'monthly' | 'history' | 'pending'>(defaultSubTab);

  const currentCollections = collections.filter(c => c.month === currentMonth);
  const dueCount = currentCollections.filter(c => c.status === 'DUE' || c.status === 'PARTIAL').length;

  return (
    <div className="space-y-6">
      {/* Module Top Navigation Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('monthly')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 ${
              activeSubTab === 'monthly'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-300" />
            <span>মাসিক রেজিস্টার (Monthly)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('history')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 ${
              activeSubTab === 'history'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <History className="w-4 h-4 text-amber-300" />
            <span>আদায়ের ইতিহাস (History)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('pending')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 ${
              activeSubTab === 'pending'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-300" />
            <span>বকেয়া তালিকা (Pending)</span>
            {dueCount > 0 && (
              <span className="bg-red-500 text-white font-extrabold text-[10px] px-2 py-0.2 rounded-full">
                {dueCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Sub Tab View Rendering */}
      {activeSubTab === 'monthly' && (
        <MonthlyCollection
          houses={houses}
          collections={collections}
          currentMonth={currentMonth}
          currentUser={currentUser}
          onMonthChange={onMonthChange}
          onGenerateSheet={onGenerateSheet}
          onCollectPayment={onCollectPayment}
          onViewReceipt={onViewReceipt}
        />
      )}

      {activeSubTab === 'history' && (
        <CollectionHistory
          transactions={transactions}
          currentMonth={currentMonth}
          onViewReceipt={onViewReceipt}
        />
      )}

      {activeSubTab === 'pending' && (
        <DueList
          houses={houses}
          collections={collections}
          currentUser={currentUser}
          onCollectPayment={onCollectPayment}
        />
      )}
    </div>
  );
};
