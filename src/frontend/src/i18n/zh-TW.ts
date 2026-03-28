import { enTranslations } from "./en";

// Traditional Chinese translation dictionary with machine-generated draft translations
export const zhTWTranslations: Record<string, any> = {
  ...enTranslations,
  nav: {
    overview: "概覽",
    analytics: "分析",
    transactions: "交易",
    journal: "日記帳與分類帳",
    inventory: "庫存",
    invoices: "發票",
    gstPurchase: "GST 採購",
    gstAutomation: "GST 自動化",
    reports: "報告",
    bank: "銀行對帳",
    payroll: "薪資",
    tdsTcs: "TDS/TCS",
    calculators: "計算器",
    caConsultation: "CA 諮詢",
    caAdmin: "CA 管理",
    governance: "治理",
    settings: "設定",
  },
  header: {
    welcome: "歡迎",
    logout: "登出",
    login: "登入",
    profile: "個人資料",
  },
  common: {
    save: "儲存",
    saving: "儲存中...",
    delete: "刪除",
    cancel: "取消",
    edit: "編輯",
    loading: "載入中...",
  },
};
