import { useEffect, useState } from "react";
import { safeLocalStorage } from "../lib/serialization";

export interface InvoiceBrandingSettings {
  websiteURL?: string;
  paymentQRDataURL?: string;
}

export function useInvoiceBranding() {
  const [branding, setBranding] = useState<InvoiceBrandingSettings>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBranding = () => {
      const saved = safeLocalStorage.getItem<InvoiceBrandingSettings>(
        "invoiceBranding",
        [],
      );
      if (saved) {
        setBranding(saved);
      }
      setIsLoading(false);
    };

    loadBranding();
  }, []);

  const saveBranding = (settings: InvoiceBrandingSettings) => {
    safeLocalStorage.setItem("invoiceBranding", settings);
    setBranding(settings);
  };

  return {
    branding,
    saveBranding,
    isLoading,
  };
}
