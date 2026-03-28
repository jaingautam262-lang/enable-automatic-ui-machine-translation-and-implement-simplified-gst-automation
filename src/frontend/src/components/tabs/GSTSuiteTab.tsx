import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  Bell,
  Building2,
  CheckCircle2,
  Copy,
  Database,
  Download,
  Edit,
  FileCheck,
  FilePlus,
  FileText,
  GitMerge,
  Globe,
  Loader2,
  Network,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  TrendingDown,
  TrendingUp,
  Truck,
  Upload,
  Wifi,
  WifiOff,
  X,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useDeleteProviderCredentials,
  useGetProviderCredentials,
  useUpsertProviderCredentials,
} from "../../hooks/useGSTProviderSettings";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import type { GSPProvider } from "../../types/gst-universal";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

// ─── Types ───────────────────────────────────────────────────────────────────

type ProcessingStatus = "idle" | "processing" | "validated" | "uploaded";

type ReconciliationFilter =
  | "all"
  | "matched"
  | "partial"
  | "mismatched"
  | "missing";

interface ReconciliationRow {
  id: string;
  invoiceNo: string;
  supplierGSTIN: string;
  invoiceDate: string;
  taxableAmount: number;
  gstAmount: number;
  gstr2aStatus: string;
  itcEligibility: "eligible" | "blocked";
  matchStatus: "matched" | "partial" | "mismatched" | "missing";
}

interface ERPSystem {
  id: string;
  name: string;
  description: string;
  initials: string;
  color: string;
  status: "connected" | "not_configured";
  lastSync?: string;
}

interface EWayBill {
  id: string;
  billNo: string;
  supplier: string;
  fromTo: string;
  value: number;
  validUntil: string;
  status: "active" | "cancelled" | "expired";
  selected: boolean;
}

interface EInvoice {
  id: string;
  irnNo: string;
  buyerGSTIN: string;
  invoiceNo: string;
  amount: number;
  date: string;
  status: "active" | "cancelled" | "pending";
  selected: boolean;
}

interface GSTINRecord {
  id: string;
  branchName: string;
  gstin: string;
  state: string;
  type: "regular" | "composition" | "sez" | "export";
  filingFrequency: "monthly" | "quarterly";
  pendingReturns: number;
  itcBalance: number;
}

interface AlertRecord {
  id: string;
  type: string;
  description: string;
  severity: "high" | "medium" | "low";
  date: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const SAMPLE_RECONCILIATION: ReconciliationRow[] = [
  {
    id: "1",
    invoiceNo: "INV-2025-001",
    supplierGSTIN: "27AAACH7409R1Z4",
    invoiceDate: "2025-02-01",
    taxableAmount: 150000,
    gstAmount: 27000,
    gstr2aStatus: "Available",
    itcEligibility: "eligible",
    matchStatus: "matched",
  },
  {
    id: "2",
    invoiceNo: "INV-2025-002",
    supplierGSTIN: "29AABCF8374P1ZT",
    invoiceDate: "2025-02-05",
    taxableAmount: 85000,
    gstAmount: 15300,
    gstr2aStatus: "Available",
    itcEligibility: "eligible",
    matchStatus: "partial",
  },
  {
    id: "3",
    invoiceNo: "INV-2025-003",
    supplierGSTIN: "07AADCT2987K1ZL",
    invoiceDate: "2025-02-08",
    taxableAmount: 220000,
    gstAmount: 39600,
    gstr2aStatus: "Not Found",
    itcEligibility: "blocked",
    matchStatus: "mismatched",
  },
  {
    id: "4",
    invoiceNo: "INV-2025-004",
    supplierGSTIN: "33AABCG5621R2Z8",
    invoiceDate: "2025-02-10",
    taxableAmount: 65000,
    gstAmount: 11700,
    gstr2aStatus: "Available",
    itcEligibility: "eligible",
    matchStatus: "matched",
  },
  {
    id: "5",
    invoiceNo: "INV-2025-005",
    supplierGSTIN: "19AABCP9812L1ZR",
    invoiceDate: "2025-02-14",
    taxableAmount: 180000,
    gstAmount: 32400,
    gstr2aStatus: "Pending",
    itcEligibility: "blocked",
    matchStatus: "missing",
  },
  {
    id: "6",
    invoiceNo: "INV-2025-006",
    supplierGSTIN: "06AABCR7821Q1ZN",
    invoiceDate: "2025-02-16",
    taxableAmount: 95000,
    gstAmount: 17100,
    gstr2aStatus: "Available",
    itcEligibility: "eligible",
    matchStatus: "partial",
  },
  {
    id: "7",
    invoiceNo: "INV-2025-007",
    supplierGSTIN: "24AAACL9283H2ZK",
    invoiceDate: "2025-02-20",
    taxableAmount: 310000,
    gstAmount: 55800,
    gstr2aStatus: "Not Found",
    itcEligibility: "blocked",
    matchStatus: "mismatched",
  },
  {
    id: "8",
    invoiceNo: "INV-2025-008",
    supplierGSTIN: "09AABCS6432T1ZP",
    invoiceDate: "2025-02-22",
    taxableAmount: 45000,
    gstAmount: 8100,
    gstr2aStatus: "Available",
    itcEligibility: "eligible",
    matchStatus: "matched",
  },
];

const INITIAL_ERP_SYSTEMS: ERPSystem[] = [
  {
    id: "sap",
    name: "SAP ERP",
    description: "Enterprise resource planning for large organizations",
    initials: "SAP",
    color: "bg-blue-600",
    status: "connected",
    lastSync: "2025-03-05 09:30 AM",
  },
  {
    id: "tally",
    name: "Tally Solutions",
    description: "Popular accounting software for SMEs",
    initials: "TL",
    color: "bg-green-600",
    status: "connected",
    lastSync: "2025-03-05 11:15 AM",
  },
  {
    id: "oracle",
    name: "Oracle Financials",
    description: "Cloud ERP for enterprise financial management",
    initials: "OR",
    color: "bg-red-600",
    status: "not_configured",
  },
  {
    id: "zoho",
    name: "Zoho Books",
    description: "Cloud accounting for growing businesses",
    initials: "ZB",
    color: "bg-purple-600",
    status: "not_configured",
  },
  {
    id: "quickbooks",
    name: "QuickBooks",
    description: "Small business accounting and finance",
    initials: "QB",
    color: "bg-emerald-600",
    status: "not_configured",
  },
  {
    id: "dynamics",
    name: "Microsoft Dynamics",
    description: "ERP and CRM solutions for enterprises",
    initials: "MS",
    color: "bg-cyan-600",
    status: "not_configured",
  },
];

const INITIAL_EWAY_BILLS: EWayBill[] = [
  {
    id: "1",
    billNo: "EWB-2025-1234",
    supplier: "Reliance Industries Ltd",
    fromTo: "Mumbai → Delhi",
    value: 580000,
    validUntil: "2025-03-12",
    status: "active",
    selected: false,
  },
  {
    id: "2",
    billNo: "EWB-2025-1235",
    supplier: "Tata Steel Limited",
    fromTo: "Jamshedpur → Chennai",
    value: 1250000,
    validUntil: "2025-03-15",
    status: "active",
    selected: false,
  },
  {
    id: "3",
    billNo: "EWB-2025-1230",
    supplier: "Infosys BPO Services",
    fromTo: "Bengaluru → Hyderabad",
    value: 320000,
    validUntil: "2025-02-28",
    status: "expired",
    selected: false,
  },
  {
    id: "4",
    billNo: "EWB-2025-1228",
    supplier: "Wipro Technologies",
    fromTo: "Pune → Noida",
    value: 475000,
    validUntil: "2025-03-20",
    status: "active",
    selected: false,
  },
  {
    id: "5",
    billNo: "EWB-2025-1220",
    supplier: "HCL Technologies",
    fromTo: "Lucknow → Kolkata",
    value: 890000,
    validUntil: "2025-03-01",
    status: "cancelled",
    selected: false,
  },
  {
    id: "6",
    billNo: "EWB-2025-1238",
    supplier: "Bajaj Auto Limited",
    fromTo: "Aurangabad → Rajkot",
    value: 2100000,
    validUntil: "2025-03-25",
    status: "active",
    selected: false,
  },
];

const INITIAL_EINVOICES: EInvoice[] = [
  {
    id: "1",
    irnNo: "IRN001A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T",
    buyerGSTIN: "27AAACH7409R1Z4",
    invoiceNo: "INV-2025-101",
    amount: 708500,
    date: "2025-02-15",
    status: "active",
    selected: false,
  },
  {
    id: "2",
    irnNo: "IRN002B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U",
    buyerGSTIN: "29AABCF8374P1ZT",
    invoiceNo: "INV-2025-102",
    amount: 354000,
    date: "2025-02-18",
    status: "active",
    selected: false,
  },
  {
    id: "3",
    irnNo: "IRN003C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V",
    buyerGSTIN: "07AADCT2987K1ZL",
    invoiceNo: "INV-2025-103",
    amount: 1180000,
    date: "2025-02-20",
    status: "cancelled",
    selected: false,
  },
  {
    id: "4",
    irnNo: "IRN004D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W",
    buyerGSTIN: "33AABCG5621R2Z8",
    invoiceNo: "INV-2025-104",
    amount: 590000,
    date: "2025-02-25",
    status: "active",
    selected: false,
  },
  {
    id: "5",
    irnNo: "IRN005E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X",
    buyerGSTIN: "19AABCP9812L1ZR",
    invoiceNo: "INV-2025-105",
    amount: 236000,
    date: "2025-03-01",
    status: "pending",
    selected: false,
  },
];

const INITIAL_GSTINS: GSTINRecord[] = [
  {
    id: "1",
    branchName: "Delhi Headquarters",
    gstin: "07AABCP1234R1ZN",
    state: "Delhi",
    type: "regular",
    filingFrequency: "monthly",
    pendingReturns: 2,
    itcBalance: 845000,
  },
  {
    id: "2",
    branchName: "Mumbai Branch",
    gstin: "27AABCP1234R1Z4",
    state: "Maharashtra",
    type: "regular",
    filingFrequency: "monthly",
    pendingReturns: 1,
    itcBalance: 1230000,
  },
  {
    id: "3",
    branchName: "Chennai Branch",
    gstin: "33AABCP1234R1ZM",
    state: "Tamil Nadu",
    type: "composition",
    filingFrequency: "quarterly",
    pendingReturns: 0,
    itcBalance: 320000,
  },
];

const INITIAL_ALERTS: AlertRecord[] = [
  {
    id: "1",
    type: "Invoice Mismatch",
    description: "3 purchase invoices not found in GSTR-2A for February 2025",
    severity: "high",
    date: "2025-03-04",
  },
  {
    id: "2",
    type: "Document Expiry",
    description: "E-Way Bill EWB-2025-1230 expired on 28 Feb 2025",
    severity: "medium",
    date: "2025-03-01",
  },
  {
    id: "3",
    type: "ITC Loss Risk",
    description: "₹1,27,500 ITC at risk due to supplier non-filing",
    severity: "high",
    date: "2025-03-03",
  },
  {
    id: "4",
    type: "Return Pending",
    description: "GSTR-3B for Mumbai Branch (Feb 2025) due on 20 Mar",
    severity: "medium",
    date: "2025-03-02",
  },
  {
    id: "5",
    type: "Rate Mismatch",
    description: "Tax rate discrepancy on Invoice INV-2025-006 (18% vs 12%)",
    severity: "low",
    date: "2025-03-05",
  },
  {
    id: "6",
    type: "GSTIN Verification",
    description: "Supplier GSTIN 19AABCP9812L1ZR cancelled as of 01 Feb 2025",
    severity: "high",
    date: "2025-03-03",
  },
];

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli",
  "Daman and Diu",
  "Delhi",
  "Lakshadweep",
  "Puducherry",
  "Jammu and Kashmir",
  "Ladakh",
];

