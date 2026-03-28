import { enTranslations } from "./en";

// Romanian translation dictionary with machine-generated draft translations
export const roTranslations: Record<string, any> = {
  ...enTranslations,
  nav: {
    overview: "Prezentare Generală",
    analytics: "Analiză",
    transactions: "Tranzacții",
    journal: "Jurnal și Registru",
    inventory: "Inventar",
    invoices: "Facturi",
    gstPurchase: "Achiziție GST",
    gstAutomation: "Automatizare GST",
    reports: "Rapoarte",
    bank: "Reconciliere Bancară",
    payroll: "Salarizare",
    tdsTcs: "TDS/TCS",
    calculators: "Calculatoare",
    caConsultation: "Consultanță CA",
    caAdmin: "Administrare CA",
    governance: "Guvernanță",
    settings: "Setări",
  },
  header: {
    welcome: "Bun venit",
    logout: "Deconectare",
    login: "Autentificare",
    profile: "Profil",
  },
  common: {
    save: "Salvează",
    saving: "Se salvează...",
    delete: "Șterge",
    cancel: "Anulează",
    edit: "Editează",
    loading: "Se încarcă...",
  },
};
