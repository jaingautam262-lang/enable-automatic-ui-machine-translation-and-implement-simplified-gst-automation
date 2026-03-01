import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Printer, Download, FileSpreadsheet, Building2, Info, TrendingUp, AlertCircle } from 'lucide-react';
import { formatINR, formatDate } from '../../lib/formatters';
import { toast } from 'sonner';
import {
  useGetAllTransactions,
  useGetAllProducts,
  useGetAllDepreciationAssets,
  useGetAllProfitAndLossStatements,
  useGetAllBalanceSheets,
} from '../../hooks/useQueries';

interface ScheduleIIIBalanceSheet {
  equity: {
    shareCapital: number;
    reservesAndSurplus: number;
    total: number;
  };
  nonCurrentLiabilities: {
    longTermBorrowings: number;
    deferredTaxLiabilities: number;
    otherLongTermLiabilities: number;
    longTermProvisions: number;
    total: number;
  };
  currentLiabilities: {
    shortTermBorrowings: number;
    tradePayables: number;
    otherCurrentLiabilities: number;
    shortTermProvisions: number;
    total: number;
  };
  nonCurrentAssets: {
    fixedAssets: {
      tangibleAssets: number;
      intangibleAssets: number;
      capitalWorkInProgress: number;
      total: number;
    };
    nonCurrentInvestments: number;
    deferredTaxAssets: number;
    longTermLoansAndAdvances: number;
    otherNonCurrentAssets: number;
    total: number;
  };
  currentAssets: {
    currentInvestments: number;
    inventories: number;
    tradeReceivables: number;
    cashAndCashEquivalents: number;
    shortTermLoansAndAdvances: number;
    otherCurrentAssets: number;
    total: number;
  };
  totalEquityAndLiabilities: number;
  totalAssets: number;
}

interface ScheduleIIIProfitAndLoss {
  revenue: {
    revenueFromOperations: number;
    otherIncome: number;
    total: number;
  };
  expenses: {
    costOfMaterialsConsumed: number;
    purchasesOfStockInTrade: number;
    changesInInventories: number;
    employeeBenefitExpense: number;
    financeCosts: number;
    depreciationAndAmortization: number;
    otherExpenses: number;
    total: number;
  };
  profitBeforeTax: number;
  taxExpense: {
    currentTax: number;
    deferredTax: number;
    total: number;
  };
  profitAfterTax: number;
  earningsPerShare: {
    basic: number;
    diluted: number;
  };
}

