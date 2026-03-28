import { enTranslations } from "./en";

// Russian translation dictionary with machine-generated draft translations
export const ruTranslations: Record<string, any> = {
  ...enTranslations,
  nav: {
    overview: "Обзор",
    analytics: "Аналитика",
    transactions: "Транзакции",
    journal: "Журнал и Главная книга",
    inventory: "Инвентарь",
    invoices: "Счета",
    gstPurchase: "Покупка GST",
    gstAutomation: "Автоматизация GST",
    reports: "Отчеты",
    bank: "Банковская сверка",
    payroll: "Зарплата",
    tdsTcs: "TDS/TCS",
    calculators: "Калькуляторы",
    caConsultation: "Консультация CA",
    caAdmin: "Администрирование CA",
    governance: "Управление",
    settings: "Настройки",
  },
  header: {
    welcome: "Добро пожаловать",
    logout: "Выйти",
    login: "Войти",
    profile: "Профиль",
  },
  common: {
    save: "Сохранить",
    saving: "Сохранение...",
    delete: "Удалить",
    cancel: "Отмена",
    edit: "Редактировать",
    loading: "Загрузка...",
  },
};
