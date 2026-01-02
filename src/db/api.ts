import { supabase } from './supabase';
import type { Product, Inventory, Customer, Sale, SaleItem, Expense, Settings, Profile } from '@/types/types';

// Products API
export const productsApi = {
  getAll: async (activeOnly = true) => {
    let query = supabase.from('products').select('*').order('name');
    if (activeOnly) {
      query = query.eq('is_active', true);
    }
    const { data, error } = await query;
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  getByBarcode: async (barcode: string) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('barcode', barcode)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  search: async (searchTerm: string) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,barcode.ilike.%${searchTerm}%`)
      .eq('is_active', true)
      .order('name')
      .limit(20);
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  create: async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  update: async (id: string, product: Partial<Product>) => {
    const { data, error } = await supabase
      .from('products')
      .update({ ...product, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

// Inventory API
export const inventoryApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('inventory')
      .select('*, product:products(*)')
      .order('quantity');
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  getLowStock: async () => {
    const { data, error } = await supabase
      .from('inventory')
      .select('*, product:products(*)')
      .filter('quantity', 'lte', 'min_quantity')
      .order('quantity');
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  getByProductId: async (productId: string) => {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('product_id', productId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  upsert: async (inventory: Partial<Inventory>) => {
    const { data, error } = await supabase
      .from('inventory')
      .upsert(inventory)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  updateQuantity: async (productId: string, quantity: number) => {
    const { data, error } = await supabase
      .from('inventory')
      .update({ 
        quantity, 
        updated_at: new Date().toISOString(),
        last_restocked_at: new Date().toISOString()
      })
      .eq('product_id', productId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  decrementQuantity: async (productId: string, amount: number) => {
    const inventory = await inventoryApi.getByProductId(productId);
    if (inventory) {
      const newQuantity = Math.max(0, inventory.quantity - amount);
      return await inventoryApi.updateQuantity(productId, newQuantity);
    }
  },
};

// Customers API
export const customersApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('name');
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  search: async (searchTerm: string) => {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      .order('name')
      .limit(20);
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  create: async (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('customers')
      .insert(customer)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  update: async (id: string, customer: Partial<Customer>) => {
    const { data, error } = await supabase
      .from('customers')
      .update({ ...customer, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  addLoyaltyPoints: async (id: string, points: number) => {
    const customer = await customersApi.getById(id);
    if (customer) {
      return await customersApi.update(id, {
        loyalty_points: customer.loyalty_points + points,
      });
    }
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

// Sales API
export const salesApi = {
  getAll: async (limit = 100) => {
    const { data, error } = await supabase
      .from('sales')
      .select('*, customer:customers(*), cashier:profiles(*)')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('sales')
      .select('*, customer:customers(*), cashier:profiles(*), sale_items(*)')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  getByDateRange: async (startDate: string, endDate: string) => {
    const { data, error } = await supabase
      .from('sales')
      .select('*, customer:customers(*), cashier:profiles(*)')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  create: async (sale: Omit<Sale, 'id' | 'created_at'>, items: Omit<SaleItem, 'id' | 'sale_id' | 'created_at'>[]) => {
    // Create sale
    const { data: saleData, error: saleError } = await supabase
      .from('sales')
      .insert(sale)
      .select()
      .single();
    if (saleError) throw saleError;

    // Create sale items
    const saleItems = items.map(item => ({
      ...item,
      sale_id: saleData.id,
    }));

    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(saleItems);
    if (itemsError) throw itemsError;

    // Update inventory
    for (const item of items) {
      await inventoryApi.decrementQuantity(item.product_id, item.quantity);
    }

    // Update customer total purchases if customer exists
    if (sale.customer_id) {
      const customer = await customersApi.getById(sale.customer_id);
      if (customer) {
        await customersApi.update(sale.customer_id, {
          total_purchases: customer.total_purchases + sale.total,
        });
      }
    }

    return saleData;
  },

  refund: async (id: string) => {
    // Get sale with items
    const sale = await salesApi.getById(id);
    if (!sale) throw new Error('Sale not found');

    // Update sale status
    const { data, error } = await supabase
      .from('sales')
      .update({ status: 'refunded' })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;

    // Restore inventory
    if (sale.sale_items) {
      for (const item of sale.sale_items) {
        const inventory = await inventoryApi.getByProductId(item.product_id);
        if (inventory) {
          await inventoryApi.updateQuantity(item.product_id, inventory.quantity + item.quantity);
        }
      }
    }

    // Update customer total purchases
    if (sale.customer_id) {
      const customer = await customersApi.getById(sale.customer_id);
      if (customer) {
        await customersApi.update(sale.customer_id, {
          total_purchases: Math.max(0, customer.total_purchases - sale.total),
        });
      }
    }

    return data;
  },

  generateInvoiceNumber: async () => {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INV-${dateStr}-${random}`;
  },
};

// Expenses API
export const expensesApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('expenses')
      .select('*, recorder:profiles(*)')
      .order('expense_date', { ascending: false });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  getByDateRange: async (startDate: string, endDate: string) => {
    const { data, error } = await supabase
      .from('expenses')
      .select('*, recorder:profiles(*)')
      .gte('expense_date', startDate)
      .lte('expense_date', endDate)
      .order('expense_date', { ascending: false });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  create: async (expense: Omit<Expense, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('expenses')
      .insert(expense)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  update: async (id: string, expense: Partial<Expense>) => {
    const { data, error } = await supabase
      .from('expenses')
      .update(expense)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

// Settings API
export const settingsApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('settings')
      .select('*');
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  getByKey: async (key: string) => {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('key', key)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  upsert: async (key: string, value: string) => {
    const { data, error } = await supabase
      .from('settings')
      .upsert({ key, value, updated_at: new Date().toISOString() })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// Profiles API
export const profilesApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  updateRole: async (id: string, role: 'admin' | 'manager' | 'cashier') => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  update: async (id: string, profile: Partial<Profile>) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...profile, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
