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
  BookMarked,
  BookOpen,
  Download,
  Filter,
  Landmark,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  useGetAllTransactions,
  useGetJournalEntries,
} from "../../hooks/useQueries";
import { useI18n } from "../../i18n/useI18n";
import { formatDate, formatINR } from "../../lib/formatters";
import { computeLedgerBalances, computeTrialBalance } from "../../lib/ledger";

// ─── Ledger Statement View ────────────────────────────────────────────────────

interface LedgerRow {
  date: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  isOpening?: boolean;
  isClosing?: boolean;
}

function LedgerStatementView({
  journalEntries,
}: {
  journalEntries: any[];
}) {
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  // Derive unique account names from all journal entry lines
  const accountNames = useMemo(() => {
    const names = new Set<string>();
    for (const entry of journalEntries) {
      for (const line of entry.entries ?? []) {
        if (line.accountName) names.add(line.accountName);
      }
    }
    return Array.from(names).sort();
  }, [journalEntries]);

  // Sort all journal entries ascending by date
  const sortedEntries = useMemo(
    () =>
      [...journalEntries].sort((a, b) => {
        const da = Number(a.date) || new Date(a.date).getTime() || 0;
        const db = Number(b.date) || new Date(b.date).getTime() || 0;
        return da - db;
      }),
    [journalEntries],
  );

  const ledgerRows = useMemo<LedgerRow[]>(() => {
    if (!selectedAccount) return [];

    const fromMs = dateFrom ? new Date(dateFrom).getTime() : null;
    const toMs = dateTo ? new Date(`${dateTo}T23:59:59`).getTime() : null;

    // Compute opening balance (all entries strictly before `from` date)
    let openingBalance = 0;
    if (fromMs !== null) {
      for (const entry of sortedEntries) {
        const entryMs =
          Number(entry.date) > 1e14
            ? Math.floor(Number(entry.date) / 1_000_000)
            : Number(entry.date) || new Date(entry.date).getTime();
        if (entryMs < fromMs) {
          for (const line of entry.entries ?? []) {
            if (line.accountName === selectedAccount) {
              openingBalance += (line.debit ?? 0) - (line.credit ?? 0);
            }
          }
        }
      }
    }

    const rows: LedgerRow[] = [];
    rows.push({
      date: dateFrom || "—",
      description: "Opening Balance",
      debit: 0,
      credit: 0,
      balance: openingBalance,
      isOpening: true,
    });

    let runningBalance = openingBalance;

    for (const entry of sortedEntries) {
      const entryMs =
        Number(entry.date) > 1e14
          ? Math.floor(Number(entry.date) / 1_000_000)
          : Number(entry.date) || new Date(entry.date).getTime();

      if (fromMs !== null && entryMs < fromMs) continue;
      if (toMs !== null && entryMs > toMs) continue;

      for (const line of entry.entries ?? []) {
        if (line.accountName !== selectedAccount) continue;
        const dr = line.debit ?? 0;
        const cr = line.credit ?? 0;
        runningBalance += dr - cr;
        rows.push({
          date: entry.date,
          description: entry.description,
          debit: dr,
          credit: cr,
          balance: runningBalance,
        });
      }
    }

    rows.push({
      date: dateTo || "—",
      description: "Closing Balance",
      debit: 0,
      credit: 0,
      balance: runningBalance,
      isClosing: true,
    });

    return rows;
  }, [selectedAccount, dateFrom, dateTo, sortedEntries]);

  const handleExportCSV = () => {
    if (!selectedAccount || ledgerRows.length === 0) return;
    const headers = [
      "Date",
      "Description",
      "Debit (Dr)",
      "Credit (Cr)",
      "Balance",
    ];
    const csvRows = [
      headers.join(","),
      ...ledgerRows.map((row) =>
        [
          `"${row.isOpening || row.isClosing ? row.date : formatDate(row.date)}"`,
          `"${row.description}"`,
          row.isOpening || row.isClosing ? "" : row.debit.toFixed(2),
          row.isOpening || row.isClosing ? "" : row.credit.toFixed(2),
          row.balance.toFixed(2),
        ].join(","),
      ),
    ];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ledger-${selectedAccount.replace(/\s+/g, "_")}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const dataRows = ledgerRows.filter((r) => !r.isOpening && !r.isClosing);
  const openingRow = ledgerRows.find((r) => r.isOpening);
  const closingRow = ledgerRows.find((r) => r.isClosing);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Landmark className="h-5 w-5" />
          Ledger Statement
        </CardTitle>
        <CardDescription>
          Account-level ledger with running balance and date range filter
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="ledger-account">Account</Label>
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger
                id="ledger-account"
                data-ocid="ledger.account_select"
              >
                <SelectValue placeholder="Select an account…" />
              </SelectTrigger>
              <SelectContent>
                {accountNames.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ledger-from">From</Label>
            <Input
              id="ledger-from"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              data-ocid="ledger.date_from_input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ledger-to">To</Label>
            <Input
              id="ledger-to"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              data-ocid="ledger.date_to_input"
            />
          </div>
          <Button
            variant="outline"
            onClick={handleExportCSV}
            disabled={!selectedAccount || ledgerRows.length === 0}
            data-ocid="ledger.export_button"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Table */}
        {!selectedAccount ? (
          <div className="text-center py-12">
            <BookMarked className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground font-medium">
              Select an account to view its ledger
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Choose an account from the dropdown above to see all transactions
              and running balance.
            </p>
          </div>
        ) : dataRows.length === 0 ? (
          <div className="text-center py-12" data-ocid="ledger.empty_state">
            <Landmark className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground font-medium">
              No entries found
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              No transactions for <strong>{selectedAccount}</strong>
              {dateFrom || dateTo ? " in the selected date range" : ""}.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Date</TableHead>
                  <TableHead>Voucher / Description</TableHead>
                  <TableHead className="text-right">Debit (Dr)</TableHead>
                  <TableHead className="text-right">Credit (Cr)</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Opening Balance row */}
                {openingRow && (
                  <TableRow className="bg-muted/20 font-medium text-muted-foreground italic">
                    <TableCell>
                      {openingRow.date !== "—" ? openingRow.date : "—"}
                    </TableCell>
                    <TableCell>Opening Balance</TableCell>
                    <TableCell className="text-right">—</TableCell>
                    <TableCell className="text-right">—</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatINR(openingRow.balance)}
                    </TableCell>
                  </TableRow>
                )}
                {/* Transaction rows */}
                {dataRows.map((row, idx) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: stable ledger list
                  <TableRow key={idx} className="hover:bg-muted/10">
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(row.date)}
                    </TableCell>
                    <TableCell className="text-sm">{row.description}</TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {row.debit > 0 ? formatINR(row.debit) : "—"}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {row.credit > 0 ? formatINR(row.credit) : "—"}
                    </TableCell>
                    <TableCell
                      className={`text-right font-mono text-sm font-medium ${row.balance < 0 ? "text-destructive" : "text-foreground"}`}
                    >
                      {formatINR(Math.abs(row.balance))}{" "}
                      <span className="text-xs text-muted-foreground">
                        {row.balance >= 0 ? "Dr" : "Cr"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {/* Closing Balance row */}
                {closingRow && (
                  <TableRow className="bg-muted/20 font-bold border-t-2">
                    <TableCell>
                      {closingRow.date !== "—" ? closingRow.date : "—"}
                    </TableCell>
                    <TableCell>Closing Balance</TableCell>
                    <TableCell className="text-right">—</TableCell>
                    <TableCell className="text-right">—</TableCell>
                    <TableCell className="text-right">
                      {formatINR(Math.abs(closingRow.balance))}{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        {closingRow.balance >= 0 ? "Dr" : "Cr"}
                      </span>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Timeline Event type ───────────────────────────────────────────────────────

type TimelineEventType = "journal" | "transaction" | "activity";

interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  date: bigint | number | string;
  description: string;
  amount?: number;
  category?: string;
  details?: any;
}

export default function JournalLedgerTab() {
  const { t } = useI18n();
  const { data: journalEntries = [], isLoading: isLoadingJournal } =
    useGetJournalEntries();
  const { data: transactions = [], isLoading: isLoadingTransactions } =
    useGetAllTransactions();
  const [filterType, setFilterType] = useState<TimelineEventType | "all">(
    "all",
  );

  const ledgerBalances = computeLedgerBalances(journalEntries);
  const trialBalance = computeTrialBalance(ledgerBalances);

  // Build unified timeline
  const timeline = useMemo(() => {
    const events: TimelineEvent[] = [];

    // Add journal entries
    for (const entry of journalEntries) {
      events.push({
        id: `journal-${entry.id}`,
        type: "journal",
        date: entry.date,
        description: entry.description,
        details: entry,
      });
    }

    // Add transactions
    for (const tx of transactions) {
      events.push({
        id: `transaction-${tx.id}`,
        type: "transaction",
        date: tx.date,
        description: tx.description,
        amount: tx.amount,
        category: tx.category,
        details: tx,
      });
    }

    // Sort by date (newest first) - safe for number, string, bigint
    return events.sort((a, b) => {
      const da = Number(a.date) || 0;
      const db = Number(b.date) || 0;
      return db - da;
    });
  }, [journalEntries, transactions]);

  const filteredTimeline = useMemo(() => {
    if (filterType === "all") return timeline;
    return timeline.filter((event) => event.type === filterType);
  }, [timeline, filterType]);

  const sortedJournalEntries = [...journalEntries].sort((a, b) => {
    const da = Number(a.date) || 0;
    const db = Number(b.date) || 0;
    return db - da;
  });

  const isLoading = isLoadingJournal || isLoadingTransactions;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {t("Journal & Ledger")}
        </h2>
        <p className="text-muted-foreground">
          {t("Double-entry bookkeeping with unified activity timeline")}
        </p>
      </div>

      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timeline">
            <Activity className="h-4 w-4 mr-2" />
            Unified Timeline
          </TabsTrigger>
          <TabsTrigger value="journal">
            <BookOpen className="h-4 w-4 mr-2" />
            {t("Journal Entries")}
          </TabsTrigger>
          <TabsTrigger value="trial">
            <TrendingUp className="h-4 w-4 mr-2" />
            {t("Trial Balance")}
          </TabsTrigger>
          <TabsTrigger value="ledger" data-ocid="ledger.tab">
            <Landmark className="h-4 w-4 mr-2" />
            Ledger
          </TabsTrigger>
        </TabsList>

        {/* Unified Timeline */}
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Activity & Transaction Ledger
                  </CardTitle>
                  <CardDescription>
                    All user activities and financial transactions in
                    chronological order
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <div className="flex gap-1">
                    <Button
                      variant={filterType === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterType("all")}
                    >
                      All
                    </Button>
                    <Button
                      variant={
                        filterType === "transaction" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setFilterType("transaction")}
                    >
                      Transactions
                    </Button>
                    <Button
                      variant={filterType === "journal" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterType("journal")}
                    >
                      Journal
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading timeline...
                </div>
              ) : filteredTimeline.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No activity yet</p>
                  <p className="text-sm text-muted-foreground">
                    Create transactions to see activity
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTimeline.map((event) => (
                    <Card
                      key={event.id}
                      className="border-l-4 border-l-primary"
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge
                                variant={
                                  event.type === "transaction"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {event.type === "transaction"
                                  ? "Transaction"
                                  : "Journal Entry"}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(event.date)}
                              </span>
                            </div>
                            <p className="font-medium">{event.description}</p>
                            {event.category && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Category: {event.category}
                              </p>
                            )}
                          </div>
                          {event.amount !== undefined && (
                            <div className="text-right">
                              <p className="font-bold text-lg">
                                {formatINR(event.amount)}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Journal Entries */}
        <TabsContent value="journal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {t("Journal Entries")}
              </CardTitle>
              <CardDescription>
                {t("All journal entries with debit and credit details")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingJournal ? (
                <div className="text-center py-8 text-muted-foreground">
                  {t("Loading journal entries...")}
                </div>
              ) : journalEntries.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    {t("No journal entries yet")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("Create transactions to generate journal entries")}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedJournalEntries.map((entry) => (
                    <Card
                      key={entry.id.toString()}
                      className="border-l-4 border-l-primary"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">
                              {entry.description}
                            </CardTitle>
                            <CardDescription>
                              {formatDate(entry.date)}
                            </CardDescription>
                          </div>
                          {entry.associatedTransactionId && (
                            <Badge variant="outline">
                              {t("Linked to Transaction")}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{t("Account")}</TableHead>
                              <TableHead className="text-right">
                                {t("Debit")}
                              </TableHead>
                              <TableHead className="text-right">
                                {t("Credit")}
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {entry.entries.map((line) => (
                              <TableRow key={line.accountName}>
                                <TableCell className="font-medium">
                                  {line.accountName}
                                </TableCell>
                                <TableCell className="text-right">
                                  {line.debit > 0 ? formatINR(line.debit) : "-"}
                                </TableCell>
                                <TableCell className="text-right">
                                  {line.credit > 0
                                    ? formatINR(line.credit)
                                    : "-"}
                                </TableCell>
                              </TableRow>
                            ))}
                            <TableRow className="font-bold border-t-2">
                              <TableCell>{t("Total")}</TableCell>
                              <TableCell className="text-right">
                                {formatINR(
                                  entry.entries.reduce(
                                    (sum, e) => sum + e.debit,
                                    0,
                                  ),
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatINR(
                                  entry.entries.reduce(
                                    (sum, e) => sum + e.credit,
                                    0,
                                  ),
                                )}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trial Balance */}
        <TabsContent value="trial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {t("Trial Balance")}
              </CardTitle>
              <CardDescription>
                {t("Summary of all ledger account balances")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("Account")}</TableHead>
                    <TableHead className="text-right">
                      {t("Debit Balance")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("Credit Balance")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(ledgerBalances).map(
                    ([accountName, balance]) => (
                      <TableRow key={accountName}>
                        <TableCell className="font-medium">
                          {accountName}
                        </TableCell>
                        <TableCell className="text-right">
                          {balance >= 0 ? formatINR(balance) : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {balance < 0 ? formatINR(Math.abs(balance)) : "-"}
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                  <TableRow className="font-bold border-t-2">
                    <TableCell>{t("Total")}</TableCell>
                    <TableCell className="text-right">
                      {formatINR(trialBalance.totalDebit)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatINR(trialBalance.totalCredit)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <div className="mt-4 p-4 rounded-lg bg-muted">
                <p className="text-sm font-medium">
                  {trialBalance.isBalanced ? (
                    <span className="text-green-600 dark:text-green-400">
                      ✓ {t("Trial balance is balanced")}
                    </span>
                  ) : (
                    <span className="text-red-600 dark:text-red-400">
                      ✗ {t("Trial balance is not balanced")} ({t("Difference")}:{" "}
                      {formatINR(
                        Math.abs(
                          trialBalance.totalDebit - trialBalance.totalCredit,
                        ),
                      )}
                      )
                    </span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ledger Statement */}
        <TabsContent value="ledger" className="space-y-4">
          <LedgerStatementView journalEntries={journalEntries} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
