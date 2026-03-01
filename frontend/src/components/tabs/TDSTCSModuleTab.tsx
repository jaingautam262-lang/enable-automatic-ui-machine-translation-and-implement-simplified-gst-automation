import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Download, Info, AlertCircle, Calculator, Edit2, Trash2, Link as LinkIcon } from 'lucide-react';
import { formatINR } from '../../lib/formatters';
import { toast } from 'sonner';
import { useTDSTCSPersistence, type TCSRecord } from '../../hooks/useTDSTCSPersistence';
import { useGetAllInvoices, useGetAllTransactions } from '../../hooks/useQueries';
import type { TDSTransaction } from '../../types';

// TDS Sections and Rates (Income Tax Act)
const TDS_SECTIONS = [
  { section: '194A', description: 'Interest other than on securities', rate: 10, threshold: 40000 },
  { section: '194C', description: 'Payment to contractors', rate: 1, threshold: 30000 },
  { section: '194D', description: 'Insurance commission', rate: 5, threshold: 15000 },
  { section: '194H', description: 'Commission or brokerage', rate: 5, threshold: 15000 },
  { section: '194I', description: 'Rent', rate: 10, threshold: 240000 },
  { section: '194J', description: 'Professional or technical services', rate: 10, threshold: 30000 },
  { section: '194Q', description: 'Purchase of goods', rate: 0.1, threshold: 5000000 },
];

// TCS Sections and Rates (Income Tax Act)
const TCS_SECTIONS = [
  { section: '206C(1)', description: 'Sale of goods', rate: 0.1, threshold: 5000000 },
  { section: '206C(1F)', description: 'Sale of motor vehicle', rate: 1, threshold: 1000000 },
  { section: '206C(1G)', description: 'Sale of goods (e-commerce)', rate: 1, threshold: 500000 },
  { section: '206C(1H)', description: 'Overseas tour package', rate: 5, threshold: 700000 },
];

// GST TDS/TCS Rates
const GST_TDS_RATE = 2;
const GST_TCS_RATE = 1;

interface TDSFormData {
  section: string;
  description: string;
  amount: string;
  panNumber: string;
  certificateNumber: string;
  linkedInvoiceId?: string;
  linkedTransactionId?: string;
}

interface TCSFormData {
  section: string;
  description: string;
  amount: string;
  tanNumber: string;
  linkedInvoiceId?: string;
  linkedTransactionId?: string;
}

