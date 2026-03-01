import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Edit2, ChevronRight, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface CostAccount {
  id: string;
  name: string;
  code: string;
  parentId?: string;
  type: string;
  balance: number;
}

interface AnalyticPlan {
  id: string;
  name: string;
  description: string;
  applicability: string;
}

interface Budget {
  accountId: string;
  accountName: string;
  budgeted: number;
  actual: number;
}

interface AnalyticItem {
  id: string;
  account: string;
  amount: number;
  description: string;
  date: string;
  selected: boolean;
}

const INITIAL_ACCOUNTS: CostAccount[] = [
  { id: 'a1', name: 'Operations', code: '100', type: 'department', balance: 45000 },
  { id: 'a2', name: 'Marketing', code: '200', type: 'department', balance: 12000 },
  { id: 'a3', name: 'IT Infrastructure', code: '101', parentId: 'a1', type: 'project', balance: 18000 },
  { id: 'a4', name: 'HR & Admin', code: '102', parentId: 'a1', type: 'project', balance: 27000 },
  { id: 'a5', name: 'Digital Campaigns', code: '201', parentId: 'a2', type: 'project', balance: 8000 },
];

const INITIAL_BUDGETS: Budget[] = [
  { accountId: 'a1', accountName: 'Operations', budgeted: 50000, actual: 45000 },
  { accountId: 'a2', accountName: 'Marketing', budgeted: 15000, actual: 12000 },
  { accountId: 'a3', accountName: 'IT Infrastructure', budgeted: 20000, actual: 18000 },
  { accountId: 'a4', accountName: 'HR & Admin', budgeted: 30000, actual: 27000 },
];

const INITIAL_ITEMS: AnalyticItem[] = [
  { id: 'i1', account: 'Operations', amount: 5000, description: 'Server costs', date: '2026-02-01', selected: false },
  { id: 'i2', account: 'Marketing', amount: 2000, description: 'Ad spend', date: '2026-02-03', selected: false },
  { id: 'i3', account: 'IT Infrastructure', amount: 3500, description: 'Software licenses', date: '2026-02-05', selected: false },
  { id: 'i4', account: 'HR & Admin', amount: 8000, description: 'Payroll', date: '2026-02-10', selected: false },
];

