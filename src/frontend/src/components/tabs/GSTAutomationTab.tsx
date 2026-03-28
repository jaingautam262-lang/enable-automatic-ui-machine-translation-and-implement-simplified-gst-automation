import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Play,
  XCircle,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useGetAutomationStatus,
  useListAutomationLogs,
  useRunAutomationNow,
  useToggleAutomation,
} from "../../hooks/useGSTAutomation";
import { useListWorkflowRuns } from "../../hooks/useGSTWorkflows";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { useI18n } from "../../i18n/useI18n";
import type { AutomationRunLog } from "../../types/gst-universal";

export default function GSTAutomationTab() {
  const { t } = useI18n();
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal().toString();

  const { data: status } = useGetAutomationStatus(principal);
  const { data: logs = [] } = useListAutomationLogs(principal);
  const { data: workflowRuns = [] } = useListWorkflowRuns(principal);
  const runNow = useRunAutomationNow(principal);
  const toggleAutomation = useToggleAutomation(principal);

  const [selectedOperation, setSelectedOperation] =
    useState<AutomationRunLog["operationType"]>("fullSync");

  const handleToggleAutomation = async (enabled: boolean) => {
    try {
      await toggleAutomation.mutateAsync(enabled);
      toast.success(
        enabled ? t("gstAutomation.enabled") : t("gstAutomation.disabled"),
      );
    } catch (error: any) {
      toast.error(error.message || t("gstAutomation.toggleFailed"));
    }
  };

  const handleRunNow = async () => {
    try {
      await runNow.mutateAsync(selectedOperation);
      toast.success(t("gstAutomation.runStarted"));
    } catch (error: any) {
      toast.error(error.message || t("gstAutomation.runFailed"));
    }
  };

  // Combine automation logs and workflow runs
  const combinedLogs = [
    ...logs.map((log) => ({ ...log, source: "automation" as const })),
    ...workflowRuns.map((run) => ({
      id: run.id,
      operationType: "workflow" as const,
      workflowName: run.workflowName,
      startedAt: run.startedAt,
      finishedAt: run.finishedAt,
      status: run.status,
      recordsProcessed: run.stepLogs.reduce(
        (sum, s) => sum + (s.recordsProcessed || 0),
        0,
      ),
      recordsFailed: run.stepLogs.reduce(
        (sum, s) => sum + (s.recordsFailed || 0),
        0,
      ),
      source: "workflow" as const,
    })),
  ].sort((a, b) => b.startedAt - a.startedAt);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Zap className="h-6 w-6" />
        <h2 className="text-2xl font-bold">{t("gstAutomation.title")}</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("gstAutomation.status")}</CardTitle>
          <CardDescription>
            {t("gstAutomation.statusDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="automation-toggle">
                {t("gstAutomation.enableAutomation")}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t("gstAutomation.enableDescription")}
              </p>
            </div>
            <Switch
              id="automation-toggle"
              checked={status?.enabled || false}
              onCheckedChange={handleToggleAutomation}
              disabled={
                toggleAutomation.isPending || !status?.credentialsConfigured
              }
            />
          </div>

          {!status?.credentialsConfigured && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                {t("gstAutomation.providerNotConfigured")}
              </p>
            </div>
          )}

          {status?.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {t("gstAutomation.lastRun")}
                </p>
                <p className="font-medium">
                  {status.lastRunTime
                    ? new Date(status.lastRunTime).toLocaleString()
                    : t("common.never")}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {t("gstAutomation.lastStatus")}
                </p>
                {status.lastRunStatus === "success" && (
                  <Badge className="bg-green-600">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {t("gstAutomation.statusSuccess")}
                  </Badge>
                )}
                {status.lastRunStatus === "failed" && (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" />
                    {t("gstAutomation.statusFailed")}
                  </Badge>
                )}
                {status.lastRunStatus === "partial" && (
                  <Badge variant="secondary">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {t("gstAutomation.statusPartial")}
                  </Badge>
                )}
                {!status.lastRunStatus && (
                  <Badge variant="outline">{t("common.none")}</Badge>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {t("gstAutomation.nextRun")}
                </p>
                <p className="font-medium">
                  {status.nextScheduledRun
                    ? new Date(status.nextScheduledRun).toLocaleString()
                    : t("common.none")}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("gstAutomation.manualRun")}</CardTitle>
          <CardDescription>
            {t("gstAutomation.manualRunDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="operation-select">
                {t("gstAutomation.selectOperation")}
              </Label>
              <Select
                value={selectedOperation}
                onValueChange={(value: AutomationRunLog["operationType"]) =>
                  setSelectedOperation(value)
                }
              >
                <SelectTrigger id="operation-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fullSync">
                    {t("gstAutomation.operations.fullSync")}
                  </SelectItem>
                  <SelectItem value="einvoice">
                    {t("gstAutomation.operations.einvoice")}
                  </SelectItem>
                  <SelectItem value="ewayBill">
                    {t("gstAutomation.operations.ewayBill")}
                  </SelectItem>
                  <SelectItem value="gstr1">
                    {t("gstAutomation.operations.gstr1")}
                  </SelectItem>
                  <SelectItem value="gstr3b">
                    {t("gstAutomation.operations.gstr3b")}
                  </SelectItem>
                  <SelectItem value="reconciliation">
                    {t("gstAutomation.operations.reconciliation")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleRunNow}
                disabled={runNow.isPending || !status?.credentialsConfigured}
              >
                <Play className="h-4 w-4 mr-2" />
                {runNow.isPending
                  ? t("gstAutomation.running")
                  : t("gstAutomation.runNow")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("gstAutomation.runLogs")}</CardTitle>
          <CardDescription>
            {t("gstAutomation.runLogsDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {combinedLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("gstAutomation.noLogs")}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("gstAutomation.operation")}</TableHead>
                  <TableHead>{t("gstAutomation.startedAt")}</TableHead>
                  <TableHead>{t("gstAutomation.duration")}</TableHead>
                  <TableHead>{t("gstAutomation.status")}</TableHead>
                  <TableHead>{t("gstAutomation.processed")}</TableHead>
                  <TableHead>{t("gstAutomation.failed")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {combinedLogs.slice(0, 20).map((log) => {
                  const duration = log.finishedAt
                    ? ((log.finishedAt - log.startedAt) / 1000).toFixed(1)
                    : "-";

                  return (
                    <TableRow key={log.id}>
                      <TableCell>
                        {log.source === "workflow" ? (
                          <div>
                            <Badge variant="outline">Workflow</Badge>
                            <div className="text-sm mt-1">
                              {(log as any).workflowName}
                            </div>
                          </div>
                        ) : (
                          <Badge variant="secondary">{log.operationType}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(log.startedAt).toLocaleString()}
                      </TableCell>
                      <TableCell>{duration}s</TableCell>
                      <TableCell>
                        {log.status === "success" && (
                          <Badge className="bg-green-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Success
                          </Badge>
                        )}
                        {log.status === "failed" && (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Failed
                          </Badge>
                        )}
                        {log.status === "running" && (
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            Running
                          </Badge>
                        )}
                        {log.status === "partial" && (
                          <Badge variant="secondary">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Partial
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{log.recordsProcessed || 0}</TableCell>
                      <TableCell>{log.recordsFailed || 0}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
