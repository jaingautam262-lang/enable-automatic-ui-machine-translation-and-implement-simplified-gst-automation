import { enTranslations } from "./en";

// Turkish translation dictionary with machine-generated draft translations
export const trTranslations: Record<string, any> = {
  ...enTranslations,
  nav: {
    overview: "Genel Bakış",
    analytics: "Analitik",
    transactions: "İşlemler",
    journal: "Yevmiye ve Defter",
    inventory: "Envanter",
    invoices: "Faturalar",
    gstPurchase: "GST Satın Alma",
    gstAutomation: "GST Otomasyonu",
    reports: "Raporlar",
    bank: "Banka Mutabakatı",
    payroll: "Bordro",
    tdsTcs: "TDS/TCS",
    calculators: "Hesap Makineleri",
    caConsultation: "CA Danışmanlığı",
    caAdmin: "CA Yönetimi",
    governance: "Yönetişim",
    settings: "Ayarlar",
  },
  header: {
    welcome: "Hoş Geldiniz",
    logout: "Çıkış",
    login: "Giriş",
    profile: "Profil",
  },
  common: {
    save: "Kaydet",
    saving: "Kaydediliyor...",
    delete: "Sil",
    cancel: "İptal",
    edit: "Düzenle",
    loading: "Yükleniyor...",
  },
};
