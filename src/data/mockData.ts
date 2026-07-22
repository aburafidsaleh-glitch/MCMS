import { House, CollectionRecord, PaymentTransaction, AuditLog, MosqueProfile, User } from '../types';

export const INITIAL_MOSQUE_PROFILE: MosqueProfile = {
  name: 'বাইতুস সালাম জামে মসজিদ',
  code: 'MSJ-BD-1024',
  address: 'রোড # ০৪, ব্লক-বি, মিরপুর-১১, ঢাকা-১২১৬',
  presidentName: 'আলহাজ্ব মোঃ রফিকুল ইসলাম',
  treasurerName: 'হাফেজ মাওলানা আব্দুল করিম',
  contactPhone: '01711-223344',
  establishedYear: '১৯৯৫'
};

export const INITIAL_USERS: User[] = [
  {
    id: 'U-1',
    name: 'মাওলানা রফিকুল ইসলাম',
    role: 'ADMIN',
    phone: '01711-112233',
    assignedArea: 'All'
  },
  {
    id: 'U-2',
    name: 'হাফেজ মাওলানা আব্দুল করিম',
    role: 'TREASURER',
    phone: '01811-223344',
    assignedArea: 'All'
  },
  {
    id: 'U-3',
    name: 'মোঃ জসিম উদ্দিন',
    role: 'COLLECTOR',
    phone: '01911-334455',
    assignedArea: 'পূর্ব পাড়া & উত্তর পাড়া'
  },
  {
    id: 'U-4',
    name: 'মোঃ কামাল হোসেন',
    role: 'COLLECTOR',
    phone: '01611-445566',
    assignedArea: 'পশ্চিম পাড়া & দক্ষিণ পাড়া'
  }
];

