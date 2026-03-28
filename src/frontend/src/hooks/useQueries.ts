import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { idStr, lsGet, lsGetOne, lsSet, newId } from "../lib/storage";
import type {
  BillingRecord,
  CharteredAccountantProfile,
  JournalEntry,
  LedgerAccount,
  Product,
  ProfitAndLossStatement,
  TradingAccount,
  Transaction,
  UserProfile,
} from "../types";
import { useActor } from "./useActor";

// Type definitions for placeholder features
export type EnhancedProduct = Product;
export type ProductLocation = {
  locationId: string;
  locationName: string;
  quantity: bigint;
};
export interface DepreciationAsset {
  id: string;
  name: string;
  assetType: string;
  acquisitionCost: number;
  acquisitionDate: number;
  residualValue: number;
  usefulLife: number;
  depreciationMethod: "slm" | "wdv";
  depreciationRate: number;
  bookValue: number;
  accumulatedDepreciation: number;
  lastCalculationDate: number;
}

export interface CAConsultation {
  id: string;
  admin: string;
  client: string;
  messages: any[];
  lastUpdated: number;
}

// ---------------------------------------------------------------------------
// Journal entry auto-generation helper
// ---------------------------------------------------------------------------
function generateJournalEntries(transaction: any): void {
  try {
    const existing = lsGet<any>("journalEntries");
    // Remove any old journal entry linked to this transaction
    const filtered = existing.filter(
      (je: any) => idStr(je.associatedTransactionId) !== idStr(transaction.id),
    );

    const amount = Number(transaction.amount) || 0;
    const type = transaction.transactionType;
    const desc = transaction.description || "Journal entry";

    let entries: { accountName: string; debit: number; credit: number }[] = [];

    if (type === "sale" || type === "income") {
      entries = [
        { accountName: "Accounts Receivable", debit: amount, credit: 0 },
        { accountName: "Sales Revenue", debit: 0, credit: amount },
      ];
    } else if (type === "purchase" || type === "expense") {
      entries = [
        { accountName: "Expenses", debit: amount, credit: 0 },
        { accountName: "Accounts Payable", debit: 0, credit: amount },
      ];
    } else if (type === "cash") {
      entries = [
        { accountName: "Cash", debit: amount, credit: 0 },
        { accountName: "Capital", debit: 0, credit: amount },
      ];
    } else {
      entries = [
        { accountName: "Miscellaneous Debit", debit: amount, credit: 0 },
        { accountName: "Miscellaneous Credit", debit: 0, credit: amount },
      ];
    }

    const newEntry = {
      id: newId(),
      owner: transaction.owner || "local",
      date: transaction.date || Date.now(),
      description: desc,
      entries,
      associatedTransactionId: idStr(transaction.id),
    };

    filtered.push(newEntry);
    lsSet("journalEntries", filtered);
  } catch (e) {
    console.error("[generateJournalEntries] Failed:", e);
  }
}

// ---------------------------------------------------------------------------
// Transaction hooks
// ---------------------------------------------------------------------------
export function useGetAllTransactions() {
  const { actor, isFetching } = useActor();

  return useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: async () => {
      return lsGet<Transaction>("transactions") as Transaction[];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      transactionType: string;
      date?: bigint;
      category: string;
      amount: number;
      description: string;
      associatedParty?: string | null;
      isCash: boolean;
      referenceId?: bigint | null;
    }) => {
      if (!actor) throw new Error("Actor not available");

      const transactions = lsGet<any>("transactions");
      const id = newId();
      const newTransaction = {
        ...data,
        id,
        owner: "local",
        date: data.date !== undefined ? Number(data.date) : Date.now(),
        associatedParty: data.associatedParty ?? null,
        referenceId: data.referenceId ?? null,
      };
      transactions.push(newTransaction);
      lsSet("transactions", transactions);

      // Auto-generate journal entry
      generateJournalEntries(newTransaction);

      return newTransaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["journalEntries"] });
      queryClient.invalidateQueries({ queryKey: ["ledgerAccounts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardMetrics"] });
    },
  });
}

export const useAddTransaction = useCreateTransaction;

