import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Languages, TrendingDown, DollarSign, Scale, Sparkles, FileText, ArrowRightLeft, PieChart, Calculator } from 'lucide-react';
import TradingAccountGenerator from '../TradingAccountGenerator';
import ProfitAndLossGenerator from '../ProfitAndLossGenerator';
import ScheduleIIIStatementsTab from './ScheduleIIIStatementsTab';
import TDSTCSManagementTab from './TDSTCSManagementTab';
import DepreciationReportsTab from './DepreciationReportsTab';
import IncomeTaxReportsTab from './IncomeTaxReportsTab';
import AITaxResearchTab from './AITaxResearchTab';
import DepreciationComparisonTab from './DepreciationComparisonTab';
import FundFlowCalculatorTab from './FundFlowCalculatorTab';
import EnhancedCashFlowTab from './EnhancedCashFlowTab';
import HeadWiseIncomeTab from './HeadWiseIncomeTab';
import GSTCalculatorTab from './GSTCalculatorTab';

export default function ReportsTab() {
  const [financialStatementType, setFinancialStatementType] = useState<'schedule3' | 'tabular'>('tabular');
  const [activeReportTab, setActiveReportTab] = useState('financial-statements');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Financial Reports & Analytics</h2>
          <p className="text-muted-foreground">Comprehensive business insights with Indian accounting standards compliance</p>
        </div>
        <div className="flex gap-2">
          <Alert className="border-primary/20 bg-primary/5 py-2 px-4">
            <Languages className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Multi-language Support
            </AlertDescription>
          </Alert>
        </div>
      </div>

      <Tabs value={activeReportTab} onValueChange={setActiveReportTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9 h-auto gap-2">
          <TabsTrigger value="financial-statements">
            <FileText className="h-4 w-4 mr-2" />
            Financial
          </TabsTrigger>
          <TabsTrigger value="depreciation">
            <TrendingDown className="h-4 w-4 mr-2" />
            Depreciation
          </TabsTrigger>
          <TabsTrigger value="depreciation-comparison">
            <Scale className="h-4 w-4 mr-2" />
            Dep. Compare
          </TabsTrigger>
          <TabsTrigger value="income-tax">
            <Scale className="h-4 w-4 mr-2" />
            Income Tax
          </TabsTrigger>
          <TabsTrigger value="cash-flow">
            <DollarSign className="h-4 w-4 mr-2" />
            Cash Flow
          </TabsTrigger>
          <TabsTrigger value="fund-flow">
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            Fund Flow
          </TabsTrigger>
          <TabsTrigger value="head-wise-income">
            <PieChart className="h-4 w-4 mr-2" />
            Income Analysis
          </TabsTrigger>
          <TabsTrigger value="gst-calculator">
            <Calculator className="h-4 w-4 mr-2" />
            GST Calculator
          </TabsTrigger>
          <TabsTrigger value="ai-tax-research">
            <Sparkles className="h-4 w-4 mr-2" />
            AI Tax Research
          </TabsTrigger>
        </TabsList>

        <TabsContent value="financial-statements" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <Button
                variant={financialStatementType === 'schedule3' ? 'default' : 'outline'}
                onClick={() => setFinancialStatementType('schedule3')}
              >
                Schedule III (Companies)
              </Button>
              <Button
                variant={financialStatementType === 'tabular' ? 'default' : 'outline'}
                onClick={() => setFinancialStatementType('tabular')}
              >
                Tabular Format (Non-Companies)
              </Button>
            </div>
          </div>

          {financialStatementType === 'tabular' && (
            <div className="grid gap-4 md:grid-cols-2">
              <TradingAccountGenerator />
              <ProfitAndLossGenerator />
            </div>
          )}

          {financialStatementType === 'schedule3' && (
            <ScheduleIIIStatementsTab />
          )}
        </TabsContent>

        <TabsContent value="depreciation" className="space-y-4">
          <DepreciationReportsTab />
        </TabsContent>

        <TabsContent value="depreciation-comparison" className="space-y-4">
          <DepreciationComparisonTab />
        </TabsContent>

        <TabsContent value="income-tax" className="space-y-4">
          <IncomeTaxReportsTab />
        </TabsContent>

        <TabsContent value="cash-flow" className="space-y-4">
          <EnhancedCashFlowTab />
        </TabsContent>

        <TabsContent value="fund-flow" className="space-y-4">
          <FundFlowCalculatorTab />
        </TabsContent>

        <TabsContent value="head-wise-income" className="space-y-4">
          <HeadWiseIncomeTab />
        </TabsContent>

        <TabsContent value="gst-calculator" className="space-y-4">
          <GSTCalculatorTab />
        </TabsContent>

        <TabsContent value="ai-tax-research" className="space-y-4">
          <AITaxResearchTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