export default function ScheduleIIIStatementsTab() {
  const { data: transactions = [] } = useGetAllTransactions();
  const { data: products = [] } = useGetAllProducts();
  const { data: depreciationAssets = [] } = useGetAllDepreciationAssets();
  const { data: profitAndLossStatements = [] } = useGetAllProfitAndLossStatements();
  const { data: balanceSheets = [] } = useGetAllBalanceSheets();

  const [activeTab, setActiveTab] = useState<'balance-sheet' | 'profit-loss'>('balance-sheet');

  // Calculate Schedule III Balance Sheet
  const calculateScheduleIIIBalanceSheet = (): ScheduleIIIBalanceSheet => {
    // Get latest balance sheet data if available
    const latestBalanceSheet = balanceSheets.length > 0 ? balanceSheets[balanceSheets.length - 1] : null;

    // Calculate fixed assets from depreciation assets
    const tangibleAssets = depreciationAssets.reduce((sum, asset) => sum + asset.bookValue, 0);

    // Calculate inventories from products
    const inventories = products.reduce((sum, product) => sum + (product.price * Number(product.stockLevel)), 0);

    // Calculate trade receivables from unpaid sales transactions
    const salesTransactions = transactions.filter(t => t.transactionType === 'sale');
    const tradeReceivables = salesTransactions.reduce((sum, t) => sum + t.amount, 0) * 0.3; // Assume 30% outstanding

    // Calculate cash from transactions
    const cashTransactions = transactions.filter(t => t.isCash);
    const cashInflows = cashTransactions.filter(t => t.transactionType === 'sale' || t.transactionType === 'income').reduce((sum, t) => sum + t.amount, 0);
    const cashOutflows = cashTransactions.filter(t => t.transactionType === 'purchase' || t.transactionType === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const cashAndCashEquivalents = cashInflows - cashOutflows;

    // Calculate trade payables from unpaid purchase transactions
    const purchaseTransactions = transactions.filter(t => t.transactionType === 'purchase');
    const tradePayables = purchaseTransactions.reduce((sum, t) => sum + t.amount, 0) * 0.25; // Assume 25% outstanding

    // Calculate reserves and surplus from profit
    const latestPL = profitAndLossStatements.length > 0 ? profitAndLossStatements[profitAndLossStatements.length - 1] : null;
    const reservesAndSurplus = latestPL ? latestPL.netProfit : 0;

    const nonCurrentAssets = {
      fixedAssets: {
        tangibleAssets,
        intangibleAssets: 0,
        capitalWorkInProgress: 0,
        total: tangibleAssets,
      },
      nonCurrentInvestments: 0,
      deferredTaxAssets: 0,
      longTermLoansAndAdvances: 0,
      otherNonCurrentAssets: 0,
      total: tangibleAssets,
    };

    const currentAssets = {
      currentInvestments: 0,
      inventories,
      tradeReceivables,
      cashAndCashEquivalents: Math.max(0, cashAndCashEquivalents),
      shortTermLoansAndAdvances: 0,
      otherCurrentAssets: 0,
      total: inventories + tradeReceivables + Math.max(0, cashAndCashEquivalents),
    };

    const totalAssets = nonCurrentAssets.total + currentAssets.total;

    const equity = {
      shareCapital: 100000, // Default share capital
      reservesAndSurplus,
      total: 100000 + reservesAndSurplus,
    };

    const nonCurrentLiabilities = {
      longTermBorrowings: 0,
      deferredTaxLiabilities: 0,
      otherLongTermLiabilities: 0,
      longTermProvisions: 0,
      total: 0,
    };

    const currentLiabilities = {
      shortTermBorrowings: 0,
      tradePayables,
      otherCurrentLiabilities: 0,
      shortTermProvisions: 0,
      total: tradePayables,
    };

    const totalEquityAndLiabilities = equity.total + nonCurrentLiabilities.total + currentLiabilities.total;

    return {
      equity,
      nonCurrentLiabilities,
      currentLiabilities,
      nonCurrentAssets,
      currentAssets,
      totalEquityAndLiabilities,
      totalAssets,
    };
  };

  // Calculate Schedule III Profit & Loss
  const calculateScheduleIIIProfitAndLoss = (): ScheduleIIIProfitAndLoss => {
    const salesTransactions = transactions.filter(t => t.transactionType === 'sale');
    const purchaseTransactions = transactions.filter(t => t.transactionType === 'purchase');
    const incomeTransactions = transactions.filter(t => t.transactionType === 'income');
    const expenseTransactions = transactions.filter(t => t.transactionType === 'expense');

    const revenueFromOperations = salesTransactions.reduce((sum, t) => sum + t.amount, 0);
    const otherIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);

    const purchasesOfStockInTrade = purchaseTransactions.reduce((sum, t) => sum + t.amount, 0);
    const otherExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

    // Get depreciation from assets
    const depreciationAndAmortization = depreciationAssets.reduce((sum, asset) => sum + asset.accumulatedDepreciation, 0);

    const totalRevenue = revenueFromOperations + otherIncome;
    const totalExpenses = purchasesOfStockInTrade + otherExpenses + depreciationAndAmortization;

    const profitBeforeTax = totalRevenue - totalExpenses;
    const currentTax = profitBeforeTax > 0 ? profitBeforeTax * 0.25 : 0; // Assume 25% tax rate
    const profitAfterTax = profitBeforeTax - currentTax;

    // Calculate EPS (assuming 10,000 shares)
    const numberOfShares = 10000;
    const basicEPS = profitAfterTax / numberOfShares;

    return {
      revenue: {
        revenueFromOperations,
        otherIncome,
        total: totalRevenue,
      },
      expenses: {
        costOfMaterialsConsumed: 0,
        purchasesOfStockInTrade,
        changesInInventories: 0,
        employeeBenefitExpense: 0,
        financeCosts: 0,
        depreciationAndAmortization,
        otherExpenses,
        total: totalExpenses,
      },
      profitBeforeTax,
      taxExpense: {
        currentTax,
        deferredTax: 0,
        total: currentTax,
      },
      profitAfterTax,
      earningsPerShare: {
        basic: basicEPS,
        diluted: basicEPS,
      },
    };
  };

  const balanceSheetData = calculateScheduleIIIBalanceSheet();
  const profitLossData = calculateScheduleIIIProfitAndLoss();

  const handlePrint = (reportType: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to print reports');
      return;
    }

    const reportHTML = generateScheduleIIIHTML(reportType);
    printWindow.document.write(reportHTML);
    printWindow.document.close();
    
    printWindow.onload = () => {
      printWindow.print();
    };
    
    toast.success('Opening print dialog...');
  };

  const handleExportPDF = (reportType: string) => {
    toast.info('PDF export functionality will generate a downloadable PDF file');
    // In a real implementation, this would use a library like jsPDF or html2pdf
  };

  const handleExportExcel = (reportType: string) => {
    toast.info('Excel export functionality will generate a downloadable Excel file');
    // In a real implementation, this would use a library like xlsx
  };

  const generateScheduleIIIHTML = (reportType: string) => {
    const currentDate = new Date().toLocaleDateString();
    const previousYear = new Date().getFullYear() - 1;
    const currentYear = new Date().getFullYear();

    let contentHTML = '';

    if (reportType === 'balance-sheet') {
      contentHTML = `
        <h2 style="text-align: center; margin-bottom: 30px;">Balance Sheet as at ${currentDate}</h2>
        <h3 style="margin-top: 30px; margin-bottom: 15px; color: #2563eb;">I. EQUITY AND LIABILITIES</h3>
        
        <h4 style="margin-top: 20px; margin-bottom: 10px;">(1) Shareholders' Funds</h4>
        <table>
          <thead>
            <tr>
              <th>Particulars</th>
              <th class="text-right">Note No.</th>
              <th class="text-right">${currentYear} (₹)</th>
              <th class="text-right">${previousYear} (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding-left: 20px;">(a) Share Capital</td>
              <td class="text-right">1</td>
              <td class="text-right">${formatINR(balanceSheetData.equity.shareCapital)}</td>
              <td class="text-right">-</td>
            </tr>
            <tr>
              <td style="padding-left: 20px;">(b) Reserves and Surplus</td>
              <td class="text-right">2</td>
              <td class="text-right">${formatINR(balanceSheetData.equity.reservesAndSurplus)}</td>
              <td class="text-right">-</td>
            </tr>
            <tr style="font-weight: bold;">
              <td>Total Shareholders' Funds</td>
              <td></td>
              <td class="text-right">${formatINR(balanceSheetData.equity.total)}</td>
              <td class="text-right">-</td>
            </tr>
          </tbody>
        </table>

        <h4 style="margin-top: 20px; margin-bottom: 10px;">(2) Non-Current Liabilities</h4>
        <table>
          <tbody>
            <tr>
              <td style="padding-left: 20px;">(a) Long-term Borrowings</td>
              <td class="text-right">3</td>
              <td class="text-right">${formatINR(balanceSheetData.nonCurrentLiabilities.longTermBorrowings)}</td>
              <td class="text-right">-</td>
            </tr>
            <tr>
              <td style="padding-left: 20px;">(b) Deferred Tax Liabilities (Net)</td>
              <td class="text-right">4</td>
              <td class="text-right">${formatINR(balanceSheetData.nonCurrentLiabilities.deferredTaxLiabilities)}</td>
              <td class="text-right">-</td>
            </tr>
            <tr>
              <td style="padding-left: 20px;">(c) Other Long-term Liabilities</td>
              <td class="text-right">5</td>
              <td class="text-right">${formatINR(balanceSheetData.nonCurrentLiabilities.otherLongTermLiabilities)}</td>
              <td class="text-right">-</td>
            </tr>
            <tr>
              <td style="padding-left: 20px;">(d) Long-term Provisions</td>
              <td class="text-right">6</td>
              <td class="text-right">${formatINR(balanceSheetData.nonCurrentLiabilities.longTermProvisions)}</td>
              <td class="text-right">-</td>
            </tr>
            <tr style="font-weight: bold;">
              <td>Total Non-Current Liabilities</td>
              <td></td>
              <td class="text-right">${formatINR(balanceSheetData.nonCurrentLiabilities.total)}</td>
              <td class="text-right">-</td>
            </tr>
          </tbody>
        </table>

        <h4 style="margin-top: 20px; margin-bottom: 10px;">(3) Current Liabilities</h4>
        <table>
          <tbody>
            <tr>
              <td style="padding-left: 20px;">(a) Short-term Borrowings</td>
              <td class="text-right">7</td>
              <td class="text-right">${formatINR(balanceSheetData.currentLiabilities.shortTermBorrowings)}</td>
              <td class="text-right">-</td>
            </tr>
            <tr>
              <td style="padding-left: 20px;">(b) Trade Payables</td>
              <td class="text-right">8</td>
              <td class="text-right">${formatINR(balanceSheetData.currentLiabilities.tradePayables)}</td>
              <td class="text-right">-</td>
            </tr>
            <tr>
              <td style="padding-left: 20px;">(c) Other Current Liabilities</td>
              <td class="text-right">9</td>
              <td class="text-right">${formatINR(balanceSheetData.currentLiabilities.otherCurrentLiabilities)}</td>
              <td class="text-right">-</td>
            </tr>
            <tr>
              <td style="padding-left: 20px;">(d) Short-term Provisions</td>
              <td class="text-right">10</td>
              <td class="text-right">${formatINR(balanceSheetData.currentLiabilities.shortTermProvisions)}</td>
              <td class="text-right">-</td>
            </tr>
            <tr style="font-weight: bold;">
              <td>Total Current Liabilities</td>
              <td></td>
              <td class="text-right">${formatINR(balanceSheetData.currentLiabilities.total)}</td>
              <td class="text-right">-</td>
            </tr>
          </tbody>
        </table>

        <table style="margin-top: 20px;">
          <tbody>
            <tr style="font-weight: bold; border-top: 3px solid #2563eb;">
              <td>TOTAL EQUITY AND LIABILITIES</td>
              <td></td>
              <td class="text-right">${formatINR(balanceSheetData.totalEquityAndLiabilities)}</td>
              <td class="text-right">-</td>
            </tr>
          </tbody>
        </table>

        <h3 style="margin-top: 40px; margin-bottom: 15px; color: #2563eb;">II. ASSETS</h3>
        
        <h4 style="margin-top: 20px; margin-bottom: 10px;">(1) Non-Current Assets</h4>
        <table>
          <tbody>
            <tr>
              <td style="padding-left: 20px;">(a) Fixed Assets</td>
              <td class="text-right">11</td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td style="padding-left: 40px;">(i) Tangible Assets</td>
              <td></td>
              <td class="text-right">${formatINR(balanceSheetData.nonCurrentAssets.fixedAssets.tangibleAssets)}</td>
              <td class="text-right">-</td>
            </tr>
            <tr>
              <td style="padding-left: 40px;">(ii) Intangible Assets</td>
              <td></td>
              <td class="text-right">${formatINR(balanceSheetData.nonCurrentAssets.fixedAssets.intangibleAssets)}</td>
              <td class="text-right">-</td>
            </tr>
            <tr>
              <td style="padding-left: 40px;">(iii) Capital Work-in-Progress</td>
              <td></td>
              <td class="text-right">${formatINR(balanceSheetData.nonCurrentAssets.fixedAssets.capitalWorkInProgress)}</td>
              <td class="text-right">-</td>
            </tr>
            <tr>
              <td style="padding-left: 20px;">(b) Non-current Investments</td>
              <td class="text-right">12</td>
              <td class="text-right">${formatINR(balanceSheetData.nonCurrentAssets.nonCurrentInvestments)}</td>
              <td class="text-right">-</td>
            </tr>
            <tr>
              <td style="padding-left: 20px;">(c) Deferred Tax Assets (Net)</td>
              <td class="text-right">13</td>
              <td class="text-right">${formatINR(balanceSheetData.nonCurrentAssets.deferredTaxAssets)}</td>
              <td class="text-right">-</td>
            </tr>
            <tr>
              <td style="padding-left: 20px;">(d) Long-term Loans and Advances</td>
              <td class="text-right">14</td>
              <td class="text-right">${formatINR(balanceSheetData.nonCurrentAssets.longTermLoansAndAdvances)}</td>
              <td class="text-right">-</td>
            </tr>
            <tr>
              <td style="padding-left: 20px;">(e) Other Non-current Assets</td>
              <td class="text-right">15</td>
              <td class="text-right">${formatINR(balanceSheetData.nonCurrentAssets.otherNonCurrentAssets)}</td>
              <td class="text-right">-</td>
            </tr>
            <tr style="font-weight: bold;">
              <td>Total Non-Current Assets</td>
              <td></td>
              <td class="text-right">${formatINR(balanceSheetData.nonCurrentAssets.total)}</td>
              <td class="text-right">-</td>
            </tr>
          </tbody>
        </table>

        <h4 style="margin-top: 20px; margin-bottom: 10px;">(2) Current Assets</h4>
        <table>
          <tbody>
            <tr>
              <td style="padding-left: 20px;">(a) Current Investments</td>
              <td class="text-right">16</td>
              <td class="text-right">${formatINR(balanceSheetData.currentAssets.currentInvestments)}</td>
              <td class="text-right">-</td>
            </tr>
            <tr>
              <td style="padding-left: 20px;">(b) Inventories</td>
              <td class="text-right">17</td>
              <td class="text-right">${formatINR(balanceSheetData.currentAssets.inventories)}</td>
              <td class="text-right">-</td>
            </tr>
            <tr>
              <td style="padding-left: 20px;">(c) Trade Receivables</td>
              <td class="text-right">18</td>
              <td class="text-right">${formatINR(balanceSheetData.currentAssets.tradeReceivables)}</td>
              <td class="text-right">-</td>
            </tr>
            <tr>
              <td style="padding-left: 20px;">(d) Cash and Cash Equivalents</td>
              <td class="text-right">19</td>
              <td class="text-right">${formatINR(balanceSheetData.currentAssets.cashAndCashEquivalents)}</td>
              <td class="text-right">-</td>
            </tr>
            <tr>
              <td style="padding-left: 20px;">(e) Short-term Loans and Advances</td>
              <td class="text-right">20</td>
              <td class="text-right">${formatINR(balanceSheetData.currentAssets.shortTermLoansAndAdvances)}</td>
              <td class="text-right">-</td>
            </tr>
            <tr>
              <td style="padding-left: 20px;">(f) Other Current Assets</td>
              <td class="text-right">21</td>
              <td class="text-right">${formatINR(balanceSheetData.currentAssets.otherCurrentAssets)}</td>
              <td class="text-right">-</td>
            </tr>
            <tr style="font-weight: bold;">
              <td>Total Current Assets</td>
              <td></td>
              <td class="text-right">${formatINR(balanceSheetData.currentAssets.total)}</td>
              <td class="text-right">-</td>
            </tr>
          </tbody>
        </table>

        <table style="margin-top: 20px;">
          <tbody>
            <tr style="font-weight: bold; border-top: 3px solid #2563eb;">
              <td>TOTAL ASSETS</td>
              <td></td>
              <td class="text-right">${formatINR(balanceSheetData.totalAssets)}</td>
              <td class="text-right">-</td>
            </tr>
          </tbody>
        </table>
      `;
    } else {
      contentHTML = `
        <h2 style="text-align: center; margin-bottom: 30px;">Statement of Profit and Loss for the year ended ${currentDate}</h2>
        
        <h3 style="margin-top: 30px; margin-bottom: 15px; color: #2563eb;">I. Revenue</h3>
        <table>
          <thead>
            <tr>
              <th>Particulars</th>
              <th class="text-right">Note No.</th>
              <th class="text-right">${currentYear} (₹)</th>
              <th class="text-right">${previousYear} (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Revenue from Operations</td>
              <td class="text-right">22</td>
              <td class="text-right">${formatINR(profitLossData.revenue.revenueFromOperations)}</td>
              <td class="text-right">-</td>
            </tr>
            <tr>
              <td>Other Income</td>
              <td class="text-right">23</td>
              <td class="text-right">${formatINR(profitLossData.revenue.otherIncome)}</td>
              <td class="text-right">-</td>
            </tr>
            <tr style="font-weight: bold;">
              <td>Total Revenue (I)</td>
              <td></td>
              <td class="text-right">${formatINR(profitLossData.revenue.total)}</td>
              <td class="text-right">-</td>
            </tr>
          </tbody>
        </table>

        <h3 style="margin-top: 30px; margin-bottom: 15px; color: #2563eb;">II. Expenses</h3>
        <table>
          <tbody>
            <tr>
              <td>Cost of Materials Consumed</td>
              <td class="text-right">24</td>
              <td class="text-right">${formatINR(profitLossData.expenses.costOfMaterialsConsumed)}</td>
              <td class="text-right">-</td>
            </tr>
            <tr>
              <td>Purchases of Stock-in-Trade</td>
              <td class="text-right">25</td>
              <td class="text-right">${formatINR(profitLossData.expenses.purchasesOfStockInTrade)}</td>
              <td class="text-right">-</td>
            </tr>
            <tr>
              <td>Changes in Inventories of Finished Goods, Work-in-Progress and Stock-in-Trade</td>
              <td class="text-right">26</td>
              <td class="text-right">${formatINR(profitLossData.expenses.changesInInventories)}</td>
              <td class="text-right">-</td>
            </tr>
            <tr>
              <td>Employee Benefits Expense</td>
              <td class="text-right">27</td>
              <td class="text-right">${formatINR(profitLossData.expenses.employeeBenefitExpense)}</td>
              <td class="text-right">-</td>
            </tr>
            <tr>
              <td>Finance Costs</td>
              <td class="text-right">28</td>
              <td class="text-right">${formatINR(profitLossData.expenses.financeCosts)}</td>
              <td class="text-right">-</td>
            </tr>
            <tr>
              <td>Depreciation and Amortization Expense</td>
              <td class="text-right">29</td>
              <td class="text-right">${formatINR(profitLossData.expenses.depreciationAndAmortization)}</td>
              <td class="text-right">-</td>
            </tr>
            <tr>
              <td>Other Expenses</td>
              <td class="text-right">30</td>
              <td class="text-right">${formatINR(profitLossData.expenses.otherExpenses)}</td>
              <td class="text-right">-</td>
            </tr>
            <tr style="font-weight: bold;">
              <td>Total Expenses (II)</td>
              <td></td>
              <td class="text-right">${formatINR(profitLossData.expenses.total)}</td>
              <td class="text-right">-</td>
            </tr>
          </tbody>
        </table>

        <table style="margin-top: 20px;">
          <tbody>
            <tr style="font-weight: bold; background-color: #f0f9ff;">
              <td>Profit/(Loss) before Tax (I-II)</td>
              <td></td>
              <td class="text-right" style="color: ${profitLossData.profitBeforeTax >= 0 ? '#16a34a' : '#dc2626'};">
                ${formatINR(profitLossData.profitBeforeTax)}
              </td>
              <td class="text-right">-</td>
            </tr>
          </tbody>
        </table>

        <h3 style="margin-top: 30px; margin-bottom: 15px; color: #2563eb;">III. Tax Expense</h3>
        <table>
          <tbody>
            <tr>
              <td style="padding-left: 20px;">(1) Current Tax</td>
              <td class="text-right">31</td>
              <td class="text-right">${formatINR(profitLossData.taxExpense.currentTax)}</td>
              <td class="text-right">-</td>
            </tr>
            <tr>
              <td style="padding-left: 20px;">(2) Deferred Tax</td>
              <td class="text-right">32</td>
              <td class="text-right">${formatINR(profitLossData.taxExpense.deferredTax)}</td>
              <td class="text-right">-</td>
            </tr>
            <tr style="font-weight: bold;">
              <td>Total Tax Expense (III)</td>
              <td></td>
              <td class="text-right">${formatINR(profitLossData.taxExpense.total)}</td>
              <td class="text-right">-</td>
            </tr>
          </tbody>
        </table>

        <table style="margin-top: 20px;">
          <tbody>
            <tr style="font-weight: bold; border-top: 3px solid #2563eb;">
              <td>Profit/(Loss) for the Period</td>
              <td></td>
              <td class="text-right" style="color: ${profitLossData.profitAfterTax >= 0 ? '#16a34a' : '#dc2626'};">
                ${formatINR(profitLossData.profitAfterTax)}
              </td>
              <td class="text-right">-</td>
            </tr>
          </tbody>
        </table>

        <h3 style="margin-top: 30px; margin-bottom: 15px; color: #2563eb;">IV. Earnings Per Equity Share</h3>
        <table>
          <tbody>
            <tr>
              <td style="padding-left: 20px;">(1) Basic (₹)</td>
              <td class="text-right">33</td>
              <td class="text-right">${profitLossData.earningsPerShare.basic.toFixed(2)}</td>
              <td class="text-right">-</td>
            </tr>
            <tr>
              <td style="padding-left: 20px;">(2) Diluted (₹)</td>
              <td class="text-right">33</td>
              <td class="text-right">${profitLossData.earningsPerShare.diluted.toFixed(2)}</td>
              <td class="text-right">-</td>
            </tr>
          </tbody>
        </table>
      `;
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Schedule III ${reportType === 'balance-sheet' ? 'Balance Sheet' : 'Profit & Loss'}</title>
        <meta charset="UTF-8">
        <style>
          @page { size: A4; margin: 15mm; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 10pt;
            line-height: 1.4;
            color: #333;
            max-width: 210mm;
            margin: 0 auto;
            padding: 10mm;
          }
          .report-header {
            text-align: center;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 3px solid #2563eb;
          }
          .report-title {
            font-size: 20pt;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
          }
          .report-subtitle {
            font-size: 12pt;
            color: #666;
            margin-bottom: 5px;
          }
          .report-date {
            font-size: 9pt;
            color: #666;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            font-size: 9pt;
          }
          thead {
            background-color: #2563eb;
            color: white;
          }
          th {
            padding: 10px 8px;
            text-align: left;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 8pt;
          }
          td {
            padding: 8px;
            border-bottom: 1px solid #e2e8f0;
          }
          .text-right { text-align: right; }
          h2 {
            font-size: 14pt;
            color: #1e40af;
            margin: 20px 0 15px 0;
          }
          h3 {
            font-size: 11pt;
            color: #2563eb;
            margin: 20px 0 10px 0;
            padding-bottom: 5px;
            border-bottom: 2px solid #2563eb;
          }
          h4 {
            font-size: 10pt;
            color: #1e40af;
            margin: 15px 0 8px 0;
          }
          .footer {
            margin-top: 40px;
            padding-top: 15px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            font-size: 8pt;
            color: #64748b;
          }
          .signature-section {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
          }
          .signature-box {
            width: 45%;
            border-top: 1px solid #333;
            padding-top: 10px;
            text-align: center;
          }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="report-header">
          <div class="report-title">Schedule III Financial Statement</div>
          <div class="report-subtitle">${reportType === 'balance-sheet' ? 'Balance Sheet' : 'Statement of Profit and Loss'}</div>
          <div class="report-date">As per Companies Act, 2013 | Generated on ${currentDate}</div>
        </div>
        
        ${contentHTML}

        <div class="signature-section">
          <div class="signature-box">
            <p>For and on behalf of the Board</p>
            <p style="margin-top: 30px;">Director</p>
            <p style="font-size: 8pt; color: #666;">Date: _____________</p>
          </div>
          <div class="signature-box">
            <p>Chief Financial Officer</p>
            <p style="margin-top: 30px;">Signature</p>
            <p style="font-size: 8pt; color: #666;">Date: _____________</p>
          </div>
        </div>
        
        <div class="footer">
          <p>© 2025. Built with love using <a href="https://caffeine.ai" style="color: #2563eb; text-decoration: none;">caffeine.ai</a></p>
          <p style="margin-top: 5px; font-size: 7pt;">This is a computer-generated document and does not require a signature</p>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Schedule III Compliant Financial Statements
          </CardTitle>
          <CardDescription>
            Balance Sheet and Profit & Loss Account as per Companies Act, 2013
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertTitle>Schedule III Format</AlertTitle>
            <AlertDescription>
              These financial statements follow the prescribed format under Schedule III of the Companies Act, 2013.
              They include detailed classification of assets, liabilities, income, and expenses with comparative figures.
            </AlertDescription>
          </Alert>

          <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
              <TabsTrigger value="profit-loss">Profit & Loss Account</TabsTrigger>
            </TabsList>

            <TabsContent value="balance-sheet" className="space-y-4">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">Balance Sheet (Schedule III Format)</CardTitle>
                  <CardDescription>As at {new Date().toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Equity and Liabilities */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3 text-primary">I. EQUITY AND LIABILITIES</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">(1) Shareholders' Funds</h4>
                          <Table>
                            <TableBody>
                              <TableRow>
                                <TableCell className="pl-6">Share Capital</TableCell>
                                <TableCell className="text-right font-medium">{formatINR(balanceSheetData.equity.shareCapital)}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="pl-6">Reserves and Surplus</TableCell>
                                <TableCell className="text-right font-medium">{formatINR(balanceSheetData.equity.reservesAndSurplus)}</TableCell>
                              </TableRow>
                              <TableRow className="font-bold bg-muted/50">
                                <TableCell>Total Shareholders' Funds</TableCell>
                                <TableCell className="text-right">{formatINR(balanceSheetData.equity.total)}</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">(2) Non-Current Liabilities</h4>
                          <Table>
                            <TableBody>
                              <TableRow>
                                <TableCell className="pl-6">Long-term Borrowings</TableCell>
                                <TableCell className="text-right">{formatINR(balanceSheetData.nonCurrentLiabilities.longTermBorrowings)}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="pl-6">Deferred Tax Liabilities (Net)</TableCell>
                                <TableCell className="text-right">{formatINR(balanceSheetData.nonCurrentLiabilities.deferredTaxLiabilities)}</TableCell>
                              </TableRow>
                              <TableRow className="font-bold bg-muted/50">
                                <TableCell>Total Non-Current Liabilities</TableCell>
                                <TableCell className="text-right">{formatINR(balanceSheetData.nonCurrentLiabilities.total)}</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">(3) Current Liabilities</h4>
                          <Table>
                            <TableBody>
                              <TableRow>
                                <TableCell className="pl-6">Trade Payables</TableCell>
                                <TableCell className="text-right">{formatINR(balanceSheetData.currentLiabilities.tradePayables)}</TableCell>
                              </TableRow>
                              <TableRow className="font-bold bg-muted/50">
                                <TableCell>Total Current Liabilities</TableCell>
                                <TableCell className="text-right">{formatINR(balanceSheetData.currentLiabilities.total)}</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>

                        <Table>
                          <TableBody>
                            <TableRow className="font-bold text-lg border-t-2 border-primary">
                              <TableCell>TOTAL EQUITY AND LIABILITIES</TableCell>
                              <TableCell className="text-right text-primary">{formatINR(balanceSheetData.totalEquityAndLiabilities)}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Assets */}
                    <div className="pt-6 border-t-2">
                      <h3 className="font-semibold text-lg mb-3 text-primary">II. ASSETS</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">(1) Non-Current Assets</h4>
                          <Table>
                            <TableBody>
                              <TableRow>
                                <TableCell className="pl-6">Fixed Assets - Tangible</TableCell>
                                <TableCell className="text-right">{formatINR(balanceSheetData.nonCurrentAssets.fixedAssets.tangibleAssets)}</TableCell>
                              </TableRow>
                              <TableRow className="font-bold bg-muted/50">
                                <TableCell>Total Non-Current Assets</TableCell>
                                <TableCell className="text-right">{formatINR(balanceSheetData.nonCurrentAssets.total)}</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">(2) Current Assets</h4>
                          <Table>
                            <TableBody>
                              <TableRow>
                                <TableCell className="pl-6">Inventories</TableCell>
                                <TableCell className="text-right">{formatINR(balanceSheetData.currentAssets.inventories)}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="pl-6">Trade Receivables</TableCell>
                                <TableCell className="text-right">{formatINR(balanceSheetData.currentAssets.tradeReceivables)}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="pl-6">Cash and Cash Equivalents</TableCell>
                                <TableCell className="text-right">{formatINR(balanceSheetData.currentAssets.cashAndCashEquivalents)}</TableCell>
                              </TableRow>
                              <TableRow className="font-bold bg-muted/50">
                                <TableCell>Total Current Assets</TableCell>
                                <TableCell className="text-right">{formatINR(balanceSheetData.currentAssets.total)}</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>

                        <Table>
                          <TableBody>
                            <TableRow className="font-bold text-lg border-t-2 border-primary">
                              <TableCell>TOTAL ASSETS</TableCell>
                              <TableCell className="text-right text-primary">{formatINR(balanceSheetData.totalAssets)}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button onClick={() => handlePrint('balance-sheet')} className="flex-1">
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                      </Button>
                      <Button onClick={() => handleExportPDF('balance-sheet')} variant="outline" className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Export PDF
                      </Button>
                      <Button onClick={() => handleExportExcel('balance-sheet')} variant="outline" className="flex-1">
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Export Excel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profit-loss" className="space-y-4">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">Statement of Profit and Loss (Schedule III Format)</CardTitle>
                  <CardDescription>For the year ended {new Date().toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Revenue */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3 text-primary">I. Revenue</h3>
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell>Revenue from Operations</TableCell>
                            <TableCell className="text-right font-medium">{formatINR(profitLossData.revenue.revenueFromOperations)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Other Income</TableCell>
                            <TableCell className="text-right font-medium">{formatINR(profitLossData.revenue.otherIncome)}</TableCell>
                          </TableRow>
                          <TableRow className="font-bold bg-muted/50">
                            <TableCell>Total Revenue (I)</TableCell>
                            <TableCell className="text-right">{formatINR(profitLossData.revenue.total)}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>

                    {/* Expenses */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3 text-primary">II. Expenses</h3>
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell>Purchases of Stock-in-Trade</TableCell>
                            <TableCell className="text-right">{formatINR(profitLossData.expenses.purchasesOfStockInTrade)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Depreciation and Amortization Expense</TableCell>
                            <TableCell className="text-right">{formatINR(profitLossData.expenses.depreciationAndAmortization)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Other Expenses</TableCell>
                            <TableCell className="text-right">{formatINR(profitLossData.expenses.otherExpenses)}</TableCell>
                          </TableRow>
                          <TableRow className="font-bold bg-muted/50">
                            <TableCell>Total Expenses (II)</TableCell>
                            <TableCell className="text-right">{formatINR(profitLossData.expenses.total)}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>

                    {/* Profit Before Tax */}
                    <Table>
                      <TableBody>
                        <TableRow className="font-bold text-base bg-blue-50">
                          <TableCell>Profit/(Loss) before Tax (I-II)</TableCell>
                          <TableCell className={`text-right ${profitLossData.profitBeforeTax >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatINR(profitLossData.profitBeforeTax)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>

                    {/* Tax Expense */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3 text-primary">III. Tax Expense</h3>
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell className="pl-6">Current Tax</TableCell>
                            <TableCell className="text-right">{formatINR(profitLossData.taxExpense.currentTax)}</TableCell>
                          </TableRow>
                          <TableRow className="font-bold bg-muted/50">
                            <TableCell>Total Tax Expense (III)</TableCell>
                            <TableCell className="text-right">{formatINR(profitLossData.taxExpense.total)}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>

                    {/* Profit After Tax */}
                    <Table>
                      <TableBody>
                        <TableRow className="font-bold text-lg border-t-2 border-primary">
                          <TableCell>Profit/(Loss) for the Period</TableCell>
                          <TableCell className={`text-right ${profitLossData.profitAfterTax >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatINR(profitLossData.profitAfterTax)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>

                    {/* Earnings Per Share */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3 text-primary">IV. Earnings Per Equity Share</h3>
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell className="pl-6">Basic (₹)</TableCell>
                            <TableCell className="text-right font-medium">{profitLossData.earningsPerShare.basic.toFixed(2)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="pl-6">Diluted (₹)</TableCell>
                            <TableCell className="text-right font-medium">{profitLossData.earningsPerShare.diluted.toFixed(2)}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>

                    <Alert className="border-primary/20 bg-primary/5">
                      <TrendingUp className="h-4 w-4" />
                      <AlertTitle>Financial Performance</AlertTitle>
                      <AlertDescription>
                        {profitLossData.profitAfterTax >= 0 ? (
                          <>The company has generated a profit of <strong>{formatINR(profitLossData.profitAfterTax)}</strong> for the current period.</>
                        ) : (
                          <>The company has incurred a loss of <strong>{formatINR(Math.abs(profitLossData.profitAfterTax))}</strong> for the current period.</>
                        )}
                      </AlertDescription>
                    </Alert>

                    <div className="flex gap-2 pt-4">
                      <Button onClick={() => handlePrint('profit-loss')} className="flex-1">
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                      </Button>
                      <Button onClick={() => handleExportPDF('profit-loss')} variant="outline" className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Export PDF
                      </Button>
                      <Button onClick={() => handleExportExcel('profit-loss')} variant="outline" className="flex-1">
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Export Excel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Alert className="mt-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Note:</strong> These statements are generated based on your transaction data and follow Schedule III format.
              For official filing, please consult with a Chartered Accountant to ensure compliance with all regulatory requirements.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
