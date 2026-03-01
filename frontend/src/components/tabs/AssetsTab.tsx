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
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Play, TrendingDown, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface AssetRecord {
  id: string;
  name: string;
  cost: number;
  purchaseDate: string;
  method: 'slm' | 'wdv';
  usefulLife: number;
  residualValue: number;
  currentValue: number;
}

interface DeferredItem {
  id: string;
  name: string;
  type: 'revenue' | 'expense';
  totalAmount: number;
  startDate: string;
  months: number;
  recognized: number;
}

interface JournalEntryForEdit {
  id: string;
  date: string;
  description: string;
  amount: number;
  selected: boolean;
}

interface DepreciationRow {
  period: string;
  depreciation: number;
  accumulated: number;
  remaining: number;
}

const INITIAL_ASSETS: AssetRecord[] = [
  { id: 'a1', name: 'Office Equipment', cost: 50000, purchaseDate: '2024-01-01', method: 'slm', usefulLife: 5, residualValue: 5000, currentValue: 40000 },
  { id: 'a2', name: 'Company Vehicle', cost: 120000, purchaseDate: '2023-06-01', method: 'wdv', usefulLife: 8, residualValue: 10000, currentValue: 85000 },
  { id: 'a3', name: 'Server Infrastructure', cost: 80000, purchaseDate: '2024-03-01', method: 'slm', usefulLife: 4, residualValue: 0, currentValue: 60000 },
];

const INITIAL_DEFERRED: DeferredItem[] = [
  { id: 'd1', name: 'Annual Software License', type: 'expense', totalAmount: 12000, startDate: '2026-01-01', months: 12, recognized: 2000 },
  { id: 'd2', name: 'Prepaid Consulting Revenue', type: 'revenue', totalAmount: 36000, startDate: '2026-01-01', months: 12, recognized: 6000 },
];

function calcDepreciation(asset: AssetRecord): DepreciationRow[] {
  const schedule: DepreciationRow[] = [];
  const depreciableAmount = asset.cost - asset.residualValue;
  let accumulated = 0;
  let remaining = asset.cost;

  for (let year = 1; year <= asset.usefulLife; year++) {
    let dep = 0;
    if (asset.method === 'slm') {
      dep = depreciableAmount / asset.usefulLife;
    } else {
      const rate = 1 - Math.pow(asset.residualValue / asset.cost, 1 / asset.usefulLife);
      dep = remaining * rate;
    }
    accumulated += dep;
    remaining -= dep;
    schedule.push({
      period: `Year ${year}`,
      depreciation: Math.round(dep),
      accumulated: Math.round(accumulated),
      remaining: Math.max(0, Math.round(remaining)),
    });
  }
  return schedule;
}

