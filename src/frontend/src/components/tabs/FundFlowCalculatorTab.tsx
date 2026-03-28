import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowRightLeft,
  Calculator,
  Info,
  Printer,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatINR } from "../../lib/formatters";
import FundFlowChart from "../fund-flow/FundFlowChart";

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

export default function FundFlowCalculatorTab() {
  const [fundFlowRecords, setFundFlowRecords] = useState<FundFlowData[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  const [sources, setSources] = useState({
    capitalIntroduced: "",
    loansReceived: "",
    retainedEarnings: "",
    assetSales: "",
    otherSources: "",
  });

  const [applications, setApplications] = useState({
    assetPurchases: "",
    loanRepayments: "",
    dividendsPaid: "",
    operatingExpenses: "",
    otherApplications: "",
  });

  const [workingCapital, setWorkingCapital] = useState({
    currentAssetsIncrease: "",
    currentLiabilitiesIncrease: "",
  });

  const calculateFundFlow = () => {
    setIsCalculating(true);

    const sourcesData = {
      capitalIntroduced: Number.parseFloat(sources.capitalIntroduced) || 0,
      loansReceived: Number.parseFloat(sources.loansReceived) || 0,
      retainedEarnings: Number.parseFloat(sources.retainedEarnings) || 0,
      assetSales: Number.parseFloat(sources.assetSales) || 0,
      otherSources: Number.parseFloat(sources.otherSources) || 0,
    };

    const applicationsData = {
      assetPurchases: Number.parseFloat(applications.assetPurchases) || 0,
      loanRepayments: Number.parseFloat(applications.loanRepayments) || 0,
      dividendsPaid: Number.parseFloat(applications.dividendsPaid) || 0,
      operatingExpenses: Number.parseFloat(applications.operatingExpenses) || 0,
      otherApplications: Number.parseFloat(applications.otherApplications) || 0,
    };

    const currentAssetsIncrease =
      Number.parseFloat(workingCapital.currentAssetsIncrease) || 0;
    const currentLiabilitiesIncrease =
      Number.parseFloat(workingCapital.currentLiabilitiesIncrease) || 0;
    const netWorkingCapitalChange =
      currentAssetsIncrease - currentLiabilitiesIncrease;

    const newRecord: FundFlowData = {
      id: Date.now().toString(),
      date: new Date(),
      sourcesOfFunds: sourcesData,
      applicationOfFunds: applicationsData,
      workingCapitalChanges: {
        currentAssetsIncrease,
        currentLiabilitiesIncrease,
        netWorkingCapitalChange,
      },
    };

    setFundFlowRecords([newRecord, ...fundFlowRecords]);

    // Reset form
    setSources({
      capitalIntroduced: "",
      loansReceived: "",
      retainedEarnings: "",
      assetSales: "",
      otherSources: "",
    });
    setApplications({
      assetPurchases: "",
      loanRepayments: "",
      dividendsPaid: "",
      operatingExpenses: "",
      otherApplications: "",
    });
    setWorkingCapital({
      currentAssetsIncrease: "",
      currentLiabilitiesIncrease: "",
    });

    setIsCalculating(false);
    toast.success("Fund flow statement generated successfully");
  };

  const handlePrint = (record: FundFlowData) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow popups to print reports");
      return;
    }

    const reportHTML = generateFundFlowReportHTML(record);
    printWindow.document.write(reportHTML);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
    toast.success("Opening print dialog...");
  };

  const generateFundFlowReportHTML = (record: FundFlowData) => {
    const totalSources = Object.values(record.sourcesOfFunds).reduce(
      (sum, val) => sum + val,
      0,
    );
    const totalApplications = Object.values(record.applicationOfFunds).reduce(
      (sum, val) => sum + val,
      0,
    );
    const netFundFlow = totalSources - totalApplications;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Fund Flow Statement</title>
        <meta charset="UTF-8">
        <style>
          @page { size: A4; margin: 15mm; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 11pt;
            line-height: 1.5;
            color: #333;
            padding: 10mm;
          }
          .report-header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 15px;
            border-bottom: 3px solid #2563eb;
          }
          .report-title {
            font-size: 22pt;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
          }
          .section {
            margin: 25px 0;
          }
          .section-title {
            font-size: 14pt;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 15px;
            padding-bottom: 5px;
            border-bottom: 2px solid #e2e8f0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
          }
          td {
            padding: 8px;
            border-bottom: 1px solid #e2e8f0;
          }
          .text-right { text-align: right; }
          .font-bold { font-weight: bold; }
          .total-row {
            background-color: #f1f5f9;
            font-weight: bold;
          }
          .footer {
            margin-top: 40px;
            padding-top: 15px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            font-size: 9pt;
            color: #64748b;
          }
        </style>
      </head>
      <body>
        <div class="report-header">
          <div class="report-title">Fund Flow Statement</div>
          <div>For the period ending ${record.date.toLocaleDateString()}</div>
        </div>
        
        <div class="section">
          <div class="section-title">Sources of Funds</div>
          <table>
            <tr>
              <td>Capital Introduced</td>
              <td class="text-right">${formatINR(record.sourcesOfFunds.capitalIntroduced)}</td>
            </tr>
            <tr>
              <td>Loans Received</td>
              <td class="text-right">${formatINR(record.sourcesOfFunds.loansReceived)}</td>
            </tr>
            <tr>
              <td>Retained Earnings</td>
              <td class="text-right">${formatINR(record.sourcesOfFunds.retainedEarnings)}</td>
            </tr>
            <tr>
              <td>Asset Sales</td>
              <td class="text-right">${formatINR(record.sourcesOfFunds.assetSales)}</td>
            </tr>
            <tr>
              <td>Other Sources</td>
              <td class="text-right">${formatINR(record.sourcesOfFunds.otherSources)}</td>
            </tr>
            <tr class="total-row">
              <td>Total Sources</td>
              <td class="text-right">${formatINR(totalSources)}</td>
            </tr>
          </table>
        </div>

        <div class="section">
          <div class="section-title">Application of Funds</div>
          <table>
            <tr>
              <td>Asset Purchases</td>
              <td class="text-right">${formatINR(record.applicationOfFunds.assetPurchases)}</td>
            </tr>
            <tr>
              <td>Loan Repayments</td>
              <td class="text-right">${formatINR(record.applicationOfFunds.loanRepayments)}</td>
            </tr>
            <tr>
              <td>Dividends Paid</td>
              <td class="text-right">${formatINR(record.applicationOfFunds.dividendsPaid)}</td>
            </tr>
            <tr>
              <td>Operating Expenses</td>
              <td class="text-right">${formatINR(record.applicationOfFunds.operatingExpenses)}</td>
            </tr>
            <tr>
              <td>Other Applications</td>
              <td class="text-right">${formatINR(record.applicationOfFunds.otherApplications)}</td>
            </tr>
            <tr class="total-row">
              <td>Total Applications</td>
              <td class="text-right">${formatINR(totalApplications)}</td>
            </tr>
          </table>
        </div>

        <div class="section">
          <div class="section-title">Working Capital Changes</div>
          <table>
            <tr>
              <td>Increase in Current Assets</td>
              <td class="text-right">${formatINR(record.workingCapitalChanges.currentAssetsIncrease)}</td>
            </tr>
            <tr>
              <td>Increase in Current Liabilities</td>
              <td class="text-right">${formatINR(record.workingCapitalChanges.currentLiabilitiesIncrease)}</td>
            </tr>
            <tr class="total-row">
              <td>Net Working Capital Change</td>
              <td class="text-right">${formatINR(record.workingCapitalChanges.netWorkingCapitalChange)}</td>
            </tr>
          </table>
        </div>

        <div class="section">
          <table>
            <tr class="total-row" style="background-color: #dbeafe; font-size: 12pt;">
              <td>Net Fund Flow</td>
              <td class="text-right" style="color: ${netFundFlow >= 0 ? "#16a34a" : "#dc2626"};">
                ${formatINR(netFundFlow)}
              </td>
            </tr>
          </table>
        </div>
        
        <div class="footer">
          <p>© 2026. Built with love using <a href="https://caffeine.ai" style="color: #2563eb; text-decoration: none;">caffeine.ai</a></p>
        </div>
      </body>
      </html>
    `;
  };

  const latestRecord = fundFlowRecords[0];
  const totalSources = latestRecord
    ? Object.values(latestRecord.sourcesOfFunds).reduce(
        (sum, val) => sum + val,
        0,
      )
    : 0;
  const totalApplications = latestRecord
    ? Object.values(latestRecord.applicationOfFunds).reduce(
        (sum, val) => sum + val,
        0,
      )
    : 0;
  const netFundFlow = totalSources - totalApplications;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ArrowRightLeft className="h-8 w-8" />
            Fund Flow Calculator
          </h2>
          <p className="text-muted-foreground">
            Analyze sources and applications of funds with working capital
            changes and visual charts
          </p>
        </div>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Fund Flow Statement</AlertTitle>
        <AlertDescription>
          A fund flow statement shows the movement of funds into and out of a
          business, including changes in working capital. It helps analyze how
          funds were sourced and where they were applied during a specific
          period.
        </AlertDescription>
      </Alert>

      {fundFlowRecords.length > 0 && (
        <FundFlowChart records={fundFlowRecords} />
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Sources of Funds
            </CardTitle>
            <CardDescription>Where funds came from</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="capitalIntroduced">Capital Introduced (₹)</Label>
              <Input
                id="capitalIntroduced"
                type="number"
                placeholder="0"
                value={sources.capitalIntroduced}
                onChange={(e) =>
                  setSources({ ...sources, capitalIntroduced: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loansReceived">Loans Received (₹)</Label>
              <Input
                id="loansReceived"
                type="number"
                placeholder="0"
                value={sources.loansReceived}
                onChange={(e) =>
                  setSources({ ...sources, loansReceived: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="retainedEarnings">Retained Earnings (₹)</Label>
              <Input
                id="retainedEarnings"
                type="number"
                placeholder="0"
                value={sources.retainedEarnings}
                onChange={(e) =>
                  setSources({ ...sources, retainedEarnings: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assetSales">Asset Sales (₹)</Label>
              <Input
                id="assetSales"
                type="number"
                placeholder="0"
                value={sources.assetSales}
                onChange={(e) =>
                  setSources({ ...sources, assetSales: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="otherSources">Other Sources (₹)</Label>
              <Input
                id="otherSources"
                type="number"
                placeholder="0"
                value={sources.otherSources}
                onChange={(e) =>
                  setSources({ ...sources, otherSources: e.target.value })
                }
              />
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
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="assetPurchases">Asset Purchases (₹)</Label>
              <Input
                id="assetPurchases"
                type="number"
                placeholder="0"
                value={applications.assetPurchases}
                onChange={(e) =>
                  setApplications({
                    ...applications,
                    assetPurchases: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loanRepayments">Loan Repayments (₹)</Label>
              <Input
                id="loanRepayments"
                type="number"
                placeholder="0"
                value={applications.loanRepayments}
                onChange={(e) =>
                  setApplications({
                    ...applications,
                    loanRepayments: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dividendsPaid">Dividends Paid (₹)</Label>
              <Input
                id="dividendsPaid"
                type="number"
                placeholder="0"
                value={applications.dividendsPaid}
                onChange={(e) =>
                  setApplications({
                    ...applications,
                    dividendsPaid: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="operatingExpenses">Operating Expenses (₹)</Label>
              <Input
                id="operatingExpenses"
                type="number"
                placeholder="0"
                value={applications.operatingExpenses}
                onChange={(e) =>
                  setApplications({
                    ...applications,
                    operatingExpenses: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="otherApplications">Other Applications (₹)</Label>
              <Input
                id="otherApplications"
                type="number"
                placeholder="0"
                value={applications.otherApplications}
                onChange={(e) =>
                  setApplications({
                    ...applications,
                    otherApplications: e.target.value,
                  })
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Working Capital Changes</CardTitle>
          <CardDescription>
            Changes in current assets and liabilities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="currentAssetsIncrease">
                Increase in Current Assets (₹)
              </Label>
              <Input
                id="currentAssetsIncrease"
                type="number"
                placeholder="0"
                value={workingCapital.currentAssetsIncrease}
                onChange={(e) =>
                  setWorkingCapital({
                    ...workingCapital,
                    currentAssetsIncrease: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentLiabilitiesIncrease">
                Increase in Current Liabilities (₹)
              </Label>
              <Input
                id="currentLiabilitiesIncrease"
                type="number"
                placeholder="0"
                value={workingCapital.currentLiabilitiesIncrease}
                onChange={(e) =>
                  setWorkingCapital({
                    ...workingCapital,
                    currentLiabilitiesIncrease: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <Button
            onClick={calculateFundFlow}
            disabled={isCalculating}
            className="w-full"
          >
            <Calculator className="h-4 w-4 mr-2" />
            {isCalculating ? "Calculating..." : "Generate Fund Flow Statement"}
          </Button>
        </CardContent>
      </Card>

      {latestRecord && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Fund Flow Statement</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePrint(latestRecord)}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </CardTitle>
            <CardDescription>
              Generated on {latestRecord.date.toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3 text-green-600">
                  Sources of Funds
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Capital Introduced</span>
                    <span className="font-medium">
                      {formatINR(latestRecord.sourcesOfFunds.capitalIntroduced)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Loans Received</span>
                    <span className="font-medium">
                      {formatINR(latestRecord.sourcesOfFunds.loansReceived)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Retained Earnings</span>
                    <span className="font-medium">
                      {formatINR(latestRecord.sourcesOfFunds.retainedEarnings)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Asset Sales</span>
                    <span className="font-medium">
                      {formatINR(latestRecord.sourcesOfFunds.assetSales)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other Sources</span>
                    <span className="font-medium">
                      {formatINR(latestRecord.sourcesOfFunds.otherSources)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-bold">
                    <span>Total Sources</span>
                    <span>{formatINR(totalSources)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 text-red-600">
                  Application of Funds
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Asset Purchases</span>
                    <span className="font-medium">
                      {formatINR(
                        latestRecord.applicationOfFunds.assetPurchases,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Loan Repayments</span>
                    <span className="font-medium">
                      {formatINR(
                        latestRecord.applicationOfFunds.loanRepayments,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dividends Paid</span>
                    <span className="font-medium">
                      {formatINR(latestRecord.applicationOfFunds.dividendsPaid)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Operating Expenses</span>
                    <span className="font-medium">
                      {formatINR(
                        latestRecord.applicationOfFunds.operatingExpenses,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other Applications</span>
                    <span className="font-medium">
                      {formatINR(
                        latestRecord.applicationOfFunds.otherApplications,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-bold">
                    <span>Total Applications</span>
                    <span>{formatINR(totalApplications)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Working Capital Changes</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Increase in Current Assets</span>
                    <span className="font-medium">
                      {formatINR(
                        latestRecord.workingCapitalChanges
                          .currentAssetsIncrease,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Increase in Current Liabilities</span>
                    <span className="font-medium">
                      {formatINR(
                        latestRecord.workingCapitalChanges
                          .currentLiabilitiesIncrease,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-bold">
                    <span>Net Working Capital Change</span>
                    <span>
                      {formatINR(
                        latestRecord.workingCapitalChanges
                          .netWorkingCapitalChange,
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Net Fund Flow</span>
                  <span
                    className={
                      netFundFlow >= 0 ? "text-green-600" : "text-red-600"
                    }
                  >
                    {formatINR(netFundFlow)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {fundFlowRecords.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Historical Fund Flow Statements</CardTitle>
            <CardDescription>Previous fund flow calculations</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Total Sources</TableHead>
                  <TableHead className="text-right">
                    Total Applications
                  </TableHead>
                  <TableHead className="text-right">Net Fund Flow</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fundFlowRecords.slice(1).map((record) => {
                  const sources = Object.values(record.sourcesOfFunds).reduce(
                    (sum, val) => sum + val,
                    0,
                  );
                  const applications = Object.values(
                    record.applicationOfFunds,
                  ).reduce((sum, val) => sum + val, 0);
                  const net = sources - applications;

                  return (
                    <TableRow key={record.id}>
                      <TableCell>{record.date.toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        {formatINR(sources)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatINR(applications)}
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${net >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {formatINR(net)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePrint(record)}
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
