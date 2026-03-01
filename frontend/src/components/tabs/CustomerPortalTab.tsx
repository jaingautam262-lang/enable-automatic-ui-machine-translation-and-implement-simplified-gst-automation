import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  FileText, Download, CreditCard, Package, RefreshCw,
  CheckCircle2, Clock, Truck, AlertCircle, XCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface CustomerInvoice {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  amount: number;
  status: 'paid' | 'unpaid' | 'overdue';
  client: string;
}

interface Subscription {
  id: string;
  plan: string;
  billingCycle: string;
  nextBillingDate: string;
  amount: number;
  status: 'active' | 'cancelled' | 'paused';
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  amount: number;
  estimatedDelivery: string;
}

const MOCK_INVOICES: CustomerInvoice[] = [
  { id: '1', number: 'INV-2026-001', date: '2026-01-15', dueDate: '2026-02-15', amount: 4500, status: 'paid', client: 'My Company' },
  { id: '2', number: 'INV-2026-002', date: '2026-02-01', dueDate: '2026-03-01', amount: 2800, status: 'unpaid', client: 'My Company' },
  { id: '3', number: 'INV-2026-003', date: '2026-01-01', dueDate: '2026-01-31', amount: 1200, status: 'overdue', client: 'My Company' },
];

const MOCK_SUBSCRIPTIONS: Subscription[] = [
  { id: 's1', plan: 'Professional Plan', billingCycle: 'Monthly', nextBillingDate: '2026-03-01', amount: 299, status: 'active' },
  { id: 's2', plan: 'Storage Add-on', billingCycle: 'Annual', nextBillingDate: '2027-01-01', amount: 120, status: 'active' },
];

const MOCK_ORDERS: Order[] = [
  { id: 'o1', orderNumber: 'ORD-2026-001', date: '2026-02-01', status: 'delivered', amount: 4500, estimatedDelivery: '2026-02-10' },
  { id: 'o2', orderNumber: 'ORD-2026-002', date: '2026-02-15', status: 'shipped', amount: 2800, estimatedDelivery: '2026-02-25' },
  { id: 'o3', orderNumber: 'ORD-2026-003', date: '2026-02-20', status: 'processing', amount: 1200, estimatedDelivery: '2026-03-05' },
];

const statusColors: Record<string, string> = {
  paid: 'bg-green-500/20 text-green-700 border-green-500/30',
  unpaid: 'bg-amber-500/20 text-amber-700 border-amber-500/30',
  overdue: 'bg-red-500/20 text-red-700 border-red-500/30',
  active: 'bg-green-500/20 text-green-700 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-700 border-red-500/30',
  paused: 'bg-gray-500/20 text-gray-700 border-gray-500/30',
  delivered: 'bg-green-500/20 text-green-700 border-green-500/30',
  shipped: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
  processing: 'bg-amber-500/20 text-amber-700 border-amber-500/30',
  pending: 'bg-gray-500/20 text-gray-700 border-gray-500/30',
};

const orderStatusIcon: Record<string, React.ReactNode> = {
  pending: <Clock className="h-4 w-4 text-gray-500" />,
  processing: <RefreshCw className="h-4 w-4 text-amber-500" />,
  shipped: <Truck className="h-4 w-4 text-blue-500" />,
  delivered: <CheckCircle2 className="h-4 w-4 text-green-500" />,
};

