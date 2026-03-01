import { enTranslations } from './en';

// Latvian translation dictionary with machine-generated draft translations
export const lvTranslations: Record<string, any> = {
  ...enTranslations,
  nav: {
    overview: 'Pārskats',
    analytics: 'Analītika',
    transactions: 'Darījumi',
    journal: 'Žurnāls un Virsgrāmata',
    inventory: 'Inventārs',
    invoices: 'Rēķini',
    gstPurchase: 'GST pirkums',
    gstAutomation: 'GST automatizācija',
    reports: 'Atskaites',
    bank: 'Bankas saskaņošana',
    payroll: 'Algas',
    tdsTcs: 'TDS/TCS',
    calculators: 'Kalkulatori',
    caConsultation: 'CA konsultācija',
    caAdmin: 'CA administrēšana',
    governance: 'Pārvaldība',
    settings: 'Iestatījumi',
  },
  header: {
    welcome: 'Laipni lūdzam',
    logout: 'Iziet',
    login: 'Ieiet',
    profile: 'Profils',
  },
  common: {
    save: 'Saglabāt',
    saving: 'Saglabā...',
    delete: 'Dzēst',
    cancel: 'Atcelt',
    edit: 'Rediģēt',
    loading: 'Ielādē...',
  },
};
