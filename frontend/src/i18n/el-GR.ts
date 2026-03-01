import { enTranslations } from './en';

// Greek translation dictionary with machine-generated draft translations
export const elTranslations: Record<string, any> = {
  ...enTranslations,
  nav: {
    overview: 'Επισκόπηση',
    analytics: 'Αναλυτικά',
    transactions: 'Συναλλαγές',
    journal: 'Ημερολόγιο και Καθολικό',
    inventory: 'Απογραφή',
    invoices: 'Τιμολόγια',
    gstPurchase: 'Αγορά GST',
    gstAutomation: 'Αυτοματοποίηση GST',
    reports: 'Αναφορές',
    bank: 'Τραπεζική Συμφωνία',
    payroll: 'Μισθοδοσία',
    tdsTcs: 'TDS/TCS',
    calculators: 'Αριθμομηχανές',
    caConsultation: 'Συμβουλευτική CA',
    caAdmin: 'Διαχείριση CA',
    governance: 'Διακυβέρνηση',
    settings: 'Ρυθμίσεις',
  },
  header: {
    welcome: 'Καλώς ήρθατε',
    logout: 'Αποσύνδεση',
    login: 'Σύνδεση',
    profile: 'Προφίλ',
  },
  common: {
    save: 'Αποθήκευση',
    saving: 'Αποθήκευση...',
    delete: 'Διαγραφή',
    cancel: 'Ακύρωση',
    edit: 'Επεξεργασία',
    loading: 'Φόρτωση...',
  },
};
