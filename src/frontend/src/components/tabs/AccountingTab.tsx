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
import { Switch } from "@/components/ui/switch";
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
  BookOpen,
  ChevronRight,
  Download,
  FileSearch,
  Settings,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const MOCK_JOURNAL_ENTRIES = [
  {
    id: "JE001",
    date: "2026-02-01",
    description: "Sales Revenue",
    type: "sales",
    debit: 0,
    credit: 5000,
  },
  {
    id: "JE002",
    date: "2026-02-02",
    description: "Office Supplies Purchase",
    type: "purchases",
    debit: 450,
    credit: 0,
  },
  {
    id: "JE003",
    date: "2026-02-03",
    description: "Bank Deposit",
    type: "bank",
    debit: 5000,
    credit: 0,
  },
  {
    id: "JE004",
    date: "2026-02-04",
    description: "Accounts Payable",
    type: "purchases",
    debit: 0,
    credit: 450,
  },
  {
    id: "JE005",
    date: "2026-02-05",
    description: "Payroll Expense",
    type: "misc",
    debit: 8000,
    credit: 0,
  },
  {
    id: "JE006",
    date: "2026-02-06",
    description: "Cash Payment",
    type: "cash",
    debit: 0,
    credit: 8000,
  },
  {
    id: "JE007",
    date: "2026-02-10",
    description: "Consulting Revenue",
    type: "sales",
    debit: 0,
    credit: 3500,
  },
  {
    id: "JE008",
    date: "2026-02-11",
    description: "Bank Deposit",
    type: "bank",
    debit: 3500,
    credit: 0,
  },
];

const TAX_TYPES = [
  {
    name: "Standard VAT",
    rate: "20%",
    type: "percentage",
    basis: "price-excluded",
  },
  {
    name: "Reduced VAT",
    rate: "5%",
    type: "percentage",
    basis: "price-included",
  },
  {
    name: "Zero Rate",
    rate: "0%",
    type: "percentage",
    basis: "price-excluded",
  },
  {
    name: "Compound Tax",
    rate: "18%+2%",
    type: "tax-on-taxes",
    basis: "price-excluded",
  },
];

