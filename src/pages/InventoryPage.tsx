import { useState, useEffect } from 'react';
import { useI18n } from '@/i18n';
import { inventoryApi } from '@/db/api';
import type { Inventory } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Edit, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function InventoryPage() {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Inventory | null>(null);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();
  const { t } = useI18n();

  const [formData, setFormData] = useState({
    quantity: '',
    min_quantity: '',
  });

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const data = await inventoryApi.getAll();
      setInventory(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load inventory',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item: Inventory) => {
    setEditingItem(item);
    setFormData({
      quantity: item.quantity.toString(),
      min_quantity: item.min_quantity.toString(),
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!editingItem) return;

    setProcessing(true);
    try {
      await inventoryApi.upsert({
        product_id: editingItem.product_id,
        quantity: Number.parseInt(formData.quantity),
        min_quantity: Number.parseInt(formData.min_quantity),
        last_restocked_at: new Date().toISOString(),
      });

      toast({
        title: 'Success',
        description: 'Inventory updated successfully',
      });
      setDialogOpen(false);
      loadInventory();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update inventory',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const lowStockItems = inventory.filter(item => item.quantity <= item.min_quantity);

  return (
    <div className="p-4 xl:p-6 space-y-4">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <h1 className="text-2xl xl:text-3xl font-bold">Inventory</h1>
        <Button variant="outline" onClick={loadInventory}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {lowStockItems.length > 0 && (
        <Card className="border-warning">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              {lowStockItems.length} product(s) are running low on stock
            </p>
            <div className="space-y-1">
              {lowStockItems.map((item) => (
                <div key={item.id} className="text-sm">
                  <span className="font-medium">{item.product?.name}</span>
                  <span className="text-muted-foreground"> - {item.quantity} units remaining</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Stock Levels</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full bg-muted" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Current Stock</TableHead>
                    <TableHead className="text-right">Min Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Restocked</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No inventory data
                      </TableCell>
                    </TableRow>
                  ) : (
                    inventory.map((item) => {
                      const isLowStock = item.quantity <= item.min_quantity;
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.product?.name}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">{item.min_quantity}</TableCell>
                          <TableCell>
                            <Badge variant={isLowStock ? 'destructive' : 'default'}>
                              {isLowStock ? 'Low Stock' : 'In Stock'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {item.last_restocked_at
                              ? new Date(item.last_restocked_at).toLocaleDateString()
                              : 'Never'}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDialog(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Inventory</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Product</p>
              <p className="font-semibold">{editingItem?.product?.name}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Current Stock</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="min_quantity">Minimum Stock Level</Label>
              <Input
                id="min_quantity"
                type="number"
                min="0"
                value={formData.min_quantity}
                onChange={(e) => setFormData({ ...formData, min_quantity: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={processing}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={processing}>
              {processing ? 'Updating...' : 'Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
