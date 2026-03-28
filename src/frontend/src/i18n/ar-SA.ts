import { enTranslations } from "./en";

// Arabic translation dictionary with machine-generated draft translations
export const arTranslations: Record<string, any> = {
  ...enTranslations,
  nav: {
    overview: "نظرة عامة",
    analytics: "التحليلات",
    transactions: "المعاملات",
    journal: "اليومية ودفتر الأستاذ",
    inventory: "المخزون",
    invoices: "الفواتير",
    gstPurchase: "شراء GST",
    gstAutomation: "أتمتة GST",
    reports: "التقارير",
    bank: "تسوية البنك",
    payroll: "كشوف المرتبات",
    tdsTcs: "TDS/TCS",
    calculators: "الآلات الحاسبة",
    caConsultation: "استشارة CA",
    caAdmin: "إدارة CA",
    governance: "الحوكمة",
    settings: "الإعدادات",
  },
  header: {
    welcome: "مرحبا",
    logout: "تسجيل الخروج",
    login: "تسجيل الدخول",
    profile: "الملف الشخصي",
  },
  common: {
    save: "حفظ",
    saving: "جاري الحفظ...",
    delete: "حذف",
    cancel: "إلغاء",
    edit: "تحرير",
    loading: "جاري التحميل...",
  },
};
