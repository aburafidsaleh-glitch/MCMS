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
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { CollectorView } from './components/CollectorView';
import { CollectorDashboard } from './components/CollectorDashboard';
import { Dashboard } from './components/Dashboard';
import { HouseManagement } from './components/HouseManagement';
import { CollectorManagement } from './components/CollectorManagement';
import { CollectionsModule } from './components/CollectionsModule';
import { ReportsModule } from './components/ReportsModule';
import { SettingsView } from './components/SettingsView';
import { ReceiptModal } from './components/ReceiptModal';
import { AISummaryModal } from './components/AISummaryModal';
import { ToastContainer, ToastMessage } from './components/Toast';

export default function App() {
  const [profile, setProfile] = useState<MosqueProfile>(INITIAL_MOSQUE_PROFILE);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // Admin by default
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentMonth, setCurrentMonth] = useState<string>('2026-07'); // July 2026

  const [houses, setHouses] = useState<House[]>(INITIAL_HOUSES);
  const [collections, setCollections] = useState<CollectionRecord[]>(INITIAL_COLLECTION_RECORDS);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(INITIAL_TRANSACTIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  // UI state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals
  const [activeReceipt, setActiveReceipt] = useState<any | null>(null);
  const [isAiSummaryOpen, setIsAiSummaryOpen] = useState(false);

  // Toast Helper
  const triggerToast = (title: string, message?: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `TOAST-${Date.now()}-${Math.random().toString().slice(-3)}`;
    setToasts(prev => [...prev, { id, title, message, type }]);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

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
        fetchCollections(payload.month);
        fetchTransactions();
        fetchAuditLogs();
        triggerToast('চাঁদা আদায় সফল হয়েছে!', `৳${payload.amount} জমা নেওয়া হয়েছে।`, 'success');
      } else {
        applyLocalPayment(payload);
      }
    } catch (err) {
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
    triggerToast('চাঁদা আদায় জমা হয়েছে!', `৳${amount} (${paymentMethod}) রসিদ নং: ${receiptNo}`, 'success');
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
        triggerToast('নতুন বাড়ি নিবন্ধিত হয়েছে!', `${houseData.houseNo} - ${houseData.familyHead}`, 'success');
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
        triggerToast('বাড়ি আপডেট সফল হয়েছে!', `${houseData.houseNo}`, 'info');
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
        triggerToast('বাড়ি মুছে ফেলা হয়েছে!', '', 'info');
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
        const data = await res.json();
        fetchHouses();
        fetchCollections(currentMonth);
        triggerToast('বাল্ক ইমপোর্ট সফল হয়েছে!', `একসাথে ${data.addedCount || items.length} টি বাড়ি ডাটাবেসে নিবন্ধিত হয়েছে।`, 'success');
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
        triggerToast(`${nextMonth} মাসের রেজিস্টার তৈরি হয়েছে!`, 'সকল সক্রিয় বাড়ির চাঁদার হিসেব সংযুক্ত করা হয়েছে।', 'success');
      }
    } catch (e) {
      console.warn('Generate month sheet fallback', e);
    }
  };

  const handleUpdateMosqueProfile = async (updated: MosqueProfile) => {
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (e) {
      setProfile(updated);
    }
  };

  const handleQuickAction = (action: 'COLLECT' | 'ADD_HOUSE' | 'GENERATE_SHEET') => {
    if (action === 'COLLECT') {
      setActiveTab('collector');
    } else if (action === 'ADD_HOUSE') {
      setActiveTab('houses');
    } else if (action === 'GENERATE_SHEET') {
      handleGenerateNextMonth();
    }
  };

  // Due counts for current month
  const currentCollections = collections.filter(c => c.month === currentMonth);
  const dueCount = currentCollections.filter(c => c.status === 'DUE' || c.status === 'PARTIAL').length;

  const isCollectorRole = currentUser.role === 'COLLECTOR';

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        mosque={profile}
        currentUser={currentUser}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        dueCount={dueCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Bar */}
        <Header
          mosque={profile}
          currentUser={currentUser}
          onUserChange={(u) => {
            setCurrentUser(u);
            setActiveTab('dashboard'); // Reset to default dashboard on user role change
            triggerToast(`ইউজার পরিবর্তিত হয়েছে: ${u.name}`, `রোল: ${u.role}`, 'info');
          }}
          currentMonth={currentMonth}
          onMonthChange={(m) => {
            setCurrentMonth(m);
            fetchCollections(m);
          }}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onQuickAction={handleQuickAction}
          onSearchQuery={setGlobalSearchQuery}
          auditLogs={auditLogs}
        />

        {/* View Router */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {activeTab === 'dashboard' && (
            isCollectorRole ? (
              <CollectorDashboard
                currentUser={currentUser}
                houses={houses}
                collections={collections}
                transactions={transactions}
                currentMonth={currentMonth}
                onNavigateTab={setActiveTab}
                onViewReceipt={(rec) => setActiveReceipt(rec)}
              />
            ) : (
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
            )
          )}

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

          {activeTab === 'houses' && !isCollectorRole && (
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

          {activeTab === 'collectors' && !isCollectorRole && (
            <CollectorManagement
              collections={collections}
              houses={houses}
              currentMonth={currentMonth}
            />
          )}

          {(activeTab === 'collections' || activeTab === 'sheet' || activeTab === 'due') && !isCollectorRole && (
            <CollectionsModule
              houses={houses}
              collections={collections}
              transactions={transactions}
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
                triggerToast(`${m} রেজিস্টার আপডেট হয়েছে!`, '', 'success');
              }}
              onCollectPayment={handleCollectPayment}
              onViewReceipt={(rec) => setActiveReceipt(rec)}
              defaultSubTab={activeTab === 'due' ? 'pending' : 'monthly'}
            />
          )}

          {activeTab === 'history' && (
            <CollectionsModule
              houses={houses}
              collections={collections}
              transactions={transactions}
              currentMonth={currentMonth}
              currentUser={currentUser}
              onMonthChange={(m) => {
                setCurrentMonth(m);
                fetchCollections(m);
              }}
              onGenerateSheet={async (m) => {}}
              onCollectPayment={handleCollectPayment}
              onViewReceipt={(rec) => setActiveReceipt(rec)}
              defaultSubTab="history"
            />
          )}

          {(activeTab === 'reports' || activeTab === 'analytics' || activeTab === 'audit') && !isCollectorRole && (
            <ReportsModule
              houses={houses}
              collections={collections}
              transactions={transactions}
              auditLogs={auditLogs}
              currentMonth={currentMonth}
              onViewReceipt={(rec) => setActiveReceipt(rec)}
              defaultSubTab={activeTab === 'analytics' ? 'analytics' : activeTab === 'audit' ? 'audit' : 'reports'}
            />
          )}

          {activeTab === 'settings' && !isCollectorRole && (
            <SettingsView
              mosque={profile}
              currentUser={currentUser}
              onUpdateProfile={handleUpdateMosqueProfile}
              onTriggerToast={triggerToast}
            />
          )}

          {activeTab === 'profile' && (
            <SettingsView
              mosque={profile}
              currentUser={currentUser}
              onUpdateProfile={handleUpdateMosqueProfile}
              onTriggerToast={triggerToast}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 py-4 px-6 text-xs text-slate-500 mt-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>© {new Date().getFullYear()} {profile.name} — MCMS Digital (মসজিদ চাঁদা ও কালেকশন সফটওয়্যার)</p>
            <p className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              ডিজিটাল বাংলাদেশ উদ্যোগ | সংস্করণ ২.৫ (Phase 2 Simplified)
            </p>
          </div>
        </footer>
      </div>

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

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
