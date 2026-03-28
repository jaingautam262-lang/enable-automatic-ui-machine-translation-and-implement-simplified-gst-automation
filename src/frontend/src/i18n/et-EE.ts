import { enTranslations } from "./en";

// Estonian translation dictionary with machine-generated draft translations
export const etTranslations: Record<string, any> = {
  ...enTranslations,
  nav: {
    overview: "Ülevaade",
    analytics: "Analüütika",
    transactions: "Tehingud",
    journal: "Päevik ja Pearaamat",
    inventory: "Inventar",
    invoices: "Arved",
    gstPurchase: "GST ost",
    gstAutomation: "GST automatiseerimine",
    reports: "Aruanded",
    bank: "Panga vastavusse viimine",
    payroll: "Palgaarvestus",
    tdsTcs: "TDS/TCS",
    calculators: "Kalkulaatorid",
    caConsultation: "CA konsultatsioon",
    caAdmin: "CA haldus",
    governance: "Juhtimine",
    settings: "Seaded",
  },
  header: {
    welcome: "Tere tulemast",
    logout: "Logi välja",
    login: "Logi sisse",
    profile: "Profiil",
  },
  common: {
    save: "Salvesta",
    saving: "Salvestamine...",
    delete: "Kustuta",
    cancel: "Tühista",
    edit: "Muuda",
    loading: "Laadimine...",
  },
};
