import { enTranslations } from "./en";

// Bulgarian translation dictionary with machine-generated draft translations
export const bgTranslations: Record<string, any> = {
  ...enTranslations,
  nav: {
    overview: "Преглед",
    analytics: "Анализ",
    transactions: "Транзакции",
    journal: "Дневник и Главна книга",
    inventory: "Инвентар",
    invoices: "Фактури",
    gstPurchase: "GST покупка",
    gstAutomation: "GST автоматизация",
    reports: "Отчети",
    bank: "Банкова сверка",
    payroll: "Заплати",
    tdsTcs: "TDS/TCS",
    calculators: "Калкулатори",
    caConsultation: "CA консултация",
    caAdmin: "CA администрация",
    governance: "Управление",
    settings: "Настройки",
  },
  header: {
    welcome: "Добре дошли",
    logout: "Изход",
    login: "Вход",
    profile: "Профил",
  },
  common: {
    save: "Запази",
    saving: "Записване...",
    delete: "Изтрий",
    cancel: "Отказ",
    edit: "Редактирай",
    loading: "Зареждане...",
  },
};
