import { describe, it, expect } from 'vitest';
import Ajv from 'ajv';

const ajv = new Ajv();

describe('API Schema Validation', () => {
  const invoiceSchema = {
    type: 'object',
    required: ['id', 'invoiceNumber', 'businessName', 'clientName', 'totalAmount'],
    properties: {
      id: { type: 'number' },
      invoiceNumber: { type: 'string' },
      businessName: { type: 'string' },
      clientName: { type: 'string' },
      totalAmount: { type: 'number' },
      customerGSTInfo: {
        type: 'object',
        properties: {
          gstin: { type: 'string', minLength: 15, maxLength: 15 },
          stateCode: { type: 'string' },
          taxType: { enum: ['regular', 'composition'] },
        },
      },
    },
  };

  const dashboardMetricsSchema = {
    type: 'object',
    required: ['totalSales', 'totalExpenses', 'netProfit'],
    properties: {
      totalSales: { type: 'number' },
      totalExpenses: { type: 'number' },
      netProfit: { type: 'number' },
      outstandingReceivables: { type: 'number' },
      currentStockValue: { type: 'number' },
      cashInflow: { type: 'number' },
      cashOutflow: { type: 'number' },
    },
  };

  it('should validate invoice schema', () => {
    const validate = ajv.compile(invoiceSchema);
    
    const validInvoice = {
      id: 1,
      invoiceNumber: 'INV-001',
      businessName: 'Test Business',
      clientName: 'Test Client',
      totalAmount: 1000,
      customerGSTInfo: {
        gstin: '27AABCT1234A1Z5',
        stateCode: '27',
        taxType: 'regular',
      },
    };
    
    expect(validate(validInvoice)).toBe(true);
  });

  it('should reject invalid GSTIN length', () => {
    const validate = ajv.compile(invoiceSchema);
    
    const invalidInvoice = {
      id: 1,
      invoiceNumber: 'INV-001',
      businessName: 'Test Business',
      clientName: 'Test Client',
      totalAmount: 1000,
      customerGSTInfo: {
        gstin: '12345', // Invalid length
        stateCode: '27',
        taxType: 'regular',
      },
    };
    
    expect(validate(invalidInvoice)).toBe(false);
  });

  it('should validate dashboard metrics schema', () => {
    const validate = ajv.compile(dashboardMetricsSchema);
    
    const validMetrics = {
      totalSales: 50000,
      totalExpenses: 30000,
      netProfit: 20000,
      outstandingReceivables: 10000,
      currentStockValue: 25000,
      cashInflow: 55000,
      cashOutflow: 35000,
    };
    
    expect(validate(validMetrics)).toBe(true);
  });
});

