import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  DollarSign,
  FileText,
  Package,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useCurrency } from "../../contexts/CurrencyContext";
import {
  useGetDashboardMetrics,
  useGetLowStockProducts,
  useGetOverdueInvoices,
} from "../../hooks/useQueries";

export default function OverviewTab() {
  const { data: metrics, isLoading: metricsLoading } = useGetDashboardMetrics();
  const { data: lowStockProducts = [] } = useGetLowStockProducts();
  const { data: overdueInvoices = [] } = useGetOverdueInvoices();
  const { formatAmount } = useCurrency();

  if (metricsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {(["a", "b", "c", "d"] as const).map((k) => (
            <Card key={k}>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Dashboard Overview
        </h2>
        <p className="text-muted-foreground">
          Your business metrics at a glance
        </p>
      </div>

      {/* Alerts */}
      {(lowStockProducts.length > 0 || overdueInvoices.length > 0) && (
        <div className="space-y-3">
          {lowStockProducts.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Low Stock Alert</AlertTitle>
              <AlertDescription>
                {lowStockProducts.length} product
                {lowStockProducts.length > 1 ? "s are" : " is"} running low on
                stock. Check the Inventory tab.
              </AlertDescription>
            </Alert>
          )}
          {overdueInvoices.length > 0 && (
            <Alert variant="destructive">
              <FileText className="h-4 w-4" />
              <AlertTitle>Overdue Invoices</AlertTitle>
              <AlertDescription>
                {overdueInvoices.length} invoice
                {overdueInvoices.length > 1 ? "s are" : " is"} overdue. Review
                in the Invoices tab.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div data-ocid="overview.total_sales_card">
          <MetricCard
            title="Total Sales"
            value={formatAmount(metrics?.totalSales || 0)}
            icon={<DollarSign className="h-4 w-4" />}
            trend="positive"
          />
        </div>
        <div data-ocid="overview.total_expenses_card">
          <MetricCard
            title="Total Expenses"
            value={formatAmount(metrics?.totalExpenses || 0)}
            icon={<TrendingDown className="h-4 w-4" />}
            trend="negative"
          />
        </div>
        <div data-ocid="overview.net_profit_card">
          <MetricCard
            title="Net Profit"
            value={formatAmount(metrics?.netProfit || 0)}
            icon={<TrendingUp className="h-4 w-4" />}
            trend={metrics && metrics.netProfit >= 0 ? "positive" : "negative"}
          />
        </div>
        <div data-ocid="overview.stock_value_card">
          <MetricCard
            title="Stock Value"
            value={formatAmount(metrics?.currentStockValue || 0)}
            icon={<Package className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* Additional Info */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Outstanding Receivables</CardTitle>
            <CardDescription>Unpaid and overdue invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatAmount(metrics?.outstandingReceivables || 0)}
            </div>
            {overdueInvoices.length > 0 && (
              <p className="mt-2 text-sm text-muted-foreground">
                {overdueInvoices.length} overdue invoice
                {overdueInvoices.length > 1 ? "s" : ""}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Status</CardTitle>
            <CardDescription>Stock alerts and warnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockProducts.length > 0 ? (
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">{lowStockProducts.length}</Badge>
                  <span className="text-sm">Low stock items</span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  All products are well stocked
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visual Banner */}
      <Card className="overflow-hidden">
        <div className="relative h-48 bg-gradient-to-r from-primary/10 via-primary/5 to-background">
          <img
            src="/assets/generated/analytics-dashboard.dim_800x600.png"
            alt="Analytics"
            className="h-full w-full object-cover opacity-50 mix-blend-overlay"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-2xl font-bold">Business Intelligence</h3>
              <p className="text-muted-foreground">
                Track, analyze, and grow your business
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon,
  trend,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: "positive" | "negative";
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div
          className={`rounded-full p-2 ${
            trend === "positive"
              ? "bg-green-500/10 text-green-600 dark:text-green-400"
              : trend === "negative"
                ? "bg-red-500/10 text-red-600 dark:text-red-400"
                : "bg-muted text-muted-foreground"
          }`}
        >
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
