import { enTranslations } from './en';

// Lithuanian translation dictionary with machine-generated draft translations
export const ltTranslations: Record<string, any> = {
  ...enTranslations,
  nav: {
    overview: 'Apžvalga',
    analytics: 'Analitika',
    transactions: 'Sandoriai',
    journal: 'Žurnalas ir Didžioji knyga',
    inventory: 'Inventorius',
    invoices: 'Sąskaitos faktūros',
    gstPurchase: 'GST pirkimas',
    gstAutomation: 'GST automatizavimas',
    reports: 'Ataskaitos',
    bank: 'Banko suderinimas',
    payroll: 'Atlyginimų skaičiavimas',
    tdsTcs: 'TDS/TCS',
    calculators: 'Skaičiuotuvai',
    caConsultation: 'CA konsultacija',
    caAdmin: 'CA administravimas',
    governance: 'Valdymas',
    settings: 'Nustatymai',
  },
  header: {
    welcome: 'Sveiki',
    logout: 'Atsijungti',
    login: 'Prisijungti',
    profile: 'Profilis',
  },
  common: {
    save: 'Išsaugoti',
    saving: 'Išsaugoma...',
    delete: 'Ištrinti',
    cancel: 'Atšaukti',
    edit: 'Redaguoti',
    loading: 'Kraunama...',
  },
};
