import { enTranslations } from "./en";

// Slovak translation dictionary with machine-generated draft translations
export const skTranslations: Record<string, any> = {
  ...enTranslations,
  nav: {
    overview: "Prehľad",
    analytics: "Analytika",
    transactions: "Transakcie",
    journal: "Denník a Hlavná kniha",
    inventory: "Inventár",
    invoices: "Faktúry",
    gstPurchase: "Nákup GST",
    gstAutomation: "Automatizácia GST",
    reports: "Správy",
    bank: "Bankové odsúhlasenie",
    payroll: "Mzdy",
    tdsTcs: "TDS/TCS",
    calculators: "Kalkulačky",
    caConsultation: "Konzultácia CA",
    caAdmin: "Správa CA",
    governance: "Správa",
    settings: "Nastavenia",
  },
  header: {
    welcome: "Vitajte",
    logout: "Odhlásiť sa",
    login: "Prihlásiť sa",
    profile: "Profil",
  },
  common: {
    save: "Uložiť",
    saving: "Ukladanie...",
    delete: "Vymazať",
    cancel: "Zrušiť",
    edit: "Upraviť",
    loading: "Načítavanie...",
  },
};
