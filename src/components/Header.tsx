import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Menu, ClipboardList, ShoppingCart, User, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface HeaderProps {
  onOpenSidebar: () => void;
  isAuthenticated: boolean;
  userRole?: 'admin' | 'empleado' | 'usuario' | null;
  userProfile?: any;
  email?: string;
  onLoginClick: (mode?: 'login' | 'signup') => void;
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
    <header className="relative z-20 font-sans border-b border-gray-200 flex flex-col">
      {/* Top Row (Thin) - Amarillo */}
      <div className="bg-[#fdc401] text-[#1a1a1a] hidden md:block border-b border-black/10 order-1">
        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-12">
            <div className="flex justify-between items-center h-8 text-[12px] font-medium">
              <div className="flex items-center space-x-5">
                <Link to="/ayuda-contacto" className="opacity-80 hover:opacity-100 transition-opacity">Ayuda y Contacto</Link>
                <Link to="/sucursales" className="opacity-80 hover:opacity-100 transition-opacity">Sucursales</Link>
              </div>
              <div className="flex items-center">
                {isAuthenticated && (
                  <span className="flex items-center gap-4">
                    {(userRole === 'admin' || userRole === 'empleado') && (
                      <Link to="/dashboard" className="hidden lg:block font-bold opacity-80 hover:opacity-100 transition-opacity">Panel Admin</Link>
                    )}
                    <span className="opacity-80">Hola, <span className="font-bold opacity-100">{userProfile?.first_name || email?.split('@')[0] || 'Usuario'}</span></span>
                    <button onClick={() => onLogoutClick()} className="opacity-80 hover:opacity-100 transition-opacity">Cerrar Sesión</button>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

      {/* Main Row (Thick) - Blanca */}
      <div className="bg-white text-gray-900 border-b border-gray-100 shadow-sm relative z-10 order-2">
        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-12 py-2 lg:py-2">
          <div className="flex flex-wrap lg:flex-nowrap justify-between items-center gap-y-4 gap-x-3 lg:gap-8">

            {/* Logo */}
            <div className="flex-shrink-0 flex items-center justify-center lg:justify-start order-1">
              <Link to="/" className="hover:opacity-90 transition-opacity block">
                <img src="/logo.png" alt="Logo" className="h-[48px] sm:h-[64px] lg:h-[80px] w-auto object-contain drop-shadow-sm origin-left" />
              </Link>
            </div>

            {/* Búsqueda Rediseñada Ovalada */}
            <div className="flex-1 lg:flex-1 relative order-2 min-w-[200px]" ref={dropdownRef}>
              <form onSubmit={handleSearchSubmit} className="relative w-full h-[44px] rounded-full overflow-hidden shadow-inner bg-gray-50 border border-gray-200 focus-within:border-amber-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-amber-400/20 transition-all">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => { if (searchQuery.trim()) setShowDropdown(true); }}
                  placeholder="Busca productos, partes, marcas..."
                  className="w-full h-full pl-5 pr-12 text-[14px] text-gray-900 placeholder-gray-500 border-none focus:ring-0 outline-none bg-transparent font-normal"
                />
                <button type="submit" className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center text-gray-400 hover:text-gray-800 transition-colors">
                  <svg className="w-[20px] h-[20px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </button>
              </form>

              {/* Instant Search Dropdown */}
              {showDropdown && searchQuery.trim().length > 0 && (
                <div className="absolute top-[52px] left-0 right-0 bg-white shadow-2xl rounded-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                  {isSearching ? (
                    <div className="p-4 text-center text-sm font-medium text-gray-400">Buscando coincidencia...</div>
                  ) : results.length > 0 ? (
                    <>
                      <div className="max-h-[350px] overflow-y-auto">
                        {results.map((prod) => (
                          <button
                            key={prod.id}
                            onClick={() => {
                              setShowDropdown(false);
                              setSearchQuery("");
                              navigate(`/producto/${prod.slug || prod.id}`);
                            }}
                            className="w-full text-left flex items-center gap-4 p-3 hover:bg-gray-50 border-b border-gray-50 transition-colors"
                          >
                            <div className="w-12 h-12 bg-white rounded-lg border border-gray-100 flex-shrink-0 overflow-hidden p-1">
                              {prod.image_url ? (
                                <img src={prod.image_url} className="w-full h-full object-contain" alt="" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px] text-center font-bold">Sin foto</div>
                              )}
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <p className="font-bold text-gray-900 text-[13px] truncate capitalize">{prod.name.toLowerCase()}</p>
                              <p className="text-[11px] text-[#fdc401] font-bold mt-0.5 bg-black inline-block px-1.5 py-0.5 rounded tracking-wide">{prod.sku}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
                        }}
                        className="w-full p-3 bg-gray-50 text-center text-[13px] font-bold text-gray-900 hover:bg-gray-100 transition-colors border-t border-gray-200"
                      >
                        Ver todos los resultados
                      </button>
                    </>
                  ) : (
                    <div className="p-4 text-center text-[13px] font-medium text-gray-500">
                      No se encontraron resultados para "{searchQuery}".
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Icons (Autonex Style) */}
            <div className="flex items-center justify-center space-x-2 flex-shrink-0 lg:ml-4 flex-1 lg:flex-none w-full lg:w-auto order-3 pt-2 lg:pt-0 border-t lg:border-none border-gray-100">

              {/* User Sign In / Account */}
              {isAuthenticated ? (
                <div className="flex items-center group cursor-pointer hover:bg-black/5 p-1.5 rounded-lg transition-colors mr-1" onClick={() => navigate('/perfil')}>
                  <div className="w-[38px] h-[38px] rounded-full border border-[#1a1a1a]/20 flex items-center justify-center">
                    <User className="w-[18px] h-[18px] opacity-90" strokeWidth={1.5} />
                  </div>
                  <div className="ml-2 hidden xl:block text-left leading-tight">
                    <p className="text-[11px] opacity-80">Mi Cuenta</p>
                    <p className="text-[13px] font-bold">Opciones</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center group cursor-pointer hover:bg-black/5 p-1.5 rounded-lg transition-colors mr-1 text-left" onClick={() => onLoginClick('login')}>
                  <div className="w-[38px] h-[38px] rounded-full border border-[#1a1a1a]/20 flex items-center justify-center">
                    <User className="w-[18px] h-[18px] opacity-90" strokeWidth={1.5} />
                  </div>
                  <div className="ml-2 hidden xl:block text-left leading-tight">
                    <button className="text-[11px] opacity-80 hover:opacity-100 transition-opacity text-left block w-full">
                      Iniciar Sesión
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onLoginClick('signup'); }} className="text-[13px] font-bold hover:opacity-80 transition-opacity text-left block w-full">
                      Cuenta
                    </button>
                  </div>
                </div>
              )}

              {/* Cotizador */}
              <Link to="/cotizador" className="flex items-center group cursor-pointer hover:bg-black/5 p-1.5 rounded-lg transition-colors mr-2 text-left">
                <div className="w-[38px] h-[38px] rounded-full border border-[#1a1a1a]/20 flex items-center justify-center">
                  <ClipboardList className="w-[18px] h-[18px] opacity-90" strokeWidth={1.5} />
                </div>
                <div className="ml-2 hidden xl:block text-left leading-tight">
                  <p className="text-[13px] font-bold">Cotizador</p>
                </div>
              </Link>

              {/* Icon 4 (Cart) */}
              <button onClick={onOpenCart} className="flex items-center justify-center w-[38px] h-[38px] rounded-full border border-[#1a1a1a]/20 hover:bg-black/5 transition-colors relative" title="Carrito">
                <ShoppingCart className="w-[18px] h-[18px] opacity-90" strokeWidth={1.5} />
                <span className="absolute -top-1.5 -right-1.5 bg-[#fdc401] text-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-[0_1px_3px_rgba(0,0,0,0.3)] border border-[#1a1a1a]/10 leading-none">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              </button>

            </div>

          </div>
        </div>
      </div>

      {/* Bottom Bar (Yellow) */}
      <div className="bg-[#fdc401] text-[#1a1a1a] order-1 lg:order-3">
        <div className="max-w-[1700px] mx-auto">
          <div className="flex flex-col lg:flex-row items-center border-t border-[#1a1a1a]/10">

            {/* Categories Button (Left) */}
            <div className="w-full lg:w-auto hidden lg:flex items-center h-[46px] lg:h-[50px] px-4">
              <button
                onClick={onOpenSidebar}
                className="h-full flex items-center gap-3 hover:opacity-80 transition-opacity text-[#1a1a1a] group"
              >
                <Menu className="w-5 h-5 opacity-80 group-hover:opacity-100 transition-opacity" strokeWidth={2} />
                <span className="text-[14px] font-bold tracking-tight">Todas las Categorías</span>
              </button>
              <div className="h-5 w-[1px] bg-[#1a1a1a]/20 ml-6 mr-2"></div>
            </div>

            {/* Mobile Categories Toggle */}
            <div className="w-full lg:hidden border-b border-[#1a1a1a]/10">
              <button
                onClick={onOpenSidebar}
                className="w-full h-[46px] px-4 flex items-center justify-start hover:bg-black/5 transition-colors text-[#1a1a1a]"
              >
                <div className="flex items-center space-x-3">
                  <Menu className="w-5 h-5 opacity-80" strokeWidth={2} />
                  <span className="text-[14px] font-bold">Menú Principal</span>
                </div>
              </button>
            </div>

            {/* Nav Links (Middle) */}
            <div className="w-full lg:flex-1 px-4 lg:px-2 flex items-center justify-center lg:justify-start space-x-8 h-[46px] lg:h-[50px] overflow-x-auto no-scrollbar relative">
              <Link to="/" className="flex items-center text-[14px] font-bold text-[#1a1a1a] hover:opacity-80 transition-opacity whitespace-nowrap h-full">
                Inicio
                <svg className="w-3.5 h-3.5 ml-1 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </Link>
              <Link to="/" className="flex items-center text-[14px] font-bold text-[#1a1a1a] hover:opacity-80 transition-opacity whitespace-nowrap h-full">
                Productos
                <svg className="w-3.5 h-3.5 ml-1 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </Link>
              <Link to="/nosotros" className="flex items-center text-[14px] font-bold text-[#1a1a1a] hover:opacity-80 transition-opacity whitespace-nowrap h-full">
                Nosotros
              </Link>
              <Link to="/favoritos" className="flex items-center text-[14px] font-bold text-[#1a1a1a] hover:opacity-80 transition-opacity whitespace-nowrap h-full gap-1.5">
                <Heart className="w-3.5 h-3.5" strokeWidth={2.5}/>
                Favoritos
              </Link>
              <Link to="/ayuda-contacto" className="flex items-center text-[14px] font-bold text-[#1a1a1a] hover:opacity-80 transition-opacity whitespace-nowrap h-full">
                Contacto
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