export const INITIAL_HOUSES: House[] = [
  {
    id: 'H-101',
    houseNo: '১০১/এ',
    houseName: 'বাইতুল আমান ভিলা',
    familyHead: 'হাজী আব্দুর রশিদ',
    phone: '01712-101101',
    area: 'পূর্ব পাড়া',
    monthlyPledge: 500,
    category: 'General',
    address: 'রোড # ১, বাসা # ১০১',
    isActive: true,
    createdAt: '2025-01-01'
  },
  {
    id: 'H-102',
    houseNo: '১০২/বি',
    houseName: 'খান ভবন',
    familyHead: 'মোঃ সহিদুল ইসলাম khan',
    phone: '01812-102102',
    area: 'পূর্ব পাড়া',
    monthlyPledge: 1000,
    category: 'Donation Premium',
    address: 'রোড # ১, বাসা # ১০২',
    isActive: true,
    createdAt: '2025-01-01'
  },
  {
    id: 'H-103',
    houseNo: '১০৩/সি',
    houseName: 'রশিদ ম্যানশন',
    familyHead: 'মাওলানা আব্দুল হাই',
    phone: '01912-103103',
    area: 'পূর্ব পাড়া',
    monthlyPledge: 300,
    category: 'General',
    address: 'রোড # ২, বাসা # ১০৩',
    isActive: true,
    createdAt: '2025-01-01'
  },
  {
    id: 'H-104',
    houseNo: '১০৪/ডি',
    houseName: 'মদিনা নীড়',
    familyHead: 'ইঞ্জিনিয়ার মোঃ শফিকুল ইসলাম',
    phone: '01612-104104',
    area: 'পূর্ব পাড়া',
    monthlyPledge: 1500,
    category: 'Donation Premium',
    address: 'রোড # ২, বাসা # ১০৪',
    isActive: true,
    createdAt: '2025-01-01'
  },
  {
    id: 'H-201',
    houseNo: '২০১/এ',
    houseName: 'চৌধুরী ভিলা',
    familyHead: 'হাজী মোঃ নুরুল ইসলাম চৌধুরী',
    phone: '01712-201201',
    area: 'পশ্চিম পাড়া',
    monthlyPledge: 500,
    category: 'General',
    address: 'রোড # ৩, বাসা # ২০১',
    isActive: true,
    createdAt: '2025-01-01'
  },
  {
    id: 'H-202',
    houseNo: '২০২/বি',
    houseName: 'সোবহান কুটির',
    familyHead: 'ডাঃ মোঃ আব্দুর সোবহান',
    phone: '01812-202202',
    area: 'পশ্চিম পাড়া',
    monthlyPledge: 1000,
    category: 'Donation Premium',
    address: 'রোড # ৩, বাসা # ২০২',
    isActive: true,
    createdAt: '2025-01-01'
  },
  {
    id: 'H-203',
    houseNo: '২০৩/সি',
    houseName: 'সরকার বাড়ি',
    familyHead: 'মোঃ আলমগীর সরকার',
    phone: '01912-203203',
    area: 'পশ্চিম পাড়া',
    monthlyPledge: 300,
    category: 'General',
    address: 'রোড # ৪, বাসা # ২০৩',
    isActive: true,
    createdAt: '2025-01-01'
  },
  {
    id: 'H-301',
    houseNo: '৩০১/এ',
    houseName: 'আহমেদ টাওয়ার',
    familyHead: 'হাজী মোঃ মোশতাক আহমেদ',
    phone: '01712-301301',
    area: 'উত্তর পাড়া',
    monthlyPledge: 2000,
    category: 'Business',
    address: 'মেন রোড, বাসা # ৩০১',
    isActive: true,
    createdAt: '2025-01-01'
  },
  {
    id: 'H-302',
    houseNo: '৩০২/বি',
    houseName: 'রহমান নীড়',
    familyHead: 'অধ্যাপক মোঃ খলিলুর রহমান',
    phone: '01812-302302',
    area: 'উত্তর পাড়া',
    monthlyPledge: 500,
    category: 'General',
    address: 'রোড # ৫, বাসা # ৩০২',
    isActive: true,
    createdAt: '2025-01-01'
  },
  {
    id: 'H-303',
    houseNo: '৩০৩/সি',
    houseName: 'ফারুক ম্যানশন',
    familyHead: 'মোঃ ওমর ফারুক',
    phone: '01912-303303',
    area: 'উত্তর পাড়া',
    monthlyPledge: 500,
    category: 'General',
    address: 'রোড # ৫, বাসা # ৩০৩',
    isActive: true,
    createdAt: '2025-01-01'
  },
  {
    id: 'H-401',
    houseNo: '৪০১/এ',
    houseName: 'মিয়াজী ভিলা',
    familyHead: 'হাজী মোঃ জালাল উদ্দীন মিয়াজী',
    phone: '01712-401401',
    area: 'দক্ষিণ পাড়া',
    monthlyPledge: 500,
    category: 'General',
    address: 'রোড # ৬, বাসা # ৪০১',
    isActive: true,
    createdAt: '2025-01-01'
  },
  {
    id: 'H-402',
    houseNo: '৪০২/বি',
    houseName: 'বাইয়েনা ভবন',
    familyHead: 'মোঃ একরামুল হক',
    phone: '01812-402402',
    area: 'দক্ষিণ পাড়া',
    monthlyPledge: 300,
    category: 'General',
    address: 'রোড # ৬, বাসা # ৪০২',
    isActive: true,
    createdAt: '2025-01-01'
  },
  {
    id: 'H-403',
    houseNo: '৪০৩/সি',
    houseName: 'ভূঁইয়া নিবাস',
    familyHead: 'মোঃ রফিকুল ইসলাম ভূঁইয়া',
    phone: '01912-403403',
    area: 'দক্ষিণ পাড়া',
    monthlyPledge: 1000,
    category: 'Donation Premium',
    address: 'রোড # ৭, বাসা # ৪০৩',
    isActive: true,
    createdAt: '2025-01-01'
  },
  {
    id: 'H-501',
    houseNo: '৫০১/এ',
    houseName: 'বিসমিল্লাহ ফার্মেসি & ট্রেডার্স',
    familyHead: 'মোঃ আনোয়ার হোসেন (স্বত্বাধিকারী)',
    phone: '01712-501501',
    area: 'মধ্য বাজার',
    monthlyPledge: 1000,
    category: 'Business',
    address: 'মসজিদ মার্কেট, দোকান # ১',
    isActive: true,
    createdAt: '2025-01-01'
  },
  {
    id: 'H-502',
    houseNo: '৫০২/বি',
    houseName: 'মদিনা বেকার্স & কনফেকশনারি',
    familyHead: 'মোঃ জহিরুল ইসলাম',
    phone: '01812-502502',
    area: 'মধ্য বাজার',
    monthlyPledge: 1000,
    category: 'Business',
    address: 'মসজিদ মার্কেট, দোকান # ২',
    isActive: true,
    createdAt: '2025-01-01'
  },
  {
    id: 'H-503',
    houseNo: '৫০৩/সি',
    houseName: 'মোল্লা স্টোর',
    familyHead: 'মোঃ নজরুল ইসলাম মোল্লা',
    phone: '01912-503503',
    area: 'মধ্য বাজার',
    monthlyPledge: 500,
    category: 'Business',
    address: 'বাজার মেইন রোড',
    isActive: true,
    createdAt: '2025-01-01'
  }
];

