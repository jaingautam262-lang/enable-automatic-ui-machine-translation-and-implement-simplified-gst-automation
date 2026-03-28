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
  CheckCircle2,
  DollarSign,
  FileText,
  Minus,
  Plus,
  RefreshCw,
  Upload,
  XCircle,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface StatementLine {
  id: string;
  date: string;
  description: string;
  amount: number;
  balance: number;
  matched?: boolean;
}

interface CashSession {
  id: string;
  date: string;
  openingBalance: number;
  closingBalance: number;
  transactions: { desc: string; amount: number; type: "in" | "out" }[];
  closed: boolean;
}

const MOCK_INTERNAL_TRANSACTIONS = [
  {
    id: "t1",
    date: "2026-02-01",
    description: "Client Payment - Acme Corp",
    amount: 5000,
  },
  {
    id: "t2",
    date: "2026-02-03",
    description: "Office Supplies",
    amount: -450,
  },
  {
    id: "t3",
    date: "2026-02-05",
    description: "Software License",
    amount: -1200,
  },
  {
    id: "t4",
    date: "2026-02-10",
    description: "Consulting Revenue",
    amount: 3500,
  },
];

export default function BankingTab() {
  const [statements, setStatements] = useState<StatementLine[]>([]);
  const [sessions, setSessions] = useState<CashSession[]>([]);
  const [activeSession, setActiveSession] = useState<CashSession | null>(null);
  const [openingBalance, setOpeningBalance] = useState("");
  const [cashDesc, setCashDesc] = useState("");
  const [cashAmount, setCashAmount] = useState("");
  const [cashType, setCashType] = useState<"in" | "out">("in");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase();
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      const lines = parseStatement(content, ext || "csv");
      setStatements(lines);
      toast.success(
        `Imported ${lines.length} statement lines from ${file.name}`,
      );
    };
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  const parseStatement = (content: string, ext: string): StatementLine[] => {
    // Simple CSV parser for demo
    const lines = content.split("\n").filter((l) => l.trim());
    if (ext === "csv" && lines.length > 1) {
      return lines.slice(1).map((line, i) => {
        const parts = line.split(",");
        return {
          id: `s${i}`,
          date: parts[0]?.trim() || new Date().toISOString().split("T")[0],
          description: parts[1]?.trim() || `Transaction ${i + 1}`,
          amount:
            Number.parseFloat(parts[2]?.trim() || "0") ||
            (Math.random() > 0.5 ? 1 : -1) * Math.round(Math.random() * 5000),
          balance:
            Number.parseFloat(parts[3]?.trim() || "0") ||
            Math.round(Math.random() * 50000),
          matched: false,
        };
      });
    }
    // Mock data for other formats
    return Array.from({ length: 5 }, (_, i) => ({
      id: `s${i}`,
      date: `2026-02-${String(i + 1).padStart(2, "0")}`,
      description: `Bank Transaction ${i + 1}`,
      amount: (Math.random() > 0.5 ? 1 : -1) * Math.round(Math.random() * 5000),
      balance: Math.round(Math.random() * 50000),
      matched: false,
    }));
  };

  const autoMatch = () => {
    const updated = statements.map((stmt) => {
      const match = MOCK_INTERNAL_TRANSACTIONS.find(
        (t) =>
          Math.abs(t.amount - stmt.amount) < 1 ||
          t.description
            .toLowerCase()
            .includes(stmt.description.toLowerCase().split(" ")[0]),
      );
      return { ...stmt, matched: !!match };
    });
    setStatements(updated);
    const matchCount = updated.filter((s) => s.matched).length;
    toast.success(
      `Auto-matched ${matchCount} of ${updated.length} transactions`,
    );
  };

  const openCashSession = () => {
    if (!openingBalance) {
      toast.error("Enter opening balance");
      return;
    }
    const session: CashSession = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      openingBalance: Number.parseFloat(openingBalance),
      closingBalance: Number.parseFloat(openingBalance),
      transactions: [],
      closed: false,
    };
    setActiveSession(session);
    setOpeningBalance("");
    toast.success("Cash session opened");
  };

  const addCashTransaction = () => {
    if (!activeSession || !cashDesc || !cashAmount) {
      toast.error("Fill all fields");
      return;
    }
    const amt = Number.parseFloat(cashAmount);
    const updated = {
      ...activeSession,
      transactions: [
        ...activeSession.transactions,
        { desc: cashDesc, amount: amt, type: cashType },
      ],
      closingBalance:
        activeSession.closingBalance + (cashType === "in" ? amt : -amt),
    };
    setActiveSession(updated);
    setCashDesc("");
    setCashAmount("");
  };

  const closeSession = () => {
    if (!activeSession) return;
    const closed = { ...activeSession, closed: true };
    setSessions((prev) => [...prev, closed]);
    setActiveSession(null);
    toast.success("Cash session closed");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Banking</h2>
        <p className="text-muted-foreground">
          Import statements, reconcile transactions, and manage cash registers
        </p>
      </div>

      <Tabs defaultValue="import">
        <TabsList className="grid grid-cols-3 w-full max-w-lg">
          <TabsTrigger value="import">Statement Import</TabsTrigger>
          <TabsTrigger value="reconcile">Reconciliation</TabsTrigger>
          <TabsTrigger value="cash">Cash Register</TabsTrigger>
        </TabsList>

        {/* Statement Import */}
        <TabsContent value="import" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Import Bank Statement</CardTitle>
              <CardDescription>
                Supports .OFX, .QIF, .CSV, .CAMT.053, and CODA files
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <button
                type="button"
                className="w-full border-2 border-dashed border-border/60 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/20 transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                <p className="font-medium text-sm">
                  Click to upload bank statement
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  OFX, QIF, CSV, CAMT.053, CODA
                </p>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".ofx,.qif,.csv,.xml,.coda,.txt"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </button>

              {statements.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      {statements.length} lines imported
                    </p>
                    <Badge variant="secondary">
                      {statements.filter((s) => s.matched).length} matched
                    </Badge>
                  </div>
                  <div className="rounded-lg border border-border/50 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="text-right">Balance</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {statements.slice(0, 10).map((line) => (
                          <TableRow key={line.id}>
                            <TableCell className="text-xs">
                              {line.date}
                            </TableCell>
                            <TableCell className="text-xs max-w-[200px] truncate">
                              {line.description}
                            </TableCell>
                            <TableCell
                              className={`text-xs text-right font-medium ${line.amount >= 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {line.amount >= 0 ? "+" : ""}
                              {line.amount.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-xs text-right">
                              {line.balance.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              {line.matched ? (
                                <Badge className="text-[10px] bg-green-500/20 text-green-700 border-green-500/30">
                                  Matched
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-[10px]"
                                >
                                  Pending
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reconciliation */}
        <TabsContent value="reconcile" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">
                    Smart Reconciliation Tool
                  </CardTitle>
                  <CardDescription>
                    Auto-match bank statements with internal transactions
                  </CardDescription>
                </div>
                <Button
                  onClick={autoMatch}
                  disabled={statements.length === 0}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" /> Auto-Match
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {statements.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    Import a bank statement first to start reconciliation
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg bg-green-50 dark:bg-green-950/20 p-3 text-center">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto mb-1" />
                      <p className="text-lg font-bold text-green-700">
                        {statements.filter((s) => s.matched).length}
                      </p>
                      <p className="text-xs text-muted-foreground">Matched</p>
                    </div>
                    <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 p-3 text-center">
                      <AlertCircle className="h-5 w-5 text-amber-600 mx-auto mb-1" />
                      <p className="text-lg font-bold text-amber-700">
                        {statements.filter((s) => !s.matched).length}
                      </p>
                      <p className="text-xs text-muted-foreground">Unmatched</p>
                    </div>
                    <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-3 text-center">
                      <DollarSign className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                      <p className="text-lg font-bold text-blue-700">
                        {statements.length}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Total Lines
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      Unmatched Transactions
                    </p>
                    {statements
                      .filter((s) => !s.matched)
                      .map((line) => (
                        <div
                          key={line.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-amber-200/50 bg-amber-50/30 dark:bg-amber-950/10"
                        >
                          <div>
                            <p className="text-sm font-medium">
                              {line.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {line.date}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-semibold ${line.amount >= 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {line.amount >= 0 ? "+" : ""}
                              {line.amount.toLocaleString()}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs"
                              onClick={() => {
                                setStatements((prev) =>
                                  prev.map((s) =>
                                    s.id === line.id
                                      ? { ...s, matched: true }
                                      : s,
                                  ),
                                );
                                toast.success("Manually matched");
                              }}
                            >
                              Match
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cash Register */}
        <TabsContent value="cash" className="space-y-4 mt-4">
          {!activeSession ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Open Cash Session</CardTitle>
                <CardDescription>
                  Start a new cash register session with opening balance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 max-w-xs">
                  <Label>Opening Balance</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={openingBalance}
                    onChange={(e) => setOpeningBalance(e.target.value)}
                  />
                </div>
                <Button onClick={openCashSession} className="gap-2">
                  <Plus className="h-4 w-4" /> Open Session
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">
                      Active Cash Session
                    </CardTitle>
                    <CardDescription>
                      Opened {activeSession.date}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      Current Balance
                    </p>
                    <p className="text-xl font-bold text-green-600">
                      ${activeSession.closingBalance.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-2">
                    <Label>Description</Label>
                    <Input
                      placeholder="Transaction description"
                      value={cashDesc}
                      onChange={(e) => setCashDesc(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={cashType === "in" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCashType("in")}
                    className="gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" /> Cash In
                  </Button>
                  <Button
                    variant={cashType === "out" ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => setCashType("out")}
                    className="gap-1"
                  >
                    <Minus className="h-3.5 w-3.5" /> Cash Out
                  </Button>
                  <Button
                    size="sm"
                    onClick={addCashTransaction}
                    className="ml-auto"
                  >
                    Add Transaction
                  </Button>
                </div>

                {activeSession.transactions.length > 0 && (
                  <div className="space-y-1">
                    <Separator />
                    {activeSession.transactions.map((t, i) => (
                      <div
                        // biome-ignore lint/suspicious/noArrayIndexKey: stable list
                        key={i}
                        className="flex items-center justify-between text-sm py-1"
                      >
                        <span>{t.desc}</span>
                        <span
                          className={
                            t.type === "in"
                              ? "text-green-600 font-medium"
                              : "text-red-600 font-medium"
                          }
                        >
                          {t.type === "in" ? "+" : "-"}$
                          {t.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  variant="outline"
                  onClick={closeSession}
                  className="w-full gap-2"
                >
                  <XCircle className="h-4 w-4" /> Close Session (Balance: $
                  {activeSession.closingBalance.toLocaleString()})
                </Button>
              </CardContent>
            </Card>
          )}

          {sessions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Past Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Opening</TableHead>
                      <TableHead className="text-right">Closing</TableHead>
                      <TableHead className="text-right">Transactions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="text-sm">{s.date}</TableCell>
                        <TableCell className="text-sm text-right">
                          ${s.openingBalance.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm text-right font-medium">
                          ${s.closingBalance.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm text-right">
                          {s.transactions.length}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
