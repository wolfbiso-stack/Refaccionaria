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
    <div className="min-h-screen bg-[#0f1115]">
      <ComingSoon />
    </div>
  );
}

export default App;
