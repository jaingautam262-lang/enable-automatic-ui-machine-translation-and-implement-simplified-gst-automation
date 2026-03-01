import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calculator, Plus, Trash2, Info } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Region = 'australia' | 'india' | 'usa' | 'uk' | 'custom';
type PayFrequency = 'weekly' | 'fortnightly' | 'monthly' | 'annually';
type IndiaRegime = 'new' | 'old';

interface CustomBracket {
  id: number;
  threshold: number; // income up to this amount
  rate: number;      // percentage
}

interface PayrollInputs {
  region: Region;
  grossSalary: string;
  payFrequency: PayFrequency;
  allowances: string;
  superPensionRate: string;   // percentage
  // India-specific
  indiaRegime: IndiaRegime;
  indiaPFRate: string;        // percentage
  // USA-specific
  usaStateTaxRate: string;    // percentage
  // Custom
  customBrackets: CustomBracket[];
  customDeductionRate: string;
  customPensionRate: string;
}

interface TaxLineItem {
  label: string;
  amount: number;
  isDeduction?: boolean;
  isHighlight?: boolean;
}

interface PayrollResults {
  annualGross: number;
  annualTaxableIncome: number;
  lineItems: TaxLineItem[];
  annualNetPay: number;
  periodNetPay: number;
  periodGross: number;
  currency: string;
  currencySymbol: string;
  locale: string;
}

// ─── Tax Calculation Helpers ──────────────────────────────────────────────────

function calcProgressiveTax(income: number, brackets: { min: number; max: number; rate: number }[]): number {
  let tax = 0;
  for (const b of brackets) {
    if (income <= b.min) break;
    const taxable = Math.min(income, b.max) - b.min;
    tax += taxable * (b.rate / 100);
  }
  return tax;
}

function calcAustraliaTax(annualGross: number, allowances: number, superRate: number): TaxLineItem[] {
  const taxableIncome = annualGross + allowances;
  const brackets = [
    { min: 0,       max: 18200,   rate: 0 },
    { min: 18200,   max: 45000,   rate: 19 },
    { min: 45000,   max: 120000,  rate: 32.5 },
    { min: 120000,  max: 180000,  rate: 37 },
    { min: 180000,  max: Infinity, rate: 45 },
  ];
  const incomeTax = calcProgressiveTax(taxableIncome, brackets);
  const medicareLevy = taxableIncome * 0.02;
  const superAmount = annualGross * (superRate / 100);
  const totalDeductions = incomeTax + medicareLevy + superAmount;
  return [
    { label: 'Gross Salary', amount: annualGross },
    { label: 'Allowances', amount: allowances },
    { label: 'Taxable Income', amount: taxableIncome },
    { label: 'Income Tax (ATO)', amount: incomeTax, isDeduction: true },
    { label: 'Medicare Levy (2%)', amount: medicareLevy, isDeduction: true },
    { label: `Superannuation (${superRate}%)`, amount: superAmount, isDeduction: true },
    { label: 'Total Deductions', amount: totalDeductions, isDeduction: true },
  ];
}