export const INITIAL_COLLECTION_RECORDS: CollectionRecord[] = [
  // Current Month: July 2026 (2026-07)
  { id: 'COL-202607-H101', houseId: 'H-101', month: '2026-07', targetAmount: 500, paidAmount: 500, dueAmount: 0, status: 'PAID', lastPaidDate: '2026-07-05', receiptNo: 'REC-202607-001', collectedBy: 'মোঃ জসিম উদ্দিন', paymentMethod: 'CASH', collectorNote: 'নগদে আদায় করা হয়েছে' },
  { id: 'COL-202607-H102', houseId: 'H-102', month: '2026-07', targetAmount: 1000, paidAmount: 1000, dueAmount: 0, status: 'PAID', lastPaidDate: '2026-07-06', receiptNo: 'REC-202607-002', collectedBy: 'মোঃ জসিম উদ্দিন', paymentMethod: 'BKASH', collectorNote: 'বিকাশ পার্সোনাল মারফত' },
  { id: 'COL-202607-H103', houseId: 'H-103', month: '2026-07', targetAmount: 300, paidAmount: 0, dueAmount: 300, status: 'DUE', lastPaidDate: null, receiptNo: null, collectedBy: null, paymentMethod: null },
  { id: 'COL-202607-H104', houseId: 'H-104', month: '2026-07', targetAmount: 1500, paidAmount: 1500, dueAmount: 0, status: 'PAID', lastPaidDate: '2026-07-10', receiptNo: 'REC-202607-003', collectedBy: 'মোঃ জসিম উদ্দিন', paymentMethod: 'CASH' },
  
  { id: 'COL-202607-H201', houseId: 'H-201', month: '2026-07', targetAmount: 500, paidAmount: 500, dueAmount: 0, status: 'PAID', lastPaidDate: '2026-07-08', receiptNo: 'REC-202607-004', collectedBy: 'মোঃ কামাল হোসেন', paymentMethod: 'CASH' },
  { id: 'COL-202607-H202', houseId: 'H-202', month: '2026-07', targetAmount: 1000, paidAmount: 500, dueAmount: 500, status: 'PARTIAL', lastPaidDate: '2026-07-12', receiptNo: 'REC-202607-005', collectedBy: 'মোঃ কামাল হোসেন', paymentMethod: 'CASH', collectorNote: 'বাকী ৫০০ টাকা আগামী সপ্তাহে দিবেন' },
  { id: 'COL-202607-H203', houseId: 'H-203', month: '2026-07', targetAmount: 300, paidAmount: 0, dueAmount: 300, status: 'DUE', lastPaidDate: null, receiptNo: null, collectedBy: null, paymentMethod: null },
  
  { id: 'COL-202607-H301', houseId: 'H-301', month: '2026-07', targetAmount: 2000, paidAmount: 2000, dueAmount: 0, status: 'PAID', lastPaidDate: '2026-07-02', receiptNo: 'REC-202607-006', collectedBy: 'মোঃ জসিম উদ্দিন', paymentMethod: 'BANK', collectorNote: 'ব্যাংক চেক প্রদান' },
  { id: 'COL-202607-H302', houseId: 'H-302', month: '2026-07', targetAmount: 500, paidAmount: 0, dueAmount: 500, status: 'DUE', lastPaidDate: null, receiptNo: null, collectedBy: null, paymentMethod: null },
  { id: 'COL-202607-H303', houseId: 'H-303', month: '2026-07', targetAmount: 500, paidAmount: 500, dueAmount: 0, status: 'PAID', lastPaidDate: '2026-07-15', receiptNo: 'REC-202607-007', collectedBy: 'মোঃ জসিম উদ্দিন', paymentMethod: 'NAGAD' },

  { id: 'COL-202607-H401', houseId: 'H-401', month: '2026-07', targetAmount: 500, paidAmount: 500, dueAmount: 0, status: 'PAID', lastPaidDate: '2026-07-09', receiptNo: 'REC-202607-008', collectedBy: 'মোঃ কামাল হোসেন', paymentMethod: 'CASH' },
  { id: 'COL-202607-H402', houseId: 'H-402', month: '2026-07', targetAmount: 300, paidAmount: 0, dueAmount: 300, status: 'DUE', lastPaidDate: null, receiptNo: null, collectedBy: null, paymentMethod: null },
  { id: 'COL-202607-H403', houseId: 'H-403', month: '2026-07', targetAmount: 1000, paidAmount: 1000, dueAmount: 0, status: 'PAID', lastPaidDate: '2026-07-14', receiptNo: 'REC-202607-009', collectedBy: 'মোঃ কামাল হোসেন', paymentMethod: 'BKASH' },

  { id: 'COL-202607-H501', houseId: 'H-501', month: '2026-07', targetAmount: 1000, paidAmount: 1000, dueAmount: 0, status: 'PAID', lastPaidDate: '2026-07-03', receiptNo: 'REC-202607-010', collectedBy: 'মোঃ জসিম উদ্দিন', paymentMethod: 'CASH' },
  { id: 'COL-202607-H502', houseId: 'H-502', month: '2026-07', targetAmount: 1000, paidAmount: 1000, dueAmount: 0, status: 'PAID', lastPaidDate: '2026-07-04', receiptNo: 'REC-202607-011', collectedBy: 'মোঃ জসিম উদ্দিন', paymentMethod: 'BKASH' },
  { id: 'COL-202607-H503', houseId: 'H-503', month: '2026-07', targetAmount: 500, paidAmount: 0, dueAmount: 500, status: 'DUE', lastPaidDate: null, receiptNo: null, collectedBy: null, paymentMethod: null },

  // Previous Month: June 2026 (2026-06)
  { id: 'COL-202606-H101', houseId: 'H-101', month: '2026-06', targetAmount: 500, paidAmount: 500, dueAmount: 0, status: 'PAID', lastPaidDate: '2026-06-05', receiptNo: 'REC-202606-001', collectedBy: 'মোঃ জসিম উদ্দিন', paymentMethod: 'CASH' },
  { id: 'COL-202606-H102', houseId: 'H-102', month: '2026-06', targetAmount: 1000, paidAmount: 1000, dueAmount: 0, status: 'PAID', lastPaidDate: '2026-06-08', receiptNo: 'REC-202606-002', collectedBy: 'মোঃ জসিম উদ্দিন', paymentMethod: 'CASH' },
  { id: 'COL-202606-H103', houseId: 'H-103', month: '2026-06', targetAmount: 300, paidAmount: 0, dueAmount: 300, status: 'DUE', lastPaidDate: null, receiptNo: null, collectedBy: null, paymentMethod: null },
  { id: 'COL-202606-H104', houseId: 'H-104', month: '2026-06', targetAmount: 1500, paidAmount: 1500, dueAmount: 0, status: 'PAID', lastPaidDate: '2026-06-11', receiptNo: 'REC-202606-003', collectedBy: 'মোঃ জসিম উদ্দিন', paymentMethod: 'BKASH' },
  { id: 'COL-202606-H201', houseId: 'H-201', month: '2026-06', targetAmount: 500, paidAmount: 500, dueAmount: 0, status: 'PAID', lastPaidDate: '2026-06-09', receiptNo: 'REC-202606-004', collectedBy: 'মোঃ কামাল হোসেন', paymentMethod: 'CASH' },
  { id: 'COL-202606-H202', houseId: 'H-202', month: '2026-06', targetAmount: 1000, paidAmount: 1000, dueAmount: 0, status: 'PAID', lastPaidDate: '2026-06-12', receiptNo: 'REC-202606-005', collectedBy: 'মোঃ কামাল হোসেন', paymentMethod: 'CASH' },
  { id: 'COL-202606-H301', houseId: 'H-301', month: '2026-06', targetAmount: 2000, paidAmount: 2000, dueAmount: 0, status: 'PAID', lastPaidDate: '2026-06-04', receiptNo: 'REC-202606-006', collectedBy: 'মোঃ জসিম উদ্দিন', paymentMethod: 'BANK' },
  { id: 'COL-202606-H401', houseId: 'H-401', month: '2026-06', targetAmount: 500, paidAmount: 500, dueAmount: 0, status: 'PAID', lastPaidDate: '2026-06-10', receiptNo: 'REC-202606-007', collectedBy: 'মোঃ কামাল হোসেন', paymentMethod: 'CASH' },
  { id: 'COL-202606-H501', houseId: 'H-501', month: '2026-06', targetAmount: 1000, paidAmount: 1000, dueAmount: 0, status: 'PAID', lastPaidDate: '2026-06-02', receiptNo: 'REC-202606-008', collectedBy: 'মোঃ জসিম উদ্দিন', paymentMethod: 'CASH' }
];

