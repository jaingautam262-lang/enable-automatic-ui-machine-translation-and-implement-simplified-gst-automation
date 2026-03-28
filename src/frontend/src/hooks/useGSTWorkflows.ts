import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PREDEFINED_WORKFLOWS } from "../lib/gst/workflows/predefinedWorkflows";
import type {
  WorkflowDefinition,
  WorkflowRunLog,
  WorkflowStepLog,
} from "../types/gst-workflows";

const WORKFLOWS_KEY = "gst_workflows";
const WORKFLOW_RUNS_KEY = "gst_workflow_runs";

function getStoredWorkflows(principal?: string): WorkflowDefinition[] {
  if (!principal) return [];
  try {
    const key = `${WORKFLOWS_KEY}_${principal}`;
    const stored = localStorage.getItem(key);
    if (!stored) {
      // Initialize with predefined workflows
      const predefined = PREDEFINED_WORKFLOWS.map((w, idx) => ({
        ...w,
        id: `predefined-${idx}`,
        owner: principal,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }));
      saveStoredWorkflows(principal, predefined);
      return predefined;
    }
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveStoredWorkflows(
  principal: string,
  workflows: WorkflowDefinition[],
): void {
  const key = `${WORKFLOWS_KEY}_${principal}`;
  localStorage.setItem(key, JSON.stringify(workflows));
}

function getWorkflowRuns(principal?: string): WorkflowRunLog[] {
  if (!principal) return [];
  try {
    const key = `${WORKFLOW_RUNS_KEY}_${principal}`;
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveWorkflowRun(principal: string, run: WorkflowRunLog): void {
  const runs = getWorkflowRuns(principal);
  runs.unshift(run);
  const trimmed = runs.slice(0, 50);
  const key = `${WORKFLOW_RUNS_KEY}_${principal}`;
  localStorage.setItem(key, JSON.stringify(trimmed));
}

export function useListWorkflows(principal?: string) {
  return useQuery<WorkflowDefinition[]>({
    queryKey: ["gstWorkflows", principal],
    queryFn: () => getStoredWorkflows(principal),
    enabled: !!principal,
  });
}

export function useGetWorkflow(
  principal: string | undefined,
  workflowId: string | undefined,
) {
  return useQuery<WorkflowDefinition | null>({
    queryKey: ["gstWorkflow", principal, workflowId],
    queryFn: () => {
      if (!principal || !workflowId) return null;
      const workflows = getStoredWorkflows(principal);
      return workflows.find((w) => w.id === workflowId) || null;
    },
    enabled: !!principal && !!workflowId,
  });
}

export function useCreateWorkflow(principal?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      workflow: Omit<
        WorkflowDefinition,
        "id" | "owner" | "createdAt" | "updatedAt"
      >,
    ) => {
      if (!principal) throw new Error("User not authenticated");

      const workflows = getStoredWorkflows(principal);
      const newWorkflow: WorkflowDefinition = {
        ...workflow,
        id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        owner: principal,
        isPredefined: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      workflows.push(newWorkflow);
      saveStoredWorkflows(principal, workflows);
      return newWorkflow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gstWorkflows", principal] });
    },
  });
}

export function useUpdateWorkflow(principal?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: { id: string; updates: Partial<WorkflowDefinition> }) => {
      if (!principal) throw new Error("User not authenticated");

      const workflows = getStoredWorkflows(principal);
      const index = workflows.findIndex((w) => w.id === id);
      if (index === -1) throw new Error("Workflow not found");

      // Prevent editing predefined workflows
      if (workflows[index].isPredefined) {
        throw new Error("Cannot edit predefined workflows");
      }

      workflows[index] = {
        ...workflows[index],
        ...updates,
        updatedAt: Date.now(),
      };

      saveStoredWorkflows(principal, workflows);
      return workflows[index];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gstWorkflows", principal] });
    },
  });
}

export function useDeleteWorkflow(principal?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!principal) throw new Error("User not authenticated");

      const workflows = getStoredWorkflows(principal);
      const workflow = workflows.find((w) => w.id === id);
      if (workflow?.isPredefined) {
        throw new Error("Cannot delete predefined workflows");
      }

      const filtered = workflows.filter((w) => w.id !== id);
      saveStoredWorkflows(principal, filtered);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gstWorkflows", principal] });
    },
  });
}

export function useRunWorkflow(principal?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workflowId: string) => {
      if (!principal) throw new Error("User not authenticated");

      const workflows = getStoredWorkflows(principal);
      const workflow = workflows.find((w) => w.id === workflowId);
      if (!workflow) throw new Error("Workflow not found");

      const runLog: WorkflowRunLog = {
        id: `run-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        workflowId: workflow.id,
        workflowName: workflow.name,
        startedAt: Date.now(),
        status: "running",
        stepLogs: workflow.steps.map((step) => ({
          stepId: step.id,
          stepName: step.name,
          startedAt: Date.now(),
          status: "pending",
        })),
      };

      saveWorkflowRun(principal, runLog);

      // Simulate workflow execution
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update step logs
      const completedStepLogs: WorkflowStepLog[] = workflow.steps.map(
        (step, idx) => ({
          stepId: step.id,
          stepName: step.name,
          startedAt: Date.now() - 2000 + idx * 400,
          finishedAt: Date.now() - 2000 + (idx + 1) * 400,
          status: "success",
          recordsProcessed: Math.floor(Math.random() * 20) + 5,
          recordsFailed: 0,
        }),
      );

      const completedRun: WorkflowRunLog = {
        ...runLog,
        finishedAt: Date.now(),
        status: "success",
        stepLogs: completedStepLogs,
      };

      saveWorkflowRun(principal, completedRun);
      return completedRun;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["gstWorkflowRuns", principal],
      });
      queryClient.invalidateQueries({
        queryKey: ["gstAutomationLogs", principal],
      });
    },
  });
}

export function useListWorkflowRuns(principal?: string) {
  return useQuery<WorkflowRunLog[]>({
    queryKey: ["gstWorkflowRuns", principal],
    queryFn: () => getWorkflowRuns(principal),
    enabled: !!principal,
  });
}
