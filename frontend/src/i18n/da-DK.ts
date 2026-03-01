import { enTranslations } from './en';

// Danish translation dictionary with machine-generated draft translations
export const daTranslations: Record<string, any> = {
  ...enTranslations,
  nav: {
    overview: 'Oversigt',
    analytics: 'Analyse',
    transactions: 'Transaktioner',
    journal: 'Journal og Hovedbog',
    inventory: 'Lager',
    invoices: 'Fakturaer',
    gstPurchase: 'GST-køb',
    gstAutomation: 'GST-automatisering',
    reports: 'Rapporter',
    bank: 'Bankafstemning',
    payroll: 'Løn',
    tdsTcs: 'TDS/TCS',
    calculators: 'Lommeregnere',
    caConsultation: 'CA-konsultation',
    caAdmin: 'CA-administration',
    governance: 'Styring',
    settings: 'Indstillinger',
  },
  header: {
    welcome: 'Velkommen',
    logout: 'Log ud',
    login: 'Log ind',
    profile: 'Profil',
  },
  common: {
    save: 'Gem',
    saving: 'Gemmer...',
    delete: 'Slet',
    cancel: 'Annuller',
    edit: 'Rediger',
    loading: 'Indlæser...',
  },
};