function calcIndiaTax(annualGross: number, allowances: number, pfRate: number, regime: IndiaRegime): TaxLineItem[] {
  const standardDeduction = 50000;
  const grossWithAllowances = annualGross + allowances;
  const taxableIncome = Math.max(0, grossWithAllowances - standardDeduction);
  let incomeTax = 0;

  if (regime === 'new') {
    const brackets = [
      { min: 0,       max: 300000,  rate: 0 },
      { min: 300000,  max: 600000,  rate: 5 },
      { min: 600000,  max: 900000,  rate: 10 },
      { min: 900000,  max: 1200000, rate: 15 },
      { min: 1200000, max: 1500000, rate: 20 },
      { min: 1500000, max: Infinity, rate: 30 },
    ];
    incomeTax = calcProgressiveTax(taxableIncome, brackets);
  } else {
    // Old regime
    const brackets = [
      { min: 0,       max: 250000,  rate: 0 },
      { min: 250000,  max: 500000,  rate: 5 },
      { min: 500000,  max: 1000000, rate: 20 },
      { min: 1000000, max: Infinity, rate: 30 },
    ];
    incomeTax = calcProgressiveTax(taxableIncome, brackets);
  }

  // Rebate u/s 87A (new regime: up to ₹7L; old regime: up to ₹5L)
  if (regime === 'new' && taxableIncome <= 700000) incomeTax = 0;
  if (regime === 'old' && taxableIncome <= 500000) incomeTax = 0;

  const cess = incomeTax * 0.04;
  const totalTax = incomeTax + cess;
  const pfAmount = annualGross * (pfRate / 100);
  const totalDeductions = totalTax + pfAmount;

  return [
    { label: 'Gross Salary', amount: annualGross },
    { label: 'Allowances', amount: allowances },
    { label: 'Standard Deduction', amount: standardDeduction, isDeduction: true },
    { label: 'Taxable Income', amount: taxableIncome },
    { label: `Income Tax (${regime === 'new' ? 'New' : 'Old'} Regime)`, amount: incomeTax, isDeduction: true },
    { label: 'Health & Education Cess (4%)', amount: cess, isDeduction: true },
    { label: `PF Contribution (${pfRate}%)`, amount: pfAmount, isDeduction: true },
    { label: 'Total Deductions', amount: totalDeductions, isDeduction: true },
  ];
}

function calcUSATax(annualGross: number, allowances: number, stateTaxRate: number): TaxLineItem[] {
  const taxableIncome = annualGross + allowances;
  const federalBrackets = [
    { min: 0,       max: 11000,   rate: 10 },
    { min: 11000,   max: 44725,   rate: 12 },
    { min: 44725,   max: 95375,   rate: 22 },
    { min: 95375,   max: 182100,  rate: 24 },
    { min: 182100,  max: 231250,  rate: 32 },
    { min: 231250,  max: 578125,  rate: 35 },
    { min: 578125,  max: Infinity, rate: 37 },
  ];
  const federalTax = calcProgressiveTax(taxableIncome, federalBrackets);
  const ssWageBase = 168600;
  const socialSecurity = Math.min(annualGross, ssWageBase) * 0.062;
  const medicare = annualGross * 0.0145;
  const stateTax = taxableIncome * (stateTaxRate / 100);
  const totalDeductions = federalTax + socialSecurity + medicare + stateTax;

  return [
    { label: 'Gross Salary', amount: annualGross },
    { label: 'Allowances', amount: allowances },
    { label: 'Taxable Income', amount: taxableIncome },
    { label: 'Federal Income Tax', amount: federalTax, isDeduction: true },
    { label: 'FICA – Social Security (6.2%)', amount: socialSecurity, isDeduction: true },
    { label: 'FICA – Medicare (1.45%)', amount: medicare, isDeduction: true },
    { label: `State Income Tax (${stateTaxRate}%)`, amount: stateTax, isDeduction: true },
    { label: 'Total Deductions', amount: totalDeductions, isDeduction: true },
  ];
}

function calcUKTax(annualGross: number, allowances: number, pensionRate: number): TaxLineItem[] {
  const grossWithAllowances = annualGross + allowances;
  const personalAllowance = 12570;
  // Taper personal allowance above £100k
  const effectivePA = grossWithAllowances > 125140 ? 0 : grossWithAllowances > 100000
    ? Math.max(0, personalAllowance - (grossWithAllowances - 100000) / 2)
    : personalAllowance;
  const taxableIncome = Math.max(0, grossWithAllowances - effectivePA);

  const payeBrackets = [
    { min: 0,      max: 37700,  rate: 20 },
    { min: 37700,  max: 112570, rate: 40 },
    { min: 112570, max: Infinity, rate: 45 },
  ];
  const incomeTax = calcProgressiveTax(taxableIncome, payeBrackets);

  // NI Class 1 employee (2024-25)
  const niLower = 12570;
  const niUpper = 50270;
  let ni = 0;
  if (annualGross > niLower) {
    ni += Math.min(annualGross, niUpper) * 0.08 - niLower * 0.08;
    if (annualGross > niUpper) {
      ni += (annualGross - niUpper) * 0.02;
    }
  }
  ni = Math.max(0, ni);

  const pensionAmount = annualGross * (pensionRate / 100);
  const totalDeductions = incomeTax + ni + pensionAmount;

  return [
    { label: 'Gross Salary', amount: annualGross },
    { label: 'Allowances', amount: allowances },
    { label: 'Personal Allowance', amount: effectivePA, isDeduction: true },
    { label: 'Taxable Income', amount: taxableIncome },
    { label: 'Income Tax (PAYE)', amount: incomeTax, isDeduction: true },
    { label: 'National Insurance (NI)', amount: ni, isDeduction: true },
    { label: `Pension Contribution (${pensionRate}%)`, amount: pensionAmount, isDeduction: true },
    { label: 'Total Deductions', amount: totalDeductions, isDeduction: true },
  ];
}

