import { enTranslations } from './en';

// Finnish translation dictionary with machine-generated draft translations
export const fiTranslations: Record<string, any> = {
  ...enTranslations,
  nav: {
    overview: 'Yleiskatsaus',
    analytics: 'Analytiikka',
    transactions: 'Tapahtumat',
    journal: 'Päiväkirja ja Pääkirja',
    inventory: 'Varasto',
    invoices: 'Laskut',
    gstPurchase: 'GST-osto',
    gstAutomation: 'GST-automaatio',
    reports: 'Raportit',
    bank: 'Pankkitäsmäytys',
    payroll: 'Palkanlaskenta',
    tdsTcs: 'TDS/TCS',
    calculators: 'Laskimet',
    caConsultation: 'CA-konsultointi',
    caAdmin: 'CA-hallinto',
    governance: 'Hallinto',
    settings: 'Asetukset',
  },
  header: {
    welcome: 'Tervetuloa',
    logout: 'Kirjaudu ulos',
    login: 'Kirjaudu sisään',
    profile: 'Profiili',
  },
  common: {
    save: 'Tallenna',
    saving: 'Tallennetaan...',
    delete: 'Poista',
    cancel: 'Peruuta',
    edit: 'Muokkaa',
    loading: 'Ladataan...',
  },
};
