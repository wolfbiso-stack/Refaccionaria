import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { supabase } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';
import { Header } from './components/Header';
import { LoginModal } from './components/LoginModal';
import { Sidebar } from './components/Sidebar';
import { ProductGrid } from './components/ProductGrid';
import { ProductDetail } from './components/ProductDetail';
import { Dashboard } from './components/Dashboard';
import { EmployeeManagement } from './components/EmployeeManagement';
import { SystemSettings } from './components/SystemSettings';
import { ComingSoon } from './components/ComingSoon';
import { Footer } from './components/Footer';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'empleado' | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const checkRole = async (userId: string) => {
    try {
      const { data, error } = await supabase.from('user_profiles').select('role').eq('id', userId).single();
      if (!error && data) {
        setUserRole(data.role);
      }
    } catch (err) {
      console.error('Error fetching role:', err);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) checkRole(session.user.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        checkRole(session.user.id);
      } else {
        setUserRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const isAuthenticated = !!session;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header
        onOpenSidebar={() => setIsSidebarOpen(true)}
        isAuthenticated={isAuthenticated}
        userRole={userRole}
        onLoginClick={() => setIsLoginModalOpen(true)}
        onLogoutClick={handleLogout}
      />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={
            <>
              <ProductGrid
                isAuthenticated={isAuthenticated}
                userRole={userRole}
              />
            </>
          } />
          <Route path="/producto/:id" element={
            <ProductDetail
              isAuthenticated={isAuthenticated}
              userRole={userRole}
            />
          } />
          <Route path="/dashboard" element={
            userRole === 'admin' ? <Dashboard /> : (
              <div className="text-center py-20 px-4">
                <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
                <p className="text-gray-500 mt-2">No tienes permisos de Administrador para ver esta página.</p>
              </div>
            )
          } />
          <Route path="/empleados" element={
            userRole === 'admin' ? <EmployeeManagement /> : (
              <div className="text-center py-20 px-4">
                <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
                <p className="text-gray-500 mt-2">No tienes permisos de Administrador para ver esta página.</p>
              </div>
            )
          } />
          <Route path="/configuracion" element={
            userRole === 'admin' ? <SystemSettings /> : (
              <div className="text-center py-20 px-4">
                <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
                <p className="text-gray-500 mt-2">No tienes permisos de Administrador para ver esta página.</p>
              </div>
            )
          } />
          <Route path="/proximamente" element={<ComingSoon />} />
        </Routes>
      </main>

      <Footer />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}

export default App;