function calcCustomTax(annualGross: number, allowances: number, brackets: CustomBracket[], deductionRate: number, pensionRate: number): TaxLineItem[] {
  const taxableIncome = annualGross + allowances;
  let incomeTax = 0;
  const sorted = [...brackets].sort((a, b) => a.threshold - b.threshold);
  let prev = 0;
  for (const b of sorted) {
    if (taxableIncome <= prev) break;
    const slice = Math.min(taxableIncome, b.threshold) - prev;
    incomeTax += slice * (b.rate / 100);
    prev = b.threshold;
  }
  // Remaining above last bracket
  if (sorted.length > 0 && taxableIncome > sorted[sorted.length - 1].threshold) {
    // No additional tax above last bracket unless user adds more
  }

  const flatDeduction = taxableIncome * (deductionRate / 100);
  const pensionAmount = annualGross * (pensionRate / 100);
  const totalDeductions = incomeTax + flatDeduction + pensionAmount;

  return [
    { label: 'Gross Salary', amount: annualGross },
    { label: 'Allowances', amount: allowances },
    { label: 'Taxable Income', amount: taxableIncome },
    { label: 'Income Tax (Custom Brackets)', amount: incomeTax, isDeduction: true },
    { label: `Flat Deduction (${deductionRate}%)`, amount: flatDeduction, isDeduction: true },
    { label: `Pension/Super (${pensionRate}%)`, amount: pensionAmount, isDeduction: true },
    { label: 'Total Deductions', amount: totalDeductions, isDeduction: true },
  ];
}

// ─── Frequency Multipliers ────────────────────────────────────────────────────

const FREQ_TO_ANNUAL: Record<PayFrequency, number> = {
  weekly: 52,
  fortnightly: 26,
  monthly: 12,
  annually: 1,
};

const FREQ_LABEL: Record<PayFrequency, string> = {
  weekly: 'Weekly',
  fortnightly: 'Fortnightly',
  monthly: 'Monthly',
  annually: 'Annual',
};

// ─── Currency Config ──────────────────────────────────────────────────────────

const REGION_CURRENCY: Record<Region, { symbol: string; code: string; locale: string }> = {
  australia: { symbol: 'A$', code: 'AUD', locale: 'en-AU' },
  india:     { symbol: '₹',  code: 'INR', locale: 'en-IN' },
  usa:       { symbol: '$',  code: 'USD', locale: 'en-US' },
  uk:        { symbol: '£',  code: 'GBP', locale: 'en-GB' },
  custom:    { symbol: '$',  code: 'USD', locale: 'en-US' },
};

const REGION_LABEL: Record<Region, string> = {
  australia: '🇦🇺 Australia (AUD)',
  india:     '🇮🇳 India (INR)',
  usa:       '🇺🇸 USA (USD)',
  uk:        '🇬🇧 UK (GBP)',
  custom:    '⚙️ Custom / Generic',
};

// ─── Default Inputs ───────────────────────────────────────────────────────────

