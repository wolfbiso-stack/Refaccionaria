import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigationType } from 'react-router-dom';
import { supabase } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';
import { Header } from './components/Header';
import { LoginModal } from './components/LoginModal';
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

import { FavoritesView } from './components/FavoritesView';
import AuthCallback from './pages/AuthCallback';
import ActivarCuenta from './pages/ActivarCuenta';
import { BannerCarousel } from './components/BannerCarousel';
import { NosotrosView } from './components/NosotrosView';
import { ProductosView } from './components/ProductosView';
import { PrivacyPolicyView } from './components/PrivacyPolicyView';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'empleado' | 'usuario' | 'vip' | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [isEmailCallback, setIsEmailCallback] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.has('code') || params.has('debug');
  });

  const { pathname, search } = useLocation();
  const navType = useNavigationType();
  const isSearchActive = !!new URLSearchParams(search).get('q');

  useEffect(() => {
    if (navType !== 'POP') {
      window.scrollTo(0, 0);
    }
  }, [pathname, search, navType]);

  const openAuthModal = (mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode);
    setIsLoginModalOpen(true);
  };

  const fetchUserInfo = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setUserRole(data.role as 'admin' | 'empleado' | 'usuario' | 'vip');
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

  // 🔥 CONTROL DE VISIBILIDAD DE LA APLICACIÓN
  // Determina si se muestra la aplicación completa o la pantalla de "Próximamente"
  // centralizando la lógica de entornos locales, Vercel y control manual.
  const shouldShowFullApp = () => {
    const appStatus = import.meta.env.VITE_APP_STATUS;
    const vercelEnv = import.meta.env.VERCEL_ENV;
    const isLocalDev = import.meta.env.DEV; // Vite expone .DEV verdadero en local

    // 1. Siempre mostrar si estamos en desarrollo local (Vite natural o Vercel Dev)
    if (isLocalDev || vercelEnv === "development") return true;

    // 2. Mostrar en previsualizaciones de Vercel (Ramas / Pull Requests)
    if (vercelEnv === "preview") return true;

    // 3. Control manual por variable de entorno para forzar visualización
    if (appStatus === "dev") return true;

    // 4. Producción real u otros entornos → ocultar la app
    return false;
  };

  if (!shouldShowFullApp()) {
    return (
      <div className="min-h-screen bg-[#0f1115]">
        <ComingSoon />
      </div>
    );
  }

  // 👉 En desarrollo, mostrar toda la app
  return (
    <CartProvider>
      {isEmailCallback && (
        <AuthCallback onDone={() => setIsEmailCallback(false)} />
      )}

      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <Header
          isAuthenticated={isAuthenticated}
          userRole={userRole}
          userProfile={userProfile}
          email={session?.user?.email}
          onLoginClick={openAuthModal}
          onLogoutClick={handleLogout}
          onOpenCart={() => setIsCartOpen(true)}
        />

        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

        <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-8">
          <Routes>
            <Route path="/" element={
              <>
                {!isSearchActive && <BannerCarousel />}

                <div className={`w-full max-w-4xl mx-auto overflow-hidden relative shadow-sm bg-transparent rounded-2xl ${isSearchActive ? 'mb-8 h-[40px] sm:h-[50px] lg:h-[70px]' : 'mb-0 h-[50px] sm:h-[70px] lg:h-[90px]'}`}>
                  <img
                    src="/productos.png"
                    alt="Productos"
                    className="absolute inset-0 w-full h-full object-cover object-center drop-shadow-sm"
                  />
                </div>

                <div id="search-results">
                  <ProductGrid
                    isAuthenticated={isAuthenticated}
                    userRole={userRole}
                    userId={session?.user?.id}
                    onRequireLogin={() => openAuthModal('login')}
                    limit={isSearchActive ? 24 : 8}
                    showAdvancedFilters={isSearchActive}
                  />
                </div>

                {!isSearchActive && (
                  <>
                    <section className="mt-12 mb-12 border-t border-gray-50 pt-10">
                      <div className="text-center mb-8">
                        <h2 className="text-xl lg:text-2xl font-black text-gray-800 tracking-tight uppercase mb-2">
                          Nuestras Marcas
                        </h2>
                        <div className="w-12 h-1 bg-[#fdc401] mx-auto rounded-full opacity-60"></div>
                      </div>

                      <div className="relative group max-w-3xl mx-auto px-4">
                        <div className="relative bg-gray-50/50 backdrop-blur-sm p-4 rounded-3xl border border-gray-100 overflow-hidden transition-all hover:bg-white hover:shadow-md">
                          <img
                            src="/proveedores.png"
                            alt="Nuestros Proveedores"
                            className="w-full h-auto object-contain opacity-80 group-hover:opacity-100 transition-all duration-500"
                          />
                        </div>
                      </div>
                    </section>

                    <section className="mt-12 mb-12 border-t border-gray-50 pt-10">
                      <div className="text-center mb-8">
                        <h2 className="text-xl lg:text-2xl font-black text-gray-800 tracking-tight uppercase mb-2">
                          Nuestra Ubicación
                        </h2>
                        <div className="w-12 h-1 bg-[#fdc401] mx-auto rounded-full opacity-60"></div>
                      </div>
                      <div className="max-w-6xl mx-auto px-4 lg:px-6">
                        <div className="bg-white rounded-[3rem] shadow-2xl shadow-amber-900/10 border-8 border-white overflow-hidden h-[400px] lg:h-[500px] relative group">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3795.60265926858!2d-94.91237872413386!3d17.950677283035777!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85ea03991f890a95%3A0x7998fc66643a4eea!2sCordobesa%20Refacciones!5e0!3m2!1ses-419!2smx!4v1775369685487!5m2!1ses-419!2smx"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen={true}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Mapa de Sucursal Cordobesa Refacciones"
                                className="grayscale hover:grayscale-0 transition-all duration-700 ease-out scale-105 group-hover:scale-100"
                            ></iframe>
                        </div>
                      </div>
                    </section>
                  </>
                )}
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
                  <p className="text-gray-500 mt-2">Solo un Administrador puede gestionar el personal.</p>
                </div>
              )
            } />

            <Route path="/configuracion" element={
              userRole === 'admin' || userRole === 'empleado' ? <SystemSettings /> : (
                <div className="text-center py-20 px-4">
                  <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
                  <p className="text-gray-500 mt-2">Acceso restringido.</p>
                </div>
              )
            } />

            <Route path="/sucursales" element={<SucursalesView />} />
            <Route path="/productos" element={
              <ProductosView
                isAuthenticated={isAuthenticated}
                userRole={userRole}
                userId={session?.user?.id}
                onRequireLogin={() => openAuthModal('login')}
              />
            } />
            <Route path="/nosotros" element={<NosotrosView />} />
            <Route path="/ayuda-contacto" element={<HelpContactView />} />
            <Route path="/cotizador" element={<CotizadorView />} />
            <Route path="/proximamente" element={<ComingSoon />} />
            <Route path="/aviso-privacidad" element={<PrivacyPolicyView />} />
            <Route path="/auth/callback" element={<AuthCallback onDone={(next) => window.location.href = next || '/'} />} />
            <Route path="/activar" element={<ActivarCuenta />} />
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