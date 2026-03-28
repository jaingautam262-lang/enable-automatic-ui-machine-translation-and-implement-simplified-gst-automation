import { enTranslations } from "./en";

// Sanskrit translation dictionary with machine-generated draft translations
export const saTranslations: Record<string, any> = {
  ...enTranslations,
  nav: {
    overview: "समीक्षा",
    analytics: "विश्लेषणम्",
    transactions: "व्यवहाराः",
    journal: "दैनन्दिनी च खाता",
    inventory: "सूची",
    invoices: "चलनपत्राणि",
    gstPurchase: "जीएसटी क्रयः",
    gstAutomation: "जीएसटी स्वचालितम्",
    reports: "प्रतिवेदनानि",
    bank: "बैंक समन्वयः",
    payroll: "वेतनम्",
    tdsTcs: "टीडीएस/टीसीएस",
    calculators: "गणकयन्त्राणि",
    caConsultation: "सीए परामर्शः",
    caAdmin: "सीए प्रशासनम्",
    governance: "शासनम्",
    settings: "सेटिंग्स",
  },
  header: {
    welcome: "स्वागतम्",
    logout: "निर्गमनम्",
    login: "प्रवेशः",
    profile: "प्रोफाइल",
  },
  common: {
    save: "संरक्षणम्",
    saving: "संरक्षणं क्रियते...",
    delete: "विलोपनम्",
    cancel: "निरसनम्",
    edit: "सम्पादनम्",
    loading: "लोडिंग...",
  },
};
