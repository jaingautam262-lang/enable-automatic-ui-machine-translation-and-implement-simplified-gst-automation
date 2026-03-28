import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { type CurrencyInfo, getCurrencyForCountry } from "../lib/taxRates";

const COUNTRY_KEY = "selectedTaxCountry";
const MANUAL_OVERRIDE_KEY = "manualCurrencySymbol";

interface CurrencyContextValue {
  currencySymbol: string;
  currencyCode: string;
  currencyName: string;
  locale: string;
  manualOverride: string | null;
  formatAmount: (n: number) => string;
  setManualOverride: (symbol: string) => void;
  clearManualOverride: () => void;
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(
  undefined,
);

function readCurrencyInfo(): CurrencyInfo {
  const stored = localStorage.getItem(COUNTRY_KEY);
  return getCurrencyForCountry(stored ?? "IN");
}

function readManualOverride(): string | null {
  return localStorage.getItem(MANUAL_OVERRIDE_KEY) || null;
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currencyInfo, setCurrencyInfo] =
    useState<CurrencyInfo>(readCurrencyInfo);
  const [manualOverride, setManualOverrideState] = useState<string | null>(
    readManualOverride,
  );

  // Sync when country changes (fired by SettingsTab)
  useEffect(() => {
    const handler = () => {
      setCurrencyInfo(readCurrencyInfo());
    };
    window.addEventListener("currencyCountryChange", handler);
    return () => window.removeEventListener("currencyCountryChange", handler);
  }, []);

  // Effective symbol: manual override wins
  const effectiveSymbol = manualOverride ?? currencyInfo.symbol;

  const formatAmount = useCallback(
    (n: number): string => {
      if (manualOverride) {
        // With manual override: use Intl for number formatting, then prepend symbol
        try {
          const formatted = new Intl.NumberFormat(currencyInfo.locale, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(n);
          return `${manualOverride}${formatted}`;
        } catch {
          return `${manualOverride}${n.toFixed(2)}`;
        }
      }
      // Use Intl currency style
      try {
        return new Intl.NumberFormat(currencyInfo.locale, {
          style: "currency",
          currency: currencyInfo.code,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(n);
      } catch {
        // Fallback: prepend symbol + number
        return `${currencyInfo.symbol}${n.toFixed(2)}`;
      }
    },
    [currencyInfo, manualOverride],
  );

  const setManualOverride = useCallback((symbol: string) => {
    const trimmed = symbol.trim();
    if (trimmed) {
      localStorage.setItem(MANUAL_OVERRIDE_KEY, trimmed);
      setManualOverrideState(trimmed);
    }
  }, []);

  const clearManualOverride = useCallback(() => {
    localStorage.removeItem(MANUAL_OVERRIDE_KEY);
    setManualOverrideState(null);
  }, []);

  const value: CurrencyContextValue = {
    currencySymbol: effectiveSymbol,
    currencyCode: currencyInfo.code,
    currencyName: currencyInfo.name,
    locale: currencyInfo.locale,
    manualOverride,
    formatAmount,
    setManualOverride,
    clearManualOverride,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return ctx;
}
