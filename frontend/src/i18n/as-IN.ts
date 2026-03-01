import { enTranslations } from './en';

// Assamese translation dictionary with machine-generated draft translations
export const asTranslations: Record<string, any> = {
  ...enTranslations,
  nav: {
    overview: 'সমীক্ষা',
    analytics: 'বিশ্লেষণ',
    transactions: 'লেনদেন',
    journal: 'জাৰ্নেল আৰু খাতা',
    inventory: 'তালিকা',
    invoices: 'চালান',
    gstPurchase: 'জিএছটি ক্ৰয়',
    gstAutomation: 'জিএছটি স্বয়ংক্ৰিয়',
    reports: 'প্ৰতিবেদন',
    bank: 'বেংক সমন্বয়',
    payroll: 'দৰমহা',
    tdsTcs: 'টিডিএছ/টিচিএছ',
    calculators: 'গণনাকাৰী',
    caConsultation: 'চিএ পৰামৰ্শ',
    caAdmin: 'চিএ প্ৰশাসন',
    governance: 'শাসন',
    settings: 'ছেটিংছ',
  },
  header: {
    welcome: 'স্বাগতম',
    logout: 'লগআউট',
    login: 'লগইন',
    profile: 'প্ৰফাইল',
  },
  common: {
    save: 'সংৰক্ষণ কৰক',
    saving: 'সংৰক্ষণ কৰি আছে...',
    delete: 'বিলোপ কৰক',
    cancel: 'বাতিল কৰক',
    edit: 'সম্পাদনা',
    loading: 'লড কৰি আছে...',
  },
};
