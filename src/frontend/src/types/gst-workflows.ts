export interface WorkflowStep {
  id: string;
  name: string;
  operationType:
    | "gstr1"
    | "gstr3b"
    | "einvoice"
    | "ewayBill"
    | "reconciliation"
    | "fullSync";
  description: string;
  order: number;
}

export interface WorkflowDefinition {
  id: string;
  owner: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  enabled: boolean;
  isPredefined: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface WorkflowRunLog {
  id: string;
  workflowId: string;
  workflowName: string;
  startedAt: number;
  finishedAt?: number;
  status: "running" | "success" | "failed" | "partial";
  stepLogs: WorkflowStepLog[];
}

export interface WorkflowStepLog {
  stepId: string;
  stepName: string;
  startedAt: number;
  finishedAt?: number;
  status: "pending" | "running" | "success" | "failed" | "partial";
  errorMessage?: string;
  recordsProcessed?: number;
  recordsFailed?: number;
}
