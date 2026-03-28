import { enTranslations } from "./en";

// Swedish translation dictionary with machine-generated draft translations
export const svTranslations: Record<string, any> = {
  ...enTranslations,
  nav: {
    overview: "Översikt",
    analytics: "Analys",
    transactions: "Transaktioner",
    journal: "Journal och Huvudbok",
    inventory: "Lager",
    invoices: "Fakturor",
    gstPurchase: "GST-köp",
    gstAutomation: "GST-automatisering",
    reports: "Rapporter",
    bank: "Bankavstämning",
    payroll: "Löner",
    tdsTcs: "TDS/TCS",
    calculators: "Kalkylatorer",
    caConsultation: "CA-konsultation",
    caAdmin: "CA-administration",
    governance: "Styrning",
    settings: "Inställningar",
  },
  header: {
    welcome: "Välkommen",
    logout: "Logga ut",
    login: "Logga in",
    profile: "Profil",
  },
  common: {
    save: "Spara",
    saving: "Sparar...",
    delete: "Radera",
    cancel: "Avbryt",
    edit: "Redigera",
    loading: "Laddar...",
  },
};
