import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText, CreditCard, Landmark, BarChart3, PieChart,
  Building2, Users, ArrowRight, CheckCircle2, Globe, Shield
} from 'lucide-react';

const features = [
  { icon: FileText, title: 'Smart Invoicing', desc: 'Customizable templates, QR codes, credit notes & multi-currency support' },
  { icon: CreditCard, title: 'Online Payments', desc: 'Stripe integration with batch payments, SEPA transfers & check printing' },
  { icon: Landmark, title: 'Banking & Reconciliation', desc: 'Import statements, smart auto-matching & cash register management' },
  { icon: BarChart3, title: 'Advanced Accounting', desc: 'Journal entries, tax engine, audit reports & invoicing thresholds' },
  { icon: PieChart, title: 'Analytic Accounting', desc: 'Cost hierarchies, budget management, analytic plans & mass edit' },
  { icon: Building2, title: 'Assets & Deferred Revenue', desc: 'Depreciation boards, amortization entries & cut-off tools' },
  { icon: Users, title: 'Customer Portal', desc: 'Customers view, download & pay invoices with subscription management' },
  { icon: Globe, title: 'Multi-Currency', desc: 'Daily rate updates, currency conversion & foreign amount display' },
];

export default function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 pointer-events-none" />
        <div className="container mx-auto px-4 py-16 relative">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Left: Branding */}
            <div className="flex-1 text-center lg:text-left space-y-6">
              <div className="flex items-center gap-3 justify-center lg:justify-start">
                <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
                  <img
                    src="/assets/generated/logo-mark.dim_128x128.png"
                    alt="BizAccounts Pro"
                    className="h-10 w-10 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <BarChart3 className="h-8 w-8 text-primary-foreground hidden" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">BizAccounts Pro</h1>
                  <p className="text-sm text-muted-foreground">Enterprise Accounting Suite</p>
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                  Complete Business
                  <span className="text-primary block">Accounting Platform</span>
                </h2>
                <p className="text-lg text-muted-foreground max-w-lg">
                  Invoicing, payments, banking, tax management, and analytics — all in one secure, blockchain-powered platform.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                <Badge variant="secondary" className="gap-1"><Shield className="h-3 w-3" /> Internet Identity</Badge>
                <Badge variant="secondary" className="gap-1"><CheckCircle2 className="h-3 w-3" /> Role-Based Access</Badge>
                <Badge variant="secondary" className="gap-1"><Globe className="h-3 w-3" /> Multi-Currency</Badge>
                <Badge variant="secondary" className="gap-1"><CreditCard className="h-3 w-3" /> Stripe Payments</Badge>
              </div>
            </div>

            {/* Right: Login Card */}
            <div className="w-full max-w-sm">
              <Card className="shadow-xl border-border/60">
                <CardContent className="p-8 space-y-6">
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-semibold">Welcome Back</h3>
                    <p className="text-sm text-muted-foreground">
                      Sign in securely with Internet Identity to access your accounting dashboard
                    </p>
                  </div>

                  <Button
                    onClick={handleLogin}
                    disabled={isLoggingIn}
                    className="w-full gap-2"
                    size="lg"
                  >
                    {isLoggingIn ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        Sign In Securely
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>

                  <div className="space-y-2">
                    <p className="text-xs text-center text-muted-foreground font-medium">Role-based access control</p>
                    <div className="grid grid-cols-3 gap-2 text-xs text-center">
                      <div className="rounded-lg bg-muted/50 p-2">
                        <div className="font-semibold text-foreground">Admin</div>
                        <div className="text-muted-foreground">Full access</div>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-2">
                        <div className="font-semibold text-foreground">Accountant</div>
                        <div className="text-muted-foreground">Finance tools</div>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-2">
                        <div className="font-semibold text-foreground">Customer</div>
                        <div className="text-muted-foreground">Portal only</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-2">Everything You Need</h2>
          <p className="text-muted-foreground">A complete suite of accounting and financial management tools</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature) => (
            <Card key={feature.title} className="border-border/50 hover:border-primary/30 transition-colors">
              <CardContent className="p-5">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
