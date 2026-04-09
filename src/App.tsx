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
import { HelpContactView } from './components/HelpContactView';
import { CartToast } from './components/CartToast';
import { WhatsAppButton } from './components/WhatsAppButton';
import { ClipboardList } from 'lucide-react';
import { FavoritesView } from './components/FavoritesView';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'empleado' | 'usuario' | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [isCartOpen, setIsCartOpen] = useState(false);

  const openAuthModal = (mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode);
    setIsLoginModalOpen(true);
  };

  const fetchUserInfo = async (userId: string) => {
    try {
      const { data, error } = await supabase.from('user_profiles').select('*').eq('id', userId).single();
      if (!error && data) {
        setUserRole(data.role as 'admin' | 'empleado' | 'usuario');
        setUserProfile(data);
      }
    } catch (err) {
      console.error('Error fetching user info:', err);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) fetchUserInfo(session.user.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchUserInfo(session.user.id);
      } else {
        setUserRole(null);
        setUserProfile(null);
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
          userProfile={userProfile}
          email={session?.user?.email}
          onLoginClick={openAuthModal}
          onLogoutClick={handleLogout}
          onOpenCart={() => setIsCartOpen(true)}
        />
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

        <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-8">
          <Routes>
            <Route path="/" element={
              <>
                {/* Banner Promocional */}
                <div className="mb-10 max-w-4xl mx-auto w-full overflow-hidden shadow-sm border border-gray-100">
                  <img 
                    src="/banner.png" 
                    alt="Banner Promocional" 
                    className="w-full h-auto object-contain hover:opacity-95 transition-opacity cursor-pointer"
                  />
                </div>

                {/* Banner de Productos (Compact Strip) - Pegado al catálogo */}
                <div className="mb-0 w-full max-w-4xl mx-auto overflow-hidden relative h-[50px] sm:h-[70px] lg:h-[90px] shadow-sm bg-transparent rounded-2xl">
                  <img 
                    src="/productos.png" 
                    alt="Productos" 
                    className="absolute inset-0 w-full h-full object-cover object-center drop-shadow-sm"
                  />
                </div>

                <ProductGrid
                  isAuthenticated={isAuthenticated}
                  userRole={userRole}
                  userId={session?.user?.id}
                  onRequireLogin={() => openAuthModal('login')}
                />
                
                {/* Sección de Proveedores */}
                <section className="mt-20 mb-12 border-t border-gray-100 pt-16">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tighter uppercase mb-4">Nuestros Proveedores</h2>
                    <div className="w-24 h-1.5 bg-[#fdc401] mx-auto rounded-full"></div>
                  </div>
                  <div className="relative group max-w-5xl mx-auto">
                    <div className="absolute -inset-1 bg-gradient-to-r from-amber-100 to-amber-50 blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative bg-white p-4 shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                      <img 
                        src="/proveedores.png" 
                        alt="Nuestros Proveedores" 
                        className="w-full h-auto object-contain transition-transform duration-700 group-hover:scale-[1.02]"
                      />
                    </div>
                  </div>
                </section>
              </>
            } />
            <Route path="/favoritos" element={
              <FavoritesView
                isAuthenticated={isAuthenticated}
                userId={session?.user?.id}
                onRequireLogin={() => openAuthModal('login')}
              />
            } />
            <Route path="/producto/:id" element={
              <ProductDetail
                isAuthenticated={isAuthenticated}
                userRole={userRole}
                userId={session?.user?.id}
                onRequireLogin={() => openAuthModal('login')}
              />
            } />
            <Route path="/perfil" element={
              isAuthenticated ? <UserProfileView /> : (
                <div className="text-center py-20 px-4">
                  <h1 className="text-2xl font-bold text-red-600">Acceso Restringido</h1>
                  <p className="text-gray-500 mt-2">Debes iniciar sesión para ver tu perfil.</p>
                  <button
                    onClick={() => openAuthModal('login')}
                    className="mt-4 px-6 py-2 bg-amber-500 text-amber-950 rounded-lg font-bold hover:bg-amber-600 transition-colors"
                  >
                    Iniciar Sesión
                  </button>
                </div>
              )
            } />
            <Route path="/dashboard" element={
              userRole === 'admin' || userRole === 'empleado' ? <Dashboard /> : (
                <div className="text-center py-20 px-4">
                  <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
                  <p className="text-gray-500 mt-2">No tienes permisos para ver el Dashboard Administrativo.</p>
                </div>
              )
            } />
            <Route path="/empleados" element={
              userRole === 'admin' ? <EmployeeManagement /> : (
                <div className="text-center py-20 px-4">
                  <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
                  <p className="text-gray-500 mt-2">Solo un Administrador puede gestionar el personal y usuarios.</p>
                </div>
              )
            } />
            <Route path="/configuracion" element={
              userRole === 'admin' ? <SystemSettings /> : (
                <div className="text-center py-20 px-4">
                  <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
                  <p className="text-gray-500 mt-2">Acceso restringido a la configuración global del sistema.</p>
                </div>
              )
            } />
            <Route path="/sucursales" element={<SucursalesView />} />
            <Route path="/ayuda-contacto" element={<HelpContactView />} />
            <Route path="/cotizador" element={
              isAuthenticated ? <CotizadorView /> : (
                <div className="max-w-3xl mx-auto py-20 px-6 text-center bg-white rounded-[2.5rem] shadow-sm border border-gray-100 animate-in fade-in zoom-in duration-500">
                  <div className="w-20 h-20 bg-[#fdc401]/10 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-white shadow-xl shadow-[#fdc401]/10">
                    <ClipboardList className="w-10 h-10 text-[#fdc401]" />
                  </div>
                  <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">¡Ya casi tienes tu cotización lista!</h1>
                  <p className="text-gray-500 mb-10 max-w-md mx-auto font-bold leading-relaxed opacity-80">
                    Para generar el documento formal en PDF y guardar tus datos para futuras compras, necesitamos que inicies sesión o crees una cuenta gratuita.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                      onClick={() => openAuthModal('login')}
                      className="w-full sm:w-auto px-10 py-5 bg-[#fdc401] text-black rounded-2xl font-black shadow-xl shadow-[#fdc401]/20 hover:bg-[#cc9e01] transition-all active:scale-95 flex items-center justify-center gap-3"
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
          initialMode={authModalMode}
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
