import { enTranslations } from './en';

// Croatian translation dictionary with machine-generated draft translations
export const hrTranslations: Record<string, any> = {
  ...enTranslations,
  nav: {
    overview: 'Pregled',
    analytics: 'Analitika',
    transactions: 'Transakcije',
    journal: 'Dnevnik i Glavna knjiga',
    inventory: 'Inventar',
    invoices: 'Fakture',
    gstPurchase: 'GST kupnja',
    gstAutomation: 'GST automatizacija',
    reports: 'Izvješća',
    bank: 'Bankovna usklađivanje',
    payroll: 'Plaće',
    tdsTcs: 'TDS/TCS',
    calculators: 'Kalkulatori',
    caConsultation: 'CA konzultacije',
    caAdmin: 'CA administracija',
    governance: 'Upravljanje',
    settings: 'Postavke',
  },
  header: {
    welcome: 'Dobrodošli',
    logout: 'Odjava',
    login: 'Prijava',
    profile: 'Profil',
  },
  common: {
    save: 'Spremi',
    saving: 'Spremanje...',
    delete: 'Izbriši',
    cancel: 'Odustani',
    edit: 'Uredi',
    loading: 'Učitavanje...',
  },
};
