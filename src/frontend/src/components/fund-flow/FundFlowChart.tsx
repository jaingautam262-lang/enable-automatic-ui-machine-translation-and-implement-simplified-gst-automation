import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRightLeft, TrendingDown, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useI18n } from "../../i18n/useI18n";
import { formatINR } from "../../lib/formatters";

interface FundFlowData {
  id: string;
  date: Date;
  sourcesOfFunds: {
    capitalIntroduced: number;
    loansReceived: number;
    retainedEarnings: number;
    assetSales: number;
    otherSources: number;
  };
  applicationOfFunds: {
    assetPurchases: number;
    loanRepayments: number;
    dividendsPaid: number;
    operatingExpenses: number;
    otherApplications: number;
  };
  workingCapitalChanges: {
    currentAssetsIncrease: number;
    currentLiabilitiesIncrease: number;
    netWorkingCapitalChange: number;
  };
}

interface FundFlowChartProps {
  records: FundFlowData[];
}

export default function FundFlowChart({ records }: FundFlowChartProps) {
  const { t, language } = useI18n();

  if (records.length === 0) {
    return null;
  }

  const latestRecord = records[0];
  const totalSources = Object.values(latestRecord.sourcesOfFunds).reduce(
    (sum, val) => sum + val,
    0,
  );
  const totalApplications = Object.values(
    latestRecord.applicationOfFunds,
  ).reduce((sum, val) => sum + val, 0);
  const netFundFlow = totalSources - totalApplications;

  // Data for Sources vs Applications comparison
  const comparisonData = [
    {
      name: t("fundFlow.sources"),
      value: totalSources,
      fill: "hsl(var(--chart-1))",
    },
    {
      name: t("fundFlow.applications"),
      value: totalApplications,
      fill: "hsl(var(--chart-2))",
    },
    {
      name: t("fundFlow.netFlow"),
      value: Math.abs(netFundFlow),
      fill: netFundFlow >= 0 ? "hsl(var(--chart-3))" : "hsl(var(--chart-5))",
    },
  ];

  // Historical trend data (if multiple records exist)
  const trendData = records
    .slice(0, 10)
    .reverse()
    .map((record) => {
      const sources = Object.values(record.sourcesOfFunds).reduce(
        (sum, val) => sum + val,
        0,
      );
      const applications = Object.values(record.applicationOfFunds).reduce(
        (sum, val) => sum + val,
        0,
      );
      const net = sources - applications;

      return {
        date: record.date.toLocaleDateString(language, {
          month: "short",
          day: "numeric",
        }),
        sources,
        applications,
        netFlow: net,
      };
    });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-2 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  {t("fundFlow.totalSources")}
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {formatINR(totalSources)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  {t("fundFlow.totalApplications")}
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {formatINR(totalApplications)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  netFundFlow >= 0
                    ? "bg-blue-100 dark:bg-blue-900"
                    : "bg-orange-100 dark:bg-orange-900"
                }`}
              >
                <ArrowRightLeft
                  className={`h-5 w-5 ${
                    netFundFlow >= 0
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-orange-600 dark:text-orange-400"
                  }`}
                />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  {t("fundFlow.netFundFlow")}
                </div>
                <div
                  className={`text-2xl font-bold ${
                    netFundFlow >= 0 ? "text-blue-600" : "text-orange-600"
                  }`}
                >
                  {formatINR(netFundFlow)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("fundFlow.comparisonTitle")}</CardTitle>
          <CardDescription>
            {t("fundFlow.comparisonDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis
                className="text-xs"
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip
                formatter={(value: number) => formatINR(value)}
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="value" fill="fill" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {trendData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("fundFlow.trendTitle")}</CardTitle>
            <CardDescription>{t("fundFlow.trendDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis
                  className="text-xs"
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  formatter={(value: number) => formatINR(value)}
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sources"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  name={t("fundFlow.sources")}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="applications"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  name={t("fundFlow.applications")}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="netFlow"
                  stroke="hsl(var(--chart-3))"
                  strokeWidth={2}
                  name={t("fundFlow.netFlow")}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
