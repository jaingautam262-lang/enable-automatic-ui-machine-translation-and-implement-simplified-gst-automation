import { enTranslations } from './en';

// Ukrainian translation dictionary with machine-generated draft translations
export const ukTranslations: Record<string, any> = {
  ...enTranslations,
  nav: {
    overview: 'Огляд',
    analytics: 'Аналітика',
    transactions: 'Транзакції',
    journal: 'Журнал та Головна книга',
    inventory: 'Інвентар',
    invoices: 'Рахунки',
    gstPurchase: 'Покупка GST',
    gstAutomation: 'Автоматизація GST',
    reports: 'Звіти',
    bank: 'Банківська звірка',
    payroll: 'Зарплата',
    tdsTcs: 'TDS/TCS',
    calculators: 'Калькулятори',
    caConsultation: 'Консультація CA',
    caAdmin: 'Адміністрування CA',
    governance: 'Управління',
    settings: 'Налаштування',
  },
  header: {
    welcome: 'Ласкаво просимо',
    logout: 'Вийти',
    login: 'Увійти',
    profile: 'Профіль',
  },
  common: {
    save: 'Зберегти',
    saving: 'Збереження...',
    delete: 'Видалити',
    cancel: 'Скасувати',
    edit: 'Редагувати',
    loading: 'Завантаження...',
  },
};
