import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  AlertCircle,
  Building2,
  CheckCircle2,
  Plus,
  Upload,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatDate, formatINR } from "../../lib/formatters";
import { VoiceInput } from "../VoiceInput";

// Mock data
const mockBankStatements = [
  {
    id: 1,
    date: BigInt(Date.now() * 1000000),
    description: "Customer payment received",
    amount: 50000,
    balance: 200000,
  },
  {
    id: 2,
    date: BigInt(Date.now() * 1000000 - 86400000000000),
    description: "Rent payment",
    amount: -15000,
    balance: 150000,
  },
  {
    id: 3,
    date: BigInt(Date.now() * 1000000 - 172800000000000),
    description: "Supplier payment",
    amount: -25000,
    balance: 165000,
  },
];

const mockInternalTransactions = [
  {
    id: 1,
    date: BigInt(Date.now() * 1000000),
    description: "Cash sales",
    amount: 50000,
    matched: true,
  },
  {
    id: 2,
    date: BigInt(Date.now() * 1000000 - 86400000000000),
    description: "Office rent",
    amount: 15000,
    matched: true,
  },
  {
    id: 3,
    date: BigInt(Date.now() * 1000000 - 259200000000000),
    description: "Utility bill",
    amount: 5000,
    matched: false,
  },
];

