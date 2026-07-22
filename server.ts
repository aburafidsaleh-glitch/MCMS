import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  INITIAL_MOSQUE_PROFILE,
  INITIAL_USERS,
  INITIAL_HOUSES,
  INITIAL_COLLECTION_RECORDS,
  INITIAL_TRANSACTIONS,
  INITIAL_AUDIT_LOGS
} from './src/data/mockData.ts';
import { House, CollectionRecord, PaymentTransaction, AuditLog, MosqueProfile } from './src/types.ts';

// Data storage structure
interface DatabaseState {
  profile: MosqueProfile;
  houses: House[];
  collections: CollectionRecord[];
  transactions: PaymentTransaction[];
  auditLogs: AuditLog[];
}

const DB_FILE = path.join(process.cwd(), 'data_store.json');

let dbState: DatabaseState = {
  profile: INITIAL_MOSQUE_PROFILE,
  houses: INITIAL_HOUSES,
  collections: INITIAL_COLLECTION_RECORDS,
  transactions: INITIAL_TRANSACTIONS,
  auditLogs: INITIAL_AUDIT_LOGS
};

// Try loading from local file persistence if exists
try {
  if (fs.existsSync(DB_FILE)) {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed && parsed.houses && parsed.collections) {
      dbState = parsed;
      console.log('Loaded MCMS database from file system persistence.');
    }
  }
} catch (err) {
  console.warn('Could not load existing file DB, starting with initial seed data:', err);
}

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbState, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save DB state:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  
  // Mosque Profile
  app.get('/api/profile', (req, res) => {
    res.json(dbState.profile);
  });

  app.put('/api/profile', (req, res) => {
    dbState.profile = { ...dbState.profile, ...req.body };
    saveDb();
    res.json(dbState.profile);
  });

  // Houses CRUD
  app.get('/api/houses', (req, res) => {
    res.json(dbState.houses);
  });

  app.post('/api/houses', (req, res) => {
    const newHouse: House = {
      id: `H-${Date.now().toString().slice(-4)}`,
      houseNo: req.body.houseNo || '',
      houseName: req.body.houseName || '',
      familyHead: req.body.familyHead || '',
      phone: req.body.phone || '',
      area: req.body.area || 'পূর্ব পাড়া',
      monthlyPledge: Number(req.body.monthlyPledge) || 500,
      category: req.body.category || 'General',
      address: req.body.address || '',
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      notes: req.body.notes || '',
      createdAt: new Date().toISOString().split('T')[0]
    };

    dbState.houses.push(newHouse);

    // Also if there are existing active collection sheets for current month, add record
    const currentMonth = req.body.currentMonth || '2026-07';
    const existingRec = dbState.collections.find(c => c.houseId === newHouse.id && c.month === currentMonth);
    if (!existingRec && newHouse.isActive) {
      dbState.collections.push({
        id: `COL-${currentMonth.replace('-', '')}-${newHouse.id}`,
        houseId: newHouse.id,
        month: currentMonth,
        targetAmount: newHouse.monthlyPledge,
        paidAmount: 0,
        dueAmount: newHouse.monthlyPledge,
        status: 'DUE',
        lastPaidDate: null,
        receiptNo: null,
        collectedBy: null,
        paymentMethod: null
      });
    }

    // Add Audit Log
    dbState.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: req.body.userId || 'U-1',
      userName: req.body.userName || 'মাওলানা রফিকুল ইসলাম',
      userRole: req.body.userRole || 'ADMIN',
      action: 'HOUSE_CREATED',
      details: `নতুন বাড়ি নিবন্ধিত: ${newHouse.houseNo} - ${newHouse.familyHead} (${newHouse.area}), মাসিক চাঁদা: ৳${newHouse.monthlyPledge}`
    });

    saveDb();
    res.status(201).json(newHouse);
  });

  app.put('/api/houses/:id', (req, res) => {
    const houseId = req.params.id;
    const idx = dbState.houses.findIndex(h => h.id === houseId);
    if (idx === -1) {
      return res.status(404).json({ error: 'House not found' });
    }

    const updated = { ...dbState.houses[idx], ...req.body };
    dbState.houses[idx] = updated;

    dbState.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: req.body.userId || 'U-1',
      userName: req.body.userName || 'মাওলানা রফিকুল ইসলাম',
      userRole: req.body.userRole || 'ADMIN',
      action: 'HOUSE_UPDATED',
      details: `বাড়ি আপডেট করা হয়েছে: ${updated.houseNo} (${updated.familyHead})`
    });

    saveDb();
    res.json(updated);
  });

  app.delete('/api/houses/:id', (req, res) => {
    const houseId = req.params.id;
    const house = dbState.houses.find(h => h.id === houseId);
    dbState.houses = dbState.houses.filter(h => h.id !== houseId);

    if (house) {
      dbState.auditLogs.unshift({
        id: `LOG-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: 'U-1',
        userName: 'মাওলানা রফিকুল ইসলাম',
        userRole: 'ADMIN',
        action: 'HOUSE_DELETED',
        details: `বাড়ি মুছে ফেলা হয়েছে: ${house.houseNo} (${house.familyHead})`
      });
    }

    saveDb();
    res.json({ success: true, message: 'House removed' });
  });

  // Bulk Import
  app.post('/api/houses/bulk-import', (req, res) => {
    const items: Partial<House>[] = req.body.items || [];
    const currentMonth = req.body.currentMonth || '2026-07';
    let addedCount = 0;

    items.forEach((item, index) => {
      if (item.familyHead && item.houseNo) {
        const newHouse: House = {
          id: `H-${Date.now().toString().slice(-4)}${index}`,
          houseNo: String(item.houseNo),
          houseName: item.houseName || 'বাড়ি',
          familyHead: String(item.familyHead),
          phone: item.phone ? String(item.phone) : '',
          area: item.area || 'পূর্ব পাড়া',
          monthlyPledge: Number(item.monthlyPledge) || 500,
          category: item.category || 'General',
          address: item.address || '',
          isActive: true,
          notes: item.notes || 'Bulk Imported',
          createdAt: new Date().toISOString().split('T')[0]
        };

        dbState.houses.push(newHouse);
        addedCount++;

        // Add collection record for current month
        dbState.collections.push({
          id: `COL-${currentMonth.replace('-', '')}-${newHouse.id}`,
          houseId: newHouse.id,
          month: currentMonth,
          targetAmount: newHouse.monthlyPledge,
          paidAmount: 0,
          dueAmount: newHouse.monthlyPledge,
          status: 'DUE',
          lastPaidDate: null,
          receiptNo: null,
          collectedBy: null,
          paymentMethod: null
        });
      }
    });

    dbState.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: req.body.userId || 'U-1',
      userName: req.body.userName || 'মাওলানা রফিকুল ইসলাম',
      userRole: req.body.userRole || 'ADMIN',
      action: 'BULK_IMPORTED',
      details: `একসাথে ${addedCount} টি নতুন বাড়ির তথ্য এক্সেল/সিএসভি ফাইল থেকে ইমপোর্ট করা হয়েছে।`
    });

    saveDb();
    res.json({ success: true, addedCount });
  });

  // Collection Sheets & Records
  app.get('/api/collections', (req, res) => {
    const month = (req.query.month as string) || '2026-07';
    const monthRecords = dbState.collections.filter(c => c.month === month);
    res.json(monthRecords);
  });

  // Generate Monthly Sheet
  app.post('/api/collections/generate', (req, res) => {
    const month = req.body.month; // e.g. '2026-08'
    if (!month) {
      return res.status(400).json({ error: 'Month parameter is required' });
    }

    const activeHouses = dbState.houses.filter(h => h.isActive);
    let createdCount = 0;

    activeHouses.forEach(h => {
      const existing = dbState.collections.find(c => c.houseId === h.id && c.month === month);
      if (!existing) {
        dbState.collections.push({
          id: `COL-${month.replace('-', '')}-${h.id}`,
          houseId: h.id,
          month: month,
          targetAmount: h.monthlyPledge,
          paidAmount: 0,
          dueAmount: h.monthlyPledge,
          status: 'DUE',
          lastPaidDate: null,
          receiptNo: null,
          collectedBy: null,
          paymentMethod: null
        });
        createdCount++;
      }
    });

    dbState.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: req.body.userId || 'U-1',
      userName: req.body.userName || 'মাওলানা রফিকুল ইসলাম',
      userRole: req.body.userRole || 'ADMIN',
      action: 'SHEET_GENERATED',
      details: `${month} মাসের জন্য ${createdCount} টি বাড়ির চাঁদার নতুন শীট তৈরি করা হয়েছে।`
    });

    saveDb();
    res.json({ success: true, month, createdCount });
  });

  // Record Payment / Quick Collection
  app.post('/api/collections/collect', (req, res) => {
    const { houseId, month, amount, paymentMethod, collectorName, collectorId, note } = req.body;

    if (!houseId || !month || !amount || !paymentMethod) {
      return res.status(400).json({ error: 'Missing required fields for collection' });
    }

    const house = dbState.houses.find(h => h.id === houseId);
    if (!house) {
      return res.status(404).json({ error: 'House not found' });
    }

    let colRec = dbState.collections.find(c => c.houseId === houseId && c.month === month);
    if (!colRec) {
      colRec = {
        id: `COL-${month.replace('-', '')}-${houseId}`,
        houseId,
        month,
        targetAmount: house.monthlyPledge,
        paidAmount: 0,
        dueAmount: house.monthlyPledge,
        status: 'DUE',
        lastPaidDate: null,
        receiptNo: null,
        collectedBy: null,
        paymentMethod: null
      };
      dbState.collections.push(colRec);
    }

    const collectAmount = Number(amount);
    const newPaidAmount = colRec.paidAmount + collectAmount;
    const newDueAmount = Math.max(0, colRec.targetAmount - newPaidAmount);

    let newStatus: 'PAID' | 'PARTIAL' | 'DUE' = 'DUE';
    if (newPaidAmount >= colRec.targetAmount) {
      newStatus = 'PAID';
    } else if (newPaidAmount > 0) {
      newStatus = 'PARTIAL';
    }

    const receiptNo = colRec.receiptNo || `REC-${month.replace('-', '')}-${Math.floor(100 + Math.random() * 900)}`;

    colRec.paidAmount = newPaidAmount;
    colRec.dueAmount = newDueAmount;
    colRec.status = newStatus;
    colRec.lastPaidDate = new Date().toISOString().split('T')[0];
    colRec.receiptNo = receiptNo;
    colRec.collectedBy = collectorName || 'ক্যাশ কালেক্টর';
    colRec.paymentMethod = paymentMethod;
    if (note) colRec.collectorNote = note;

    // Create Payment Transaction entry
    const trx: PaymentTransaction = {
      id: `TRX-${Date.now().toString().slice(-6)}`,
      receiptNo,
      houseId,
      houseNo: house.houseNo,
      houseName: house.houseName,
      familyHead: house.familyHead,
      area: house.area,
      month,
      amount: collectAmount,
      paymentMethod,
      collectedBy: collectorName || 'ক্যাশ কালেক্টর',
      collectedById: collectorId || 'U-3',
      timestamp: new Date().toISOString(),
      notes: note
    };

    dbState.transactions.unshift(trx);

    // Audit Log
    dbState.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: collectorId || 'U-3',
      userName: collectorName || 'ক্যাশ কালেক্টর',
      userRole: 'COLLECTOR',
      action: 'PAYMENT_COLLECTED',
      details: `${house.houseNo} (${house.familyHead}, ${house.area}) থেকে ৳${collectAmount} (${paymentMethod}) আদায়। রসিদ নং: ${receiptNo}`
    });

    saveDb();
    res.json({ success: true, collectionRecord: colRec, transaction: trx });
  });

  // Transactions Log
  app.get('/api/transactions', (req, res) => {
    res.json(dbState.transactions);
  });

  // Audit Logs
  app.get('/api/audit-logs', (req, res) => {
    res.json(dbState.auditLogs);
  });

  // AI Summary generator using Gemini API
  app.post('/api/ai-summary', async (req, res) => {
    const month = req.body.month || '2026-07';
    const monthRecords = dbState.collections.filter(c => c.month === month);

    const totalTarget = monthRecords.reduce((acc, curr) => acc + curr.targetAmount, 0);
    const totalCollected = monthRecords.reduce((acc, curr) => acc + curr.paidAmount, 0);
    const totalDue = monthRecords.reduce((acc, curr) => acc + curr.dueAmount, 0);
    const paidCount = monthRecords.filter(c => c.status === 'PAID').length;
    const dueCount = monthRecords.filter(c => c.status === 'DUE').length;
    const partialCount = monthRecords.filter(c => c.status === 'PARTIAL').length;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return res.json({
        summary: `**${dbState.profile.name} - ${month} মাসের কালেকশন রিপোর্ট সসংক্ষেপ:**\n\n` +
          `• **মোট লক্ষ্যমাত্রা:** ৳${totalTarget.toLocaleString('bn-BD')}\n` +
          `• **সর্বমোট আদায়:** ৳${totalCollected.toLocaleString('bn-BD')} (${totalTarget > 0 ? ((totalCollected / totalTarget) * 100).toFixed(1) : 0}%)\n` +
          `• **সর্বমোট বকেয়া:** ৳${totalDue.toLocaleString('bn-BD')}\n` +
          `• **পরিশোধিত বাড়ি:** ${paidCount} টি, **আংশিক:** ${partialCount} টি, **বকেয়া:** ${dueCount} টি।\n\n` +
          `*পরামর্শ:* যে সকল পাড়ায় বকেয়ার হার বেশি (যেমন বকেয়া ৩+ টি বাড়ি), সেখানে শুক্রবার জুমার খুতবার পর বা মসজিদ কমিটির সদস্যদের মাধ্যমে বকেয়া আদায়ের নোটিশ প্রেরণের উদ্যোগ গ্রহণ করা যেতে পারে।`
      });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are an executive financial adviser for Bangladeshi Mosque Management Committees (মসজিদ পরিচালনা কমিটি).
Analyze the following collection figures for "${dbState.profile.name}" for month "${month}":
- Total Target: ৳${totalTarget}
- Total Collected: ৳${totalCollected}
- Total Due: ৳${totalDue}
- Fully Paid Houses: ${paidCount}
- Partially Paid Houses: ${partialCount}
- Completely Unpaid/Due Houses: ${dueCount}
- Total Houses: ${dbState.houses.length}

Provide a polite, structured, professional analysis in Bengali (বাংলা ভাষায়) containing:
1. "মাসিক সারসংক্ষেপ" (Overview)
2. "সাফল্য ও অগ্রগতি" (Progress points)
3. "কমিটির জন্য কার্যকর পরামর্শ" (3-4 Actionable collection improvement recommendations for the Mutawalli & Treasurer). Keep it clear, respectful, and highly encouraging for mosque development.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      res.json({ summary: response.text });
    } catch (err: any) {
      console.error('Gemini API Error:', err);
      res.json({
        summary: `**${dbState.profile.name} - ${month} মাসের সংগৃহীত তথ্য:**\n` +
          `মোট আদায়: ৳${totalCollected.toLocaleString()} / ৳${totalTarget.toLocaleString()} (${totalTarget > 0 ? ((totalCollected / totalTarget) * 100).toFixed(1) : 0}%)\n` +
          `বকেয়া বাড়ি: ${dueCount} টি।`
      });
    }
  });

  // Serve Vite in development mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mosque Collection Management System server running on http://localhost:${PORT}`);
  });
}

startServer();