export default function AccountingTab() {
  const [journalFilter, setJournalFilter] = useState("all");
  const [taxBasis, setTaxBasis] = useState<"accrual" | "cash">("accrual");
  const [cashBasisEnabled, setCashBasisEnabled] = useState(false);
  const [thresholdDate, setThresholdDate] = useState("");
  const [drillEntry, setDrillEntry] = useState<string | null>(null);

  const filteredEntries =
    journalFilter === "all"
      ? MOCK_JOURNAL_ENTRIES
      : MOCK_JOURNAL_ENTRIES.filter((e) => e.type === journalFilter);

  const totalDebit = filteredEntries.reduce((s, e) => s + e.debit, 0);
  const totalCredit = filteredEntries.reduce((s, e) => s + e.credit, 0);

  const taxSummary = [
    { type: "Standard VAT (20%)", collected: 8500, paid: 2100, net: 6400 },
    { type: "Reduced VAT (5%)", collected: 1200, paid: 300, net: 900 },
    { type: "Zero Rate", collected: 0, paid: 0, net: 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Accounting</h2>
        <p className="text-muted-foreground">
          Journal entries, tax management, reports, and accounting settings
        </p>
      </div>

      <Tabs defaultValue="journal">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="journal">Journal Entries</TabsTrigger>
          <TabsTrigger value="tax-config">Tax Config</TabsTrigger>
          <TabsTrigger value="tax-reports">Tax Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Journal Entries */}
        <TabsContent value="journal" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="h-4 w-4" /> Journal Entries Overview
                  </CardTitle>
                  <CardDescription>
                    Filter by journal type and review all entries
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={journalFilter}
                    onValueChange={setJournalFilter}
                  >
                    <SelectTrigger className="w-40 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Journals</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="purchases">Purchases</SelectItem>
                      <SelectItem value="bank">Bank & Cash</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="misc">Miscellaneous</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 h-8 text-xs"
                    onClick={() => toast.success("Exported to CSV")}
                  >
                    <Download className="h-3.5 w-3.5" /> Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-muted/30 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Total Entries</p>
                  <p className="text-xl font-bold">{filteredEntries.length}</p>
                </div>
                <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Total Debit</p>
                  <p className="text-xl font-bold text-blue-700">
                    ${totalDebit.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg bg-green-50 dark:bg-green-950/20 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Total Credit</p>
                  <p className="text-xl font-bold text-green-700">
                    ${totalCredit.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Entry #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Debit</TableHead>
                      <TableHead className="text-right">Credit</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEntries.map((entry) => (
                      <>
                        <TableRow
                          key={entry.id}
                          className="cursor-pointer hover:bg-muted/30"
                          onClick={() =>
                            setDrillEntry(
                              drillEntry === entry.id ? null : entry.id,
                            )
                          }
                        >
                          <TableCell className="text-xs font-mono">
                            {entry.id}
                          </TableCell>
                          <TableCell className="text-xs">
                            {entry.date}
                          </TableCell>
                          <TableCell className="text-xs">
                            {entry.description}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="text-[10px] capitalize"
                            >
                              {entry.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-right text-blue-600 font-medium">
                            {entry.debit > 0
                              ? `$${entry.debit.toLocaleString()}`
                              : "-"}
                          </TableCell>
                          <TableCell className="text-xs text-right text-green-600 font-medium">
                            {entry.credit > 0
                              ? `$${entry.credit.toLocaleString()}`
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <ChevronRight
                              className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${drillEntry === entry.id ? "rotate-90" : ""}`}
                            />
                          </TableCell>
                        </TableRow>
                        {drillEntry === entry.id && (
                          <TableRow key={`${entry.id}-detail`}>
                            <TableCell colSpan={7} className="bg-muted/20 p-3">
                              <div className="text-xs space-y-1">
                                <p className="font-medium">Entry Details</p>
                                <p className="text-muted-foreground">
                                  Account:{" "}
                                  {entry.type === "sales"
                                    ? "Revenue Account"
                                    : "Expense Account"}
                                </p>
                                <p className="text-muted-foreground">
                                  Reference: {entry.id}
                                </p>
                                <p className="text-muted-foreground">
                                  Posted: {entry.date}
                                </p>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax Configuration */}
        <TabsContent value="tax-config" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Advanced Tax Configuration
              </CardTitle>
              <CardDescription>
                Configure tax computation types: percentage, grid, tax-on-taxes,
                partial exemptions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tax Name</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Computation</TableHead>
                      <TableHead>Basis</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {TAX_TYPES.map((tax) => (
                      <TableRow key={tax.name}>
                        <TableCell className="text-sm font-medium">
                          {tax.name}
                        </TableCell>
                        <TableCell className="text-sm">{tax.rate}</TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className="text-xs capitalize"
                          >
                            {tax.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {tax.basis}
                        </TableCell>
                        <TableCell>
                          <Badge className="text-xs bg-green-500/20 text-green-700 border-green-500/30">
                            Active
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="p-4 rounded-lg bg-muted/30 space-y-3">
                <p className="text-sm font-medium">Add New Tax Rule</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Tax Name</Label>
                    <Input placeholder="e.g. GST 18%" className="h-8 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Rate (%)</Label>
                    <Input
                      type="number"
                      placeholder="18"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Computation</Label>
                    <Select>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                        <SelectItem value="tax-on-taxes">
                          Tax on Taxes
                        </SelectItem>
                        <SelectItem value="grid">Grid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Price Basis</Label>
                    <Select>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Basis" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excluded">Price Excluded</SelectItem>
                        <SelectItem value="included">Price Included</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => toast.success("Tax rule saved")}
                >
                  Save Tax Rule
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax Reports */}
        <TabsContent value="tax-reports" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" /> Tax Reports
                  </CardTitle>
                  <CardDescription>
                    View tax liability in accrual or cash basis
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={taxBasis === "accrual" ? "default" : "outline"}
                    className="h-8 text-xs"
                    onClick={() => setTaxBasis("accrual")}
                  >
                    Accrual Basis
                  </Button>
                  <Button
                    size="sm"
                    variant={taxBasis === "cash" ? "default" : "outline"}
                    className="h-8 text-xs"
                    onClick={() => setTaxBasis("cash")}
                  >
                    Cash Basis
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Tax Collected</p>
                  <p className="text-xl font-bold text-red-700">$9,700</p>
                </div>
                <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Input Credit</p>
                  <p className="text-xl font-bold text-blue-700">$2,400</p>
                </div>
                <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Net Payable</p>
                  <p className="text-xl font-bold text-amber-700">$7,300</p>
                </div>
              </div>

              <div className="rounded-lg border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tax Type</TableHead>
                      <TableHead className="text-right">Collected</TableHead>
                      <TableHead className="text-right">Input Credit</TableHead>
                      <TableHead className="text-right">Net Payable</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {taxSummary.map((row) => (
                      <TableRow key={row.type}>
                        <TableCell className="text-sm">{row.type}</TableCell>
                        <TableCell className="text-sm text-right text-red-600">
                          ${row.collected.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm text-right text-blue-600">
                          ${row.paid.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm text-right font-medium">
                          ${row.net.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 text-xs gap-1"
                            onClick={() =>
                              toast.info(`Audit trail for ${row.type}`)
                            }
                          >
                            <FileSearch className="h-3 w-3" /> Audit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => toast.success("Tax report exported")}
                >
                  <Download className="h-3.5 w-3.5" /> Export Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Invoicing Threshold */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="h-4 w-4" /> Invoicing Switch Threshold
                </CardTitle>
                <CardDescription>
                  Invoices before this date won't be treated as accounting
                  entries
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label>Threshold Date</Label>
                  <Input
                    type="date"
                    value={thresholdDate}
                    onChange={(e) => setThresholdDate(e.target.value)}
                  />
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    if (thresholdDate) {
                      localStorage.setItem("invoicingThreshold", thresholdDate);
                      toast.success("Threshold date saved");
                    }
                  }}
                >
                  Save Threshold
                </Button>
              </CardContent>
            </Card>

            {/* Cash Basis Taxes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Cash Basis Taxes</CardTitle>
                <CardDescription>
                  Report income and expenses when cash is received/paid
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Enable Cash Basis</p>
                    <p className="text-xs text-muted-foreground">
                      Switch from accrual to cash basis reporting
                    </p>
                  </div>
                  <Switch
                    checked={cashBasisEnabled}
                    onCheckedChange={(v) => {
                      setCashBasisEnabled(v);
                      toast.success(
                        `Cash basis taxes ${v ? "enabled" : "disabled"}`,
                      );
                    }}
                  />
                </div>
                {cashBasisEnabled && (
                  <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 p-3">
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      Cash basis is active. Tax reports will reflect cash
                      received/paid rather than invoiced amounts.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* TaxCloud Placeholder */}
            <Card className="opacity-70 md:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">
                      TaxCloud Integration
                    </CardTitle>
                    <CardDescription>
                      Automatic US sales tax calculation by zip code and product
                      category
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">Coming Soon</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">
                      TaxCloud API Key
                    </Label>
                    <Input
                      placeholder="Enter API key..."
                      disabled
                      className="opacity-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">
                      Default Zip Code
                    </Label>
                    <Input
                      placeholder="e.g. 10001"
                      disabled
                      className="opacity-50"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  TaxCloud integration is not yet available on this platform.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
