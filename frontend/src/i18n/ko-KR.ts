import { enTranslations } from './en';

// Korean translation dictionary with machine-generated draft translations
export const koTranslations: Record<string, any> = {
  ...enTranslations,
  nav: {
    overview: '개요',
    analytics: '분석',
    transactions: '거래',
    journal: '분개장 및 원장',
    inventory: '재고',
    invoices: '송장',
    gstPurchase: 'GST 구매',
    gstAutomation: 'GST 자동화',
    reports: '보고서',
    bank: '은행 조정',
    payroll: '급여',
    tdsTcs: 'TDS/TCS',
    calculators: '계산기',
    caConsultation: 'CA 상담',
    caAdmin: 'CA 관리',
    governance: '거버넌스',
    settings: '설정',
  },
  header: {
    welcome: '환영합니다',
    logout: '로그아웃',
    login: '로그인',
    profile: '프로필',
  },
  common: {
    save: '저장',
    saving: '저장 중...',
    delete: '삭제',
    cancel: '취소',
    edit: '편집',
    loading: '로딩 중...',
  },
};
