import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Download,
  FileText,
  RefreshCw,
  Upload,
  XCircle,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface ParsedRow {
  index: number;
  data: Record<string, string>;
  status: "valid" | "error" | "warning";
  messages: string[];
}

interface ColumnMapping {
  fileColumn: string;
  targetField: string;
}

const DATA_TYPES = [
  "invoices",
  "transactions",
  "contacts",
  "journal-entries",
  "products",
];
const _EXPORT_FORMATS = ["csv", "excel"];

const FIELD_OPTIONS: Record<string, string[]> = {
  invoices: [
    "invoiceNumber",
    "clientName",
    "amount",
    "date",
    "dueDate",
    "status",
  ],
  transactions: ["date", "description", "amount", "category", "type"],
  contacts: ["name", "email", "phone", "address", "company"],
  "journal-entries": ["date", "description", "debit", "credit", "account"],
  products: ["name", "sku", "price", "stockLevel", "description"],
};

const MOCK_EXPORT_DATA: Record<string, object[]> = {
  invoices: [
    {
      invoiceNumber: "INV-2026-001",
      clientName: "Acme Corp",
      amount: 4500,
      date: "2026-01-15",
      status: "paid",
    },
    {
      invoiceNumber: "INV-2026-002",
      clientName: "Tech Ltd",
      amount: 2800,
      date: "2026-02-01",
      status: "unpaid",
    },
  ],
  transactions: [
    {
      date: "2026-02-01",
      description: "Sales Revenue",
      amount: 5000,
      category: "income",
      type: "sale",
    },
    {
      date: "2026-02-02",
      description: "Office Supplies",
      amount: -450,
      category: "expense",
      type: "expense",
    },
  ],
  contacts: [
    {
      name: "John Smith",
      email: "john@acme.com",
      phone: "+1-555-0100",
      company: "Acme Corp",
    },
    {
      name: "Jane Doe",
      email: "jane@tech.com",
      phone: "+1-555-0200",
      company: "Tech Ltd",
    },
  ],
  "journal-entries": [
    {
      date: "2026-02-01",
      description: "Sales Revenue",
      debit: 0,
      credit: 5000,
      account: "Revenue",
    },
    {
      date: "2026-02-02",
      description: "Office Supplies",
      debit: 450,
      credit: 0,
      account: "Expenses",
    },
  ],
  products: [
    {
      name: "Widget A",
      sku: "WGT-001",
      price: 29.99,
      stockLevel: 150,
      description: "Standard widget",
    },
    {
      name: "Widget B",
      sku: "WGT-002",
      price: 49.99,
      stockLevel: 75,
      description: "Premium widget",
    },
  ],
};

function parseCSV(content: string): {
  headers: string[];
  rows: Record<string, string>[];
} {
  const lines = content.split("\n").filter((l) => l.trim());
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
  const rows = lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = values[i] || "";
    });
    return row;
  });
  return { headers, rows };
}

function validateRow(
  row: Record<string, string>,
  mappings: ColumnMapping[],
  dataType: string,
): { status: "valid" | "error" | "warning"; messages: string[] } {
  const messages: string[] = [];
  let status: "valid" | "error" | "warning" = "valid";

  const requiredFields = FIELD_OPTIONS[dataType]?.slice(0, 2) || [];
  for (const field of requiredFields) {
    const mapping = mappings.find((m) => m.targetField === field);
    if (mapping && !row[mapping.fileColumn]) {
      messages.push(`Missing required field: ${field}`);
      status = "error";
    }
  }

  // Check for numeric fields
  const numericFields = ["amount", "price", "debit", "credit", "stockLevel"];
  for (const mapping of mappings) {
    if (
      numericFields.includes(mapping.targetField) &&
      row[mapping.fileColumn]
    ) {
      if (Number.isNaN(Number.parseFloat(row[mapping.fileColumn]))) {
        messages.push(`Invalid number in ${mapping.targetField}`);
        status = status === "error" ? "error" : "warning";
      }
    }
  }

  return { status, messages };
}

function generateCSV(data: object[]): string {
  if (data.length === 0) return "";
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers
      .map((h) => `"${(row as Record<string, unknown>)[h] ?? ""}"`)
      .join(","),
  );
  return [headers.join(","), ...rows].join("\n");
}

