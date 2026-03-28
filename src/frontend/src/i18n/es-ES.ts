import { enTranslations } from "./en";

// Spanish translation dictionary with partial translations
export const esTranslations: Record<string, any> = {
  "nav.overview": "Resumen",
  "nav.transactions": "Transacciones",
  "header.appName": "Suite de Contabilidad Unificada",
  "header.logout": "Cerrar sesión",
  "login.signIn": "Iniciar sesión",
  ...enTranslations,
};
