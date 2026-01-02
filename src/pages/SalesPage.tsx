import { useState, useEffect } from 'react';
import { useI18n } from '@/i18n';
import { salesApi } from '@/db/api';
import type { Sale } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, Eye, RotateCcw, Printer } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { printThermalReceipt } from '@/utils/thermalReceipt';

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [refunding, setRefunding] = useState(false);
  const { t } = useI18n();
  const { toast } = useToast();

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      setLoading(true);
      const data = await salesApi.getAll();
      setSales(data);
    } catch (error) {
      toast({
        title: t.common.error,
        description: 'فشل تحميل المبيعات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (saleId: string) => {
    try {
      const sale = await salesApi.getById(saleId);
      setSelectedSale(sale);
      setDetailsOpen(true);
    } catch (error) {
      toast({
        title: t.common.error,
        description: 'فشل تحميل تفاصيل الفاتورة',
        variant: 'destructive',
      });
    }
  };

  const handleRefund = async () => {
    if (!selectedSale) return;

    setRefunding(true);
    try {
      await salesApi.refund(selectedSale.id);
      toast({
        title: t.common.success,
        description: t.sales.refundSuccess,
      });
      setDetailsOpen(false);
      loadSales();
    } catch (error) {
      toast({
        title: t.common.error,
        description: t.sales.refundFailed,
        variant: 'destructive',
      });
    } finally {
      setRefunding(false);
    }
  };

  const handlePrint = async (sale: Sale) => {
    try {
      await printThermalReceipt(sale);
      toast({
        title: t.common.success,
        description: 'تم إرسال الفاتورة للطباعة',
      });
    } catch (error) {
      toast({
        title: t.common.error,
        description: 'فشلت عملية الطباعة',
        variant: 'destructive',
      });
    }
  };

  const filteredSales = sales.filter(sale =>
    sale.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t.sales.title}</h1>
        <Button onClick={loadSales} variant="outline">
          <RotateCcw className="h-4 w-4 ml-2" />
          {t.common.refresh}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.sales.allSales}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="ابحث برقم الفاتورة أو اسم العميل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32 bg-muted" />
                    <Skeleton className="h-3 w-48 bg-muted" />
                  </div>
                  <Skeleton className="h-9 w-24 bg-muted" />
                </div>
              ))}
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>{t.sales.noSales}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{t.sales.invoiceNumber}: {sale.invoice_number}</span>
                      <Badge variant={sale.status === 'completed' ? 'default' : 'destructive'}>
                        {sale.status === 'completed' ? t.sales.completed : t.sales.refunded}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>{t.sales.cashier}: {sale.cashier?.username || 'غير معروف'}</p>
                      {sale.customer && <p>{t.pos.customer}: {sale.customer.name}</p>}
                      <p>{t.common.date}: {new Date(sale.created_at || '').toLocaleString('ar-EG')}</p>
                      <p className="font-semibold text-primary">{t.common.total}: {sale.total.toFixed(2)} ر.س</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePrint(sale)}
                    >
                      <Printer className="h-4 w-4 ml-1" />
                      {t.common.print}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleViewDetails(sale.id)}
                    >
                      <Eye className="h-4 w-4 ml-1" />
                      {t.sales.viewDetails}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sale Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t.sales.saleDetails}</DialogTitle>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">{t.sales.invoiceNumber}</p>
                  <p className="font-semibold">{selectedSale.invoice_number}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t.common.date}</p>
                  <p className="font-semibold">{new Date(selectedSale.created_at || '').toLocaleString('ar-EG')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t.sales.cashier}</p>
                  <p className="font-semibold">{selectedSale.cashier?.username || 'غير معروف'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t.pos.customer}</p>
                  <p className="font-semibold">{selectedSale.customer?.name || t.pos.noCustomer}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t.pos.paymentMethod}</p>
                  <p className="font-semibold">
                    {selectedSale.payment_method === 'cash' ? t.pos.cash : 
                     selectedSale.payment_method === 'card' ? t.pos.card : t.pos.credit}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t.common.status}</p>
                  <Badge variant={selectedSale.status === 'completed' ? 'default' : 'destructive'}>
                    {selectedSale.status === 'completed' ? t.sales.completed : t.sales.refunded}
                  </Badge>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">{t.sales.items}</h3>
                <div className="space-y-2">
                  {selectedSale.sale_items?.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-2 bg-muted rounded">
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.unit_price.toFixed(2)} ر.س × {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold">{item.subtotal.toFixed(2)} ر.س</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t.pos.subtotal}:</span>
                  <span>{selectedSale.subtotal.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{t.pos.discount}:</span>
                  <span>-{selectedSale.discount.toFixed(2)} ر.س</span>
                </div>
                {selectedSale.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>{t.common.tax}:</span>
                    <span>{selectedSale.tax.toFixed(2)} ر.س</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>{t.common.total}:</span>
                  <span className="text-primary">{selectedSale.total.toFixed(2)} ر.س</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              {t.common.close}
            </Button>
            {selectedSale?.status === 'completed' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => selectedSale && handlePrint(selectedSale)}
                >
                  <Printer className="h-4 w-4 ml-2" />
                  {t.common.print}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleRefund}
                  disabled={refunding}
                >
                  <RotateCcw className="h-4 w-4 ml-2" />
                  {refunding ? t.sales.refunding : t.sales.refund}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
