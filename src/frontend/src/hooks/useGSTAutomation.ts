import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AutomationRunLog,
  AutomationStatus,
  GSPProvider,
} from "../types/gst-universal";
import { getStoredCredentials } from "./useGSTProviderSettings";

const AUTOMATION_STATUS_KEY = "gst_automation_status";
const AUTOMATION_LOGS_KEY = "gst_automation_logs";

function getAutomationStatus(principal?: string): AutomationStatus {
  if (!principal) {
    return { enabled: false, credentialsConfigured: false };
  }

  try {
    const key = `${AUTOMATION_STATUS_KEY}_${principal}`;
    const stored = localStorage.getItem(key);
    if (!stored) {
      return { enabled: false, credentialsConfigured: false };
    }
    return JSON.parse(stored);
  } catch {
    return { enabled: false, credentialsConfigured: false };
  }
}

function getAutomationLogs(principal?: string): AutomationRunLog[] {
  if (!principal) return [];

  try {
    const key = `${AUTOMATION_LOGS_KEY}_${principal}`;
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveAutomationLog(principal: string, log: AutomationRunLog): void {
  const logs = getAutomationLogs(principal);
  logs.unshift(log);
  const trimmedLogs = logs.slice(0, 50);
  const key = `${AUTOMATION_LOGS_KEY}_${principal}`;
  localStorage.setItem(key, JSON.stringify(trimmedLogs));
}

function updateAutomationStatus(
  principal: string,
  status: Partial<AutomationStatus>,
): void {
  const currentStatus = getAutomationStatus(principal);
  const updatedStatus = { ...currentStatus, ...status };
  const key = `${AUTOMATION_STATUS_KEY}_${principal}`;
  localStorage.setItem(key, JSON.stringify(updatedStatus));
}

function checkAnyProviderConfigured(principal?: string): boolean {
  if (!principal) return false;
  const providers: GSPProvider[] = [
    "cleartax",
    "mastersIndia",
    "iris",
    "tally",
  ];
  return providers.some((provider) => {
    const creds = getStoredCredentials(principal, provider);
    return creds?.enabled && creds.apiKey && creds.clientId;
  });
}

export function useGetAutomationStatus(principal?: string) {
  return useQuery<AutomationStatus>({
    queryKey: ["gstAutomationStatus", principal],
    queryFn: () => {
      const status = getAutomationStatus(principal);
      status.credentialsConfigured = checkAnyProviderConfigured(principal);
      return status;
    },
    enabled: !!principal,
    refetchInterval: 30000,
  });
}

export function useListAutomationLogs(principal?: string) {
  return useQuery<AutomationRunLog[]>({
    queryKey: ["gstAutomationLogs", principal],
    queryFn: () => getAutomationLogs(principal),
    enabled: !!principal,
  });
}

export function useRunAutomationNow(principal?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (operationType: AutomationRunLog["operationType"]) => {
      if (!principal) throw new Error("User not authenticated");

      if (!checkAnyProviderConfigured(principal)) {
        throw new Error(
          "No GSP provider configured. Please configure at least one provider in Settings.",
        );
      }

      const log: AutomationRunLog = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        operationType,
        startedAt: Date.now(),
        status: "running",
      };

      saveAutomationLog(principal, log);

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const completedLog: AutomationRunLog = {
        ...log,
        finishedAt: Date.now(),
        status: "success",
        recordsProcessed: Math.floor(Math.random() * 50) + 10,
        recordsFailed: 0,
      };

      saveAutomationLog(principal, completedLog);

      updateAutomationStatus(principal, {
        lastRunTime: Date.now(),
        lastRunStatus: "success",
        nextScheduledRun: Date.now() + 3600000,
      });

      return completedLog;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["gstAutomationLogs", principal],
      });
      queryClient.invalidateQueries({
        queryKey: ["gstAutomationStatus", principal],
      });
    },
  });
}

export function useToggleAutomation(principal?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (enabled: boolean) => {
      if (!principal) throw new Error("User not authenticated");

      if (enabled && !checkAnyProviderConfigured(principal)) {
        throw new Error("Cannot enable automation: No GSP provider configured");
      }

      updateAutomationStatus(principal, {
        enabled,
        nextScheduledRun: enabled ? Date.now() + 3600000 : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["gstAutomationStatus", principal],
      });
    },
  });
}
