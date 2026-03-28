import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  Calculator,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Info,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatINR } from "../../lib/formatters";

// Income Tax Slabs for FY 2024-25
const OLD_REGIME_SLABS = [
  { min: 0, max: 250000, rate: 0 },
  { min: 250000, max: 500000, rate: 5 },
  { min: 500000, max: 1000000, rate: 20 },
  { min: 1000000, max: Number.POSITIVE_INFINITY, rate: 30 },
];

const NEW_REGIME_SLABS = [
  { min: 0, max: 300000, rate: 0 },
  { min: 300000, max: 600000, rate: 5 },
  { min: 600000, max: 900000, rate: 10 },
  { min: 900000, max: 1200000, rate: 15 },
  { min: 1200000, max: 1500000, rate: 20 },
  { min: 1500000, max: Number.POSITIVE_INFINITY, rate: 30 },
];

interface FiveHeadIncome {
  salary: number;
  houseProperty: number;
  businessProfession: number;
  capitalGains: number;
  otherSources: number;
}

interface TaxCalculationResult {
  grossTotalIncome: number;
  deductions: number;
  taxableIncome: number;
  tax: number;
  surcharge: number;
  cess: number;
  rebate: number;
  totalTax: number;
  slabWiseBreakdown: {
    slab: string;
    taxableAmount: number;
    rate: number;
    tax: number;
  }[];
}

interface DualRegimeComparison {
  oldRegime: TaxCalculationResult;
  newRegime: TaxCalculationResult;
  recommendation: "old" | "new";
  savings: number;
}

