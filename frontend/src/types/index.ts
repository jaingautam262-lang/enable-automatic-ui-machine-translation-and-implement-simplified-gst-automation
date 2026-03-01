export * from './gst-purchase';
export * from './gst-universal';

export enum TransactionType {
  Sale = 'sale',
  Purchase = 'purchase',
  Income = 'income',
  Expense = 'expense',
  Cash = 'cash',
}

export enum InvoiceStatus {
  Paid = 'paid',
  Unpaid = 'unpaid',
  Overdue = 'overdue',
}

export enum GSTType {
  Regular = 'regular',
  Composition = 'composition',
}

export enum GSTRType {
  GSTR1 = 'gstr1',
  GSTR2B = 'gstr2b',
  GSTR3B = 'gstr3b',
}

export enum GSTFilingStatus {
  Draft = 'draft',
  Submitted = 'submitted',
  Filed = 'filed',
}

export enum DebitCreditNoteType {
  Debit = 'debit',
  Credit = 'credit',
}

export enum ReconciliationStatus {
  Matched = 'matched',
  Unmatched = 'unmatched',
  Pending = 'pending',
}

export enum DepreciationMethod {
  SLM = 'slm',
  WDV = 'wdv',
}

export enum DepreciationStandard {
  IncomeTaxAct = 'incomeTaxAct',
  AccountingStandard = 'accountingStandard',
}

export enum AssetType {
  Fixed = 'fixed',
  Current = 'current',
}

export enum LiabilityType {
  Capital = 'capital',
  Current = 'current',
}

// GST Scheme / Invoice Type for Indian GST context
export type GSTScheme =
  | 'Regular'
  | 'Composition'
  | 'Export_WithPayment'
  | 'Export_WithoutPayment'
  | 'SEZ_WithPayment'
  | 'SEZ_WithoutPayment'
  | 'DeemedExport';

export interface Transaction {
  id: bigint;
  owner: string;
  transactionType: TransactionType;
  date: bigint;
  category: string;
  amount: number;
  description: string;
  associatedParty?: string;
  isCash: boolean;
  referenceId?: bigint;
}

export interface Product {
  id: bigint;
  owner: string;
  name: string;
  description: string;
  price: number;
  sku: string;
  stockLevel: bigint;
  lowStockThreshold: bigint;
}

export interface ProductLocation {
  locationId: string;
  locationName: string;
  quantity: number;
}

export interface InvoiceItem {
  productId: bigint;
  description: string;
  quantity: bigint;
  unitPrice: number;
  total: number;
  taxRate: number;
  discount: number;
}

export interface CustomerGSTInfo {
  gstin: string;
  stateCode: string;
  taxType: GSTType;
}

export interface Invoice {
  id: bigint;
  owner: string;
  invoiceNumber: string;
  businessName: string;
  businessLogo?: Uint8Array;
  businessContact: string;
  businessAddress: string;
  clientName: string;
  clientContact: string;
  clientAddress: string;
  issuedDate: bigint;
  dueDate: bigint;
  items: InvoiceItem[];
  subtotal: number;
  totalTax: number;
  totalDiscount: number;
  totalAmount: number;
  status: InvoiceStatus;
  paymentTerms?: string;
  notes?: string;
  gstin?: string;
  hsnSacCode?: string;
  cgst: number;
  sgst: number;
  igst: number;
  qrCode?: string;
  customerGSTInfo?: CustomerGSTInfo;
  website?: string;
  qrCodeImage?: Uint8Array;
  // GST Scheme / Invoice Type (India-specific)
  gstScheme?: GSTScheme;
  // Extra fields for scheme-specific data
  lutBondReference?: string;
  sezUnitDeveloper?: string;
  compositionLevy?: number;
}

export interface TaxSettings {
  country: string;
  taxRate: number;
  gstin?: string;
  gstType?: GSTType;
  stateCode?: string;
}

export interface NotificationSettings {
  lowStockAlert: boolean;
  overdueInvoiceAlert: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  businessName?: string;
}

export interface GSTTransaction {
  id: bigint;
  owner: string;
  invoiceId: bigint;
  hsnSacCode: string;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  transactionType: TransactionType;
}

export interface GSTReturn {
  id: bigint;
  owner: string;
  period: string;
  returnType: GSTRType;
  status: GSTFilingStatus;
  filingDate?: bigint;
  totalLiability: number;
  inputCredit: number;
  netPayable: number;
}

export interface Deduction {
  id: bigint;
  owner: string;
  section: string;
  description: string;
  amount: number;
  date: bigint;
}

export interface DeductionSummary {
  totalAmount: number;
  sectionBreakdown: [string, number][];
}

export interface GSTSummary {
  totalLiability: number;
  inputCredit: number;
  netPayable: number;
}

export interface CashFlowSummary {
  daily: [bigint, number][];
  monthly: [string, number][];
  quarterly: [string, number][];
  annual: [string, number][];
}

export interface DebitCreditNote {
  id: bigint;
  owner: string;
  type: DebitCreditNoteType;
  linkedInvoiceId: bigint;
  amount: number;
  reason: string;
  date: bigint;
  qrCode?: string;
}

export interface ComparativeAnalysis {
  salesComparison: [string, number][];
  purchaseComparison: [string, number][];
  incomeComparison: [string, number][];
  expenseComparison: [string, number][];
}

export interface CAContactInfo {
  name: string;
  firmName: string;
  phone: string;
  email: string;
}

export interface CAMessage {
  sender: string;
  recipient: string;
  message: string;
  timestamp: bigint;
}

export interface CAConsultation {
  id: bigint;
  admin: string;
  client: string;
  caContactInfo: CAContactInfo;
  consultationFees: number;
  sharedDocuments: Uint8Array[];
  messages: CAMessage[];
  lastUpdated: bigint;
}

