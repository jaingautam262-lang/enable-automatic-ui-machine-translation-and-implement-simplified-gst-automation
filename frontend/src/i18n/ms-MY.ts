import { enTranslations } from './en';

// Malay translation dictionary with machine-generated draft translations
export const msTranslations: Record<string, any> = {
  ...enTranslations,
  nav: {
    overview: 'Gambaran Keseluruhan',
    analytics: 'Analitik',
    transactions: 'Transaksi',
    journal: 'Jurnal dan Lejar',
    inventory: 'Inventori',
    invoices: 'Invois',
    gstPurchase: 'Pembelian GST',
    gstAutomation: 'Automasi GST',
    reports: 'Laporan',
    bank: 'Penyesuaian Bank',
    payroll: 'Gaji',
    tdsTcs: 'TDS/TCS',
    calculators: 'Kalkulator',
    caConsultation: 'Perundingan CA',
    caAdmin: 'Pentadbiran CA',
    governance: 'Tadbir Urus',
    settings: 'Tetapan',
  },
  header: {
    welcome: 'Selamat Datang',
    logout: 'Log Keluar',
    login: 'Log Masuk',
    profile: 'Profil',
  },
  common: {
    save: 'Simpan',
    saving: 'Menyimpan...',
    delete: 'Padam',
    cancel: 'Batal',
    edit: 'Edit',
    loading: 'Memuatkan...',
  },
};
