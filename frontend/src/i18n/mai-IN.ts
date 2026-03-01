import { enTranslations } from './en';

// Maithili translation dictionary with machine-generated draft translations
export const maiTranslations: Record<string, any> = {
  ...enTranslations,
  nav: {
    overview: 'समीक्षा',
    analytics: 'विश्लेषण',
    transactions: 'लेन-देन',
    journal: 'जर्नल आ खाता',
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
    welcome: 'स्वागत अछि',
    logout: 'लॉगआउट',
    login: 'लॉगइन',
    profile: 'प्रोफाइल',
  },
  common: {
    save: 'सुरक्षित करू',
    saving: 'सुरक्षित कऽ रहल अछि...',
    delete: 'मेटाउ',
    cancel: 'रद्द करू',
    edit: 'संपादन',
    loading: 'लोड कऽ रहल अछि...',
  },
};
