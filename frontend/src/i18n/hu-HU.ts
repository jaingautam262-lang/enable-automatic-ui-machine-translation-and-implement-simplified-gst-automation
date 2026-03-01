import { enTranslations } from './en';

// Hungarian translation dictionary with machine-generated draft translations
export const huTranslations: Record<string, any> = {
  ...enTranslations,
  nav: {
    overview: 'Áttekintés',
    analytics: 'Elemzés',
    transactions: 'Tranzakciók',
    journal: 'Napló és Főkönyv',
    inventory: 'Készlet',
    invoices: 'Számlák',
    gstPurchase: 'GST vásárlás',
    gstAutomation: 'GST automatizálás',
    reports: 'Jelentések',
    bank: 'Banki egyeztetés',
    payroll: 'Bérszámfejtés',
    tdsTcs: 'TDS/TCS',
    calculators: 'Számológépek',
    caConsultation: 'CA tanácsadás',
    caAdmin: 'CA adminisztráció',
    governance: 'Irányítás',
    settings: 'Beállítások',
  },
  header: {
    welcome: 'Üdvözöljük',
    logout: 'Kijelentkezés',
    login: 'Bejelentkezés',
    profile: 'Profil',
  },
  common: {
    save: 'Mentés',
    saving: 'Mentés...',
    delete: 'Törlés',
    cancel: 'Mégse',
    edit: 'Szerkesztés',
    loading: 'Betöltés...',
  },
};
