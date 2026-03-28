import { enTranslations } from "./en";

// Japanese translation dictionary with machine-generated draft translations
export const jaTranslations: Record<string, any> = {
  ...enTranslations,
  nav: {
    overview: "概要",
    analytics: "分析",
    transactions: "取引",
    journal: "仕訳帳と元帳",
    inventory: "在庫",
    invoices: "請求書",
    gstPurchase: "GST購入",
    gstAutomation: "GST自動化",
    reports: "レポート",
    bank: "銀行照合",
    payroll: "給与",
    tdsTcs: "TDS/TCS",
    calculators: "計算機",
    caConsultation: "CA相談",
    caAdmin: "CA管理",
    governance: "ガバナンス",
    settings: "設定",
  },
  header: {
    welcome: "ようこそ",
    logout: "ログアウト",
    login: "ログイン",
    profile: "プロフィール",
  },
  common: {
    save: "保存",
    saving: "保存中...",
    delete: "削除",
    cancel: "キャンセル",
    edit: "編集",
    loading: "読み込み中...",
  },
};