export default function ImportExportTab() {
  const [importDataType, setImportDataType] = useState("invoices");
  const [exportDataType, setExportDataType] = useState("invoices");
  const [exportFormat, setExportFormat] = useState("csv");
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<Record<string, string>[]>([]);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [validationResults, setValidationResults] = useState<ParsedRow[]>([]);
  const [committed, setCommitted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      const { headers, rows } = parseCSV(content);
      setParsedHeaders(headers);
      setParsedRows(rows);
      // Auto-map columns
      const fields = FIELD_OPTIONS[importDataType] || [];
      const autoMappings: ColumnMapping[] = headers.map((h) => ({
        fileColumn: h,
        targetField:
          fields.find((f) => f.toLowerCase() === h.toLowerCase()) || "",
      }));
      setMappings(autoMappings);
      setValidationResults([]);
      setCommitted(false);
      toast.success(`Parsed ${rows.length} rows from ${file.name}`);
    };
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleValidate = () => {
    const results: ParsedRow[] = parsedRows.map((row, i) => {
      const { status, messages } = validateRow(row, mappings, importDataType);
      return { index: i + 1, data: row, status, messages };
    });
    setValidationResults(results);
    const errors = results.filter((r) => r.status === "error").length;
    const warnings = results.filter((r) => r.status === "warning").length;
    if (errors > 0) {
      toast.error(
        `Validation found ${errors} error(s) and ${warnings} warning(s)`,
      );
    } else {
      toast.success(
        `Validation passed! ${warnings} warning(s). Ready to commit.`,
      );
    }
  };

  const handleCommit = () => {
    const validRows = validationResults.filter((r) => r.status !== "error");
    if (validRows.length === 0) {
      toast.error("No valid rows to import");
      return;
    }
    // Store in localStorage
    const existing = JSON.parse(
      localStorage.getItem(`import_${importDataType}`) || "[]",
    );
    const newData = validRows.map((r) => r.data);
    localStorage.setItem(
      `import_${importDataType}`,
      JSON.stringify([...existing, ...newData]),
    );
    setCommitted(true);
    toast.success(`Imported ${validRows.length} records successfully`);
  };

  const handleExport = () => {
    const data = MOCK_EXPORT_DATA[exportDataType] || [];
    if (data.length === 0) {
      toast.error("No data to export");
      return;
    }

    const csv = generateCSV(data);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exportDataType}-export.${exportFormat === "excel" ? "csv" : "csv"}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${data.length} ${exportDataType} records`);
  };

  const errorCount = validationResults.filter(
    (r) => r.status === "error",
  ).length;
  const warningCount = validationResults.filter(
    (r) => r.status === "warning",
  ).length;
  const validCount = validationResults.filter(
    (r) => r.status === "valid",
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Import / Export</h2>
        <p className="text-muted-foreground">
          Mass import or export accounting data via CSV and Excel files
        </p>
      </div>

      <Tabs defaultValue="import">
        <TabsList className="grid grid-cols-2 w-full max-w-xs">
          <TabsTrigger value="import">Import Data</TabsTrigger>
          <TabsTrigger value="export">Export Data</TabsTrigger>
        </TabsList>

        {/* Import */}
        <TabsContent value="import" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Upload className="h-4 w-4" /> Import Data
              </CardTitle>
              <CardDescription>
                Upload a CSV or Excel file and map columns to data fields
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="space-y-1">
                  <Label className="text-xs">Data Type</Label>
                  <Select
                    value={importDataType}
                    onValueChange={setImportDataType}
                  >
                    <SelectTrigger className="w-40 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DATA_TYPES.map((t) => (
                        <SelectItem key={t} value={t} className="capitalize">
                          {t.replace("-", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">&nbsp;</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1.5"
                    onClick={() => fileRef.current?.click()}
                  >
                    <Upload className="h-3.5 w-3.5" /> Choose File (.CSV, .XLSX)
                  </Button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
              </div>

              {parsedHeaders.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Column Mapping</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {mappings.map((mapping, i) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: stable list
                        // biome-ignore lint/suspicious/noArrayIndexKey: stable list
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-xs bg-muted px-2 py-1 rounded font-mono flex-1 truncate">
                            {mapping.fileColumn}
                          </span>
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <Select
                            value={
                              mapping.targetField === ""
                                ? "__skip__"
                                : mapping.targetField
                            }
                            onValueChange={(v) =>
                              setMappings((prev) =>
                                prev.map((m, idx) =>
                                  idx === i
                                    ? {
                                        ...m,
                                        targetField: v === "__skip__" ? "" : v,
                                      }
                                    : m,
                                ),
                              )
                            }
                          >
                            <SelectTrigger className="h-7 text-xs flex-1">
                              <SelectValue placeholder="Skip" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__skip__">Skip</SelectItem>
                              {(FIELD_OPTIONS[importDataType] || []).map(
                                (f) => (
                                  <SelectItem key={f} value={f}>
                                    {f}
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      Preview (first 3 rows)
                    </p>
                    <div className="rounded-lg border border-border/50 overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {parsedHeaders.map((h) => (
                              <TableHead key={h} className="text-xs">
                                {h}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {parsedRows.slice(0, 3).map((row, i) => (
                            // biome-ignore lint/suspicious/noArrayIndexKey: stable list
                            // biome-ignore lint/suspicious/noArrayIndexKey: stable list
                            <TableRow key={i}>
                              {parsedHeaders.map((h) => (
                                <TableCell key={h} className="text-xs">
                                  {row[h]}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleValidate}
                      className="gap-1.5"
                    >
                      <RefreshCw className="h-3.5 w-3.5" /> Validate
                    </Button>
                    {validationResults.length > 0 &&
                      errorCount === 0 &&
                      !committed && (
                        <Button
                          size="sm"
                          onClick={handleCommit}
                          className="gap-1.5"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Commit Import
                        </Button>
                      )}
                  </div>
                </>
              )}

              {/* Validation Results */}
              {validationResults.length > 0 && (
                <div className="space-y-3">
                  <Separator />
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg bg-green-50 dark:bg-green-950/20 p-3 text-center">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto mb-1" />
                      <p className="text-lg font-bold text-green-700">
                        {validCount}
                      </p>
                      <p className="text-xs text-muted-foreground">Valid</p>
                    </div>
                    <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 p-3 text-center">
                      <AlertCircle className="h-4 w-4 text-amber-600 mx-auto mb-1" />
                      <p className="text-lg font-bold text-amber-700">
                        {warningCount}
                      </p>
                      <p className="text-xs text-muted-foreground">Warnings</p>
                    </div>
                    <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-3 text-center">
                      <XCircle className="h-4 w-4 text-red-600 mx-auto mb-1" />
                      <p className="text-lg font-bold text-red-700">
                        {errorCount}
                      </p>
                      <p className="text-xs text-muted-foreground">Errors</p>
                    </div>
                  </div>

                  {validationResults.filter((r) => r.status !== "valid")
                    .length > 0 && (
                    <div className="rounded-lg border border-border/50 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Row</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Issues</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {validationResults
                            .filter((r) => r.status !== "valid")
                            .map((r) => (
                              <TableRow key={r.index}>
                                <TableCell className="text-xs">
                                  Row {r.index}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    className={`text-[10px] ${r.status === "error" ? "bg-red-500/20 text-red-700 border-red-500/30" : "bg-amber-500/20 text-amber-700 border-amber-500/30"}`}
                                  >
                                    {r.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                  {r.messages.join("; ")}
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {committed && (
                    <div className="rounded-lg bg-green-50 dark:bg-green-950/20 p-3 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <p className="text-sm text-green-700 font-medium">
                        Import committed successfully!
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Export */}
        <TabsContent value="export" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Download className="h-4 w-4" /> Export Data
              </CardTitle>
              <CardDescription>
                Download your accounting data in CSV or Excel format
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                  <Label>Data Type</Label>
                  <Select
                    value={exportDataType}
                    onValueChange={setExportDataType}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DATA_TYPES.map((t) => (
                        <SelectItem key={t} value={t} className="capitalize">
                          {t.replace("-", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Format</Label>
                  <Select value={exportFormat} onValueChange={setExportFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV (.csv)</SelectItem>
                      <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleExport} className="gap-2">
                  <Download className="h-4 w-4" /> Download
                </Button>
              </div>

              {/* Preview of export data */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Preview: {(MOCK_EXPORT_DATA[exportDataType] || []).length}{" "}
                  records available
                </p>
                <div className="rounded-lg border border-border/50 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {Object.keys(
                          (MOCK_EXPORT_DATA[exportDataType] || [{}])[0] || {},
                        ).map((h) => (
                          <TableHead key={h} className="text-xs capitalize">
                            {h}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(MOCK_EXPORT_DATA[exportDataType] || []).map((row) => (
                        <TableRow key={Object.values(row).join("|")}>
                          {Object.entries(row).map(([k, v]) => (
                            <TableCell key={k} className="text-xs">
                              {String(v)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="rounded-lg bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">
                  <strong>Tip:</strong> Exported files can be re-imported to
                  perform mass updates. Ensure column headers match the expected
                  field names.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