export interface LedgerTransaction {
  id: bigint;
  accountId: bigint;
  owner: string;
  transactionType: string;
  amount: number;
  date: bigint;
  description: string;
}

export interface LedgerAccount {
  id: bigint;
  owner: string;
  name: string;
  accountType: string;
  balance: number;
  transactions: LedgerTransaction[];
}

export interface JournalEntryLine {
  accountId: bigint;
  accountName: string;
  debit: number;
  credit: number;
}

export interface JournalEntry {
  id: bigint;
  owner: string;
  date: bigint;
  description: string;
  entries: JournalEntryLine[];
  associatedTransactionId?: bigint;
}

export interface BankStatementEntry {
  id: bigint;
  owner: string;
  date: bigint;
  description: string;
  amount: number;
  balance: number;
}

export interface MatchedTransaction {
  bankEntry: BankStatementEntry;
  internalTransaction: Transaction;
}

export interface ReconciliationResult {
  id: bigint;
  owner: string;
  matchedTransactions: MatchedTransaction[];
  unmatchedBankEntries: BankStatementEntry[];
  unmatchedInternalTransactions: Transaction[];
  reconciliationDate: bigint;
  status: ReconciliationStatus;
}

export interface TDSTransaction {
  id: bigint;
  owner: string;
  transactionId: bigint;
  tdsRate: number;
  tdsAmount: number;
  panNumber: string;
  certificateNumber?: string;
  certificateDate?: bigint;
  date: bigint;
}

export interface TDSConfiguration {
  id: bigint;
  owner: string;
  transactionType: string;
  amountThreshold: number;
  tdsRate: number;
}

export interface TCSRecord {
  id: bigint;
  owner: string;
  transactionId: bigint;
  tcsRate: number;
  tcsAmount: number;
  tanNumber: string;
  certificateNumber?: string;
  certificateDate?: bigint;
  date: bigint;
}

export interface TCSConfiguration {
  id: bigint;
  owner: string;
  transactionType: string;
  amountThreshold: number;
  tcsRate: number;
}

export interface DirectExpense {
  id: bigint;
  name: string;
  amount: number;
  date: bigint;
}

export interface TradingAccount {
  id: bigint;
  owner: string;
  openingStock: number;
  purchases: number;
  directExpenses: DirectExpense[];
  totalDirectExpenses: number;
  totalCostOfGoodsSold: number;
  closingStock: number;
  sales: number;
  grossProfit: number;
  date: bigint;
}

export interface OperatingExpense {
  id: bigint;
  name: string;
  amount: number;
  date: bigint;
}

export interface Income {
  id: bigint;
  name: string;
  amount: number;
  date: bigint;
}

export interface ProfitAndLossStatement {
  id: bigint;
  owner: string;
  grossProfit: number;
  openingStock: number;
  closingStock: number;
  purchases: number;
  directExpenses: DirectExpense[];
  totalDirectExpenses: number;
  otherIncome: Income[];
  totalOtherIncome: number;
  operatingExpenses: OperatingExpense[];
  totalOperatingExpenses: number;
  administrativeExpenses: OperatingExpense[];
  totalAdministrativeExpenses: number;
  financialExpenses: OperatingExpense[];
  totalFinancialExpenses: number;
  depreciation: number;
  netProfit: number;
  date: bigint;
}

export interface BalanceSheetAsset {
  id: bigint;
  name: string;
  amount: number;
  assetType: AssetType;
  date: bigint;
}

export interface BalanceSheetLiability {
  id: bigint;
  name: string;
  amount: number;
  liabilityType: LiabilityType;
  date: bigint;
}

export interface BalanceSheet {
  id: bigint;
  owner: string;
  assets: BalanceSheetAsset[];
  liabilities: BalanceSheetLiability[];
  totalAssets: number;
  totalLiabilitiesAndEquity: number;
  equity: number;
  debtEquityRatio: number;
  currentRatio: number;
  workingCapital: number;
  date: bigint;
}

export interface BillingRecord {
  id: bigint;
  clientName: string;
  serviceType: string;
  amount: number;
  paymentStatus: string;
  date: bigint;
}

export interface CharteredAccountantProfile {
  id: bigint;
  name: string;
  firmName: string;
  contactDetails: string;
  consultationFees: number;
  specialization: string;
  availability: string;
  billingHistory: BillingRecord[];
}

export interface DepreciationParameters {
  standard: DepreciationStandard;
  rate: number;
  method: DepreciationMethod;
  usefulLife: bigint;
  residualValue: number;
}

export interface Asset {
  id: bigint;
  owner: string;
  description: string;
  cost: number;
  acquisitionDate: bigint;
  depreciationParameters: DepreciationParameters[];
  currentValue: number;
}

export interface DepreciationRecord {
  id: bigint;
  assetId: bigint;
  owner: string;
  standard: DepreciationStandard;
  year: bigint;
  depreciationAmount: number;
  accumulatedDepreciation: number;
  openingValue: number;
  closingValue: number;
}

export interface ComparativeDepreciation {
  assetId: bigint;
  assetName: string;
  cost: number;
  year: bigint;
  incomeTaxActDepreciation: DepreciationRecord;
  accountingStandardDepreciation: DepreciationRecord;
}

// Tax Rate Management
export type TaxRateType = 'GST' | 'VAT' | 'IncomeTax' | 'Custom';

export interface TaxRate {
  id: string;
  country: string;
  countryCode: string;
  taxType: TaxRateType;
  rateName: string;
  percentage: number;
  isDefault: boolean;
  isPredefined: boolean;
  description?: string;
}
