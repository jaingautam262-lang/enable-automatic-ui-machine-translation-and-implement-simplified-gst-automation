import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface LegacyTaxSettings {
  gstin?: string;
  gstType?: "regular" | "composition";
  stateCode?: string;
}

const STORAGE_KEY = "legacyTaxSettings";

export function useGetLegacyTaxSettings() {
  return useQuery<LegacyTaxSettings>({
    queryKey: ["legacyTaxSettings"],
    queryFn: () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    },
  });
}

export function useSetLegacyTaxSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: LegacyTaxSettings) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      return settings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["legacyTaxSettings"] });
    },
  });
}
