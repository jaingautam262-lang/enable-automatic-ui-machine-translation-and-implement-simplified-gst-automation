import { enTranslations } from './en';

// Nepali translation dictionary with machine-generated draft translations
export const neTranslations: Record<string, any> = {
  ...enTranslations,
  nav: {
    overview: 'समीक्षा',
    analytics: 'विश्लेषण',
    transactions: 'लेनदेन',
    journal: 'जर्नल र खाता',
    inventory: 'सूची',
    invoices: 'बीजक',
    gstPurchase: 'जीएसटी खरिद',
    gstAutomation: 'जीएसटी स्वचालन',
    reports: 'प्रतिवेदन',
    bank: 'बैंक मिलान',
    payroll: 'तलब',
    tdsTcs: 'टीडीएस/टीसीएस',
    calculators: 'क्यालकुलेटर',
    caConsultation: 'सीए परामर्श',
    caAdmin: 'सीए प्रशासन',
    governance: 'शासन',
    settings: 'सेटिङ्ग',
  },
  header: {
    welcome: 'स्वागत छ',
    logout: 'लगआउट',
    login: 'लगइन',
    profile: 'प्रोफाइल',
  },
  common: {
    save: 'सुरक्षित गर्नुहोस्',
    saving: 'सुरक्षित गर्दै...',
    delete: 'मेटाउनुहोस्',
    cancel: 'रद्द गर्नुहोस्',
    edit: 'सम्पादन',
    loading: 'लोड गर्दै...',
  },
};
