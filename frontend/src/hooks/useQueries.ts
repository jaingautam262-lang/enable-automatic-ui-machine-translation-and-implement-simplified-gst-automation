import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Transaction, Product, JournalEntry, LedgerAccount, UserProfile, TradingAccount, ProfitAndLossStatement, CharteredAccountantProfile, BillingRecord } from '../types';

// Type definitions for placeholder features
export type EnhancedProduct = Product;
export type ProductLocation = { locationId: string; locationName: string; quantity: bigint };
export interface DepreciationAsset {
  id: bigint;
  name: string;
  assetType: string;
  acquisitionCost: number;
  acquisitionDate: bigint;
  residualValue: number;
  usefulLife: number;
  depreciationMethod: 'slm' | 'wdv';
  depreciationRate: number;
  bookValue: number;
  accumulatedDepreciation: number;
  lastCalculationDate: bigint;
}

export interface CAConsultation {
  id: bigint;
  admin: string;
  client: string;
  messages: any[];
  lastUpdated: bigint;
}

// Transaction hooks - localStorage based since backend methods don't exist
export function useGetAllTransactions() {
  const { actor, isFetching } = useActor();

  return useQuery<Transaction[]>({
    queryKey: ['transactions'],
    queryFn: async () => {
      // Use localStorage as backend methods don't exist
      const stored = localStorage.getItem('transactions');
      return stored ? JSON.parse(stored) : [];
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
      if (!actor) throw new Error('Actor not available');
      
      // Use localStorage as backend method doesn't exist
      const stored = localStorage.getItem('transactions');
      const transactions = stored ? JSON.parse(stored) : [];
      const newTransaction = {
        ...data,
        id: BigInt(Date.now()),
        owner: 'local',
        date: data.date || BigInt(Date.now()),
      };
      transactions.push(newTransaction);
      localStorage.setItem('transactions', JSON.stringify(transactions));
      return newTransaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
      queryClient.invalidateQueries({ queryKey: ['ledgerAccounts'] });
    },
  });
}

export const useAddTransaction = useCreateTransaction;

export function useUpdateTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      transactionType: string;
      date: bigint;
      category: string;
      amount: number;
      description: string;
      associatedParty?: string | null;
      isCash: boolean;
      referenceId?: bigint | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      
      // Use localStorage as backend method doesn't exist
      const stored = localStorage.getItem('transactions');
      const transactions = stored ? JSON.parse(stored) : [];
      const updated = transactions.map((t: any) => 
        t.id === data.id.toString() ? { ...data, id: data.id.toString() } : t
      );
      localStorage.setItem('transactions', JSON.stringify(updated));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
      queryClient.invalidateQueries({ queryKey: ['ledgerAccounts'] });
    },
  });
}

export function useDeleteTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      
      // Use localStorage as backend method doesn't exist
      const stored = localStorage.getItem('transactions');
      const transactions = stored ? JSON.parse(stored) : [];
      const filtered = transactions.filter((t: any) => t.id !== id.toString());
      localStorage.setItem('transactions', JSON.stringify(filtered));
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
      queryClient.invalidateQueries({ queryKey: ['ledgerAccounts'] });
    },
  });
}

export function useCreateJournalEntryFromTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionId: bigint) => {
      // This is a placeholder - journal entries are created automatically by backend
      return transactionId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
      queryClient.invalidateQueries({ queryKey: ['ledgerAccounts'] });
    },
  });
}

