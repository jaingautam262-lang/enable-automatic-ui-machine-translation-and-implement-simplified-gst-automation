import type { ProviderMetadata } from "../../../../types/gst-universal";
import type { ExportType } from "../types";

export function mapToIRIS(exportType: ExportType, data: any): any {
  const providerMetadata: ProviderMetadata = {
    providerName: "IRIS",
    status: "pending",
    timestamp: Date.now(),
  };

  switch (exportType) {
    case "einvoice":
      return {
        ...data,
        providerMetadata,
        provider_specific: {
          iris_version: "1.0",
          doc_category: "B2B",
        },
      };
    case "ewayBill":
      return {
        ...data,
        providerMetadata,
        provider_specific: {
          iris_version: "1.0",
          bill_type: "OUTWARD",
        },
      };
    case "gstr1":
      return {
        ...data,
        providerMetadata,
        provider_specific: {
          return_type: "GSTR1",
          tax_period: data.period,
        },
      };
    case "gstr3b":
      return {
        ...data,
        providerMetadata,
        provider_specific: {
          return_type: "GSTR3B",
          tax_period: data.period,
        },
      };
    default:
      return { ...data, providerMetadata };
  }
}