const DEFAULT_INPUTS: PayrollInputs = {
  region: 'australia',
  grossSalary: '',
  payFrequency: 'annually',
  allowances: '',
  superPensionRate: '11',
  indiaRegime: 'new',
  indiaPFRate: '12',
  usaStateTaxRate: '5',
  customBrackets: [
    { id: 1, threshold: 50000, rate: 10 },
    { id: 2, threshold: 100000, rate: 20 },
  ],
  customDeductionRate: '5',
  customPensionRate: '5',
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PayrollTaxCalculatorTab() {
  const [inputs, setInputs] = useState<PayrollInputs>(DEFAULT_INPUTS);
  const [results, setResults] = useState<PayrollResults | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [nextBracketId, setNextBracketId] = useState(3);

  const formatCurrency = useCallback((amount: number, locale: string, code: string) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }, []);

  const validate = useCallback((): boolean => {
    const errs: Record<string, string> = {};
    const salary = parseFloat(inputs.grossSalary);
    if (!inputs.grossSalary || isNaN(salary) || salary <= 0) {
      errs.grossSalary = 'Please enter a valid positive gross salary.';
    }
    const allowances = parseFloat(inputs.allowances || '0');
    if (isNaN(allowances) || allowances < 0) {
      errs.allowances = 'Allowances must be 0 or a positive number.';
    }
    const superRate = parseFloat(inputs.superPensionRate || '0');
    if (isNaN(superRate) || superRate < 0 || superRate > 100) {
      errs.superPensionRate = 'Rate must be between 0 and 100.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [inputs]);

  const calculate = useCallback(() => {
    if (!validate()) return;

    const freq = inputs.payFrequency;
    const multiplier = FREQ_TO_ANNUAL[freq];
    const periodGross = parseFloat(inputs.grossSalary);
    const annualGross = periodGross * multiplier;
    const periodAllowances = parseFloat(inputs.allowances || '0');
    const annualAllowances = periodAllowances * multiplier;
    const superRate = parseFloat(inputs.superPensionRate || '0');
    const { symbol, code, locale } = REGION_CURRENCY[inputs.region];

    let lineItems: TaxLineItem[] = [];

    switch (inputs.region) {
      case 'australia':
        lineItems = calcAustraliaTax(annualGross, annualAllowances, superRate);
        break;
      case 'india': {
        const pfRate = parseFloat(inputs.indiaPFRate || '12');
        lineItems = calcIndiaTax(annualGross, annualAllowances, pfRate, inputs.indiaRegime);
        break;
      }
      case 'usa': {
        const stateTax = parseFloat(inputs.usaStateTaxRate || '0');
        lineItems = calcUSATax(annualGross, annualAllowances, stateTax);
        break;
      }
      case 'uk':
        lineItems = calcUKTax(annualGross, annualAllowances, superRate);
        break;
      case 'custom': {
        const deductionRate = parseFloat(inputs.customDeductionRate || '0');
        const pensionRate = parseFloat(inputs.customPensionRate || '0');
        lineItems = calcCustomTax(annualGross, annualAllowances, inputs.customBrackets, deductionRate, pensionRate);
        break;
      }
    }

    const totalDeductionsItem = lineItems.find(l => l.label === 'Total Deductions');
    const totalDeductions = totalDeductionsItem?.amount ?? 0;
    const annualNetPay = annualGross - totalDeductions;
    const periodNetPay = annualNetPay / multiplier;
    const taxableItem = lineItems.find(l => l.label === 'Taxable Income');

    setResults({
      annualGross,
      annualTaxableIncome: taxableItem?.amount ?? annualGross,
      lineItems,
      annualNetPay,
      periodNetPay,
      periodGross,
      currency: code,
      currencySymbol: symbol,
      locale,
    });
  }, [inputs, validate]);

  // Auto-calculate on input change
  useEffect(() => {
    if (inputs.grossSalary && parseFloat(inputs.grossSalary) > 0) {
      calculate();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputs]);

  const updateInput = <K extends keyof PayrollInputs>(key: K, value: PayrollInputs[K]) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const addBracket = () => {
    const last = inputs.customBrackets[inputs.customBrackets.length - 1];
    const newThreshold = last ? last.threshold + 50000 : 50000;
    setInputs(prev => ({
      ...prev,
      customBrackets: [...prev.customBrackets, { id: nextBracketId, threshold: newThreshold, rate: 25 }],
    }));
    setNextBracketId(n => n + 1);
  };

  const removeBracket = (id: number) => {
    setInputs(prev => ({
      ...prev,
      customBrackets: prev.customBrackets.filter(b => b.id !== id),
    }));
  };

  const updateBracket = (id: number, field: 'threshold' | 'rate', value: string) => {
    setInputs(prev => ({
      ...prev,
      customBrackets: prev.customBrackets.map(b =>
        b.id === id ? { ...b, [field]: parseFloat(value) || 0 } : b
      ),
    }));
  };

  const freq = inputs.payFrequency;
  const multiplier = FREQ_TO_ANNUAL[freq];
  const { code: currCode, locale: currLocale } = REGION_CURRENCY[inputs.region];

  const fmt = (amount: number) => formatCurrency(amount, currLocale, currCode);
  const fmtPeriod = (annualAmount: number) => fmt(annualAmount / multiplier);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Calculator className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Payroll Tax Calculator</h2>
          <p className="text-sm text-muted-foreground">
            Calculate take-home pay for Australia, India, USA, UK, or a custom setup
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Input Panel ── */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Payroll Inputs</CardTitle>
              <CardDescription>Enter salary details and select your region</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Region */}
              <div className="space-y-1.5">
                <Label htmlFor="region">Region / Country</Label>
                <Select value={inputs.region} onValueChange={(v) => updateInput('region', v as Region)}>
                  <SelectTrigger id="region">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(REGION_LABEL) as Region[]).map(r => (
                      <SelectItem key={r} value={r}>{REGION_LABEL[r]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Pay Frequency */}
              <div className="space-y-1.5">
                <Label htmlFor="payFrequency">Pay Frequency</Label>
                <Select value={inputs.payFrequency} onValueChange={(v) => updateInput('payFrequency', v as PayFrequency)}>
                  <SelectTrigger id="payFrequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="fortnightly">Fortnightly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="annually">Annually</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Gross Salary */}
              <div className="space-y-1.5">
                <Label htmlFor="grossSalary">
                  Gross Salary ({FREQ_LABEL[freq]}) — {REGION_CURRENCY[inputs.region].code}
                </Label>
                <Input
                  id="grossSalary"
                  type="number"
                  min="0"
                  placeholder="e.g. 80000"
                  value={inputs.grossSalary}
                  onChange={(e) => updateInput('grossSalary', e.target.value)}
                  className={errors.grossSalary ? 'border-destructive' : ''}
                />
                {errors.grossSalary && (
                  <p className="text-xs text-destructive">{errors.grossSalary}</p>
                )}
              </div>

              {/* Allowances */}
              <div className="space-y-1.5">
                <Label htmlFor="allowances">
                  Allowances ({FREQ_LABEL[freq]}) — optional
                </Label>
                <Input
                  id="allowances"
                  type="number"
                  min="0"
                  placeholder="e.g. 5000"
                  value={inputs.allowances}
                  onChange={(e) => updateInput('allowances', e.target.value)}
                  className={errors.allowances ? 'border-destructive' : ''}
                />
                {errors.allowances && (
                  <p className="text-xs text-destructive">{errors.allowances}</p>
                )}
              </div>

              {/* Region-specific fields */}
              {inputs.region === 'australia' && (
                <div className="space-y-1.5">
                  <Label htmlFor="superRate">Superannuation Rate (%)</Label>
                  <Input
                    id="superRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={inputs.superPensionRate}
                    onChange={(e) => updateInput('superPensionRate', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Info className="h-3 w-3" /> Current SG rate is 11% (FY 2024-25)
                  </p>
                </div>
              )}

              {inputs.region === 'india' && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label>Tax Regime</Label>
                    <div className="flex gap-2">
                      {(['new', 'old'] as IndiaRegime[]).map(r => (
                        <Button
                          key={r}
                          variant={inputs.indiaRegime === r ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updateInput('indiaRegime', r)}
                          className="flex-1 capitalize"
                        >
                          {r} Regime
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="pfRate">Employee PF Contribution (%)</Label>
                    <Input
                      id="pfRate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={inputs.indiaPFRate}
                      onChange={(e) => updateInput('indiaPFRate', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Info className="h-3 w-3" /> Standard EPF rate is 12% of basic salary
                    </p>
                  </div>
                </div>
              )}

              {inputs.region === 'usa' && (
                <div className="space-y-1.5">
                  <Label htmlFor="stateTax">State Income Tax Rate (%)</Label>
                  <Input
                    id="stateTax"
                    type="number"
                    min="0"
                    max="20"
                    step="0.1"
                    value={inputs.usaStateTaxRate}
                    onChange={(e) => updateInput('usaStateTaxRate', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Info className="h-3 w-3" /> Varies by state (0% – ~13%). Enter flat rate.
                  </p>
                </div>
              )}

              {inputs.region === 'uk' && (
                <div className="space-y-1.5">
                  <Label htmlFor="pensionRate">Pension Contribution (%)</Label>
                  <Input
                    id="pensionRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={inputs.superPensionRate}
                    onChange={(e) => updateInput('superPensionRate', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Info className="h-3 w-3" /> Auto-enrolment minimum is 5% employee contribution
                  </p>
                </div>
              )}

              {inputs.region === 'custom' && (
                <div className="space-y-4">
                  <Separator />
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Tax Brackets</Label>
                      <Button variant="outline" size="sm" onClick={addBracket} className="gap-1">
                        <Plus className="h-3.5 w-3.5" /> Add Bracket
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {inputs.customBrackets.map((b, idx) => (
                        <div key={b.id} className="flex items-center gap-2">
                          <div className="flex-1 space-y-0.5">
                            <Label className="text-xs text-muted-foreground">
                              {idx === 0 ? 'Up to' : `${inputs.customBrackets[idx - 1].threshold.toLocaleString()} –`}
                            </Label>
                            <Input
                              type="number"
                              min="0"
                              placeholder="Threshold"
                              value={b.threshold}
                              onChange={(e) => updateBracket(b.id, 'threshold', e.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="w-20 space-y-0.5">
                            <Label className="text-xs text-muted-foreground">Rate %</Label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              placeholder="%"
                              value={b.rate}
                              onChange={(e) => updateBracket(b.id, 'rate', e.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 mt-4 text-destructive hover:text-destructive"
                            onClick={() => removeBracket(b.id)}
                            disabled={inputs.customBrackets.length <= 1}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="customDeduction">Flat Deduction (%)</Label>
                      <Input
                        id="customDeduction"
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={inputs.customDeductionRate}
                        onChange={(e) => updateInput('customDeductionRate', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="customPension">Pension/Super (%)</Label>
                      <Input
                        id="customPension"
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={inputs.customPensionRate}
                        onChange={(e) => updateInput('customPensionRate', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              <Button onClick={calculate} className="w-full gap-2 mt-2">
                <Calculator className="h-4 w-4" />
                Calculate
              </Button>
            </CardContent>
          </Card>

          {/* Region Info Card */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-4 pb-3">
              <RegionInfoBadges region={inputs.region} />
            </CardContent>
          </Card>
        </div>

        {/* ── Results Panel ── */}
        <div className="space-y-4">
          {results ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-3">
                <Card className="border-border/60">
                  <CardContent className="pt-4 pb-3">
                    <p className="text-xs text-muted-foreground mb-1">
                      {FREQ_LABEL[freq]} Gross
                    </p>
                    <p className="text-lg font-bold text-foreground">
                      {fmt(results.periodGross)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-primary/40 bg-primary/5">
                  <CardContent className="pt-4 pb-3">
                    <p className="text-xs text-muted-foreground mb-1">
                      {FREQ_LABEL[freq]} Take-Home
                    </p>
                    <p className="text-lg font-bold text-primary">
                      {fmt(results.periodNetPay)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Breakdown */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Tax Breakdown</CardTitle>
                  <CardDescription>Annual figures with {FREQ_LABEL[freq].toLowerCase()} equivalent</CardDescription>
                </CardHeader>
                <CardContent className="space-y-0">
                  {results.lineItems.map((item, idx) => {
                    const isTotalDeductions = item.label === 'Total Deductions';
                    const isGross = item.label === 'Gross Salary';
                    const isTaxable = item.label === 'Taxable Income';
                    return (
                      <div key={idx}>
                        {isTotalDeductions && <Separator className="my-2" />}
                        <div
                          className={`flex items-center justify-between py-2 px-1 rounded-md ${
                            isTotalDeductions
                              ? 'bg-destructive/5 font-semibold'
                              : isGross
                              ? 'font-medium'
                              : isTaxable
                              ? 'bg-muted/40 font-medium'
                              : ''
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {item.isDeduction && !isTotalDeductions && (
                              <span className="text-destructive text-xs">−</span>
                            )}
                            <span className={`text-sm ${isTotalDeductions ? 'text-destructive' : 'text-foreground'}`}>
                              {item.label}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className={`text-sm font-medium ${isTotalDeductions ? 'text-destructive' : 'text-foreground'}`}>
                              {fmt(item.amount)}
                            </span>
                            {freq !== 'annually' && (
                              <span className="block text-xs text-muted-foreground">
                                {fmtPeriod(item.amount)}/{freq === 'weekly' ? 'wk' : freq === 'fortnightly' ? 'fn' : 'mo'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <Separator className="my-2" />

                  {/* Net Pay */}
                  <div className="flex items-center justify-between py-3 px-2 rounded-lg bg-primary/10 border border-primary/20">
                    <div>
                      <p className="text-sm font-bold text-primary">Net Take-Home Pay</p>
                      <p className="text-xs text-muted-foreground">After all deductions</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">{fmt(results.annualNetPay)}</p>
                      {freq !== 'annually' && (
                        <p className="text-sm font-semibold text-primary/80">
                          {fmt(results.periodNetPay)}/{freq === 'weekly' ? 'wk' : freq === 'fortnightly' ? 'fn' : 'mo'}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Annual vs Period Summary Table */}
              {freq !== 'annually' && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Annual vs {FREQ_LABEL[freq]} Summary</CardTitle>
                </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="font-medium text-muted-foreground">Item</div>
                      <div className="font-medium text-muted-foreground text-right">{FREQ_LABEL[freq]}</div>
                      <div className="font-medium text-muted-foreground text-right">Annual</div>
                      {[
                        { label: 'Gross Pay', annual: results.annualGross },
                        { label: 'Taxable Income', annual: results.annualTaxableIncome },
                        ...results.lineItems
                          .filter(l => l.isDeduction && l.label !== 'Total Deductions')
                          .map(l => ({ label: l.label, annual: l.amount })),
                        { label: 'Net Pay', annual: results.annualNetPay },
                      ].map((row, i) => (
                        <div key={i} className="contents">
                          <div className={`py-1.5 text-xs ${row.label === 'Net Pay' ? 'font-bold text-primary' : 'text-foreground'}`}>
                            {row.label}
                          </div>
                          <div className={`py-1.5 text-xs text-right ${row.label === 'Net Pay' ? 'font-bold text-primary' : 'text-foreground'}`}>
                            {fmt(row.annual / multiplier)}
                          </div>
                          <div className={`py-1.5 text-xs text-right ${row.label === 'Net Pay' ? 'font-bold text-primary' : 'text-foreground'}`}>
                            {fmt(row.annual)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="border-dashed border-border/60">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Calculator className="h-12 w-12 text-muted-foreground/40 mb-4" />
                <p className="text-muted-foreground font-medium">No results yet</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Enter a gross salary and click Calculate
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Region Info Badges ───────────────────────────────────────────────────────

function RegionInfoBadges({ region }: { region: Region }) {
  const info: Record<Region, { label: string; items: string[] }> = {
    australia: {
      label: 'Australia — ATO FY 2024-25',
      items: ['Progressive income tax (0–45%)', 'Medicare Levy 2%', 'Superannuation (SG 11%)'],
    },
    india: {
      label: 'India — FY 2024-25',
      items: ['New & Old regime support', 'Standard deduction ₹50,000', 'PF + Health & Education Cess 4%'],
    },
    usa: {
      label: 'USA — Federal 2024',
      items: ['Federal brackets (10–37%)', 'FICA: SS 6.2% + Medicare 1.45%', 'Configurable state tax'],
    },
    uk: {
      label: 'UK — PAYE 2024-25',
      items: ['Personal Allowance £12,570', 'Basic/Higher/Additional rate bands', 'NI Class 1 employee contributions'],
    },
    custom: {
      label: 'Custom / Generic',
      items: ['User-defined tax brackets', 'Flat deduction rate', 'Configurable pension/super'],
    },
  };

  const { label, items } = info[region];
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-primary">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <Badge key={i} variant="secondary" className="text-xs font-normal">
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
}