export default function BankReconciliationTab() {
  const [isAddStatementOpen, setIsAddStatementOpen] = useState(false);
  const [newStatement, setNewStatement] = useState({
    date: "",
    description: "",
    amount: "",
    balance: "",
  });

  const handleAddStatement = () => {
    if (
      !newStatement.date ||
      !newStatement.description ||
      !newStatement.amount ||
      !newStatement.balance
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    toast.success("Bank statement entry added successfully");
    setIsAddStatementOpen(false);
    setNewStatement({ date: "", description: "", amount: "", balance: "" });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      toast.info("Processing bank statement file...");
      // In production, this would parse CSV/PDF/Excel files
      setTimeout(() => {
        toast.success("Bank statement imported successfully");
      }, 1500);
    }
  };

  const matchedCount = mockInternalTransactions.filter((t) => t.matched).length;
  const unmatchedCount = mockInternalTransactions.filter(
    (t) => !t.matched,
  ).length;
  const reconciliationRate =
    (matchedCount / mockInternalTransactions.length) * 100;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Bank Reconciliation
        </h2>
        <p className="text-muted-foreground">
          Match internal transactions with bank statements
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bank Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatINR(200000)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              As per bank statement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Book Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatINR(195000)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              As per internal records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Matched Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {matchedCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Successfully reconciled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Unmatched Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {unmatchedCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="bank-statements" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bank-statements">Bank Statements</TabsTrigger>
          <TabsTrigger value="internal-transactions">
            Internal Transactions
          </TabsTrigger>
          <TabsTrigger value="reconciliation">
            Reconciliation Report
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bank-statements" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Bank Statement Entries</CardTitle>
                  <CardDescription>
                    Import or manually enter bank statement data
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      document.getElementById("file-upload")?.click()
                    }
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import File
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".csv,.pdf,.xlsx,.xls"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <Dialog
                    open={isAddStatementOpen}
                    onOpenChange={setIsAddStatementOpen}
                  >
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Entry
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Bank Statement Entry</DialogTitle>
                        <DialogDescription>
                          Manually enter a bank statement transaction with voice
                          input support
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="date">Date</Label>
                          <Input
                            id="date"
                            type="date"
                            value={newStatement.date}
                            onChange={(e) =>
                              setNewStatement({
                                ...newStatement,
                                date: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <div className="flex gap-2">
                            <Textarea
                              id="description"
                              placeholder="e.g., Customer payment"
                              value={newStatement.description}
                              onChange={(e) =>
                                setNewStatement({
                                  ...newStatement,
                                  description: e.target.value,
                                })
                              }
                              className="flex-1"
                            />
                            <VoiceInput
                              onTranscript={(text) =>
                                setNewStatement({
                                  ...newStatement,
                                  description: text,
                                })
                              }
                              size="icon"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="amount">Amount (₹)</Label>
                          <div className="flex gap-2">
                            <Input
                              id="amount"
                              type="number"
                              placeholder="0.00"
                              value={newStatement.amount}
                              onChange={(e) =>
                                setNewStatement({
                                  ...newStatement,
                                  amount: e.target.value,
                                })
                              }
                              className="flex-1"
                            />
                            <VoiceInput
                              onTranscript={(text) =>
                                setNewStatement({
                                  ...newStatement,
                                  amount: text.replace(/[^0-9.-]/g, ""),
                                })
                              }
                              size="icon"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Use negative for withdrawals
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="balance">
                            Balance After Transaction (₹)
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              id="balance"
                              type="number"
                              placeholder="0.00"
                              value={newStatement.balance}
                              onChange={(e) =>
                                setNewStatement({
                                  ...newStatement,
                                  balance: e.target.value,
                                })
                              }
                              className="flex-1"
                            />
                            <VoiceInput
                              onTranscript={(text) =>
                                setNewStatement({
                                  ...newStatement,
                                  balance: text.replace(/[^0-9.]/g, ""),
                                })
                              }
                              size="icon"
                            />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsAddStatementOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleAddStatement}>Add Entry</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {mockBankStatements.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockBankStatements.map((statement) => (
                      <TableRow key={statement.id}>
                        <TableCell>{formatDate(statement.date)}</TableCell>
                        <TableCell>{statement.description}</TableCell>
                        <TableCell
                          className={`text-right font-medium ${statement.amount > 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {formatINR(Math.abs(statement.amount))}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatINR(statement.balance)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No bank statements imported yet. Upload a file or add entries
                  manually.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="internal-transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Internal Transaction Records</CardTitle>
              <CardDescription>
                Transactions from your accounting system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockInternalTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatDate(transaction.date)}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatINR(transaction.amount)}
                      </TableCell>
                      <TableCell>
                        {transaction.matched ? (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Matched
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            Unmatched
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {!transaction.matched && (
                          <Button variant="outline" size="sm">
                            Match
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reconciliation" className="space-y-6">
          <Alert>
            <Building2 className="h-4 w-4" />
            <AlertTitle>
              Reconciliation Progress: {reconciliationRate.toFixed(0)}%
            </AlertTitle>
            <AlertDescription>
              {matchedCount} of {mockInternalTransactions.length} transactions
              have been successfully matched with bank statements.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Reconciliation Summary</CardTitle>
              <CardDescription>
                Comparison of bank and book balances (INR)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">
                      Bank Balance (as per statement)
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatINR(200000)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6 text-muted-foreground">
                      Less: Outstanding checks
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      ({formatINR(0)})
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6 text-muted-foreground">
                      Add: Deposits in transit
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      {formatINR(0)}
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-t-2">
                    <TableCell className="font-bold">
                      Adjusted Bank Balance
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatINR(200000)}
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-t">
                    <TableCell className="font-medium pt-4">
                      Book Balance (as per records)
                    </TableCell>
                    <TableCell className="text-right font-bold pt-4">
                      {formatINR(195000)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6 text-muted-foreground">
                      Add: Bank credits not recorded
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      {formatINR(5000)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6 text-muted-foreground">
                      Less: Bank charges not recorded
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      ({formatINR(0)})
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-t-2">
                    <TableCell className="font-bold">
                      Adjusted Book Balance
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatINR(200000)}
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-t-2 bg-muted/50">
                    <TableCell className="font-bold">Difference</TableCell>
                    <TableCell className="text-right font-bold">
                      {formatINR(0)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <Alert className="mt-4">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Reconciliation Complete</AlertTitle>
                <AlertDescription>
                  Adjusted bank balance matches adjusted book balance. Your
                  accounts are reconciled!
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Outstanding Items</CardTitle>
              <CardDescription>
                Unmatched transactions requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {unmatchedCount > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockInternalTransactions
                      .filter((t) => !t.matched)
                      .map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{formatDate(transaction.date)}</TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatINR(transaction.amount)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">Internal Record</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  All transactions have been matched. No outstanding items.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
