import { enTranslations } from './en';

// Vietnamese translation dictionary with machine-generated draft translations
export const viTranslations: Record<string, any> = {
  ...enTranslations,
  nav: {
    overview: 'Tổng Quan',
    analytics: 'Phân Tích',
    transactions: 'Giao Dịch',
    journal: 'Nhật Ký và Sổ Cái',
    inventory: 'Hàng Tồn Kho',
    invoices: 'Hóa Đơn',
    gstPurchase: 'Mua Hàng GST',
    gstAutomation: 'Tự Động Hóa GST',
    reports: 'Báo Cáo',
    bank: 'Đối Chiếu Ngân Hàng',
    payroll: 'Bảng Lương',
    tdsTcs: 'TDS/TCS',
    calculators: 'Máy Tính',
    caConsultation: 'Tư Vấn CA',
    caAdmin: 'Quản Trị CA',
    governance: 'Quản Trị',
    settings: 'Cài Đặt',
  },
  header: {
    welcome: 'Chào Mừng',
    logout: 'Đăng Xuất',
    login: 'Đăng Nhập',
    profile: 'Hồ Sơ',
  },
  common: {
    save: 'Lưu',
    saving: 'Đang Lưu...',
    delete: 'Xóa',
    cancel: 'Hủy',
    edit: 'Chỉnh Sửa',
    loading: 'Đang Tải...',
  },
};