// Product hooks - localStorage based since backend methods don't exist
export function useGetAllProducts() {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      // Use localStorage as backend method doesn't exist
      const stored = localStorage.getItem('products');
      return stored ? JSON.parse(stored) : [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      if (!actor) throw new Error('Actor not available');
      
      // Use localStorage as backend method doesn't exist
      const stored = localStorage.getItem('products');
      const products = stored ? JSON.parse(stored) : [];
      const newProduct = {
        ...data,
        id: BigInt(Date.now()),
        owner: 'local',
      };
      products.push(newProduct);
      localStorage.setItem('products', JSON.stringify(products));
      return newProduct;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      if (!actor) throw new Error('Actor not available');
      
      // Use localStorage as backend method doesn't exist
      const stored = localStorage.getItem('products');
      const products = stored ? JSON.parse(stored) : [];
      const updated = products.map((p: any) => 
        p.id === data.id.toString() ? { ...data, id: data.id.toString() } : p
      );
      localStorage.setItem('products', JSON.stringify(updated));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateStockLevel() {
  return useUpdateProduct();
}

// Journal Entry hooks - localStorage based since backend methods don't exist
export function useGetJournalEntries() {
  const { actor, isFetching } = useActor();

  return useQuery<JournalEntry[]>({
    queryKey: ['journalEntries'],
    queryFn: async () => {
      // Use localStorage as backend method doesn't exist
      const stored = localStorage.getItem('journalEntries');
      return stored ? JSON.parse(stored) : [];
    },
    enabled: !!actor && !isFetching,
  });
}

export const useGetAllJournalEntries = useGetJournalEntries;

// Ledger Account hooks - localStorage based since backend methods don't exist
export function useGetLedgerAccounts() {
  const { actor, isFetching } = useActor();

  return useQuery<LedgerAccount[]>({
    queryKey: ['ledgerAccounts'],
    queryFn: async () => {
      // Use localStorage as backend method doesn't exist
      const stored = localStorage.getItem('ledgerAccounts');
      return stored ? JSON.parse(stored) : [];
    },
    enabled: !!actor && !isFetching,
  });
}

// User Profile hooks - localStorage based since backend methods don't exist
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      
      // Use localStorage as backend method doesn't exist
      const stored = localStorage.getItem('userProfile');
      return stored ? JSON.parse(stored) : null;
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
      if (!actor) throw new Error('Actor not available');
      
      // Use localStorage as backend method doesn't exist
      localStorage.setItem('userProfile', JSON.stringify(profile));
      return profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Re-export backend-backed tax settings hooks
export { useGetTaxSettingForCountry as useGetTaxSettings, useSaveTaxSettingForCountry as useSetTaxSettings } from './useTaxSettings';

export function useGetNotificationSettings() {
  return useQuery({
    queryKey: ['notificationSettings'],
    queryFn: () => {
      const stored = localStorage.getItem('notificationSettings');
      return stored ? JSON.parse(stored) : { lowStockAlert: true, overdueInvoiceAlert: true };
    },
  });
}

export function useSetNotificationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: any) => {
      localStorage.setItem('notificationSettings', JSON.stringify(settings));
      return settings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationSettings'] });
    },
  });
}

// Placeholder hooks for features not yet implemented in backend
export function useGetAllInvoices() {
  return useQuery<any[]>({
    queryKey: ['invoices'],
    queryFn: () => {
      const stored = localStorage.getItem('invoices');
      return stored ? JSON.parse(stored) : [];
    },
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (invoice: any) => {
      const stored = localStorage.getItem('invoices');
      const invoices = stored ? JSON.parse(stored) : [];
      invoices.push(invoice);
      localStorage.setItem('invoices', JSON.stringify(invoices));
      return invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

export function useUpdateInvoiceStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: any) => {
      const stored = localStorage.getItem('invoices');
      const invoices = stored ? JSON.parse(stored) : [];
      const updated = invoices.map((inv: any) => (inv.id === id ? { ...inv, status } : inv));
      localStorage.setItem('invoices', JSON.stringify(updated));
      return { id, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

export function useGetNextInvoiceNumber() {
  return useQuery({
    queryKey: ['nextInvoiceNumber'],
    queryFn: () => {
      const stored = localStorage.getItem('invoices');
      const invoices = stored ? JSON.parse(stored) : [];
      const year = new Date().getFullYear();
      const count = invoices.filter((inv: any) => inv.invoiceNumber?.includes(year.toString())).length;
      return `INV-${year}-${String(count + 1).padStart(3, '0')}`;
    },
  });
}

export function useGetDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: () => ({
      totalSales: 0,
      totalExpenses: 0,
      netProfit: 0,
      currentStockValue: 0,
      outstandingReceivables: 0,
      cashInflow: 0,
    }),
  });
}

export function useGetLowStockProducts() {
  return useQuery<Product[]>({
    queryKey: ['lowStockProducts'],
    queryFn: () => [],
  });
}

export function useGetOverdueInvoices() {
  return useQuery<any[]>({
    queryKey: ['overdueInvoices'],
    queryFn: () => [],
  });
}

export function useGetAllConsultations() {
  return useQuery<CAConsultation[]>({
    queryKey: ['consultations'],
    queryFn: () => [],
  });
}

export function useAddConsultationMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
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
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
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
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
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
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
    },
  });
}

