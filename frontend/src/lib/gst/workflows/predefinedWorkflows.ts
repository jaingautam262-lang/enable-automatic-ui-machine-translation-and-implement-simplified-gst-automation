import { WorkflowDefinition } from '../../../types/gst-workflows';

export const PREDEFINED_WORKFLOWS: Omit<WorkflowDefinition, 'id' | 'owner' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'E-Invoice Generation',
    description: 'Generate e-invoices for all pending invoices',
    isPredefined: true,
    enabled: true,
    steps: [
      {
        id: 'step-1',
        name: 'Generate E-Invoices',
        operationType: 'einvoice',
        description: 'Generate IRN and signed QR codes for invoices',
        order: 1,
      },
    ],
  },
  {
    name: 'E-Way Bill Generation',
    description: 'Generate e-way bills for goods transportation',
    isPredefined: true,
    enabled: true,
    steps: [
      {
        id: 'step-1',
        name: 'Generate E-Way Bills',
        operationType: 'ewayBill',
        description: 'Create e-way bills for interstate/intrastate movement',
        order: 1,
      },
    ],
  },
  {
    name: 'GSTR-1 Filing Preparation',
    description: 'Prepare GSTR-1 return for outward supplies',
    isPredefined: true,
    enabled: true,
    steps: [
      {
        id: 'step-1',
        name: 'Compile GSTR-1 Data',
        operationType: 'gstr1',
        description: 'Aggregate B2B and B2C invoices for the period',
        order: 1,
      },
    ],
  },
  {
    name: 'GSTR-3B Filing Preparation',
    description: 'Prepare GSTR-3B return with tax liability',
    isPredefined: true,
    enabled: true,
    steps: [
      {
        id: 'step-1',
        name: 'Compile GSTR-3B Data',
        operationType: 'gstr3b',
        description: 'Calculate outward supplies, ITC, and net tax liability',
        order: 1,
      },
    ],
  },
  {
    name: 'GST Reconciliation',
    description: 'Reconcile GSTR-2A/2B with purchase records',
    isPredefined: true,
    enabled: true,
    steps: [
      {
        id: 'step-1',
        name: 'Run Reconciliation',
        operationType: 'reconciliation',
        description: 'Match inward supplies with GSTR-2A/2B data',
        order: 1,
      },
    ],
  },
  {
    name: 'Complete GST Workflow',
    description: 'End-to-end GST compliance workflow',
    isPredefined: true,
    enabled: true,
    steps: [
      {
        id: 'step-1',
        name: 'Generate E-Invoices',
        operationType: 'einvoice',
        description: 'Generate IRN for all invoices',
        order: 1,
      },
      {
        id: 'step-2',
        name: 'Generate E-Way Bills',
        operationType: 'ewayBill',
        description: 'Create e-way bills for transportation',
        order: 2,
      },
      {
        id: 'step-3',
        name: 'Prepare GSTR-1',
        operationType: 'gstr1',
        description: 'Compile outward supplies',
        order: 3,
      },
      {
        id: 'step-4',
        name: 'Run Reconciliation',
        operationType: 'reconciliation',
        description: 'Match inward supplies',
        order: 4,
      },
      {
        id: 'step-5',
        name: 'Prepare GSTR-3B',
        operationType: 'gstr3b',
        description: 'Calculate final tax liability',
        order: 5,
      },
    ],
  },
];
