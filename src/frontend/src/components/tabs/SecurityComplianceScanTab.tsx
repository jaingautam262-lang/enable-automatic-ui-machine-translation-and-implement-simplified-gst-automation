import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Archive,
  BarChart3,
  Bell,
  BookOpen,
  Bug,
  CheckCircle,
  CheckCircle2,
  ClipboardCheck,
  Cloud,
  Cpu,
  Database,
  Download,
  Eye,
  FileCheck,
  FileText,
  FileWarning,
  Filter,
  Gauge,
  Globe,
  HardDrive,
  Layers,
  Lock,
  Network,
  Pause,
  Play,
  RefreshCw,
  Scale,
  Search,
  Server,
  Settings,
  Shield,
  Target,
  Timer,
  TrendingUp,
  Unlock,
  Wifi,
  Workflow,
  XCircle,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Asset {
  id: string;
  name: string;
  ipAddress: string;
  type:
    | "server"
    | "workstation"
    | "network-device"
    | "iot"
    | "container"
    | "cloud";
  os: string;
  status: "online" | "offline" | "unknown";
  lastScan: Date;
  vulnerabilityCount: number;
  riskScore: number;
  controlGroup?: string;
}

interface Vulnerability {
  id: string;
  cveId: string;
  assetId: string;
  assetName: string;
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  cvssScore: number;
  exploitAvailable: boolean;
  patchAvailable: boolean;
  detectedDate: Date;
  status: "open" | "in-progress" | "resolved" | "accepted";
}

interface ConfigurationIssue {
  id: string;
  assetId: string;
  assetName: string;
  category: "os-hardening" | "application" | "cloud" | "network";
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  recommendation: string;
  status: "open" | "in-progress" | "resolved";
}

interface ComplianceFramework {
  id: string;
  name: "NIST" | "GDPR" | "HIPAA" | "PCI-DSS" | "SOC2" | "Internal";
  description: string;
  complianceScore: number;
  totalControls: number;
  passedControls: number;
  failedControls: number;
  lastAssessment: Date;
  gapAnalysis?: GapAnalysisItem[];
}

interface GapAnalysisItem {
  controlId: string;
  controlName: string;
  status: "pass" | "fail" | "partial";
  gap: string;
  priority: "critical" | "high" | "medium" | "low";
  remediation: string;
  estimatedEffort: string;
}

interface PolicyAudit {
  id: string;
  policyName: string;
  policyType: "internal" | "qualys" | "custom";
  description: string;
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  complianceScore: number;
  lastAudit: Date;
  status: "pass" | "fail" | "partial";
}

interface PolicyCheck {
  id: string;
  policyId: string;
  checkName: string;
  description: string;
  status: "pass" | "fail";
  severity: "critical" | "high" | "medium" | "low";
  affectedAssets: string[];
  remediation: string;
  evidence?: string;
}

interface MalwareDetection {
  id: string;
  assetId: string;
  assetName: string;
  malwareType: string;
  severity: "critical" | "high" | "medium" | "low";
  filePath: string;
  detectedDate: Date;
  status: "quarantined" | "removed" | "investigating";
  threatFamily: string;
}

interface SecurityAlert {
  id: string;
  type:
    | "vulnerability"
    | "malware"
    | "configuration"
    | "compliance"
    | "anomaly"
    | "policy-violation";
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  affectedAssets: string[];
  timestamp: Date;
  status: "new" | "acknowledged" | "resolved";
}

interface ScanConfiguration {
  id: string;
  name: string;
  type:
    | "network-discovery"
    | "vulnerability"
    | "configuration"
    | "malware"
    | "compliance"
    | "policy-audit";
  frequency: "continuous" | "hourly" | "daily" | "weekly" | "monthly";
  enabled: boolean;
  lastRun: Date | null;
  nextRun: Date | null;
  targetScope: "all" | "control-group" | "specific-hosts";
  controlGroup?: string;
  asynchronous: boolean;
  performanceOptimized: boolean;
}

interface ControlGroup {
  id: string;
  name: string;
  description: string;
  assetCount: number;
  assetIds: string[];
  scanPriority: "critical" | "high" | "medium" | "low";
}

interface AuditLog {
  id: string;
  timestamp: Date;
  eventType: string;
  severity: "info" | "warning" | "error";
  description: string;
  user: string;
  evidence: string;
}

