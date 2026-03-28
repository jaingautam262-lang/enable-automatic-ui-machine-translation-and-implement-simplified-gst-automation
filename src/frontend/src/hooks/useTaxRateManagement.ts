import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TaxRate, TaxRateType } from "../types";
import { useInternetIdentity } from "./useInternetIdentity";

const STORAGE_KEY_PREFIX = "taxRates_";
const INITIALIZED_KEY_PREFIX = "taxRatesInitialized_";

// Predefined seed data for 15+ countries
const PREDEFINED_TAX_RATES: Omit<TaxRate, "id">[] = [
  // India - GST Slabs (CGST + SGST)
  {
    country: "India",
    countryCode: "IN",
    taxType: "GST",
    rateName: "GST 5% (CGST 2.5% + SGST 2.5%)",
    percentage: 5,
    isDefault: false,
    isPredefined: true,
    description: "Intra-state supply - essential goods",
  },
  {
    country: "India",
    countryCode: "IN",
    taxType: "GST",
    rateName: "GST 12% (CGST 6% + SGST 6%)",
    percentage: 12,
    isDefault: false,
    isPredefined: true,
    description: "Intra-state supply - standard goods",
  },
  {
    country: "India",
    countryCode: "IN",
    taxType: "GST",
    rateName: "GST 18% (CGST 9% + SGST 9%)",
    percentage: 18,
    isDefault: true,
    isPredefined: true,
    description: "Intra-state supply - most services & goods",
  },
  {
    country: "India",
    countryCode: "IN",
    taxType: "GST",
    rateName: "GST 28% (CGST 14% + SGST 14%)",
    percentage: 28,
    isDefault: false,
    isPredefined: true,
    description: "Intra-state supply - luxury goods",
  },
  // India - IGST (Inter-state)
  {
    country: "India",
    countryCode: "IN",
    taxType: "GST",
    rateName: "IGST 5%",
    percentage: 5,
    isDefault: false,
    isPredefined: true,
    description: "Inter-state supply - essential goods",
  },
  {
    country: "India",
    countryCode: "IN",
    taxType: "GST",
    rateName: "IGST 12%",
    percentage: 12,
    isDefault: false,
    isPredefined: true,
    description: "Inter-state supply - standard goods",
  },
  {
    country: "India",
    countryCode: "IN",
    taxType: "GST",
    rateName: "IGST 18%",
    percentage: 18,
    isDefault: false,
    isPredefined: true,
    description: "Inter-state supply - most services & goods",
  },
  {
    country: "India",
    countryCode: "IN",
    taxType: "GST",
    rateName: "IGST 28%",
    percentage: 28,
    isDefault: false,
    isPredefined: true,
    description: "Inter-state supply - luxury goods",
  },
  // India - Income Tax Slabs (New Regime FY 2024-25)
  {
    country: "India",
    countryCode: "IN",
    taxType: "IncomeTax",
    rateName: "Income Tax 5% (₹3L-₹7L)",
    percentage: 5,
    isDefault: false,
    isPredefined: true,
    description: "New regime: ₹3,00,001 - ₹7,00,000",
  },
  {
    country: "India",
    countryCode: "IN",
    taxType: "IncomeTax",
    rateName: "Income Tax 10% (₹7L-₹10L)",
    percentage: 10,
    isDefault: false,
    isPredefined: true,
    description: "New regime: ₹7,00,001 - ₹10,00,000",
  },
  {
    country: "India",
    countryCode: "IN",
    taxType: "IncomeTax",
    rateName: "Income Tax 15% (₹10L-₹12L)",
    percentage: 15,
    isDefault: false,
    isPredefined: true,
    description: "New regime: ₹10,00,001 - ₹12,00,000",
  },
  {
    country: "India",
    countryCode: "IN",
    taxType: "IncomeTax",
    rateName: "Income Tax 20% (₹12L-₹15L)",
    percentage: 20,
    isDefault: false,
    isPredefined: true,
    description: "New regime: ₹12,00,001 - ₹15,00,000",
  },
  {
    country: "India",
    countryCode: "IN",
    taxType: "IncomeTax",
    rateName: "Income Tax 30% (Above ₹15L)",
    percentage: 30,
    isDefault: false,
    isPredefined: true,
    description: "New regime: Above ₹15,00,000",
  },

  // United States
  {
    country: "United States",
    countryCode: "US",
    taxType: "VAT",
    rateName: "Sales Tax (Federal Avg)",
    percentage: 7.25,
    isDefault: true,
    isPredefined: true,
    description: "Average combined state & local sales tax",
  },
  {
    country: "United States",
    countryCode: "US",
    taxType: "IncomeTax",
    rateName: "Federal Income Tax 10%",
    percentage: 10,
    isDefault: false,
    isPredefined: true,
    description: "Federal bracket: $0 - $11,600",
  },
  {
    country: "United States",
    countryCode: "US",
    taxType: "IncomeTax",
    rateName: "Federal Income Tax 22%",
    percentage: 22,
    isDefault: false,
    isPredefined: true,
    description: "Federal bracket: $44,725 - $95,375",
  },
  {
    country: "United States",
    countryCode: "US",
    taxType: "IncomeTax",
    rateName: "Federal Income Tax 37%",
    percentage: 37,
    isDefault: false,
    isPredefined: true,
    description: "Federal bracket: Above $578,125",
  },

  // United Kingdom
  {
    country: "United Kingdom",
    countryCode: "GB",
    taxType: "VAT",
    rateName: "Standard VAT 20%",
    percentage: 20,
    isDefault: true,
    isPredefined: true,
    description: "Standard rate for most goods and services",
  },
  {
    country: "United Kingdom",
    countryCode: "GB",
    taxType: "VAT",
    rateName: "Reduced VAT 5%",
    percentage: 5,
    isDefault: false,
    isPredefined: true,
    description: "Reduced rate for domestic fuel, children's car seats",
  },
  {
    country: "United Kingdom",
    countryCode: "GB",
    taxType: "IncomeTax",
    rateName: "Basic Rate 20%",
    percentage: 20,
    isDefault: false,
    isPredefined: true,
    description: "Income: £12,571 - £50,270",
  },
  {
    country: "United Kingdom",
    countryCode: "GB",
    taxType: "IncomeTax",
    rateName: "Higher Rate 40%",
    percentage: 40,
    isDefault: false,
    isPredefined: true,
    description: "Income: £50,271 - £125,140",
  },
  {
    country: "United Kingdom",
    countryCode: "GB",
    taxType: "IncomeTax",
    rateName: "Additional Rate 45%",
    percentage: 45,
    isDefault: false,
    isPredefined: true,
    description: "Income: Above £125,140",
  },

  // Canada
  {
    country: "Canada",
    countryCode: "CA",
    taxType: "GST",
    rateName: "Federal GST 5%",
    percentage: 5,
    isDefault: true,
    isPredefined: true,
    description: "Federal Goods and Services Tax",
  },
  {
    country: "Canada",
    countryCode: "CA",
    taxType: "VAT",
    rateName: "HST Ontario 13%",
    percentage: 13,
    isDefault: false,
    isPredefined: true,
    description: "Harmonized Sales Tax - Ontario",
  },
  {
    country: "Canada",
    countryCode: "CA",
    taxType: "IncomeTax",
    rateName: "Federal Income Tax 15%",
    percentage: 15,
    isDefault: false,
    isPredefined: true,
    description: "Federal bracket: $0 - $55,867",
  },
  {
    country: "Canada",
    countryCode: "CA",
    taxType: "IncomeTax",
    rateName: "Federal Income Tax 33%",
    percentage: 33,
    isDefault: false,
    isPredefined: true,
    description: "Federal bracket: Above $246,752",
  },

  // Australia
  {
    country: "Australia",
    countryCode: "AU",
    taxType: "GST",
    rateName: "GST 10%",
    percentage: 10,
    isDefault: true,
    isPredefined: true,
    description: "Goods and Services Tax",
  },
  {
    country: "Australia",
    countryCode: "AU",
    taxType: "IncomeTax",
    rateName: "Income Tax 19%",
    percentage: 19,
    isDefault: false,
    isPredefined: true,
    description: "Bracket: $18,201 - $45,000",
  },
  {
    country: "Australia",
    countryCode: "AU",
    taxType: "IncomeTax",
    rateName: "Income Tax 45%",
    percentage: 45,
    isDefault: false,
    isPredefined: true,
    description: "Bracket: Above $180,000",
  },

  // Germany
  {
    country: "Germany",
    countryCode: "DE",
    taxType: "VAT",
    rateName: "Standard VAT 19%",
    percentage: 19,
    isDefault: true,
    isPredefined: true,
    description: "Mehrwertsteuer - standard rate",
  },
  {
    country: "Germany",
    countryCode: "DE",
    taxType: "VAT",
    rateName: "Reduced VAT 7%",
    percentage: 7,
    isDefault: false,
    isPredefined: true,
    description: "Reduced rate for food, books, newspapers",
  },
  {
    country: "Germany",
    countryCode: "DE",
    taxType: "IncomeTax",
    rateName: "Income Tax 14%-45%",
    percentage: 14,
    isDefault: false,
    isPredefined: true,
    description: "Progressive: 14% to 45%",
  },

  // France
  {
    country: "France",
    countryCode: "FR",
    taxType: "VAT",
    rateName: "Standard TVA 20%",
    percentage: 20,
    isDefault: true,
    isPredefined: true,
    description: "Taxe sur la valeur ajoutée - standard",
  },
  {
    country: "France",
    countryCode: "FR",
    taxType: "VAT",
    rateName: "Reduced TVA 5.5%",
    percentage: 5.5,
    isDefault: false,
    isPredefined: true,
    description: "Reduced rate for food, books",
  },
  {
    country: "France",
    countryCode: "FR",
    taxType: "IncomeTax",
    rateName: "Income Tax 30%",
    percentage: 30,
    isDefault: false,
    isPredefined: true,
    description: "Bracket: €27,479 - €78,570",
  },

  // Japan
  {
    country: "Japan",
    countryCode: "JP",
    taxType: "VAT",
    rateName: "Consumption Tax 10%",
    percentage: 10,
    isDefault: true,
    isPredefined: true,
    description: "Standard consumption tax rate",
  },
  {
    country: "Japan",
    countryCode: "JP",
    taxType: "VAT",
    rateName: "Reduced Consumption Tax 8%",
    percentage: 8,
    isDefault: false,
    isPredefined: true,
    description: "Reduced rate for food and beverages",
  },
  {
    country: "Japan",
    countryCode: "JP",
    taxType: "IncomeTax",
    rateName: "Income Tax 45%",
    percentage: 45,
    isDefault: false,
    isPredefined: true,
    description: "Top bracket: Above ¥40,000,000",
  },

  // China
  {
    country: "China",
    countryCode: "CN",
    taxType: "VAT",
    rateName: "Standard VAT 13%",
    percentage: 13,
    isDefault: true,
    isPredefined: true,
    description: "Standard rate for goods",
  },
  {
    country: "China",
    countryCode: "CN",
    taxType: "VAT",
    rateName: "Reduced VAT 9%",
    percentage: 9,
    isDefault: false,
    isPredefined: true,
    description: "Reduced rate for agricultural products",
  },
  {
    country: "China",
    countryCode: "CN",
    taxType: "IncomeTax",
    rateName: "Corporate Income Tax 25%",
    percentage: 25,
    isDefault: false,
    isPredefined: true,
    description: "Standard corporate income tax rate",
  },

  // Singapore
  {
    country: "Singapore",
    countryCode: "SG",
    taxType: "GST",
    rateName: "GST 9%",
    percentage: 9,
    isDefault: true,
    isPredefined: true,
    description: "Goods and Services Tax (from Jan 2024)",
  },
  {
    country: "Singapore",
    countryCode: "SG",
    taxType: "IncomeTax",
    rateName: "Income Tax 22%",
    percentage: 22,
    isDefault: false,
    isPredefined: true,
    description: "Top marginal rate for residents",
  },

  // UAE
  {
    country: "United Arab Emirates",
    countryCode: "AE",
    taxType: "VAT",
    rateName: "VAT 5%",
    percentage: 5,
    isDefault: true,
    isPredefined: true,
    description: "Standard VAT rate",
  },
  {
    country: "United Arab Emirates",
    countryCode: "AE",
    taxType: "IncomeTax",
    rateName: "Corporate Tax 9%",
    percentage: 9,
    isDefault: false,
    isPredefined: true,
    description: "Corporate tax above AED 375,000",
  },

  // Brazil
  {
    country: "Brazil",
    countryCode: "BR",
    taxType: "VAT",
    rateName: "ICMS 17%",
    percentage: 17,
    isDefault: true,
    isPredefined: true,
    description: "State VAT on goods and services",
  },
  {
    country: "Brazil",
    countryCode: "BR",
    taxType: "IncomeTax",
    rateName: "Income Tax 27.5%",
    percentage: 27.5,
    isDefault: false,
    isPredefined: true,
    description: "Top bracket: Above R$4,664.68/month",
  },

  // Mexico
  {
    country: "Mexico",
    countryCode: "MX",
    taxType: "VAT",
    rateName: "IVA 16%",
    percentage: 16,
    isDefault: true,
    isPredefined: true,
    description: "Impuesto al Valor Agregado - standard",
  },
  {
    country: "Mexico",
    countryCode: "MX",
    taxType: "IncomeTax",
    rateName: "Income Tax 35%",
    percentage: 35,
    isDefault: false,
    isPredefined: true,
    description: "Top bracket: Above MXN 3,000,000",
  },

  // South Africa
  {
    country: "South Africa",
    countryCode: "ZA",
    taxType: "VAT",
    rateName: "VAT 15%",
    percentage: 15,
    isDefault: true,
    isPredefined: true,
    description: "Standard VAT rate",
  },
  {
    country: "South Africa",
    countryCode: "ZA",
    taxType: "IncomeTax",
    rateName: "Income Tax 45%",
    percentage: 45,
    isDefault: false,
    isPredefined: true,
    description: "Top bracket: Above R1,817,000",
  },

  // New Zealand
  {
    country: "New Zealand",
    countryCode: "NZ",
    taxType: "GST",
    rateName: "GST 15%",
    percentage: 15,
    isDefault: true,
    isPredefined: true,
    description: "Goods and Services Tax",
  },
  {
    country: "New Zealand",
    countryCode: "NZ",
    taxType: "IncomeTax",
    rateName: "Income Tax 39%",
    percentage: 39,
    isDefault: false,
    isPredefined: true,
    description: "Top bracket: Above NZD 180,000",
  },
];

