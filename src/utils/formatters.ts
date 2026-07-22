// Utility functions for formatting Bengali and English text, dates, numbers, and currency in MCMS

export function toBnDigits(str: string | number): string {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(str).replace(/\d/g, (d) => bnDigits[parseInt(d, 10)]);
}

export function formatBDT(amount: number, useBnDigits = true): string {
  const formatted = amount.toLocaleString('en-US');
  if (useBnDigits) {
    return `৳${toBnDigits(formatted)}`;
  }
  return `৳${formatted}`;
}

export function formatMonthName(monthStr: string, useBn = true): string {
  // monthStr: YYYY-MM e.g. 2026-07
  const [year, month] = monthStr.split('-');
  const monthNamesEn = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthNamesBn = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];

  const idx = parseInt(month, 10) - 1;
  if (idx < 0 || idx >= 12) return monthStr;

  if (useBn) {
    return `${monthNamesBn[idx]} ${toBnDigits(year)}`;
  }
  return `${monthNamesEn[idx]} ${year}`;
}

export function formatDateTime(isoStr: string, useBn = true): string {
  if (!isoStr) return '-';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return isoStr;

  const datePart = d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  const timePart = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  if (useBn) {
    return `${toBnDigits(datePart)} - ${toBnDigits(timePart)}`;
  }
  return `${datePart} - ${timePart}`;
}

export function numberToBengaliWords(amount: number): string {
  if (amount <= 0) return 'শূন্য টাকা মাত্র';
  
  const ones = ['', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়', 'দশ', 
                'এগারো', 'বারো', 'তেরো', 'চৌদ্দ', 'পনেরো', 'ষোলো', 'সতেরো', 'আঠারো', '১৯', 'বিশ'];
  
  if (amount === 100) return 'একশত টাকা মাত্র';
  if (amount === 200) return 'দুইশত টাকা মাত্র';
  if (amount === 300) return 'তিনশত টাকা মাত্র';
  if (amount === 500) return 'পাঁচশত টাকা মাত্র';
  if (amount === 1000) return 'এক হাজার টাকা মাত্র';
  if (amount === 1500) return 'এক হাজার পাঁচশত টাকা মাত্র';
  if (amount === 2000) return 'দুই হাজার টাকা মাত্র';

  return `${toBnDigits(amount)} টাকা মাত্র`;
}
