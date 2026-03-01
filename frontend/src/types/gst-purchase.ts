export interface GSTPurchaseInvoiceItem {
  description: string;
  hsnSacCode: string;
  quantity: number;
  rate: number;
  gstRate: number;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  itcEligibility: 'eligible' | 'ineligible' | 'blocked';
}

export type VendorType = 'Normal' | 'Composition';

export interface GSTPurchaseInvoice {
  id: string;
  vendorName: string;
  vendorGSTIN: string;
  vendorAddress: string;
  vendorStateCode: string;
  vendorType: VendorType;
  supplierInvoiceNumber: string;
  supplierInvoiceDate: bigint;
  items: GSTPurchaseInvoiceItem[];
  subtotal: number;
  totalCGST: number;
  totalSGST: number;
  totalIGST: number;
  totalGST: number;
  additionalCharges: number;
  grandTotal: number;
  paymentMode: 'cash' | 'credit' | 'online';
  reverseCharge: boolean;
  createdAt: bigint;
}
