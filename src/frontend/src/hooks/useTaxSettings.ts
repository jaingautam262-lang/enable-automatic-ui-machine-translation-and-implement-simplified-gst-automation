import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

const STORAGE_KEY = "taxSettings";

// localStorage-based implementation since backend methods don't exist
export function useGetTaxSettingForCountry(country: string) {
  const { actor } = useActor();

  return useQuery<number>({
    queryKey: ["taxSetting", country],
    queryFn: async () => {
      // Use localStorage as backend method doesn't exist
      const stored = localStorage.getItem(STORAGE_KEY);
      const settings = stored ? JSON.parse(stored) : {};
      return settings[country] !== undefined ? settings[country] : 18;
    },
    enabled: !!actor && !!country,
  });
}

export function useSaveTaxSettingForCountry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      country,
      taxRate,
    }: { country: string; taxRate: number }) => {
      if (!actor) throw new Error("Actor not available");

      // Use localStorage as backend method doesn't exist
      const stored = localStorage.getItem(STORAGE_KEY);
      const settings = stored ? JSON.parse(stored) : {};
      settings[country] = taxRate;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      return taxRate;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["taxSetting", variables.country],
      });
    },
  });
}

export function useGetEffectiveTaxRate(country: string) {
  const { data: taxRate, isLoading } = useGetTaxSettingForCountry(country);

  return {
    taxRate: taxRate !== undefined ? taxRate : 18,
    isLoading,
  };
}

// Alias for backward compatibility
export const useEffectiveTaxRate = useGetEffectiveTaxRate;
