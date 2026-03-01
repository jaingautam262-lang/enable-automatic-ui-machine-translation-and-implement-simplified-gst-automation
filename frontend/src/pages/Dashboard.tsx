import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LayoutDashboard, FileText, CreditCard, Landmark, BookOpen,
  PieChart, Building2, Users, ArrowLeftRight, Globe2, Settings,
  BarChart3, Package, Calculator, UserCog, Building, Receipt, Zap, TrendingUp, Percent, DollarSign
} from 'lucide-react';

// Existing tabs
import OverviewTab from '../components/tabs/OverviewTab';
import TransactionsTab from '../components/tabs/TransactionsTab';
import InventoryTab from '../components/tabs/InventoryTab';
import InvoicesTab from '../components/tabs/InvoicesTab';
import ReportsTab from '../components/tabs/ReportsTab';
import SettingsTab from '../components/tabs/SettingsTab';
import JournalLedgerTab from '../components/tabs/JournalLedgerTab';
import BankReconciliationTab from '../components/tabs/BankReconciliationTab';
import CAConsultationTab from '../components/tabs/CAConsultationTab';
import PayrollTab from '../components/tabs/PayrollTab';
import FinancialCalculatorsTab from '../components/tabs/FinancialCalculatorsTab';
import CAProfileManagementTab from '../components/tabs/CAProfileManagementTab';
import GovernanceTab from '../components/tabs/GovernanceTab';
import TDSTCSModuleTab from '../components/tabs/TDSTCSModuleTab';
import AdvancedAnalyticsTab from '../components/tabs/AdvancedAnalyticsTab';
import GSTPurchaseInvoicesTab from '../components/tabs/GSTPurchaseInvoicesTab';
import GSTAutomationTab from '../components/tabs/GSTAutomationTab';

// New MVP tabs
import PaymentsTab from '../components/tabs/PaymentsTab';
import BankingTab from '../components/tabs/BankingTab';
import AccountingTab from '../components/tabs/AccountingTab';
import AnalyticAccountingTab from '../components/tabs/AnalyticAccountingTab';
import AssetsTab from '../components/tabs/AssetsTab';
import CustomerPortalTab from '../components/tabs/CustomerPortalTab';
import ImportExportTab from '../components/tabs/ImportExportTab';
import CurrencyManagementTab from '../components/tabs/CurrencyManagementTab';
import TaxRateManagementTab from '../components/tabs/TaxRateManagementTab';

