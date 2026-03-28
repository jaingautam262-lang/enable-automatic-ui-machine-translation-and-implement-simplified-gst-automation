import { enTranslations } from "./en";

// Manipuri translation dictionary with machine-generated draft translations
export const mniTranslations: Record<string, any> = {
  ...enTranslations,
  nav: {
    overview: "ৱারী",
    analytics: "শরুক য়াউবা",
    transactions: "লেনদেন",
    journal: "জর্নেল অমসুং খাতা",
    inventory: "লিস্ট",
    invoices: "বিল",
    gstPurchase: "জিএসটি লৈবা",
    gstAutomation: "জিএসটি অটোমেশন",
    reports: "রিপোর্ট",
    bank: "বেংক মিলন",
    payroll: "মহক",
    tdsTcs: "টিডিএস/টিসিএস",
    calculators: "কেলকুলেটর",
    caConsultation: "সিএ পরামর্শ",
    caAdmin: "সিএ প্রশাসন",
    governance: "শাসন",
    settings: "সেটিংস",
  },
  header: {
    welcome: "তরাং খংনবা",
    logout: "লগআউট",
    login: "লগইন",
    profile: "প্রোফাইল",
  },
  common: {
    save: "থম্বা",
    saving: "থম্লি...",
    delete: "মুত্থত্পা",
    cancel: "খংদোক্পা",
    edit: "শেমদোক্পা",
    loading: "লোড তৌরি...",
  },
};
