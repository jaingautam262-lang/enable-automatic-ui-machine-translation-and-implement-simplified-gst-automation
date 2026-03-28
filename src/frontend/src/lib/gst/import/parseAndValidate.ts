import { UnifiedGSTRecord } from "../../../types/gst-universal";

export interface ImportValidationResult {
  isValid: boolean;
  errors: Array<{
    path: string;
    message: string;
  }>;
  warnings: Array<{
    path: string;
    message: string;
  }>;
  data?: any;
}

export function parseAndValidateGSTImport(
  jsonString: string,
): ImportValidationResult {
  const errors: Array<{ path: string; message: string }> = [];
  const warnings: Array<{ path: string; message: string }> = [];

  let data: any;
  try {
    data = JSON.parse(jsonString);
  } catch (_error) {
    return {
      isValid: false,
      errors: [{ path: "root", message: "Invalid JSON format" }],
      warnings: [],
    };
  }

  // Validate required fields
  if (!data.type) {
    errors.push({
      path: "type",
      message:
        "Record type is required (invoice, einvoice, ewayBill, gstr1, gstr3b, reconciliation)",
    });
  }

  if (!data.data) {
    errors.push({ path: "data", message: "Data field is required" });
  }

  // Type-specific validation
  if (data.type === "invoice") {
    validateInvoiceData(data.data, errors, warnings);
  } else if (data.type === "einvoice") {
    validateEInvoiceData(data.data, errors, warnings);
  } else if (data.type === "ewayBill") {
    validateEWayBillData(data.data, errors, warnings);
  } else if (data.type === "gstr1") {
    validateGSTR1Data(data.data, errors, warnings);
  } else if (data.type === "gstr3b") {
    validateGSTR3BData(data.data, errors, warnings);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    data: errors.length === 0 ? data : undefined,
  };
}

function validateInvoiceData(data: any, errors: any[], warnings: any[]) {
  if (!data.invoiceNumber) {
    errors.push({
      path: "data.invoiceNumber",
      message: "Invoice number is required",
    });
  }
  if (!data.customerGSTIN) {
    warnings.push({
      path: "data.customerGSTIN",
      message: "Customer GSTIN is recommended",
    });
  }
  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    errors.push({
      path: "data.items",
      message: "At least one item is required",
    });
  }
}

function validateEInvoiceData(data: any, errors: any[], _warnings: any[]) {
  if (!data.invoiceNumber) {
    errors.push({
      path: "data.invoiceNumber",
      message: "Invoice number is required",
    });
  }
  if (!data.supplierGSTIN) {
    errors.push({
      path: "data.supplierGSTIN",
      message: "Supplier GSTIN is required",
    });
  }
  if (!data.customerGSTIN) {
    errors.push({
      path: "data.customerGSTIN",
      message: "Customer GSTIN is required",
    });
  }
}

function validateEWayBillData(data: any, errors: any[], _warnings: any[]) {
  if (!data.invoiceNumber) {
    errors.push({
      path: "data.invoiceNumber",
      message: "Invoice number is required",
    });
  }
  if (!data.fromGSTIN) {
    errors.push({ path: "data.fromGSTIN", message: "From GSTIN is required" });
  }
  if (!data.toGSTIN) {
    errors.push({ path: "data.toGSTIN", message: "To GSTIN is required" });
  }
}

function validateGSTR1Data(data: any, errors: any[], _warnings: any[]) {
  if (!data.period) {
    errors.push({
      path: "data.period",
      message: "Period is required (MMYYYY format)",
    });
  }
}

function validateGSTR3BData(data: any, errors: any[], _warnings: any[]) {
  if (!data.period) {
    errors.push({
      path: "data.period",
      message: "Period is required (MMYYYY format)",
    });
  }
  if (!data.outwardSupplies) {
    errors.push({
      path: "data.outwardSupplies",
      message: "Outward supplies data is required",
    });
  }
}
