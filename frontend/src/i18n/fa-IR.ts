import { enTranslations } from './en';

// Persian translation dictionary with machine-generated draft translations
export const faTranslations: Record<string, any> = {
  ...enTranslations,
  nav: {
    overview: 'نمای کلی',
    analytics: 'تحلیل',
    transactions: 'تراکنش‌ها',
    journal: 'دفتر روزنامه و دفتر کل',
    inventory: 'موجودی',
    invoices: 'فاکتورها',
    gstPurchase: 'خرید GST',
    gstAutomation: 'اتوماسیون GST',
    reports: 'گزارش‌ها',
    bank: 'تطبیق بانکی',
    payroll: 'حقوق و دستمزد',
    tdsTcs: 'TDS/TCS',
    calculators: 'ماشین‌حساب‌ها',
    caConsultation: 'مشاوره CA',
    caAdmin: 'مدیریت CA',
    governance: 'حاکمیت',
    settings: 'تنظیمات',
  },
  header: {
    welcome: 'خوش آمدید',
    logout: 'خروج',
    login: 'ورود',
    profile: 'پروفایل',
  },
  common: {
    save: 'ذخیره',
    saving: 'در حال ذخیره...',
    delete: 'حذف',
    cancel: 'لغو',
    edit: 'ویرایش',
    loading: 'در حال بارگذاری...',
  },
};