// ─── Panel 1: Automated Data Processing ─────────────────────────────────────

function AutomatedDataProcessingPanel() {
  const [salesData, setSalesData] = useState("");
  const [purchaseData, setPurchaseData] = useState("");
  const [jsonOutput, setJsonOutput] = useState("");
  const [status, setStatus] = useState<ProcessingStatus>("idle");
  const [processing, setProcessing] = useState(false);
  const [stats, setStats] = useState({ processed: 0, valid: 0, errors: 0 });

  const handleConvert = useCallback(
    async (type: "sales" | "purchase") => {
      const raw = type === "sales" ? salesData : purchaseData;
      if (!raw.trim()) {
        toast.error("Please paste CSV data first.");
        return;
      }
      setProcessing(true);
      setStatus("processing");
      await new Promise((r) => setTimeout(r, 500));

      const lines = raw.trim().split("\n").filter(Boolean);
      const records = lines.slice(1).map((line, idx) => {
        const cols = line.split(",").map((c) => c.trim());
        return {
          invoice_no: cols[0] || `INV-2025-${String(idx + 1).padStart(3, "0")}`,
          gstin: cols[1] || "27AAACH7409R1Z4",
          date: cols[2] || "2025-03-01",
          taxable_amount: Number.parseFloat(cols[3]) || 10000 * (idx + 1),
          tax_rate: Number.parseFloat(cols[4]) || 18,
          cgst: (Number.parseFloat(cols[3]) || 10000 * (idx + 1)) * 0.09,
          sgst: (Number.parseFloat(cols[3]) || 10000 * (idx + 1)) * 0.09,
          igst: 0,
          invoice_type: type === "sales" ? "B2B" : "PURCHASE",
        };
      });

      const json = JSON.stringify(
        {
          gstin_data: {
            filing_period: "022025",
            version: "GST3.0.4",
            hash: "hash",
            b2b: records,
          },
        },
        null,
        2,
      );

      setJsonOutput(json);
      setStats({
        processed: records.length,
        valid: Math.max(0, records.length - 1),
        errors: records.length > 0 ? 1 : 0,
      });
      setStatus("validated");
      setProcessing(false);
      toast.success(`Converted ${records.length} records to GSTN JSON`);
    },
    [salesData, purchaseData],
  );

  const handleCopy = () => {
    if (!jsonOutput) return;
    navigator.clipboard.writeText(jsonOutput);
    toast.success("JSON copied to clipboard");
  };

  const handleUpload = async () => {
    if (!jsonOutput) return;
    setStatus("processing");
    await new Promise((r) => setTimeout(r, 800));
    setStatus("uploaded");
    toast.success("Data securely uploaded to GSTN portal (simulated)");
  };

  const statusBadge: Record<
    ProcessingStatus,
    { label: string; className: string }
  > = {
    idle: { label: "Ready", className: "bg-muted text-muted-foreground" },
    processing: {
      label: "Processing…",
      className:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    },
    validated: {
      label: "Validated",
      className:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    },
    uploaded: {
      label: "Uploaded",
      className:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Database className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Automated Data Processing</h2>
          <p className="text-sm text-muted-foreground">
            Convert raw sales/purchase data to GSTN-compliant JSON for secure
            upload.
          </p>
        </div>
        <Badge className={`ml-auto shrink-0 ${statusBadge[status].className}`}>
          {processing && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
          {statusBadge[status].label}
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Records Processed",
            value: stats.processed,
            color: "text-primary",
          },
          {
            label: "Valid Records",
            value: stats.valid,
            color: "text-emerald-600",
          },
          {
            label: "Errors Found",
            value: stats.errors,
            color: "text-destructive",
          },
        ].map((s) => (
          <Card key={s.label} className="text-center py-3">
            <CardContent className="p-0">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Data Input Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              Sales Data
            </CardTitle>
            <CardDescription className="text-xs">
              Paste CSV: InvoiceNo,GSTIN,Date,TaxableAmt,TaxRate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              data-ocid="adp.sales.textarea"
              placeholder={
                "INV-001,27AAACH7409R1Z4,2025-03-01,100000,18\nINV-002,29AABCF8374P1ZT,2025-03-02,85000,12"
              }
              className="font-mono text-xs min-h-[120px]"
              value={salesData}
              onChange={(e) => setSalesData(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                data-ocid="adp.sales.convert_button"
                size="sm"
                onClick={() => handleConvert("sales")}
                disabled={processing}
                className="flex-1"
              >
                {processing ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : null}
                Convert to JSON
              </Button>
              <Button
                data-ocid="adp.sales.validate_button"
                size="sm"
                variant="outline"
                onClick={() => {
                  if (!salesData.trim()) {
                    toast.error("No data to validate");
                    return;
                  }
                  toast.success("Sales data structure is valid");
                }}
              >
                Validate
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-orange-500" />
              Purchase Data
            </CardTitle>
            <CardDescription className="text-xs">
              Paste CSV: InvoiceNo,GSTIN,Date,TaxableAmt,TaxRate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              data-ocid="adp.purchase.textarea"
              placeholder={
                "PUR-001,33AABCG5621R2Z8,2025-03-01,250000,18\nPUR-002,07AADCT2987K1ZL,2025-03-03,175000,5"
              }
              className="font-mono text-xs min-h-[120px]"
              value={purchaseData}
              onChange={(e) => setPurchaseData(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                data-ocid="adp.purchase.convert_button"
                size="sm"
                onClick={() => handleConvert("purchase")}
                disabled={processing}
                className="flex-1"
              >
                {processing ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : null}
                Convert to JSON
              </Button>
              <Button
                data-ocid="adp.purchase.validate_button"
                size="sm"
                variant="outline"
                onClick={() => {
                  if (!purchaseData.trim()) {
                    toast.error("No data to validate");
                    return;
                  }
                  toast.success("Purchase data structure is valid");
                }}
              >
                Validate
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* JSON Preview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">JSON Preview</CardTitle>
            <div className="flex gap-2">
              <Button
                data-ocid="adp.copy_json_button"
                size="sm"
                variant="outline"
                onClick={handleCopy}
                disabled={!jsonOutput}
              >
                <Copy className="mr-1 h-3 w-3" /> Copy JSON
              </Button>
              <Button
                data-ocid="adp.upload_gstn_button"
                size="sm"
                onClick={handleUpload}
                disabled={!jsonOutput || status === "uploaded" || processing}
              >
                <Upload className="mr-1 h-3 w-3" />
                {status === "uploaded" ? "Uploaded ✓" : "Upload to GSTN"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {jsonOutput ? (
            <pre className="font-mono text-xs bg-muted/50 rounded-lg p-4 overflow-auto max-h-[300px] whitespace-pre-wrap break-all">
              {jsonOutput}
            </pre>
          ) : (
            <div
              data-ocid="adp.empty_state"
              className="flex items-center justify-center h-24 rounded-lg border border-dashed border-border text-muted-foreground text-sm"
            >
              JSON output will appear here after conversion
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Panel 2: Reconciliation Engine ──────────────────────────────────────────

function ReconciliationEnginePanel() {
  const [rows, setRows] = useState<ReconciliationRow[]>(SAMPLE_RECONCILIATION);
  const [filter, setFilter] = useState<ReconciliationFilter>("all");
  const [running, setRunning] = useState(false);

  const filtered =
    filter === "all" ? rows : rows.filter((r) => r.matchStatus === filter);

  const stats = {
    total: rows.length,
    matched: rows.filter((r) => r.matchStatus === "matched").length,
    mismatched: rows.filter((r) => r.matchStatus === "mismatched").length,
    itcAtRisk: rows
      .filter((r) => r.itcEligibility === "blocked")
      .reduce((s, r) => s + r.gstAmount, 0),
  };

  const handleRunReconciliation = async () => {
    setRunning(true);
    await new Promise((r) => setTimeout(r, 1500));
    setRows((prev) =>
      prev.map((r) =>
        r.matchStatus === "missing"
          ? {
              ...r,
              matchStatus: "partial" as const,
              itcEligibility: "eligible" as const,
            }
          : r,
      ),
    );
    setRunning(false);
    toast.success("Reconciliation complete — 1 record updated");
  };

  const handleExport = () => {
    const headers = [
      "Invoice No",
      "Supplier GSTIN",
      "Date",
      "Taxable Amount",
      "GST Amount",
      "GSTR-2A Status",
      "ITC Eligibility",
      "Match Status",
    ];
    const csvRows = [
      headers.join(","),
      ...rows.map((r) =>
        [
          r.invoiceNo,
          r.supplierGSTIN,
          r.invoiceDate,
          r.taxableAmount,
          r.gstAmount,
          r.gstr2aStatus,
          r.itcEligibility,
          r.matchStatus,
        ].join(","),
      ),
    ];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reconciliation-report.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Reconciliation report exported");
  };

  const matchBadge = {
    matched:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    partial:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    mismatched: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    missing: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
          <GitMerge className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">
            GSTR-2A/2B Reconciliation Engine
          </h2>
          <p className="text-sm text-muted-foreground">
            Match purchase invoices with supplier uploads to validate ITC
            claims.
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Total Records",
            value: stats.total,
            color: "text-foreground",
          },
          { label: "Matched", value: stats.matched, color: "text-emerald-600" },
          {
            label: "Mismatched",
            value: stats.mismatched,
            color: "text-red-600",
          },
          {
            label: "ITC at Risk",
            value: formatINR(stats.itcAtRisk),
            color: "text-orange-600",
          },
        ].map((s) => (
          <Card key={s.label} className="text-center py-3">
            <CardContent className="p-0">
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Tabs + Action */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 flex-wrap">
          {(
            [
              "all",
              "matched",
              "partial",
              "mismatched",
              "missing",
            ] as ReconciliationFilter[]
          ).map((f) => (
            <button
              key={f}
              type="button"
              data-ocid="recon.filter.tab"
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button
            data-ocid="recon.export_button"
            size="sm"
            variant="outline"
            onClick={handleExport}
          >
            <Download className="mr-1 h-3 w-3" /> Export Report
          </Button>
          <Button
            data-ocid="recon.run_button"
            size="sm"
            onClick={handleRunReconciliation}
            disabled={running}
          >
            {running ? (
              <>
                <Loader2
                  className="mr-1 h-3 w-3 animate-spin"
                  data-ocid="recon.loading_state"
                />{" "}
                Running…
              </>
            ) : (
              <>
                <RefreshCw className="mr-1 h-3 w-3" /> Run Reconciliation
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Invoice No</TableHead>
                  <TableHead className="text-xs">Supplier GSTIN</TableHead>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs text-right">
                    Taxable Amt
                  </TableHead>
                  <TableHead className="text-xs text-right">GST Amt</TableHead>
                  <TableHead className="text-xs">GSTR-2A</TableHead>
                  <TableHead className="text-xs">ITC</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((row, idx) => (
                  <TableRow key={row.id} data-ocid={`recon.item.${idx + 1}`}>
                    <TableCell className="text-xs font-mono">
                      {row.invoiceNo}
                    </TableCell>
                    <TableCell className="text-xs font-mono">
                      {row.supplierGSTIN}
                    </TableCell>
                    <TableCell className="text-xs">{row.invoiceDate}</TableCell>
                    <TableCell className="text-xs text-right">
                      {formatINR(row.taxableAmount)}
                    </TableCell>
                    <TableCell className="text-xs text-right">
                      {formatINR(row.gstAmount)}
                    </TableCell>
                    <TableCell className="text-xs">
                      {row.gstr2aStatus}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`text-xs ${row.itcEligibility === "eligible" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"}`}
                      >
                        {row.itcEligibility === "eligible"
                          ? "Eligible"
                          : "Blocked"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`text-xs ${matchBadge[row.matchStatus]}`}
                      >
                        {row.matchStatus.charAt(0).toUpperCase() +
                          row.matchStatus.slice(1)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Panel 3: ERP Integration ─────────────────────────────────────────────────

function ERPIntegrationPanel() {
  const [systems, setSystems] = useState<ERPSystem[]>(INITIAL_ERP_SYSTEMS);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [formData, setFormData] = useState<
    Record<string, { endpoint: string; apiKey: string; clientId: string }>
  >({});
  const [syncing, setSyncing] = useState<string | null>(null);

  const openConnectForm = (id: string) => {
    setConnecting(id);
    if (!formData[id])
      setFormData((prev) => ({
        ...prev,
        [id]: { endpoint: "", apiKey: "", clientId: "" },
      }));
  };

  const handleConnect = async (id: string) => {
    const data = formData[id];
    if (!data?.endpoint || !data?.apiKey) {
      toast.error("API Endpoint and API Key are required");
      return;
    }
    await new Promise((r) => setTimeout(r, 600));
    setSystems((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status: "connected",
              lastSync: new Date().toLocaleString("en-IN"),
            }
          : s,
      ),
    );
    setConnecting(null);
    toast.success(`Connected to ${systems.find((s) => s.id === id)?.name}`);
  };

  const handleSync = async (id: string) => {
    setSyncing(id);
    await new Promise((r) => setTimeout(r, 1000));
    setSystems((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, lastSync: new Date().toLocaleString("en-IN") }
          : s,
      ),
    );
    setSyncing(null);
    toast.success(
      `Sync complete for ${systems.find((s) => s.id === id)?.name}`,
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
          <Network className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">
            ERP & Accounting System Integration
          </h2>
          <p className="text-sm text-muted-foreground">
            Connect SAP, Tally, Oracle, and other systems for automated data
            transfer.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {systems.map((sys) => (
          <Card key={sys.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg ${sys.color} flex items-center justify-center text-white font-bold text-sm shrink-0`}
                >
                  {sys.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-sm font-semibold">
                    {sys.name}
                  </CardTitle>
                  <CardDescription className="text-xs line-clamp-1">
                    {sys.description}
                  </CardDescription>
                </div>
                <Badge
                  className={`shrink-0 text-xs ${sys.status === "connected" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-muted text-muted-foreground"}`}
                >
                  {sys.status === "connected" ? "Connected" : "Not Configured"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {sys.lastSync && (
                <p className="text-xs text-muted-foreground">
                  Last sync: {sys.lastSync}
                </p>
              )}

              {connecting === sys.id ? (
                <div className="space-y-2 border border-border rounded-lg p-3 bg-muted/30">
                  <Input
                    data-ocid={`erp.${sys.id}.input`}
                    placeholder="API Endpoint URL"
                    value={formData[sys.id]?.endpoint || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        [sys.id]: { ...prev[sys.id], endpoint: e.target.value },
                      }))
                    }
                    className="text-xs h-8"
                  />
                  <Input
                    data-ocid={`erp.${sys.id}.input`}
                    type="password"
                    placeholder="API Key"
                    value={formData[sys.id]?.apiKey || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        [sys.id]: { ...prev[sys.id], apiKey: e.target.value },
                      }))
                    }
                    className="text-xs h-8"
                  />
                  <Input
                    data-ocid={`erp.${sys.id}.input`}
                    placeholder="Client ID"
                    value={formData[sys.id]?.clientId || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        [sys.id]: { ...prev[sys.id], clientId: e.target.value },
                      }))
                    }
                    className="text-xs h-8"
                  />
                  <div className="flex gap-2">
                    <Button
                      data-ocid={`erp.${sys.id}.save_button`}
                      size="sm"
                      className="flex-1 h-8 text-xs"
                      onClick={() => handleConnect(sys.id)}
                    >
                      Save & Connect
                    </Button>
                    <Button
                      data-ocid={`erp.${sys.id}.cancel_button`}
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs"
                      onClick={() => setConnecting(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  {sys.status === "connected" ? (
                    <Button
                      data-ocid={`erp.${sys.id}.primary_button`}
                      size="sm"
                      variant="outline"
                      className="flex-1 h-8 text-xs"
                      onClick={() => handleSync(sys.id)}
                      disabled={syncing === sys.id}
                    >
                      {syncing === sys.id ? (
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      ) : (
                        <RefreshCw className="mr-1 h-3 w-3" />
                      )}
                      Sync Now
                    </Button>
                  ) : (
                    <Button
                      data-ocid={`erp.${sys.id}.primary_button`}
                      size="sm"
                      className="flex-1 h-8 text-xs"
                      onClick={() => openConnectForm(sys.id)}
                    >
                      <Plus className="mr-1 h-3 w-3" /> Connect
                    </Button>
                  )}
                  {sys.status === "connected" && (
                    <Button
                      data-ocid={`erp.${sys.id}.edit_button`}
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => openConnectForm(sys.id)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Panel 4: E-Way Bill & E-Invoicing ───────────────────────────────────────

function EWayEInvoicingPanel() {
  const [eWayBills, setEWayBills] = useState<EWayBill[]>(INITIAL_EWAY_BILLS);
  const [eInvoices, setEInvoices] = useState<EInvoice[]>(INITIAL_EINVOICES);
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [generating, setGenerating] = useState(false);
  const [cancellingInvoice, setCancellingInvoice] = useState<string | null>(
    null,
  );
  const [eWaySearch, setEWaySearch] = useState("");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const selectedEWay = eWayBills.filter((b) => b.selected);
  const filteredEWay = eWayBills.filter(
    (b) =>
      !eWaySearch ||
      b.billNo.toLowerCase().includes(eWaySearch.toLowerCase()) ||
      b.supplier.toLowerCase().includes(eWaySearch.toLowerCase()),
  );

  const toggleSelectAll = () => {
    const allSelected = filteredEWay.every((b) => b.selected);
    setEWayBills((prev) => prev.map((b) => ({ ...b, selected: !allSelected })));
  };

  const toggleSelect = (id: string) => {
    setEWayBills((prev) =>
      prev.map((b) => (b.id === id ? { ...b, selected: !b.selected } : b)),
    );
  };

  const handleGenerateBulk = async () => {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 800));
    const newBill: EWayBill = {
      id: String(Date.now()),
      billNo: `EWB-2025-${1240 + eWayBills.length}`,
      supplier: "Hindustan Unilever Ltd",
      fromTo: "Mumbai → Bengaluru",
      value: 650000,
      validUntil: "2025-04-01",
      status: "active",
      selected: false,
    };
    setEWayBills((prev) => [newBill, ...prev]);
    setGenerating(false);
    toast.success("New E-Way Bill generated successfully");
  };

  const handleCancelEWay = () => {
    if (!cancelTarget || !cancelReason.trim()) {
      toast.error("Please provide a cancellation reason");
      return;
    }
    setEWayBills((prev) =>
      prev.map((b) =>
        b.id === cancelTarget
          ? { ...b, status: "cancelled" as const, selected: false }
          : b,
      ),
    );
    setCancelTarget(null);
    setCancelReason("");
    setCancelDialogOpen(false);
    toast.success("E-Way Bill cancelled");
  };

  const handleCancelInvoice = async (id: string) => {
    setCancellingInvoice(id);
    await new Promise((r) => setTimeout(r, 500));
    setEInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id ? { ...inv, status: "cancelled" as const } : inv,
      ),
    );
    setCancellingInvoice(null);
    toast.success("IRN cancelled successfully");
  };

  const statusBadge = (status: EWayBill["status"]) => {
    if (status === "active")
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
    if (status === "cancelled")
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
  };

  const invStatusBadge = (status: EInvoice["status"]) => {
    if (status === "active")
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
    if (status === "cancelled")
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
          <Truck className="h-5 w-5 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">
            E-Way Bill & E-Invoice Management
          </h2>
          <p className="text-sm text-muted-foreground">
            Bulk generation, cancellation, and management of E-Way Bills and
            IRNs.
          </p>
        </div>
      </div>

      <Tabs defaultValue="eway">
        <TabsList className="h-9">
          <TabsTrigger
            data-ocid="eway.tab"
            value="eway"
            className="text-xs gap-1.5"
          >
            <Truck className="h-3.5 w-3.5" /> E-Way Bills
          </TabsTrigger>
          <TabsTrigger
            data-ocid="einvoice.tab"
            value="einvoice"
            className="text-xs gap-1.5"
          >
            <FileCheck className="h-3.5 w-3.5" /> E-Invoices (IRN)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="eway" className="space-y-4 mt-4">
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex gap-2 items-center">
              <Input
                data-ocid="eway.search_input"
                placeholder="Search E-Way Bills…"
                value={eWaySearch}
                onChange={(e) => setEWaySearch(e.target.value)}
                className="h-8 w-48 text-xs"
              />
              <Button
                data-ocid="eway.generate_button"
                size="sm"
                onClick={handleGenerateBulk}
                disabled={generating}
                className="h-8 text-xs"
              >
                {generating ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                  <FilePlus className="mr-1 h-3 w-3" />
                )}
                Generate Bulk
              </Button>
              <Button
                data-ocid="eway.cancel_button"
                size="sm"
                variant="destructive"
                disabled={selectedEWay.length === 0}
                className="h-8 text-xs"
                onClick={() => {
                  if (selectedEWay.length > 0) {
                    setCancelTarget(selectedEWay[0].id);
                    setCancelDialogOpen(true);
                  }
                }}
              >
                <XCircle className="mr-1 h-3 w-3" /> Cancel Selected (
                {selectedEWay.length})
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox
                          data-ocid="eway.select_all.checkbox"
                          checked={
                            filteredEWay.length > 0 &&
                            filteredEWay.every((b) => b.selected)
                          }
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="text-xs">E-Way Bill No</TableHead>
                      <TableHead className="text-xs">Supplier</TableHead>
                      <TableHead className="text-xs">From → To</TableHead>
                      <TableHead className="text-xs text-right">
                        Value
                      </TableHead>
                      <TableHead className="text-xs">Valid Until</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEWay.map((bill, idx) => (
                      <TableRow
                        key={bill.id}
                        data-ocid={`eway.item.${idx + 1}`}
                      >
                        <TableCell>
                          <Checkbox
                            data-ocid={`eway.checkbox.${idx + 1}`}
                            checked={bill.selected}
                            onCheckedChange={() => toggleSelect(bill.id)}
                          />
                        </TableCell>
                        <TableCell className="text-xs font-mono">
                          {bill.billNo}
                        </TableCell>
                        <TableCell className="text-xs">
                          {bill.supplier}
                        </TableCell>
                        <TableCell className="text-xs">{bill.fromTo}</TableCell>
                        <TableCell className="text-xs text-right">
                          {formatINR(bill.value)}
                        </TableCell>
                        <TableCell className="text-xs">
                          {bill.validUntil}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`text-xs ${statusBadge(bill.status)}`}
                          >
                            {bill.status.charAt(0).toUpperCase() +
                              bill.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {bill.status === "active" && (
                              <Button
                                data-ocid={`eway.cancel_button.${idx + 1}`}
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                                onClick={() => {
                                  setCancelTarget(bill.id);
                                  setCancelDialogOpen(true);
                                }}
                              >
                                Cancel
                              </Button>
                            )}
                            <Button
                              data-ocid={`eway.download_button.${idx + 1}`}
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-xs"
                              onClick={() =>
                                toast.success(`Downloading ${bill.billNo}…`)
                              }
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="einvoice" className="space-y-4 mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox
                          data-ocid="einvoice.select_all.checkbox"
                          checked={eInvoices.every((i) => i.selected)}
                          onCheckedChange={() => {
                            const allSel = eInvoices.every((i) => i.selected);
                            setEInvoices((prev) =>
                              prev.map((i) => ({ ...i, selected: !allSel })),
                            );
                          }}
                        />
                      </TableHead>
                      <TableHead className="text-xs">
                        IRN No (truncated)
                      </TableHead>
                      <TableHead className="text-xs">Buyer GSTIN</TableHead>
                      <TableHead className="text-xs">Invoice No</TableHead>
                      <TableHead className="text-xs text-right">
                        Amount
                      </TableHead>
                      <TableHead className="text-xs">Date</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eInvoices.map((inv, idx) => (
                      <TableRow
                        key={inv.id}
                        data-ocid={`einvoice.item.${idx + 1}`}
                      >
                        <TableCell>
                          <Checkbox
                            data-ocid={`einvoice.checkbox.${idx + 1}`}
                            checked={inv.selected}
                            onCheckedChange={() =>
                              setEInvoices((prev) =>
                                prev.map((i) =>
                                  i.id === inv.id
                                    ? { ...i, selected: !i.selected }
                                    : i,
                                ),
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="text-xs font-mono">
                          {inv.irnNo.slice(0, 24)}…
                        </TableCell>
                        <TableCell className="text-xs font-mono">
                          {inv.buyerGSTIN}
                        </TableCell>
                        <TableCell className="text-xs">
                          {inv.invoiceNo}
                        </TableCell>
                        <TableCell className="text-xs text-right">
                          {formatINR(inv.amount)}
                        </TableCell>
                        <TableCell className="text-xs">{inv.date}</TableCell>
                        <TableCell>
                          <Badge
                            className={`text-xs ${invStatusBadge(inv.status)}`}
                          >
                            {inv.status.charAt(0).toUpperCase() +
                              inv.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {inv.status === "active" && (
                              <Button
                                data-ocid={`einvoice.cancel_button.${idx + 1}`}
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                                onClick={() => handleCancelInvoice(inv.id)}
                                disabled={cancellingInvoice === inv.id}
                              >
                                {cancellingInvoice === inv.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  "Cancel"
                                )}
                              </Button>
                            )}
                            <Button
                              data-ocid={`einvoice.download_button.${idx + 1}`}
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-xs"
                              onClick={() =>
                                toast.success("QR code downloading…")
                              }
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Cancel E-Way Bill AlertDialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent data-ocid="eway.cancel.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel E-Way Bill</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for cancellation. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Textarea
              data-ocid="eway.cancel.textarea"
              placeholder="Enter cancellation reason…"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>
          <AlertDialogFooter>
            <Button
              data-ocid="eway.cancel.cancel_button"
              variant="outline"
              onClick={() => {
                setCancelDialogOpen(false);
                setCancelTarget(null);
                setCancelReason("");
              }}
            >
              Back
            </Button>
            <Button
              data-ocid="eway.cancel.confirm_button"
              variant="destructive"
              onClick={handleCancelEWay}
            >
              Confirm Cancel
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Panel 5: Multi-GSTIN Manager ────────────────────────────────────────────

function MultiGSTINPanel() {
  const [gstins, setGstins] = useState<GSTINRecord[]>(INITIAL_GSTINS);
  const [activeGSTIN, setActiveGSTIN] = useState(INITIAL_GSTINS[0].id);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    branchName: "",
    gstin: "",
    state: "",
    type: "regular" as GSTINRecord["type"],
    filingFrequency: "monthly" as GSTINRecord["filingFrequency"],
  });

  const openAdd = () => {
    setEditId(null);
    setForm({
      branchName: "",
      gstin: "",
      state: "",
      type: "regular",
      filingFrequency: "monthly",
    });
    setDialogOpen(true);
  };

  const openEdit = (rec: GSTINRecord) => {
    setEditId(rec.id);
    setForm({
      branchName: rec.branchName,
      gstin: rec.gstin,
      state: rec.state,
      type: rec.type,
      filingFrequency: rec.filingFrequency,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.branchName || !form.gstin || !form.state) {
      toast.error("Branch Name, GSTIN, and State are required");
      return;
    }
    if (form.gstin.length !== 15) {
      toast.error("GSTIN must be exactly 15 characters");
      return;
    }
    if (editId) {
      setGstins((prev) =>
        prev.map((g) => (g.id === editId ? { ...g, ...form } : g)),
      );
      toast.success("GSTIN updated");
    } else {
      const newRec: GSTINRecord = {
        id: String(Date.now()),
        ...form,
        pendingReturns: 0,
        itcBalance: 0,
      };
      setGstins((prev) => [...prev, newRec]);
      toast.success("GSTIN added");
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setGstins((prev) => prev.filter((g) => g.id !== id));
    if (activeGSTIN === id && gstins.length > 1) setActiveGSTIN(gstins[0].id);
    toast.success("GSTIN removed");
  };

  const typeBadge = {
    regular: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    composition:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    sez: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    export: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
            <Building2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">
              Multi-GSTIN Registration Manager
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage multiple branch-specific GST registrations in one
              dashboard.
            </p>
          </div>
        </div>
        <Button data-ocid="gstin.add_button" size="sm" onClick={openAdd}>
          <Plus className="mr-1 h-4 w-4" /> Add GSTIN
        </Button>
      </div>

      {/* Active GSTIN Selector */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-3 flex items-center gap-3">
          <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
          <Label className="text-sm font-medium shrink-0">
            Active GSTIN Context:
          </Label>
          <Select value={activeGSTIN} onValueChange={setActiveGSTIN}>
            <SelectTrigger
              data-ocid="gstin.active.select"
              className="h-8 text-xs flex-1 max-w-xs"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {gstins.map((g) => (
                <SelectItem key={g.id} value={g.id} className="text-xs">
                  {g.branchName} — <span className="font-mono">{g.gstin}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* GSTIN Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {gstins.map((g, idx) => (
          <Card
            key={g.id}
            className={`relative ${activeGSTIN === g.id ? "ring-2 ring-primary" : ""}`}
            data-ocid={`gstin.item.${idx + 1}`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold">
                    {g.branchName}
                  </CardTitle>
                  <p className="font-mono text-xs text-muted-foreground mt-0.5">
                    {g.gstin}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    data-ocid={`gstin.edit_button.${idx + 1}`}
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() => openEdit(g)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    data-ocid={`gstin.delete_button.${idx + 1}`}
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(g.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{g.state}</span>
                <Badge className={`text-xs ${typeBadge[g.type]}`}>
                  {g.type.charAt(0).toUpperCase() + g.type.slice(1)}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {g.filingFrequency}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/50">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Pending Returns
                  </p>
                  <p
                    className={`text-sm font-semibold ${g.pendingReturns > 0 ? "text-orange-600" : "text-emerald-600"}`}
                  >
                    {g.pendingReturns}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">ITC Balance</p>
                  <p className="text-sm font-semibold text-primary">
                    {formatINR(g.itcBalance)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-ocid="gstin.dialog" className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit GSTIN" : "Add New GSTIN"}</DialogTitle>
            <DialogDescription>
              Enter the GST registration details for this branch.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Branch Name</Label>
              <Input
                data-ocid="gstin.branch_name.input"
                className="h-8 text-xs mt-1"
                placeholder="e.g., Kolkata Branch"
                value={form.branchName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, branchName: e.target.value }))
                }
              />
            </div>
            <div>
              <Label className="text-xs">GSTIN (15 characters)</Label>
              <Input
                data-ocid="gstin.gstin.input"
                className="h-8 text-xs mt-1 font-mono uppercase"
                placeholder="27AAACH7409R1Z4"
                maxLength={15}
                value={form.gstin}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    gstin: e.target.value.toUpperCase(),
                  }))
                }
              />
            </div>
            <div>
              <Label className="text-xs">State</Label>
              <Select
                value={form.state}
                onValueChange={(v) => setForm((p) => ({ ...p, state: v }))}
              >
                <SelectTrigger
                  data-ocid="gstin.state.select"
                  className="h-8 text-xs mt-1"
                >
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {INDIAN_STATES.map((s) => (
                    <SelectItem key={s} value={s} className="text-xs">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Registration Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, type: v as GSTINRecord["type"] }))
                  }
                >
                  <SelectTrigger
                    data-ocid="gstin.type.select"
                    className="h-8 text-xs mt-1"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular" className="text-xs">
                      Regular
                    </SelectItem>
                    <SelectItem value="composition" className="text-xs">
                      Composition
                    </SelectItem>
                    <SelectItem value="sez" className="text-xs">
                      SEZ
                    </SelectItem>
                    <SelectItem value="export" className="text-xs">
                      Export
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Filing Frequency</Label>
                <Select
                  value={form.filingFrequency}
                  onValueChange={(v) =>
                    setForm((p) => ({
                      ...p,
                      filingFrequency: v as GSTINRecord["filingFrequency"],
                    }))
                  }
                >
                  <SelectTrigger
                    data-ocid="gstin.frequency.select"
                    className="h-8 text-xs mt-1"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly" className="text-xs">
                      Monthly
                    </SelectItem>
                    <SelectItem value="quarterly" className="text-xs">
                      Quarterly
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              data-ocid="gstin.dialog.cancel_button"
              variant="outline"
              size="sm"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="gstin.dialog.save_button"
              size="sm"
              onClick={handleSave}
            >
              {editId ? "Update" : "Save GSTIN"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Panel 6: Real-time Alerts & Reports ─────────────────────────────────────

function AlertsReportsPanel() {
  const [alerts, setAlerts] = useState<AlertRecord[]>(INITIAL_ALERTS);
  const [period, setPeriod] = useState("this_month");

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    toast.success("Alert dismissed");
  };

  const taxData = {
    this_month: { cgst: 285000, sgst: 285000, igst: 180000, change: 8.2 },
    last_month: { cgst: 263500, sgst: 263500, igst: 165000, change: -3.1 },
    this_quarter: { cgst: 812000, sgst: 812000, igst: 495000, change: 12.5 },
    custom: { cgst: 150000, sgst: 150000, igst: 95000, change: 0 },
  };

  const td = taxData[period as keyof typeof taxData] || taxData.this_month;
  const totalTax = td.cgst + td.sgst + td.igst;

  const severityBadge = {
    high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    medium:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
          <Bell className="h-5 w-5 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">
            Real-time Alerts & GST Reports
          </h2>
          <p className="text-sm text-muted-foreground">
            Live dashboards for tax liability, ITC tracking, and compliance
            alerts.
          </p>
        </div>
      </div>

      {/* Alert Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-orange-200 dark:border-orange-900/30">
          <CardContent className="py-3">
            <p className="text-2xl font-bold text-orange-600">3</p>
            <p className="text-xs text-muted-foreground">Invoice Mismatches</p>
            <Button
              data-ocid="alerts.mismatches.button"
              size="sm"
              variant="outline"
              className="mt-2 h-7 text-xs w-full border-orange-300 text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20"
            >
              Review
            </Button>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 dark:border-yellow-900/30">
          <CardContent className="py-3">
            <p className="text-2xl font-bold text-yellow-600">2</p>
            <p className="text-xs text-muted-foreground">Expiring (30 days)</p>
            <Button
              data-ocid="alerts.expiry.button"
              size="sm"
              variant="outline"
              className="mt-2 h-7 text-xs w-full border-yellow-300 text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
            >
              View
            </Button>
          </CardContent>
        </Card>
        <Card className="border-red-200 dark:border-red-900/30">
          <CardContent className="py-3">
            <p className="text-2xl font-bold text-red-600">₹1.28L</p>
            <p className="text-xs text-muted-foreground">ITC Loss Risk</p>
            <Button
              data-ocid="alerts.itc_risk.button"
              size="sm"
              variant="outline"
              className="mt-2 h-7 text-xs w-full border-red-300 text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Resolve
            </Button>
          </CardContent>
        </Card>
        <Card className="border-blue-200 dark:border-blue-900/30">
          <CardContent className="py-3">
            <p className="text-2xl font-bold text-blue-600">2</p>
            <p className="text-xs text-muted-foreground">Pending Returns</p>
            <Button
              data-ocid="alerts.pending_returns.button"
              size="sm"
              variant="outline"
              className="mt-2 h-7 text-xs w-full border-blue-300 text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              File Now
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tax Liability Dashboard */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              Tax Liability Dashboard
            </CardTitle>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger
                data-ocid="alerts.period.select"
                className="h-8 w-44 text-xs"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this_month" className="text-xs">
                  This Month
                </SelectItem>
                <SelectItem value="last_month" className="text-xs">
                  Last Month
                </SelectItem>
                <SelectItem value="this_quarter" className="text-xs">
                  This Quarter
                </SelectItem>
                <SelectItem value="custom" className="text-xs">
                  Custom Range
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: "CGST Liability",
                value: td.cgst,
                color: "text-blue-600",
              },
              {
                label: "SGST Liability",
                value: td.sgst,
                color: "text-purple-600",
              },
              {
                label: "IGST Liability",
                value: td.igst,
                color: "text-indigo-600",
              },
            ].map((item) => (
              <Card key={item.label} className="bg-muted/30">
                <CardContent className="py-3 text-center">
                  <p className={`text-xl font-bold ${item.color}`}>
                    {formatINR(item.value)}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Total Tax Liability</p>
                <p className="text-xs text-muted-foreground">
                  CGST + SGST + IGST
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  {formatINR(totalTax)}
                </p>
                <p
                  className={`text-xs flex items-center gap-1 justify-end ${td.change >= 0 ? "text-red-500" : "text-emerald-600"}`}
                >
                  {td.change >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {Math.abs(td.change)}% vs prev period
                </p>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* ITC Tracker */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">ITC Tracker</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: "Total ITC Available",
                value: 845000,
                color: "text-emerald-600",
              },
              { label: "ITC Claimed", value: 612000, color: "text-blue-600" },
              { label: "ITC Blocked", value: 127500, color: "text-red-600" },
            ].map((item) => (
              <Card key={item.label} className="bg-muted/30">
                <CardContent className="py-3 text-center">
                  <p className={`text-xl font-bold ${item.color}`}>
                    {formatINR(item.value)}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                ITC Claimed vs Available
              </span>
              <span className="font-medium">
                {Math.round((612000 / 845000) * 100)}%
              </span>
            </div>
            <Progress
              value={Math.round((612000 / 845000) * 100)}
              className="h-2.5"
            />
          </div>
        </CardContent>
      </Card>

      {/* Alerts Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {alerts.length === 0 ? (
            <div
              data-ocid="alerts.empty_state"
              className="flex items-center justify-center h-20 text-sm text-muted-foreground"
            >
              <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" /> All
              alerts resolved
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Description</TableHead>
                  <TableHead className="text-xs">Severity</TableHead>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((alert, idx) => (
                  <TableRow key={alert.id} data-ocid={`alerts.item.${idx + 1}`}>
                    <TableCell className="text-xs font-medium">
                      {alert.type}
                    </TableCell>
                    <TableCell className="text-xs max-w-[250px]">
                      <span className="line-clamp-2">{alert.description}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`text-xs ${severityBadge[alert.severity]}`}
                      >
                        {alert.severity.charAt(0).toUpperCase() +
                          alert.severity.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{alert.date}</TableCell>
                    <TableCell>
                      <Button
                        data-ocid={`alerts.dismiss.button.${idx + 1}`}
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs"
                        onClick={() => dismissAlert(alert.id)}
                      >
                        <X className="h-3 w-3 mr-1" /> Dismiss
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── GSP Provider Config Data ─────────────────────────────────────────────────

const GSP_PROVIDERS = [
  {
    id: "cleartax" as GSPProvider,
    name: "ClearTax",
    initials: "CT",
    color: "bg-orange-600",
    tagline: "India's #1 GST Filing Platform",
    website: "https://cleartax.in",
    credentialFields: ["apiKey", "clientId", "clientSecret"] as const,
    features: [
      {
        id: "einvoice",
        name: "E-Invoice Generation",
        icon: "FileCheck",
        description: "Generate IRN and QR codes via ClearTax IRP",
      },
      {
        id: "gstr1",
        name: "GSTR-1 Bulk Upload",
        icon: "Upload",
        description: "Upload outward supply return data in bulk",
      },
      {
        id: "gstr3b",
        name: "GSTR-3B Filing",
        icon: "FileText",
        description: "File monthly summary GST return",
      },
      {
        id: "itc_recon",
        name: "ITC Reconciliation",
        icon: "GitMerge",
        description: "Match purchase invoices against GSTR-2B",
      },
      {
        id: "hsn_validate",
        name: "HSN Validation",
        icon: "ShieldCheck",
        description: "Validate HSN/SAC codes against GSTN database",
      },
      {
        id: "bulk_irn",
        name: "Bulk IRN Status",
        icon: "Database",
        description: "Track bulk IRN generation jobs and download results",
      },
    ],
    demoLogs: [
      {
        op: "GSTR-1 Upload",
        status: "success",
        records: 142,
        time: "2026-03-05 10:30 AM",
      },
      {
        op: "E-Invoice Generation",
        status: "success",
        records: 38,
        time: "2026-03-04 03:15 PM",
      },
      {
        op: "ITC Reconciliation",
        status: "failed",
        records: 0,
        time: "2026-03-03 11:00 AM",
      },
      {
        op: "HSN Validation",
        status: "success",
        records: 215,
        time: "2026-03-02 09:45 AM",
      },
      {
        op: "GSTR-3B Filing",
        status: "pending",
        records: 0,
        time: "2026-03-01 08:00 AM",
      },
    ],
  },
  {
    id: "mastersIndia" as GSPProvider,
    name: "Masters India",
    initials: "MI",
    color: "bg-blue-700",
    tagline: "GST Suvidha Provider & API Suite",
    website: "https://mastersindia.co",
    credentialFields: ["apiKey", "clientId"] as const,
    features: [
      {
        id: "gstin_verify",
        name: "GSTIN Verification",
        icon: "ShieldCheck",
        description: "Verify supplier/customer GSTINs in real time",
      },
      {
        id: "ewaybill",
        name: "E-Way Bill Generation",
        icon: "Truck",
        description: "Generate and manage e-way bills via NIC",
      },
      {
        id: "gstr2b_recon",
        name: "GSTR-2B Auto-Reconciliation",
        icon: "GitMerge",
        description: "Auto-match purchase invoices against GSTR-2B data",
      },
      {
        id: "taxpayer_profile",
        name: "Taxpayer Profile Lookup",
        icon: "Building2",
        description: "Fetch complete taxpayer profile and filing history",
      },
      {
        id: "return_status",
        name: "Return Filing Status",
        icon: "CheckCircle2",
        description: "Check GSTR-1/3B/9 filing status for any GSTIN",
      },
    ],
    demoLogs: [
      {
        op: "GSTIN Verification",
        status: "success",
        records: 56,
        time: "2026-03-05 11:00 AM",
      },
      {
        op: "E-Way Bill Generation",
        status: "success",
        records: 12,
        time: "2026-03-04 04:30 PM",
      },
      {
        op: "GSTR-2B Reconciliation",
        status: "success",
        records: 98,
        time: "2026-03-03 02:00 PM",
      },
      {
        op: "Taxpayer Profile Lookup",
        status: "failed",
        records: 0,
        time: "2026-03-02 10:15 AM",
      },
      {
        op: "Return Status Check",
        status: "success",
        records: 3,
        time: "2026-03-01 09:00 AM",
      },
    ],
  },
  {
    id: "iris" as GSPProvider,
    name: "IRIS GST",
    initials: "IR",
    color: "bg-violet-700",
    tagline: "Comprehensive GST Compliance & Analytics",
    website: "https://irisgst.com",
    credentialFields: ["apiKey", "clientId"] as const,
    features: [
      {
        id: "gstr9",
        name: "GSTR-9 Annual Return",
        icon: "FileText",
        description: "Prepare and file GSTR-9 annual return",
      },
      {
        id: "gstr9c",
        name: "GSTR-9C Reconciliation",
        icon: "GitMerge",
        description: "Reconciliation statement for annual audit",
      },
      {
        id: "demand_notice",
        name: "Demand & Notices Tracker",
        icon: "Bell",
        description: "Track GST demand notices and responses",
      },
      {
        id: "gst_audit",
        name: "GST Audit Support",
        icon: "ShieldCheck",
        description: "Audit trail and documentation for GST assessments",
      },
      {
        id: "itc04",
        name: "ITC-04 Job Work",
        icon: "Network",
        description: "Manage job work challan and ITC-04 compliance",
      },
    ],
    demoLogs: [
      {
        op: "GSTR-9 Preparation",
        status: "success",
        records: 1,
        time: "2026-03-05 09:00 AM",
      },
      {
        op: "Demand Notice Fetch",
        status: "success",
        records: 2,
        time: "2026-03-04 01:30 PM",
      },
      {
        op: "GSTR-9C Reconciliation",
        status: "pending",
        records: 0,
        time: "2026-03-03 03:45 PM",
      },
      {
        op: "ITC-04 Submission",
        status: "success",
        records: 7,
        time: "2026-03-02 11:30 AM",
      },
      {
        op: "GST Audit Export",
        status: "success",
        records: 340,
        time: "2026-03-01 04:00 PM",
      },
    ],
  },
  {
    id: "tally" as GSPProvider,
    name: "Tally Solutions",
    initials: "TL",
    color: "bg-green-700",
    tagline: "Tally Prime GST Integration",
    website: "https://tallysolutions.com",
    credentialFields: ["apiKey", "clientId", "clientSecret"] as const,
    features: [
      {
        id: "tally_export",
        name: "Tally XML/JSON Export",
        icon: "Download",
        description: "Export GST data from Tally in GSTN-compatible format",
      },
      {
        id: "gstr1_tally",
        name: "GSTR-1 from Tally",
        icon: "Upload",
        description: "Generate and file GSTR-1 directly from Tally ledgers",
      },
      {
        id: "purchase_sync",
        name: "Purchase Register Sync",
        icon: "RefreshCw",
        description: "Sync purchase register entries from Tally Prime",
      },
      {
        id: "sales_sync",
        name: "Sales Register Sync",
        icon: "RefreshCw",
        description: "Sync sales register entries from Tally Prime",
      },
      {
        id: "tally_recon",
        name: "Reconciliation with Tally",
        icon: "GitMerge",
        description: "Match BizAccounts data with Tally books",
      },
    ],
    demoLogs: [
      {
        op: "Sales Register Sync",
        status: "success",
        records: 210,
        time: "2026-03-05 08:00 AM",
      },
      {
        op: "GSTR-1 from Tally",
        status: "success",
        records: 87,
        time: "2026-03-04 02:00 PM",
      },
      {
        op: "Purchase Register Sync",
        status: "success",
        records: 143,
        time: "2026-03-03 10:00 AM",
      },
      {
        op: "Tally Reconciliation",
        status: "failed",
        records: 0,
        time: "2026-03-02 09:00 AM",
      },
      {
        op: "XML Export",
        status: "success",
        records: 1,
        time: "2026-03-01 05:00 PM",
      },
    ],
  },
] as const;

type GSPProviderConfig = (typeof GSP_PROVIDERS)[number];

// Helper: map icon string to Lucide component
function FeatureIcon({
  icon,
  className,
}: { icon: string; className?: string }) {
  const props = { className: className ?? "h-4 w-4" };
  switch (icon) {
    case "FileCheck":
      return <FileCheck {...props} />;
    case "Upload":
      return <Upload {...props} />;
    case "FileText":
      return <FileText {...props} />;
    case "GitMerge":
      return <GitMerge {...props} />;
    case "ShieldCheck":
      return <ShieldCheck {...props} />;
    case "Database":
      return <Database {...props} />;
    case "Truck":
      return <Truck {...props} />;
    case "Building2":
      return <Building2 {...props} />;
    case "CheckCircle2":
      return <CheckCircle2 {...props} />;
    case "Bell":
      return <Bell {...props} />;
    case "Network":
      return <Network {...props} />;
    case "RefreshCw":
      return <RefreshCw {...props} />;
    case "Download":
      return <Download {...props} />;
    default:
      return <Database {...props} />;
  }
}

// ─── Single Provider Section ──────────────────────────────────────────────────

interface ProviderSectionProps {
  provider: GSPProviderConfig;
  principal: string | undefined;
  cardIndex: number;
}

function ProviderSection({
  provider,
  principal,
  cardIndex,
}: ProviderSectionProps) {
  const { data: savedCreds } = useGetProviderCredentials(
    principal,
    provider.id,
  );
  const upsertCreds = useUpsertProviderCredentials(principal, provider.id);
  const deleteCreds = useDeleteProviderCredentials(principal, provider.id);

  const isConnected = !!savedCreds?.apiKey;

  // Local credential form state
  const [formValues, setFormValues] = useState<Record<string, string>>({
    apiKey: "",
    clientId: "",
    clientSecret: "",
  });

  // Pre-fill from saved creds
  useEffect(() => {
    if (savedCreds) {
      setFormValues({
        apiKey: savedCreds.apiKey ?? "",
        clientId: savedCreds.clientId ?? "",
        clientSecret: savedCreds.clientSecret ?? "",
      });
    }
  }, [savedCreds]);

  // API health check simulation
  const [healthStatus, setHealthStatus] = useState<
    "checking" | "online" | "degraded"
  >("checking");
  useEffect(() => {
    const t = setTimeout(
      () => {
        setHealthStatus(isConnected ? "online" : "degraded");
      },
      1000 + Math.random() * 500,
    );
    return () => clearTimeout(t);
  }, [isConnected]);

  // Feature workflow running state: featureId -> progress (0-100) or null
  const [featureProgress, setFeatureProgress] = useState<
    Record<string, number | null>
  >({});
  const [featureDone, setFeatureDone] = useState<Record<string, boolean>>({});

  const handleRunFeature = async (featureId: string, featureName: string) => {
    setFeatureProgress((p) => ({ ...p, [featureId]: 0 }));
    setFeatureDone((p) => ({ ...p, [featureId]: false }));

    // Animate progress 0→100 over 2s
    const steps = 20;
    const interval = 2000 / steps;
    for (let i = 1; i <= steps; i++) {
      await new Promise((r) => setTimeout(r, interval));
      setFeatureProgress((p) => ({
        ...p,
        [featureId]: Math.round((i / steps) * 100),
      }));
    }
    setFeatureProgress((p) => ({ ...p, [featureId]: null }));
    setFeatureDone((p) => ({ ...p, [featureId]: true }));
    toast.success(
      `Simulated: ${featureName} completed via ${provider.name}. (Live integration requires valid API credentials.)`,
    );
  };

  const handleSaveCredentials = async () => {
    if (!formValues.apiKey.trim()) {
      toast.error("API Key is required");
      return;
    }
    await upsertCreds.mutateAsync({
      apiKey: formValues.apiKey,
      clientId: formValues.clientId,
      clientSecret: formValues.clientSecret,
      gstin: "",
      enabled: true,
    });
    toast.success(`${provider.name} credentials saved`);
    setHealthStatus("online");
  };

  const handleDisconnect = async () => {
    await deleteCreds.mutateAsync();
    setFormValues({ apiKey: "", clientId: "", clientSecret: "" });
    setHealthStatus("degraded");
    toast.success(`${provider.name} disconnected`);
  };

  const handleDownloadLogs = () => {
    const lines = provider.demoLogs.map(
      (l) => `[${l.time}] ${l.op} — Status: ${l.status}, Records: ${l.records}`,
    );
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${provider.id}_logs.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Logs downloaded: ${provider.id}_logs.txt`);
  };

  const logStatusBadge = (status: string) => {
    if (status === "success")
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
    if (status === "failed")
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
  };

  const fieldLabel: Record<string, string> = {
    apiKey: "API Key",
    clientId: "Client ID",
    clientSecret: "Client Secret",
    userId: "User ID",
    companyId: "Company ID",
    companyName: "Company Name in Tally",
    licenseKey: "License Key",
  };
  const fieldType: Record<string, string> = {
    apiKey: "password",
    clientSecret: "password",
    licenseKey: "password",
  };

  return (
    <div
      id={`gsp-provider-${provider.id}`}
      className="space-y-4 pt-4 border-t border-border/60 first:border-0 first:pt-0"
    >
      {/* Connection Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl ${provider.color} flex items-center justify-center text-white font-bold text-sm shrink-0`}
            >
              {provider.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-base font-bold">
                  {provider.name}
                </CardTitle>
                <Badge
                  className={`text-xs ${isConnected ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-muted text-muted-foreground"}`}
                  data-ocid={`gsp.provider_card.${cardIndex}`}
                >
                  {isConnected ? "Connected" : "Not Configured"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {provider.tagline}
              </p>
              <a
                href={provider.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-0.5"
              >
                <Globe className="h-3 w-3" />{" "}
                {provider.website.replace("https://", "")}
              </a>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {/* API Health */}
              <div className="flex items-center gap-1.5 text-xs">
                {healthStatus === "checking" ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                    <span className="text-muted-foreground">Checking…</span>
                  </>
                ) : healthStatus === "online" ? (
                  <>
                    <Wifi className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-emerald-600 font-medium">Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-amber-600 font-medium">Degraded</span>
                  </>
                )}
              </div>
            </div>
          </div>
          {isConnected && (
            <p className="text-xs text-muted-foreground mt-1">
              Last sync: {provider.demoLogs[0].time}
            </p>
          )}
        </CardHeader>

        {/* Credentials Form */}
        <CardContent className="space-y-3 border-t border-border/50 pt-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            API Credentials
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {provider.credentialFields.map((field) => (
              <div key={field}>
                <Label className="text-xs">{fieldLabel[field] ?? field}</Label>
                <Input
                  data-ocid={`gsp.${provider.id}.apikey_input`}
                  type={fieldType[field] ?? "text"}
                  placeholder={`Enter ${(fieldLabel[field] ?? field).toLowerCase()}`}
                  className="h-8 text-xs mt-1"
                  value={formValues[field] ?? ""}
                  onChange={(e) =>
                    setFormValues((prev) => ({
                      ...prev,
                      [field]: e.target.value,
                    }))
                  }
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-1">
            <Button
              data-ocid={`gsp.${provider.id}.save_button`}
              size="sm"
              onClick={handleSaveCredentials}
              disabled={upsertCreds.isPending}
              className="h-8 text-xs"
            >
              {upsertCreds.isPending ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : null}
              Save Credentials
            </Button>
            {isConnected && (
              <Button
                data-ocid={`gsp.${provider.id}.disconnect_button`}
                size="sm"
                variant="destructive"
                onClick={handleDisconnect}
                disabled={deleteCreds.isPending}
                className="h-8 text-xs"
              >
                {deleteCreds.isPending ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : null}
                Disconnect
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Feature Workflow Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {provider.features.map((feature) => {
          const progress = featureProgress[feature.id];
          const done = featureDone[feature.id];
          const running = progress !== null && progress !== undefined;

          return (
            <Card key={feature.id} className="relative overflow-hidden">
              <CardContent className="pt-4 pb-3 space-y-2">
                <div className="flex items-start gap-2">
                  <div className="p-1.5 rounded-md bg-primary/10 shrink-0 mt-0.5">
                    <FeatureIcon
                      icon={feature.icon}
                      className="h-3.5 w-3.5 text-primary"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold line-clamp-1">
                      {feature.name}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {feature.description}
                    </p>
                  </div>
                </div>

                {running && (
                  <div className="space-y-1">
                    <Progress value={progress ?? 0} className="h-1.5" />
                    <p className="text-xs text-muted-foreground text-right">
                      {progress}%
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <Badge
                    className={`text-xs ${
                      running
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : done
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {running ? "Running" : done ? "Done" : "Ready"}
                  </Badge>
                  <Button
                    data-ocid={`gsp.${provider.id}.${feature.id}.button`}
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs px-2"
                    onClick={() => handleRunFeature(feature.id, feature.name)}
                    disabled={running}
                  >
                    {running ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      "Run Now"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Activity Log */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
          <CardDescription className="text-xs">
            Last 5 operations
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div
            className="overflow-x-auto"
            data-ocid={`gsp.${provider.id}.activity_table`}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Operation</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs text-right">Records</TableHead>
                  <TableHead className="text-xs">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {provider.demoLogs.map((log, idx) => (
                  <TableRow
                    key={`${log.op}-${log.time}`}
                    data-ocid={`gsp.${provider.id}.item.${idx + 1}`}
                  >
                    <TableCell className="text-xs">{log.op}</TableCell>
                    <TableCell>
                      <Badge
                        className={`text-xs ${logStatusBadge(log.status)}`}
                      >
                        {log.status.charAt(0).toUpperCase() +
                          log.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-right">
                      {log.records}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {log.time}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Button
          data-ocid={`gsp.${provider.id}.run_all_button`}
          size="sm"
          variant="default"
          className="h-8 text-xs"
          onClick={() =>
            toast.success(`Running all workflows for ${provider.name}…`)
          }
        >
          <RefreshCw className="mr-1 h-3 w-3" /> Run All Workflows
        </Button>
        <Button
          data-ocid={`gsp.${provider.id}.view_report_button`}
          size="sm"
          variant="outline"
          className="h-8 text-xs"
          onClick={() => toast.info("Report viewer coming soon")}
        >
          <FileText className="mr-1 h-3 w-3" /> View Last Report
        </Button>
        <Button
          data-ocid={`gsp.${provider.id}.download_logs_button`}
          size="sm"
          variant="outline"
          className="h-8 text-xs"
          onClick={handleDownloadLogs}
        >
          <Download className="mr-1 h-3 w-3" /> Download Logs
        </Button>
      </div>
    </div>
  );
}

// ─── Panel 7: GSP Providers ───────────────────────────────────────────────────

function GSPProvidersPanel() {
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal().toString();

  const scrollToProvider = (providerId: string) => {
    const el = document.getElementById(`gsp-provider-${providerId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      // Brief highlight
      el.style.transition = "outline 0.2s";
      el.style.outline = "2px solid var(--primary)";
      el.style.outlineOffset = "4px";
      setTimeout(() => {
        el.style.outline = "";
      }, 1500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-orange-100 to-blue-100 dark:from-orange-900/30 dark:to-blue-900/30">
          <Globe className="h-5 w-5 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">GSP Providers</h2>
          <p className="text-sm text-muted-foreground">
            Configure and manage your GST Suvidha Provider integrations.
          </p>
        </div>
      </div>

      {/* Provider Overview Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {GSP_PROVIDERS.map((provider, idx) => {
          const storedKey = principal
            ? localStorage.getItem(
                `gst_provider_credentials_${provider.id}_${principal}`,
              )
            : null;
          const isConnected = storedKey
            ? !!JSON.parse(storedKey)?.apiKey
            : false;

          return (
            <Card
              key={provider.id}
              data-ocid={`gsp.provider_card.${idx + 1}`}
              className="cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all"
              onClick={() => scrollToProvider(provider.id)}
            >
              <CardContent className="pt-4 pb-3 space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-9 h-9 rounded-lg ${provider.color} flex items-center justify-center text-white font-bold text-xs shrink-0`}
                  >
                    {provider.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold line-clamp-1">
                      {provider.name}
                    </p>
                    <Badge
                      className={`text-xs mt-0.5 ${isConnected ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-muted text-muted-foreground"}`}
                    >
                      {isConnected ? "Connected" : "Not Configured"}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {provider.tagline}
                </p>
                {isConnected && (
                  <p className="text-xs text-muted-foreground truncate">
                    Last: {provider.demoLogs[0].time}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Provider Detail Sections */}
      <div className="space-y-6">
        {GSP_PROVIDERS.map((provider, idx) => (
          <ProviderSection
            key={provider.id}
            provider={provider}
            principal={principal}
            cardIndex={idx + 1}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main GSTSuiteTab ─────────────────────────────────────────────────────────

export default function GSTSuiteTab() {
  return (
    <div className="space-y-4">
      {/* Tab Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-border">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
          <ShieldCheck className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">GSP Suite</h1>
          <p className="text-sm text-muted-foreground">
            GSTN Suvidha Provider — Automated compliance, reconciliation, and
            e-invoicing
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs">
            <CheckCircle2 className="mr-1 h-3 w-3" /> GSTN Compliant
          </Badge>
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs">
            <ShieldCheck className="mr-1 h-3 w-3" /> Secure Channel
          </Badge>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <Tabs defaultValue="data-processing" className="space-y-6">
        <div className="overflow-x-auto pb-1">
          <TabsList className="inline-flex h-auto gap-1 p-1.5 bg-card border border-border/50 rounded-xl">
            <TabsTrigger
              data-ocid="gsp.data_processing.tab"
              value="data-processing"
              className="gap-1.5 text-xs px-3 py-1.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Database className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">
                Data Processing
              </span>
            </TabsTrigger>
            <TabsTrigger
              data-ocid="gsp.reconciliation.tab"
              value="reconciliation"
              className="gap-1.5 text-xs px-3 py-1.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <GitMerge className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">
                Reconciliation
              </span>
            </TabsTrigger>
            <TabsTrigger
              data-ocid="gsp.erp_integration.tab"
              value="erp-integration"
              className="gap-1.5 text-xs px-3 py-1.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Network className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">
                ERP Integration
              </span>
            </TabsTrigger>
            <TabsTrigger
              data-ocid="gsp.eway_einvoice.tab"
              value="eway-einvoice"
              className="gap-1.5 text-xs px-3 py-1.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Truck className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">
                E-Way & IRN
              </span>
            </TabsTrigger>
            <TabsTrigger
              data-ocid="gsp.multi_gstin.tab"
              value="multi-gstin"
              className="gap-1.5 text-xs px-3 py-1.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Building2 className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">
                Multi-GSTIN
              </span>
            </TabsTrigger>
            <TabsTrigger
              data-ocid="gsp.alerts_reports.tab"
              value="alerts-reports"
              className="gap-1.5 text-xs px-3 py-1.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Bell className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">
                Alerts & Reports
              </span>
            </TabsTrigger>
            <TabsTrigger
              data-ocid="gsp.providers.tab"
              value="gsp-providers"
              className="gap-1.5 text-xs px-3 py-1.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Globe className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">
                GSP Providers
              </span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="data-processing">
          <AutomatedDataProcessingPanel />
        </TabsContent>
        <TabsContent value="reconciliation">
          <ReconciliationEnginePanel />
        </TabsContent>
        <TabsContent value="erp-integration">
          <ERPIntegrationPanel />
        </TabsContent>
        <TabsContent value="eway-einvoice">
          <EWayEInvoicingPanel />
        </TabsContent>
        <TabsContent value="multi-gstin">
          <MultiGSTINPanel />
        </TabsContent>
        <TabsContent value="alerts-reports">
          <AlertsReportsPanel />
        </TabsContent>
        <TabsContent value="gsp-providers">
          <GSPProvidersPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