export default function SecurityComplianceScanTab() {
  const [activeSubTab, setActiveSubTab] = useState("dashboard");
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [selectedFramework, setSelectedFramework] = useState<string>("all");
  const [selectedControlGroup, setSelectedControlGroup] =
    useState<string>("all");
  const [showScalabilityDialog, setShowScalabilityDialog] = useState(false);
  const [showPolicyAuditDialog, setShowPolicyAuditDialog] = useState(false);
  const [showGapAnalysisDialog, setShowGapAnalysisDialog] = useState(false);
  const [selectedGapFramework, setSelectedGapFramework] =
    useState<ComplianceFramework | null>(null);
  const [asyncScanEnabled, setAsyncScanEnabled] = useState(true);
  const [performanceOptimization, setPerformanceOptimization] = useState(true);

  // Mock data - in production, this would come from backend
  const [assets] = useState<Asset[]>([
    {
      id: "1",
      name: "Web Server 01",
      ipAddress: "192.168.1.10",
      type: "server",
      os: "Ubuntu 22.04",
      status: "online",
      lastScan: new Date(Date.now() - 3600000),
      vulnerabilityCount: 5,
      riskScore: 7.2,
      controlGroup: "production-servers",
    },
    {
      id: "2",
      name: "Database Server",
      ipAddress: "192.168.1.20",
      type: "server",
      os: "CentOS 8",
      status: "online",
      lastScan: new Date(Date.now() - 7200000),
      vulnerabilityCount: 12,
      riskScore: 8.5,
      controlGroup: "production-servers",
    },
    {
      id: "3",
      name: "Workstation-Finance",
      ipAddress: "192.168.1.105",
      type: "workstation",
      os: "Windows 11",
      status: "online",
      lastScan: new Date(Date.now() - 1800000),
      vulnerabilityCount: 3,
      riskScore: 4.1,
      controlGroup: "finance-workstations",
    },
  ]);

  const [controlGroups] = useState<ControlGroup[]>([
    {
      id: "cg1",
      name: "Production Servers",
      description: "Critical production infrastructure",
      assetCount: 45,
      assetIds: ["1", "2"],
      scanPriority: "critical",
    },
    {
      id: "cg2",
      name: "Finance Workstations",
      description: "Finance department endpoints",
      assetCount: 28,
      assetIds: ["3"],
      scanPriority: "high",
    },
    {
      id: "cg3",
      name: "Cloud Infrastructure",
      description: "AWS and Azure resources",
      assetCount: 156,
      assetIds: [],
      scanPriority: "high",
    },
    {
      id: "cg4",
      name: "IoT Devices",
      description: "Connected IoT endpoints",
      assetCount: 89,
      assetIds: [],
      scanPriority: "medium",
    },
  ]);

  const [vulnerabilities] = useState<Vulnerability[]>([
    {
      id: "v1",
      cveId: "CVE-2024-1234",
      assetId: "2",
      assetName: "Database Server",
      severity: "critical",
      title: "SQL Injection Vulnerability in MySQL",
      description:
        "Critical SQL injection vulnerability allowing remote code execution",
      cvssScore: 9.8,
      exploitAvailable: true,
      patchAvailable: true,
      detectedDate: new Date(Date.now() - 86400000),
      status: "open",
    },
    {
      id: "v2",
      cveId: "CVE-2024-5678",
      assetId: "1",
      assetName: "Web Server 01",
      severity: "high",
      title: "Apache HTTP Server Buffer Overflow",
      description: "Buffer overflow vulnerability in Apache HTTP Server",
      cvssScore: 7.5,
      exploitAvailable: false,
      patchAvailable: true,
      detectedDate: new Date(Date.now() - 172800000),
      status: "in-progress",
    },
  ]);

  const [configIssues] = useState<ConfigurationIssue[]>([
    {
      id: "c1",
      assetId: "1",
      assetName: "Web Server 01",
      category: "os-hardening",
      severity: "high",
      title: "Weak SSH Configuration",
      description: "SSH server allows password authentication and root login",
      recommendation:
        "Disable password authentication and root login. Use key-based authentication only.",
      status: "open",
    },
    {
      id: "c2",
      assetId: "2",
      assetName: "Database Server",
      category: "application",
      severity: "critical",
      title: "Database Running with Root Privileges",
      description: "MySQL database is running with root user privileges",
      recommendation:
        "Create dedicated database user with minimal required privileges.",
      status: "open",
    },
  ]);

  const [complianceFrameworks] = useState<ComplianceFramework[]>([
    {
      id: "f1",
      name: "NIST",
      description: "NIST Cybersecurity Framework",
      complianceScore: 78,
      totalControls: 108,
      passedControls: 84,
      failedControls: 24,
      lastAssessment: new Date(Date.now() - 604800000),
      gapAnalysis: [
        {
          controlId: "NIST-AC-2",
          controlName: "Account Management",
          status: "fail",
          gap: "Missing automated account provisioning and deprovisioning",
          priority: "high",
          remediation:
            "Implement automated identity lifecycle management system",
          estimatedEffort: "2-3 weeks",
        },
        {
          controlId: "NIST-SC-7",
          controlName: "Boundary Protection",
          status: "partial",
          gap: "Network segmentation incomplete for production environments",
          priority: "critical",
          remediation: "Complete network segmentation with VLAN isolation",
          estimatedEffort: "4-6 weeks",
        },
        {
          controlId: "NIST-AU-6",
          controlName: "Audit Review and Analysis",
          status: "fail",
          gap: "No automated log analysis and correlation",
          priority: "high",
          remediation: "Deploy SIEM solution with automated alerting",
          estimatedEffort: "3-4 weeks",
        },
      ],
    },
    {
      id: "f2",
      name: "GDPR",
      description: "General Data Protection Regulation",
      complianceScore: 85,
      totalControls: 45,
      passedControls: 38,
      failedControls: 7,
      lastAssessment: new Date(Date.now() - 1209600000),
      gapAnalysis: [
        {
          controlId: "GDPR-Art32",
          controlName: "Security of Processing",
          status: "partial",
          gap: "Encryption at rest not implemented for all data stores",
          priority: "critical",
          remediation: "Enable encryption for all databases and file storage",
          estimatedEffort: "2 weeks",
        },
      ],
    },
    {
      id: "f3",
      name: "PCI-DSS",
      description: "Payment Card Industry Data Security Standard",
      complianceScore: 72,
      totalControls: 78,
      passedControls: 56,
      failedControls: 22,
      lastAssessment: new Date(Date.now() - 2592000000),
      gapAnalysis: [
        {
          controlId: "PCI-2.1",
          controlName: "Default Passwords",
          status: "fail",
          gap: "Default passwords still in use on network devices",
          priority: "critical",
          remediation:
            "Change all default passwords and implement password policy",
          estimatedEffort: "1 week",
        },
        {
          controlId: "PCI-10.2",
          controlName: "Audit Logs",
          status: "fail",
          gap: "Insufficient audit logging for cardholder data access",
          priority: "high",
          remediation: "Enable comprehensive audit logging with retention",
          estimatedEffort: "2 weeks",
        },
      ],
    },
    {
      id: "f4",
      name: "HIPAA",
      description: "Health Insurance Portability and Accountability Act",
      complianceScore: 81,
      totalControls: 64,
      passedControls: 52,
      failedControls: 12,
      lastAssessment: new Date(Date.now() - 1814400000),
      gapAnalysis: [
        {
          controlId: "HIPAA-164.312(a)(1)",
          controlName: "Access Control",
          status: "partial",
          gap: "Role-based access control not fully implemented",
          priority: "high",
          remediation: "Complete RBAC implementation with least privilege",
          estimatedEffort: "3 weeks",
        },
        {
          controlId: "HIPAA-164.312(e)(1)",
          controlName: "Transmission Security",
          status: "fail",
          gap: "PHI transmitted without encryption on internal network",
          priority: "critical",
          remediation: "Implement TLS for all PHI transmissions",
          estimatedEffort: "2 weeks",
        },
      ],
    },
  ]);

  const [policyAudits] = useState<PolicyAudit[]>([
    {
      id: "pa1",
      policyName: "Corporate Security Baseline",
      policyType: "internal",
      description: "Internal security standards for all systems",
      totalChecks: 45,
      passedChecks: 38,
      failedChecks: 7,
      complianceScore: 84,
      lastAudit: new Date(Date.now() - 259200000),
      status: "partial",
    },
    {
      id: "pa2",
      policyName: "Qualys CIS Benchmark",
      policyType: "qualys",
      description: "CIS security configuration benchmark",
      totalChecks: 156,
      passedChecks: 142,
      failedChecks: 14,
      complianceScore: 91,
      lastAudit: new Date(Date.now() - 432000000),
      status: "pass",
    },
    {
      id: "pa3",
      policyName: "Database Hardening Policy",
      policyType: "custom",
      description: "Custom database security requirements",
      totalChecks: 28,
      passedChecks: 19,
      failedChecks: 9,
      complianceScore: 68,
      lastAudit: new Date(Date.now() - 604800000),
      status: "fail",
    },
  ]);

  const [policyChecks] = useState<PolicyCheck[]>([
    {
      id: "pc1",
      policyId: "pa1",
      checkName: "Password Complexity",
      description: "Passwords must meet complexity requirements",
      status: "fail",
      severity: "high",
      affectedAssets: ["Web Server 01", "Database Server"],
      remediation: "Enable password complexity policy in Active Directory",
      evidence: "Password policy audit log - 2024-01-15",
    },
    {
      id: "pc2",
      policyId: "pa1",
      checkName: "Firewall Enabled",
      description: "Host-based firewall must be enabled",
      status: "pass",
      severity: "critical",
      affectedAssets: [],
      remediation: "N/A",
      evidence: "Firewall status check - 2024-01-15",
    },
    {
      id: "pc3",
      policyId: "pa3",
      checkName: "Database Encryption",
      description: "Database must use TLS for connections",
      status: "fail",
      severity: "critical",
      affectedAssets: ["Database Server"],
      remediation: "Enable TLS encryption for MySQL connections",
      evidence: "Database configuration audit - 2024-01-10",
    },
  ]);

  const [malwareDetections] = useState<MalwareDetection[]>([
    {
      id: "m1",
      assetId: "3",
      assetName: "Workstation-Finance",
      malwareType: "Trojan",
      severity: "critical",
      filePath: "C:\\Users\\Admin\\Downloads\\invoice.exe",
      detectedDate: new Date(Date.now() - 43200000),
      status: "quarantined",
      threatFamily: "Emotet",
    },
  ]);

  const [securityAlerts] = useState<SecurityAlert[]>([
    {
      id: "a1",
      type: "vulnerability",
      severity: "critical",
      title: "Critical Vulnerability Detected",
      description: "CVE-2024-1234 detected on Database Server",
      affectedAssets: ["Database Server"],
      timestamp: new Date(Date.now() - 3600000),
      status: "new",
    },
    {
      id: "a2",
      type: "malware",
      severity: "critical",
      title: "Malware Detected and Quarantined",
      description: "Emotet trojan detected on Workstation-Finance",
      affectedAssets: ["Workstation-Finance"],
      timestamp: new Date(Date.now() - 43200000),
      status: "acknowledged",
    },
    {
      id: "a3",
      type: "policy-violation",
      severity: "high",
      title: "Policy Violation: Password Complexity",
      description: "Multiple systems failing password complexity requirements",
      affectedAssets: ["Web Server 01", "Database Server"],
      timestamp: new Date(Date.now() - 259200000),
      status: "new",
    },
  ]);

  const [scanConfigs] = useState<ScanConfiguration[]>([
    {
      id: "s1",
      name: "Network Discovery",
      type: "network-discovery",
      frequency: "continuous",
      enabled: true,
      lastRun: new Date(Date.now() - 1800000),
      nextRun: new Date(Date.now() + 1800000),
      targetScope: "all",
      asynchronous: true,
      performanceOptimized: true,
    },
    {
      id: "s2",
      name: "Vulnerability Scan",
      type: "vulnerability",
      frequency: "daily",
      enabled: true,
      lastRun: new Date(Date.now() - 86400000),
      nextRun: new Date(Date.now() + 86400000),
      targetScope: "control-group",
      controlGroup: "production-servers",
      asynchronous: true,
      performanceOptimized: true,
    },
    {
      id: "s3",
      name: "Compliance Assessment",
      type: "compliance",
      frequency: "weekly",
      enabled: true,
      lastRun: new Date(Date.now() - 604800000),
      nextRun: new Date(Date.now() + 604800000),
      targetScope: "all",
      asynchronous: false,
      performanceOptimized: true,
    },
    {
      id: "s4",
      name: "Policy Audit - Production",
      type: "policy-audit",
      frequency: "daily",
      enabled: true,
      lastRun: new Date(Date.now() - 172800000),
      nextRun: new Date(Date.now() + 86400000),
      targetScope: "control-group",
      controlGroup: "production-servers",
      asynchronous: true,
      performanceOptimized: true,
    },
  ]);

  const [auditLogs] = useState<AuditLog[]>([
    {
      id: "al1",
      timestamp: new Date(Date.now() - 3600000),
      eventType: "Vulnerability Scan Completed",
      severity: "info",
      description:
        "Completed vulnerability scan on production-servers control group",
      user: "system",
      evidence: "Scan report ID: VSR-2024-001",
    },
    {
      id: "al2",
      timestamp: new Date(Date.now() - 7200000),
      eventType: "Policy Violation Detected",
      severity: "warning",
      description: "Password complexity policy violation on 2 assets",
      user: "system",
      evidence: "Policy audit log: PAL-2024-045",
    },
    {
      id: "al3",
      timestamp: new Date(Date.now() - 10800000),
      eventType: "Compliance Assessment Failed",
      severity: "error",
      description: "PCI-DSS compliance score dropped below threshold",
      user: "system",
      evidence: "Compliance report: CR-2024-012",
    },
  ]);

  const handleStartScan = (scanType: string, scope?: string) => {
    setIsScanning(true);
    setScanProgress(0);
    const scopeText = scope ? ` (${scope})` : "";
    toast.info(`Starting ${scanType} scan${scopeText}...`);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          toast.success(`${scanType} scan completed successfully`);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const handleExportReport = (format: "pdf" | "excel", reportType: string) => {
    toast.success(
      `Exporting ${reportType} report as ${format.toUpperCase()}...`,
    );
    // In production, this would trigger actual report generation
  };

  const handleViewGapAnalysis = (framework: ComplianceFramework) => {
    setSelectedGapFramework(framework);
    setShowGapAnalysisDialog(true);
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      critical: "destructive",
      high: "destructive",
      medium: "default",
      low: "secondary",
    };
    return (
      <Badge variant={variants[severity] || "default"}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      online: "default",
      offline: "destructive",
      unknown: "outline",
      open: "destructive",
      "in-progress": "default",
      resolved: "secondary",
      new: "destructive",
      acknowledged: "default",
      quarantined: "default",
      removed: "secondary",
      pass: "secondary",
      fail: "destructive",
      partial: "default",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const getAssetIcon = (type: string) => {
    const icons: Record<string, any> = {
      server: Server,
      workstation: Cpu,
      "network-device": Wifi,
      iot: Globe,
      container: Database,
      cloud: Cloud,
    };
    const Icon = icons[type] || HardDrive;
    return <Icon className="h-4 w-4" />;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const _totalAssets = assets.length;
  const totalVulnerabilities = vulnerabilities.length;
  const criticalVulnerabilities = vulnerabilities.filter(
    (v) => v.severity === "critical",
  ).length;
  const averageComplianceScore = Math.round(
    complianceFrameworks.reduce((sum, f) => sum + f.complianceScore, 0) /
      complianceFrameworks.length,
  );
  const activeAlerts = securityAlerts.filter((a) => a.status === "new").length;
  const totalControlGroups = controlGroups.length;
  const totalAssetsInGroups = controlGroups.reduce(
    (sum, cg) => sum + cg.assetCount,
    0,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Security & Compliance Scan
          </h2>
          <p className="text-muted-foreground">
            Enterprise-scale security scanning with policy auditing and
            compliance verification
          </p>
        </div>
        <img
          src="/assets/generated/security-scanning-dashboard.dim_800x600.png"
          alt="Security Scanning"
          className="h-16 w-16 object-contain"
        />
      </div>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="dashboard" className="gap-2">
            <Activity className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="assets" className="gap-2">
            <Network className="h-4 w-4" />
            Assets
          </TabsTrigger>
          <TabsTrigger value="vulnerabilities" className="gap-2">
            <Bug className="h-4 w-4" />
            Vulnerabilities
          </TabsTrigger>
          <TabsTrigger value="configuration" className="gap-2">
            <Settings className="h-4 w-4" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="compliance" className="gap-2">
            <FileText className="h-4 w-4" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="policy-audit" className="gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Policy Audit
          </TabsTrigger>
          <TabsTrigger value="malware" className="gap-2">
            <FileWarning className="h-4 w-4" />
            Malware
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2">
            <Bell className="h-4 w-4" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="scalability" className="gap-2">
            <Layers className="h-4 w-4" />
            Scalability
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Assets
                </CardTitle>
                <Network className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalAssetsInGroups}</div>
                <p className="text-xs text-muted-foreground">
                  Across {totalControlGroups} control groups
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Vulnerabilities
                </CardTitle>
                <Bug className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalVulnerabilities}</div>
                <p className="text-xs text-destructive">
                  {criticalVulnerabilities} Critical
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Compliance Score
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {averageComplianceScore}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Average across frameworks
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Policy Compliance
                </CardTitle>
                <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(
                    policyAudits.reduce(
                      (sum, p) => sum + p.complianceScore,
                      0,
                    ) / policyAudits.length,
                  )}
                  %
                </div>
                <p className="text-xs text-muted-foreground">
                  {policyAudits.length} policies audited
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Alerts
                </CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeAlerts}</div>
                <p className="text-xs text-destructive">Requires attention</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Security Posture Overview</CardTitle>
                <CardDescription>
                  Real-time security metrics and risk assessment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <img
                  src="/assets/generated/ai-security-analytics.dim_800x600.png"
                  alt="Security Analytics"
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Overall Risk Score
                      </span>
                      <span className="text-sm font-bold text-destructive">
                        High (7.2/10)
                      </span>
                    </div>
                    <Progress value={72} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Patch Coverage
                      </span>
                      <span className="text-sm font-bold">65%</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Configuration Compliance
                      </span>
                      <span className="text-sm font-bold">78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Policy Adherence
                      </span>
                      <span className="text-sm font-bold">81%</span>
                    </div>
                    <Progress value={81} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Start security scans and assessments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => handleStartScan("Network Discovery")}
                  disabled={isScanning}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Network className="mr-2 h-4 w-4" />
                  Network Discovery Scan
                </Button>
                <Button
                  onClick={() => handleStartScan("Vulnerability")}
                  disabled={isScanning}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Bug className="mr-2 h-4 w-4" />
                  Vulnerability Assessment
                </Button>
                <Button
                  onClick={() => handleStartScan("Configuration")}
                  disabled={isScanning}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Configuration Audit
                </Button>
                <Button
                  onClick={() => handleStartScan("Policy Audit")}
                  disabled={isScanning}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <ClipboardCheck className="mr-2 h-4 w-4" />
                  Policy Audit
                </Button>
                <Button
                  onClick={() => handleStartScan("Compliance")}
                  disabled={isScanning}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Compliance Assessment
                </Button>
                {isScanning && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <Timer className="h-4 w-4 animate-spin" />
                        Scanning...
                        {asyncScanEnabled && (
                          <Badge variant="outline">Async</Badge>
                        )}
                        {performanceOptimization && (
                          <Badge variant="outline">Optimized</Badge>
                        )}
                      </span>
                      <span>{scanProgress}%</span>
                    </div>
                    <Progress value={scanProgress} />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Security Alerts</CardTitle>
              <CardDescription>
                Latest security findings requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {securityAlerts.slice(0, 5).map((alert) => (
                    <Card key={alert.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              {getSeverityBadge(alert.severity)}
                              {getStatusBadge(alert.status)}
                              <Badge variant="outline">{alert.type}</Badge>
                            </div>
                            <h4 className="font-semibold">{alert.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {alert.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(alert.timestamp)} • Affected:{" "}
                              {alert.affectedAssets.join(", ")}
                            </p>
                          </div>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assets Tab */}
        <TabsContent value="assets" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Asset Inventory</CardTitle>
                  <CardDescription>
                    Discovered devices and endpoints across your network
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select
                    value={selectedControlGroup}
                    onValueChange={setSelectedControlGroup}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Control Group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Control Groups</SelectItem>
                      {controlGroups.map((cg) => (
                        <SelectItem key={cg.id} value={cg.id}>
                          {cg.name} ({cg.assetCount})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={() => handleStartScan("Network Discovery")}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh Discovery
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <img
                src="/assets/generated/network-topology-visualization.dim_800x600.png"
                alt="Network Topology"
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <div className="mb-4 flex gap-2">
                <Input
                  placeholder="Search assets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline">
                  <Search className="h-4 w-4" />
                </Button>
                <Button variant="outline">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>OS</TableHead>
                    <TableHead>Control Group</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Vulnerabilities</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead>Last Scan</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        {getAssetIcon(asset.type)}
                        {asset.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{asset.type}</Badge>
                      </TableCell>
                      <TableCell>{asset.ipAddress}</TableCell>
                      <TableCell>{asset.os}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {asset.controlGroup || "Unassigned"}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(asset.status)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            asset.vulnerabilityCount > 5
                              ? "destructive"
                              : "default"
                          }
                        >
                          {asset.vulnerabilityCount}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            asset.riskScore > 7
                              ? "destructive"
                              : asset.riskScore > 4
                                ? "default"
                                : "secondary"
                          }
                        >
                          {asset.riskScore.toFixed(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(asset.lastScan)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Play className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vulnerabilities Tab */}
        <TabsContent value="vulnerabilities" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Vulnerability Assessment</CardTitle>
                  <CardDescription>
                    Identified security weaknesses and CVEs
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select
                    value={selectedSeverity}
                    onValueChange={setSelectedSeverity}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severities</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={() => handleStartScan("Vulnerability")}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Scan Now
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <img
                src="/assets/generated/vulnerability-assessment-interface.dim_800x600.png"
                alt="Vulnerability Assessment"
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {vulnerabilities.map((vuln) => (
                    <Card key={vuln.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              {getSeverityBadge(vuln.severity)}
                              {getStatusBadge(vuln.status)}
                              <Badge variant="outline">{vuln.cveId}</Badge>
                              {vuln.exploitAvailable && (
                                <Badge variant="destructive">
                                  <AlertTriangle className="mr-1 h-3 w-3" />
                                  Exploit Available
                                </Badge>
                              )}
                              {vuln.patchAvailable && (
                                <Badge variant="default">
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  Patch Available
                                </Badge>
                              )}
                            </div>
                            <h4 className="font-semibold text-lg">
                              {vuln.title}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {vuln.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Asset: {vuln.assetName}</span>
                              <span>CVSS: {vuln.cvssScore}</span>
                              <span>
                                Detected: {formatDate(vuln.detectedDate)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Button>
                          <Button size="sm" variant="outline">
                            <Zap className="mr-2 h-4 w-4" />
                            Remediate
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Export
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="configuration" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Configuration Audit</CardTitle>
                  <CardDescription>
                    Security configuration issues and hardening recommendations
                  </CardDescription>
                </div>
                <Button onClick={() => handleStartScan("Configuration")}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Run Audit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <img
                src="/assets/generated/configuration-audit-dashboard.dim_800x600.png"
                alt="Configuration Audit"
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {configIssues.map((issue) => (
                    <Card key={issue.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              {getSeverityBadge(issue.severity)}
                              {getStatusBadge(issue.status)}
                              <Badge variant="outline">{issue.category}</Badge>
                            </div>
                            <h4 className="font-semibold text-lg">
                              {issue.title}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {issue.description}
                            </p>
                            <div className="mt-2 p-3 bg-muted rounded-lg">
                              <p className="text-sm font-medium mb-1">
                                Recommendation:
                              </p>
                              <p className="text-sm">{issue.recommendation}</p>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Asset: {issue.assetName}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark Resolved
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Regulatory Compliance Verification</CardTitle>
                  <CardDescription>
                    Compliance assessment with gap analysis for major frameworks
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select
                    value={selectedFramework}
                    onValueChange={setSelectedFramework}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Framework" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Frameworks</SelectItem>
                      <SelectItem value="NIST">NIST</SelectItem>
                      <SelectItem value="GDPR">GDPR</SelectItem>
                      <SelectItem value="HIPAA">HIPAA</SelectItem>
                      <SelectItem value="PCI-DSS">PCI DSS</SelectItem>
                      <SelectItem value="SOC2">SOC 2</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={() => handleStartScan("Compliance")}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Assess
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleExportReport("pdf", "Compliance")}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export PDF
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleExportReport("excel", "Compliance")}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export Excel
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <img
                src="/assets/generated/regulatory-compliance-verification-dashboard.dim_800x600.png"
                alt="Compliance Frameworks"
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <div className="space-y-4">
                {complianceFrameworks.map((framework) => (
                  <Card key={framework.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {framework.name}
                            {framework.complianceScore >= 80 ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : framework.complianceScore >= 60 ? (
                              <AlertCircle className="h-5 w-5 text-yellow-600" />
                            ) : (
                              <XCircle className="h-5 w-5 text-destructive" />
                            )}
                          </CardTitle>
                          <CardDescription>
                            {framework.description}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold">
                            {framework.complianceScore}%
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Compliance Score
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Progress
                        value={framework.complianceScore}
                        className="h-3"
                      />
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold">
                            {framework.totalControls}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Total Controls
                          </p>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            {framework.passedControls}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Passed
                          </p>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-destructive">
                            {framework.failedControls}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Failed
                          </p>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                          Last Assessment:{" "}
                          {formatDate(framework.lastAssessment)}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewGapAnalysis(framework)}
                          >
                            <Scale className="mr-2 h-4 w-4" />
                            Gap Analysis
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="mr-2 h-4 w-4" />
                            View Report
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Export
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Policy Audit Tab */}
        <TabsContent value="policy-audit" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Policy Auditing</CardTitle>
                  <CardDescription>
                    Internal organizational policy compliance with pass/fail
                    indicators
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowPolicyAuditDialog(true)}
                    variant="outline"
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    View Policies
                  </Button>
                  <Button onClick={() => handleStartScan("Policy Audit")}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Run Audit
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleExportReport("pdf", "Policy Audit")}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export PDF
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleExportReport("excel", "Policy Audit")}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export Excel
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <img
                src="/assets/generated/policy-auditing-compliance-interface.dim_800x600.png"
                alt="Policy Auditing"
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <div className="space-y-4">
                {policyAudits.map((policy) => (
                  <Card key={policy.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-lg">
                              {policy.policyName}
                            </CardTitle>
                            {policy.status === "pass" ? (
                              <Badge variant="secondary" className="gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                PASS
                              </Badge>
                            ) : policy.status === "fail" ? (
                              <Badge variant="destructive" className="gap-1">
                                <XCircle className="h-3 w-3" />
                                FAIL
                              </Badge>
                            ) : (
                              <Badge variant="default" className="gap-1">
                                <AlertCircle className="h-3 w-3" />
                                PARTIAL
                              </Badge>
                            )}
                            <Badge variant="outline">{policy.policyType}</Badge>
                          </div>
                          <CardDescription>
                            {policy.description}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold">
                            {policy.complianceScore}%
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Compliance
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Progress
                        value={policy.complianceScore}
                        className="h-3"
                      />
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold">
                            {policy.totalChecks}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Total Checks
                          </p>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            {policy.passedChecks}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Passed
                          </p>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-destructive">
                            {policy.failedChecks}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Failed
                          </p>
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <h4 className="font-semibold mb-2">Failed Checks:</h4>
                        <ScrollArea className="h-[200px]">
                          <div className="space-y-2">
                            {policyChecks
                              .filter(
                                (check) =>
                                  check.policyId === policy.id &&
                                  check.status === "fail",
                              )
                              .map((check) => (
                                <Card
                                  key={check.id}
                                  className="border-destructive/50"
                                >
                                  <CardContent className="pt-3">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <h5 className="font-semibold text-sm">
                                            {check.checkName}
                                          </h5>
                                          {getSeverityBadge(check.severity)}
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-2">
                                          {check.description}
                                        </p>
                                        <div className="bg-muted p-2 rounded text-xs">
                                          <p className="font-medium mb-1">
                                            Remediation:
                                          </p>
                                          <p>{check.remediation}</p>
                                        </div>
                                        {check.affectedAssets.length > 0 && (
                                          <p className="text-xs text-muted-foreground mt-2">
                                            Affected:{" "}
                                            {check.affectedAssets.join(", ")}
                                          </p>
                                        )}
                                        {check.evidence && (
                                          <p className="text-xs text-muted-foreground mt-1">
                                            Evidence: {check.evidence}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                          </div>
                        </ScrollArea>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Last Audit: {formatDate(policy.lastAudit)}</span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Export
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Malware Tab */}
        <TabsContent value="malware" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Malware Detection</CardTitle>
                  <CardDescription>
                    Threat detection and quarantine management
                  </CardDescription>
                </div>
                <Button onClick={() => handleStartScan("Malware")}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Scan Now
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <img
                src="/assets/generated/malware-detection-interface.dim_800x600.png"
                alt="Malware Detection"
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              {malwareDetections.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Malware Detected
                  </h3>
                  <p className="text-muted-foreground">All systems are clean</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {malwareDetections.map((detection) => (
                    <Card key={detection.id} className="border-destructive">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              {getSeverityBadge(detection.severity)}
                              {getStatusBadge(detection.status)}
                              <Badge variant="destructive">
                                {detection.malwareType}
                              </Badge>
                            </div>
                            <h4 className="font-semibold text-lg">
                              Threat Detected: {detection.threatFamily}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              File: {detection.filePath}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Asset: {detection.assetName}</span>
                              <span>
                                Detected: {formatDate(detection.detectedDate)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2">
                          <Button size="sm" variant="destructive">
                            <XCircle className="mr-2 h-4 w-4" />
                            Remove
                          </Button>
                          <Button size="sm" variant="outline">
                            <Lock className="mr-2 h-4 w-4" />
                            Quarantine
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="mr-2 h-4 w-4" />
                            Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Alert Center</CardTitle>
              <CardDescription>
                Critical security notifications and incident management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <img
                src="/assets/generated/security-alert-center.dim_800x600.png"
                alt="Security Alerts"
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {securityAlerts.map((alert) => (
                    <Card key={alert.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              {getSeverityBadge(alert.severity)}
                              {getStatusBadge(alert.status)}
                              <Badge variant="outline">{alert.type}</Badge>
                            </div>
                            <h4 className="font-semibold text-lg">
                              {alert.title}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {alert.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>
                                Affected Assets:{" "}
                                {alert.affectedAssets.join(", ")}
                              </span>
                              <span>{formatDate(alert.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Acknowledge
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="mr-2 h-4 w-4" />
                            Investigate
                          </Button>
                          <Button size="sm" variant="outline">
                            <XCircle className="mr-2 h-4 w-4" />
                            Dismiss
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scalability Tab */}
        <TabsContent value="scalability" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Enterprise Scalability Controls</CardTitle>
                  <CardDescription>
                    Manage large-scale scanning across thousands of hosts and
                    control groups
                  </CardDescription>
                </div>
                <Button onClick={() => setShowScalabilityDialog(true)}>
                  <Settings className="mr-2 h-4 w-4" />
                  Configure
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <img
                src="/assets/generated/enterprise-scale-security-dashboard.dim_800x600.png"
                alt="Enterprise Scalability"
                className="w-full h-48 object-cover rounded-lg mb-4"
              />

              <div className="grid gap-4 md:grid-cols-2 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Performance Optimization
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Gauge className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor="async-scan">
                          Asynchronous Scanning
                        </Label>
                      </div>
                      <Checkbox
                        id="async-scan"
                        checked={asyncScanEnabled}
                        onCheckedChange={(checked) =>
                          setAsyncScanEnabled(checked as boolean)
                        }
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Enable non-blocking scans for improved performance
                    </p>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor="perf-opt">
                          Performance Optimization
                        </Label>
                      </div>
                      <Checkbox
                        id="perf-opt"
                        checked={performanceOptimization}
                        onCheckedChange={(checked) =>
                          setPerformanceOptimization(checked as boolean)
                        }
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Optimize resource usage for large-scale deployments
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Scan Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Total Assets Managed:
                      </span>
                      <span className="font-bold">
                        {totalAssetsInGroups.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Control Groups:
                      </span>
                      <span className="font-bold">{totalControlGroups}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Active Scans:
                      </span>
                      <span className="font-bold">
                        {scanConfigs.filter((s) => s.enabled).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Avg Scan Time:
                      </span>
                      <span className="font-bold">12.5 min</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Control Groups</CardTitle>
                  <CardDescription>
                    Organize assets into logical groups for targeted scanning
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Group Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Asset Count</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {controlGroups.map((group) => (
                        <TableRow key={group.id}>
                          <TableCell className="font-medium">
                            {group.name}
                          </TableCell>
                          <TableCell>{group.description}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{group.assetCount}</Badge>
                          </TableCell>
                          <TableCell>
                            {getSeverityBadge(group.scanPriority)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleStartScan("Targeted Scan", group.name)
                                }
                              >
                                <Play className="mr-2 h-4 w-4" />
                                Scan
                              </Button>
                              <Button size="sm" variant="ghost">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Structured Audit Evidence Retention
                  </CardTitle>
                  <CardDescription>
                    Comprehensive logging for compliance and audit readiness
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <img
                    src="/assets/generated/asynchronous-scanning-optimization.dim_800x600.png"
                    alt="Audit Logs"
                    className="w-full h-32 object-cover rounded-lg mb-4"
                  />
                  <ScrollArea className="h-[300px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Timestamp</TableHead>
                          <TableHead>Event Type</TableHead>
                          <TableHead>Severity</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Evidence</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {auditLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="text-sm">
                              {formatDate(log.timestamp)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{log.eventType}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  log.severity === "error"
                                    ? "destructive"
                                    : log.severity === "warning"
                                      ? "default"
                                      : "secondary"
                                }
                              >
                                {log.severity}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {log.description}
                            </TableCell>
                            <TableCell className="text-sm">
                              {log.user}
                            </TableCell>
                            <TableCell>
                              <Button size="sm" variant="ghost">
                                <Archive className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Automated Reporting Section */}
      <Card>
        <CardHeader>
          <CardTitle>Unified Security & Compliance Reporting</CardTitle>
          <CardDescription>
            Generate comprehensive reports with exportable PDF and Excel formats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <img
            src="/assets/generated/unified-security-compliance-reporting.dim_800x600.png"
            alt="Unified Reporting"
            className="w-full h-48 object-cover rounded-lg mb-4"
          />
          <div className="grid gap-4 md:grid-cols-4">
            <Button
              variant="outline"
              className="h-auto flex-col items-start p-4"
              onClick={() => handleExportReport("pdf", "Executive Summary")}
            >
              <FileText className="h-6 w-6 mb-2" />
              <span className="font-semibold">Executive Summary</span>
              <span className="text-xs text-muted-foreground">
                High-level security overview
              </span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col items-start p-4"
              onClick={() => handleExportReport("pdf", "Technical Report")}
            >
              <BarChart3 className="h-6 w-6 mb-2" />
              <span className="font-semibold">Technical Report</span>
              <span className="text-xs text-muted-foreground">
                Detailed findings and metrics
              </span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col items-start p-4"
              onClick={() => handleExportReport("pdf", "Compliance Report")}
            >
              <TrendingUp className="h-6 w-6 mb-2" />
              <span className="font-semibold">Compliance Report</span>
              <span className="text-xs text-muted-foreground">
                Framework-specific assessment
              </span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col items-start p-4"
              onClick={() => handleExportReport("excel", "Policy Audit Report")}
            >
              <FileCheck className="h-6 w-6 mb-2" />
              <span className="font-semibold">Policy Audit Report</span>
              <span className="text-xs text-muted-foreground">
                Internal policy compliance
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Scan Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Automated Scan Configuration</CardTitle>
          <CardDescription>
            Manage continuous monitoring and scheduled scans with performance
            optimization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <img
            src="/assets/generated/enterprise-scalability-controls.dim_800x600.png"
            alt="Scan Configuration"
            className="w-full h-48 object-cover rounded-lg mb-4"
          />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Scan Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead>Next Run</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scanConfigs.map((config) => (
                <TableRow key={config.id}>
                  <TableCell className="font-medium">{config.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{config.type}</Badge>
                  </TableCell>
                  <TableCell>{config.frequency}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {config.targetScope === "control-group"
                        ? config.controlGroup
                        : config.targetScope === "specific-hosts"
                          ? "Specific Hosts"
                          : "All Assets"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {config.enabled ? (
                      <Badge variant="default">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Enabled
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <Pause className="mr-1 h-3 w-3" />
                        Disabled
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {config.asynchronous && (
                        <Badge variant="outline" className="text-xs">
                          Async
                        </Badge>
                      )}
                      {config.performanceOptimized && (
                        <Badge variant="outline" className="text-xs">
                          Optimized
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {config.lastRun ? formatDate(config.lastRun) : "Never"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {config.nextRun ? formatDate(config.nextRun) : "N/A"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost">
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Gap Analysis Dialog */}
      <Dialog
        open={showGapAnalysisDialog}
        onOpenChange={setShowGapAnalysisDialog}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Compliance Gap Analysis - {selectedGapFramework?.name}
            </DialogTitle>
            <DialogDescription>
              Detailed gap analysis with remediation recommendations and effort
              estimates
            </DialogDescription>
          </DialogHeader>
          {selectedGapFramework?.gapAnalysis && (
            <div className="space-y-4">
              {selectedGapFramework.gapAnalysis.map((gap) => (
                <Card key={gap.controlId}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-base">
                            {gap.controlName}
                          </CardTitle>
                          {gap.status === "pass" ? (
                            <Badge variant="secondary">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              PASS
                            </Badge>
                          ) : gap.status === "fail" ? (
                            <Badge variant="destructive">
                              <XCircle className="mr-1 h-3 w-3" />
                              FAIL
                            </Badge>
                          ) : (
                            <Badge variant="default">
                              <AlertCircle className="mr-1 h-3 w-3" />
                              PARTIAL
                            </Badge>
                          )}
                          {getSeverityBadge(gap.priority)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Control ID: {gap.controlId}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-1">
                        Gap Identified:
                      </p>
                      <p className="text-sm text-muted-foreground">{gap.gap}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium mb-1">Remediation:</p>
                      <p className="text-sm text-muted-foreground">
                        {gap.remediation}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Estimated Effort:
                        </p>
                        <p className="text-sm font-medium">
                          {gap.estimatedEffort}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        <Workflow className="mr-2 h-4 w-4" />
                        Create Remediation Task
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Scalability Configuration Dialog */}
      <Dialog
        open={showScalabilityDialog}
        onOpenChange={setShowScalabilityDialog}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Enterprise Scalability Configuration</DialogTitle>
            <DialogDescription>
              Configure performance optimization and scanning parameters for
              large-scale deployments
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Performance Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Maximum Concurrent Scans</Label>
                  <Input type="number" defaultValue="10" />
                  <p className="text-xs text-muted-foreground">
                    Number of simultaneous scans across control groups
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Scan Timeout (minutes)</Label>
                  <Input type="number" defaultValue="30" />
                  <p className="text-xs text-muted-foreground">
                    Maximum time allowed for individual scans
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Resource Allocation</Label>
                  <Select defaultValue="balanced">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (Minimal Impact)</SelectItem>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="high">High (Maximum Speed)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowScalabilityDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  toast.success("Scalability settings saved successfully");
                  setShowScalabilityDialog(false);
                }}
              >
                Save Configuration
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Policy Audit Dialog */}
      <Dialog
        open={showPolicyAuditDialog}
        onOpenChange={setShowPolicyAuditDialog}
      >
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Policy Management</DialogTitle>
            <DialogDescription>
              View and manage internal organizational policies and Qualys-style
              benchmarks
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {policyAudits.map((policy) => (
              <Card key={policy.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {policy.policyName}
                      </CardTitle>
                      <CardDescription>{policy.description}</CardDescription>
                    </div>
                    <Badge variant="outline">{policy.policyType}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {policy.totalChecks} checks • {policy.passedChecks} passed
                      • {policy.failedChecks} failed
                    </div>
                    <Button size="sm" variant="outline">
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
