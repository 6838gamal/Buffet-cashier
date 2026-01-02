import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/i18n';
import { productsApi, inventoryApi, customersApi, salesApi, settingsApi } from '@/db/api';
import type { Product, CartItem, Customer } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, ShoppingCart, Minus, Plus, Trash2, X, Printer } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { printThermalReceipt } from '@/utils/thermalReceipt';

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { profile } = useAuth();
  const { t } = useI18n();
  const { toast } = useToast();

  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountReceived, setAmountReceived] = useState('');
  const [discount, setDiscount] = useState('0');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [paperSize, setPaperSize] = useState<'55mm' | '88mm'>('88mm');
  const [storeName, setStoreName] = useState('مطعم البوفيه');

  useEffect(() => {
    loadProducts();
    loadCustomers();
    loadStoreSettings();
  }, []);

  const loadStoreSettings = async () => {
    try {
      const storeNameSetting = await settingsApi.getByKey('store_name');
      if (storeNameSetting?.value) {
        setStoreName(storeNameSetting.value);
      }
    } catch (error) {
      console.error('Failed to load store settings:', error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productsApi.getAll();
      setProducts(data);
    } catch (error) {
      toast({
        title: t.common.error,
        description: 'فشل تحميل المنتجات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const data = await customersApi.getAll();
      setCustomers(data);
    } catch (error) {
      console.error('Failed to load customers:', error);
    }
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: string, change: number) => {
    const item = cart.find(item => item.product.id === productId);
    if (item && item.quantity + change <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.product.id === productId
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      ));
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discountAmount = Number.parseFloat(discount || '0');
    return Math.max(0, subtotal - discountAmount);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({
        title: t.common.error,
        description: t.pos.cartEmpty,
        variant: 'destructive',
      });
      return;
    }
    setPaymentDialogOpen(true);
  };

  const handlePayment = async () => {
    const total = calculateTotal();
    const received = Number.parseFloat(amountReceived || '0');

    if (paymentMethod === 'cash' && received < total) {
      toast({
        title: t.common.error,
        description: t.pos.insufficientAmount,
        variant: 'destructive',
      });
      return;
    }

    setProcessing(true);

    try {
      // Create sale
      const saleRecord = {
        customer_id: selectedCustomer && selectedCustomer !== 'none' ? selectedCustomer : undefined,
        cashier_id: profile?.id || '',
        subtotal: calculateSubtotal(),
        discount: Number.parseFloat(discount || '0'),
        tax: 0,
        total: total,
        payment_method: paymentMethod,
        amount_received: paymentMethod === 'cash' ? received : total,
        change_amount: paymentMethod === 'cash' ? received - total : 0,
        status: 'completed',
        invoice_number: `INV-${Date.now()}`,
      };

      const saleItems = cart.map(item => ({
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.price,
        subtotal: item.product.price * item.quantity,
      }));

      const sale = await salesApi.create(saleRecord, saleItems);

      // Update inventory
      for (const item of cart) {
        await inventoryApi.decrementQuantity(item.product.id, item.quantity);
      }

      // Update customer loyalty points if customer selected
      if (selectedCustomer && selectedCustomer !== 'none') {
        const pointsToAdd = Math.floor(total / 10);
        await customersApi.addLoyaltyPoints(selectedCustomer, pointsToAdd);
      }

      const invoiceNumber = sale.invoice_number || sale.id.slice(0, 8).toUpperCase();

      toast({
        title: t.common.success,
        description: `${t.pos.saleCompleted} ${t.pos.invoiceNumber}: ${invoiceNumber}`,
      });

      // Print receipt
      try {
        await printThermalReceipt(sale, storeName, paperSize);
      } catch (printError) {
        console.error('Print error:', printError);
        toast({
          title: t.common.warning,
          description: t.pos.printFailed,
          variant: 'default',
        });
      }

      // Reset form
      clearCart();
      setPaymentDialogOpen(false);
      setPaymentMethod('cash');
      setAmountReceived('');
      setDiscount('0');
      setSelectedCustomer('');
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: t.common.error,
        description: t.pos.paymentFailed,
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col xl:flex-row gap-4 h-[calc(100vh-4rem)]">
      {/* Products Grid */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder={t.pos.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="grid grid-cols-2 @md:grid-cols-3 @lg:grid-cols-4 gap-3">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-3">
                    <Skeleton className="h-24 w-full mb-2 bg-muted" />
                    <Skeleton className="h-4 w-3/4 mb-1 bg-muted" />
                    <Skeleton className="h-4 w-1/2 bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 @md:grid-cols-3 @lg:grid-cols-4 gap-3">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => addToCart(product)}
                >
                  <CardContent className="p-3">
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-24 object-cover rounded mb-2"
                      />
                    )}
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2">{product.name}</h3>
                    <p className="text-lg font-bold text-primary">{product.price.toFixed(2)} ر.س</p>
                    {product.stock !== undefined && product.stock < 10 && (
                      <Badge variant="destructive" className="mt-1 text-xs">
                        {t.pos.lowStock}: {product.stock}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cart */}
      <Card className="w-full xl:w-96 flex flex-col max-h-[600px] xl:max-h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            <span>{t.pos.cart}</span>
            {cart.length > 0 && (
              <Badge variant="secondary">{cart.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col overflow-hidden p-4">
          {cart.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <p>{t.pos.cartEmpty}</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">{item.product.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {item.product.price.toFixed(2)} ر.س × {item.quantity} = {(item.product.price * item.quantity).toFixed(2)} ر.س
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.product.id, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.product.id, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-7 w-7"
                        onClick={() => removeFromCart(item.product.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-3 border-t">
                <div className="flex justify-between text-sm">
                  <span>{t.pos.subtotal}:</span>
                  <span className="font-semibold">{calculateSubtotal().toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{t.pos.discount}:</span>
                  <span className="font-semibold">-{Number.parseFloat(discount || '0').toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>{t.pos.total}:</span>
                  <span className="text-primary">{calculateTotal().toFixed(2)} ر.س</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" onClick={clearCart} className="flex-1">
                    <X className="h-4 w-4 ml-2" />
                    {t.common.clear}
                  </Button>
                  <Button onClick={handleCheckout} className="flex-1">
                    {t.pos.checkout}
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t.pos.completePayment}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t.pos.customer} ({t.common.optional})</Label>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger>
                  <SelectValue placeholder={t.pos.selectCustomer} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t.pos.noCustomer}</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} - {t.pos.points}: {customer.loyalty_points || 0}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t.pos.paymentMethod}</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">{t.pos.cash}</SelectItem>
                  <SelectItem value="card">{t.pos.card}</SelectItem>
                  <SelectItem value="credit">{t.pos.credit}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t.pos.discount} (ر.س)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="0.00"
              />
            </div>

            {paymentMethod === 'cash' && (
              <div className="space-y-2">
                <Label>{t.pos.amountReceived} (ر.س)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(e.target.value)}
                  placeholder={calculateTotal().toFixed(2)}
                />
                {amountReceived && Number.parseFloat(amountReceived) >= calculateTotal() && (
                  <p className="text-sm text-muted-foreground">
                    {t.pos.change}: {(Number.parseFloat(amountReceived) - calculateTotal()).toFixed(2)} ر.س
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>{t.pos.paperSize}</Label>
              <Select value={paperSize} onValueChange={(value: '55mm' | '88mm') => setPaperSize(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="55mm">55 {t.pos.mm}</SelectItem>
                  <SelectItem value="88mm">88 {t.pos.mm}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-muted p-3 rounded-lg space-y-1">
              <div className="flex justify-between text-sm">
                <span>{t.pos.subtotal}:</span>
                <span>{calculateSubtotal().toFixed(2)} ر.س</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{t.pos.discount}:</span>
                <span>-{Number.parseFloat(discount || '0').toFixed(2)} ر.س</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>{t.pos.total}:</span>
                <span className="text-primary">{calculateTotal().toFixed(2)} ر.س</span>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)} disabled={processing}>
              {t.common.cancel}
            </Button>
            <Button onClick={handlePayment} disabled={processing}>
              <Printer className="h-4 w-4 ml-2" />
              {processing ? t.pos.processing : t.pos.confirmAndPrint}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
