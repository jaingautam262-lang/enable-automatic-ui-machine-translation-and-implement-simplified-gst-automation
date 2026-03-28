import type { GSPProvider } from "../../../types/gst-universal";
import type {
  ExportType,
  ExportValidationError,
  ExportValidationSummary,
} from "./types";

export function validateExport(
  provider: GSPProvider,
  exportType: ExportType,
  data: any,
): ExportValidationSummary {
  const errors: ExportValidationError[] = [];
  const warnings: ExportValidationError[] = [];

  // Common validations
  if (!data) {
    errors.push({
      field: "data",
      message: "No data provided for export",
      severity: "error",
    });
    return { isValid: false, errors, warnings };
  }

  // Export type specific validations
  switch (exportType) {
    case "einvoice":
      validateEInvoice(data, errors, warnings);
      break;
    case "ewayBill":
      validateEWayBill(data, errors, warnings);
      break;
    case "gstr1":
      validateGSTR1(data, errors, warnings);
      break;
    case "gstr3b":
      validateGSTR3B(data, errors, warnings);
      break;
  }

  // Provider specific validations
  validateProviderSpecific(provider, exportType, data, errors, warnings);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

function validateEInvoice(
  data: any,
  errors: ExportValidationError[],
  _warnings: ExportValidationError[],
) {
  if (!data.invoiceNumber) {
    errors.push({
      field: "invoiceNumber",
      message: "Invoice number is required",
      severity: "error",
    });
  }
  if (!data.supplierGSTIN) {
    errors.push({
      field: "supplierGSTIN",
      message: "Supplier GSTIN is required",
      severity: "error",
    });
  }
  if (!data.customerGSTIN) {
    errors.push({
      field: "customerGSTIN",
      message: "Customer GSTIN is required",
      severity: "error",
    });
  }
  if (!data.items || data.items.length === 0) {
    errors.push({
      field: "items",
      message: "At least one item is required",
      severity: "error",
    });
  }
}

function validateEWayBill(
  data: any,
  errors: ExportValidationError[],
  _warnings: ExportValidationError[],
) {
  if (!data.invoiceNumber) {
    errors.push({
      field: "invoiceNumber",
      message: "Invoice number is required",
      severity: "error",
    });
  }
  if (!data.fromGSTIN) {
    errors.push({
      field: "fromGSTIN",
      message: "From GSTIN is required",
      severity: "error",
    });
  }
  if (!data.toGSTIN) {
    errors.push({
      field: "toGSTIN",
      message: "To GSTIN is required",
      severity: "error",
    });
  }
  if (!data.transportMode) {
    errors.push({
      field: "transportMode",
      message: "Transport mode is required",
      severity: "error",
    });
  }
  if (!data.distance || data.distance <= 0) {
    errors.push({
      field: "distance",
      message: "Valid distance is required",
      severity: "error",
    });
  }
}

function validateGSTR1(
  data: any,
  errors: ExportValidationError[],
  warnings: ExportValidationError[],
) {
  if (!data.period) {
    errors.push({
      field: "period",
      message: "Period is required (MMYYYY format)",
      severity: "error",
    });
  }
  if (!data.b2bInvoices && !data.b2cInvoices) {
    warnings.push({
      field: "invoices",
      message: "No invoices found for the period",
      severity: "warning",
    });
  }
}

function validateGSTR3B(
  data: any,
  errors: ExportValidationError[],
  _warnings: ExportValidationError[],
) {
  if (!data.period) {
    errors.push({
      field: "period",
      message: "Period is required (MMYYYY format)",
      severity: "error",
    });
  }
  if (!data.outwardSupplies) {
    errors.push({
      field: "outwardSupplies",
      message: "Outward supplies data is required",
      severity: "error",
    });
  }
  if (!data.inwardSupplies) {
    errors.push({
      field: "inwardSupplies",
      message: "Inward supplies data is required",
      severity: "error",
    });
  }
}

function validateProviderSpecific(
  provider: GSPProvider,
  _exportType: ExportType,
  data: any,
  _errors: ExportValidationError[],
  warnings: ExportValidationError[],
) {
  // Provider-specific validation rules can be added here
  // For now, we'll just add a warning if provider metadata is missing
  if (!data.providerMetadata) {
    warnings.push({
      field: "providerMetadata",
      message: `Provider metadata for ${provider} is recommended`,
      severity: "warning",
    });
  }
}