export default function CustomerPortalTab() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(MOCK_SUBSCRIPTIONS);

  const handleDownloadPDF = (invoice: CustomerInvoice) => {
    // Simulate PDF download
    const content = `Invoice: ${invoice.number}\nDate: ${invoice.date}\nAmount: $${invoice.amount}\nStatus: ${invoice.status}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoice.number}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${invoice.number}`);
  };

  const handlePayNow = (invoice: CustomerInvoice) => {
    toast.info(`Redirecting to payment for ${invoice.number} ($${invoice.amount})...`);
    // In a real implementation, this would initiate Stripe checkout
  };

  const handleCancelSubscription = (id: string) => {
    setSubscriptions(prev =>
      prev.map(s => s.id === id ? { ...s, status: 'cancelled' as const } : s)
    );
    toast.success('Subscription cancelled');
  };

  const handleUpgradeSubscription = (id: string) => {
    toast.info('Redirecting to upgrade options...');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Customer Portal</h2>
        <p className="text-muted-foreground">View your invoices, manage subscriptions, and track orders</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Outstanding</p>
              <p className="text-xl font-bold">
                ${MOCK_INVOICES.filter(i => i.status !== 'paid').reduce((s, i) => s + i.amount, 0).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active Subscriptions</p>
              <p className="text-xl font-bold">{subscriptions.filter(s => s.status === 'active').length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active Orders</p>
              <p className="text-xl font-bold">{MOCK_ORDERS.filter(o => o.status !== 'delivered').length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="invoices">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="invoices">My Invoices</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        {/* My Invoices */}
        <TabsContent value="invoices" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" /> My Invoices
              </CardTitle>
              <CardDescription>View, download, and pay your invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_INVOICES.map(invoice => (
                    <TableRow key={invoice.id}>
                      <TableCell className="text-sm font-mono font-medium">{invoice.number}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{invoice.date}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{invoice.dueDate}</TableCell>
                      <TableCell className="text-sm text-right font-semibold">${invoice.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={`text-[10px] capitalize ${statusColors[invoice.status]}`}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs gap-1"
                            onClick={() => handleDownloadPDF(invoice)}
                          >
                            <Download className="h-3 w-3" /> PDF
                          </Button>
                          {invoice.status !== 'paid' && (
                            <Button
                              size="sm"
                              className="h-7 text-xs gap-1"
                              onClick={() => handlePayNow(invoice)}
                            >
                              <CreditCard className="h-3 w-3" /> Pay
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscriptions */}
        <TabsContent value="subscriptions" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">My Subscriptions</CardTitle>
              <CardDescription>Manage your active subscriptions and billing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {subscriptions.map(sub => (
                <div key={sub.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{sub.plan}</p>
                      <Badge className={`text-[10px] capitalize ${statusColors[sub.status]}`}>
                        {sub.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {sub.billingCycle} · Next billing: {sub.nextBillingDate}
                    </p>
                    <p className="text-sm font-semibold">${sub.amount}/cycle</p>
                  </div>
                  {sub.status === 'active' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs"
                        onClick={() => handleUpgradeSubscription(sub.id)}
                      >
                        Upgrade
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-xs text-destructive hover:text-destructive"
                        onClick={() => handleCancelSubscription(sub.id)}
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1" /> Cancel
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders */}
        <TabsContent value="orders" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4" /> Order Tracking
              </CardTitle>
              <CardDescription>Track the status of your orders</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {MOCK_ORDERS.map(order => (
                <div key={order.id} className="p-4 rounded-lg border border-border/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {orderStatusIcon[order.status]}
                      <div>
                        <p className="font-medium text-sm">{order.orderNumber}</p>
                        <p className="text-xs text-muted-foreground">Ordered {order.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`text-[10px] capitalize ${statusColors[order.status]}`}>
                        {order.status}
                      </Badge>
                      <p className="text-sm font-semibold mt-1">${order.amount.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Status Timeline */}
                  <div className="flex items-center gap-1">
                    {(['pending', 'processing', 'shipped', 'delivered'] as const).map((step, i) => {
                      const steps = ['pending', 'processing', 'shipped', 'delivered'];
                      const currentIdx = steps.indexOf(order.status);
                      const stepIdx = steps.indexOf(step);
                      const isCompleted = stepIdx <= currentIdx;
                      return (
                        <div key={step} className="flex items-center flex-1">
                          <div className={`h-2 w-2 rounded-full shrink-0 ${isCompleted ? 'bg-primary' : 'bg-muted'}`} />
                          {i < 3 && <div className={`h-0.5 flex-1 ${stepIdx < currentIdx ? 'bg-primary' : 'bg-muted'}`} />}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Pending</span>
                    <span>Processing</span>
                    <span>Shipped</span>
                    <span>Delivered</span>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Estimated delivery: <span className="font-medium text-foreground">{order.estimatedDelivery}</span>
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