function getStorageKey(principal: string) {
  return `${STORAGE_KEY_PREFIX}${principal}`;
}

function getInitializedKey(principal: string) {
  return `${INITIALIZED_KEY_PREFIX}${principal}`;
}

function loadRates(principal: string): TaxRate[] {
  try {
    const stored = localStorage.getItem(getStorageKey(principal));
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRates(principal: string, rates: TaxRate[]) {
  localStorage.setItem(getStorageKey(principal), JSON.stringify(rates));
}

function generateId(): string {
  return `tr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function initializePredefinedRates(principal: string): TaxRate[] {
  const initialized = localStorage.getItem(getInitializedKey(principal));
  if (initialized) {
    return loadRates(principal);
  }
  const rates: TaxRate[] = PREDEFINED_TAX_RATES.map((r) => ({
    ...r,
    id: generateId(),
  }));
  saveRates(principal, rates);
  localStorage.setItem(getInitializedKey(principal), "true");
  return rates;
}

export function useGetTaxRates() {
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal().toString() ?? "anonymous";

  return useQuery<TaxRate[]>({
    queryKey: ["taxRates", principal],
    queryFn: () => {
      return initializePredefinedRates(principal);
    },
    staleTime: 0,
  });
}

export function useGetTaxRatesByCountry(countryCode: string) {
  const { data: allRates = [] } = useGetTaxRates();
  return allRates.filter((r) => r.countryCode === countryCode);
}

export function useGetTaxRatesByType(taxType: TaxRateType) {
  const { data: allRates = [] } = useGetTaxRates();
  return allRates.filter((r) => r.taxType === taxType);
}

export function useAddTaxRate() {
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal().toString() ?? "anonymous";
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rateData: Omit<TaxRate, "id" | "isPredefined">) => {
      const rates = loadRates(principal);
      const newRate: TaxRate = {
        ...rateData,
        id: generateId(),
        isPredefined: false,
      };
      rates.push(newRate);
      saveRates(principal, rates);
      return newRate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taxRates", principal] });
    },
  });
}

export function useUpdateTaxRate() {
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal().toString() ?? "anonymous";
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updatedRate: TaxRate) => {
      const rates = loadRates(principal);
      const idx = rates.findIndex((r) => r.id === updatedRate.id);
      if (idx === -1) throw new Error("Tax rate not found");
      rates[idx] = updatedRate;
      saveRates(principal, rates);
      return updatedRate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taxRates", principal] });
    },
  });
}

export function useDeleteTaxRate() {
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal().toString() ?? "anonymous";
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rateId: string) => {
      const rates = loadRates(principal);
      const filtered = rates.filter((r) => r.id !== rateId);
      saveRates(principal, filtered);
      return rateId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taxRates", principal] });
    },
  });
}
