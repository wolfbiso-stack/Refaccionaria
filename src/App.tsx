import { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
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
import { UserProfileView } from './components/UserProfileView';
import { SucursalesView } from './components/SucursalesView';
import { ComingSoon } from './components/ComingSoon';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { CartProvider } from './context/CartContext';
import { CotizadorView } from './components/CotizadorView';
import { CartToast } from './components/CartToast';
import { WhatsAppButton } from './components/WhatsAppButton';
import { ClipboardList } from 'lucide-react';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'empleado' | 'usuario' | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const checkRole = async (userId: string) => {
    try {
      const { data, error } = await supabase.from('user_profiles').select('role').eq('id', userId).single();
      if (!error && data) {
        setUserRole(data.role as 'admin' | 'empleado' | 'usuario');
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
    <CartProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <Header
          onOpenSidebar={() => setIsSidebarOpen(true)}
          isAuthenticated={isAuthenticated}
          userRole={userRole}
          onLoginClick={() => setIsLoginModalOpen(true)}
          onLogoutClick={handleLogout}
          onOpenCart={() => setIsCartOpen(true)}
        />
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

        <main className="flex-1 w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-12 py-8">
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
            <Route path="/perfil" element={
              isAuthenticated ? <UserProfileView /> : (
                <div className="text-center py-20 px-4">
                  <h1 className="text-2xl font-bold text-red-600">Acceso Restringido</h1>
                  <p className="text-gray-500 mt-2">Debes iniciar sesión para ver tu perfil.</p>
                  <button 
                    onClick={() => setIsLoginModalOpen(true)}
                    className="mt-4 px-6 py-2 bg-amber-500 text-amber-950 rounded-lg font-bold hover:bg-amber-600 transition-colors"
                  >
                    Iniciar Sesión
                  </button>
                </div>
              )
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
            <Route path="/sucursales" element={<SucursalesView />} />
            <Route path="/cotizador" element={
              isAuthenticated ? <CotizadorView /> : (
                <div className="max-w-3xl mx-auto py-20 px-6 text-center bg-white rounded-[2.5rem] shadow-sm border border-gray-100 animate-in fade-in zoom-in duration-500">
                  <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-white shadow-xl shadow-amber-500/10">
                    <ClipboardList className="w-10 h-10 text-amber-500" />
                  </div>
                  <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">¡Ya casi tienes tu cotización lista!</h1>
                  <p className="text-gray-500 mb-10 max-w-md mx-auto font-bold leading-relaxed opacity-80">
                    Para generar el documento formal en PDF y guardar tus datos fiscales para futuras compras, necesitamos que inicies sesión o crees una cuenta gratuita.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button 
                      onClick={() => setIsLoginModalOpen(true)}
                      className="w-full sm:w-auto px-10 py-5 bg-amber-500 text-amber-950 rounded-2xl font-black shadow-xl shadow-amber-200 hover:bg-amber-600 transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                      Iniciar Sesión / Registrarse
                    </button>
                    <Link to="/" className="w-full sm:w-auto px-10 py-5 bg-gray-50 text-gray-500 rounded-2xl font-black hover:bg-gray-100 transition-all active:scale-95">
                      Ver Catálogo
                    </Link>
                  </div>
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

        <CartToast />
        <WhatsAppButton />
      </div>
    </CartProvider>
  );
}

export default App;
