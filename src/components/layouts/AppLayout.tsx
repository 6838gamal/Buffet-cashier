import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/i18n';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import routes from '@/routes';
import { 
  ShoppingCart, 
  Receipt, 
  Package, 
  Warehouse, 
  Users, 
  BarChart3, 
  UserCog, 
  DollarSign, 
  Settings, 
  LogOut, 
  Menu,
  Shield,
  Wifi,
  WifiOff
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
}

const iconMap: Record<string, any> = {
  'نقطة البيع': ShoppingCart,
  'المبيعات': Receipt,
  'المنتجات': Package,
  'المخزون': Warehouse,
  'العملاء': Users,
  'التقارير': BarChart3,
  'الموظفين': UserCog,
  'المصروفات': DollarSign,
  'الإعدادات': Settings,
  'لوحة الإدارة': Shield,
};

export default function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const { t } = useI18n();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  // Filter navigation based on user role and get Arabic names
  const getRouteName = (path: string) => {
    const routeMap: Record<string, string> = {
      '/': t.nav.pos,
      '/sales': t.nav.sales,
      '/products': t.nav.products,
      '/inventory': t.nav.inventory,
      '/customers': t.nav.customers,
      '/reports': t.nav.reports,
      '/employees': t.nav.employees,
      '/expenses': t.nav.expenses,
      '/settings': t.nav.settings,
      '/admin': t.nav.admin,
    };
    return routeMap[path] || path;
  };

  const navigation = routes
    .filter(route => 
      route.visible !== false && 
      route.allowedRoles && 
      profile && 
      route.allowedRoles.includes(profile.role)
    )
    .map(route => ({
      name: getRouteName(route.path),
      href: route.path,
      icon: iconMap[getRouteName(route.path)] || ShoppingCart,
    }));

  const NavLinks = () => (
    <>
      {navigation.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="flex min-h-screen w-full">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 border-r border-sidebar-border bg-sidebar shrink-0">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b border-sidebar-border px-6">
            <Link to="/" className="flex items-center gap-2 font-semibold text-sidebar-foreground">
              <ShoppingCart className="h-6 w-6 text-sidebar-primary" />
              <span>Buffet POS</span>
            </Link>
          </div>
          <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
            <NavLinks />
          </nav>
          <div className="border-t border-sidebar-border p-4">
            <div className="mb-3 px-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-sidebar-foreground">{profile?.username}</p>
                  <p className="text-xs text-sidebar-foreground/60 capitalize">
                    {profile?.role === 'admin' ? t.roles.admin : profile?.role === 'manager' ? t.roles.manager : t.roles.cashier}
                  </p>
                </div>
                <Badge variant={isOnline ? 'default' : 'destructive'} className="gap-1">
                  {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                  {isOnline ? t.connection.online : t.connection.offline}
                </Badge>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              {t.auth.logout}
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Layout */}
      <div className="flex flex-col flex-1">
        {/* Mobile Header */}
        <header className="lg:hidden flex h-16 items-center gap-4 border-b bg-card px-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-sidebar">
              <div className="flex h-full flex-col">
                <div className="flex h-16 items-center border-b border-sidebar-border px-6">
                  <Link to="/" className="flex items-center gap-2 font-semibold text-sidebar-foreground">
                    <ShoppingCart className="h-6 w-6 text-sidebar-primary" />
                    <span>Buffet POS</span>
                  </Link>
                </div>
                <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
                  <NavLinks />
                </nav>
                <div className="border-t border-sidebar-border p-4">
                  <div className="mb-3 px-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-sidebar-foreground">{profile?.username}</p>
                        <p className="text-xs text-sidebar-foreground/60 capitalize">
                          {profile?.role === 'admin' ? t.roles.admin : profile?.role === 'manager' ? t.roles.manager : t.roles.cashier}
                        </p>
                      </div>
                      <Badge variant={isOnline ? 'default' : 'destructive'} className="gap-1">
                        {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                        {isOnline ? t.connection.online : t.connection.offline}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-5 w-5" />
                    {t.auth.logout}
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2 font-semibold">
            <ShoppingCart className="h-6 w-6 text-primary" />
            <span>Buffet POS</span>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
