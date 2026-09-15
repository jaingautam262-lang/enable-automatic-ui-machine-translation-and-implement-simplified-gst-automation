function validateGSTR1(data: any, errors: ExportValidationError[], warnings: ExportValidationError[]) {
  if (!data.period) {
    errors.push({ field: 'period', message: 'Period is required (MMYYYY format)', severity: 'error' });
  }

  const hasB2B = Array.isArray(data.b2bInvoices) && data.b2bInvoices.length > 0;
  const hasB2C = Array.isArray(data.b2cInvoices) && data.b2cInvoices.length > 0;
  if (!hasB2B && !hasB2C) {
    warnings.push({ field: 'invoices', message: 'No invoices found for the period', severity: 'warning' });
  }
}

export { validateGSTR1 };