export function useGetAllCAProfiles() {
  return useQuery<CharteredAccountantProfile[]>({
    queryKey: ['caProfiles'],
    queryFn: () => [],
  });
}

export function useCreateCAProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caProfiles'] });
    },
  });
}

export function useUpdateCAProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caProfiles'] });
    },
  });
}

export function useDeleteCAProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: any) => {
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caProfiles'] });
    },
  });
}

export function useSearchCAProfiles() {
  return useMutation<CharteredAccountantProfile[], Error, any>({
    mutationFn: async (query: any) => {
      return [];
    },
  });
}

export function useGetAllDepreciationAssets() {
  return useQuery<DepreciationAsset[]>({
    queryKey: ['depreciationAssets'],
    queryFn: () => {
      const stored = localStorage.getItem('depreciationAssets');
      return stored ? JSON.parse(stored) : [];
    },
  });
}

export function useCreateDepreciationAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const stored = localStorage.getItem('depreciationAssets');
      const assets = stored ? JSON.parse(stored) : [];
      const newAsset = { ...data, id: BigInt(Date.now()) };
      assets.push(newAsset);
      localStorage.setItem('depreciationAssets', JSON.stringify(assets));
      return newAsset;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['depreciationAssets'] });
    },
  });
}

export const useAddDepreciationAsset = useCreateDepreciationAsset;

export function useUpdateDepreciationAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const stored = localStorage.getItem('depreciationAssets');
      const assets = stored ? JSON.parse(stored) : [];
      const updated = assets.map((a: any) => (a.id === data.id ? data : a));
      localStorage.setItem('depreciationAssets', JSON.stringify(updated));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['depreciationAssets'] });
    },
  });
}

export function useDeleteDepreciationAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: any) => {
      const stored = localStorage.getItem('depreciationAssets');
      const assets = stored ? JSON.parse(stored) : [];
      const filtered = assets.filter((a: any) => a.id !== id);
      localStorage.setItem('depreciationAssets', JSON.stringify(filtered));
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['depreciationAssets'] });
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

// Trading Account hooks
export function useGetAllTradingAccounts() {
  return useQuery<TradingAccount[]>({
    queryKey: ['tradingAccounts'],
    queryFn: () => {
      const stored = localStorage.getItem('tradingAccounts');
      return stored ? JSON.parse(stored) : [];
    },
  });
}

export function useCreateTradingAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const stored = localStorage.getItem('tradingAccounts');
      const accounts = stored ? JSON.parse(stored) : [];
      const newAccount = { ...data, id: BigInt(Date.now()) };
      accounts.push(newAccount);
      localStorage.setItem('tradingAccounts', JSON.stringify(accounts));
      return newAccount;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tradingAccounts'] });
    },
  });
}

// Profit and Loss Statement hooks
export function useGetAllProfitAndLossStatements() {
  return useQuery<ProfitAndLossStatement[]>({
    queryKey: ['profitAndLossStatements'],
    queryFn: () => {
      const stored = localStorage.getItem('profitAndLossStatements');
      return stored ? JSON.parse(stored) : [];
    },
  });
}

export function useGenerateProfitAndLossStatement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const stored = localStorage.getItem('profitAndLossStatements');
      const statements = stored ? JSON.parse(stored) : [];
      const newStatement = { ...data, id: BigInt(Date.now()) };
      statements.push(newStatement);
      localStorage.setItem('profitAndLossStatements', JSON.stringify(statements));
      return newStatement;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profitAndLossStatements'] });
    },
  });
}

// Balance Sheet hooks
export function useGetAllBalanceSheets() {
  return useQuery<any[]>({
    queryKey: ['balanceSheets'],
    queryFn: () => {
      const stored = localStorage.getItem('balanceSheets');
      return stored ? JSON.parse(stored) : [];
    },
  });
}