export function useUpdateTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: bigint | string;
      transactionType: string;
      date: bigint | number;
      category: string;
      amount: number;
      description: string;
      associatedParty?: string | null;
      isCash: boolean;
      referenceId?: bigint | null;
    }) => {
      if (!actor) throw new Error("Actor not available");

      const transactions = lsGet<any>("transactions");
      const targetId = idStr(data.id);
      const updated = transactions.map((t: any) =>
        idStr(t.id) === targetId
          ? {
              ...t,
              ...data,
              id: targetId,
              date:
                typeof data.date === "bigint" ? Number(data.date) : data.date,
              associatedParty: data.associatedParty ?? null,
              referenceId: data.referenceId ?? null,
            }
          : t,
      );
      lsSet("transactions", updated);

      // Regenerate journal entry for this transaction
      const updatedTx = updated.find((t: any) => idStr(t.id) === targetId);
      if (updatedTx) generateJournalEntries(updatedTx);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["journalEntries"] });
      queryClient.invalidateQueries({ queryKey: ["ledgerAccounts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardMetrics"] });
    },
  });
}

export function useDeleteTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint | string) => {
      if (!actor) throw new Error("Actor not available");

      const targetId = idStr(id);
      const transactions = lsGet<any>("transactions");
      const filtered = transactions.filter(
        (t: any) => idStr(t.id) !== targetId,
      );
      lsSet("transactions", filtered);

      // Remove linked journal entries
      const journalEntries = lsGet<any>("journalEntries");
      const filteredJE = journalEntries.filter(
        (je: any) => idStr(je.associatedTransactionId) !== targetId,
      );
      lsSet("journalEntries", filteredJE);

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["journalEntries"] });
      queryClient.invalidateQueries({ queryKey: ["ledgerAccounts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardMetrics"] });
    },
  });
}

export function useCreateJournalEntryFromTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionId: bigint | string) => {
      const targetId = idStr(transactionId);
      const transactions = lsGet<any>("transactions");
      const tx = transactions.find((t: any) => idStr(t.id) === targetId);
      if (tx) generateJournalEntries(tx);
      return transactionId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journalEntries"] });
      queryClient.invalidateQueries({ queryKey: ["ledgerAccounts"] });
    },
  });
}

// ---------------------------------------------------------------------------
// Product hooks
// ---------------------------------------------------------------------------
export function useGetAllProducts() {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      return lsGet<Product>("products") as Product[];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      if (!actor) throw new Error("Actor not available");

      const products = lsGet<any>("products");
      const newProduct = { ...data, id: newId(), owner: "local" };
      products.push(newProduct);
      lsSet("products", products);
      return newProduct;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      if (!actor) throw new Error("Actor not available");

      const products = lsGet<any>("products");
      const targetId = idStr(data.id);
      const updated = products.map((p: any) =>
        idStr(p.id) === targetId ? { ...p, ...data, id: targetId } : p,
      );
      lsSet("products", updated);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateStockLevel() {
  return useUpdateProduct();
}

// ---------------------------------------------------------------------------
// Journal Entry hooks
// ---------------------------------------------------------------------------
export function useGetJournalEntries() {
  const { actor, isFetching } = useActor();

  return useQuery<JournalEntry[]>({
    queryKey: ["journalEntries"],
    queryFn: async () => {
      return lsGet<JournalEntry>("journalEntries") as JournalEntry[];
    },
    enabled: !!actor && !isFetching,
  });
}

export const useGetAllJournalEntries = useGetJournalEntries;

// ---------------------------------------------------------------------------
// Ledger Account hooks
// ---------------------------------------------------------------------------
export function useGetLedgerAccounts() {
  const { actor, isFetching } = useActor();

  return useQuery<LedgerAccount[]>({
    queryKey: ["ledgerAccounts"],
    queryFn: async () => {
      return lsGet<LedgerAccount>("ledgerAccounts") as LedgerAccount[];
    },
    enabled: !!actor && !isFetching,
  });
}

// ---------------------------------------------------------------------------
// User Profile hooks
// ---------------------------------------------------------------------------
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return lsGetOne<UserProfile>("userProfile");
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      lsSet("userProfile", profile);
      return profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

// Re-export backend-backed tax settings hooks
export {
  useGetTaxSettingForCountry as useGetTaxSettings,
  useSaveTaxSettingForCountry as useSetTaxSettings,
} from "./useTaxSettings";

export function useGetNotificationSettings() {
  return useQuery({
    queryKey: ["notificationSettings"],
    queryFn: () => {
      return (
        lsGetOne<any>("notificationSettings") ?? {
          lowStockAlert: true,
          overdueInvoiceAlert: true,
        }
      );
    },
  });
}

export function useSetNotificationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: any) => {
      lsSet("notificationSettings", settings);
      return settings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificationSettings"] });
    },
  });
}

