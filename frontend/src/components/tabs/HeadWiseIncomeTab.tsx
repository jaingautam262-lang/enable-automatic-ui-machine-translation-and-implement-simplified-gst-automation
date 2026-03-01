import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGetAllTransactions } from '../../hooks/useQueries';
import { formatCurrency } from '../../lib/formatters';
import { PieChart, BarChart3, TrendingUp, Download } from 'lucide-react';
import { TransactionType } from '../../types';
import { toast } from 'sonner';

export default function HeadWiseIncomeTab() {
  const { data: transactions = [] } = useGetAllTransactions();

  const calculateHeadWiseIncome = () => {
    const incomeTransactions = transactions.filter(
      t => t.transactionType === TransactionType.Sale || t.transactionType === TransactionType.Income
    );

    const categoryMap = new Map<string, number>();
    
    incomeTransactions.forEach(t => {
      const category = t.category || 'Uncategorized';
      categoryMap.set(category, (categoryMap.get(category) || 0) + t.amount);
    });

    return Array.from(categoryMap.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  };

  const headWiseData = calculateHeadWiseIncome();
  const totalIncome = headWiseData.reduce((sum, item) => sum + item.amount, 0);

  const handleExport = () => {
    toast.success('Exporting head-wise income analysis...');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Head-wise Income Analysis</h2>
          <p className="text-muted-foreground">Category-wise breakdown of income with graphical visualization</p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Income Distribution
            </CardTitle>
            <CardDescription>Percentage breakdown by category</CardDescription>
          </CardHeader>
          <CardContent>
            {headWiseData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No income data available</p>
                <p className="text-sm mt-2">Add income transactions to see analysis</p>
              </div>
            ) : (
              <div className="space-y-3">
                {headWiseData.map((item, index) => {
                  const percentage = (item.amount / totalIncome) * 100;
                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{item.category}</span>
                        <span className="text-muted-foreground">{percentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="text-right text-sm font-semibold">
                        {formatCurrency(item.amount)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Category Summary
            </CardTitle>
            <CardDescription>Detailed income by category</CardDescription>
          </CardHeader>
          <CardContent>
            {headWiseData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No income data available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {headWiseData.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{item.category}</p>
                      <p className="text-sm text-muted-foreground">
                        {((item.amount / totalIncome) * 100).toFixed(1)}% of total
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">{formatCurrency(item.amount)}</p>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center p-3 border-2 border-primary rounded-lg bg-primary/5">
                  <div>
                    <p className="font-bold">Total Income</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">{formatCurrency(totalIncome)}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Income Insights
          </CardTitle>
          <CardDescription>Key observations and trends</CardDescription>
        </CardHeader>
        <CardContent>
          {headWiseData.length > 0 ? (
            <div className="space-y-3">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Top Income Category</p>
                <p className="text-lg font-semibold">{headWiseData[0].category}</p>
                <p className="text-sm text-green-600 font-medium">{formatCurrency(headWiseData[0].amount)}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Number of Income Categories</p>
                <p className="text-lg font-semibold">{headWiseData.length}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Average per Category</p>
                <p className="text-lg font-semibold">{formatCurrency(totalIncome / headWiseData.length)}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No insights available yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
