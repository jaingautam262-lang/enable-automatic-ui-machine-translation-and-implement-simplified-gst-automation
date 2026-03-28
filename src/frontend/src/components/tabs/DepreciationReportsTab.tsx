import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calculator, Edit, FileText, Plus, TrendingDown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAddDepreciationAsset,
  useCalculateDepreciation,
  useGetAllDepreciationAssets,
  useUpdateDepreciationAsset,
} from "../../hooks/useQueries";
import type { DepreciationAsset } from "../../hooks/useQueries";
import { formatCurrency, formatDate } from "../../lib/formatters";

export default function DepreciationReportsTab() {
  const { data: assets = [], isLoading } = useGetAllDepreciationAssets();
  const addAsset = useAddDepreciationAsset();
  const updateAsset = useUpdateDepreciationAsset();
  const calculateDepreciation = useCalculateDepreciation();

  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<DepreciationAsset | null>(
    null,
  );

  const [assetName, setAssetName] = useState("");
  const [assetType, setAssetType] = useState("");
  const [acquisitionCost, setAcquisitionCost] = useState("");
  const [acquisitionDate, setAcquisitionDate] = useState("");
  const [residualValue, setResidualValue] = useState("");
  const [usefulLife, setUsefulLife] = useState("");
  const [depreciationMethod, setDepreciationMethod] = useState<"slm" | "wdv">(
    "slm",
  );
  const [depreciationRate, setDepreciationRate] = useState("");

  const resetForm = () => {
    setAssetName("");
    setAssetType("");
    setAcquisitionCost("");
    setAcquisitionDate("");
    setResidualValue("");
    setUsefulLife("");
    setDepreciationMethod("slm");
    setDepreciationRate("");
  };

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await addAsset.mutateAsync({
        name: assetName,
        assetType,
        acquisitionCost: Number.parseFloat(acquisitionCost),
        acquisitionDate: new Date(acquisitionDate).getTime() as any,
        residualValue: Number.parseFloat(residualValue),
        usefulLife: Number.parseInt(usefulLife),
        depreciationMethod,
        depreciationRate: Number.parseFloat(depreciationRate),
      });

      toast.success("Asset added successfully");
      setShowAddForm(false);
      resetForm();
    } catch (error) {
      toast.error("Failed to add asset");
      console.error(error);
    }
  };

  const handleEditAsset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingAsset) return;

    try {
      const updatedAsset: DepreciationAsset = {
        ...editingAsset,
        name: assetName,
        assetType,
        acquisitionCost: Number.parseFloat(acquisitionCost),
        acquisitionDate: new Date(acquisitionDate).getTime() as any,
        residualValue: Number.parseFloat(residualValue),
        usefulLife: Number.parseInt(usefulLife),
        depreciationMethod,
        depreciationRate: Number.parseFloat(depreciationRate),
      };

      await updateAsset.mutateAsync(updatedAsset);

      toast.success("Asset updated successfully");
      setShowEditForm(false);
      setEditingAsset(null);
      resetForm();
    } catch (error) {
      toast.error("Failed to update asset");
      console.error(error);
    }
  };

  const openEditDialog = (asset: DepreciationAsset) => {
    setEditingAsset(asset);
    setAssetName(asset.name);
    setAssetType(asset.assetType);
    setAcquisitionCost(asset.acquisitionCost.toString());
    setAcquisitionDate(
      new Date(Number(asset.acquisitionDate) / 1000000)
        .toISOString()
        .split("T")[0],
    );
    setResidualValue(asset.residualValue.toString());
    setUsefulLife(asset.usefulLife.toString());
    setDepreciationMethod(asset.depreciationMethod);
    setDepreciationRate(asset.depreciationRate.toString());
    setShowEditForm(true);
  };

  const handleCalculateDepreciation = async (assetId: string | bigint) => {
    try {
      const result = await calculateDepreciation.mutateAsync(assetId);
      toast.success(
        `Depreciation calculated: ${formatCurrency(result.depreciation)}`,
      );
    } catch (error) {
      toast.error("Failed to calculate depreciation");
      console.error(error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading depreciation data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Depreciation Reports
          </h2>
          <p className="text-muted-foreground">
            Asset depreciation tracking and calculations with editing support
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowAddForm(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Asset
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Asset Depreciation Schedule
          </CardTitle>
          <CardDescription>
            Track depreciation for all registered assets
          </CardDescription>
        </CardHeader>
        <CardContent>
          {assets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No assets registered yet</p>
              <p className="text-sm mt-2">
                Add your first asset to start tracking depreciation
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Book Value</TableHead>
                  <TableHead className="text-right">Accumulated</TableHead>
                  <TableHead>Last Calculated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((asset) => (
                  <TableRow key={asset.id.toString()}>
                    <TableCell className="font-medium">{asset.name}</TableCell>
                    <TableCell>{asset.assetType}</TableCell>
                    <TableCell>
                      {asset.depreciationMethod.toUpperCase()}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(asset.acquisitionCost)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(asset.bookValue)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(asset.accumulatedDepreciation)}
                    </TableCell>
                    <TableCell>
                      {formatDate(asset.lastCalculationDate)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(asset)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCalculateDepreciation(asset.id)}
                          disabled={calculateDepreciation.isPending}
                        >
                          <Calculator className="h-4 w-4 mr-1" />
                          Calculate
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

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{assets.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Acquisition Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {formatCurrency(
                assets.reduce((sum, a) => sum + a.acquisitionCost, 0),
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Book Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {formatCurrency(assets.reduce((sum, a) => sum + a.bookValue, 0))}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add Asset Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Asset</DialogTitle>
            <DialogDescription>
              Register a new asset for depreciation tracking
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddAsset} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="assetName">Asset Name *</Label>
                <Input
                  id="assetName"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="assetType">Asset Type *</Label>
                <Select value={assetType} onValueChange={setAssetType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Building">Building</SelectItem>
                    <SelectItem value="Machinery">Machinery</SelectItem>
                    <SelectItem value="Vehicle">Vehicle</SelectItem>
                    <SelectItem value="Furniture">Furniture</SelectItem>
                    <SelectItem value="Computer">Computer</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="acquisitionCost">
                  Acquisition Cost (INR) *
                </Label>
                <Input
                  id="acquisitionCost"
                  type="number"
                  step="0.01"
                  value={acquisitionCost}
                  onChange={(e) => setAcquisitionCost(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="acquisitionDate">Acquisition Date *</Label>
                <Input
                  id="acquisitionDate"
                  type="date"
                  value={acquisitionDate}
                  onChange={(e) => setAcquisitionDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="residualValue">Residual Value (INR) *</Label>
                <Input
                  id="residualValue"
                  type="number"
                  step="0.01"
                  value={residualValue}
                  onChange={(e) => setResidualValue(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="usefulLife">Useful Life (Years) *</Label>
                <Input
                  id="usefulLife"
                  type="number"
                  value={usefulLife}
                  onChange={(e) => setUsefulLife(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="depreciationMethod">
                  Depreciation Method *
                </Label>
                <Select
                  value={depreciationMethod}
                  onValueChange={(v) =>
                    setDepreciationMethod(v as "slm" | "wdv")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slm">
                      Straight Line Method (SLM)
                    </SelectItem>
                    <SelectItem value="wdv">
                      Written Down Value (WDV)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="depreciationRate">
                  Depreciation Rate (%) *
                </Label>
                <Input
                  id="depreciationRate"
                  type="number"
                  step="0.01"
                  value={depreciationRate}
                  onChange={(e) => setDepreciationRate(e.target.value)}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={addAsset.isPending}>
                {addAsset.isPending ? "Adding..." : "Add Asset"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Asset Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Asset</DialogTitle>
            <DialogDescription>
              Update asset details and recalculate depreciation
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditAsset} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-assetName">Asset Name *</Label>
                <Input
                  id="edit-assetName"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-assetType">Asset Type *</Label>
                <Select value={assetType} onValueChange={setAssetType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Building">Building</SelectItem>
                    <SelectItem value="Machinery">Machinery</SelectItem>
                    <SelectItem value="Vehicle">Vehicle</SelectItem>
                    <SelectItem value="Furniture">Furniture</SelectItem>
                    <SelectItem value="Computer">Computer</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-acquisitionCost">
                  Acquisition Cost (INR) *
                </Label>
                <Input
                  id="edit-acquisitionCost"
                  type="number"
                  step="0.01"
                  value={acquisitionCost}
                  onChange={(e) => setAcquisitionCost(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-acquisitionDate">Acquisition Date *</Label>
                <Input
                  id="edit-acquisitionDate"
                  type="date"
                  value={acquisitionDate}
                  onChange={(e) => setAcquisitionDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-residualValue">
                  Residual Value (INR) *
                </Label>
                <Input
                  id="edit-residualValue"
                  type="number"
                  step="0.01"
                  value={residualValue}
                  onChange={(e) => setResidualValue(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-usefulLife">Useful Life (Years) *</Label>
                <Input
                  id="edit-usefulLife"
                  type="number"
                  value={usefulLife}
                  onChange={(e) => setUsefulLife(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-depreciationMethod">
                  Depreciation Method *
                </Label>
                <Select
                  value={depreciationMethod}
                  onValueChange={(v) =>
                    setDepreciationMethod(v as "slm" | "wdv")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slm">
                      Straight Line Method (SLM)
                    </SelectItem>
                    <SelectItem value="wdv">
                      Written Down Value (WDV)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-depreciationRate">
                  Depreciation Rate (%) *
                </Label>
                <Input
                  id="edit-depreciationRate"
                  type="number"
                  step="0.01"
                  value={depreciationRate}
                  onChange={(e) => setDepreciationRate(e.target.value)}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateAsset.isPending}>
                {updateAsset.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
