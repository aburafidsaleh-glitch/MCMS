export type UserRole = 'ADMIN' | 'TREASURER' | 'COLLECTOR';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  assignedArea?: string; // e.g., 'পূর্ব পাড়া' or 'All'
}

export type PaymentMethod = 'CASH' | 'BKASH' | 'NAGAD' | 'BANK';

export type PaymentStatus = 'PAID' | 'PARTIAL' | 'DUE';

export type HouseCategory = 'General' | 'Donation Premium' | 'Zakat Eligible' | 'Business';

export interface House {
  id: string;               // e.g. 'H-101'
  houseNo: string;          // e.g. '১০১/এ'
  houseName: string;        // e.g. 'বাইতুল আমান ভিলা'
  familyHead: string;       // e.g. 'হাজী আব্দুর রশিদ'
  phone: string;            // e.g. '01712-345678'
  area: string;             // e.g. 'পূর্ব পাড়া'
  monthlyPledge: number;    // e.g. 500
  category: HouseCategory;  // e.g. 'General'
  address: string;          // e.g. 'রোড-৪, ব্লক-বি'
  isActive: boolean;
  isDeleted?: boolean;      // Soft delete flag
  notes?: string;
  createdAt: string;
}

export interface CollectionRecord {
  id: string;               // e.g. 'COL-202607-H101'
  houseId: string;
  month: string;            // e.g. '2026-07' (YYYY-MM)
  targetAmount: number;     // e.g. 500
  paidAmount: number;       // e.g. 500
  dueAmount: number;        // e.g. 0
  status: PaymentStatus;
  lastPaidDate: string | null;
  receiptNo: string | null; // e.g. 'REC-202607-001'
  collectedBy: string | null;
  paymentMethod: PaymentMethod | null;
  collectorNote?: string;
}

export interface PaymentTransaction {
  id: string;               // e.g. 'TRX-10023'
  receiptNo: string;        // e.g. 'REC-202607-001'
  houseId: string;
  houseNo: string;
  houseName: string;
  familyHead: string;
  area: string;
  month: string;            // e.g. '2026-07'
  amount: number;
  paymentMethod: PaymentMethod;
  collectedBy: string;
  collectedById: string;
  timestamp: string;
  notes?: string;
}

export type AuditCategory = 'CREATE' | 'UPDATE' | 'DELETE' | 'PAYMENT' | 'AMOUNT_CHANGE' | 'ROLE_CHANGE' | 'STATUS_CHANGE' | 'SYSTEM';

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;           // e.g. 'PAYMENT_COLLECTED', 'HOUSE_CREATED', 'HOUSE_UPDATED', 'HOUSE_DELETED', 'ROLE_CHANGED'
  category?: AuditCategory;
  entityType?: 'HOUSE' | 'COLLECTION' | 'USER' | 'SETTINGS' | 'SYSTEM';
  entityId?: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
  details: string;
}

export interface MosqueProfile {
  name: string;
  code: string;
  address: string;
  presidentName: string;
  treasurerName: string;
  contactPhone: string;
  establishedYear: string;
}

export interface CollectionStats {
  totalTargetThisMonth: number;
  totalCollectedThisMonth: number;
  totalDueThisMonth: number;
  collectionPercentage: number;
  activeHousesCount: number;
  totalOverdueAllMonths: number;
  totalTransactionsThisMonth: number;
}

export interface AreaCollectionStats {
  area: string;
  target: number;
  collected: number;
  due: number;
  percentage: number;
  houseCount: number;
}
