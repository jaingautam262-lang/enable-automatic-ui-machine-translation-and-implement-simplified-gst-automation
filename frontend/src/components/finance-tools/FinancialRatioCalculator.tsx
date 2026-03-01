import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calculator, TrendingUp, DollarSign, Activity, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { formatINR } from '../../lib/formatters';

interface LiquidityRatios {
  currentRatio: number;
  quickRatio: number;
  cashRatio: number;
  workingCapital: number;
}

interface ProfitabilityRatios {
  grossMargin: number;
  netMargin: number;
  operatingMargin: number;
  roa: number;
  roe: number;
}

interface LeverageRatios {
  debtToEquity: number;
  debtRatio: number;
  interestCoverage: number;
}

interface EfficiencyRatios {
  inventoryTurnover: number;
  receivableTurnover: number;
  assetTurnover: number;
}

export default function FinancialRatioCalculator() {
  // Liquidity inputs
  const [liquidityInputs, setLiquidityInputs] = useState({
    currentAssets: '',
    currentLiabilities: '',
    inventory: '',
    cash: '',
  });
  const [liquidityResults, setLiquidityResults] = useState<LiquidityRatios | null>(null);

  // Profitability inputs
  const [profitabilityInputs, setProfitabilityInputs] = useState({
    revenue: '',
    cogs: '',
    operatingExpenses: '',
    netIncome: '',
    totalAssets: '',
    equity: '',
  });
  const [profitabilityResults, setProfitabilityResults] = useState<ProfitabilityRatios | null>(null);

  // Leverage inputs
  const [leverageInputs, setLeverageInputs] = useState({
    totalDebt: '',
    totalEquity: '',
    totalAssets: '',
    ebit: '',
    interestExpense: '',
  });
  const [leverageResults, setLeverageResults] = useState<LeverageRatios | null>(null);

  // Efficiency inputs
  const [efficiencyInputs, setEfficiencyInputs] = useState({
    cogs: '',
    avgInventory: '',
    revenue: '',
    avgReceivables: '',
    totalAssets: '',
  });
  const [efficiencyResults, setEfficiencyResults] = useState<EfficiencyRatios | null>(null);

  const calculateLiquidity = () => {
    const currentAssets = parseFloat(liquidityInputs.currentAssets);
    const currentLiabilities = parseFloat(liquidityInputs.currentLiabilities);
    const inventory = parseFloat(liquidityInputs.inventory) || 0;
    const cash = parseFloat(liquidityInputs.cash) || 0;

    if (!currentAssets || !currentLiabilities) {
      toast.error('Please enter current assets and liabilities');
      return;
    }

    const currentRatio = currentAssets / currentLiabilities;
    const quickRatio = (currentAssets - inventory) / currentLiabilities;
    const cashRatio = cash / currentLiabilities;
    const workingCapital = currentAssets - currentLiabilities;

    setLiquidityResults({
      currentRatio,
      quickRatio,
      cashRatio,
      workingCapital,
    });

    toast.success('Liquidity ratios calculated successfully');
  };

  const calculateProfitability = () => {
    const revenue = parseFloat(profitabilityInputs.revenue);
    const cogs = parseFloat(profitabilityInputs.cogs) || 0;
    const operatingExpenses = parseFloat(profitabilityInputs.operatingExpenses) || 0;
    const netIncome = parseFloat(profitabilityInputs.netIncome);
    const totalAssets = parseFloat(profitabilityInputs.totalAssets);
    const equity = parseFloat(profitabilityInputs.equity);

    if (!revenue || !netIncome || !totalAssets || !equity) {
      toast.error('Please enter all required profitability fields');
      return;
    }

    const grossProfit = revenue - cogs;
    const operatingIncome = grossProfit - operatingExpenses;

    const grossMargin = (grossProfit / revenue) * 100;
    const netMargin = (netIncome / revenue) * 100;
    const operatingMargin = (operatingIncome / revenue) * 100;
    const roa = (netIncome / totalAssets) * 100;
    const roe = (netIncome / equity) * 100;

    setProfitabilityResults({
      grossMargin,
      netMargin,
      operatingMargin,
      roa,
      roe,
    });

    toast.success('Profitability ratios calculated successfully');
  };

  const calculateLeverage = () => {
    const totalDebt = parseFloat(leverageInputs.totalDebt);
    const totalEquity = parseFloat(leverageInputs.totalEquity);
    const totalAssets = parseFloat(leverageInputs.totalAssets);
    const ebit = parseFloat(leverageInputs.ebit);
    const interestExpense = parseFloat(leverageInputs.interestExpense);

    if (!totalDebt || !totalEquity || !totalAssets || !ebit || !interestExpense) {
      toast.error('Please enter all leverage fields');
      return;
    }

    const debtToEquity = totalDebt / totalEquity;
    const debtRatio = totalDebt / totalAssets;
    const interestCoverage = ebit / interestExpense;

    setLeverageResults({
      debtToEquity,
      debtRatio,
      interestCoverage,
    });

    toast.success('Leverage ratios calculated successfully');
  };

  const calculateEfficiency = () => {
    const cogs = parseFloat(efficiencyInputs.cogs);
    const avgInventory = parseFloat(efficiencyInputs.avgInventory);
    const revenue = parseFloat(efficiencyInputs.revenue);
    const avgReceivables = parseFloat(efficiencyInputs.avgReceivables);
    const totalAssets = parseFloat(efficiencyInputs.totalAssets);

    if (!cogs || !avgInventory || !revenue || !avgReceivables || !totalAssets) {
      toast.error('Please enter all efficiency fields');
      return;
    }

    const inventoryTurnover = cogs / avgInventory;
    const receivableTurnover = revenue / avgReceivables;
    const assetTurnover = revenue / totalAssets;

    setEfficiencyResults({
      inventoryTurnover,
      receivableTurnover,
      assetTurnover,
    });

    toast.success('Efficiency ratios calculated successfully');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold tracking-tight">Financial Ratio Calculator</h3>
        <p className="text-muted-foreground">Comprehensive ratio analysis for business performance evaluation</p>
      </div>

      <Tabs defaultValue="liquidity" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="liquidity">
            <DollarSign className="h-4 w-4 mr-2" />
            Liquidity
          </TabsTrigger>
          <TabsTrigger value="profitability">
            <TrendingUp className="h-4 w-4 mr-2" />
            Profitability
          </TabsTrigger>
          <TabsTrigger value="leverage">
            <BarChart3 className="h-4 w-4 mr-2" />
            Leverage
          </TabsTrigger>
          <TabsTrigger value="efficiency">
            <Activity className="h-4 w-4 mr-2" />
            Efficiency
          </TabsTrigger>
        </TabsList>

        {/* Liquidity Ratios */}
        <TabsContent value="liquidity" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Liquidity Inputs</CardTitle>
                <CardDescription>Enter balance sheet data for liquidity analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentAssets">Current Assets (₹)</Label>
                  <Input
                    id="currentAssets"
                    type="number"
                    placeholder="5000000"
                    value={liquidityInputs.currentAssets}
                    onChange={(e) => setLiquidityInputs({ ...liquidityInputs, currentAssets: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentLiabilities">Current Liabilities (₹)</Label>
                  <Input
                    id="currentLiabilities"
                    type="number"
                    placeholder="3000000"
                    value={liquidityInputs.currentLiabilities}
                    onChange={(e) => setLiquidityInputs({ ...liquidityInputs, currentLiabilities: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inventory">Inventory (₹)</Label>
                  <Input
                    id="inventory"
                    type="number"
                    placeholder="1000000"
                    value={liquidityInputs.inventory}
                    onChange={(e) => setLiquidityInputs({ ...liquidityInputs, inventory: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cash">Cash & Cash Equivalents (₹)</Label>
                  <Input
                    id="cash"
                    type="number"
                    placeholder="500000"
                    value={liquidityInputs.cash}
                    onChange={(e) => setLiquidityInputs({ ...liquidityInputs, cash: e.target.value })}
                  />
                </div>
                <Button onClick={calculateLiquidity} className="w-full">
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate Liquidity Ratios
                </Button>
              </CardContent>
            </Card>

            {liquidityResults && (
              <Card>
                <CardHeader>
                  <CardTitle>Liquidity Results</CardTitle>
                  <CardDescription>Key liquidity metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ratio</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                        <TableHead className="text-right">Benchmark</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Current Ratio</TableCell>
                        <TableCell className="text-right">{liquidityResults.currentRatio.toFixed(2)}</TableCell>
                        <TableCell className="text-right text-muted-foreground">&gt; 1.5</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Quick Ratio</TableCell>
                        <TableCell className="text-right">{liquidityResults.quickRatio.toFixed(2)}</TableCell>
                        <TableCell className="text-right text-muted-foreground">&gt; 1.0</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Cash Ratio</TableCell>
                        <TableCell className="text-right">{liquidityResults.cashRatio.toFixed(2)}</TableCell>
                        <TableCell className="text-right text-muted-foreground">&gt; 0.5</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Working Capital</TableCell>
                        <TableCell className="text-right">{formatINR(liquidityResults.workingCapital)}</TableCell>
                        <TableCell className="text-right text-muted-foreground">&gt; 0</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Profitability Ratios */}
        <TabsContent value="profitability" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Profitability Inputs</CardTitle>
                <CardDescription>Enter income statement and balance sheet data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="revenue">Revenue (₹)</Label>
                  <Input
                    id="revenue"
                    type="number"
                    placeholder="10000000"
                    value={profitabilityInputs.revenue}
                    onChange={(e) => setProfitabilityInputs({ ...profitabilityInputs, revenue: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cogs">Cost of Goods Sold (₹)</Label>
                  <Input
                    id="cogs"
                    type="number"
                    placeholder="6000000"
                    value={profitabilityInputs.cogs}
                    onChange={(e) => setProfitabilityInputs({ ...profitabilityInputs, cogs: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="operatingExpenses">Operating Expenses (₹)</Label>
                  <Input
                    id="operatingExpenses"
                    type="number"
                    placeholder="2000000"
                    value={profitabilityInputs.operatingExpenses}
                    onChange={(e) => setProfitabilityInputs({ ...profitabilityInputs, operatingExpenses: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="netIncome">Net Income (₹)</Label>
                  <Input
                    id="netIncome"
                    type="number"
                    placeholder="1500000"
                    value={profitabilityInputs.netIncome}
                    onChange={(e) => setProfitabilityInputs({ ...profitabilityInputs, netIncome: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalAssets">Total Assets (₹)</Label>
                  <Input
                    id="totalAssets"
                    type="number"
                    placeholder="15000000"
                    value={profitabilityInputs.totalAssets}
                    onChange={(e) => setProfitabilityInputs({ ...profitabilityInputs, totalAssets: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="equity">Equity (₹)</Label>
                  <Input
                    id="equity"
                    type="number"
                    placeholder="10000000"
                    value={profitabilityInputs.equity}
                    onChange={(e) => setProfitabilityInputs({ ...profitabilityInputs, equity: e.target.value })}
                  />
                </div>
                <Button onClick={calculateProfitability} className="w-full">
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate Profitability Ratios
                </Button>
              </CardContent>
            </Card>

            {profitabilityResults && (
              <Card>
                <CardHeader>
                  <CardTitle>Profitability Results</CardTitle>
                  <CardDescription>Key profitability metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ratio</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                        <TableHead className="text-right">Benchmark</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Gross Margin</TableCell>
                        <TableCell className="text-right">{profitabilityResults.grossMargin.toFixed(2)}%</TableCell>
                        <TableCell className="text-right text-muted-foreground">&gt; 30%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Net Margin</TableCell>
                        <TableCell className="text-right">{profitabilityResults.netMargin.toFixed(2)}%</TableCell>
                        <TableCell className="text-right text-muted-foreground">&gt; 10%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Operating Margin</TableCell>
                        <TableCell className="text-right">{profitabilityResults.operatingMargin.toFixed(2)}%</TableCell>
                        <TableCell className="text-right text-muted-foreground">&gt; 15%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">ROA (Return on Assets)</TableCell>
                        <TableCell className="text-right">{profitabilityResults.roa.toFixed(2)}%</TableCell>
                        <TableCell className="text-right text-muted-foreground">&gt; 5%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">ROE (Return on Equity)</TableCell>
                        <TableCell className="text-right">{profitabilityResults.roe.toFixed(2)}%</TableCell>
                        <TableCell className="text-right text-muted-foreground">&gt; 15%</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Leverage Ratios */}
        <TabsContent value="leverage" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Leverage Inputs</CardTitle>
                <CardDescription>Enter debt and equity data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="totalDebt">Total Debt (₹)</Label>
                  <Input
                    id="totalDebt"
                    type="number"
                    placeholder="5000000"
                    value={leverageInputs.totalDebt}
                    onChange={(e) => setLeverageInputs({ ...leverageInputs, totalDebt: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalEquity">Total Equity (₹)</Label>
                  <Input
                    id="totalEquity"
                    type="number"
                    placeholder="10000000"
                    value={leverageInputs.totalEquity}
                    onChange={(e) => setLeverageInputs({ ...leverageInputs, totalEquity: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalAssets">Total Assets (₹)</Label>
                  <Input
                    id="totalAssets"
                    type="number"
                    placeholder="15000000"
                    value={leverageInputs.totalAssets}
                    onChange={(e) => setLeverageInputs({ ...leverageInputs, totalAssets: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ebit">EBIT (₹)</Label>
                  <Input
                    id="ebit"
                    type="number"
                    placeholder="2000000"
                    value={leverageInputs.ebit}
                    onChange={(e) => setLeverageInputs({ ...leverageInputs, ebit: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interestExpense">Interest Expense (₹)</Label>
                  <Input
                    id="interestExpense"
                    type="number"
                    placeholder="500000"
                    value={leverageInputs.interestExpense}
                    onChange={(e) => setLeverageInputs({ ...leverageInputs, interestExpense: e.target.value })}
                  />
                </div>
                <Button onClick={calculateLeverage} className="w-full">
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate Leverage Ratios
                </Button>
              </CardContent>
            </Card>

            {leverageResults && (
              <Card>
                <CardHeader>
                  <CardTitle>Leverage Results</CardTitle>
                  <CardDescription>Key leverage metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ratio</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                        <TableHead className="text-right">Benchmark</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Debt-to-Equity</TableCell>
                        <TableCell className="text-right">{leverageResults.debtToEquity.toFixed(2)}</TableCell>
                        <TableCell className="text-right text-muted-foreground">&lt; 2.0</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Debt Ratio</TableCell>
                        <TableCell className="text-right">{leverageResults.debtRatio.toFixed(2)}</TableCell>
                        <TableCell className="text-right text-muted-foreground">&lt; 0.6</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Interest Coverage</TableCell>
                        <TableCell className="text-right">{leverageResults.interestCoverage.toFixed(2)}</TableCell>
                        <TableCell className="text-right text-muted-foreground">&gt; 2.5</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Efficiency Ratios */}
        <TabsContent value="efficiency" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Efficiency Inputs</CardTitle>
                <CardDescription>Enter operational data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cogs">Cost of Goods Sold (₹)</Label>
                  <Input
                    id="cogs"
                    type="number"
                    placeholder="6000000"
                    value={efficiencyInputs.cogs}
                    onChange={(e) => setEfficiencyInputs({ ...efficiencyInputs, cogs: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avgInventory">Average Inventory (₹)</Label>
                  <Input
                    id="avgInventory"
                    type="number"
                    placeholder="1000000"
                    value={efficiencyInputs.avgInventory}
                    onChange={(e) => setEfficiencyInputs({ ...efficiencyInputs, avgInventory: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="revenue">Revenue (₹)</Label>
                  <Input
                    id="revenue"
                    type="number"
                    placeholder="10000000"
                    value={efficiencyInputs.revenue}
                    onChange={(e) => setEfficiencyInputs({ ...efficiencyInputs, revenue: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avgReceivables">Average Receivables (₹)</Label>
                  <Input
                    id="avgReceivables"
                    type="number"
                    placeholder="1500000"
                    value={efficiencyInputs.avgReceivables}
                    onChange={(e) => setEfficiencyInputs({ ...efficiencyInputs, avgReceivables: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalAssets">Total Assets (₹)</Label>
                  <Input
                    id="totalAssets"
                    type="number"
                    placeholder="15000000"
                    value={efficiencyInputs.totalAssets}
                    onChange={(e) => setEfficiencyInputs({ ...efficiencyInputs, totalAssets: e.target.value })}
                  />
                </div>
                <Button onClick={calculateEfficiency} className="w-full">
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate Efficiency Ratios
                </Button>
              </CardContent>
            </Card>

            {efficiencyResults && (
              <Card>
                <CardHeader>
                  <CardTitle>Efficiency Results</CardTitle>
                  <CardDescription>Key efficiency metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ratio</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                        <TableHead className="text-right">Benchmark</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Inventory Turnover</TableCell>
                        <TableCell className="text-right">{efficiencyResults.inventoryTurnover.toFixed(2)}x</TableCell>
                        <TableCell className="text-right text-muted-foreground">&gt; 5x</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Receivable Turnover</TableCell>
                        <TableCell className="text-right">{efficiencyResults.receivableTurnover.toFixed(2)}x</TableCell>
                        <TableCell className="text-right text-muted-foreground">&gt; 6x</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Asset Turnover</TableCell>
                        <TableCell className="text-right">{efficiencyResults.assetTurnover.toFixed(2)}x</TableCell>
                        <TableCell className="text-right text-muted-foreground">&gt; 1x</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
