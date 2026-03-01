import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, ArrowRightLeft } from 'lucide-react';
import { formatCurrency } from '../../lib/formatters';

export default function FundFlowReportsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Fund Flow Reports</h2>
        <p className="text-muted-foreground">Analyze sources and applications of funds</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Sources of Funds
            </CardTitle>
            <CardDescription>Where funds came from</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Capital Introduced</span>
                <span className="font-semibold">{formatCurrency(0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Loans Received</span>
                <span className="font-semibold">{formatCurrency(0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Retained Earnings</span>
                <span className="font-semibold">{formatCurrency(0)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-bold">Total Sources</span>
                <span className="font-bold">{formatCurrency(0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Application of Funds
            </CardTitle>
            <CardDescription>Where funds were used</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Asset Purchases</span>
                <span className="font-semibold">{formatCurrency(0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Loan Repayments</span>
                <span className="font-semibold">{formatCurrency(0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Dividends Paid</span>
                <span className="font-semibold">{formatCurrency(0)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-bold">Total Applications</span>
                <span className="font-bold">{formatCurrency(0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Working Capital Changes
          </CardTitle>
          <CardDescription>Changes in current assets and liabilities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <ArrowRightLeft className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No fund flow data available yet</p>
            <p className="text-sm mt-2">Generate balance sheets to see fund flow analysis</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
