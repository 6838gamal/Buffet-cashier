export interface Option {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  withCount?: boolean;
}

export type UserRole = 'admin' | 'manager' | 'cashier';

export interface Profile {
  id: string;
  username?: string;
  email?: string;
  role: UserRole;
  full_name?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  barcode?: string;
  price: number;
  cost?: number;
  category?: string;
  image_url?: string;
  is_active: boolean;
  stock?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Inventory {
  id: string;
  product_id: string;
  quantity: number;
  min_quantity: number;
  last_restocked_at?: string;
  created_at?: string;
  updated_at?: string;
  product?: Product;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  loyalty_points: number;
  total_purchases: number;
  created_at?: string;
  updated_at?: string;
}

export interface Sale {
  id: string;
  invoice_number: string;
  customer_id?: string;
  cashier_id?: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  payment_method: string;
  amount_received?: number;
  change_amount?: number;
  status: string;
  notes?: string;
  created_at?: string;
  customer?: Customer;
  cashier?: Profile;
  sale_items?: SaleItem[];
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at?: string;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  description?: string;
  recorded_by?: string;
  expense_date: string;
  created_at?: string;
  recorder?: Profile;
}

export interface Settings {
  id: string;
  key: string;
  value?: string;
  updated_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