// New standalone calculator
import PayrollTaxCalculatorTab from '../components/tabs/PayrollTaxCalculatorTab';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const navGroups = [
    {
      label: 'Core',
      items: [
        { value: 'overview', icon: LayoutDashboard, label: 'Overview' },
        { value: 'analytics', icon: TrendingUp, label: 'Analytics' },
        { value: 'transactions', icon: ArrowLeftRight, label: 'Transactions' },
      ]
    },
    {
      label: 'Finance',
      items: [
        { value: 'invoices', icon: FileText, label: 'Invoices' },
        { value: 'payments', icon: CreditCard, label: 'Payments' },
        { value: 'banking', icon: Landmark, label: 'Banking' },
        { value: 'accounting', icon: BookOpen, label: 'Accounting' },
        { value: 'journal', icon: BookOpen, label: 'Journal' },
        { value: 'bank-recon', icon: Landmark, label: 'Bank Recon' },
      ]
    },
    {
      label: 'Advanced',
      items: [
        { value: 'analytic', icon: PieChart, label: 'Analytic' },
        { value: 'assets', icon: Building2, label: 'Assets' },
        { value: 'currency', icon: Globe2, label: 'Currency' },
        { value: 'reports', icon: BarChart3, label: 'Reports' },
      ]
    },
    {
      label: 'Operations',
      items: [
        { value: 'inventory', icon: Package, label: 'Inventory' },
        { value: 'payroll', icon: Users, label: 'Payroll' },
        { value: 'payroll-tax-calculator', icon: DollarSign, label: 'Payroll Tax' },
        { value: 'tds-tcs', icon: Calculator, label: 'TDS/TCS' },
        { value: 'gst-purchase', icon: Receipt, label: 'GST Purchase' },
        { value: 'gst-automation', icon: Zap, label: 'GST Auto' },
        { value: 'tax-rates', icon: Percent, label: 'Tax Rates' },
      ]
    },
    {
      label: 'Portal & Tools',
      items: [
        { value: 'customer-portal', icon: Users, label: 'Customer Portal' },
        { value: 'import-export', icon: ArrowLeftRight, label: 'Import/Export' },
        { value: 'calculators', icon: Calculator, label: 'Calculators' },
        { value: 'ca-consultation', icon: UserCog, label: 'CA Consult' },
        { value: 'ca-admin', icon: UserCog, label: 'CA Admin' },
        { value: 'governance', icon: Building, label: 'Governance' },
        { value: 'settings', icon: Settings, label: 'Settings' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          {/* Navigation */}
          <div className="overflow-x-auto pb-1">
            <TabsList className="inline-flex h-auto flex-wrap gap-1 p-1.5 bg-card border border-border/50 rounded-xl min-w-full">
              {navGroups.map((group) => (
                <div key={group.label} className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground px-1 hidden lg:inline">{group.label}:</span>
                  {group.items.map((item) => (
                    <TabsTrigger
                      key={item.value}
                      value={item.value}
                      className="gap-1.5 text-xs px-2.5 py-1.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <item.icon className="h-3.5 w-3.5 shrink-0" />
                      <span className="hidden sm:inline whitespace-nowrap">{item.label}</span>
                    </TabsTrigger>
                  ))}
                  <div className="w-px h-5 bg-border/50 mx-1 hidden lg:block last:hidden" />
                </div>
              ))}
            </TabsList>
          </div>

          {/* Tab Content */}
          <TabsContent value="overview"><OverviewTab /></TabsContent>
          <TabsContent value="analytics"><AdvancedAnalyticsTab /></TabsContent>
          <TabsContent value="transactions"><TransactionsTab /></TabsContent>
          <TabsContent value="invoices"><InvoicesTab /></TabsContent>
          <TabsContent value="payments"><PaymentsTab /></TabsContent>
          <TabsContent value="banking"><BankingTab /></TabsContent>
          <TabsContent value="accounting"><AccountingTab /></TabsContent>
          <TabsContent value="journal"><JournalLedgerTab /></TabsContent>
          <TabsContent value="bank-recon"><BankReconciliationTab /></TabsContent>
          <TabsContent value="analytic"><AnalyticAccountingTab /></TabsContent>
          <TabsContent value="assets"><AssetsTab /></TabsContent>
          <TabsContent value="currency"><CurrencyManagementTab /></TabsContent>
          <TabsContent value="reports"><ReportsTab /></TabsContent>
          <TabsContent value="inventory"><InventoryTab /></TabsContent>
          <TabsContent value="payroll"><PayrollTab /></TabsContent>
          <TabsContent value="payroll-tax-calculator"><PayrollTaxCalculatorTab /></TabsContent>
          <TabsContent value="tds-tcs"><TDSTCSModuleTab /></TabsContent>
          <TabsContent value="gst-purchase"><GSTPurchaseInvoicesTab /></TabsContent>
          <TabsContent value="gst-automation"><GSTAutomationTab /></TabsContent>
          <TabsContent value="tax-rates"><TaxRateManagementTab /></TabsContent>
          <TabsContent value="customer-portal"><CustomerPortalTab /></TabsContent>
          <TabsContent value="import-export"><ImportExportTab /></TabsContent>
          <TabsContent value="calculators"><FinancialCalculatorsTab /></TabsContent>
          <TabsContent value="ca-consultation"><CAConsultationTab /></TabsContent>
          <TabsContent value="ca-admin"><CAProfileManagementTab /></TabsContent>
          <TabsContent value="governance"><GovernanceTab /></TabsContent>
          <TabsContent value="settings"><SettingsTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
