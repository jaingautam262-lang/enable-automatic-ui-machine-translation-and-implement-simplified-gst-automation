import { enTranslations } from './en';

// Dogri translation dictionary with machine-generated draft translations
export const doiTranslations: Record<string, any> = {
  ...enTranslations,
  nav: {
    overview: 'समीक्षा',
    analytics: 'विश्लेषण',
    transactions: 'लेन-देन',
    journal: 'जर्नल ते खाता',
    inventory: 'सूची',
    invoices: 'चालान',
    gstPurchase: 'जीएसटी खरीद',
    gstAutomation: 'जीएसटी स्वचालन',
    reports: 'रिपोर्ट',
    bank: 'बैंक समाधान',
    payroll: 'वेतन',
    tdsTcs: 'टीडीएस/टीसीएस',
    calculators: 'कैलकुलेटर',
    caConsultation: 'सीए परामर्श',
    caAdmin: 'सीए प्रशासन',
    governance: 'शासन',
    settings: 'सेटिंग',
  },
  header: {
    welcome: 'स्वागत ऐ',
    logout: 'लॉगआउट',
    login: 'लॉगइन',
    profile: 'प्रोफाइल',
  },
  common: {
    save: 'सुरक्षित करो',
    saving: 'सुरक्षित करदा...',
    delete: 'मिटाओ',
    cancel: 'रद्द करो',
    edit: 'संपादन',
    loading: 'लोड होआ...',
  },
};
