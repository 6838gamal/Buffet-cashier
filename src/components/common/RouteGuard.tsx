import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import routes from '@/routes';

interface RouteGuardProps {
  children: React.ReactNode;
}

const PUBLIC_ROUTES = ['/login', '/unauthorized', '/403', '/404'];

function matchPublicRoute(path: string, patterns: string[]) {
  return patterns.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
      return regex.test(path);
    }
    return path === pattern;
  });
}

export function RouteGuard({ children }: RouteGuardProps) {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;

    const currentPath = location.pathname;
    const isPublic = matchPublicRoute(currentPath, PUBLIC_ROUTES);

    if (!user && !isPublic) {
      navigate('/login', { state: { from: currentPath }, replace: true });
      return;
    }

    if (user && currentPath === '/login') {
      navigate('/', { replace: true });
      return;
    }

    if (profile && !isPublic) {
      const currentRoute = routes.find(route => route.path === currentPath);
      
      if (currentRoute?.allowedRoles && !currentRoute.allowedRoles.includes(profile.role)) {
        navigate('/unauthorized', { replace: true });
        return;
      }
    }
  }, [user, profile, loading, location.pathname, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