export const INITIAL_TRANSACTIONS: PaymentTransaction[] = [
  { id: 'TRX-101', receiptNo: 'REC-202607-001', houseId: 'H-101', houseNo: '১০১/এ', houseName: 'বাইতুল আমান ভিলা', familyHead: 'হাজী আব্দুর রশিদ', area: 'পূর্ব পাড়া', month: '2026-07', amount: 500, paymentMethod: 'CASH', collectedBy: 'মোঃ জসিম উদ্দিন', collectedById: 'U-3', timestamp: '2026-07-05T10:30:00Z', notes: 'নগদে আদায় করা হয়েছে' },
  { id: 'TRX-102', receiptNo: 'REC-202607-002', houseId: 'H-102', houseNo: '১০২/বি', houseName: 'খান ভবন', familyHead: 'মোঃ সহিদুল ইসলাম khan', area: 'পূর্ব পাড়া', month: '2026-07', amount: 1000, paymentMethod: 'BKASH', collectedBy: 'মোঃ জসিম উদ্দিন', collectedById: 'U-3', timestamp: '2026-07-06T14:20:00Z', notes: 'বিকাশ পার্সোনাল মারফত' },
  { id: 'TRX-103', receiptNo: 'REC-202607-003', houseId: 'H-104', houseNo: '১০৪/ডি', houseName: 'মদিনা নীড়', familyHead: 'ইঞ্জিনিয়ার মোঃ শফিকুল ইসলাম', area: 'পূর্ব পাড়া', month: '2026-07', amount: 1500, paymentMethod: 'CASH', collectedBy: 'মোঃ জসিম উদ্দিন', collectedById: 'U-3', timestamp: '2026-07-10T11:00:00Z' },
  { id: 'TRX-104', receiptNo: 'REC-202607-004', houseId: 'H-201', houseNo: '২০১/এ', houseName: 'চৌধুরী ভিলা', familyHead: 'হাজী মোঃ নুরুল ইসলাম চৌধুরী', area: 'পশ্চিম পাড়া', month: '2026-07', amount: 500, paymentMethod: 'CASH', collectedBy: 'মোঃ কামাল হোসেন', collectedById: 'U-4', timestamp: '2026-07-08T16:45:00Z' },
  { id: 'TRX-105', receiptNo: 'REC-202607-005', houseId: 'H-202', houseNo: '২০২/বি', houseName: 'সোবহান কুটির', familyHead: 'ডাঃ মোঃ আব্দুর সোবহান', area: 'পশ্চিম পাড়া', month: '2026-07', amount: 500, paymentMethod: 'CASH', collectedBy: 'মোঃ কামাল হোসেন', collectedById: 'U-4', timestamp: '2026-07-12T09:15:00Z', notes: 'আংশিক জমা' },
  { id: 'TRX-106', receiptNo: 'REC-202607-006', houseId: 'H-301', houseNo: '৩০১/এ', houseName: 'আহমেদ টাওয়ার', familyHead: 'হাজী মোঃ মোশতাক আহমেদ', area: 'উত্তর পাড়া', month: '2026-07', amount: 2000, paymentMethod: 'BANK', collectedBy: 'মোঃ জসিম উদ্দিন', collectedById: 'U-3', timestamp: '2026-07-02T12:00:00Z', notes: 'ব্যাংক স্থানান্তর' },
  { id: 'TRX-107', receiptNo: 'REC-202607-007', houseId: 'H-303', houseNo: '৩০৩/সি', houseName: 'ফারুক ম্যানশন', familyHead: 'মোঃ ওমর ফারুক', area: 'উত্তর পাড়া', month: '2026-07', amount: 500, paymentMethod: 'NAGAD', collectedBy: 'মোঃ জসিম উদ্দিন', collectedById: 'U-3', timestamp: '2026-07-15T18:30:00Z' },
  { id: 'TRX-108', receiptNo: 'REC-202607-008', houseId: 'H-401', houseNo: '৪০১/এ', houseName: 'মিয়াজী ভিলা', familyHead: 'হাজী মোঃ জালাল উদ্দীন মিয়াজী', area: 'দক্ষিণ পাড়া', month: '2026-07', amount: 500, paymentMethod: 'CASH', collectedBy: 'মোঃ কামাল হোসেন', collectedById: 'U-4', timestamp: '2026-07-09T10:10:00Z' },
  { id: 'TRX-109', receiptNo: 'REC-202607-009', houseId: 'H-403', houseNo: '৪০৩/সি', houseName: 'ভূঁইয়া নিবাস', familyHead: 'মোঃ রফিকুল ইসলাম ভূঁইয়া', area: 'দক্ষিণ পাড়া', month: '2026-07', amount: 1000, paymentMethod: 'BKASH', collectedBy: 'মোঃ কামাল হোসেন', collectedById: 'U-4', timestamp: '2026-07-14T15:20:00Z' },
  { id: 'TRX-110', receiptNo: 'REC-202607-010', houseId: 'H-501', houseNo: '৫০১/এ', houseName: 'বিসমিল্লাহ ফার্মেসি', familyHead: 'মোঃ আনোয়ার হোসেন', area: 'মধ্য বাজার', month: '2026-07', amount: 1000, paymentMethod: 'CASH', collectedBy: 'মোঃ জসিম উদ্দিন', collectedById: 'U-3', timestamp: '2026-07-03T11:40:00Z' },
  { id: 'TRX-111', receiptNo: 'REC-202607-011', houseId: 'H-502', houseNo: '৫০২/বি', houseName: 'মদিনা বেকার্স', familyHead: 'মোঃ জহিরুল ইসলাম', area: 'মধ্য বাজার', month: '2026-07', amount: 1000, paymentMethod: 'BKASH', collectedBy: 'মোঃ জসিম উদ্দিন', collectedById: 'U-3', timestamp: '2026-07-04T13:00:00Z' }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'LOG-001',
    timestamp: '2026-07-01T08:00:00Z',
    userId: 'U-1',
    userName: 'মাওলানা রফিকুল ইসলাম',
    userRole: 'ADMIN',
    action: 'SHEET_GENERATED',
    category: 'CREATE',
    entityType: 'COLLECTION',
    entityId: 'COL-202607',
    oldValue: 'মাসের পূর্ববর্তী শীট নেই',
    newValue: '২০২৬-০৭ মাসের ১৬টি বাড়ির কালেকশন রেজিস্টার',
    reason: 'নতুন মাসের নিয়মিত কালেকশন শীট জেনারেশন',
    details: 'শ্রাবণ ১৪৩৩ (July 2026) মাসের জন্য ১৬ টি বাড়ির চাঁদার হিসাব তৈরি করা হয়েছে।'
  },
  {
    id: 'LOG-002',
    timestamp: '2026-07-05T10:30:00Z',
    userId: 'U-3',
    userName: 'মোঃ জসিম উদ্দিন',
    userRole: 'COLLECTOR',
    action: 'PAYMENT_COLLECTED',
    category: 'PAYMENT',
    entityType: 'COLLECTION',
    entityId: 'H-101',
    oldValue: 'বকেয়া: ৳৫০০',
    newValue: 'পরিশোধিত: ৳৫০০ (রসিদ: REC-202607-001)',
    reason: 'সংগ্রাহক কর্তৃক সরেজমিনে নগদ চাঁদা সংগ্রহ',
    details: 'বাড়ি ১০১/এ (হাজী আব্দুর রশিদ) থেকে ৳৫০০ নগদ আদায় এবং রসিদ REC-202607-001 ইসু করা হয়েছে।'
  },
  {
    id: 'LOG-003',
    timestamp: '2026-07-06T14:20:00Z',
    userId: 'U-3',
    userName: 'মোঃ জসিম উদ্দিন',
    userRole: 'COLLECTOR',
    action: 'PAYMENT_COLLECTED',
    category: 'PAYMENT',
    entityType: 'COLLECTION',
    entityId: 'H-102',
    oldValue: 'বকেয়া: ৳১০০০',
    newValue: 'পরিশোধিত: ৳১০০০ (রসিদ: REC-202607-002)',
    reason: 'বিকাশ পেমেন্ট গেটওয়ে মারফত চাঁদা প্রাপ্তি',
    details: 'বাড়ি ১০২/বি (খান ভবন) থেকে ৳১০০০ বিকাশ মারফত আদায় ও রসিদ REC-202607-002 ইসু।'
  },
  {
    id: 'LOG-004',
    timestamp: '2026-07-12T09:15:00Z',
    userId: 'U-4',
    userName: 'মোঃ কামাল হোসেন',
    userRole: 'COLLECTOR',
    action: 'PAYMENT_COLLECTED',
    category: 'AMOUNT_CHANGE',
    entityType: 'COLLECTION',
    entityId: 'H-202',
    oldValue: 'বকেয়া: ৳১০০০',
    newValue: 'আংশিক জমা: ৳৫০০ (অবশিষ্ট বকেয়া: ৳৫০০)',
    reason: 'দাতার অনুরোধে আংশিক টাকা গ্রহণ',
    details: 'বাড়ি ২০২/বি (সোবহান কুটির) থেকে ৳৫০০ আংশিক চাঁদা আদায় করা হয়েছে।'
  },
  {
    id: 'LOG-005',
    timestamp: '2026-07-15T11:00:00Z',
    userId: 'U-1',
    userName: 'মাওলানা রফিকুল ইসলাম',
    userRole: 'ADMIN',
    action: 'HOUSE_UPDATED',
    category: 'UPDATE',
    entityType: 'HOUSE',
    entityId: 'H-301',
    oldValue: 'মাসিক চাঁদা: ৳১৫০০',
    newValue: 'মাসিক চাঁদা: ৳২০০০ (ক্যাটাগরি: Business)',
    reason: 'বাণিজ্যিক প্রতিষ্ঠান বৃদ্ধি পাওয়ায় নতুন রেট নির্ধারণ',
    details: 'বাড়ি ৩০১/এ (আহমেদ টাওয়ার) এর মাসিক চাঁদার পরিমাণ ৳১৫০০ থেকে বাড়িয়ে ৳২০০০ করা হয়েছে।'
  }
];
