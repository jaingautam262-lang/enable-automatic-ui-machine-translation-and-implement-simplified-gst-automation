import { enTranslations } from './en';

// Thai translation dictionary with machine-generated draft translations
export const thTranslations: Record<string, any> = {
  ...enTranslations,
  nav: {
    overview: 'ภาพรวม',
    analytics: 'การวิเคราะห์',
    transactions: 'ธุรกรรม',
    journal: 'สมุดรายวันและบัญชีแยกประเภท',
    inventory: 'สินค้าคงคลัง',
    invoices: 'ใบแจ้งหนี้',
    gstPurchase: 'การซื้อ GST',
    gstAutomation: 'ระบบอัตโนมัติ GST',
    reports: 'รายงาน',
    bank: 'การกระทบยอดธนาคาร',
    payroll: 'เงินเดือน',
    tdsTcs: 'TDS/TCS',
    calculators: 'เครื่องคิดเลข',
    caConsultation: 'คำปรึกษา CA',
    caAdmin: 'การจัดการ CA',
    governance: 'การกำกับดูแล',
    settings: 'การตั้งค่า',
  },
  header: {
    welcome: 'ยินดีต้อนรับ',
    logout: 'ออกจากระบบ',
    login: 'เข้าสู่ระบบ',
    profile: 'โปรไฟล์',
  },
  common: {
    save: 'บันทึก',
    saving: 'กำลังบันทึก...',
    delete: 'ลบ',
    cancel: 'ยกเลิก',
    edit: 'แก้ไข',
    loading: 'กำลังโหลด...',
  },
};