export default function AssetsTab() {
  const [assets, setAssets] = useState<AssetRecord[]>(INITIAL_ASSETS);
  const [deferred, setDeferred] = useState<DeferredItem[]>(INITIAL_DEFERRED);
  const [selectedAsset, setSelectedAsset] = useState<AssetRecord | null>(null);
  const [journalEntries, setJournalEntries] = useState<JournalEntryForEdit[]>([
    { id: 'je1', date: '2026-02-01', description: 'Depreciation - Office Equipment', amount: 9000, selected: false },
    { id: 'je2', date: '2026-02-01', description: 'Depreciation - Company Vehicle', amount: 17500, selected: false },
    { id: 'je3', date: '2026-02-01', description: 'Depreciation - Server Infrastructure', amount: 20000, selected: false },
  ]);
  const [newAsset, setNewAsset] = useState({
    name: '', cost: '', purchaseDate: '',
    method: 'slm' as 'slm' | 'wdv', usefulLife: '5', residualValue: '0'
  });
  const [splitPeriods, setSplitPeriods] = useState('3');
  const [newDeferred, setNewDeferred] = useState({
    name: '', type: 'expense' as 'revenue' | 'expense',
    totalAmount: '', startDate: '', months: '12'
  });

  const addAsset = () => {
    if (!newAsset.name || !newAsset.cost) { toast.error('Name and cost required'); return; }
    const asset: AssetRecord = {
      id: Date.now().toString(),
      name: newAsset.name,
      cost: parseFloat(newAsset.cost),
      purchaseDate: newAsset.purchaseDate || new Date().toISOString().split('T')[0],
      method: newAsset.method,
      usefulLife: parseInt(newAsset.usefulLife) || 5,
      residualValue: parseFloat(newAsset.residualValue) || 0,
      currentValue: parseFloat(newAsset.cost),
    };
    setAssets(prev => [...prev, asset]);
    setNewAsset({ name: '', cost: '', purchaseDate: '', method: 'slm', usefulLife: '5', residualValue: '0' });
    toast.success('Asset added');
  };

  const runDepreciation = () => {
    const entries: JournalEntryForEdit[] = assets.map(a => {
      const schedule = calcDepreciation(a);
      const yearDep = schedule[0]?.depreciation || 0;
      return {
        id: Date.now().toString() + a.id,
        date: new Date().toISOString().split('T')[0],
        description: `Depreciation - ${a.name}`,
        amount: yearDep,
        selected: false
      };
    });
    setJournalEntries(prev => [...prev, ...entries]);
    toast.success(`Generated ${entries.length} depreciation entries`);
  };

  const applyCutoff = () => {
    const selected = journalEntries.filter(e => e.selected);
    if (selected.length === 0) { toast.error('Select entries first'); return; }
    const n = parseInt(splitPeriods) || 3;
    const newEntries: JournalEntryForEdit[] = selected.flatMap(e => {
      const splitAmount = Math.round(e.amount / n);
      return Array.from({ length: n }, (_, i) => ({
        id: `${e.id}-split-${i}`,
        date: e.date,
        description: `${e.description} (Period ${i + 1}/${n})`,
        amount: splitAmount,
        selected: false,
      }));
    });
    setJournalEntries(prev => [
      ...prev.filter(e => !e.selected),
      ...newEntries,
    ]);
    toast.success(`Split ${selected.length} entries into ${n} periods each`);
  };

  const addDeferredItem = () => {
    if (!newDeferred.name || !newDeferred.totalAmount) { toast.error('Name and amount required'); return; }
    const item: DeferredItem = {
      id: Date.now().toString(),
      name: newDeferred.name,
      type: newDeferred.type,
      totalAmount: parseFloat(newDeferred.totalAmount),
      startDate: newDeferred.startDate || new Date().toISOString().split('T')[0],
      months: parseInt(newDeferred.months) || 12,
      recognized: 0,
    };
    setDeferred(prev => [...prev, item]);
    setNewDeferred({ name: '', type: 'expense', totalAmount: '', startDate: '', months: '12' });
    toast.success('Deferred item added');
  };

  const toggleEntry = (id: string) => {
    setJournalEntries(prev => prev.map(e => e.id === id ? { ...e, selected: !e.selected } : e));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Assets & Deferred Revenue</h2>
        <p className="text-muted-foreground">Asset tracking, depreciation schedules, deferred items, and cut-off tools</p>
      </div>

      <Tabs defaultValue="assets">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="depreciation">Depreciation</TabsTrigger>
          <TabsTrigger value="deferred">Deferred Items</TabsTrigger>
          <TabsTrigger value="cutoff">Cut-off Tool</TabsTrigger>
        </TabsList>

        {/* Assets List */}
        <TabsContent value="assets" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Asset Register</CardTitle>
              <CardDescription>Track all fixed assets with depreciation parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset Name</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Life</TableHead>
                    <TableHead className="text-right">Current Value</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.map(asset => (
                    <TableRow
                      key={asset.id}
                      className="cursor-pointer hover:bg-muted/30"
                      onClick={() => setSelectedAsset(asset === selectedAsset ? null : asset)}
                    >
                      <TableCell className="text-sm font-medium">{asset.name}</TableCell>
                      <TableCell className="text-sm text-right">${asset.cost.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] uppercase">{asset.method}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{asset.usefulLife}y</TableCell>
                      <TableCell className="text-sm text-right font-medium text-blue-600">
                        ${asset.currentValue.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={e => { e.stopPropagation(); setSelectedAsset(asset); }}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={e => {
                              e.stopPropagation();
                              setAssets(prev => prev.filter(a => a.id !== asset.id));
                              if (selectedAsset?.id === asset.id) setSelectedAsset(null);
                              toast.success('Asset removed');
                            }}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {selectedAsset && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <TrendingDown className="h-4 w-4" /> Depreciation Schedule: {selectedAsset.name}
                  </p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Period</TableHead>
                        <TableHead className="text-right">Depreciation</TableHead>
                        <TableHead className="text-right">Accumulated</TableHead>
                        <TableHead className="text-right">Remaining</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {calcDepreciation(selectedAsset).map(row => (
                        <TableRow key={row.period}>
                          <TableCell className="text-xs">{row.period}</TableCell>
                          <TableCell className="text-xs text-right text-red-600">${row.depreciation.toLocaleString()}</TableCell>
                          <TableCell className="text-xs text-right">${row.accumulated.toLocaleString()}</TableCell>
                          <TableCell className="text-xs text-right font-medium">${row.remaining.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              <Separator />

              <div className="p-4 rounded-lg bg-muted/30 space-y-3">
                <p className="text-sm font-medium">Add New Asset</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Asset Name *</Label>
                    <Input
                      placeholder="e.g. Laptop"
                      className="h-8 text-xs"
                      value={newAsset.name}
                      onChange={e => setNewAsset(p => ({ ...p, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Cost *</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      className="h-8 text-xs"
                      value={newAsset.cost}
                      onChange={e => setNewAsset(p => ({ ...p, cost: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Purchase Date</Label>
                    <Input
                      type="date"
                      className="h-8 text-xs"
                      value={newAsset.purchaseDate}
                      onChange={e => setNewAsset(p => ({ ...p, purchaseDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Method</Label>
                    <Select
                      value={newAsset.method}
                      onValueChange={v => setNewAsset(p => ({ ...p, method: v as 'slm' | 'wdv' }))}
                    >
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="slm">Straight-Line (SLM)</SelectItem>
                        <SelectItem value="wdv">Declining Balance (WDV)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Useful Life (years)</Label>
                    <Input
                      type="number"
                      placeholder="5"
                      className="h-8 text-xs"
                      value={newAsset.usefulLife}
                      onChange={e => setNewAsset(p => ({ ...p, usefulLife: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Residual Value</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      className="h-8 text-xs"
                      value={newAsset.residualValue}
                      onChange={e => setNewAsset(p => ({ ...p, residualValue: e.target.value }))}
                    />
                  </div>
                </div>
                <Button size="sm" onClick={addAsset} className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Add Asset
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Depreciation Run */}
        <TabsContent value="depreciation" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingDown className="h-4 w-4" /> Depreciation Run
                  </CardTitle>
                  <CardDescription>Generate amortization journal entries for all assets</CardDescription>
                </div>
                <Button onClick={runDepreciation} className="gap-2">
                  <Play className="h-4 w-4" /> Run Depreciation
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {journalEntries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingDown className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Click "Run Depreciation" to generate entries</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {journalEntries.map(entry => (
                      <TableRow key={entry.id}>
                        <TableCell className="text-xs">{entry.date}</TableCell>
                        <TableCell className="text-xs">{entry.description}</TableCell>
                        <TableCell className="text-xs text-right font-medium text-red-600">
                          ${entry.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge className="text-[10px] bg-green-500/20 text-green-700 border-green-500/30">
                            Posted
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deferred Revenue/Expense */}
        <TabsContent value="deferred" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Deferred Revenue & Expenses</CardTitle>
              <CardDescription>Manage multi-year contracts and prepaid items with recognition schedules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {deferred.map(item => {
                  const monthlyAmount = item.totalAmount / item.months;
                  const remaining = item.totalAmount - item.recognized;
                  const pct = (item.recognized / item.totalAmount) * 100;
                  return (
                    <div key={item.id} className="p-4 rounded-lg border border-border/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{item.name}</p>
                          <Badge
                            className={`text-[10px] ${item.type === 'revenue' ? 'bg-green-500/20 text-green-700 border-green-500/30' : 'bg-blue-500/20 text-blue-700 border-blue-500/30'}`}
                          >
                            {item.type}
                          </Badge>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => {
                            setDeferred(prev => prev.filter(d => d.id !== item.id));
                            toast.success('Item removed');
                          }}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div>
                          <p className="text-muted-foreground">Total</p>
                          <p className="font-semibold">${item.totalAmount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Monthly</p>
                          <p className="font-semibold">${Math.round(monthlyAmount).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Remaining</p>
                          <p className="font-semibold">${remaining.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Recognized</span>
                          <span>{pct.toFixed(0)}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Separator />

              <div className="p-4 rounded-lg bg-muted/30 space-y-3">
                <p className="text-sm font-medium">Add Deferred Item</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Name *</Label>
                    <Input
                      placeholder="e.g. Annual License"
                      className="h-8 text-xs"
                      value={newDeferred.name}
                      onChange={e => setNewDeferred(p => ({ ...p, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Type</Label>
                    <Select
                      value={newDeferred.type}
                      onValueChange={v => setNewDeferred(p => ({ ...p, type: v as 'revenue' | 'expense' }))}
                    >
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="revenue">Revenue</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Total Amount *</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      className="h-8 text-xs"
                      value={newDeferred.totalAmount}
                      onChange={e => setNewDeferred(p => ({ ...p, totalAmount: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Start Date</Label>
                    <Input
                      type="date"
                      className="h-8 text-xs"
                      value={newDeferred.startDate}
                      onChange={e => setNewDeferred(p => ({ ...p, startDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Duration (months)</Label>
                    <Input
                      type="number"
                      placeholder="12"
                      className="h-8 text-xs"
                      value={newDeferred.months}
                      onChange={e => setNewDeferred(p => ({ ...p, months: e.target.value }))}
                    />
                  </div>
                </div>
                <Button size="sm" onClick={addDeferredItem} className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Add Item
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cut-off Tool */}
        <TabsContent value="cutoff" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cut-off Tool</CardTitle>
              <CardDescription>
                Select journal entries and split amounts across multiple periods (one-shot deferred)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="space-y-1">
                  <Label className="text-xs">Split into N periods</Label>
                  <Input
                    type="number"
                    min="2"
                    max="24"
                    value={splitPeriods}
                    onChange={e => setSplitPeriods(e.target.value)}
                    className="h-8 w-24 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">&nbsp;</Label>
                  <Button
                    size="sm"
                    onClick={applyCutoff}
                    disabled={!journalEntries.some(e => e.selected)}
                    className="h-8 gap-1.5"
                  >
                    Apply Cut-off
                  </Button>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={journalEntries.length > 0 && journalEntries.every(e => e.selected)}
                        onCheckedChange={v => setJournalEntries(prev => prev.map(e => ({ ...e, selected: !!v })))}
                      />
                    </TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {journalEntries.map(entry => (
                    <TableRow key={entry.id} className={entry.selected ? 'bg-primary/5' : ''}>
                      <TableCell>
                        <Checkbox
                          checked={entry.selected}
                          onCheckedChange={() => toggleEntry(entry.id)}
                        />
                      </TableCell>
                      <TableCell className="text-xs">{entry.date}</TableCell>
                      <TableCell className="text-xs">{entry.description}</TableCell>
                      <TableCell className="text-xs text-right font-medium">
                        ${entry.amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <p className="text-xs text-muted-foreground">
                {journalEntries.filter(e => e.selected).length} of {journalEntries.length} entries selected.
                Splitting will replace selected entries with {splitPeriods} equal period entries each.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