// ---------------------------------------------------------------------------
// Invoice hooks
// ---------------------------------------------------------------------------
export function useGetAllInvoices() {
  return useQuery<any[]>({
    queryKey: ["invoices"],
    queryFn: () => lsGet<any>("invoices"),
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (invoice: any) => {
      const invoices = lsGet<any>("invoices");
      const newInvoice = { ...invoice, id: invoice.id ?? newId() };
      invoices.push(newInvoice);
      lsSet("invoices", invoices);
      return newInvoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardMetrics"] });
    },
  });
}

export function useUpdateInvoiceStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: any) => {
      const invoices = lsGet<any>("invoices");
      const updated = invoices.map((inv: any) =>
        idStr(inv.id) === idStr(id) ? { ...inv, status } : inv,
      );
      lsSet("invoices", updated);
      return { id, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardMetrics"] });
    },
  });
}

export function useGetNextInvoiceNumber() {
  return useQuery({
    queryKey: ["nextInvoiceNumber"],
    queryFn: () => {
      const invoices = lsGet<any>("invoices");
      const year = new Date().getFullYear();
      const count = invoices.filter((inv: any) =>
        inv.invoiceNumber?.includes(year.toString()),
      ).length;
      return `INV-${year}-${String(count + 1).padStart(3, "0")}`;
    },
  });
}

// ---------------------------------------------------------------------------
// Dashboard Metrics - computed from real data
// ---------------------------------------------------------------------------
export function useGetDashboardMetrics() {
  return useQuery({
    queryKey: ["dashboardMetrics"],
    queryFn: () => {
      const transactions = lsGet<any>("transactions");
      const invoices = lsGet<any>("invoices");

      let totalSales = 0;
      let totalExpenses = 0;
      let cashInflow = 0;

      for (const t of transactions) {
        const amount = Number(t.amount) || 0;
        if (t.transactionType === "sale" || t.transactionType === "income") {
          totalSales += amount;
          cashInflow += amount;
        } else if (
          t.transactionType === "purchase" ||
          t.transactionType === "expense"
        ) {
          totalExpenses += amount;
        }
      }

      const outstandingReceivables = invoices
        .filter(
          (inv: any) => inv.status === "unpaid" || inv.status === "overdue",
        )
        .reduce(
          (sum: number, inv: any) =>
            sum + (Number(inv.totalAmount) || Number(inv.amount) || 0),
          0,
        );

      const netProfit = totalSales - totalExpenses;

      return {
        totalSales,
        totalExpenses,
        netProfit,
        currentStockValue: 0,
        outstandingReceivables,
        cashInflow,
      };
    },
  });
}

export function useGetLowStockProducts() {
  return useQuery<Product[]>({
    queryKey: ["lowStockProducts"],
    queryFn: () => {
      const products = lsGet<any>("products");
      return products.filter(
        (p: any) => Number(p.stockLevel) <= Number(p.lowStockThreshold ?? 0),
      ) as Product[];
    },
  });
}

export function useGetOverdueInvoices() {
  return useQuery<any[]>({
    queryKey: ["overdueInvoices"],
    queryFn: () => {
      const invoices = lsGet<any>("invoices");
      return invoices.filter((inv: any) => inv.status === "overdue");
    },
  });
}

export function useGetAllConsultations() {
  return useQuery<CAConsultation[]>({
    queryKey: ["consultations"],
    queryFn: () => lsGet<CAConsultation>("consultations"),
  });
}

export function useAddConsultationMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
    },
  });
}

export function useAddConsultationDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
    },
  });
}

export function useUpdateCAContactInfo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
    },
  });
}

export function useUpdateConsultationFees() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
    },
  });
}

