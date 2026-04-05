import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Menu, User, LogOut, Info, MapPin, Search, ClipboardList, ShoppingCart, ShieldAlert } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface HeaderProps {
  onOpenSidebar: () => void;
  isAuthenticated: boolean;
  userRole?: 'admin' | 'empleado' | 'usuario' | null;
  userProfile?: any;
  email?: string;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onOpenCart: () => void;
}

export function Header({ onOpenSidebar, isAuthenticated, userRole, userProfile, email, onLoginClick, onLogoutClick, onOpenCart }: HeaderProps) {
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const { data } = await supabase
          .from('products')
          .select('id, name, sku, stock, image_url, slug')
          .or(`name.ilike.%${searchQuery}%,sku.ilike.%${searchQuery}%`)
          .limit(5);

        setResults(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(() => {
      fetchResults();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowDropdown(false);
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="relative z-20 font-sans">
      {/* Top Bar */}
      <div className="bg-[#fdc401] text-amber-950 text-xs sm:text-sm border-b border-black/5">
        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex justify-between items-center h-10">
            <div className="flex items-center space-x-6 overflow-x-auto no-scrollbar">
              <Link to="/ayuda-contacto" className="flex items-center hover:text-white whitespace-nowrap transition-colors">
                <Info className="w-4 h-4 mr-1.5" /> Ayuda y Contacto
              </Link>
              <Link to="/sucursales" className="flex items-center hover:text-white whitespace-nowrap transition-colors hidden md:flex">
                <MapPin className="w-4 h-4 mr-1.5" /> Sucursales
              </Link>
            </div>
            <div className="hidden lg:flex items-center space-x-6">

            </div>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="bg-[#fdc401] text-amber-950 shadow-md">
        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-12 py-3 lg:py-5">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">

            {/* Logo & Category Menu */}
            <div className="flex items-center justify-between w-full lg:w-auto">
              <Link to="/" className="flex items-center space-x-4 hover:opacity-90 transition-opacity">
                <img src="/logo.png" alt="Logo" className="h-14 sm:h-16 lg:h-20 w-auto object-contain drop-shadow-sm" />
                <span className="font-extrabold text-3xl tracking-tighter hidden sm:block text-amber-950 uppercase"></span>
              </Link>

              <button
                onClick={onOpenSidebar}
                className="ml-4 flex items-center space-x-2 bg-black/10 hover:bg-black/20 text-amber-950 px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-black"
              >
                <Menu className="w-5 h-5" />
                <span className="font-bold hidden md:block">Menú de categorías</span>
              </button>
            </div>

            {/* Search Bar */}
            <div className="w-full lg:flex-1 max-w-3xl mx-0 lg:mx-8 relative" ref={dropdownRef}>
              <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => { if (searchQuery.trim()) setShowDropdown(true); }}
                  placeholder="Buscar productos por número de parte o nombre"
                  className="w-full pl-4 pr-12 py-3 rounded-md text-gray-900 placeholder-gray-400 border border-transparent focus:border-amber-400 focus:ring-2 focus:ring-amber-400 shadow-inner outline-none"
                />
                <button type="submit" className="absolute right-0 h-full px-4 text-gray-400 hover:text-amber-700 bg-white border-l border-gray-100 rounded-r-md transition-colors">
                  <Search className="w-5 h-5 font-bold" />
                </button>
              </form>

              {/* Instant Search Dropdown */}
              {showDropdown && searchQuery.trim().length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50">
                  {isSearching ? (
                    <div className="p-4 text-center text-sm text-gray-500">Buscando coincidencia...</div>
                  ) : results.length > 0 ? (
                    <>
                      <div className="max-h-96 overflow-y-auto">
                        {results.map((prod) => (
                          <button
                            key={prod.id}
                            onClick={() => {
                              setShowDropdown(false);
                              setSearchQuery("");
                              navigate(`/producto/${prod.slug || prod.id}`);
                            }}
                            className="w-full text-left flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-50 transition-colors"
                          >
                            <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                              {prod.image_url ? (
                                <img src={prod.image_url} className="w-full h-full object-cover" alt="" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Sin img</div>
                              )}
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <p className="font-bold text-gray-900 text-sm truncate">{prod.name}</p>
                              <p className="text-xs text-gray-500 font-mono">{prod.sku}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
                        }}
                        className="w-full p-3 bg-gray-50 text-center text-sm font-bold text-amber-700 hover:bg-gray-100 hover:text-amber-800 transition-colors border-t border-gray-100"
                      >
                        Mostrar todos los resultados para "{searchQuery}"
                      </button>
                    </>
                  ) : (
                    <div className="p-4 text-center text-sm text-gray-500">
                      No se encontraron resultados para "{searchQuery}".
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Icons */}
            <div className="flex items-center space-x-6 lg:space-x-8 w-full lg:w-auto justify-center lg:justify-end mt-4 lg:mt-0">

              {isAuthenticated ? (
                <div className="relative mt-1" ref={userMenuRef}>
                  <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-3 bg-black/5 hover:bg-black/10 px-4 py-2 rounded-xl transition-all border border-black/5 group"
                  >
                    <div className="w-8 h-8 bg-black/10 rounded-full flex items-center justify-center border border-black/5 group-hover:bg-black/20 transition-colors">
                      <User className="w-5 h-5 text-amber-950" />
                    </div>
                    <div className="text-left hidden sm:block">
                      <p className="text-xs font-black text-amber-950 truncate max-w-[120px]">
                        {userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : (email || 'Usuario')}
                      </p>
                      <p className="text-[10px] font-bold text-amber-900/60 leading-none">Mi Cuenta</p>
                    </div>
                  </button>

                  {/* User Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-4 bg-gray-50/50 border-b border-gray-100">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Usuario</p>
                        <p className="text-sm font-bold text-gray-900 truncate">{email}</p>
                      </div>
                      <div className="p-2">
                        <Link 
                          to="/perfil" 
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-gray-700 hover:bg-amber-50 hover:text-amber-700 rounded-xl transition-all"
                        >
                          <User className="w-4 h-4" />
                          Ver Perfil
                        </Link>
                        {(userRole === 'admin' || userRole === 'empleado') && (
                          <Link 
                            to="/dashboard" 
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-gray-700 hover:bg-amber-50 hover:text-amber-700 rounded-xl transition-all"
                          >
                            <ShieldAlert className="w-4 h-4" />
                            {userRole === 'admin' ? 'Panel Admin' : 'Panel Empleado'}
                          </Link>
                        )}
                        <button 
                          onClick={() => {
                            setShowUserMenu(false);
                            onLogoutClick();
                          }}
                          className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all text-left mt-1"
                        >
                          <LogOut className="w-4 h-4" />
                          Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button onClick={onLoginClick} className="flex flex-col items-center group relative mt-1">
                  <User className="w-6 h-6 mb-1 text-amber-950/70 group-hover:text-amber-950 transition-colors" />
                  <span className="text-xs font-semibold text-amber-950/70 group-hover:text-amber-950 transition-colors">Iniciar sesión</span>
                </button>
              )}

              <Link to="/cotizador" className="flex flex-col items-center group mt-1">
                <ClipboardList className="w-6 h-6 mb-1 text-amber-950/70 group-hover:text-amber-950 transition-colors" />
                <span className="text-xs font-semibold text-amber-950/70 group-hover:text-amber-950 transition-colors">Cotizador</span>
              </Link>

              <button 
                onClick={onOpenCart}
                className="flex flex-col items-center group relative mt-1"
              >
                <ShoppingCart className="w-6 h-6 mb-1 text-amber-950/70 group-hover:text-amber-950 transition-colors" />
                <span className="text-xs font-semibold text-amber-950/70 group-hover:text-amber-950 transition-colors">Mi Carrito</span>
                {totalItems > 0 && (
                  <span className="absolute -top-1 right-2 lg:-right-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-amber-500">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
}
