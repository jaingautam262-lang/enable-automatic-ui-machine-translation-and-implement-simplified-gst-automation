import type { GSPProvider } from "../../../types/gst-universal";

export type ExportType = "einvoice" | "ewayBill" | "gstr1" | "gstr3b";

export interface ExportValidationError {
  field: string;
  message: string;
  severity: "error" | "warning";
}

export interface ExportValidationSummary {
  isValid: boolean;
  errors: ExportValidationError[];
  warnings: ExportValidationError[];
}

export interface ExportResult {
  provider: GSPProvider;
  exportType: ExportType;
  payload: any;
  validation: ExportValidationSummary;
  metadata: {
    generatedAt: number;
    recordCount: number;
  };
}
