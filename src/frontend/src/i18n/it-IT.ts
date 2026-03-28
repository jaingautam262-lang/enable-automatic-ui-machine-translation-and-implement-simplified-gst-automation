import { enTranslations } from "./en";

// Italian translation dictionary with machine-generated draft translations
export const itTranslations: Record<string, any> = {
  ...enTranslations,
  nav: {
    overview: "Panoramica",
    analytics: "Analisi",
    transactions: "Transazioni",
    journal: "Giornale e Mastro",
    inventory: "Inventario",
    invoices: "Fatture",
    gstPurchase: "Acquisto GST",
    gstAutomation: "Automazione GST",
    reports: "Rapporti",
    bank: "Riconciliazione Bancaria",
    payroll: "Buste Paga",
    tdsTcs: "TDS/TCS",
    calculators: "Calcolatrici",
    caConsultation: "Consulenza CA",
    caAdmin: "Amministrazione CA",
    governance: "Governance",
    settings: "Impostazioni",
  },
  header: {
    welcome: "Benvenuto",
    logout: "Esci",
    login: "Accedi",
    profile: "Profilo",
  },
  common: {
    save: "Salva",
    saving: "Salvataggio...",
    delete: "Elimina",
    cancel: "Annulla",
    edit: "Modifica",
    loading: "Caricamento...",
  },
};
