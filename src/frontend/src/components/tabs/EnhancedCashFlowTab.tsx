import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Calendar,
  DollarSign,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { useGetAllTransactions } from "../../hooks/useQueries";
import { formatCurrency, formatDate } from "../../lib/formatters";
import { TransactionType } from "../../types";

export default function EnhancedCashFlowTab() {
  const { data: transactions = [] } = useGetAllTransactions();
  const [period, setPeriod] = useState<
    "daily" | "monthly" | "quarterly" | "annual"
  >("monthly");
  const [viewMode, setViewMode] = useState<"simple" | "comparison">("simple");

  const calculateCashFlow = () => {
    const inflows = transactions
      .filter(
        (t) =>
          t.transactionType === TransactionType.Sale ||
          t.transactionType === TransactionType.Income,
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const outflows = transactions
      .filter(
        (t) =>
          t.transactionType === TransactionType.Purchase ||
          t.transactionType === TransactionType.Expense,
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const netCashFlow = inflows - outflows;

    return { inflows, outflows, netCashFlow };
  };

  const { inflows, outflows, netCashFlow } = calculateCashFlow();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Cash Flow Analysis
          </h2>
          <p className="text-muted-foreground">
            Accounting Standard-compliant cash flow charts with period analysis
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={(v) => setPeriod(v as any)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="annual">Annual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs
        value={viewMode}
        onValueChange={(v) => setViewMode(v as "simple" | "comparison")}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="simple">Simple View</TabsTrigger>
          <TabsTrigger value="comparison">Comparison View</TabsTrigger>
        </TabsList>

        <TabsContent value="simple" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Cash Inflows
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(inflows)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  From sales and income
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Cash Outflows
                </CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(outflows)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  From purchases and expenses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Net Cash Flow
                </CardTitle>
                <DollarSign className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${netCashFlow >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {formatCurrency(netCashFlow)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {netCashFlow >= 0
                    ? "Positive cash flow"
                    : "Negative cash flow"}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Cash Flow Analysis -{" "}
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </CardTitle>
              <CardDescription>
                Detailed breakdown of cash movements
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No transactions recorded yet</p>
                  <p className="text-sm mt-2">
                    Add transactions to see cash flow analysis
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Recent Transactions</h3>
                    <div className="space-y-2">
                      {transactions.slice(0, 10).map((transaction) => (
                        <div
                          key={transaction.id.toString()}
                          className="flex justify-between items-center"
                        >
                          <div>
                            <p className="font-medium">
                              {transaction.description}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(transaction.date)}
                            </p>
                          </div>
                          <div
                            className={`font-semibold ${
                              transaction.transactionType ===
                                TransactionType.Sale ||
                              transaction.transactionType ===
                                TransactionType.Income
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {transaction.transactionType ===
                              TransactionType.Sale ||
                            transaction.transactionType ===
                              TransactionType.Income
                              ? "+"
                              : "-"}
                            {formatCurrency(transaction.amount)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Period-over-Period Comparison
              </CardTitle>
              <CardDescription>
                Compare cash flow across different periods
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Comparison charts coming soon</p>
                <p className="text-sm mt-2">
                  This feature will show period-over-period cash flow trends
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
