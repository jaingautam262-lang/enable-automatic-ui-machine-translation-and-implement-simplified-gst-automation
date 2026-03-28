import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { dateToTime, safeLocalStorage } from "../lib/serialization";
import type { TDSTransaction } from "../types";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

// TCS Record type (defined locally since not in backend)
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

// BigInt fields for serialization
const BIGINT_FIELDS = {
  tds: ["id", "transactionId", "date", "certificateDate"],
  tcs: ["id", "transactionId", "date", "certificateDate"],
};

export function useTDSTCSPersistence() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const principalKey = identity?.getPrincipal().toString() || "anonymous";

  // Fetch TDS records from localStorage
  const tdsQuery = useQuery<TDSTransaction[]>({
    queryKey: ["tdstcs", "tds", principalKey],
    queryFn: async () => {
      if (!actor || !identity) return [];
      const storageKey = `tdsTransactions_${principalKey}`;
      return (
        safeLocalStorage.getItem<TDSTransaction[]>(
          storageKey,
          BIGINT_FIELDS.tds,
        ) || []
      );
    },
    enabled: !!actor && !isFetching && !!identity,
    staleTime: 30000,
  });

  // Fetch TCS records from localStorage
  const tcsQuery = useQuery<TCSRecord[]>({
    queryKey: ["tdstcs", "tcs", principalKey],
    queryFn: async () => {
      if (!actor || !identity) return [];
      const storageKey = `tcsRecords_${principalKey}`;
      return (
        safeLocalStorage.getItem<TCSRecord[]>(storageKey, BIGINT_FIELDS.tcs) ||
        []
      );
    },
    enabled: !!actor && !isFetching && !!identity,
    staleTime: 30000,
  });

  // Create TDS
  const createTDSMutation = useMutation({
    mutationFn: async (data: Omit<TDSTransaction, "id" | "owner" | "date">) => {
      if (!actor) throw new Error("Actor not available");
      if (!identity) throw new Error("Identity not available");

      const newRecord: TDSTransaction = {
        id: BigInt(Date.now()),
        owner: principalKey,
        date: dateToTime(new Date()),
        ...data,
      };

      const storageKey = `tdsTransactions_${principalKey}`;
      const records =
        safeLocalStorage.getItem<TDSTransaction[]>(
          storageKey,
          BIGINT_FIELDS.tds,
        ) || [];
      records.push(newRecord);
      safeLocalStorage.setItem(storageKey, records);

      return newRecord.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tdstcs", "tds", principalKey],
      });
    },
  });

  // Update TDS
  const updateTDSMutation = useMutation({
    mutationFn: async ({ id, data }: { id: bigint; data: TDSTransaction }) => {
      if (!actor) throw new Error("Actor not available");

      const storageKey = `tdsTransactions_${principalKey}`;
      const records =
        safeLocalStorage.getItem<TDSTransaction[]>(
          storageKey,
          BIGINT_FIELDS.tds,
        ) || [];
      const index = records.findIndex((r) => r.id.toString() === id.toString());

      if (index === -1) throw new Error("TDS record not found");

      records[index] = data;
      safeLocalStorage.setItem(storageKey, records);

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tdstcs", "tds", principalKey],
      });
    },
  });

  // Delete TDS
  const deleteTDSMutation = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");

      const storageKey = `tdsTransactions_${principalKey}`;
      const records =
        safeLocalStorage.getItem<TDSTransaction[]>(
          storageKey,
          BIGINT_FIELDS.tds,
        ) || [];
      const filtered = records.filter((r) => r.id.toString() !== id.toString());

      safeLocalStorage.setItem(storageKey, filtered);

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tdstcs", "tds", principalKey],
      });
    },
  });

  // Create TCS
  const createTCSMutation = useMutation({
    mutationFn: async (data: Omit<TCSRecord, "id" | "owner" | "date">) => {
      if (!actor) throw new Error("Actor not available");
      if (!identity) throw new Error("Identity not available");

      const newRecord: TCSRecord = {
        id: BigInt(Date.now()),
        owner: principalKey,
        date: dateToTime(new Date()),
        ...data,
      };

      const storageKey = `tcsRecords_${principalKey}`;
      const records =
        safeLocalStorage.getItem<TCSRecord[]>(storageKey, BIGINT_FIELDS.tcs) ||
        [];
      records.push(newRecord);
      safeLocalStorage.setItem(storageKey, records);

      return newRecord.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tdstcs", "tcs", principalKey],
      });
    },
  });

  // Update TCS
  const updateTCSMutation = useMutation({
    mutationFn: async ({ id, data }: { id: bigint; data: TCSRecord }) => {
      if (!actor) throw new Error("Actor not available");

      const storageKey = `tcsRecords_${principalKey}`;
      const records =
        safeLocalStorage.getItem<TCSRecord[]>(storageKey, BIGINT_FIELDS.tcs) ||
        [];
      const index = records.findIndex((r) => r.id.toString() === id.toString());

      if (index === -1) throw new Error("TCS record not found");

      records[index] = data;
      safeLocalStorage.setItem(storageKey, records);

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tdstcs", "tcs", principalKey],
      });
    },
  });

  // Delete TCS
  const deleteTCSMutation = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");

      const storageKey = `tcsRecords_${principalKey}`;
      const records =
        safeLocalStorage.getItem<TCSRecord[]>(storageKey, BIGINT_FIELDS.tcs) ||
        [];
      const filtered = records.filter((r) => r.id.toString() !== id.toString());

      safeLocalStorage.setItem(storageKey, filtered);

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tdstcs", "tcs", principalKey],
      });
    },
  });

  return {
    tdsRecords: tdsQuery.data || [],
    tcsRecords: tcsQuery.data || [],
    isLoading: tdsQuery.isLoading || tcsQuery.isLoading,
    createTDS: createTDSMutation.mutateAsync,
    updateTDS: (id: bigint, data: TDSTransaction) =>
      updateTDSMutation.mutateAsync({ id, data }),
    deleteTDS: deleteTDSMutation.mutateAsync,
    createTCS: createTCSMutation.mutateAsync,
    updateTCS: (id: bigint, data: TCSRecord) =>
      updateTCSMutation.mutateAsync({ id, data }),
    deleteTCS: deleteTCSMutation.mutateAsync,
  };
}
