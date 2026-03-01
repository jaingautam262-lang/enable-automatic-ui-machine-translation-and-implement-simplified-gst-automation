import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { FileText, Plus, Printer, Download, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useGenerateProfitAndLossStatement, useGetAllProfitAndLossStatements, useGetAllTradingAccounts } from '../hooks/useQueries';
import { formatINR, formatDate } from '../lib/formatters';
import { bigIntToString } from '../lib/serialization';
import type { ProfitAndLossStatement, Income, OperatingExpense } from '../types';

export default function ProfitAndLossGenerator() {
  const { data: plStatements = [], isLoading: loadingStatements } = useGetAllProfitAndLossStatements();
  const { data: tradingAccounts = [] } = useGetAllTradingAccounts();
  const generatePLMutation = useGenerateProfitAndLossStatement();

  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    tradingAccountId: '',
    depreciation: '',
    otherIncome: [] as { name: string; amount: string }[],
    operatingExpenses: [] as { name: string; amount: string }[],
    administrativeExpenses: [] as { name: string; amount: string }[],
    financialExpenses: [] as { name: string; amount: string }[],
  });

  const addItem = (category: 'otherIncome' | 'operatingExpenses' | 'administrativeExpenses' | 'financialExpenses') => {
    setFormData({
      ...formData,
      [category]: [...formData[category], { name: '', amount: '' }],
    });
  };

  const removeItem = (category: 'otherIncome' | 'operatingExpenses' | 'administrativeExpenses' | 'financialExpenses', index: number) => {
    const newItems = formData[category].filter((_, i) => i !== index);
    setFormData({ ...formData, [category]: newItems });
  };

  const updateItem = (category: 'otherIncome' | 'operatingExpenses' | 'administrativeExpenses' | 'financialExpenses', index: number, field: 'name' | 'amount', value: string) => {
    const newItems = [...formData[category]];
    newItems[index][field] = value;
    setFormData({ ...formData, [category]: newItems });
  };

  const handleGenerate = async () => {
    if (!formData.tradingAccountId || !formData.depreciation) {
      toast.error('Please select a trading account and enter depreciation');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      setGenerationProgress(20);
      await new Promise((resolve) => setTimeout(resolve, 300));

      const otherIncome: Income[] = formData.otherIncome
        .filter(item => item.name && item.amount)
        .map((item, idx) => ({
          id: BigInt(idx + 1),
          name: item.name,
          amount: parseFloat(item.amount),
          date: BigInt(Date.now() * 1000000),
        }));

      const operatingExpenses: OperatingExpense[] = formData.operatingExpenses
        .filter(item => item.name && item.amount)
        .map((item, idx) => ({
          id: BigInt(idx + 1),
          name: item.name,
          amount: parseFloat(item.amount),
          date: BigInt(Date.now() * 1000000),
        }));

      const administrativeExpenses: OperatingExpense[] = formData.administrativeExpenses
        .filter(item => item.name && item.amount)
        .map((item, idx) => ({
          id: BigInt(idx + 1),
          name: item.name,
          amount: parseFloat(item.amount),
          date: BigInt(Date.now() * 1000000),
        }));

      const financialExpenses: OperatingExpense[] = formData.financialExpenses
        .filter(item => item.name && item.amount)
        .map((item, idx) => ({
          id: BigInt(idx + 1),
          name: item.name,
          amount: parseFloat(item.amount),
          date: BigInt(Date.now() * 1000000),
        }));

      setGenerationProgress(60);
      await new Promise((resolve) => setTimeout(resolve, 300));

      const result = await generatePLMutation.mutateAsync({
        tradingAccountId: BigInt(formData.tradingAccountId),
        depreciation: parseFloat(formData.depreciation),
        otherIncome,
        operatingExpenses,
        administrativeExpenses,
        financialExpenses,
      });

      setGenerationProgress(100);
      await new Promise((resolve) => setTimeout(resolve, 300));

      toast.success('Profit & Loss Statement generated successfully!', {
        description: `Net Profit: ${formatINR(result.netProfit)}`,
      });

      setIsGenerateOpen(false);
      setFormData({
        tradingAccountId: '',
        depreciation: '',
        otherIncome: [],
        operatingExpenses: [],
        administrativeExpenses: [],
        financialExpenses: [],
      });
      setGenerationProgress(0);
    } catch (error: any) {
      console.error('Error generating P&L:', error);
      toast.error('Failed to generate Profit & Loss Statement', {
        description: error.message || 'Please try again',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = (statement: ProfitAndLossStatement) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to print reports');
      return;
    }

    const html = generatePrintHTML(statement);
    printWindow.document.write(html);
    printWindow.document.close();
    
    printWindow.onload = () => {
      printWindow.print();
    };
    
    toast.success('Opening print dialog...');
  };

  const generatePrintHTML = (statement: ProfitAndLossStatement) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Profit & Loss Statement - ${formatDate(statement.date)}</title>
        <meta charset="UTF-8">
        <style>
          @page { size: A4; margin: 15mm; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #333;
            max-width: 210mm;
            margin: 0 auto;
            padding: 10mm;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #2563eb;
          }
          .title {
            font-size: 28pt;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
          }
          .subtitle {
            font-size: 12pt;
            color: #666;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 25px 0;
          }
          th, td {
            padding: 12px;
            text-align: left;
            border: 1px solid #ddd;
          }
          th {
            background-color: #2563eb;
            color: white;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 10pt;
          }
          .text-right { text-align: right; }
          .font-bold { font-weight: bold; }
          .total-row {
            background-color: #f8fafc;
            font-weight: bold;
          }
          .net-profit-row {
            background-color: #dcfce7;
            font-weight: bold;
            font-size: 12pt;
          }
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            font-size: 9pt;
            color: #64748b;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">Profit & Loss Statement</div>
          <div class="subtitle">For the period ending ${formatDate(statement.date)}</div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Particulars</th>
              <th class="text-right">Amount (INR)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Gross Profit (from Trading Account)</strong></td>
              <td class="text-right"><strong>${formatINR(statement.grossProfit)}</strong></td>
            </tr>
            ${statement.otherIncome.map(inc => `
              <tr>
                <td>&nbsp;&nbsp;${inc.name}</td>
                <td class="text-right">${formatINR(inc.amount)}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td>Total Other Income</td>
              <td class="text-right">${formatINR(statement.totalOtherIncome)}</td>
            </tr>
            ${statement.operatingExpenses.map(exp => `
              <tr>
                <td>&nbsp;&nbsp;${exp.name}</td>
                <td class="text-right">(${formatINR(exp.amount)})</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td>Total Operating Expenses</td>
              <td class="text-right">(${formatINR(statement.totalOperatingExpenses)})</td>
            </tr>
            ${statement.administrativeExpenses.map(exp => `
              <tr>
                <td>&nbsp;&nbsp;${exp.name}</td>
                <td class="text-right">(${formatINR(exp.amount)})</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td>Total Administrative Expenses</td>
              <td class="text-right">(${formatINR(statement.totalAdministrativeExpenses)})</td>
            </tr>
            ${statement.financialExpenses.map(exp => `
              <tr>
                <td>&nbsp;&nbsp;${exp.name}</td>
                <td class="text-right">(${formatINR(exp.amount)})</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td>Total Financial Expenses</td>
              <td class="text-right">(${formatINR(statement.totalFinancialExpenses)})</td>
            </tr>
            <tr>
              <td>Depreciation</td>
              <td class="text-right">(${formatINR(statement.depreciation)})</td>
            </tr>
            <tr class="net-profit-row">
              <td>Net Profit</td>
              <td class="text-right">${formatINR(statement.netProfit)}</td>
            </tr>
          </tbody>
        </table>
        
        <div class="footer">
          <p>© 2025. Built with love using <a href="https://caffeine.ai" style="color: #2563eb; text-decoration: none;">caffeine.ai</a></p>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Profit & Loss Statement
          </span>
          <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
            <Button onClick={() => setIsGenerateOpen(true)} disabled={isGenerating || tradingAccounts.length === 0}>
              <Plus className="h-4 w-4 mr-2" />
              Generate P&L Statement
            </Button>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Generate Profit & Loss Statement</DialogTitle>
                <DialogDescription>
                  Select a trading account and add expenses to generate P&L statement
                </DialogDescription>
              </DialogHeader>

              {isGenerating && (
                <Alert className="border-primary/20 bg-primary/5">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">Generating P&L Statement...</p>
                      <Progress value={generationProgress} className="h-2" />
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="tradingAccount">Trading Account *</Label>
                  <select
                    id="tradingAccount"
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={formData.tradingAccountId}
                    onChange={(e) => setFormData({ ...formData, tradingAccountId: e.target.value })}
                    disabled={isGenerating}
                  >
                    <option value="">Select Trading Account</option>
                    {tradingAccounts.map((ta) => (
                      <option key={bigIntToString(ta.id)} value={bigIntToString(ta.id)}>
                        {formatDate(ta.date)} - Gross Profit: {formatINR(ta.grossProfit)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="depreciation">Depreciation (INR) *</Label>
                  <Input
                    id="depreciation"
                    type="number"
                    placeholder="50000"
                    value={formData.depreciation}
                    onChange={(e) => setFormData({ ...formData, depreciation: e.target.value })}
                    disabled={isGenerating}
                  />
                </div>

                <div className="border-t pt-4 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-base font-semibold">Other Income</Label>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => addItem('otherIncome')}
                        disabled={isGenerating}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                    {formData.otherIncome.map((item, index) => (
                      <div key={index} className="grid grid-cols-2 gap-2 mb-2">
                        <Input
                          placeholder="Income name"
                          value={item.name}
                          onChange={(e) => updateItem('otherIncome', index, 'name', e.target.value)}
                          disabled={isGenerating}
                        />
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            placeholder="Amount"
                            value={item.amount}
                            onChange={(e) => updateItem('otherIncome', index, 'amount', e.target.value)}
                            disabled={isGenerating}
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => removeItem('otherIncome', index)}
                            disabled={isGenerating}
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-base font-semibold">Operating Expenses</Label>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => addItem('operatingExpenses')}
                        disabled={isGenerating}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                    {formData.operatingExpenses.map((item, index) => (
                      <div key={index} className="grid grid-cols-2 gap-2 mb-2">
                        <Input
                          placeholder="Expense name"
                          value={item.name}
                          onChange={(e) => updateItem('operatingExpenses', index, 'name', e.target.value)}
                          disabled={isGenerating}
                        />
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            placeholder="Amount"
                            value={item.amount}
                            onChange={(e) => updateItem('operatingExpenses', index, 'amount', e.target.value)}
                            disabled={isGenerating}
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => removeItem('operatingExpenses', index)}
                            disabled={isGenerating}
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-base font-semibold">Administrative Expenses</Label>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => addItem('administrativeExpenses')}
                        disabled={isGenerating}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                    {formData.administrativeExpenses.map((item, index) => (
                      <div key={index} className="grid grid-cols-2 gap-2 mb-2">
                        <Input
                          placeholder="Expense name"
                          value={item.name}
                          onChange={(e) => updateItem('administrativeExpenses', index, 'name', e.target.value)}
                          disabled={isGenerating}
                        />
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            placeholder="Amount"
                            value={item.amount}
                            onChange={(e) => updateItem('administrativeExpenses', index, 'amount', e.target.value)}
                            disabled={isGenerating}
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => removeItem('administrativeExpenses', index)}
                            disabled={isGenerating}
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-base font-semibold">Financial Expenses</Label>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => addItem('financialExpenses')}
                        disabled={isGenerating}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                    {formData.financialExpenses.map((item, index) => (
                      <div key={index} className="grid grid-cols-2 gap-2 mb-2">
                        <Input
                          placeholder="Expense name"
                          value={item.name}
                          onChange={(e) => updateItem('financialExpenses', index, 'name', e.target.value)}
                          disabled={isGenerating}
                        />
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            placeholder="Amount"
                            value={item.amount}
                            onChange={(e) => updateItem('financialExpenses', index, 'amount', e.target.value)}
                            disabled={isGenerating}
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => removeItem('financialExpenses', index)}
                            disabled={isGenerating}
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsGenerateOpen(false)} disabled={isGenerating}>
                  Cancel
                </Button>
                <Button onClick={handleGenerate} disabled={isGenerating}>
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Generate & Save
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardTitle>
        <CardDescription>
          Net profit calculation with expenses and income
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loadingStatements ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
            <p className="text-muted-foreground">Loading P&L statements...</p>
          </div>
        ) : plStatements.length > 0 ? (
          <div className="space-y-4">
            {plStatements.map((statement) => (
              <Card key={bigIntToString(statement.id)} className="border-2">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-sm font-medium text-muted-foreground">
                        Generated on {formatDate(statement.date)}
                      </span>
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Gross Profit:</span>
                          <span className="font-medium">{formatINR(statement.grossProfit)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Other Income:</span>
                          <span className="font-medium">{formatINR(statement.totalOtherIncome)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Operating Exp:</span>
                          <span className="font-medium">{formatINR(statement.totalOperatingExpenses)}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Admin Exp:</span>
                          <span className="font-medium">{formatINR(statement.totalAdministrativeExpenses)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Financial Exp:</span>
                          <span className="font-medium">{formatINR(statement.totalFinancialExpenses)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Depreciation:</span>
                          <span className="font-medium">{formatINR(statement.depreciation)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t-2 border-primary/20">
                      <span className="font-bold text-base">Net Profit:</span>
                      <span className={`font-bold text-lg ${statement.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatINR(statement.netProfit)}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handlePrint(statement)}
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => toast.info('PDF export coming soon')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => toast.info('Excel export coming soon')}
                      >
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Excel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">No P&L statements generated yet</p>
            <p className="text-sm mt-2">Generate a Trading Account first, then create P&L statement</p>
            {tradingAccounts.length === 0 && (
              <Alert className="mt-4 text-left">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Note:</strong> You need to generate a Trading Account before creating a P&L statement.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
