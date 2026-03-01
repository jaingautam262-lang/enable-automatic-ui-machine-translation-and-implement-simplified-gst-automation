import { useState } from 'react';
import { useGetAllProducts, useAddProduct, useUpdateProduct } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Package, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { formatINR } from '../../lib/formatters';
import { Product } from '../../types';

export default function InventoryTab() {
  const { data: products = [], isLoading } = useGetAllProducts();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newStockLevel, setNewStockLevel] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    sku: '',
    stockLevel: '',
    lowStockThreshold: '',
  });

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.sku || !formData.stockLevel) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await addProduct.mutateAsync({
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        sku: formData.sku,
        stockLevel: BigInt(formData.stockLevel),
        lowStockThreshold: BigInt(formData.lowStockThreshold || '5'),
      });
      toast.success('Product added successfully');
      setIsAddDialogOpen(false);
      setFormData({
        name: '',
        description: '',
        price: '',
        sku: '',
        stockLevel: '',
        lowStockThreshold: '',
      });
    } catch (error) {
      toast.error('Failed to add product');
      console.error(error);
    }
  };

  const handleUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProduct || !newStockLevel) {
      toast.error('Please enter a stock level');
      return;
    }

    try {
      await updateProduct.mutateAsync({
        id: selectedProduct.id,
        name: selectedProduct.name,
        description: selectedProduct.description,
        price: selectedProduct.price,
        sku: selectedProduct.sku,
        stockLevel: BigInt(newStockLevel),
        lowStockThreshold: selectedProduct.lowStockThreshold,
      });
      toast.success('Stock level updated successfully');
      setIsEditDialogOpen(false);
      setSelectedProduct(null);
      setNewStockLevel('');
    } catch (error) {
      toast.error('Failed to update stock level');
      console.error(error);
    }
  };

  const getStockStatus = (product: Product) => {
    if (product.stockLevel === BigInt(0)) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (product.stockLevel <= product.lowStockThreshold) {
      return <Badge variant="outline" className="border-orange-500 text-orange-600">Low Stock</Badge>;
    }
    return <Badge variant="default" className="bg-green-600">In Stock</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Inventory Management</h2>
          <p className="text-muted-foreground">Track products and stock levels</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>Add a product to your inventory</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Laptop Computer"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    placeholder="e.g., PROD-001"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Product description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (INR) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stockLevel">Initial Stock *</Label>
                  <Input
                    id="stockLevel"
                    type="number"
                    placeholder="0"
                    value={formData.stockLevel}
                    onChange={(e) => setFormData({ ...formData, stockLevel: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="threshold">Low Stock Alert</Label>
                  <Input
                    id="threshold"
                    type="number"
                    placeholder="5"
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={addProduct.isPending} className="flex-1">
                  {addProduct.isPending ? 'Adding...' : 'Add Product'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>All products in your inventory</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading inventory...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No products in inventory</p>
              <p className="text-sm text-muted-foreground mt-2">Add your first product to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id.toString()}>
                    <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{product.description || '-'}</TableCell>
                    <TableCell className="text-right">{formatINR(product.price)}</TableCell>
                    <TableCell className="text-right">{product.stockLevel.toString()}</TableCell>
                    <TableCell>{getStockStatus(product)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedProduct(product);
                          setNewStockLevel(product.stockLevel.toString());
                          setIsEditDialogOpen(true);
                        }}
                      >
                        Update Stock
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Low Stock Alerts */}
      {products.filter(p => p.stockLevel <= p.lowStockThreshold && p.stockLevel > BigInt(0)).length > 0 && (
        <Card className="border-orange-500/50 bg-orange-50 dark:bg-orange-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alerts
            </CardTitle>
            <CardDescription>Products that need restocking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {products
                .filter(p => p.stockLevel <= p.lowStockThreshold && p.stockLevel > BigInt(0))
                .map((product) => (
                  <div key={product.id.toString()} className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-lg">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-orange-600">
                        {product.stockLevel.toString()} units remaining
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Threshold: {product.lowStockThreshold.toString()}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Update Stock Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stock Level</DialogTitle>
            <DialogDescription>
              Update the stock level for {selectedProduct?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateStock} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newStock">New Stock Level</Label>
              <Input
                id="newStock"
                type="number"
                placeholder="0"
                value={newStockLevel}
                onChange={(e) => setNewStockLevel(e.target.value)}
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={updateProduct.isPending} className="flex-1">
                {updateProduct.isPending ? 'Updating...' : 'Update Stock'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
