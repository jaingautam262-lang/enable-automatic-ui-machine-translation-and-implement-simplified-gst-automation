import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UnifiedGSTRecord } from "../types/gst-universal";

const STORAGE_KEY = "gst_unified_records";

function getStoredRecords(principal?: string): UnifiedGSTRecord[] {
  if (!principal) return [];
  try {
    const key = `${STORAGE_KEY}_${principal}`;
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveStoredRecords(
  principal: string,
  records: UnifiedGSTRecord[],
): void {
  const key = `${STORAGE_KEY}_${principal}`;
  localStorage.setItem(key, JSON.stringify(records));
}

export function useListGSTRecords(principal?: string) {
  return useQuery<UnifiedGSTRecord[]>({
    queryKey: ["gstUnifiedRecords", principal],
    queryFn: () => getStoredRecords(principal),
    enabled: !!principal,
  });
}

export function useGetGSTRecord(
  principal: string | undefined,
  recordId: string | undefined,
) {
  return useQuery<UnifiedGSTRecord | null>({
    queryKey: ["gstUnifiedRecord", principal, recordId],
    queryFn: () => {
      if (!principal || !recordId) return null;
      const records = getStoredRecords(principal);
      return records.find((r) => r.id === recordId) || null;
    },
    enabled: !!principal && !!recordId,
  });
}

export function useCreateGSTRecord(principal?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      record: Omit<
        UnifiedGSTRecord,
        "id" | "owner" | "createdAt" | "updatedAt"
      >,
    ) => {
      if (!principal) throw new Error("User not authenticated");

      const records = getStoredRecords(principal);
      const newRecord: UnifiedGSTRecord = {
        ...record,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        owner: principal,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      records.push(newRecord);
      saveStoredRecords(principal, records);
      return newRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["gstUnifiedRecords", principal],
      });
    },
  });
}

export function useUpdateGSTRecord(principal?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: { id: string; updates: Partial<UnifiedGSTRecord> }) => {
      if (!principal) throw new Error("User not authenticated");

      const records = getStoredRecords(principal);
      const index = records.findIndex((r) => r.id === id);
      if (index === -1) throw new Error("Record not found");

      records[index] = {
        ...records[index],
        ...updates,
        updatedAt: Date.now(),
      };

      saveStoredRecords(principal, records);
      return records[index];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["gstUnifiedRecords", principal],
      });
    },
  });
}

export function useDeleteGSTRecord(principal?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!principal) throw new Error("User not authenticated");

      const records = getStoredRecords(principal);
      const filtered = records.filter((r) => r.id !== id);
      saveStoredRecords(principal, filtered);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["gstUnifiedRecords", principal],
      });
    },
  });
}
