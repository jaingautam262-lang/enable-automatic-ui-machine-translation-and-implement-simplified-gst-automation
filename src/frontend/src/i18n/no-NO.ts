import { enTranslations } from "./en";

// Norwegian translation dictionary with machine-generated draft translations
export const noTranslations: Record<string, any> = {
  ...enTranslations,
  nav: {
    overview: "Oversikt",
    analytics: "Analyse",
    transactions: "Transaksjoner",
    journal: "Journal og Hovedbok",
    inventory: "Lager",
    invoices: "Fakturaer",
    gstPurchase: "GST-kjøp",
    gstAutomation: "GST-automatisering",
    reports: "Rapporter",
    bank: "Bankavstemming",
    payroll: "Lønn",
    tdsTcs: "TDS/TCS",
    calculators: "Kalkulatorer",
    caConsultation: "CA-konsultasjon",
    caAdmin: "CA-administrasjon",
    governance: "Styring",
    settings: "Innstillinger",
  },
  header: {
    welcome: "Velkommen",
    logout: "Logg ut",
    login: "Logg inn",
    profile: "Profil",
  },
  common: {
    save: "Lagre",
    saving: "Lagrer...",
    delete: "Slett",
    cancel: "Avbryt",
    edit: "Rediger",
    loading: "Laster...",
  },
};
