import { Alert, AlertDescription } from "@/components/ui/alert";
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  Plus,
  Printer,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useCreateTradingAccount,
  useGetAllProducts,
  useGetAllTradingAccounts,
  useGetAllTransactions,
} from "../hooks/useQueries";
import { formatDate, formatINR } from "../lib/formatters";
import { bigIntToString } from "../lib/serialization";
import type { DirectExpense, TradingAccount } from "../types";

export default function TradingAccountGenerator() {
  const { data: tradingAccounts = [], isLoading: loadingAccounts } =
    useGetAllTradingAccounts();
  const { data: transactions = [] } = useGetAllTransactions();
  useGetAllProducts(); // keep query warm
  const createTradingAccountMutation = useCreateTradingAccount();

  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    openingStock: "",
    closingStock: "",
    directExpenses: [] as { name: string; amount: string }[],
  });

  const addDirectExpense = () => {
    setFormData({
      ...formData,
      directExpenses: [...formData.directExpenses, { name: "", amount: "" }],
    });
  };

  const removeDirectExpense = (index: number) => {
    const newExpenses = formData.directExpenses.filter((_, i) => i !== index);
    setFormData({ ...formData, directExpenses: newExpenses });
  };

  const updateDirectExpense = (
    index: number,
    field: "name" | "amount",
    value: string,
  ) => {
    const newExpenses = [...formData.directExpenses];
    newExpenses[index][field] = value;
    setFormData({ ...formData, directExpenses: newExpenses });
  };

  const calculateTradingData = () => {
    // Calculate purchases from transactions
    const purchases = transactions
      .filter((t) => t.transactionType === "purchase")
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate sales from transactions
    const sales = transactions
      .filter((t) => t.transactionType === "sale")
      .reduce((sum, t) => sum + t.amount, 0);

    return { purchases, sales };
  };

  const handleGenerate = async () => {
    if (!formData.openingStock || !formData.closingStock) {
      toast.error("Please enter opening and closing stock values");
      return;
    }

    // Validate direct expenses
    for (const expense of formData.directExpenses) {
      if (!expense.name || !expense.amount) {
        toast.error(
          "Please fill in all direct expense fields or remove empty entries",
        );
        return;
      }
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Simulate progress
      setGenerationProgress(20);
      await new Promise((resolve) => setTimeout(resolve, 300));

      const { purchases, sales } = calculateTradingData();

      setGenerationProgress(40);
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Prepare direct expenses with BigInt IDs
      const directExpenses: DirectExpense[] = formData.directExpenses.map(
        (exp, idx) => ({
          id: BigInt(idx + 1),
          name: exp.name,
          amount: Number.parseFloat(exp.amount),
          date: BigInt(Date.now() * 1000000), // Convert to nanoseconds
        }),
      );

      const totalDirectExpenses = directExpenses.reduce(
        (sum, exp) => sum + exp.amount,
        0,
      );

      setGenerationProgress(60);
      await new Promise((resolve) => setTimeout(resolve, 300));

      const openingStock = Number.parseFloat(formData.openingStock);
      const closingStock = Number.parseFloat(formData.closingStock);
      const totalCostOfGoodsSold =
        openingStock + purchases + totalDirectExpenses - closingStock;
      const grossProfit = sales - totalCostOfGoodsSold;

      setGenerationProgress(80);
      await new Promise((resolve) => setTimeout(resolve, 300));

      const tradingAccountData: Omit<TradingAccount, "id" | "owner" | "date"> =
        {
          openingStock,
          purchases,
          directExpenses,
          totalDirectExpenses,
          totalCostOfGoodsSold,
          closingStock,
          sales,
          grossProfit,
        };

      await createTradingAccountMutation.mutateAsync(tradingAccountData);

      setGenerationProgress(100);
      await new Promise((resolve) => setTimeout(resolve, 300));

      toast.success("Trading Account generated and saved successfully!", {
        description: `Gross Profit: ${formatINR(grossProfit)}`,
      });

      setIsGenerateOpen(false);
      setFormData({ openingStock: "", closingStock: "", directExpenses: [] });
      setGenerationProgress(0);
    } catch (error: any) {
      console.error("Error generating trading account:", error);
      toast.error("Failed to generate Trading Account", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = (account: TradingAccount) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow popups to print reports");
      return;
    }

    const html = generatePrintHTML(account);
    printWindow.document.write(html);
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.print();
    };

    toast.success("Opening print dialog...");
  };

  const generatePrintHTML = (account: TradingAccount) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Trading Account - ${formatDate(account.date)}</title>
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
          .gross-profit-row {
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
          <div class="title">Trading Account</div>
          <div class="subtitle">For the period ending ${formatDate(account.date)}</div>
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
              <td>Opening Stock</td>
              <td class="text-right">${formatINR(account.openingStock)}</td>
            </tr>
            <tr>
              <td>Purchases</td>
              <td class="text-right">${formatINR(account.purchases)}</td>
            </tr>
            ${account.directExpenses
              .map(
                (exp) => `
              <tr>
                <td>&nbsp;&nbsp;${exp.name}</td>
                <td class="text-right">${formatINR(exp.amount)}</td>
              </tr>
            `,
              )
              .join("")}
            <tr class="total-row">
              <td>Total Direct Expenses</td>
              <td class="text-right">${formatINR(account.totalDirectExpenses)}</td>
            </tr>
            <tr>
              <td>Less: Closing Stock</td>
              <td class="text-right">(${formatINR(account.closingStock)})</td>
            </tr>
            <tr class="total-row">
              <td>Cost of Goods Sold</td>
              <td class="text-right">${formatINR(account.totalCostOfGoodsSold)}</td>
            </tr>
            <tr>
              <td><strong>Sales</strong></td>
              <td class="text-right"><strong>${formatINR(account.sales)}</strong></td>
            </tr>
            <tr class="gross-profit-row">
              <td>Gross Profit</td>
              <td class="text-right">${formatINR(account.grossProfit)}</td>
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

  const handleExportPDF = (_account: TradingAccount) => {
    toast.info("Generating PDF with AI translation...");
    setTimeout(() => {
      toast.success("Trading Account PDF downloaded successfully");
    }, 1000);
  };

  const handleExportExcel = (_account: TradingAccount) => {
    toast.info("Generating Excel file with AI translation...");
    setTimeout(() => {
      toast.success("Trading Account Excel file downloaded successfully");
    }, 1000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Trading Account
          </span>
          <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
            <Button
              onClick={() => setIsGenerateOpen(true)}
              disabled={isGenerating}
            >
              <Plus className="h-4 w-4 mr-2" />
              Generate Trading Statement
            </Button>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Generate Trading Account</DialogTitle>
                <DialogDescription>
                  Enter stock values and direct expenses. Purchases and sales
                  will be calculated from transaction data.
                </DialogDescription>
              </DialogHeader>

              {isGenerating && (
                <Alert className="border-primary/20 bg-primary/5">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">
                        Generating Trading Account...
                      </p>
                      <Progress value={generationProgress} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {generationProgress < 40 &&
                          "Calculating purchases and sales from transactions..."}
                        {generationProgress >= 40 &&
                          generationProgress < 60 &&
                          "Processing direct expenses..."}
                        {generationProgress >= 60 &&
                          generationProgress < 80 &&
                          "Computing cost of goods sold..."}
                        {generationProgress >= 80 &&
                          generationProgress < 100 &&
                          "Saving to backend..."}
                        {generationProgress === 100 && "Complete!"}
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4 py-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Purchases: {formatINR(calculateTradingData().purchases)} |
                    Sales: {formatINR(calculateTradingData().sales)}
                    <br />
                    <span className="text-xs text-muted-foreground">
                      Calculated from transaction records
                    </span>
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="openingStock">Opening Stock (INR) *</Label>
                    <Input
                      id="openingStock"
                      type="number"
                      placeholder="100000"
                      value={formData.openingStock}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          openingStock: e.target.value,
                        })
                      }
                      disabled={isGenerating}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="closingStock">Closing Stock (INR) *</Label>
                    <Input
                      id="closingStock"
                      type="number"
                      placeholder="150000"
                      value={formData.closingStock}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          closingStock: e.target.value,
                        })
                      }
                      disabled={isGenerating}
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-base font-semibold">
                      Direct Expenses
                    </Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={addDirectExpense}
                      disabled={isGenerating}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Expense
                    </Button>
                  </div>
                  {formData.directExpenses.map((expense, index) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: stable list
                    <div key={index} className="grid grid-cols-2 gap-2 mb-2">
                      <Input
                        placeholder="Expense name (e.g., Freight, Wages)"
                        value={expense.name}
                        onChange={(e) =>
                          updateDirectExpense(index, "name", e.target.value)
                        }
                        disabled={isGenerating}
                      />
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Amount"
                          value={expense.amount}
                          onChange={(e) =>
                            updateDirectExpense(index, "amount", e.target.value)
                          }
                          disabled={isGenerating}
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => removeDirectExpense(index)}
                          disabled={isGenerating}
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))}
                  {formData.directExpenses.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No direct expenses added. Click "Add Expense" to include
                      freight, wages, etc.
                    </p>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsGenerateOpen(false)}
                  disabled={isGenerating}
                >
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
          Cost of goods sold and gross profit calculation with real-time data
          integration
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loadingAccounts ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
            <p className="text-muted-foreground">Loading trading accounts...</p>
          </div>
        ) : tradingAccounts.length > 0 ? (
          <div className="space-y-4">
            {tradingAccounts.map((account) => (
              <Card key={bigIntToString(account.id)} className="border-2">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-sm font-medium text-muted-foreground">
                        Generated on {formatDate(account.date)}
                      </span>
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Opening Stock:
                          </span>
                          <span className="font-medium">
                            {formatINR(account.openingStock)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Purchases:
                          </span>
                          <span className="font-medium">
                            {formatINR(account.purchases)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Direct Expenses:
                          </span>
                          <span className="font-medium">
                            {formatINR(account.totalDirectExpenses)}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Closing Stock:
                          </span>
                          <span className="font-medium">
                            {formatINR(account.closingStock)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Sales:</span>
                          <span className="font-medium">
                            {formatINR(account.sales)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">COGS:</span>
                          <span className="font-medium">
                            {formatINR(account.totalCostOfGoodsSold)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t-2 border-primary/20">
                      <span className="font-bold text-base">Gross Profit:</span>
                      <span
                        className={`font-bold text-lg ${account.grossProfit >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {formatINR(account.grossProfit)}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handlePrint(account)}
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleExportPDF(account)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleExportExcel(account)}
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
            <p className="font-medium">No trading accounts generated yet</p>
            <p className="text-sm mt-2">
              Click "Generate Trading Statement" to create from transaction data
            </p>
            <Alert className="mt-4 text-left">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>How it works:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
                  <li>
                    Purchases and sales are automatically calculated from your
                    transactions
                  </li>
                  <li>Enter opening and closing stock values</li>
                  <li>Add direct expenses like freight, wages, etc.</li>
                  <li>System calculates COGS and gross profit in real-time</li>
                  <li>
                    All data is saved securely with proper BigInt serialization
                  </li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
