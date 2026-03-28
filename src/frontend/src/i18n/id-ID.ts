import { enTranslations } from "./en";

// Indonesian translation dictionary with machine-generated draft translations
export const idTranslations: Record<string, any> = {
  ...enTranslations,
  nav: {
    overview: "Ikhtisar",
    analytics: "Analitik",
    transactions: "Transaksi",
    journal: "Jurnal dan Buku Besar",
    inventory: "Inventaris",
    invoices: "Faktur",
    gstPurchase: "Pembelian GST",
    gstAutomation: "Otomasi GST",
    reports: "Laporan",
    bank: "Rekonsiliasi Bank",
    payroll: "Penggajian",
    tdsTcs: "TDS/TCS",
    calculators: "Kalkulator",
    caConsultation: "Konsultasi CA",
    caAdmin: "Admin CA",
    governance: "Tata Kelola",
    settings: "Pengaturan",
  },
  header: {
    welcome: "Selamat Datang",
    logout: "Keluar",
    login: "Masuk",
    profile: "Profil",
  },
  common: {
    save: "Simpan",
    saving: "Menyimpan...",
    delete: "Hapus",
    cancel: "Batal",
    edit: "Edit",
    loading: "Memuat...",
  },
};
