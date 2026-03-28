import { enTranslations } from "./en";

// Slovenian translation dictionary with machine-generated draft translations
export const slTranslations: Record<string, any> = {
  ...enTranslations,
  nav: {
    overview: "Pregled",
    analytics: "Analitika",
    transactions: "Transakcije",
    journal: "Dnevnik in Glavna knjiga",
    inventory: "Inventar",
    invoices: "Računi",
    gstPurchase: "GST nakup",
    gstAutomation: "GST avtomatizacija",
    reports: "Poročila",
    bank: "Bančno usklajevanje",
    payroll: "Plače",
    tdsTcs: "TDS/TCS",
    calculators: "Kalkulatorji",
    caConsultation: "CA svetovanje",
    caAdmin: "CA administracija",
    governance: "Upravljanje",
    settings: "Nastavitve",
  },
  header: {
    welcome: "Dobrodošli",
    logout: "Odjava",
    login: "Prijava",
    profile: "Profil",
  },
  common: {
    save: "Shrani",
    saving: "Shranjevanje...",
    delete: "Izbriši",
    cancel: "Prekliči",
    edit: "Uredi",
    loading: "Nalaganje...",
  },
};
