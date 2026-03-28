import { enTranslations } from "./en";

// Czech translation dictionary with machine-generated draft translations
export const csTranslations: Record<string, any> = {
  ...enTranslations,
  nav: {
    overview: "Přehled",
    analytics: "Analytika",
    transactions: "Transakce",
    journal: "Deník a Hlavní kniha",
    inventory: "Inventář",
    invoices: "Faktury",
    gstPurchase: "Nákup GST",
    gstAutomation: "Automatizace GST",
    reports: "Zprávy",
    bank: "Bankovní odsouhlasení",
    payroll: "Mzdy",
    tdsTcs: "TDS/TCS",
    calculators: "Kalkulačky",
    caConsultation: "Konzultace CA",
    caAdmin: "Správa CA",
    governance: "Správa",
    settings: "Nastavení",
  },
  header: {
    welcome: "Vítejte",
    logout: "Odhlásit se",
    login: "Přihlásit se",
    profile: "Profil",
  },
  common: {
    save: "Uložit",
    saving: "Ukládání...",
    delete: "Smazat",
    cancel: "Zrušit",
    edit: "Upravit",
    loading: "Načítání...",
  },
};