export default function AnalyticAccountingTab() {
  const [accounts, setAccounts] = useState<CostAccount[]>(INITIAL_ACCOUNTS);
  const [plans, setPlans] = useState<AnalyticPlan[]>([
    { id: 'p1', name: 'Departmental', description: 'By department', applicability: 'All transactions' },
    { id: 'p2', name: 'Project-Based', description: 'By project', applicability: 'Project invoices' },
  ]);
  const [budgets, setBudgets] = useState<Budget[]>(INITIAL_BUDGETS);
  const [items, setItems] = useState<AnalyticItem[]>(INITIAL_ITEMS);
  const [newAccount, setNewAccount] = useState({ name: '', code: '', parentId: '', type: 'department' });
  const [newPlan, setNewPlan] = useState({ name: '', description: '', applicability: '' });
  const [editingBudget, setEditingBudget] = useState<string | null>(null);
  const [bulkAmount, setBulkAmount] = useState('');

  const addAccount = () => {
    if (!newAccount.name || !newAccount.code) { toast.error('Name and code required'); return; }
    setAccounts(prev => [...prev, { ...newAccount, id: Date.now().toString(), balance: 0 }]);
    setNewAccount({ name: '', code: '', parentId: '', type: 'department' });
    toast.success('Account added');
  };

  const addPlan = () => {
    if (!newPlan.name) { toast.error('Plan name required'); return; }
    setPlans(prev => [...prev, { ...newPlan, id: Date.now().toString() }]);
    setNewPlan({ name: '', description: '', applicability: '' });
    toast.success('Plan added');
  };

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, selected: !i.selected } : i));
  };

  const applyBulkUpdate = () => {
    const selected = items.filter(i => i.selected);
    if (selected.length === 0) { toast.error('Select items first'); return; }
    if (!bulkAmount) { toast.error('Enter amount'); return; }
    setItems(prev => prev.map(i => i.selected ? { ...i, amount: parseFloat(bulkAmount), selected: false } : i));
    setBulkAmount('');
    toast.success(`Updated ${selected.length} items`);
  };

  const renderAccountTree = (parentId?: string, depth = 0) => {
    return accounts
      .filter(a => a.parentId === parentId)
      .map(account => (
        <div key={account.id}>
          <div
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/30 cursor-pointer"
            style={{ paddingLeft: `${(depth + 1) * 16}px` }}
          >
            {accounts.some(a => a.parentId === account.id) && (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium">{account.name}</span>
              <span className="text-xs text-muted-foreground ml-2">{account.code}</span>
            </div>
            <Badge variant="outline" className="text-[10px]">{account.type}</Badge>
            <span className="text-sm font-medium text-green-600">${account.balance.toLocaleString()}</span>
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => {
              setAccounts(prev => prev.filter(a => a.id !== account.id));
              toast.success('Account removed');
            }}>
              <Trash2 className="h-3 w-3 text-destructive" />
            </Button>
          </div>
          {renderAccountTree(account.id, depth + 1)}
        </div>
      ));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Analytic Accounting</h2>
        <p className="text-muted-foreground">Cost account hierarchies, analytic plans, budget management, and mass edit</p>
      </div>

      <Tabs defaultValue="accounts">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="accounts">Cost Accounts</TabsTrigger>
          <TabsTrigger value="plans">Analytic Plans</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="mass-edit">Mass Edit</TabsTrigger>
        </TabsList>

        {/* Cost Account Hierarchy */}
        <TabsContent value="accounts" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cost Account Hierarchy</CardTitle>
              <CardDescription>Organize accounts in parent-child hierarchies by project, department, or contract</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border/50 p-2 space-y-1">
                {renderAccountTree(undefined)}
              </div>

              <div className="p-4 rounded-lg bg-muted/30 space-y-3">
                <p className="text-sm font-medium">Add Account</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Name *</Label>
                    <Input placeholder="Account name" className="h-8 text-xs" value={newAccount.name} onChange={e => setNewAccount(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Code *</Label>
                    <Input placeholder="e.g. 300" className="h-8 text-xs" value={newAccount.code} onChange={e => setNewAccount(p => ({ ...p, code: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Parent Account</Label>
                    <Select value={newAccount.parentId} onValueChange={v => setNewAccount(p => ({ ...p, parentId: v }))}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="None (root)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None (root)</SelectItem>
                        {accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Type</Label>
                    <Select value={newAccount.type} onValueChange={v => setNewAccount(p => ({ ...p, type: v }))}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="department">Department</SelectItem>
                        <SelectItem value="project">Project</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button size="sm" onClick={addAccount} className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Add Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytic Plans */}
        <TabsContent value="plans" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Analytic Plans</CardTitle>
              <CardDescription>Manage multiple analytic plans with sub-plans and applicability conditions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {plans.map(plan => (
                  <div key={plan.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                    <div>
                      <p className="text-sm font-medium">{plan.name}</p>
                      <p className="text-xs text-muted-foreground">{plan.description}</p>
                      <Badge variant="outline" className="text-[10px] mt-1">{plan.applicability || 'All'}</Badge>
                    </div>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => {
                      setPlans(prev => prev.filter(p => p.id !== plan.id));
                      toast.success('Plan removed');
                    }}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-lg bg-muted/30 space-y-3">
                <p className="text-sm font-medium">Add Plan</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Plan Name *</Label>
                    <Input placeholder="e.g. Regional" className="h-8 text-xs" value={newPlan.name} onChange={e => setNewPlan(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Description</Label>
                    <Input placeholder="Brief description" className="h-8 text-xs" value={newPlan.description} onChange={e => setNewPlan(p => ({ ...p, description: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Applicability</Label>
                    <Input placeholder="e.g. Sales invoices" className="h-8 text-xs" value={newPlan.applicability} onChange={e => setNewPlan(p => ({ ...p, applicability: e.target.value }))} />
                  </div>
                </div>
                <Button size="sm" onClick={addPlan} className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Add Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budget Management */}
        <TabsContent value="budgets" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Budget vs Actual</CardTitle>
              <CardDescription>Compare budgeted amounts with actual performance per account</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead className="text-right">Budgeted</TableHead>
                    <TableHead className="text-right">Actual</TableHead>
                    <TableHead className="text-right">Variance</TableHead>
                    <TableHead className="text-right">%</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgets.map(b => {
                    const variance = b.actual - b.budgeted;
                    const pct = b.budgeted > 0 ? ((b.actual / b.budgeted) * 100).toFixed(1) : '0';
                    const isOver = b.actual > b.budgeted;
                    return (
                      <TableRow key={b.accountId}>
                        <TableCell className="text-sm font-medium">{b.accountName}</TableCell>
                        <TableCell className="text-sm text-right">
                          {editingBudget === b.accountId ? (
                            <Input
                              type="number"
                              defaultValue={b.budgeted}
                              className="h-7 w-24 text-xs text-right ml-auto"
                              onBlur={e => {
                                setBudgets(prev => prev.map(bud => bud.accountId === b.accountId ? { ...bud, budgeted: parseFloat(e.target.value) || bud.budgeted } : bud));
                                setEditingBudget(null);
                              }}
                              autoFocus
                            />
                          ) : (
                            `$${b.budgeted.toLocaleString()}`
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-right">${b.actual.toLocaleString()}</TableCell>
                        <TableCell className={`text-sm text-right font-medium ${isOver ? 'text-red-600' : 'text-green-600'}`}>
                          {isOver ? '+' : ''}{variance.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm text-right">
                          <Badge className={`text-[10px] ${isOver ? 'bg-red-500/20 text-red-700 border-red-500/30' : 'bg-green-500/20 text-green-700 border-green-500/30'}`}>
                            {pct}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditingBudget(b.accountId)}>
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mass Edit */}
        <TabsContent value="mass-edit" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <CardTitle className="text-base">Mass Edit Analytic Items</CardTitle>
                  <CardDescription>Select multiple items and apply bulk updates</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="New amount"
                    className="h-8 w-32 text-xs"
                    value={bulkAmount}
                    onChange={e => setBulkAmount(e.target.value)}
                  />
                  <Button size="sm" onClick={applyBulkUpdate} className="gap-1.5 h-8">
                    <Save className="h-3.5 w-3.5" /> Apply to Selected
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={items.every(i => i.selected)}
                        onCheckedChange={v => setItems(prev => prev.map(i => ({ ...i, selected: !!v })))}
                      />
                    </TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map(item => (
                    <TableRow key={item.id} className={item.selected ? 'bg-primary/5' : ''}>
                      <TableCell>
                        <Checkbox checked={item.selected} onCheckedChange={() => toggleItem(item.id)} />
                      </TableCell>
                      <TableCell className="text-sm">{item.account}</TableCell>
                      <TableCell className="text-sm">{item.description}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.date}</TableCell>
                      <TableCell className="text-sm text-right font-medium">${item.amount.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <p className="text-xs text-muted-foreground mt-2">
                {items.filter(i => i.selected).length} of {items.length} items selected
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
