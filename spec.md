# Specification

## Summary
**Goal:** Add a standalone Payroll Tax Calculator tab to the BizAccounts Pro dashboard supporting Australia, India, USA, UK, and Custom/Generic regions with region-specific tax logic and a detailed breakdown of deductions and net pay.

**Planned changes:**
- Create a new `PayrollTaxCalculatorTab.tsx` component with inputs for gross salary, pay frequency (Weekly/Fortnightly/Monthly/Annually), allowances, super/pension percentage, and a region selector (Australia, India, USA, UK, Custom/Generic)
- Implement region-specific tax calculation logic:
  - **Australia**: ATO progressive brackets (FY 2024-25), 2% Medicare levy, editable employer super (default 11%)
  - **India**: Old and New regime toggle (FY 2024-25), standard deduction, PF contribution, 4% health & education cess
  - **USA**: Federal progressive brackets (2024), FICA Social Security (6.2%) and Medicare (1.45%), flat state tax rate input
  - **UK**: PAYE tax bands (2024-25 with £12,570 personal allowance), National Insurance Class 1 employee contributions
  - **Custom/Generic**: User-defined add/remove tax bracket rows (threshold + rate), flat deduction rate, flat pension/super rate
- Display a results breakdown showing per-period and annual figures for gross pay, allowances, taxable income, income tax, all region-specific deductions, total deductions, and net take-home pay, with correct currency symbols (AUD, INR, USD, GBP)
- Results recalculate live on input change and also on a "Calculate" button click
- Register the new component as a "Payroll Tax Calculator" tab in `Dashboard.tsx` under an appropriate tab group
- Style using existing design tokens (saffron/emerald OKLCH, shadcn primitives, dark mode support) with a card-based input/results layout

**User-visible outcome:** Users can open the "Payroll Tax Calculator" tab, enter salary details, select a region, and immediately see a full breakdown of taxes, statutory deductions, and net take-home pay for both the selected pay period and annually.
