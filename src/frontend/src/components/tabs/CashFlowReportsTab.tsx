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
import { Calendar, DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useGetAllTransactions } from "../../hooks/useQueries";
import { useI18n } from "../../i18n/useI18n";
import { formatCurrency, formatDate } from "../../lib/formatters";
import { TransactionType } from "../../types";

export default function CashFlowReportsTab() {
  const { data: transactions = [] } = useGetAllTransactions();
  const [period, setPeriod] = useState<
    "daily" | "monthly" | "quarterly" | "annual"
  >("monthly");
  const { t, language } = useI18n();

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
            {t("cashFlow.title")}
          </h2>
          <p className="text-muted-foreground">{t("cashFlow.description")}</p>
        </div>
        <Select value={period} onValueChange={(v) => setPeriod(v as any)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">{t("cashFlow.daily")}</SelectItem>
            <SelectItem value="monthly">{t("cashFlow.monthly")}</SelectItem>
            <SelectItem value="quarterly">{t("cashFlow.quarterly")}</SelectItem>
            <SelectItem value="annual">{t("cashFlow.annual")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("cashFlow.inflows")}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(inflows)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("cashFlow.inflowsDescription")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("cashFlow.outflows")}
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(outflows)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("cashFlow.outflowsDescription")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("cashFlow.netCashFlow")}
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
                ? t("cashFlow.positiveCashFlow")
                : t("cashFlow.negativeCashFlow")}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {t("cashFlow.analysisTitle")} -{" "}
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </CardTitle>
          <CardDescription>{t("cashFlow.analysisDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t("cashFlow.noTransactions")}</p>
              <p className="text-sm mt-2">{t("cashFlow.noTransactionsHint")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">
                  {t("cashFlow.recentTransactions")}
                </h3>
                <div className="space-y-2">
                  {transactions.slice(0, 10).map((transaction) => (
                    <div
                      key={transaction.id.toString()}
                      className="flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(transaction.date, language)}
                        </p>
                      </div>
                      <div
                        className={`font-semibold ${
                          transaction.transactionType ===
                            TransactionType.Sale ||
                          transaction.transactionType === TransactionType.Income
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.transactionType === TransactionType.Sale ||
                        transaction.transactionType === TransactionType.Income
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
    </div>
  );
}
