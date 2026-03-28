import type { ProviderMetadata } from "../../../../types/gst-universal";
import type { ExportType } from "../types";

export function mapToTally(exportType: ExportType, data: any): any {
  const providerMetadata: ProviderMetadata = {
    providerName: "Tally",
    status: "pending",
    timestamp: Date.now(),
  };

  switch (exportType) {
    case "einvoice":
      return {
        ...data,
        providerMetadata,
        provider_specific: {
          tally_format: "XML",
          voucher_type: "Sales",
        },
      };
    case "ewayBill":
      return {
        ...data,
        providerMetadata,
        provider_specific: {
          tally_format: "XML",
          voucher_type: "Delivery Note",
        },
      };
    case "gstr1":
      return {
        ...data,
        providerMetadata,
        provider_specific: {
          tally_format: "JSON",
          report_type: "GSTR1",
          period: data.period,
        },
      };
    case "gstr3b":
      return {
        ...data,
        providerMetadata,
        provider_specific: {
          tally_format: "JSON",
          report_type: "GSTR3B",
          period: data.period,
        },
      };
    default:
      return { ...data, providerMetadata };
  }
}
