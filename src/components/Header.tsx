import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Menu, Wrench, User, LogOut, Info, Truck, MapPin, FileText, Globe, Search, ClipboardList, ShoppingCart, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  onOpenSidebar: () => void;
  isAuthenticated: boolean;
  userRole?: 'admin' | 'empleado' | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
}

export function Header({ onOpenSidebar, isAuthenticated, userRole, onLoginClick, onLogoutClick }: HeaderProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
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
      <div className="bg-blue-800 text-blue-100 text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-10">
            <div className="flex items-center space-x-6 overflow-x-auto no-scrollbar">
              <a href="#" className="flex items-center hover:text-white whitespace-nowrap transition-colors">
                <Info className="w-4 h-4 mr-1.5" /> Ayuda y Contacto
              </a>
              <a href="#" className="flex items-center hover:text-white whitespace-nowrap transition-colors hidden sm:flex">
                <Truck className="w-4 h-4 mr-1.5" /> Seguimiento
              </a>
              <a href="#" className="flex items-center hover:text-white whitespace-nowrap transition-colors hidden md:flex">
                <MapPin className="w-4 h-4 mr-1.5" /> Sucursales
              </a>
              <a href="#" className="flex items-center hover:text-white whitespace-nowrap transition-colors hidden lg:flex">
                <FileText className="w-4 h-4 mr-1.5" /> Facturación electrónica
              </a>
            </div>
            <div className="hidden lg:flex items-center space-x-6">
              <div className="flex items-center">
                <Globe className="w-4 h-4 mr-1.5" /> ES
              </div>
              <div className="font-semibold">
                Tipo de cambio : $ 18.58
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="bg-blue-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 lg:py-4">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">

            {/* Logo & Category Menu */}
            <div className="flex items-center justify-between w-full lg:w-auto">
              <Link to="/" className="flex items-center space-x-2 hover:opacity-90 transition-opacity">
                <Wrench className="w-8 h-10 text-blue-100" />
                <span className="font-extrabold text-2xl tracking-tight hidden sm:block">Refaccionaria</span>
              </Link>

              <button
                onClick={onOpenSidebar}
                className="ml-4 flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white"
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
                  className="w-full pl-4 pr-12 py-3 rounded-md text-gray-900 placeholder-gray-400 border border-transparent focus:border-blue-300 focus:ring-2 focus:ring-blue-300 shadow-inner outline-none"
                />
                <button type="submit" className="absolute right-0 h-full px-4 text-gray-500 hover:text-blue-600 bg-white border-l border-gray-200 rounded-r-md transition-colors">
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
                        className="w-full p-3 bg-gray-50 text-center text-sm font-bold text-blue-600 hover:bg-gray-100 hover:text-blue-700 transition-colors border-t border-gray-100"
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

              {isAuthenticated && userRole === 'admin' && (
                <a href="#/dashboard" className="flex flex-col items-center group relative mt-1">
                  <ShieldAlert className="w-6 h-6 mb-1 text-blue-100 group-hover:text-yellow-400 transition-colors" />
                  <span className="text-xs font-semibold text-blue-100 group-hover:text-yellow-400 transition-colors">Admin</span>
                </a>
              )}

              {isAuthenticated ? (
                <button onClick={onLogoutClick} className="flex flex-col items-center group relative mt-1">
                  <LogOut className="w-6 h-6 mb-1 text-blue-100 group-hover:text-white transition-colors" />
                  <span className="text-xs font-semibold text-blue-100 group-hover:text-white transition-colors">Salir</span>
                </button>
              ) : (
                <button onClick={onLoginClick} className="flex flex-col items-center group relative mt-1">
                  <User className="w-6 h-6 mb-1 text-blue-100 group-hover:text-white transition-colors" />
                  <span className="text-xs font-semibold text-blue-100 group-hover:text-white transition-colors">Iniciar sesión</span>
                </button>
              )}

              <button className="flex flex-col items-center group mt-1">
                <ClipboardList className="w-6 h-6 mb-1 text-blue-100 group-hover:text-white transition-colors" />
                <span className="text-xs font-semibold text-blue-100 group-hover:text-white transition-colors">Cotizador</span>
              </button>

              <button className="flex flex-col items-center group relative mt-1">
                <ShoppingCart className="w-6 h-6 mb-1 text-blue-100 group-hover:text-white transition-colors" />
                <span className="text-xs font-semibold text-blue-100 group-hover:text-white transition-colors">Mi Carrito</span>
                {/* Bagde de carrito de ejemplo */}
                <span className="absolute -top-1 right-2 lg:-right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  0
                </span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
}