export function useGetAllCAProfiles() {
  return useQuery<CharteredAccountantProfile[]>({
    queryKey: ["caProfiles"],
    queryFn: () => lsGet<CharteredAccountantProfile>("caProfiles"),
  });
}

export function useCreateCAProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const profiles = lsGet<any>("caProfiles");
      const newProfile = { ...data, id: newId() };
      profiles.push(newProfile);
      lsSet("caProfiles", profiles);
      return newProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caProfiles"] });
    },
  });
}

export function useUpdateCAProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const profiles = lsGet<any>("caProfiles");
      const targetId = idStr(data.id);
      const updated = profiles.map((p: any) =>
        idStr(p.id) === targetId ? { ...p, ...data, id: targetId } : p,
      );
      lsSet("caProfiles", updated);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caProfiles"] });
    },
  });
}

export function useDeleteCAProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: any) => {
      const profiles = lsGet<any>("caProfiles");
      const filtered = profiles.filter((p: any) => idStr(p.id) !== idStr(id));
      lsSet("caProfiles", filtered);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caProfiles"] });
    },
  });
}

export function useSearchCAProfiles() {
  return useMutation<CharteredAccountantProfile[], Error, any>({
    mutationFn: async (_query: any) => {
      return [];
    },
  });
}

export function useGetAllDepreciationAssets() {
  return useQuery<DepreciationAsset[]>({
    queryKey: ["depreciationAssets"],
    queryFn: () => lsGet<DepreciationAsset>("depreciationAssets"),
  });
}

export function useCreateDepreciationAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const assets = lsGet<any>("depreciationAssets");
      const newAsset = { ...data, id: newId() };
      assets.push(newAsset);
      lsSet("depreciationAssets", assets);
      return newAsset;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["depreciationAssets"] });
    },
  });
}

export const useAddDepreciationAsset = useCreateDepreciationAsset;

export function useUpdateDepreciationAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const assets = lsGet<any>("depreciationAssets");
      const targetId = idStr(data.id);
      const updated = assets.map((a: any) =>
        idStr(a.id) === targetId ? { ...a, ...data, id: targetId } : a,
      );
      lsSet("depreciationAssets", updated);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["depreciationAssets"] });
    },
  });
}

export function useDeleteDepreciationAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: any) => {
      const assets = lsGet<any>("depreciationAssets");
      const filtered = assets.filter((a: any) => idStr(a.id) !== idStr(id));
      lsSet("depreciationAssets", filtered);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["depreciationAssets"] });
    },
  });
}

export function useCalculateDepreciation() {
  return useMutation({
    mutationFn: async (data: any) => {
      return data;
    },
  });
}

// ---------------------------------------------------------------------------
// Trading Account hooks
// ---------------------------------------------------------------------------
export function useGetAllTradingAccounts() {
  return useQuery<TradingAccount[]>({
    queryKey: ["tradingAccounts"],
    queryFn: () => lsGet<TradingAccount>("tradingAccounts"),
  });
}

export function useCreateTradingAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const accounts = lsGet<any>("tradingAccounts");
      const newAccount = { ...data, id: newId() };
      accounts.push(newAccount);
      lsSet("tradingAccounts", accounts);
      return newAccount;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tradingAccounts"] });
    },
  });
}

// ---------------------------------------------------------------------------
// Profit and Loss Statement hooks
// ---------------------------------------------------------------------------
export function useGetAllProfitAndLossStatements() {
  return useQuery<ProfitAndLossStatement[]>({
    queryKey: ["profitAndLossStatements"],
    queryFn: () => lsGet<ProfitAndLossStatement>("profitAndLossStatements"),
  });
}

export function useGenerateProfitAndLossStatement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const statements = lsGet<any>("profitAndLossStatements");
      const newStatement = { ...data, id: newId() };
      statements.push(newStatement);
      lsSet("profitAndLossStatements", statements);
      return newStatement;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profitAndLossStatements"] });
    },
  });
}

// ---------------------------------------------------------------------------
// Balance Sheet hooks
// ---------------------------------------------------------------------------
export function useGetAllBalanceSheets() {
  return useQuery<any[]>({
    queryKey: ["balanceSheets"],
    queryFn: () => lsGet<any>("balanceSheets"),
  });
}

// Unused imports kept to avoid breaking other files that import from here
export type { BillingRecord, LedgerAccount };
