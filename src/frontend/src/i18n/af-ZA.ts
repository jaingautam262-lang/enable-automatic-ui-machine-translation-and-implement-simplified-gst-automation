import { enTranslations } from "./en";

// Afrikaans translation dictionary with machine-generated draft translations
export const afTranslations: Record<string, any> = {
  ...enTranslations,
  nav: {
    overview: "Oorsig",
    analytics: "Analise",
    transactions: "Transaksies",
    journal: "Joernaal en Grootboek",
    inventory: "Voorraad",
    invoices: "Fakture",
    gstPurchase: "GST aankoop",
    gstAutomation: "GST outomatisering",
    reports: "Verslae",
    bank: "Bank versoening",
    payroll: "Loonlys",
    tdsTcs: "TDS/TCS",
    calculators: "Sakrekenaars",
    caConsultation: "CA konsultasie",
    caAdmin: "CA administrasie",
    governance: "Bestuur",
    settings: "Instellings",
  },
  header: {
    welcome: "Welkom",
    logout: "Teken uit",
    login: "Teken in",
    profile: "Profiel",
  },
  common: {
    save: "Stoor",
    saving: "Stoor...",
    delete: "Verwyder",
    cancel: "Kanselleer",
    edit: "Wysig",
    loading: "Laai...",
  },
};
