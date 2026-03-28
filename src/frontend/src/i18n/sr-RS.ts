import { enTranslations } from "./en";

// Serbian translation dictionary with machine-generated draft translations
export const srTranslations: Record<string, any> = {
  ...enTranslations,
  nav: {
    overview: "Преглед",
    analytics: "Аналитика",
    transactions: "Трансакције",
    journal: "Дневник и Главна књига",
    inventory: "Инвентар",
    invoices: "Фактуре",
    gstPurchase: "GST куповина",
    gstAutomation: "GST аутоматизација",
    reports: "Извештаји",
    bank: "Банковно усклађивање",
    payroll: "Плате",
    tdsTcs: "TDS/TCS",
    calculators: "Калкулатори",
    caConsultation: "CA консултације",
    caAdmin: "CA администрација",
    governance: "Управљање",
    settings: "Подешавања",
  },
  header: {
    welcome: "Добродошли",
    logout: "Одјава",
    login: "Пријава",
    profile: "Профил",
  },
  common: {
    save: "Сачувај",
    saving: "Чување...",
    delete: "Обриши",
    cancel: "Откажи",
    edit: "Уреди",
    loading: "Учитавање...",
  },
};
