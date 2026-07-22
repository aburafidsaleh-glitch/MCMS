import React, { useState, useEffect } from 'react';
import {
  INITIAL_MOSQUE_PROFILE,
  INITIAL_USERS,
  INITIAL_HOUSES,
  INITIAL_COLLECTION_RECORDS,
  INITIAL_TRANSACTIONS,
  INITIAL_AUDIT_LOGS
} from './data/mockData';
import { House, CollectionRecord, PaymentTransaction, AuditLog, MosqueProfile, User, PaymentMethod } from './types';
import { Navbar } from './components/Navbar';
import { CollectorView } from './components/CollectorView';
import { Dashboard } from './components/Dashboard';
import { HouseManagement } from './components/HouseManagement';
import { MonthlyCollection } from './components/MonthlyCollection';
import { DueList } from './components/DueList';
import { ReportsView } from './components/ReportsView';
import { ReceiptModal } from './components/ReceiptModal';
import { AISummaryModal } from './components/AISummaryModal';

export default function App() {
  const [profile, setProfile] = useState<MosqueProfile>(INITIAL_MOSQUE_PROFILE);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // Admin
  const [activeTab, setActiveTab] = useState<string>('collector'); // Default Collector mode for instant quick collection!
  const [currentMonth, setCurrentMonth] = useState<string>('2026-07'); // July 2026

  const [houses, setHouses] = useState<House[]>(INITIAL_HOUSES);
  const [collections, setCollections] = useState<CollectionRecord[]>(INITIAL_COLLECTION_RECORDS);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(INITIAL_TRANSACTIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  // Modals State
  const [activeReceipt, setActiveReceipt] = useState<any | null>(null);
  const [isAiSummaryOpen, setIsAiSummaryOpen] = useState(false);

  // Fetch initial data from server API
  useEffect(() => {
    fetchProfile();
    fetchHouses();
    fetchCollections(currentMonth);
    fetchTransactions();
    fetchAuditLogs();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (e) {
      console.warn('API fetch profile fallback', e);
    }
  };

  const fetchHouses = async () => {
    try {
      const res = await fetch('/api/houses');
      if (res.ok) {
        const data = await res.json();
        setHouses(data);
      }
    } catch (e) {
      console.warn('API fetch houses fallback', e);
    }
  };

  const fetchCollections = async (m: string) => {
    try {
      const res = await fetch(`/api/collections?month=${m}`);
      if (res.ok) {
        const data = await res.json();
        // Merge with existing state for other months
        setCollections(prev => {
          const filteredOtherMonths = prev.filter(c => c.month !== m);
          return [...filteredOtherMonths, ...data];
        });
      }
    } catch (e) {
      console.warn('API fetch collections fallback', e);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/transactions');
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (e) {
      console.warn('API fetch transactions fallback', e);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/audit-logs');
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data);
      }
    } catch (e) {
      console.warn('API fetch audit logs fallback', e);
    }
  };

  // Handlers
  const handleCollectPayment = async (payload: {
    houseId: string;
    month: string;
    amount: number;
    paymentMethod: PaymentMethod;
    collectorName: string;
    collectorId: string;
    note?: string;
  }) => {
    try {
      const res = await fetch('/api/collections/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        // Refresh
        fetchCollections(payload.month);
        fetchTransactions();
        fetchAuditLogs();
      } else {
        // Local optimistic fallback
        applyLocalPayment(payload);
      }
    } catch (err) {
      console.warn('Payment API offline, applying local state update:', err);
      applyLocalPayment(payload);
    }
  };

  const applyLocalPayment = (payload: any) => {
    const { houseId, month, amount, paymentMethod, collectorName, note } = payload;
    const house = houses.find(h => h.id === houseId);
    if (!house) return;

    const receiptNo = `REC-${month.replace('-', '')}-${Math.floor(100 + Math.random() * 900)}`;

    setCollections(prev => {
      let found = false;
      const updated = prev.map(c => {
        if (c.houseId === houseId && c.month === month) {
          found = true;
          const newPaid = c.paidAmount + amount;
          const newDue = Math.max(0, c.targetAmount - newPaid);
          const newStatus = newPaid >= c.targetAmount ? 'PAID' : newPaid > 0 ? 'PARTIAL' : 'DUE';
          return {
            ...c,
            paidAmount: newPaid,
            dueAmount: newDue,
            status: newStatus as any,
            lastPaidDate: new Date().toISOString().split('T')[0],
            receiptNo,
            collectedBy: collectorName,
            paymentMethod,
            collectorNote: note
          };
        }
        return c;
      });

      if (!found) {
        const newPaid = amount;
        const target = house.monthlyPledge;
        const newDue = Math.max(0, target - newPaid);
        const newStatus = newPaid >= target ? 'PAID' : newPaid > 0 ? 'PARTIAL' : 'DUE';

        updated.push({
          id: `COL-${month.replace('-', '')}-${houseId}`,
          houseId,
          month,
          targetAmount: target,
          paidAmount: newPaid,
          dueAmount: newDue,
          status: newStatus as any,
          lastPaidDate: new Date().toISOString().split('T')[0],
          receiptNo,
          collectedBy: collectorName,
          paymentMethod,
          collectorNote: note
        });
      }

      return updated;
    });

    // Add transaction
    const newTrx: PaymentTransaction = {
      id: `TRX-${Date.now().toString().slice(-6)}`,
      receiptNo,
      houseId,
      houseNo: house.houseNo,
      houseName: house.houseName,
      familyHead: house.familyHead,
      area: house.area,
      month,
      amount,
      paymentMethod,
      collectedBy: collectorName,
      collectedById: currentUser.id,
      timestamp: new Date().toISOString(),
      notes: note
    };

    setTransactions(prev => [newTrx, ...prev]);
  };

  const handleAddHouse = async (houseData: Partial<House>) => {
    try {
      const res = await fetch('/api/houses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...houseData, currentMonth, userId: currentUser.id, userName: currentUser.name })
      });
      if (res.ok) {
        fetchHouses();
        fetchCollections(currentMonth);
      }
    } catch (e) {
      console.warn('Add house offline fallback', e);
    }
  };

  const handleUpdateHouse = async (id: string, houseData: Partial<House>) => {
    try {
      const res = await fetch(`/api/houses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...houseData, userId: currentUser.id, userName: currentUser.name })
      });
      if (res.ok) {
        fetchHouses();
      }
    } catch (e) {
      console.warn('Update house fallback', e);
    }
  };

  const handleDeleteHouse = async (id: string) => {
    try {
      const res = await fetch(`/api/houses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchHouses();
      }
    } catch (e) {
      console.warn('Delete house fallback', e);
    }
  };

  const handleBulkImport = async (items: Partial<House>[]) => {
    try {
      const res = await fetch('/api/houses/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, currentMonth, userId: currentUser.id, userName: currentUser.name })
      });
      if (res.ok) {
        fetchHouses();
        fetchCollections(currentMonth);
      }
    } catch (e) {
      console.warn('Bulk import fallback', e);
    }
  };

  const handleGenerateNextMonth = async () => {
    const nextMonth = '2026-08';
    try {
      const res = await fetch('/api/collections/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: nextMonth, userId: currentUser.id, userName: currentUser.name })
      });
      if (res.ok) {
        setCurrentMonth(nextMonth);
        fetchCollections(nextMonth);
        alert(`${nextMonth} মাসের জন্য সফলভাবে নতুন চাঁদার রেজিস্টার তৈরি করা হয়েছে!`);
      }
    } catch (e) {
      console.warn('Generate month sheet fallback', e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Navbar */}
      <Navbar
        mosque={profile}
        currentUser={currentUser}
        onUserChange={setCurrentUser}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentMonth={currentMonth}
        onMonthChange={(m) => {
          setCurrentMonth(m);
          fetchCollections(m);
        }}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'collector' && (
          <CollectorView
            houses={houses}
            collections={collections}
            currentMonth={currentMonth}
            currentUser={currentUser}
            onCollectPayment={handleCollectPayment}
            onViewReceipt={(rec) => setActiveReceipt(rec)}
          />
        )}

        {activeTab === 'dashboard' && (
          <Dashboard
            mosque={profile}
            houses={houses}
            collections={collections}
            transactions={transactions}
            currentMonth={currentMonth}
            onGenerateNextMonth={handleGenerateNextMonth}
            onOpenAiSummary={() => setIsAiSummaryOpen(true)}
            onNavigateTab={setActiveTab}
            onViewReceipt={(rec) => setActiveReceipt(rec)}
          />
        )}

        {activeTab === 'houses' && (
          <HouseManagement
            houses={houses}
            collections={collections}
            currentUser={currentUser}
            currentMonth={currentMonth}
            onAddHouse={handleAddHouse}
            onUpdateHouse={handleUpdateHouse}
            onDeleteHouse={handleDeleteHouse}
            onBulkImport={handleBulkImport}
          />
        )}

        {activeTab === 'sheet' && (
          <MonthlyCollection
            houses={houses}
            collections={collections}
            currentMonth={currentMonth}
            currentUser={currentUser}
            onMonthChange={(m) => {
              setCurrentMonth(m);
              fetchCollections(m);
            }}
            onGenerateSheet={async (m) => {
              await fetch('/api/collections/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ month: m })
              });
              fetchCollections(m);
            }}
            onCollectPayment={handleCollectPayment}
            onViewReceipt={(rec) => setActiveReceipt(rec)}
          />
        )}

        {activeTab === 'due' && (
          <DueList
            houses={houses}
            collections={collections}
            currentUser={currentUser}
            onCollectPayment={handleCollectPayment}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            transactions={transactions}
            auditLogs={auditLogs}
            onViewReceipt={(rec) => setActiveReceipt(rec)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 text-center text-xs text-gray-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} {profile.name} (MCMS) - মসজিদ কালেকশন ব্যবস্থাপনা সিস্টেম</p>
          <p className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            ডিজিটাল মসজিদ ও সমাজ উন্নয়ন উদ্যোগ - বাংলাদেশ
          </p>
        </div>
      </footer>

      {/* Global Modals */}
      <ReceiptModal
        isOpen={!!activeReceipt}
        onClose={() => setActiveReceipt(null)}
        mosque={profile}
        receiptData={activeReceipt}
      />

      <AISummaryModal
        isOpen={isAiSummaryOpen}
        onClose={() => setIsAiSummaryOpen(false)}
        mosque={profile}
        month={currentMonth}
      />
    </div>
  );
}
