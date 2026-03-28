import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ClearTaxCredentials,
  type GSPProvider,
  IRISCredentials,
  MastersIndiaCredentials,
  type ProviderCredentials,
  TallyCredentials,
} from "../types/gst-universal";

const STORAGE_KEY_PREFIX = "gst_provider_credentials";

export function getStoredCredentials(
  principal?: string,
  provider: GSPProvider = "cleartax",
): ProviderCredentials | null {
  if (!principal) return null;
  try {
    const key = `${STORAGE_KEY_PREFIX}_${provider}_${principal}`;
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function saveStoredCredentials(
  principal: string,
  provider: GSPProvider,
  credentials: ProviderCredentials,
): void {
  const key = `${STORAGE_KEY_PREFIX}_${provider}_${principal}`;
  localStorage.setItem(key, JSON.stringify(credentials));
}

function deleteStoredCredentials(
  principal: string,
  provider: GSPProvider,
): void {
  const key = `${STORAGE_KEY_PREFIX}_${provider}_${principal}`;
  localStorage.removeItem(key);
}

export function useGetProviderCredentials(
  principal?: string,
  provider: GSPProvider = "cleartax",
) {
  return useQuery<ProviderCredentials | null>({
    queryKey: ["providerCredentials", provider, principal],
    queryFn: () => getStoredCredentials(principal, provider),
    enabled: !!principal,
  });
}

export function useUpsertProviderCredentials(
  principal?: string,
  provider: GSPProvider = "cleartax",
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: ProviderCredentials) => {
      if (!principal) throw new Error("User not authenticated");
      saveStoredCredentials(principal, provider, credentials);
      return credentials;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["providerCredentials", provider, principal],
      });
      queryClient.invalidateQueries({
        queryKey: ["gstAutomationStatus", principal],
      });
    },
  });
}

export function useDeleteProviderCredentials(
  principal?: string,
  provider: GSPProvider = "cleartax",
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!principal) throw new Error("User not authenticated");
      deleteStoredCredentials(principal, provider);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["providerCredentials", provider, principal],
      });
      queryClient.invalidateQueries({
        queryKey: ["gstAutomationStatus", principal],
      });
    },
  });
}

// Legacy compatibility exports
export function useGetClearTaxCredentials(principal?: string) {
  return useGetProviderCredentials(principal, "cleartax");
}

export function useUpsertClearTaxCredentials(principal?: string) {
  return useUpsertProviderCredentials(principal, "cleartax");
}

export function useDeleteClearTaxCredentials(principal?: string) {
  return useDeleteProviderCredentials(principal, "cleartax");
}
