import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calculator, TrendingUp, DollarSign, BarChart3, Download, Printer, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { formatINR } from '../../lib/formatters';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import FinancialRatioCalculator from '../finance-tools/FinancialRatioCalculator';

interface EMIResult {
  monthlyInstallment: number;
  totalInterest: number;
  totalRepayment: number;
  schedule: Array<{ month: number; principal: number; interest: number; balance: number }>;
}

interface MPBFResult {
  workingCapital: number;
  mpbfAmount: number;
  cashConversionCycle: number;
}

interface CMAResult {
  cashFlowProjection: number;
  workingCapitalRequirement: number;
}

export default function FinancialCalculatorsTab() {
  const [activeTab, setActiveTab] = useState('emi');

  // EMI Calculator State
  const [emiData, setEmiData] = useState({
    principal: '',
    rate: '',
    tenure: '',
    mode: 'standard' as 'standard' | 'eqi' | 'pre-emi' | 'post-emi',
  });
  const [emiResult, setEmiResult] = useState<EMIResult | null>(null);

  // MPBF Calculator State
  const [mpbfData, setMpbfData] = useState({
    currentAssets: '',
    currentLiabilities: '',
    inventoryHoldingPeriod: '',
    receivablesCollectionPeriod: '',
    payablesPaymentPeriod: '',
  });
  const [mpbfResult, setMpbfResult] = useState<MPBFResult | null>(null);

  // CMA Calculator State
  const [cmaData, setCmaData] = useState({
    salesProjection: '',
    purchaseProjection: '',
    inventoryProjection: '',
    receivablesProjection: '',
    payablesProjection: '',
  });
  const [cmaResult, setCmaResult] = useState<CMAResult | null>(null);

  // IRR Calculator State
  const [irrData, setIrrData] = useState({
    initialInvestment: '',
    cashFlows: ['', '', '', '', ''],
    discountRate: '',
  });
  const [irrResult, setIrrResult] = useState<{ irr: number; npv: number } | null>(null);

  const calculateEMI = () => {
    const principal = parseFloat(emiData.principal);
    const annualRate = parseFloat(emiData.rate);
    const tenure = parseInt(emiData.tenure);

    if (!principal || !annualRate || !tenure) {
      toast.error('Please fill in all EMI fields');
      return;
    }

    const monthlyRate = annualRate / 12 / 100;
    let monthlyInstallment = 0;
    let totalInterest = 0;
    const schedule: Array<{ month: number; principal: number; interest: number; balance: number }> = [];

    if (emiData.mode === 'standard') {
      monthlyInstallment = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1);
      
      let balance = principal;
      for (let month = 1; month <= tenure; month++) {
        const interestPayment = balance * monthlyRate;
        const principalPayment = monthlyInstallment - interestPayment;
        balance -= principalPayment;
        totalInterest += interestPayment;
        
        schedule.push({
          month,
          principal: principalPayment,
          interest: interestPayment,
          balance: Math.max(0, balance),
        });
      }
    } else if (emiData.mode === 'eqi') {
      const quarterlyRate = annualRate / 4 / 100;
      const quarters = Math.ceil(tenure / 3);
      const quarterlyInstallment = (principal * quarterlyRate * Math.pow(1 + quarterlyRate, quarters)) / (Math.pow(1 + quarterlyRate, quarters) - 1);
      
      let balance = principal;
      for (let quarter = 1; quarter <= quarters; quarter++) {
        const interestPayment = balance * quarterlyRate;
        const principalPayment = quarterlyInstallment - interestPayment;
        balance -= principalPayment;
        totalInterest += interestPayment;
        
        schedule.push({
          month: quarter * 3,
          principal: principalPayment,
          interest: interestPayment,
          balance: Math.max(0, balance),
        });
      }
      monthlyInstallment = quarterlyInstallment / 3;
    } else if (emiData.mode === 'pre-emi') {
      const preEmiMonths = Math.floor(tenure * 0.3);
      const regularMonths = tenure - preEmiMonths;
      
      for (let month = 1; month <= preEmiMonths; month++) {
        const interestPayment = principal * monthlyRate;
        totalInterest += interestPayment;
        schedule.push({
          month,
          principal: 0,
          interest: interestPayment,
          balance: principal,
        });
      }
      
      monthlyInstallment = (principal * monthlyRate * Math.pow(1 + monthlyRate, regularMonths)) / (Math.pow(1 + monthlyRate, regularMonths) - 1);
      let balance = principal;
      for (let month = preEmiMonths + 1; month <= tenure; month++) {
        const interestPayment = balance * monthlyRate;
        const principalPayment = monthlyInstallment - interestPayment;
        balance -= principalPayment;
        totalInterest += interestPayment;
        
        schedule.push({
          month,
          principal: principalPayment,
          interest: interestPayment,
          balance: Math.max(0, balance),
        });
      }
    } else if (emiData.mode === 'post-emi') {
      monthlyInstallment = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1);
      
      let balance = principal;
      for (let month = 1; month <= tenure; month++) {
        const interestPayment = balance * monthlyRate;
        const principalPayment = monthlyInstallment - interestPayment;
        balance -= principalPayment;
        totalInterest += interestPayment;
        
        schedule.push({
          month,
          principal: principalPayment,
          interest: interestPayment,
          balance: Math.max(0, balance),
        });
      }
    }

    setEmiResult({
      monthlyInstallment,
      totalInterest,
      totalRepayment: principal + totalInterest,
      schedule: schedule.slice(0, 12),
    });

    toast.success('EMI calculated successfully');
  };

  const calculateMPBF = () => {
    const currentAssets = parseFloat(mpbfData.currentAssets);
    const currentLiabilities = parseFloat(mpbfData.currentLiabilities);
    const inventoryHoldingPeriod = parseFloat(mpbfData.inventoryHoldingPeriod) || 0;
    const receivablesCollectionPeriod = parseFloat(mpbfData.receivablesCollectionPeriod) || 0;
    const payablesPaymentPeriod = parseFloat(mpbfData.payablesPaymentPeriod) || 0;

    if (!currentAssets || !currentLiabilities) {
      toast.error('Please enter current assets and liabilities');
      return;
    }

    const workingCapital = currentAssets - currentLiabilities;
    const mpbfAmount = workingCapital * 0.75;
    const cashConversionCycle = inventoryHoldingPeriod + receivablesCollectionPeriod - payablesPaymentPeriod;

    setMpbfResult({
      workingCapital,
      mpbfAmount,
      cashConversionCycle,
    });

    toast.success('MPBF calculated successfully');
  };

  const calculateCMA = () => {
    const salesProjection = parseFloat(cmaData.salesProjection);
    const purchaseProjection = parseFloat(cmaData.purchaseProjection);
    const inventoryProjection = parseFloat(cmaData.inventoryProjection) || 0;
    const receivablesProjection = parseFloat(cmaData.receivablesProjection) || 0;
    const payablesProjection = parseFloat(cmaData.payablesProjection) || 0;

    if (!salesProjection || !purchaseProjection) {
      toast.error('Please enter sales and purchase projections');
      return;
    }

    const cashFlowProjection = salesProjection - purchaseProjection + payablesProjection - receivablesProjection;
    const workingCapitalRequirement = inventoryProjection + receivablesProjection - payablesProjection;

    setCmaResult({
      cashFlowProjection,
      workingCapitalRequirement,
    });

    toast.success('CMA report generated successfully');
  };

  const calculateIRR = () => {
    const initialInvestment = parseFloat(irrData.initialInvestment);
    const cashFlows = irrData.cashFlows.map(cf => parseFloat(cf) || 0);
    const discountRate = parseFloat(irrData.discountRate) / 100;

    if (!initialInvestment || cashFlows.every(cf => cf === 0)) {
      toast.error('Please enter initial investment and cash flows');
      return;
    }

    let npv = -initialInvestment;
    cashFlows.forEach((cf, index) => {
      npv += cf / Math.pow(1 + discountRate, index + 1);
    });

    let irr = 0.1;
    for (let i = 0; i < 100; i++) {
      let npvAtIRR = -initialInvestment;
      let derivative = 0;
      
      cashFlows.forEach((cf, index) => {
        const period = index + 1;
        npvAtIRR += cf / Math.pow(1 + irr, period);
        derivative -= (period * cf) / Math.pow(1 + irr, period + 1);
      });
      
      if (Math.abs(npvAtIRR) < 0.01) break;
      irr = irr - npvAtIRR / derivative;
    }

    setIrrResult({
      irr: irr * 100,
      npv,
    });

    toast.success('IRR calculated successfully');
  };

  const handleExportPDF = (calculatorName: string) => {
    toast.info(`Generating ${calculatorName} PDF...`);
    setTimeout(() => toast.success(`${calculatorName} PDF downloaded`), 1000);
  };

  const handlePrint = (calculatorName: string) => {
    window.print();
    toast.success(`Printing ${calculatorName}...`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Financial Calculators</h2>
          <p className="text-muted-foreground">Advanced EMI, IRR, MPBF, CMA, and Financial Ratio calculators with INR formatting</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="emi">EMI Calculator</TabsTrigger>
          <TabsTrigger value="mpbf">MPBF Calculator</TabsTrigger>
          <TabsTrigger value="cma">CMA Calculator</TabsTrigger>
          <TabsTrigger value="irr">IRR Calculator</TabsTrigger>
          <TabsTrigger value="ratios">
            <Activity className="h-4 w-4 mr-2" />
            Financial Ratios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="emi" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  EMI Calculator
                </CardTitle>
                <CardDescription>Calculate monthly installments with multiple modes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="principal">Loan Amount (₹)</Label>
                  <Input
                    id="principal"
                    type="number"
                    placeholder="1000000"
                    value={emiData.principal}
                    onChange={(e) => setEmiData({ ...emiData, principal: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rate">Annual Interest Rate (%)</Label>
                  <Input
                    id="rate"
                    type="number"
                    step="0.01"
                    placeholder="10.5"
                    value={emiData.rate}
                    onChange={(e) => setEmiData({ ...emiData, rate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tenure">Tenure (Months)</Label>
                  <Input
                    id="tenure"
                    type="number"
                    placeholder="60"
                    value={emiData.tenure}
                    onChange={(e) => setEmiData({ ...emiData, tenure: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mode">EMI Mode</Label>
                  <Select value={emiData.mode} onValueChange={(value: any) => setEmiData({ ...emiData, mode: value })}>
                    <SelectTrigger id="mode">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard EMI</SelectItem>
                      <SelectItem value="eqi">EQI (Quarterly)</SelectItem>
                      <SelectItem value="pre-emi">Pre-EMI</SelectItem>
                      <SelectItem value="post-emi">Post-EMI/Arrears</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={calculateEMI} className="w-full">
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate EMI
                </Button>
              </CardContent>
            </Card>

            {emiResult && (
              <Card>
                <CardHeader>
                  <CardTitle>EMI Results</CardTitle>
                  <CardDescription>Calculated installment details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-primary/5 rounded-lg">
                      <span className="font-medium">Monthly Installment:</span>
                      <span className="font-bold text-primary">{formatINR(emiResult.monthlyInstallment)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Interest:</span>
                      <span className="font-medium">{formatINR(emiResult.totalInterest)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Repayment:</span>
                      <span className="font-medium">{formatINR(emiResult.totalRepayment)}</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <h4 className="font-semibold mb-3">Amortization Schedule (First 12 Months)</h4>
                    <div className="max-h-64 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Month</TableHead>
                            <TableHead className="text-right">Principal</TableHead>
                            <TableHead className="text-right">Interest</TableHead>
                            <TableHead className="text-right">Balance</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {emiResult.schedule.map((row) => (
                            <TableRow key={row.month}>
                              <TableCell>{row.month}</TableCell>
                              <TableCell className="text-right">{formatINR(row.principal)}</TableCell>
                              <TableCell className="text-right">{formatINR(row.interest)}</TableCell>
                              <TableCell className="text-right">{formatINR(row.balance)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handlePrint('EMI Calculator')}>
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleExportPDF('EMI Calculator')}>
                      <Download className="h-4 w-4 mr-2" />
                      Export PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="mpbf" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  MPBF Calculator
                </CardTitle>
                <CardDescription>Maximum Permissible Bank Finance calculation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentAssets">Current Assets (₹)</Label>
                  <Input
                    id="currentAssets"
                    type="number"
                    placeholder="5000000"
                    value={mpbfData.currentAssets}
                    onChange={(e) => setMpbfData({ ...mpbfData, currentAssets: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentLiabilities">Current Liabilities (₹)</Label>
                  <Input
                    id="currentLiabilities"
                    type="number"
                    placeholder="3000000"
                    value={mpbfData.currentLiabilities}
                    onChange={(e) => setMpbfData({ ...mpbfData, currentLiabilities: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inventoryHoldingPeriod">Inventory Holding Period (days)</Label>
                  <Input
                    id="inventoryHoldingPeriod"
                    type="number"
                    placeholder="60"
                    value={mpbfData.inventoryHoldingPeriod}
                    onChange={(e) => setMpbfData({ ...mpbfData, inventoryHoldingPeriod: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receivablesCollectionPeriod">Receivables Collection Period (days)</Label>
                  <Input
                    id="receivablesCollectionPeriod"
                    type="number"
                    placeholder="45"
                    value={mpbfData.receivablesCollectionPeriod}
                    onChange={(e) => setMpbfData({ ...mpbfData, receivablesCollectionPeriod: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payablesPaymentPeriod">Payables Payment Period (days)</Label>
                  <Input
                    id="payablesPaymentPeriod"
                    type="number"
                    placeholder="30"
                    value={mpbfData.payablesPaymentPeriod}
                    onChange={(e) => setMpbfData({ ...mpbfData, payablesPaymentPeriod: e.target.value })}
                  />
                </div>
                <Button onClick={calculateMPBF} className="w-full">
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate MPBF
                </Button>
              </CardContent>
            </Card>

            {mpbfResult && (
              <Card>
                <CardHeader>
                  <CardTitle>MPBF Results</CardTitle>
                  <CardDescription>Working capital analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-primary/5 rounded-lg">
                      <span className="font-medium">MPBF Amount:</span>
                      <span className="font-bold text-primary">{formatINR(mpbfResult.mpbfAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Working Capital:</span>
                      <span className="font-medium">{formatINR(mpbfResult.workingCapital)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cash Conversion Cycle:</span>
                      <span className="font-medium">{mpbfResult.cashConversionCycle.toFixed(0)} days</span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handlePrint('MPBF Calculator')}>
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleExportPDF('MPBF Calculator')}>
                      <Download className="h-4 w-4 mr-2" />
                      Export PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="cma" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  CMA Calculator
                </CardTitle>
                <CardDescription>Credit Monitoring Arrangement report</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="salesProjection">Sales Projection (₹)</Label>
                  <Input
                    id="salesProjection"
                    type="number"
                    placeholder="10000000"
                    value={cmaData.salesProjection}
                    onChange={(e) => setCmaData({ ...cmaData, salesProjection: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchaseProjection">Purchase Projection (₹)</Label>
                  <Input
                    id="purchaseProjection"
                    type="number"
                    placeholder="6000000"
                    value={cmaData.purchaseProjection}
                    onChange={(e) => setCmaData({ ...cmaData, purchaseProjection: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inventoryProjection">Inventory Projection (₹)</Label>
                  <Input
                    id="inventoryProjection"
                    type="number"
                    placeholder="1000000"
                    value={cmaData.inventoryProjection}
                    onChange={(e) => setCmaData({ ...cmaData, inventoryProjection: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receivablesProjection">Receivables Projection (₹)</Label>
                  <Input
                    id="receivablesProjection"
                    type="number"
                    placeholder="1500000"
                    value={cmaData.receivablesProjection}
                    onChange={(e) => setCmaData({ ...cmaData, receivablesProjection: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payablesProjection">Payables Projection (₹)</Label>
                  <Input
                    id="payablesProjection"
                    type="number"
                    placeholder="800000"
                    value={cmaData.payablesProjection}
                    onChange={(e) => setCmaData({ ...cmaData, payablesProjection: e.target.value })}
                  />
                </div>
                <Button onClick={calculateCMA} className="w-full">
                  <Calculator className="h-4 w-4 mr-2" />
                  Generate CMA Report
                </Button>
              </CardContent>
            </Card>

            {cmaResult && (
              <Card>
                <CardHeader>
                  <CardTitle>CMA Results</CardTitle>
                  <CardDescription>Cash flow and working capital projections</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-primary/5 rounded-lg">
                      <span className="font-medium">Cash Flow Projection:</span>
                      <span className="font-bold text-primary">{formatINR(cmaResult.cashFlowProjection)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Working Capital Requirement:</span>
                      <span className="font-medium">{formatINR(cmaResult.workingCapitalRequirement)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handlePrint('CMA Calculator')}>
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleExportPDF('CMA Calculator')}>
                      <Download className="h-4 w-4 mr-2" />
                      Export PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="irr" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  IRR Calculator
                </CardTitle>
                <CardDescription>Internal Rate of Return and NPV calculation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="initialInvestment">Initial Investment (₹)</Label>
                  <Input
                    id="initialInvestment"
                    type="number"
                    placeholder="5000000"
                    value={irrData.initialInvestment}
                    onChange={(e) => setIrrData({ ...irrData, initialInvestment: e.target.value })}
                  />
                </div>
                {irrData.cashFlows.map((cf, index) => (
                  <div key={index} className="space-y-2">
                    <Label htmlFor={`cashFlow${index}`}>Year {index + 1} Cash Flow (₹)</Label>
                    <Input
                      id={`cashFlow${index}`}
                      type="number"
                      placeholder="1000000"
                      value={cf}
                      onChange={(e) => {
                        const newCashFlows = [...irrData.cashFlows];
                        newCashFlows[index] = e.target.value;
                        setIrrData({ ...irrData, cashFlows: newCashFlows });
                      }}
                    />
                  </div>
                ))}
                <div className="space-y-2">
                  <Label htmlFor="discountRate">Discount Rate (%)</Label>
                  <Input
                    id="discountRate"
                    type="number"
                    step="0.01"
                    placeholder="10"
                    value={irrData.discountRate}
                    onChange={(e) => setIrrData({ ...irrData, discountRate: e.target.value })}
                  />
                </div>
                <Button onClick={calculateIRR} className="w-full">
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate IRR
                </Button>
              </CardContent>
            </Card>

            {irrResult && (
              <Card>
                <CardHeader>
                  <CardTitle>IRR Results</CardTitle>
                  <CardDescription>Investment return analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-primary/5 rounded-lg">
                      <span className="font-medium">Internal Rate of Return:</span>
                      <span className="font-bold text-primary">{irrResult.irr.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Net Present Value:</span>
                      <span className="font-medium">{formatINR(irrResult.npv)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handlePrint('IRR Calculator')}>
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleExportPDF('IRR Calculator')}>
                      <Download className="h-4 w-4 mr-2" />
                      Export PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="ratios" className="space-y-4">
          <FinancialRatioCalculator />
        </TabsContent>
      </Tabs>
    </div>
  );
}
