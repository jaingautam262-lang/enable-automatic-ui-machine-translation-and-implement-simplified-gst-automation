import { enTranslations } from './en';

// Hebrew translation dictionary with machine-generated draft translations
export const heTranslations: Record<string, any> = {
  ...enTranslations,
  nav: {
    overview: 'סקירה כללית',
    analytics: 'ניתוח',
    transactions: 'עסקאות',
    journal: 'יומן וספר חשבונות',
    inventory: 'מלאי',
    invoices: 'חשבוניות',
    gstPurchase: 'רכישת GST',
    gstAutomation: 'אוטומציה של GST',
    reports: 'דוחות',
    bank: 'התאמת בנק',
    payroll: 'שכר',
    tdsTcs: 'TDS/TCS',
    calculators: 'מחשבונים',
    caConsultation: 'ייעוץ CA',
    caAdmin: 'ניהול CA',
    governance: 'ממשל',
    settings: 'הגדרות',
  },
  header: {
    welcome: 'ברוך הבא',
    logout: 'התנתק',
    login: 'התחבר',
    profile: 'פרופיל',
  },
  common: {
    save: 'שמור',
    saving: 'שומר...',
    delete: 'מחק',
    cancel: 'ביטול',
    edit: 'ערוך',
    loading: 'טוען...',
  },
};
