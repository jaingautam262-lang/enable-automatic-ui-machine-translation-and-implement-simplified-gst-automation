import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingDown, Plus, Edit, Info, Calculator, FileText, Printer, Download } from 'lucide-react';
import { toast } from 'sonner';
import { formatINR } from '../../lib/formatters';

interface DepreciationAsset {
  id: string;
  name: string;
  assetType: string;
  acquisitionCost: number;
  acquisitionDate: Date;
  incomeTaxParams: {
    method: 'wdv';
    rate: number;
    openingValue: number;
    depreciation: number;
    closingValue: number;
  };
  accountingStandardParams: {
    method: 'slm';
    usefulLife: number;
    residualValue: number;
    depreciation: number;
    accumulatedDepreciation: number;
    netBookValue: number;
  };
}

export default function DepreciationCalculatorTab() {
  const [assets, setAssets] = useState<DepreciationAsset[]>([]);
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const [isEditAssetOpen, setIsEditAssetOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<DepreciationAsset | null>(null);
  const [activeView, setActiveView] = useState<'list' | 'comparison'>('list');

  const [assetForm, setAssetForm] = useState({
    name: '',
    assetType: '',
    acquisitionCost: '',
    acquisitionDate: '',
    incomeTaxRate: '',
    usefulLife: '',
    residualValue: '',
  });

  const formatDateString = (date: Date): string => {
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleAddAsset = () => {
    if (!assetForm.name || !assetForm.acquisitionCost || !assetForm.incomeTaxRate || !assetForm.usefulLife) {
      toast.error('Please fill in all required fields');
      return;
    }

    const cost = parseFloat(assetForm.acquisitionCost);
    const itRate = parseFloat(assetForm.incomeTaxRate);
    const usefulLife = parseInt(assetForm.usefulLife);
    const residualValue = parseFloat(assetForm.residualValue || '0');

    // Income Tax Act (WDV) calculation
    const itDepreciation = cost * (itRate / 100);
    const itClosingValue = cost - itDepreciation;

    // Accounting Standards (SLM) calculation
    const asDepreciation = (cost - residualValue) / usefulLife;
    const asNetBookValue = cost - asDepreciation;

    const newAsset: DepreciationAsset = {
      id: Date.now().toString(),
      name: assetForm.name,
      assetType: assetForm.assetType,
      acquisitionCost: cost,
      acquisitionDate: new Date(assetForm.acquisitionDate || Date.now()),
      incomeTaxParams: {
        method: 'wdv',
        rate: itRate,
        openingValue: cost,
        depreciation: itDepreciation,
        closingValue: itClosingValue,
      },
      accountingStandardParams: {
        method: 'slm',
        usefulLife,
        residualValue,
        depreciation: asDepreciation,
        accumulatedDepreciation: asDepreciation,
        netBookValue: asNetBookValue,
      },
    };

    setAssets([...assets, newAsset]);
    setIsAddAssetOpen(false);
    setAssetForm({
      name: '',
      assetType: '',
      acquisitionCost: '',
      acquisitionDate: '',
      incomeTaxRate: '',
      usefulLife: '',
      residualValue: '',
    });
    toast.success('Asset added successfully');
  };

  const handleEditAsset = () => {
    if (!selectedAsset) return;

    const cost = parseFloat(assetForm.acquisitionCost);
    const itRate = parseFloat(assetForm.incomeTaxRate);
    const usefulLife = parseInt(assetForm.usefulLife);
    const residualValue = parseFloat(assetForm.residualValue || '0');

    // Recalculate depreciation with new parameters
    const itDepreciation = selectedAsset.incomeTaxParams.openingValue * (itRate / 100);
    const itClosingValue = selectedAsset.incomeTaxParams.openingValue - itDepreciation;

    const asDepreciation = (cost - residualValue) / usefulLife;
    const asNetBookValue = cost - selectedAsset.accountingStandardParams.accumulatedDepreciation;

    const updatedAsset: DepreciationAsset = {
      ...selectedAsset,
      name: assetForm.name,
      assetType: assetForm.assetType,
      acquisitionCost: cost,
      acquisitionDate: new Date(assetForm.acquisitionDate),
      incomeTaxParams: {
        ...selectedAsset.incomeTaxParams,
        rate: itRate,
        depreciation: itDepreciation,
        closingValue: itClosingValue,
      },
      accountingStandardParams: {
        ...selectedAsset.accountingStandardParams,
        usefulLife,
        residualValue,
        depreciation: asDepreciation,
        netBookValue: asNetBookValue,
      },
    };

    setAssets(assets.map(a => a.id === selectedAsset.id ? updatedAsset : a));
    setIsEditAssetOpen(false);
    setSelectedAsset(null);
    toast.success('Asset updated successfully');
  };

  const openEditDialog = (asset: DepreciationAsset) => {
    setSelectedAsset(asset);
    setAssetForm({
      name: asset.name,
      assetType: asset.assetType,
      acquisitionCost: asset.acquisitionCost.toString(),
      acquisitionDate: asset.acquisitionDate.toISOString().split('T')[0],
      incomeTaxRate: asset.incomeTaxParams.rate.toString(),
      usefulLife: asset.accountingStandardParams.usefulLife.toString(),
      residualValue: asset.accountingStandardParams.residualValue.toString(),
    });
    setIsEditAssetOpen(true);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to print reports');
      return;
    }

    const reportHTML = generateDepreciationReportHTML();
    printWindow.document.write(reportHTML);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
    toast.success('Opening print dialog...');
  };

  const generateDepreciationReportHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Depreciation Calculation Report</title>
        <meta charset="UTF-8">
        <style>
          @page { size: A4 landscape; margin: 15mm; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 10pt;
            line-height: 1.4;
            color: #333;
            padding: 10mm;
          }
          .report-header {
            text-align: center;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 3px solid #2563eb;
          }
          .report-title {
            font-size: 20pt;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 9pt;
          }
          thead {
            background-color: #2563eb;
            color: white;
          }
          th {
            padding: 10px 6px;
            text-align: left;
            font-weight: 600;
            font-size: 8pt;
          }
          td {
            padding: 8px 6px;
            border-bottom: 1px solid #e2e8f0;
          }
          .text-right { text-align: right; }
          .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            font-size: 8pt;
            color: #64748b;
          }
        </style>
      </head>
      <body>
        <div class="report-header">
          <div class="report-title">Depreciation Calculation Report</div>
          <div>Comparative Analysis: Income Tax Act vs Accounting Standards</div>
          <div style="font-size: 9pt; color: #666; margin-top: 5px;">Generated on ${new Date().toLocaleDateString()}</div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Asset Name</th>
              <th>Type</th>
              <th class="text-right">Cost (₹)</th>
              <th class="text-right">IT Act (WDV)<br/>Depreciation (₹)</th>
              <th class="text-right">IT Act<br/>Closing Value (₹)</th>
              <th class="text-right">AS (SLM)<br/>Depreciation (₹)</th>
              <th class="text-right">AS<br/>Net Book Value (₹)</th>
              <th class="text-right">Difference (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${assets.map(asset => {
              const difference = asset.incomeTaxParams.depreciation - asset.accountingStandardParams.depreciation;
              return `
                <tr>
                  <td>${asset.name}</td>
                  <td>${asset.assetType}</td>
                  <td class="text-right">${formatINR(asset.acquisitionCost)}</td>
                  <td class="text-right">${formatINR(asset.incomeTaxParams.depreciation)}</td>
                  <td class="text-right">${formatINR(asset.incomeTaxParams.closingValue)}</td>
                  <td class="text-right">${formatINR(asset.accountingStandardParams.depreciation)}</td>
                  <td class="text-right">${formatINR(asset.accountingStandardParams.netBookValue)}</td>
                  <td class="text-right" style="color: ${difference >= 0 ? '#16a34a' : '#dc2626'};">${formatINR(Math.abs(difference))}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>© 2025. Built with love using <a href="https://caffeine.ai" style="color: #2563eb; text-decoration: none;">caffeine.ai</a></p>
        </div>
      </body>
      </html>
    `;
  };

  const totalITDepreciation = assets.reduce((sum, a) => sum + a.incomeTaxParams.depreciation, 0);
  const totalASDepreciation = assets.reduce((sum, a) => sum + a.accountingStandardParams.depreciation, 0);
  const totalDifference = totalITDepreciation - totalASDepreciation;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Depreciation Calculator</h2>
          <p className="text-muted-foreground">Separate calculations for Income Tax Act and Accounting Standards</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint} disabled={assets.length === 0}>
            <Printer className="h-4 w-4 mr-2" />
            Print Report
          </Button>
          <Button onClick={() => setIsAddAssetOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Asset
          </Button>
        </div>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Depreciation Methods</AlertTitle>
        <AlertDescription>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li><strong>Income Tax Act (WDV):</strong> Annual Depreciation = Opening WDV × Depreciation Rate</li>
            <li><strong>Accounting Standards (SLM):</strong> Annual Depreciation = (Cost - Residual Value) / Useful Life</li>
          </ul>
        </AlertDescription>
      </Alert>

      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as 'list' | 'comparison')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Asset List</TabsTrigger>
          <TabsTrigger value="comparison">Side-by-Side Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {assets.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <TrendingDown className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No assets added yet</p>
                  <p className="text-sm mt-2">Add an asset to start calculating depreciation</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {assets.map((asset) => (
                <Card key={asset.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{asset.name}</span>
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(asset)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                    <CardDescription>
                      {asset.assetType} • Acquired: {formatDateString(asset.acquisitionDate)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Acquisition Cost:</span>
                        <span className="font-medium">{formatINR(asset.acquisitionCost)}</span>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">Income Tax Act (WDV)</h4>
                        <Badge variant="outline">{asset.incomeTaxParams.rate}%</Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Opening Value:</span>
                          <span>{formatINR(asset.incomeTaxParams.openingValue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Depreciation:</span>
                          <span className="font-medium text-red-600">{formatINR(asset.incomeTaxParams.depreciation)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Closing Value:</span>
                          <span className="font-medium">{formatINR(asset.incomeTaxParams.closingValue)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">Accounting Standards (SLM)</h4>
                        <Badge variant="outline">{asset.accountingStandardParams.usefulLife} years</Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Residual Value:</span>
                          <span>{formatINR(asset.accountingStandardParams.residualValue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Depreciation:</span>
                          <span className="font-medium text-red-600">{formatINR(asset.accountingStandardParams.depreciation)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Net Book Value:</span>
                          <span className="font-medium">{formatINR(asset.accountingStandardParams.netBookValue)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between text-sm font-semibold">
                        <span>Depreciation Difference:</span>
                        <span className={asset.incomeTaxParams.depreciation > asset.accountingStandardParams.depreciation ? 'text-green-600' : 'text-blue-600'}>
                          {formatINR(Math.abs(asset.incomeTaxParams.depreciation - asset.accountingStandardParams.depreciation))}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          {assets.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No assets to compare</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Comparative Depreciation Analysis</CardTitle>
                <CardDescription>Side-by-side comparison of Income Tax Act vs Accounting Standards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asset Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Cost (₹)</TableHead>
                        <TableHead className="text-right">IT Act (WDV)<br/>Depreciation (₹)</TableHead>
                        <TableHead className="text-right">IT Act<br/>Closing Value (₹)</TableHead>
                        <TableHead className="text-right">AS (SLM)<br/>Depreciation (₹)</TableHead>
                        <TableHead className="text-right">AS<br/>Net Book Value (₹)</TableHead>
                        <TableHead className="text-right">Difference (₹)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assets.map((asset) => {
                        const difference = asset.incomeTaxParams.depreciation - asset.accountingStandardParams.depreciation;
                        return (
                          <TableRow key={asset.id}>
                            <TableCell className="font-medium">{asset.name}</TableCell>
                            <TableCell>{asset.assetType}</TableCell>
                            <TableCell className="text-right">{formatINR(asset.acquisitionCost)}</TableCell>
                            <TableCell className="text-right font-medium text-red-600">
                              {formatINR(asset.incomeTaxParams.depreciation)}
                            </TableCell>
                            <TableCell className="text-right">{formatINR(asset.incomeTaxParams.closingValue)}</TableCell>
                            <TableCell className="text-right font-medium text-red-600">
                              {formatINR(asset.accountingStandardParams.depreciation)}
                            </TableCell>
                            <TableCell className="text-right">{formatINR(asset.accountingStandardParams.netBookValue)}</TableCell>
                            <TableCell className={`text-right font-medium ${difference >= 0 ? 'text-green-600' : 'text-blue-600'}`}>
                              {formatINR(Math.abs(difference))}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      <TableRow className="font-bold bg-muted/50">
                        <TableCell colSpan={3}>Total</TableCell>
                        <TableCell className="text-right text-red-600">{formatINR(totalITDepreciation)}</TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-right text-red-600">{formatINR(totalASDepreciation)}</TableCell>
                        <TableCell></TableCell>
                        <TableCell className={`text-right ${totalDifference >= 0 ? 'text-green-600' : 'text-blue-600'}`}>
                          {formatINR(Math.abs(totalDifference))}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <Card className="border-2 border-primary/20">
                    <CardContent className="pt-6">
                      <div className="text-sm text-muted-foreground mb-1">Total IT Act Depreciation</div>
                      <div className="text-2xl font-bold text-red-600">{formatINR(totalITDepreciation)}</div>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-primary/20">
                    <CardContent className="pt-6">
                      <div className="text-sm text-muted-foreground mb-1">Total AS Depreciation</div>
                      <div className="text-2xl font-bold text-red-600">{formatINR(totalASDepreciation)}</div>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-primary/20">
                    <CardContent className="pt-6">
                      <div className="text-sm text-muted-foreground mb-1">Total Difference</div>
                      <div className={`text-2xl font-bold ${totalDifference >= 0 ? 'text-green-600' : 'text-blue-600'}`}>
                        {formatINR(Math.abs(totalDifference))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Asset Dialog */}
      <Dialog open={isAddAssetOpen} onOpenChange={setIsAddAssetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Depreciation Asset</DialogTitle>
            <DialogDescription>
              Enter asset details for both Income Tax Act and Accounting Standards calculations
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Asset Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Office Building, Machinery"
                value={assetForm.name}
                onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assetType">Asset Type</Label>
              <Input
                id="assetType"
                placeholder="e.g., Building, Plant, Vehicle"
                value={assetForm.assetType}
                onChange={(e) => setAssetForm({ ...assetForm, assetType: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="acquisitionCost">Acquisition Cost (₹) *</Label>
                <Input
                  id="acquisitionCost"
                  type="number"
                  placeholder="1000000"
                  value={assetForm.acquisitionCost}
                  onChange={(e) => setAssetForm({ ...assetForm, acquisitionCost: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="acquisitionDate">Acquisition Date</Label>
                <Input
                  id="acquisitionDate"
                  type="date"
                  value={assetForm.acquisitionDate}
                  onChange={(e) => setAssetForm({ ...assetForm, acquisitionDate: e.target.value })}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Income Tax Act Parameters (WDV)</h4>
              <div className="space-y-2">
                <Label htmlFor="incomeTaxRate">Depreciation Rate (%) *</Label>
                <Input
                  id="incomeTaxRate"
                  type="number"
                  placeholder="15"
                  value={assetForm.incomeTaxRate}
                  onChange={(e) => setAssetForm({ ...assetForm, incomeTaxRate: e.target.value })}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Accounting Standards Parameters (SLM)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="usefulLife">Useful Life (years) *</Label>
                  <Input
                    id="usefulLife"
                    type="number"
                    placeholder="10"
                    value={assetForm.usefulLife}
                    onChange={(e) => setAssetForm({ ...assetForm, usefulLife: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="residualValue">Residual Value (₹)</Label>
                  <Input
                    id="residualValue"
                    type="number"
                    placeholder="50000"
                    value={assetForm.residualValue}
                    onChange={(e) => setAssetForm({ ...assetForm, residualValue: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddAssetOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAsset}>
              Add Asset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Asset Dialog */}
      <Dialog open={isEditAssetOpen} onOpenChange={setIsEditAssetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Depreciation Asset</DialogTitle>
            <DialogDescription>
              Update asset parameters for depreciation calculations
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Asset Name *</Label>
              <Input
                id="edit-name"
                value={assetForm.name}
                onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-assetType">Asset Type</Label>
              <Input
                id="edit-assetType"
                value={assetForm.assetType}
                onChange={(e) => setAssetForm({ ...assetForm, assetType: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-acquisitionCost">Acquisition Cost (₹) *</Label>
                <Input
                  id="edit-acquisitionCost"
                  type="number"
                  value={assetForm.acquisitionCost}
                  onChange={(e) => setAssetForm({ ...assetForm, acquisitionCost: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-acquisitionDate">Acquisition Date</Label>
                <Input
                  id="edit-acquisitionDate"
                  type="date"
                  value={assetForm.acquisitionDate}
                  onChange={(e) => setAssetForm({ ...assetForm, acquisitionDate: e.target.value })}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Income Tax Act Parameters (WDV)</h4>
              <div className="space-y-2">
                <Label htmlFor="edit-incomeTaxRate">Depreciation Rate (%) *</Label>
                <Input
                  id="edit-incomeTaxRate"
                  type="number"
                  value={assetForm.incomeTaxRate}
                  onChange={(e) => setAssetForm({ ...assetForm, incomeTaxRate: e.target.value })}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Accounting Standards Parameters (SLM)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-usefulLife">Useful Life (years) *</Label>
                  <Input
                    id="edit-usefulLife"
                    type="number"
                    value={assetForm.usefulLife}
                    onChange={(e) => setAssetForm({ ...assetForm, usefulLife: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-residualValue">Residual Value (₹)</Label>
                  <Input
                    id="edit-residualValue"
                    type="number"
                    value={assetForm.residualValue}
                    onChange={(e) => setAssetForm({ ...assetForm, residualValue: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditAssetOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditAsset}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
