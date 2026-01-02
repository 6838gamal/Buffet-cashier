import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import IntersectObserver from '@/components/common/IntersectObserver';
import { AuthProvider } from '@/contexts/AuthContext';
import { I18nProvider } from '@/i18n';
import { RouteGuard } from '@/components/common/RouteGuard';
import { Toaster } from '@/components/ui/toaster';
import AppLayout from '@/components/layouts/AppLayout';
import routes from './routes';

const App: React.FC = () => {
  return (
    <Router>
      <I18nProvider>
        <AuthProvider>
          <RouteGuard>
            <IntersectObserver />
            <Routes>
              {routes.map((route, index) => {
                if (route.path === '/login' || route.path === '/unauthorized') {
                  return (
                    <Route
                      key={index}
                      path={route.path}
                      element={route.element}
                    />
                  );
                }
                return (
                  <Route
                    key={index}
                    path={route.path}
                    element={<AppLayout>{route.element}</AppLayout>}
                  />
                );
              })}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster />
          </RouteGuard>
        </AuthProvider>
      </I18nProvider>
    </Router>
  );
};

export default App;
