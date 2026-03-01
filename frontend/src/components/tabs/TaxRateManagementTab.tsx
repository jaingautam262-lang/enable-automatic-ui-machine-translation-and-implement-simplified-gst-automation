import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Search, Globe, ChevronDown, ChevronRight, Star, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { TaxRate, TaxRateType } from '../../types';
import { useGetTaxRates, useDeleteTaxRate } from '../../hooks/useTaxRateManagement';
import TaxRateFormDialog from '../TaxRateFormDialog';
import { toast } from 'sonner';

const TAX_TYPE_COLORS: Record<TaxRateType, string> = {
  GST: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  VAT: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  IncomeTax: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  Custom: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
};

export default function TaxRateManagementTab() {
  const { data: taxRates = [], isLoading } = useGetTaxRates();
  const deleteMutation = useDeleteTaxRate();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCountry, setFilterCountry] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<TaxRate | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedCountries, setExpandedCountries] = useState<Set<string>>(new Set(['IN']));

  // Unique countries from loaded rates
  const countries = useMemo(() => {
    const map = new Map<string, string>();
    taxRates.forEach(r => map.set(r.countryCode, r.country));
    return Array.from(map.entries()).map(([code, name]) => ({ code, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [taxRates]);

  // Filtered rates
  const filteredRates = useMemo(() => {
    return taxRates.filter(r => {
      const matchSearch = !search ||
        r.rateName.toLowerCase().includes(search.toLowerCase()) ||
        r.country.toLowerCase().includes(search.toLowerCase()) ||
        r.description?.toLowerCase().includes(search.toLowerCase());
      const matchType = filterType === 'all' || r.taxType === filterType;
      const matchCountry = filterCountry === 'all' || r.countryCode === filterCountry;
      return matchSearch && matchType && matchCountry;
    });
  }, [taxRates, search, filterType, filterCountry]);

  // Group by country
  const groupedByCountry = useMemo(() => {
    const groups = new Map<string, { code: string; name: string; rates: TaxRate[] }>();
    filteredRates.forEach(r => {
      if (!groups.has(r.countryCode)) {
        groups.set(r.countryCode, { code: r.countryCode, name: r.country, rates: [] });
      }
      groups.get(r.countryCode)!.rates.push(r);
    });
    return Array.from(groups.values()).sort((a, b) => {
      // India first
      if (a.code === 'IN') return -1;
      if (b.code === 'IN') return 1;
      return a.name.localeCompare(b.name);
    });
  }, [filteredRates]);

  const toggleCountry = (code: string) => {
    setExpandedCountries(prev => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const handleEdit = (rate: TaxRate) => {
    setEditingRate(rate);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingRate(null);
    setDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success('Tax rate deleted');
    } catch {
      toast.error('Failed to delete tax rate');
    } finally {
      setDeleteId(null);
    }
  };

  const stats = useMemo(() => ({
    total: taxRates.length,
    predefined: taxRates.filter(r => r.isPredefined).length,
    custom: taxRates.filter(r => !r.isPredefined).length,
    countries: new Set(taxRates.map(r => r.countryCode)).size,
  }), [taxRates]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tax Rate Management</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Manage GST, VAT, and Income Tax rates for all countries. Add, edit, or delete any rate.
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Add Tax Rate
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Rates</p>
            <p className="text-2xl font-bold text-primary">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Countries</p>
            <p className="text-2xl font-bold text-primary">{stats.countries}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Predefined</p>
            <p className="text-2xl font-bold text-muted-foreground">{stats.predefined}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Custom</p>
            <p className="text-2xl font-bold text-accent-foreground">{stats.custom}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by rate name, country, or description..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterCountry} onValueChange={setFilterCountry}>
              <SelectTrigger className="w-full sm:w-48">
                <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="All Countries" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                <SelectItem value="all">All Countries</SelectItem>
                {countries.map(c => (
                  <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="GST">GST</SelectItem>
                <SelectItem value="VAT">VAT</SelectItem>
                <SelectItem value="IncomeTax">Income Tax</SelectItem>
                <SelectItem value="Custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tax Rates Table grouped by country */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : groupedByCountry.length === 0 ? (
        <Card className="border-dashed border-2 border-border">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Globe className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg">No tax rates found</h3>
            <p className="text-muted-foreground text-sm mt-1 max-w-sm">
              {search || filterType !== 'all' || filterCountry !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'Add your first custom tax rate to get started.'}
            </p>
            <Button onClick={handleAdd} className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              Add Tax Rate
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {groupedByCountry.map(group => (
            <Collapsible
              key={group.code}
              open={expandedCountries.has(group.code)}
              onOpenChange={() => toggleCountry(group.code)}
            >
              <Card className="border-border/50 overflow-hidden">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors py-3 px-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {expandedCountries.has(group.code)
                          ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          : <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        }
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            {group.name}
                            <span className="text-xs font-normal text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                              {group.code}
                            </span>
                            {group.code === 'IN' && (
                              <Badge variant="secondary" className="text-xs gap-1">
                                <Star className="h-3 w-3" /> Featured
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {group.rates.length} rate{group.rates.length !== 1 ? 's' : ''}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-1.5 flex-wrap justify-end">
                        {Array.from(new Set(group.rates.map(r => r.taxType))).map(type => (
                          <span key={type} className={`text-xs px-2 py-0.5 rounded-full font-medium ${TAX_TYPE_COLORS[type]}`}>
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/20">
                            <TableHead className="text-xs">Rate Name</TableHead>
                            <TableHead className="text-xs">Type</TableHead>
                            <TableHead className="text-xs text-right">Percentage</TableHead>
                            <TableHead className="text-xs hidden md:table-cell">Description</TableHead>
                            <TableHead className="text-xs">Status</TableHead>
                            <TableHead className="text-xs text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {group.rates.map(rate => (
                            <TableRow key={rate.id} className="hover:bg-muted/10">
                              <TableCell className="font-medium text-sm py-2.5">
                                <div className="flex items-center gap-1.5">
                                  {rate.isDefault && (
                                    <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" />
                                  )}
                                  {rate.rateName}
                                </div>
                              </TableCell>
                              <TableCell className="py-2.5">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TAX_TYPE_COLORS[rate.taxType]}`}>
                                  {rate.taxType}
                                </span>
                              </TableCell>
                              <TableCell className="text-right font-mono font-semibold text-sm py-2.5">
                                {rate.percentage.toFixed(2)}%
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground hidden md:table-cell py-2.5 max-w-xs truncate">
                                {rate.description ?? '—'}
                              </TableCell>
                              <TableCell className="py-2.5">
                                {rate.isPredefined ? (
                                  <Badge variant="secondary" className="text-xs gap-1">
                                    <Shield className="h-3 w-3" /> Predefined
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs">Custom</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right py-2.5">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => handleEdit(rate)}
                                    title="Edit rate"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => setDeleteId(rate.id)}
                                    title="Delete rate"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <TaxRateFormDialog
        open={dialogOpen}
        onOpenChange={open => {
          setDialogOpen(open);
          if (!open) setEditingRate(null);
        }}
        editingRate={editingRate}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tax Rate</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this tax rate? This action cannot be undone.
              Predefined rates can be re-seeded by clearing your browser data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
