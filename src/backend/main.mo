import Float "mo:core/Float";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Storage "blob-storage/Storage";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";

actor {
  include MixinStorage();

  // TYPES
  public type TransactionType = { #sale; #purchase; #income; #expense; #cash };
  public type CustomerGSTInfo = { gstin : Text; stateCode : Text; taxType : GSTType };
  public type CompareTransaction = {
    id : Nat;
    owner : Principal;
    transactionType : TransactionType;
    date : Time.Time;
    category : Text;
    amount : Float;
    description : Text;
    associatedParty : ?Text;
    isCash : Bool;
    referenceId : ?Nat;
  };

  public type Transaction = {
    id : Nat;
    owner : Principal;
    transactionType : TransactionType;
    date : Time.Time;
    category : Text;
    amount : Float;
    description : Text;
    associatedParty : ?Text;
    isCash : Bool;
    referenceId : ?Nat;
  };

  public type Product = {
    id : Nat;
    owner : Principal;
    name : Text;
    description : Text;
    price : Float;
    sku : Text;
    stockLevel : Nat;
    lowStockThreshold : Nat;
  };

  public type CompareProduct = {
    id : Nat;
    owner : Principal;
    name : Text;
    description : Text;
    price : Float;
    sku : Text;
    stockLevel : Nat;
    lowStockThreshold : Nat;
  };

  public type InvoiceStatus = { #paid; #unpaid; #overdue };

  public type CompareInvoice = {
    id : Nat;
    owner : Principal;
    invoiceNumber : Text;
    businessName : Text;
    businessLogo : ?Storage.ExternalBlob;
    businessContact : Text;
    businessAddress : Text;
    clientName : Text;
    clientContact : Text;
    clientAddress : Text;
    issuedDate : Time.Time;
    dueDate : Time.Time;
    items : [InvoiceItem];
    subtotal : Float;
    totalTax : Float;
    totalDiscount : Float;
    totalAmount : Float;
    status : InvoiceStatus;
    paymentTerms : ?Text;
    notes : ?Text;
    gstin : ?Text;
    hsnSacCode : ?Text;
    cgst : Float;
    sgst : Float;
    igst : Float;
    qrCode : ?Text;
    customerGSTInfo : ?CustomerGSTInfo;
    version : Nat;
    previousAmount : Float;
    createdBy : Text;
    lastModifiedBy : Text;
  };

  public type InvoiceItem = {
    productId : Nat;
    description : Text;
    quantity : Nat;
    unitPrice : Float;
    total : Float;
    taxRate : Float;
    discount : Float;
  };

  public type Invoice = {
    id : Nat;
    owner : Principal;
    invoiceNumber : Text;
    businessName : Text;
    businessLogo : ?Storage.ExternalBlob;
    businessContact : Text;
    businessAddress : Text;
    clientName : Text;
    clientContact : Text;
    clientAddress : Text;
    issuedDate : Time.Time;
    dueDate : Time.Time;
    items : [InvoiceItem];
    subtotal : Float;
    totalTax : Float;
    totalDiscount : Float;
    totalAmount : Float;
    status : InvoiceStatus;
    paymentTerms : ?Text;
    notes : ?Text;
    gstin : ?Text;
    hsnSacCode : ?Text;
    cgst : Float;
    sgst : Float;
    igst : Float;
    qrCode : ?Text;
    customerGSTInfo : ?CustomerGSTInfo;
    website : ?Text;
    qrCodeImage : ?Storage.ExternalBlob;
  };

  public type TaxSettings = {
    country : Text;
    taxRate : Float;
    gstin : ?Text;
    gstType : ?GSTType;
    stateCode : ?Text;
  };

  public type GSTType = { #regular; #composition };

  public type GSTTransaction = {
    id : Nat;
    owner : Principal;
    invoiceId : Nat;
    hsnSacCode : Text;
    cgst : Float;
    sgst : Float;
    igst : Float;
    totalTax : Float;
    transactionType : TransactionType;
  };

  public type GSTReturn = {
    id : Nat;
    owner : Principal;
    period : Text;
    returnType : GSTRType;
    status : GSTFilingStatus;
    filingDate : ?Time.Time;
    totalLiability : Float;
    inputCredit : Float;
    netPayable : Float;
  };

  public type GSTRType = { #gstr1; #gstr2b; #gstr3b };
  public type GSTFilingStatus = { #draft; #submitted; #filed };
  public type NotificationSettings = { lowStockAlert : Bool; overdueInvoiceAlert : Bool };
  public type UserProfile = { name : Text; email : Text; businessName : ?Text };
  public type Deduction = {
    id : Nat;
    owner : Principal;
    section : Text;
    description : Text;
    amount : Float;
    date : Time.Time;
  };

  public type DeductionSummary = {
    totalAmount : Float;
    sectionBreakdown : [(Text, Float)];
  };

  public type GSTSummary = {
    totalLiability : Float;
    inputCredit : Float;
    netPayable : Float;
  };

  public type CashFlowSummary = {
    daily : [(Time.Time, Float)];
    monthly : [(Text, Float)];
    quarterly : [(Text, Float)];
    annual : [(Text, Float)];
  };

  public type DebitCreditNote = {
    id : Nat;
    owner : Principal;
    type_ : DebitCreditNoteType;
    linkedInvoiceId : Nat;
    amount : Float;
    reason : Text;
    date : Time.Time;
    qrCode : ?Text;
  };

  public type DebitCreditNoteType = { #debit; #credit };
  public type ComparativeAnalysis = {
    salesComparison : [(Text, Float)];
    purchaseComparison : [(Text, Float)];
    incomeComparison : [(Text, Float)];
    expenseComparison : [(Text, Float)];
  };

  public type CAContactInfo = { name : Text; firmName : Text; phone : Text; email : Text };
  public type CAConsultation = {
    id : Nat;
    admin : Principal;
    client : Principal;
    caContactInfo : CAContactInfo;
    consultationFees : Float;
    sharedDocuments : [Storage.ExternalBlob];
    messages : [CAMessage];
    lastUpdated : Time.Time;
  };

  public type CAMessage = {
    sender : Principal;
    recipient : Principal;
    message : Text;
    timestamp : Time.Time;
  };

  public type LedgerAccount = {
    id : Nat;
    owner : Principal;
    name : Text;
    accountType : Text;
    balance : Float;
    transactions : [LedgerTransaction];
  };

  public type LedgerTransaction = {
    id : Nat;
    accountId : Nat;
    owner : Principal;
    transactionType : Text;
    amount : Float;
    date : Time.Time;
    description : Text;
  };

  public type JournalEntry = {
    id : Nat;
    owner : Principal;
    date : Time.Time;
    description : Text;
    entries : [JournalEntryLine];
    associatedTransactionId : ?Nat;
  };

  public type JournalEntryLine = {
    accountId : Nat;
    accountName : Text;
    debit : Float;
    credit : Float;
  };

  public type BankStatementEntry = {
    id : Nat;
    owner : Principal;
    date : Time.Time;
    description : Text;
    amount : Float;
    balance : Float;
  };

  public type ReconciliationResult = {
    id : Nat;
    owner : Principal;
    matchedTransactions : [MatchedTransaction];
    unmatchedBankEntries : [BankStatementEntry];
    unmatchedInternalTransactions : [Transaction];
    reconciliationDate : Time.Time;
    status : ReconciliationStatus;
  };

  public type MatchedTransaction = {
    bankEntry : BankStatementEntry;
    internalTransaction : Transaction;
  };

  public type ReconciliationStatus = { #matched; #unmatched; #pending };

  public type TDSTransaction = {
    id : Nat;
    owner : Principal;
    transactionId : Nat;
    tdsRate : Float;
    tdsAmount : Float;
    panNumber : Text;
    certificateNumber : ?Text;
    certificateDate : ?Time.Time;
    date : Time.Time;
  };

  public type TDSConfiguration = {
    id : Nat;
    owner : Principal;
    transactionType : Text;
    amountThreshold : Float;
    tdsRate : Float;
  };

  public type TCSRecord = {
    id : Nat;
    owner : Principal;
    transactionId : Nat;
    tcsRate : Float;
    tcsAmount : Float;
    tanNumber : Text;
    certificateNumber : ?Text;
    certificateDate : ?Time.Time;
    date : Time.Time;
  };

  public type TCSConfiguration = {
    id : Nat;
    owner : Principal;
    transactionType : Text;
    amountThreshold : Float;
    tcsRate : Float;
  };

  public type DirectExpense = {
    id : Nat;
    name : Text;
    amount : Float;
    date : Time.Time;
  };

  public type TradingAccount = {
    id : Nat;
    owner : Principal;
    openingStock : Float;
    purchases : Float;
    directExpenses : [DirectExpense];
    totalDirectExpenses : Float;
    totalCostOfGoodsSold : Float;
    closingStock : Float;
    sales : Float;
    grossProfit : Float;
    date : Time.Time;
  };

  public type OperatingExpense = {
    id : Nat;
    name : Text;
    amount : Float;
    date : Time.Time;
  };

  public type Income = {
    id : Nat;
    name : Text;
    amount : Float;
    date : Time.Time;
  };

  public type ProfitAndLossStatement = {
    id : Nat;
    owner : Principal;
    grossProfit : Float;
    openingStock : Float;
    closingStock : Float;
    purchases : Float;
    directExpenses : [DirectExpense];
    totalDirectExpenses : Float;
    otherIncome : [Income];
    totalOtherIncome : Float;
    operatingExpenses : [OperatingExpense];
    totalOperatingExpenses : Float;
    administrativeExpenses : [OperatingExpense];
    totalAdministrativeExpenses : Float;
    financialExpenses : [OperatingExpense];
    totalFinancialExpenses : Float;
    depreciation : Float;
    netProfit : Float;
    date : Time.Time;
  };

  public type BalanceSheet = {
    id : Nat;
    owner : Principal;
    assets : [BalanceSheetAsset];
    liabilities : [BalanceSheetLiability];
    totalAssets : Float;
    totalLiabilitiesAndEquity : Float;
    equity : Float;
    debtEquityRatio : Float;
    currentRatio : Float;
    workingCapital : Float;
    date : Time.Time;
  };

  public type BalanceSheetAsset = {
    id : Nat;
    name : Text;
    amount : Float;
    assetType : AssetType;
    date : Time.Time;
  };

  public type AssetType = { #fixed; #current };

  public type BalanceSheetLiability = {
    id : Nat;
    name : Text;
    amount : Float;
    liabilityType : LiabilityType;
    date : Time.Time;
  };

  public type LiabilityType = { #capital; #current };
  public type CharteredAccountantProfile = {
    id : Nat;
    name : Text;
    firmName : Text;
    contactDetails : Text;
    consultationFees : Float;
    specialization : Text;
    availability : Text;
    billingHistory : [BillingRecord];
  };

  public type BillingRecord = {
    id : Nat;
    clientName : Text;
    serviceType : Text;
    amount : Float;
    paymentStatus : Text;
    date : Time.Time;
  };

  public type FinancialCalculatorType = {
    #emi;
    #irr;
    #debtSettlement;
    #statisticalInsights;
  };

  public type EMIInput = {
    principal : Float;
    rate : Float;
    tenure : Nat;
  };

  public type EMICalculation = {
    id : Nat;
    owner : Principal;
    input : EMIInput;
    monthlyInstallment : Float;
    totalInterest : Float;
    repaymentSchedule : [EMIScheduleItem];
    prepaymentAnalysis : ?PrepaymentAnalysis;
    date : Time.Time;
  };

  public type EMIScheduleItem = {
    month : Nat;
    principalPaid : Float;
    interestPaid : Float;
    remainingBalance : Float;
  };

  public type PrepaymentAnalysis = {
    prepaymentAmount : Float;
    savings : Float;
    newRepaymentSchedule : [EMIScheduleItem];
  };

  public type IRRInput = { cashFlows : [Float]; discountRate : Float };

  public type IRRCalculation = {
    id : Nat;
    owner : Principal;
    input : IRRInput;
    calculatedIRR : Float;
    npv : Float;
    scenarioAnalysis : [ScenarioAnalysis];
    date : Time.Time;
  };

  public type ScenarioAnalysis = {
    name : Text;
    cashFlows : [Float];
    calculatedIRR : Float;
    npv : Float;
  };

  public type DebtSettlementInput = {
    loanAmount : Float;
    interestRate : Float;
    tenure : Nat;
  };

  public type DebtSettlementCalculation = {
    id : Nat;
    owner : Principal;
    input : DebtSettlementInput;
    repaymentTimeline : Float;
    interestSavings : Float;
    consolidationAnalysis : [ConsolidationAnalysis];
    date : Time.Time;
  };

  public type ConsolidationAnalysis = {
    name : Text;
    combinedLoanAmount : Float;
    interestRate : Float;
    totalRepayment : Float;
    savings : Float;
  };

  public type StatisticalDashboardInput = { dataRange : Text };

  public type StatisticalDashboard = {
    id : Nat;
    owner : Principal;
    input : StatisticalDashboardInput;
    performanceGraphs : [PerformanceGraph];
    ratioAnalysis : [RatioAnalysis];
    paymentStatistics : [PaymentStatistic];
    date : Time.Time;
  };

  public type PerformanceGraph = {
    name : Text;
    dataPoints : [DataPoint];
  };

  public type DataPoint = { x : Float; y : Float };

  public type RatioAnalysis = {
    name : Text;
    value : Float;
  };

  public type PaymentStatistic = {
    name : Text;
    data : [PaymentData];
  };

  public type PaymentData = {
    month : Text;
    amount : Float;
  };

  public type FinancialCalculatorResult = {
    id : Nat;
    owner : Principal;
    calculatorType : FinancialCalculatorType;
    emiResult : ?EMICalculation;
    irrResult : ?IRRCalculation;
    debtSettlementResult : ?DebtSettlementCalculation;
    statisticalDashboardResult : ?StatisticalDashboard;
  };

  public type EMIResult = {
    monthlyInstallment : Float;
    totalInterest : Float;
    totalRepayment : Float;
    repaymentSchedule : [EMIScheduleItem];
  };

  public type IRRResult = {
    calculatedIRR : Float;
    npv : Float;
    cashFlowAnalysis : [Float];
  };

  public type DebtSettlementResult = {
    repaymentTimeline : Float;
    interestSavings : Float;
    consolidationAnalysis : [Text];
  };

  public type StatisticalInsights = {
    performanceGraphs : [Text];
    ratioAnalysis : [Text];
    paymentStatistics : [Text];
  };

  public type CalculatorInput = {
    emiInput : ?EMIInput;
    irrInput : ?IRRInput;
    debtSettlementInput : ?DebtSettlementInput;
    statisticalDashboardInput : ?StatisticalDashboardInput;
  };

  public type TransactionHistory = {
    id : Nat;
    transactionId : Nat;
    owner : Principal;
    transactionType : TransactionType;
    date : Time.Time;
    category : Text;
    amount : Float;
    description : Text;
    associatedParty : ?Text;
    isCash : Bool;
    referenceId : ?Nat;
    timestamp : Time.Time;
    reason : Text;
    previousAmount : Float;
  };

  public type IncomeHistory = {
    id : Nat;
    name : Text;
    amount : Float;
    date : Time.Time;
    timestamp : Time.Time;
    reason : Text;
    previousAmount : Float;
  };

  public type ExpenseHistory = {
    id : Nat;
    name : Text;
    amount : Float;
    date : Time.Time;
    timestamp : Time.Time;
    reason : Text;
    previousAmount : Float;
  };

  public type FinancialStatementData = {
    openingStock : Float;
    purchases : Float;
    directExpenses : [DirectExpense];
    totalDirectExpenses : Float;
    totalCostOfGoodsSold : Float;
    closingStock : Float;
    sales : Float;
    grossProfit : Float;
    otherIncome : [Income];
    totalOtherIncome : Float;
    operatingExpenses : [OperatingExpense];
    totalOperatingExpenses : Float;
    administrativeExpenses : [OperatingExpense];
    totalAdministrativeExpenses : Float;
    financialExpenses : [OperatingExpense];
    totalFinancialExpenses : Float;
    depreciation : Float;
    netProfit : Float;
    assets : [BalanceSheetAsset];
    liabilities : [BalanceSheetLiability];
    totalAssets : Float;
    totalLiabilitiesAndEquity : Float;
    equity : Float;
    debtEquityRatio : Float;
    currentRatio : Float;
    workingCapital : Float;
    date : Time.Time;
  };

  public type DepreciationMethod = { #slm; #wdv };
  public type DepreciationStandard = { #incomeTaxAct; #accountingStandard };
  public type DepreciationParameters = {
    standard : DepreciationStandard;
    rate : Float;
    method : DepreciationMethod;
    usefulLife : Nat;
    residualValue : Float;
  };

  public type Asset = {
    id : Nat;
    owner : Principal;
    description : Text;
    cost : Float;
    acquisitionDate : Time.Time;
    depreciationParameters : [DepreciationParameters];
    currentValue : Float;
  };

  public type DepreciationRecord = {
    id : Nat;
    assetId : Nat;
    owner : Principal;
    standard : DepreciationStandard;
    year : Nat;
    depreciationAmount : Float;
    accumulatedDepreciation : Float;
    openingValue : Float;
    closingValue : Float;
  };

  public type ComparativeDepreciation = {
    assetId : Nat;
    assetName : Text;
    cost : Float;
    year : Nat;
    incomeTaxActDepreciation : DepreciationRecord;
    accountingStandardDepreciation : DepreciationRecord;
  };

  public type UserLanguagePreference = {
    language : Text;
    lastUpdated : Time.Time;
  };

  public type TranslationEntry = {
    key : Text;
    language : Text;
    translation : Text;
    lastUpdated : Time.Time;
  };

  public type TranslationRequest = {
    key : Text;
    language : Text;
    sourceText : Text;
  };

  public type TranslationResponse = {
    key : Text;
    language : Text;
    translation : Text;
  };

  public type PersistedTranslation = {
    key : Text;
    language : Text;
    translatedText : Text;
    englishSourceText : Text;
    timestamp : Time.Time;
  };

  let transactions = Map.empty<Nat, Transaction>();
  let products = Map.empty<Nat, Product>();
  let invoices = Map.empty<Nat, Invoice>();
  let invoiceNumberToId = Map.empty<Text, Nat>();
  let gstTransactions = Map.empty<Nat, GSTTransaction>();
  let gstReturns = Map.empty<Nat, GSTReturn>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let userNotificationSettings = Map.empty<Principal, NotificationSettings>();
  let deductions = Map.empty<Nat, Deduction>();
  let debitCreditNotes = Map.empty<Nat, DebitCreditNote>();
  let clientAdminMappings = Map.empty<Principal, Principal>();
  let caConsultations = Map.empty<Nat, CAConsultation>();
  let ledgerAccounts = Map.empty<Nat, LedgerAccount>();
  let journalEntries = Map.empty<Nat, JournalEntry>();
  let bankStatements = Map.empty<Nat, BankStatementEntry>();
  let reconciliationResults = Map.empty<Nat, ReconciliationResult>();
  let tdsTransactions = Map.empty<Principal, Map.Map<Nat, TDSTransaction>>();
  let tdsConfigurations = Map.empty<Principal, Map.Map<Nat, TDSConfiguration>>();
  let tcsRecords = Map.empty<Principal, Map.Map<Nat, TCSRecord>>();
  let tcsConfigurations = Map.empty<Principal, Map.Map<Nat, TCSConfiguration>>();
  let tradingAccounts = Map.empty<Nat, TradingAccount>();
  let profitAndLossStatements = Map.empty<Nat, ProfitAndLossStatement>();
  let balanceSheets = Map.empty<Nat, BalanceSheet>();
  let caProfiles = Map.empty<Nat, CharteredAccountantProfile>();
  let financialCalculators = Map.empty<Nat, FinancialCalculatorResult>();
  let assets = Map.empty<Nat, Asset>();
  let depreciationRecords = Map.empty<Nat, DepreciationRecord>();
  let comparativeDepreciation = Map.empty<Nat, ComparativeDepreciation>();
  let userLanguagePreferences = Map.empty<Principal, UserLanguagePreference>();
  let translations = Map.empty<Text, TranslationEntry>();
  let persistedTranslations = Map.empty<Text, PersistedTranslation>();
  let userTaxSettings = Map.empty<Principal, Map.Map<Text, Float>>();

  let counterState = {
    var transaction = 1;
    var product = 1;
    var invoice = 1;
    var gstTransaction = 1;
    var gstReturn = 1;
    var deduction = 1;
    var debitCreditNote = 1;
    var consultation = 1;
    var ledgerAccount = 1;
    var journalEntry = 1;
    var bankStatement = 1;
    var reconciliation = 1;
    var tdsTransaction = 1;
    var tdsConfig = 1;
    var tcsRecord = 1;
    var tcsConfig = 1;
    var tradingAccount = 1;
    var profitAndLoss = 1;
    var balanceSheet = 1;
    var caProfile = 1;
    var financialCalculator = 1;
    var asset = 1;
    var depreciationRecord = 1;
    var comparativeDepreciation = 1;
    var translation = 1;
  };

  let invoiceCounter = { var currentYear = 0; var lastCounter = 0 };
  var taxSettings : ?TaxSettings = null;
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Stripe Integration State
  var stripeConfiguration : ?Stripe.StripeConfiguration = null;

  public query func isStripeConfigured() : async Bool {
    stripeConfiguration != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    stripeConfiguration := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfiguration) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save their profile");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func persistAutoGeneratedTranslation(key : Text, language : Text, translatedText : Text, englishSourceText : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can persist translations");
    };

    let timestamp = Time.now();

    let persistedTranslation : PersistedTranslation = {
      key;
      language;
      translatedText;
      englishSourceText;
      timestamp;
    };

    persistedTranslations.add(key # "_" # language, persistedTranslation);
  };

  public query func getPersistedTranslations() : async [PersistedTranslation] {
    let persistedTranslationsIter = persistedTranslations.values();
    persistedTranslationsIter.toArray();
  };

  public query func getTranslation(key : Text, language : Text) : async ?Text {
    switch (persistedTranslations.get(key # "_" # language)) {
      case (?persistedTranslation) { ?persistedTranslation.translatedText };
      case (null) { null };
    };
  };

  private func verifyOwnership(caller : Principal, owner : Principal) : Bool {
    if (caller == owner) {
      return true;
    };
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return true;
    };
    false;
  };
};
