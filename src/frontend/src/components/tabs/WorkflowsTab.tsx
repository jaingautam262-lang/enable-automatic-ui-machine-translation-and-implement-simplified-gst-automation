import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  Edit,
  Play,
  Plus,
  Trash2,
  Workflow,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useCreateWorkflow,
  useDeleteWorkflow,
  useListWorkflowRuns,
  useListWorkflows,
  useRunWorkflow,
  useUpdateWorkflow,
} from "../../hooks/useGSTWorkflows";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { useI18n } from "../../i18n/useI18n";
import type { WorkflowDefinition } from "../../types/gst-workflows";

export default function WorkflowsTab() {
  const { t } = useI18n();
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal().toString();

  const { data: workflows = [], isLoading } = useListWorkflows(principal);
  const { data: workflowRuns = [] } = useListWorkflowRuns(principal);
  const _createWorkflow = useCreateWorkflow(principal);
  const updateWorkflow = useUpdateWorkflow(principal);
  const deleteWorkflow = useDeleteWorkflow(principal);
  const runWorkflow = useRunWorkflow(principal);

  const [_showCreateDialog, setShowCreateDialog] = useState(false);
  const [_editingWorkflow, _setEditingWorkflow] =
    useState<WorkflowDefinition | null>(null);

  const handleRunWorkflow = (workflowId: string) => {
    runWorkflow.mutate(workflowId, {
      onSuccess: () => toast.success(t("workflows.runSuccess")),
      onError: (error: any) =>
        toast.error(error.message || t("workflows.runFailed")),
    });
  };

  const handleToggleEnabled = (workflow: WorkflowDefinition) => {
    if (workflow.isPredefined) {
      toast.error(t("workflows.cannotEditPredefined"));
      return;
    }

    updateWorkflow.mutate(
      { id: workflow.id, updates: { enabled: !workflow.enabled } },
      {
        onSuccess: () => toast.success(t("workflows.updateSuccess")),
        onError: (error: any) =>
          toast.error(error.message || t("workflows.updateFailed")),
      },
    );
  };

  const handleDelete = (workflow: WorkflowDefinition) => {
    if (workflow.isPredefined) {
      toast.error(t("workflows.cannotDeletePredefined"));
      return;
    }

    if (confirm(t("workflows.confirmDelete"))) {
      deleteWorkflow.mutate(workflow.id, {
        onSuccess: () => toast.success(t("workflows.deleteSuccess")),
        onError: (error: any) =>
          toast.error(error.message || t("workflows.deleteFailed")),
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Workflow className="h-6 w-6" />
          <h2 className="text-2xl font-bold">{t("workflows.title")}</h2>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t("workflows.createWorkflow")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("workflows.availableWorkflows")}</CardTitle>
          <CardDescription>
            {t("workflows.availableWorkflowsDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("common.loading")}
            </div>
          ) : workflows.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("workflows.noWorkflows")}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("workflows.name")}</TableHead>
                  <TableHead>{t("workflows.steps")}</TableHead>
                  <TableHead>{t("workflows.type")}</TableHead>
                  <TableHead>{t("workflows.enabled")}</TableHead>
                  <TableHead className="text-right">
                    {t("common.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workflows.map((workflow) => (
                  <TableRow key={workflow.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{workflow.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {workflow.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {workflow.steps.length} steps
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {workflow.isPredefined ? (
                        <Badge>Predefined</Badge>
                      ) : (
                        <Badge variant="secondary">Custom</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={workflow.enabled}
                        onCheckedChange={() => handleToggleEnabled(workflow)}
                        disabled={workflow.isPredefined}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRunWorkflow(workflow.id)}
                          disabled={runWorkflow.isPending}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        {!workflow.isPredefined && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(workflow)}
                            disabled={deleteWorkflow.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("workflows.recentRuns")}</CardTitle>
          <CardDescription>
            {t("workflows.recentRunsDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {workflowRuns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("workflows.noRuns")}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("workflows.workflowName")}</TableHead>
                  <TableHead>{t("workflows.startedAt")}</TableHead>
                  <TableHead>{t("workflows.duration")}</TableHead>
                  <TableHead>{t("workflows.status")}</TableHead>
                  <TableHead>{t("workflows.stepsCompleted")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workflowRuns.slice(0, 10).map((run) => {
                  const duration = run.finishedAt
                    ? ((run.finishedAt - run.startedAt) / 1000).toFixed(1)
                    : "-";
                  const completedSteps = run.stepLogs.filter(
                    (s) => s.status === "success",
                  ).length;

                  return (
                    <TableRow key={run.id}>
                      <TableCell className="font-medium">
                        {run.workflowName}
                      </TableCell>
                      <TableCell>
                        {new Date(run.startedAt).toLocaleString()}
                      </TableCell>
                      <TableCell>{duration}s</TableCell>
                      <TableCell>
                        {run.status === "success" && (
                          <Badge className="bg-green-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Success
                          </Badge>
                        )}
                        {run.status === "failed" && (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Failed
                          </Badge>
                        )}
                        {run.status === "running" && (
                          <Badge variant="outline">Running</Badge>
                        )}
                        {run.status === "partial" && (
                          <Badge variant="secondary">Partial</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {completedSteps}/{run.stepLogs.length}
                      </TableCell>
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
