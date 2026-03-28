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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, FileText, Scale, TrendingUp } from "lucide-react";
import { useState } from "react";
import { formatCurrency } from "../../lib/formatters";

export default function IncomeTaxReportsTab() {
  const [grossIncome, setGrossIncome] = useState("");
  const [deductions, setDeductions] = useState("");
  const [taxRegime, setTaxRegime] = useState<"old" | "new">("new");

  const calculateTax = () => {
    const income = Number.parseFloat(grossIncome) || 0;
    const deductionAmount = Number.parseFloat(deductions) || 0;
    const taxableIncome = income - (taxRegime === "old" ? deductionAmount : 0);

    let tax = 0;
    let surcharge = 0;
    let cess = 0;

    if (taxRegime === "new") {
      // New Tax Regime (FY 2023-24)
      if (taxableIncome <= 300000) tax = 0;
      else if (taxableIncome <= 600000) tax = (taxableIncome - 300000) * 0.05;
      else if (taxableIncome <= 900000)
        tax = 15000 + (taxableIncome - 600000) * 0.1;
      else if (taxableIncome <= 1200000)
        tax = 45000 + (taxableIncome - 900000) * 0.15;
      else if (taxableIncome <= 1500000)
        tax = 90000 + (taxableIncome - 1200000) * 0.2;
      else tax = 150000 + (taxableIncome - 1500000) * 0.3;
    } else {
      // Old Tax Regime
      if (taxableIncome <= 250000) tax = 0;
      else if (taxableIncome <= 500000) tax = (taxableIncome - 250000) * 0.05;
      else if (taxableIncome <= 1000000)
        tax = 12500 + (taxableIncome - 500000) * 0.2;
      else tax = 112500 + (taxableIncome - 1000000) * 0.3;
    }

    // Surcharge
    if (taxableIncome > 5000000 && taxableIncome <= 10000000)
      surcharge = tax * 0.1;
    else if (taxableIncome > 10000000 && taxableIncome <= 20000000)
      surcharge = tax * 0.15;
    else if (taxableIncome > 20000000 && taxableIncome <= 50000000)
      surcharge = tax * 0.25;
    else if (taxableIncome > 50000000) surcharge = tax * 0.37;

    // Health and Education Cess (4%)
    cess = (tax + surcharge) * 0.04;

    const totalTax = tax + surcharge + cess;

    // Rebate under Section 87A (for new regime only)
    let rebate = 0;
    if (taxRegime === "new" && taxableIncome <= 700000) {
      rebate = Math.min(totalTax, 25000);
    }

    return {
      taxableIncome,
      tax,
      surcharge,
      cess,
      totalTax,
      rebate,
      finalTax: totalTax - rebate,
    };
  };

  const oldRegimeResult = taxRegime === "old" ? calculateTax() : null;
  const newRegimeResult = taxRegime === "new" ? calculateTax() : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Income Tax Reports
        </h2>
        <p className="text-muted-foreground">
          Calculate and compare income tax under different regimes
        </p>
      </div>

      <Tabs defaultValue="calculator" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calculator">Tax Calculator</TabsTrigger>
          <TabsTrigger value="comparison">Regime Comparison</TabsTrigger>
          <TabsTrigger value="deductions">Deductions Tracker</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Income Tax Calculator
              </CardTitle>
              <CardDescription>
                Calculate your tax liability with surcharge, cess, and rebates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="grossIncome">Gross Total Income (INR)</Label>
                  <Input
                    id="grossIncome"
                    type="number"
                    step="0.01"
                    value={grossIncome}
                    onChange={(e) => setGrossIncome(e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deductions">Total Deductions (INR)</Label>
                  <Input
                    id="deductions"
                    type="number"
                    step="0.01"
                    value={deductions}
                    onChange={(e) => setDeductions(e.target.value)}
                    placeholder="0.00"
                  />
                  <p className="text-xs text-muted-foreground">
                    Applicable only for Old Tax Regime
                  </p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="taxRegime">Tax Regime</Label>
                  <Select
                    value={taxRegime}
                    onValueChange={(v) => setTaxRegime(v as "old" | "new")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">
                        New Tax Regime (FY 2023-24)
                      </SelectItem>
                      <SelectItem value="old">
                        Old Tax Regime (with deductions)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(oldRegimeResult || newRegimeResult) && (
                <div className="border-t pt-4 space-y-4">
                  <h3 className="font-semibold text-lg">
                    Tax Calculation Summary
                  </h3>

                  {newRegimeResult && (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Taxable Income:</span>
                        <span className="font-semibold">
                          {formatCurrency(newRegimeResult.taxableIncome)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Income Tax:</span>
                        <span>{formatCurrency(newRegimeResult.tax)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Surcharge:</span>
                        <span>{formatCurrency(newRegimeResult.surcharge)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Health & Education Cess (4%):</span>
                        <span>{formatCurrency(newRegimeResult.cess)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Tax:</span>
                        <span className="font-semibold">
                          {formatCurrency(newRegimeResult.totalTax)}
                        </span>
                      </div>
                      {newRegimeResult.rebate > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Rebate u/s 87A:</span>
                          <span>
                            - {formatCurrency(newRegimeResult.rebate)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold border-t pt-2">
                        <span>Final Tax Payable:</span>
                        <span>{formatCurrency(newRegimeResult.finalTax)}</span>
                      </div>
                    </div>
                  )}

                  {oldRegimeResult && (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Taxable Income:</span>
                        <span className="font-semibold">
                          {formatCurrency(oldRegimeResult.taxableIncome)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Income Tax:</span>
                        <span>{formatCurrency(oldRegimeResult.tax)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Surcharge:</span>
                        <span>{formatCurrency(oldRegimeResult.surcharge)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Health & Education Cess (4%):</span>
                        <span>{formatCurrency(oldRegimeResult.cess)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t pt-2">
                        <span>Final Tax Payable:</span>
                        <span>{formatCurrency(oldRegimeResult.finalTax)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Tax Regime Comparison
              </CardTitle>
              <CardDescription>
                Compare tax liability under both old and new regimes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Enter income details in the calculator to see comparison</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deductions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Deductions Tracker
              </CardTitle>
              <CardDescription>
                Track deductions under sections 80C to 80U
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No deductions recorded yet</p>
                <p className="text-sm mt-2">
                  Add deductions to track your tax savings
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