export default function IncomeTaxDashboardTab() {
  const [fiveHeadIncome, setFiveHeadIncome] = useState<FiveHeadIncome>({
    salary: 0,
    houseProperty: 0,
    businessProfession: 0,
    capitalGains: 0,
    otherSources: 0,
  });

  const [deductions, setDeductions] = useState({
    section80C: 0,
    section80D: 0,
    section80G: 0,
    section80E: 0,
    section80TTA: 0,
    otherDeductions: 0,
  });

  const calculateSurcharge = (income: number, tax: number): number => {
    if (income > 5000000 && income <= 10000000) return tax * 0.1;
    if (income > 10000000 && income <= 20000000) return tax * 0.15;
    if (income > 20000000 && income <= 50000000) return tax * 0.25;
    if (income > 50000000) return tax * 0.37;
    return 0;
  };

  const calculateTaxForRegime = (
    grossIncome: number,
    totalDeductions: number,
    slabs: typeof OLD_REGIME_SLABS,
    isNewRegime: boolean,
  ): TaxCalculationResult => {
    // New regime has limited deductions (max 50,000)
    const applicableDeductions = isNewRegime
      ? Math.min(totalDeductions, 50000)
      : totalDeductions;
    const taxableIncome = Math.max(0, grossIncome - applicableDeductions);

    let tax = 0;
    const slabWiseBreakdown: {
      slab: string;
      taxableAmount: number;
      rate: number;
      tax: number;
    }[] = [];

    for (const slab of slabs) {
      if (taxableIncome > slab.min) {
        const taxableInSlab = Math.min(taxableIncome, slab.max) - slab.min;
        const slabTax = (taxableInSlab * slab.rate) / 100;
        tax += slabTax;

        if (taxableInSlab > 0) {
          slabWiseBreakdown.push({
            slab: `₹${(slab.min / 100000).toFixed(1)}L - ${slab.max === Number.POSITIVE_INFINITY ? "Above" : `₹${(slab.max / 100000).toFixed(1)}L`}`,
            taxableAmount: taxableInSlab,
            rate: slab.rate,
            tax: slabTax,
          });
        }
      }
    }

    const surcharge = calculateSurcharge(taxableIncome, tax);
    const cess = (tax + surcharge) * 0.04;

    // Rebate under Section 87A
    let rebate = 0;
    if (isNewRegime && taxableIncome <= 700000) {
      rebate = Math.min(tax, 25000);
    } else if (!isNewRegime && taxableIncome <= 500000) {
      rebate = Math.min(tax, 12500);
    }

    const totalTax = Math.max(0, tax + surcharge + cess - rebate);

    return {
      grossTotalIncome: grossIncome,
      deductions: applicableDeductions,
      taxableIncome,
      tax,
      surcharge,
      cess,
      rebate,
      totalTax,
      slabWiseBreakdown,
    };
  };

  const calculateDualRegime = (): DualRegimeComparison => {
    const grossIncome = Object.values(fiveHeadIncome).reduce(
      (sum, val) => sum + val,
      0,
    );
    const totalDeductions = Object.values(deductions).reduce(
      (sum, val) => sum + val,
      0,
    );

    const oldRegime = calculateTaxForRegime(
      grossIncome,
      totalDeductions,
      OLD_REGIME_SLABS,
      false,
    );
    const newRegime = calculateTaxForRegime(
      grossIncome,
      totalDeductions,
      NEW_REGIME_SLABS,
      true,
    );

    return {
      oldRegime,
      newRegime,
      recommendation: oldRegime.totalTax < newRegime.totalTax ? "old" : "new",
      savings: Math.abs(oldRegime.totalTax - newRegime.totalTax),
    };
  };

  const result = calculateDualRegime();

  const handleExportPDF = () => {
    toast.success("Exporting tax calculation report as PDF...");
  };

  const handleExportExcel = () => {
    toast.success("Exporting tax calculation report as Excel...");
  };

  const updateFiveHeadIncome = (head: keyof FiveHeadIncome, value: string) => {
    const numValue = Number.parseFloat(value) || 0;
    setFiveHeadIncome({ ...fiveHeadIncome, [head]: numValue });
  };

  const updateDeduction = (section: keyof typeof deductions, value: string) => {
    const numValue = Number.parseFloat(value) || 0;
    setDeductions({ ...deductions, [section]: numValue });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Income Tax Dashboard
          </h2>
          <p className="text-muted-foreground">
            Five-head income calculations with dual regime comparison
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={handleExportExcel}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      <Tabs defaultValue="income-heads" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="income-heads">Income Heads</TabsTrigger>
          <TabsTrigger value="deductions">Deductions</TabsTrigger>
          <TabsTrigger value="comparison">Tax Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="income-heads" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Five-Head Income Calculation</CardTitle>
              <CardDescription>
                Enter income under each head as per Income Tax Act
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="salary">Income from Salary (₹)</Label>
                  <Input
                    id="salary"
                    type="number"
                    placeholder="0"
                    value={fiveHeadIncome.salary || ""}
                    onChange={(e) =>
                      updateFiveHeadIncome("salary", e.target.value)
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Includes basic salary, allowances, perquisites, and profits
                    in lieu of salary
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="houseProperty">
                    Income from House Property (₹)
                  </Label>
                  <Input
                    id="houseProperty"
                    type="number"
                    placeholder="0"
                    value={fiveHeadIncome.houseProperty || ""}
                    onChange={(e) =>
                      updateFiveHeadIncome("houseProperty", e.target.value)
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Rental income from property (after standard deduction of
                    30%)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessProfession">
                    Income from Business/Profession (₹)
                  </Label>
                  <Input
                    id="businessProfession"
                    type="number"
                    placeholder="0"
                    value={fiveHeadIncome.businessProfession || ""}
                    onChange={(e) =>
                      updateFiveHeadIncome("businessProfession", e.target.value)
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Net profit from business or professional activities
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capitalGains">
                    Income from Capital Gains (₹)
                  </Label>
                  <Input
                    id="capitalGains"
                    type="number"
                    placeholder="0"
                    value={fiveHeadIncome.capitalGains || ""}
                    onChange={(e) =>
                      updateFiveHeadIncome("capitalGains", e.target.value)
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Short-term and long-term capital gains from sale of assets
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="otherSources">
                    Income from Other Sources (₹)
                  </Label>
                  <Input
                    id="otherSources"
                    type="number"
                    placeholder="0"
                    value={fiveHeadIncome.otherSources || ""}
                    onChange={(e) =>
                      updateFiveHeadIncome("otherSources", e.target.value)
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Interest, dividends, lottery winnings, and other
                    miscellaneous income
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">
                    Gross Total Income:
                  </span>
                  <span className="text-2xl font-bold text-primary">
                    {formatINR(
                      Object.values(fiveHeadIncome).reduce(
                        (sum, val) => sum + val,
                        0,
                      ),
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deductions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tax Deductions (Chapter VI-A)</CardTitle>
              <CardDescription>
                Enter eligible deductions under various sections
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="section80C">Section 80C (₹)</Label>
                  <Input
                    id="section80C"
                    type="number"
                    placeholder="0"
                    value={deductions.section80C || ""}
                    onChange={(e) =>
                      updateDeduction("section80C", e.target.value)
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Max ₹1.5 lakh - PPF, ELSS, Life Insurance, NSC, etc.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="section80D">Section 80D (₹)</Label>
                  <Input
                    id="section80D"
                    type="number"
                    placeholder="0"
                    value={deductions.section80D || ""}
                    onChange={(e) =>
                      updateDeduction("section80D", e.target.value)
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Max ₹25,000 (₹50,000 for senior citizens) - Health insurance
                    premiums
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="section80G">Section 80G (₹)</Label>
                  <Input
                    id="section80G"
                    type="number"
                    placeholder="0"
                    value={deductions.section80G || ""}
                    onChange={(e) =>
                      updateDeduction("section80G", e.target.value)
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Donations to charitable institutions (50% or 100% eligible)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="section80E">Section 80E (₹)</Label>
                  <Input
                    id="section80E"
                    type="number"
                    placeholder="0"
                    value={deductions.section80E || ""}
                    onChange={(e) =>
                      updateDeduction("section80E", e.target.value)
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Interest on education loan (no upper limit)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="section80TTA">Section 80TTA (₹)</Label>
                  <Input
                    id="section80TTA"
                    type="number"
                    placeholder="0"
                    value={deductions.section80TTA || ""}
                    onChange={(e) =>
                      updateDeduction("section80TTA", e.target.value)
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Max ₹10,000 - Interest on savings account
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="otherDeductions">Other Deductions (₹)</Label>
                  <Input
                    id="otherDeductions"
                    type="number"
                    placeholder="0"
                    value={deductions.otherDeductions || ""}
                    onChange={(e) =>
                      updateDeduction("otherDeductions", e.target.value)
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    80CCD, 80U, 80DD, and other eligible deductions
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">
                    Total Deductions:
                  </span>
                  <span className="text-2xl font-bold text-primary">
                    {formatINR(
                      Object.values(deductions).reduce(
                        (sum, val) => sum + val,
                        0,
                      ),
                    )}
                  </span>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Note:</strong> New tax regime allows limited
                  deductions (max ₹50,000). Old regime allows all deductions as
                  per respective section limits.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card
              className={`border-2 ${result.recommendation === "old" ? "border-primary" : "border-muted"}`}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Old Tax Regime</span>
                  {result.recommendation === "old" && (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Recommended
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  With all deductions (80C, 80D, etc.)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Gross Total Income:
                    </span>
                    <span className="font-medium">
                      {formatINR(result.oldRegime.grossTotalIncome)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Less: Deductions:
                    </span>
                    <span className="font-medium text-green-600">
                      -{formatINR(result.oldRegime.deductions)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold border-t pt-2">
                    <span>Taxable Income:</span>
                    <span>{formatINR(result.oldRegime.taxableIncome)}</span>
                  </div>
                </div>

                <div className="space-y-2 border-t pt-3">
                  <h4 className="font-semibold text-sm">
                    Slab-wise Tax Calculation:
                  </h4>
                  {result.oldRegime.slabWiseBreakdown.map((slab, idx) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: stable list
                    <div key={idx} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {slab.slab} @ {slab.rate}%:
                      </span>
                      <span className="font-medium">{formatINR(slab.tax)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 border-t pt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Income Tax:</span>
                    <span className="font-medium">
                      {formatINR(result.oldRegime.tax)}
                    </span>
                  </div>
                  {result.oldRegime.surcharge > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Add: Surcharge:
                      </span>
                      <span className="font-medium">
                        {formatINR(result.oldRegime.surcharge)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Add: Health & Education Cess (4%):
                    </span>
                    <span className="font-medium">
                      {formatINR(result.oldRegime.cess)}
                    </span>
                  </div>
                  {result.oldRegime.rebate > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Less: Rebate u/s 87A:
                      </span>
                      <span className="font-medium text-green-600">
                        -{formatINR(result.oldRegime.rebate)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between font-bold text-lg border-t pt-3">
                  <span>Total Tax Payable:</span>
                  <span className="text-primary">
                    {formatINR(result.oldRegime.totalTax)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card
              className={`border-2 ${result.recommendation === "new" ? "border-primary" : "border-muted"}`}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>New Tax Regime</span>
                  {result.recommendation === "new" && (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Recommended
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  With limited deductions (max ₹50,000)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Gross Total Income:
                    </span>
                    <span className="font-medium">
                      {formatINR(result.newRegime.grossTotalIncome)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Less: Deductions:
                    </span>
                    <span className="font-medium text-green-600">
                      -{formatINR(result.newRegime.deductions)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold border-t pt-2">
                    <span>Taxable Income:</span>
                    <span>{formatINR(result.newRegime.taxableIncome)}</span>
                  </div>
                </div>

                <div className="space-y-2 border-t pt-3">
                  <h4 className="font-semibold text-sm">
                    Slab-wise Tax Calculation:
                  </h4>
                  {result.newRegime.slabWiseBreakdown.map((slab, idx) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: stable list
                    <div key={idx} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {slab.slab} @ {slab.rate}%:
                      </span>
                      <span className="font-medium">{formatINR(slab.tax)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 border-t pt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Income Tax:</span>
                    <span className="font-medium">
                      {formatINR(result.newRegime.tax)}
                    </span>
                  </div>
                  {result.newRegime.surcharge > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Add: Surcharge:
                      </span>
                      <span className="font-medium">
                        {formatINR(result.newRegime.surcharge)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Add: Health & Education Cess (4%):
                    </span>
                    <span className="font-medium">
                      {formatINR(result.newRegime.cess)}
                    </span>
                  </div>
                  {result.newRegime.rebate > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Less: Rebate u/s 87A:
                      </span>
                      <span className="font-medium text-green-600">
                        -{formatINR(result.newRegime.rebate)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between font-bold text-lg border-t pt-3">
                  <span>Total Tax Payable:</span>
                  <span className="text-primary">
                    {formatINR(result.newRegime.totalTax)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert className="border-primary/20 bg-primary/5">
            <TrendingUp className="h-4 w-4" />
            <AlertTitle>Tax Savings Analysis</AlertTitle>
            <AlertDescription>
              <strong>
                {result.recommendation === "old"
                  ? "Old Tax Regime"
                  : "New Tax Regime"}
              </strong>{" "}
              is recommended for you.
              <br />
              Potential savings: <strong>{formatINR(result.savings)}</strong>{" "}
              compared to the other regime.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Comparison Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Particulars</TableHead>
                    <TableHead className="text-right">Old Regime</TableHead>
                    <TableHead className="text-right">New Regime</TableHead>
                    <TableHead className="text-right">Difference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Gross Total Income</TableCell>
                    <TableCell className="text-right">
                      {formatINR(result.oldRegime.grossTotalIncome)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatINR(result.newRegime.grossTotalIncome)}
                    </TableCell>
                    <TableCell className="text-right">-</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Deductions Allowed</TableCell>
                    <TableCell className="text-right">
                      {formatINR(result.oldRegime.deductions)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatINR(result.newRegime.deductions)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatINR(
                        result.oldRegime.deductions -
                          result.newRegime.deductions,
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Taxable Income</TableCell>
                    <TableCell className="text-right">
                      {formatINR(result.oldRegime.taxableIncome)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatINR(result.newRegime.taxableIncome)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatINR(
                        result.oldRegime.taxableIncome -
                          result.newRegime.taxableIncome,
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Income Tax</TableCell>
                    <TableCell className="text-right">
                      {formatINR(result.oldRegime.tax)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatINR(result.newRegime.tax)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatINR(result.oldRegime.tax - result.newRegime.tax)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Surcharge</TableCell>
                    <TableCell className="text-right">
                      {formatINR(result.oldRegime.surcharge)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatINR(result.newRegime.surcharge)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatINR(
                        result.oldRegime.surcharge - result.newRegime.surcharge,
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Health & Education Cess</TableCell>
                    <TableCell className="text-right">
                      {formatINR(result.oldRegime.cess)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatINR(result.newRegime.cess)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatINR(result.oldRegime.cess - result.newRegime.cess)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Rebate u/s 87A</TableCell>
                    <TableCell className="text-right">
                      {formatINR(result.oldRegime.rebate)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatINR(result.newRegime.rebate)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatINR(
                        result.oldRegime.rebate - result.newRegime.rebate,
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow className="font-bold">
                    <TableCell>Total Tax Payable</TableCell>
                    <TableCell className="text-right">
                      {formatINR(result.oldRegime.totalTax)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatINR(result.newRegime.totalTax)}
                    </TableCell>
                    <TableCell className="text-right text-primary">
                      {formatINR(
                        result.oldRegime.totalTax - result.newRegime.totalTax,
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important Notes:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>
                  This calculator includes surcharge (for income above ₹50
                  lakhs), health & education cess (4%), and rebate under Section
                  87A.
                </li>
                <li>
                  Old regime allows all deductions under Chapter VI-A (80C, 80D,
                  80G, etc.).
                </li>
                <li>
                  New regime has limited deductions (maximum ₹50,000) but lower
                  tax rates.
                </li>
                <li>
                  For detailed tax planning and compliance, consult a qualified
                  tax professional.
                </li>
              </ul>
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
}
