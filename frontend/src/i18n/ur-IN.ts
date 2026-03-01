import { enTranslations } from './en';

// Urdu translation dictionary with machine-generated draft translations
export const urTranslations: Record<string, any> = {
  ...enTranslations,
  nav: {
    overview: 'جائزہ',
    analytics: 'تجزیات',
    transactions: 'لین دین',
    journal: 'جرنل اور کھاتہ',
    inventory: 'فہرست',
    invoices: 'رسیدیں',
    gstPurchase: 'جی ایس ٹی خریداری',
    gstAutomation: 'جی ایس ٹی خودکار',
    reports: 'رپورٹیں',
    bank: 'بینک مطابقت',
    payroll: 'تنخواہ',
    tdsTcs: 'ٹی ڈی ایس/ٹی سی ایس',
    calculators: 'کیلکولیٹر',
    caConsultation: 'سی اے مشاورت',
    caAdmin: 'سی اے انتظامیہ',
    governance: 'حکمرانی',
    settings: 'ترتیبات',
  },
  header: {
    welcome: 'خوش آمدید',
    logout: 'لاگ آؤٹ',
    login: 'لاگ ان',
    profile: 'پروفائل',
  },
  common: {
    save: 'محفوظ کریں',
    saving: 'محفوظ ہو رہا ہے...',
    delete: 'حذف کریں',
    cancel: 'منسوخ کریں',
    edit: 'ترمیم',
    loading: 'لوڈ ہو رہا ہے...',
  },
};
