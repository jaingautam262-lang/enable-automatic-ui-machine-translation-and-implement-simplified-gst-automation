import { useEffect, useState } from "react";

const STORAGE_KEY = "selectedTaxCountry";

export function useSelectedTaxCountry() {
  const [selectedCountry, setSelectedCountry] = useState<string>("IN");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setSelectedCountry(stored);
    }
  }, []);

  const updateSelectedCountry = (countryCode: string) => {
    setSelectedCountry(countryCode);
    localStorage.setItem(STORAGE_KEY, countryCode);
  };

  return {
    selectedCountry,
    setSelectedCountry: updateSelectedCountry,
  };
}
