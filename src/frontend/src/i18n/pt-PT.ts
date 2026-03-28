import { enTranslations } from "./en";

// Portuguese translation dictionary with machine-generated draft translations
export const ptPTTranslations: Record<string, any> = {
  ...enTranslations,
  nav: {
    overview: "Visão Geral",
    analytics: "Análise",
    transactions: "Transações",
    journal: "Diário e Razão",
    inventory: "Inventário",
    invoices: "Faturas",
    gstPurchase: "Compra GST",
    gstAutomation: "Automação GST",
    reports: "Relatórios",
    bank: "Reconciliação Bancária",
    payroll: "Folha de Pagamento",
    tdsTcs: "TDS/TCS",
    calculators: "Calculadoras",
    caConsultation: "Consulta CA",
    caAdmin: "Administração CA",
    governance: "Governança",
    settings: "Definições",
  },
  header: {
    welcome: "Bem-vindo",
    logout: "Sair",
    login: "Entrar",
    profile: "Perfil",
  },
  common: {
    save: "Guardar",
    saving: "A guardar...",
    delete: "Eliminar",
    cancel: "Cancelar",
    edit: "Editar",
    loading: "A carregar...",
  },
};
