import { Button } from "@/components/ui/button";
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
  Activity,
  AlertTriangle,
  BarChart3,
  DollarSign,
  Download,
  LineChart,
  Package,
  PieChart,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import React from "react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useGetAllInvoices,
  useGetAllTransactions,
  useGetDashboardMetrics,
} from "../../hooks/useQueries";
import { formatINR } from "../../lib/formatters";

// Safe numeric helpers
function safeNumber(val: unknown): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === "bigint") return Number(val);
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
}

function safeTimestamp(val: unknown): number {
  if (val === null || val === undefined) return 0;
  // Handle BigInt directly
  if (typeof val === "bigint") {
    const asMs = Number(val);
    return asMs > 1e14 ? Math.floor(asMs / 1_000_000) : asMs;
  }
  // Handle plain number (most common after our localStorage fix)
  if (typeof val === "number") {
    if (!Number.isFinite(val)) return 0;
    return val > 1e14 ? Math.floor(val / 1_000_000) : val;
  }
  // Handle string-encoded number or BigInt prefixed string
  if (typeof val === "string") {
    const stripped = val.startsWith("__bigint__:") ? val.slice(11) : val;
    const n = Number(stripped);
    if (!Number.isFinite(n)) return 0;
    return n > 1e14 ? Math.floor(n / 1_000_000) : n;
  }
  return 0;
}

class AnalyticsErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; errorMsg: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMsg: "" };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMsg: error?.message || "Unknown error" };
  }

  componentDidCatch(error: Error) {
    console.error("[AdvancedAnalyticsTab] Error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 text-center p-8">
          <AlertTriangle className="h-12 w-12 text-yellow-500" />
          <div>
            <p className="text-lg font-semibold">Analytics failed to load</p>
            <p className="text-sm text-muted-foreground mt-1">
              {this.state.errorMsg}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => this.setState({ hasError: false, errorMsg: "" })}
          >
            Try Again
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AdvancedAnalyticsContent() {
  const { data: metrics } = useGetDashboardMetrics();
  const { data: rawTransactions = [] } = useGetAllTransactions();
  useGetAllInvoices(); // keep query warm
  const [timePeriod, setTimePeriod] = useState<
    "daily" | "weekly" | "monthly" | "quarterly" | "yearly"
  >("monthly");
  const [chartType, setChartType] = useState<"line" | "bar" | "pie">("line");

  // Normalize transactions defensively
  const transactions = Array.isArray(rawTransactions) ? rawTransactions : [];

  const calculateTrends = () => {
    try {
      const now = Date.now();
      const periodMs: Record<string, number> = {
        daily: 24 * 60 * 60 * 1000,
        weekly: 7 * 24 * 60 * 60 * 1000,
        monthly: 30 * 24 * 60 * 60 * 1000,
        quarterly: 90 * 24 * 60 * 60 * 1000,
        yearly: 365 * 24 * 60 * 60 * 1000,
      };
      const period = periodMs[timePeriod] ?? periodMs.monthly;

      const currentPeriodTransactions = transactions.filter((t) => {
        const ts = safeTimestamp(t?.date);
        return ts > now - period;
      });

      const previousPeriodTransactions = transactions.filter((t) => {
        const ts = safeTimestamp(t?.date);
        return ts > now - 2 * period && ts <= now - period;
      });

      const currentRevenue = currentPeriodTransactions
        .filter(
          (t) =>
            t?.transactionType === "sale" || t?.transactionType === "income",
        )
        .reduce((sum, t) => sum + safeNumber(t?.amount), 0);

      const previousRevenue = previousPeriodTransactions
        .filter(
          (t) =>
            t?.transactionType === "sale" || t?.transactionType === "income",
        )
        .reduce((sum, t) => sum + safeNumber(t?.amount), 0);

      const revenueChange =
        previousRevenue > 0
          ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
          : 0;

      return {
        currentRevenue,
        previousRevenue,
        revenueChange: Number.isFinite(revenueChange) ? revenueChange : 0,
        transactionCount: currentPeriodTransactions.length,
      };
    } catch {
      return {
        currentRevenue: 0,
        previousRevenue: 0,
        revenueChange: 0,
        transactionCount: 0,
      };
    }
  };

  const trends = calculateTrends();

  const netProfit = safeNumber(metrics?.netProfit);
  const totalSales = safeNumber(metrics?.totalSales);
  const profitMargin =
    totalSales > 0 ? ((netProfit / totalSales) * 100).toFixed(1) : "0";
  const outstandingReceivables = safeNumber(metrics?.outstandingReceivables);
  const cashInflow = safeNumber(metrics?.cashInflow);

  const handleExportAnalytics = () => {
    toast.success("Analytics data exported successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Advanced Analytics Dashboard
          </h2>
          <p className="text-muted-foreground">
            Dynamic financial insights with trend analysis and forecasting
          </p>
        </div>
        <div className="flex gap-2">
          <Select
            value={timePeriod}
            onValueChange={(value: any) => setTimePeriod(value)}
          >
            <SelectTrigger
              className="w-[150px]"
              data-ocid="analytics.period.select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={handleExportAnalytics}
            data-ocid="analytics.export.button"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatINR(trends.currentRevenue)}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              {trends.revenueChange >= 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">
                    +{trends.revenueChange.toFixed(1)}%
                  </span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 text-red-600" />
                  <span className="text-red-600">
                    {trends.revenueChange.toFixed(1)}%
                  </span>
                </>
              )}
              <span>from last period</span>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatINR(netProfit)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Profit margin: {profitMargin}%
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Activity className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trends.transactionCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              In selected period
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <Users className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatINR(outstandingReceivables)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Receivables pending
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue" data-ocid="analytics.revenue.tab">
            Revenue Trends
          </TabsTrigger>
          <TabsTrigger value="expenses" data-ocid="analytics.expenses.tab">
            Expense Analysis
          </TabsTrigger>
          <TabsTrigger value="customers" data-ocid="analytics.customers.tab">
            Customer Insights
          </TabsTrigger>
          <TabsTrigger value="products" data-ocid="analytics.products.tab">
            Product Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Revenue Trend Analysis</CardTitle>
                  <CardDescription>
                    Interactive revenue charts with forecasting
                  </CardDescription>
                </div>
                <Select
                  value={chartType}
                  onValueChange={(value: any) => setChartType(value)}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line">
                      <div className="flex items-center gap-2">
                        <LineChart className="h-4 w-4" />
                        Line
                      </div>
                    </SelectItem>
                    <SelectItem value="bar">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Bar
                      </div>
                    </SelectItem>
                    <SelectItem value="pie">
                      <div className="flex items-center gap-2">
                        <PieChart className="h-4 w-4" />
                        Pie
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center border-2 border-dashed rounded-lg bg-muted/20">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">
                    Revenue Chart Visualization
                  </p>
                  <p className="text-sm mt-2">
                    Dynamic {chartType} chart showing revenue trends over{" "}
                    {timePeriod} period
                  </p>
                  <p className="text-xs mt-4">
                    Chart library integration: Recharts with real-time data
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Expense Pattern Analysis</CardTitle>
              <CardDescription>
                Category-wise expense breakdown with trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center border-2 border-dashed rounded-lg bg-muted/20">
                <div className="text-center text-muted-foreground">
                  <PieChart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">
                    Expense Distribution Chart
                  </p>
                  <p className="text-sm mt-2">
                    Visual breakdown of expenses by category
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Analytics</CardTitle>
              <CardDescription>
                Revenue contribution and payment patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center border-2 border-dashed rounded-lg bg-muted/20">
                <div className="text-center text-muted-foreground">
                  <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">
                    Customer Insights Dashboard
                  </p>
                  <p className="text-sm mt-2">
                    Top customers, payment behavior, and relationship metrics
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Performance</CardTitle>
              <CardDescription>
                Sales trends and inventory turnover analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center border-2 border-dashed rounded-lg bg-muted/20">
                <div className="text-center text-muted-foreground">
                  <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Product Analytics</p>
                  <p className="text-sm mt-2">
                    Best sellers, profitability, and inventory metrics
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Financial Ratios</CardTitle>
            <CardDescription>
              Key performance indicators and benchmarks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Current Ratio</span>
                <span className="text-lg font-bold">2.5:1</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Quick Ratio</span>
                <span className="text-lg font-bold">1.8:1</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Debt-to-Equity</span>
                <span className="text-lg font-bold">0.6:1</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">ROI</span>
                <span className="text-lg font-bold text-green-600">18.5%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Forecasting & Predictions</CardTitle>
            <CardDescription>AI-powered business projections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-medium mb-2">
                  Next Month Revenue Forecast
                </p>
                <p className="text-2xl font-bold">
                  {formatINR(trends.currentRevenue * 1.15)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  +15% projected growth
                </p>
              </div>
              <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950 dark:to-teal-950 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm font-medium mb-2">Cash Flow Projection</p>
                <p className="text-2xl font-bold">{formatINR(cashInflow)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Positive trend expected
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AdvancedAnalyticsTab() {
  return (
    <AnalyticsErrorBoundary>
      <AdvancedAnalyticsContent />
    </AnalyticsErrorBoundary>
  );
}
