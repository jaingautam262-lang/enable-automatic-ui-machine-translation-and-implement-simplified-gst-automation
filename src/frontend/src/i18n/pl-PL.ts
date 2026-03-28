import { enTranslations } from "./en";

// Polish translation dictionary with machine-generated draft translations
export const plTranslations: Record<string, any> = {
  ...enTranslations,
  nav: {
    overview: "Przegląd",
    analytics: "Analityka",
    transactions: "Transakcje",
    journal: "Dziennik i Księga Główna",
    inventory: "Inwentarz",
    invoices: "Faktury",
    gstPurchase: "Zakup GST",
    gstAutomation: "Automatyzacja GST",
    reports: "Raporty",
    bank: "Uzgodnienie Bankowe",
    payroll: "Lista Płac",
    tdsTcs: "TDS/TCS",
    calculators: "Kalkulatory",
    caConsultation: "Konsultacja CA",
    caAdmin: "Administracja CA",
    governance: "Zarządzanie",
    settings: "Ustawienia",
  },
  header: {
    welcome: "Witaj",
    logout: "Wyloguj",
    login: "Zaloguj",
    profile: "Profil",
  },
  common: {
    save: "Zapisz",
    saving: "Zapisywanie...",
    delete: "Usuń",
    cancel: "Anuluj",
    edit: "Edytuj",
    loading: "Ładowanie...",
  },
};
