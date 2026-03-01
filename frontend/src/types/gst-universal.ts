// Universal GST schema types for provider-agnostic automation
export interface ProviderMetadata {
  providerName: string;
  externalId?: string;
  status: 'pending' | 'success' | 'failed';
  timestamp: number;
  rawPayload?: string;
  rawResponse?: string;
  errorMessage?: string;
}

export interface UniversalInvoicePayload {
  id: string;
  invoiceNumber: string;
  invoiceDate: number;
  customerGSTIN: string;
  customerName: string;
  items: Array<{
    description: string;
    hsnCode: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    cgst: number;
    sgst: number;
    igst: number;
    total: number;
  }>;
  subtotal: number;
  totalTax: number;
  totalAmount: number;
  providerMetadata: ProviderMetadata;
}

export interface UniversalEInvoiceRequest {
  invoiceId: string;
  invoiceNumber: string;
  invoiceDate: number;
  supplierGSTIN: string;
  customerGSTIN: string;
  items: Array<{
    description: string;
    hsnCode: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    total: number;
  }>;
  totalAmount: number;
  providerMetadata: ProviderMetadata;
}

export interface UniversalEInvoiceResponse {
  irn: string;
  ackNo: string;
  ackDate: number;
  signedInvoice: string;
  signedQRCode: string;
  status: 'generated' | 'cancelled' | 'failed';
  providerMetadata: ProviderMetadata;
}

export interface UniversalEWayBillRequest {
  invoiceNumber: string;
  invoiceDate: number;
  fromGSTIN: string;
  toGSTIN: string;
  transportMode: 'road' | 'rail' | 'air' | 'ship';
  vehicleNumber?: string;
  distance: number;
  items: Array<{
    description: string;
    hsnCode: string;
    quantity: number;
    value: number;
  }>;
  providerMetadata: ProviderMetadata;
}

export interface UniversalEWayBillResponse {
  eWayBillNumber: string;
  eWayBillDate: number;
  validUntil: number;
  status: 'active' | 'cancelled' | 'expired';
  providerMetadata: ProviderMetadata;
}

export interface UniversalGSTR1Payload {
  period: string; // MMYYYY format
  b2bInvoices: Array<{
    customerGSTIN: string;
    invoiceNumber: string;
    invoiceDate: number;
    invoiceValue: number;
    taxableValue: number;
    cgst: number;
    sgst: number;
    igst: number;
  }>;
  b2cInvoices: Array<{
    invoiceNumber: string;
    invoiceDate: number;
    invoiceValue: number;
    taxableValue: number;
    cgst: number;
    sgst: number;
  }>;
  providerMetadata: ProviderMetadata;
}

export interface UniversalGSTR3BPayload {
  period: string; // MMYYYY format
  outwardSupplies: {
    taxableValue: number;
    cgst: number;
    sgst: number;
    igst: number;
    cess: number;
  };
  inwardSupplies: {
    taxableValue: number;
    cgst: number;
    sgst: number;
    igst: number;
    itcAvailable: number;
  };
  netTaxLiability: number;
  providerMetadata: ProviderMetadata;
}

export interface UniversalGSTR2AData {
  period: string;
  b2bInvoices: Array<{
    supplierGSTIN: string;
    invoiceNumber: string;
    invoiceDate: number;
    invoiceValue: number;
    taxableValue: number;
    cgst: number;
    sgst: number;
    igst: number;
  }>;
  providerMetadata: ProviderMetadata;
}

export interface UniversalGSTR2BData {
  period: string;
  b2bInvoices: Array<{
    supplierGSTIN: string;
    invoiceNumber: string;
    invoiceDate: number;
    invoiceValue: number;
    taxableValue: number;
    cgst: number;
    sgst: number;
    igst: number;
    itcEligibility: 'eligible' | 'ineligible' | 'blocked';
  }>;
  providerMetadata: ProviderMetadata;
}

export interface ReconciliationResult {
  period: string;
  matched: Array<{
    invoiceNumber: string;
    gstr2aValue: number;
    gstr2bValue: number;
    difference: number;
  }>;
  unmatchedGSTR2A: Array<{
    supplierGSTIN: string;
    invoiceNumber: string;
    invoiceValue: number;
  }>;
  unmatchedGSTR2B: Array<{
    supplierGSTIN: string;
    invoiceNumber: string;
    invoiceValue: number;
  }>;
  providerMetadata: ProviderMetadata;
}

export type GSPProvider = 'cleartax' | 'mastersIndia' | 'iris' | 'tally';

export interface ProviderCredentials {
  apiKey: string;
  clientId: string;
  clientSecret: string;
  gstin: string;
  enabled: boolean;
}

export type ClearTaxCredentials = ProviderCredentials;
export type MastersIndiaCredentials = ProviderCredentials;
export type IRISCredentials = ProviderCredentials;
export type TallyCredentials = ProviderCredentials;

export interface AutomationStatus {
  enabled: boolean;
  lastRunTime?: number;
  lastRunStatus?: 'success' | 'failed' | 'partial';
  nextScheduledRun?: number;
  credentialsConfigured: boolean;
}

export interface AutomationRunLog {
  id: string;
  operationType: 'gstr1' | 'gstr3b' | 'einvoice' | 'ewayBill' | 'reconciliation' | 'fullSync';
  startedAt: number;
  finishedAt?: number;
  status: 'running' | 'success' | 'failed' | 'partial';
  errorMessage?: string;
  recordsProcessed?: number;
  recordsFailed?: number;
}

export interface UnifiedGSTRecord {
  id: string;
  owner: string;
  type: 'invoice' | 'einvoice' | 'ewayBill' | 'gstr1' | 'gstr3b' | 'reconciliation';
  data: any;
  createdAt: number;
  updatedAt: number;
}