export default function TDSTCSModuleTab() {
  const {
    tdsRecords,
    tcsRecords,
    isLoading,
    createTDS,
    updateTDS,
    deleteTDS,
    createTCS,
    updateTCS,
    deleteTCS,
  } = useTDSTCSPersistence();

  const { data: invoices = [] } = useGetAllInvoices();
  const { data: transactions = [] } = useGetAllTransactions();

  const [isTDSDialogOpen, setIsTDSDialogOpen] = useState(false);
  const [isTCSDialogOpen, setIsTCSDialogOpen] = useState(false);
  const [editingTDS, setEditingTDS] = useState<TDSTransaction | null>(null);
  const [editingTCS, setEditingTCS] = useState<TCSRecord | null>(null);

  const [tdsFormData, setTdsFormData] = useState<TDSFormData>({
    section: '',
    description: '',
    amount: '',
    panNumber: '',
    certificateNumber: '',
    linkedInvoiceId: '',
    linkedTransactionId: '',
  });

  const [tcsFormData, setTcsFormData] = useState<TCSFormData>({
    section: '',
    description: '',
    amount: '',
    tanNumber: '',
    linkedInvoiceId: '',
    linkedTransactionId: '',
  });

  const [filterLinked, setFilterLinked] = useState<'all' | 'linked' | 'unlinked'>('all');

  const calculateTDS = (amount: number, section: string): number => {
    const sectionData = TDS_SECTIONS.find(s => s.section === section);
    if (!sectionData) return 0;
    if (amount < sectionData.threshold) return 0;
    return (amount * sectionData.rate) / 100;
  };

  const calculateTCS = (amount: number, section: string): number => {
    const sectionData = TCS_SECTIONS.find(s => s.section === section);
    if (!sectionData) return 0;
    if (amount < sectionData.threshold) return 0;
    return (amount * sectionData.rate) / 100;
  };

  const calculateGSTTDS = (gstAmount: number): number => {
    return (gstAmount * GST_TDS_RATE) / 100;
  };

  const calculateGSTTCS = (saleAmount: number): number => {
    return (saleAmount * GST_TCS_RATE) / 100;
  };

  const formatDateString = (date: bigint | Date): string => {
    const d = typeof date === 'bigint' ? new Date(Number(date) / 1000000) : new Date(date);
    return d.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleAddTDS = async () => {
    if (!tdsFormData.section || !tdsFormData.amount || !tdsFormData.panNumber) {
      toast.error('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(tdsFormData.amount);
    const sectionData = TDS_SECTIONS.find(s => s.section === tdsFormData.section);
    if (!sectionData) {
      toast.error('Invalid TDS section');
      return;
    }

    const tdsAmount = calculateTDS(amount, tdsFormData.section);

    try {
      if (editingTDS) {
        await updateTDS(editingTDS.id, {
          ...editingTDS,
          tdsRate: sectionData.rate,
          tdsAmount,
          panNumber: tdsFormData.panNumber,
          certificateNumber: tdsFormData.certificateNumber || undefined,
          transactionId: tdsFormData.linkedTransactionId ? BigInt(tdsFormData.linkedTransactionId) : editingTDS.transactionId,
        });
        toast.success('TDS transaction updated successfully');
        setEditingTDS(null);
      } else {
        await createTDS({
          tdsRate: sectionData.rate,
          tdsAmount,
          panNumber: tdsFormData.panNumber,
          certificateNumber: tdsFormData.certificateNumber || undefined,
          transactionId: tdsFormData.linkedTransactionId ? BigInt(tdsFormData.linkedTransactionId) : BigInt(0),
        });
        toast.success(`TDS transaction added. TDS amount: ${formatINR(tdsAmount)}`);
      }
      
      setIsTDSDialogOpen(false);
      setTdsFormData({ 
        section: '', 
        description: '', 
        amount: '', 
        panNumber: '', 
        certificateNumber: '',
        linkedInvoiceId: '',
        linkedTransactionId: '',
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to save TDS transaction');
    }
  };

  const handleEditTDS = (transaction: TDSTransaction) => {
    setEditingTDS(transaction);
    setTdsFormData({
      section: '', // Will need to derive from rate
      description: '',
      amount: transaction.tdsAmount.toString(),
      panNumber: transaction.panNumber,
      certificateNumber: transaction.certificateNumber || '',
      linkedInvoiceId: '',
      linkedTransactionId: transaction.transactionId.toString(),
    });
    setIsTDSDialogOpen(true);
  };

  const handleDeleteTDS = async (id: bigint) => {
    try {
      await deleteTDS(id);
      toast.success('TDS transaction deleted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete TDS transaction');
    }
  };

  const handleAddTCS = async () => {
    if (!tcsFormData.section || !tcsFormData.amount || !tcsFormData.tanNumber) {
      toast.error('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(tcsFormData.amount);
    const sectionData = TCS_SECTIONS.find(s => s.section === tcsFormData.section);
    if (!sectionData) {
      toast.error('Invalid TCS section');
      return;
    }

    const tcsAmount = calculateTCS(amount, tcsFormData.section);

    try {
      if (editingTCS) {
        await updateTCS(editingTCS.id, {
          ...editingTCS,
          tcsRate: sectionData.rate,
          tcsAmount,
          tanNumber: tcsFormData.tanNumber,
          transactionId: tcsFormData.linkedTransactionId ? BigInt(tcsFormData.linkedTransactionId) : editingTCS.transactionId,
        });
        toast.success('TCS transaction updated successfully');
        setEditingTCS(null);
      } else {
        await createTCS({
          tcsRate: sectionData.rate,
          tcsAmount,
          tanNumber: tcsFormData.tanNumber,
          transactionId: tcsFormData.linkedTransactionId ? BigInt(tcsFormData.linkedTransactionId) : BigInt(0),
        });
        toast.success(`TCS transaction added. TCS amount: ${formatINR(tcsAmount)}`);
      }
      
      setIsTCSDialogOpen(false);
      setTcsFormData({ 
        section: '', 
        description: '', 
        amount: '', 
        tanNumber: '',
        linkedInvoiceId: '',
        linkedTransactionId: '',
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to save TCS transaction');
    }
  };

  const handleEditTCS = (transaction: TCSRecord) => {
    setEditingTCS(transaction);
    setTcsFormData({
      section: '',
      description: '',
      amount: transaction.tcsAmount.toString(),
      tanNumber: transaction.tanNumber,
      linkedInvoiceId: '',
      linkedTransactionId: transaction.transactionId.toString(),
    });
    setIsTCSDialogOpen(true);
  };

  const handleDeleteTCS = async (id: bigint) => {
    try {
      await deleteTCS(id);
      toast.success('TCS transaction deleted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete TCS transaction');
    }
  };

  const filteredTDSRecords = tdsRecords.filter(record => {
    if (filterLinked === 'all') return true;
    const isLinked = record.transactionId !== BigInt(0);
    return filterLinked === 'linked' ? isLinked : !isLinked;
  });

  const filteredTCSRecords = tcsRecords.filter(record => {
    if (filterLinked === 'all') return true;
    const isLinked = record.transactionId !== BigInt(0);
    return filterLinked === 'linked' ? isLinked : !isLinked;
  });

  const totalTDS = tdsRecords.reduce((sum, t) => sum + t.tdsAmount, 0);
  const totalTCS = tcsRecords.reduce((sum, t) => sum + t.tcsAmount, 0);

  const handleExportTDSReport = () => {
    toast.success('Exporting TDS summary report...');
  };

  const handleExportTCSReport = () => {
    toast.success('Exporting TCS summary report...');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading TDS/TCS data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">TDS & TCS Management</h2>
          <p className="text-muted-foreground">Tax Deducted at Source and Tax Collected at Source compliance with Income Tax & GST integration</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total TDS Deducted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatINR(totalTDS)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {tdsRecords.length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total TCS Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatINR(totalTCS)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {tcsRecords.length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Net Tax Position</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatINR(totalTDS + totalTCS)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Combined liability
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tds" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tds">TDS (Income Tax)</TabsTrigger>
          <TabsTrigger value="tcs">TCS (Income Tax)</TabsTrigger>
          <TabsTrigger value="gst-tds">GST TDS/TCS</TabsTrigger>
          <TabsTrigger value="rates">Rates & Sections</TabsTrigger>
        </TabsList>

        <TabsContent value="tds" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>TDS Transactions</CardTitle>
                  <CardDescription>Tax Deducted at Source under Income Tax Act</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={filterLinked} onValueChange={(value: any) => setFilterLinked(value)}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Records</SelectItem>
                      <SelectItem value="linked">Linked Only</SelectItem>
                      <SelectItem value="unlinked">Unlinked Only</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={handleExportTDSReport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                  <Dialog open={isTDSDialogOpen} onOpenChange={(open) => {
                    setIsTDSDialogOpen(open);
                    if (!open) {
                      setEditingTDS(null);
                      setTdsFormData({ 
                        section: '', 
                        description: '', 
                        amount: '', 
                        panNumber: '', 
                        certificateNumber: '',
                        linkedInvoiceId: '',
                        linkedTransactionId: '',
                      });
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add TDS
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{editingTDS ? 'Edit' : 'Add'} TDS Transaction</DialogTitle>
                        <DialogDescription>Record a TDS deduction with optional invoice/purchase linking</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="tds-section">TDS Section *</Label>
                          <Select
                            value={tdsFormData.section}
                            onValueChange={(value) => setTdsFormData({ ...tdsFormData, section: value })}
                          >
                            <SelectTrigger id="tds-section">
                              <SelectValue placeholder="Select section" />
                            </SelectTrigger>
                            <SelectContent>
                              {TDS_SECTIONS.map((section) => (
                                <SelectItem key={section.section} value={section.section}>
                                  {section.section} - {section.description} ({section.rate}%)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="tds-description">Description</Label>
                          <Input
                            id="tds-description"
                            placeholder="Payment description"
                            value={tdsFormData.description}
                            onChange={(e) => setTdsFormData({ ...tdsFormData, description: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="tds-amount">Payment Amount (₹) *</Label>
                          <Input
                            id="tds-amount"
                            type="number"
                            placeholder="0"
                            value={tdsFormData.amount}
                            onChange={(e) => setTdsFormData({ ...tdsFormData, amount: e.target.value })}
                          />
                          {tdsFormData.section && tdsFormData.amount && (
                            <p className="text-sm text-muted-foreground">
                              TDS Amount: {formatINR(calculateTDS(parseFloat(tdsFormData.amount), tdsFormData.section))}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="tds-pan">Deductee PAN *</Label>
                          <Input
                            id="tds-pan"
                            placeholder="ABCDE1234F"
                            value={tdsFormData.panNumber}
                            onChange={(e) => setTdsFormData({ ...tdsFormData, panNumber: e.target.value.toUpperCase() })}
                            maxLength={10}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="tds-certificate">Certificate Number (Optional)</Label>
                          <Input
                            id="tds-certificate"
                            placeholder="Certificate number"
                            value={tdsFormData.certificateNumber}
                            onChange={(e) => setTdsFormData({ ...tdsFormData, certificateNumber: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="tds-transaction">Link to Transaction (Optional)</Label>
                          <Select
                            value={tdsFormData.linkedTransactionId}
                            onValueChange={(value) => setTdsFormData({ ...tdsFormData, linkedTransactionId: value })}
                          >
                            <SelectTrigger id="tds-transaction">
                              <SelectValue placeholder="Select transaction" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">None</SelectItem>
                              {transactions.slice(0, 50).map((txn) => (
                                <SelectItem key={txn.id.toString()} value={txn.id.toString()}>
                                  {txn.description} - {formatINR(txn.amount)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsTDSDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddTDS}>{editingTDS ? 'Update' : 'Add'} TDS Transaction</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredTDSRecords.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calculator className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p>No TDS transactions recorded</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">TDS Rate</TableHead>
                      <TableHead className="text-right">TDS Amount</TableHead>
                      <TableHead>PAN</TableHead>
                      <TableHead>Certificate</TableHead>
                      <TableHead>Linked</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTDSRecords.map((transaction) => (
                      <TableRow key={transaction.id.toString()}>
                        <TableCell>{formatDateString(transaction.date)}</TableCell>
                        <TableCell className="text-right">{transaction.tdsRate}%</TableCell>
                        <TableCell className="text-right font-medium">{formatINR(transaction.tdsAmount)}</TableCell>
                        <TableCell className="font-mono text-sm">{transaction.panNumber}</TableCell>
                        <TableCell className="text-sm">{transaction.certificateNumber || '-'}</TableCell>
                        <TableCell>
                          {transaction.transactionId !== BigInt(0) && (
                            <Badge variant="outline" className="gap-1">
                              <LinkIcon className="h-3 w-3" />
                              Linked
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEditTDS(transaction)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteTDS(transaction.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tcs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>TCS Transactions</CardTitle>
                  <CardDescription>Tax Collected at Source under Income Tax Act</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={filterLinked} onValueChange={(value: any) => setFilterLinked(value)}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Records</SelectItem>
                      <SelectItem value="linked">Linked Only</SelectItem>
                      <SelectItem value="unlinked">Unlinked Only</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={handleExportTCSReport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                  <Dialog open={isTCSDialogOpen} onOpenChange={(open) => {
                    setIsTCSDialogOpen(open);
                    if (!open) {
                      setEditingTCS(null);
                      setTcsFormData({ 
                        section: '', 
                        description: '', 
                        amount: '', 
                        tanNumber: '',
                        linkedInvoiceId: '',
                        linkedTransactionId: '',
                      });
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add TCS
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{editingTCS ? 'Edit' : 'Add'} TCS Transaction</DialogTitle>
                        <DialogDescription>Record a TCS collection with optional invoice/sale linking</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="tcs-section">TCS Section *</Label>
                          <Select
                            value={tcsFormData.section}
                            onValueChange={(value) => setTcsFormData({ ...tcsFormData, section: value })}
                          >
                            <SelectTrigger id="tcs-section">
                              <SelectValue placeholder="Select section" />
                            </SelectTrigger>
                            <SelectContent>
                              {TCS_SECTIONS.map((section) => (
                                <SelectItem key={section.section} value={section.section}>
                                  {section.section} - {section.description} ({section.rate}%)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="tcs-description">Description</Label>
                          <Input
                            id="tcs-description"
                            placeholder="Sale description"
                            value={tcsFormData.description}
                            onChange={(e) => setTcsFormData({ ...tcsFormData, description: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="tcs-amount">Sale Amount (₹) *</Label>
                          <Input
                            id="tcs-amount"
                            type="number"
                            placeholder="0"
                            value={tcsFormData.amount}
                            onChange={(e) => setTcsFormData({ ...tcsFormData, amount: e.target.value })}
                          />
                          {tcsFormData.section && tcsFormData.amount && (
                            <p className="text-sm text-muted-foreground">
                              TCS Amount: {formatINR(calculateTCS(parseFloat(tcsFormData.amount), tcsFormData.section))}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="tcs-tan">Collector TAN *</Label>
                          <Input
                            id="tcs-tan"
                            placeholder="ABCD12345E"
                            value={tcsFormData.tanNumber}
                            onChange={(e) => setTcsFormData({ ...tcsFormData, tanNumber: e.target.value.toUpperCase() })}
                            maxLength={10}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="tcs-transaction">Link to Transaction (Optional)</Label>
                          <Select
                            value={tcsFormData.linkedTransactionId}
                            onValueChange={(value) => setTcsFormData({ ...tcsFormData, linkedTransactionId: value })}
                          >
                            <SelectTrigger id="tcs-transaction">
                              <SelectValue placeholder="Select transaction" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">None</SelectItem>
                              {transactions.slice(0, 50).map((txn) => (
                                <SelectItem key={txn.id.toString()} value={txn.id.toString()}>
                                  {txn.description} - {formatINR(txn.amount)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsTCSDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddTCS}>{editingTCS ? 'Update' : 'Add'} TCS Transaction</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredTCSRecords.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calculator className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p>No TCS transactions recorded</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">TCS Rate</TableHead>
                      <TableHead className="text-right">TCS Amount</TableHead>
                      <TableHead>TAN</TableHead>
                      <TableHead>Linked</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTCSRecords.map((transaction) => (
                      <TableRow key={transaction.id.toString()}>
                        <TableCell>{formatDateString(transaction.date)}</TableCell>
                        <TableCell className="text-right">{transaction.tcsRate}%</TableCell>
                        <TableCell className="text-right font-medium">{formatINR(transaction.tcsAmount)}</TableCell>
                        <TableCell className="font-mono text-sm">{transaction.tanNumber}</TableCell>
                        <TableCell>
                          {transaction.transactionId !== BigInt(0) && (
                            <Badge variant="outline" className="gap-1">
                              <LinkIcon className="h-3 w-3" />
                              Linked
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEditTCS(transaction)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteTCS(transaction.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gst-tds" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>GST TDS & TCS</CardTitle>
              <CardDescription>Tax deduction and collection under GST framework</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>GST TDS (Section 51)</AlertTitle>
                <AlertDescription>
                  Government departments and specified entities must deduct TDS at <strong>2%</strong> (1% CGST + 1% SGST or 2% IGST) 
                  on payments to suppliers exceeding ₹2.5 lakhs.
                </AlertDescription>
              </Alert>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>GST TCS (Section 52)</AlertTitle>
                <AlertDescription>
                  E-commerce operators must collect TCS at <strong>1%</strong> (0.5% CGST + 0.5% SGST or 1% IGST) 
                  on net taxable supplies made through their platform.
                </AlertDescription>
              </Alert>

              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="text-base">GST TDS Calculator</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="gst-tds-amount">GST Amount (₹)</Label>
                      <Input
                        id="gst-tds-amount"
                        type="number"
                        placeholder="0"
                        onChange={(e) => {
                          const amount = parseFloat(e.target.value) || 0;
                          const tds = calculateGSTTDS(amount);
                          toast.info(`GST TDS: ${formatINR(tds)}`);
                        }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      TDS Rate: <strong>{GST_TDS_RATE}%</strong> (1% CGST + 1% SGST or 2% IGST)
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="text-base">GST TCS Calculator</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="gst-tcs-amount">Sale Amount (₹)</Label>
                      <Input
                        id="gst-tcs-amount"
                        type="number"
                        placeholder="0"
                        onChange={(e) => {
                          const amount = parseFloat(e.target.value) || 0;
                          const tcs = calculateGSTTCS(amount);
                          toast.info(`GST TCS: ${formatINR(tcs)}`);
                        }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      TCS Rate: <strong>{GST_TCS_RATE}%</strong> (0.5% CGST + 0.5% SGST or 1% IGST)
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>TDS Sections & Rates</CardTitle>
                <CardDescription>Income Tax Act provisions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Section</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                      <TableHead className="text-right">Threshold</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {TDS_SECTIONS.map((section) => (
                      <TableRow key={section.section}>
                        <TableCell className="font-medium">{section.section}</TableCell>
                        <TableCell className="text-sm">{section.description}</TableCell>
                        <TableCell className="text-right">{section.rate}%</TableCell>
                        <TableCell className="text-right">{formatINR(section.threshold)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>TCS Sections & Rates</CardTitle>
                <CardDescription>Income Tax Act provisions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Section</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                      <TableHead className="text-right">Threshold</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {TCS_SECTIONS.map((section) => (
                      <TableRow key={section.section}>
                        <TableCell className="font-medium">{section.section}</TableCell>
                        <TableCell className="text-sm">{section.description}</TableCell>
                        <TableCell className="text-right">{section.rate}%</TableCell>
                        <TableCell className="text-right">{formatINR(section.threshold)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important Notes:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>TDS rates may vary for non-PAN holders (typically 20%).</li>
                <li>Thresholds are annual limits unless specified otherwise.</li>
                <li>GST TDS/TCS applies only to specified categories of taxpayers.</li>
                <li>All data is stored per Internet Identity in localStorage and persists across sessions.</li>
                <li>Consult a tax professional for specific compliance requirements.</li>
              </ul>
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
}
