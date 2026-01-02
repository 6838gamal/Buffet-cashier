import POSPage from './pages/POSPage';
import SalesPage from './pages/SalesPage';
import ProductsPage from './pages/ProductsPage';
import InventoryPage from './pages/InventoryPage';
import CustomersPage from './pages/CustomersPage';
import ReportsPage from './pages/ReportsPage';
import EmployeesPage from './pages/EmployeesPage';
import ExpensesPage from './pages/ExpensesPage';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import type { ReactNode } from 'react';
import type { UserRole } from './types/types';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  allowedRoles?: UserRole[];
}

const routes: RouteConfig[] = [
  {
    name: 'Login',
    path: '/login',
    element: <LoginPage />,
    visible: false,
    allowedRoles: ['admin', 'manager', 'cashier']
  },
  {
    name: 'Unauthorized',
    path: '/unauthorized',
    element: <UnauthorizedPage />,
    visible: false,
    allowedRoles: ['admin', 'manager', 'cashier']
  },
  {
    name: 'نقطة البيع',
    path: '/',
    element: <POSPage />,
    allowedRoles: ['admin', 'manager', 'cashier']
  },
  {
    name: 'المبيعات',
    path: '/sales',
    element: <SalesPage />,
    allowedRoles: ['admin', 'manager', 'cashier']
  },
  {
    name: 'المنتجات',
    path: '/products',
    element: <ProductsPage />,
    allowedRoles: ['admin', 'manager']
  },
  {
    name: 'المخزون',
    path: '/inventory',
    element: <InventoryPage />,
    allowedRoles: ['admin', 'manager']
  },
  {
    name: 'العملاء',
    path: '/customers',
    element: <CustomersPage />,
    allowedRoles: ['admin', 'manager']
  },
  {
    name: 'التقارير',
    path: '/reports',
    element: <ReportsPage />,
    allowedRoles: ['admin', 'manager']
  },
  {
    name: 'الموظفين',
    path: '/employees',
    element: <EmployeesPage />,
    allowedRoles: ['admin', 'manager']
  },
  {
    name: 'المصروفات',
    path: '/expenses',
    element: <ExpensesPage />,
    allowedRoles: ['admin', 'manager']
  },
  {
    name: 'الإعدادات',
    path: '/settings',
    element: <SettingsPage />,
    allowedRoles: ['admin']
  },
  {
    name: 'لوحة الإدارة',
    path: '/admin',
    element: <AdminPage />,
    allowedRoles: ['admin']
  }
];

export default routes;
