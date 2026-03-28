import { enTranslations } from "./en";

// Filipino translation dictionary with machine-generated draft translations
export const filTranslations: Record<string, any> = {
  ...enTranslations,
  nav: {
    overview: "Pangkalahatang-ideya",
    analytics: "Pagsusuri",
    transactions: "Mga Transaksyon",
    journal: "Talaarawan at Ledger",
    inventory: "Imbentaryo",
    invoices: "Mga Invoice",
    gstPurchase: "Pagbili ng GST",
    gstAutomation: "Automation ng GST",
    reports: "Mga Ulat",
    bank: "Pagkakasundo ng Bangko",
    payroll: "Payroll",
    tdsTcs: "TDS/TCS",
    calculators: "Mga Calculator",
    caConsultation: "Konsultasyon sa CA",
    caAdmin: "Pangangasiwa ng CA",
    governance: "Pamamahala",
    settings: "Mga Setting",
  },
  header: {
    welcome: "Maligayang Pagdating",
    logout: "Mag-logout",
    login: "Mag-login",
    profile: "Profile",
  },
  common: {
    save: "I-save",
    saving: "Nag-se-save...",
    delete: "Tanggalin",
    cancel: "Kanselahin",
    edit: "I-edit",
    loading: "Naglo-load...",
  },
};
