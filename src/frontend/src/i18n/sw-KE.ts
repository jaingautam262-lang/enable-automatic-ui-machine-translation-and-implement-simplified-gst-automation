import { enTranslations } from "./en";

// Swahili translation dictionary with machine-generated draft translations
export const swTranslations: Record<string, any> = {
  ...enTranslations,
  nav: {
    overview: "Muhtasari",
    analytics: "Uchanganuzi",
    transactions: "Miamala",
    journal: "Jarida na Leja",
    inventory: "Hesabu",
    invoices: "Ankara",
    gstPurchase: "Ununuzi wa GST",
    gstAutomation: "Utendaji wa Kiotomatiki wa GST",
    reports: "Ripoti",
    bank: "Upatanisho wa Benki",
    payroll: "Mishahara",
    tdsTcs: "TDS/TCS",
    calculators: "Kikokotoo",
    caConsultation: "Ushauri wa CA",
    caAdmin: "Usimamizi wa CA",
    governance: "Utawala",
    settings: "Mipangilio",
  },
  header: {
    welcome: "Karibu",
    logout: "Toka",
    login: "Ingia",
    profile: "Wasifu",
  },
  common: {
    save: "Hifadhi",
    saving: "Inahifadhi...",
    delete: "Futa",
    cancel: "Ghairi",
    edit: "Hariri",
    loading: "Inapakia...",
  },
};
