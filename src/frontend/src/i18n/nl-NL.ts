import { enTranslations } from "./en";

// Dutch translation dictionary with machine-generated draft translations
export const nlTranslations: Record<string, any> = {
  ...enTranslations,
  nav: {
    overview: "Overzicht",
    analytics: "Analyse",
    transactions: "Transacties",
    journal: "Dagboek en Grootboek",
    inventory: "Voorraad",
    invoices: "Facturen",
    gstPurchase: "GST Aankoop",
    gstAutomation: "GST Automatisering",
    reports: "Rapporten",
    bank: "Bankafstemming",
    payroll: "Salarisadministratie",
    tdsTcs: "TDS/TCS",
    calculators: "Rekenmachines",
    caConsultation: "CA Consultatie",
    caAdmin: "CA Beheer",
    governance: "Governance",
    settings: "Instellingen",
  },
  header: {
    welcome: "Welkom",
    logout: "Uitloggen",
    login: "Inloggen",
    profile: "Profiel",
  },
  common: {
    save: "Opslaan",
    saving: "Opslaan...",
    delete: "Verwijderen",
    cancel: "Annuleren",
    edit: "Bewerken",
    loading: "Laden...",
  },
};
