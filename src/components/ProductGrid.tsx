import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Plus, ShoppingCart, LayoutGrid, List as ListIcon } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import { ProductFormModal } from './ProductFormModal';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getSearchFilterString } from '../utils/searchUtils';

interface Product {
  id: string;
  name: string;
  brand?: string;
  sku?: string;
  slug?: string;
  description: string;
  stock: number;
  price?: number;
  image_url: string;
  images?: string[];
}

import { ProductSmallCard } from './ProductSmallCard';

interface ProductGridProps {
  isAuthenticated?: boolean;
  userRole?: 'admin' | 'empleado' | 'usuario' | null;
  userId?: string;
  onRequireLogin?: () => void;
  limit?: number;
  showAdvancedFilters?: boolean;
}

export function ProductGrid({ isAuthenticated = false, userRole = null, userId, onRequireLogin, limit, showAdvancedFilters = false }: ProductGridProps) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const sortBy = searchParams.get('sort') || 'stock-desc';
  
  const viewMode = (searchParams.get('view') as 'grid' | 'list') || 'grid';
  const customLimit = Number(searchParams.get('limit')) || limit || 12;
  const currentPage = Number(searchParams.get('page')) || 1;

  const setViewMode = (mode: 'grid' | 'list') => {
    setSearchParams(prev => {
      const p = new URLSearchParams(prev);
      p.set('view', mode);
      return p;
    }, { replace: true });
  };

  const setCustomLimit = (newLimit: number) => {
    setSearchParams(prev => {
      const p = new URLSearchParams(prev);
      p.set('limit', newLimit.toString());
      p.set('page', '1');
      return p;
    }, { replace: true });
  };

  const setCurrentPage = (pageUpdater: number | ((prev: number) => number)) => {
    setSearchParams(prev => {
      const p = new URLSearchParams(prev);
      const newPage = typeof pageUpdater === 'function' ? pageUpdater(currentPage) : pageUpdater;
      p.set('page', newPage.toString());
      return p;
    });
  };

  const stateKey = `productGrid_data_${showAdvancedFilters ? 'adv' : 'basic'}`;
  
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = sessionStorage.getItem(`${stateKey}_products`);
    return saved ? JSON.parse(saved) : [];
  });
  const [totalProducts, setTotalProducts] = useState(() => {
    const saved = sessionStorage.getItem(`${stateKey}_total`);
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    sessionStorage.setItem(`${stateKey}_products`, JSON.stringify(products));
    sessionStorage.setItem(`${stateKey}_total`, totalProducts.toString());
  }, [products, totalProducts, stateKey]);

  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated || !userId) {
      setFavoriteIds(new Set());
      return;
    }
    try {
      const { data, error } = await supabase.from('user_favorites').select('product_id').eq('user_id', userId);
      if (!error && data) {
        setFavoriteIds(new Set(data.map(f => f.product_id)));
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
    }
  }, [isAuthenticated, userId]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const toggleFavorite = async (productId: string) => {
    if (!isAuthenticated || !userId) {
      if (onRequireLogin) onRequireLogin();
      return;
    }

    const isFav = favoriteIds.has(productId);
    
    // Optimistic UI update
    setFavoriteIds(prev => {
      const newSet = new Set(prev);
      if (isFav) newSet.delete(productId);
      else newSet.add(productId);
      return newSet;
    });

    try {
      if (isFav) {
        await supabase.from('user_favorites').delete().eq('user_id', userId).eq('product_id', productId);
      } else {
        await supabase.from('user_favorites').insert({ user_id: userId, product_id: productId });
      }
    } catch (err) {
      console.error('Error toggling favorite', err);
      fetchFavorites(); // Revertir en caso de fallo
    }
  };

  // If showAdvancedFilters is active, use the customLimit chosen by user, else use limit or fallback.
  const ITEMS_PER_PAGE = showAdvancedFilters ? customLimit : (limit || 15);

  const canManageProducts = userRole === 'admin' || userRole === 'empleado';

  const handleNavigateToProduct = (productSlugOrId: string) => {
    sessionStorage.setItem(`${stateKey}_scrollY`, window.scrollY.toString());
    navigate(`/producto/${productSlugOrId}`);
  };



  const handleDeleteProduct = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;
        fetchProducts();
      } catch (err) {
        console.error('Error eliminando producto:', err);
        alert('Ocurrió un error al intentar eliminar el producto.');
      }
    }
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' });

      if (sortBy === 'stock-desc') {
        query = query.order('stock', { ascending: false });
      } else if (sortBy === 'stock-asc') {
        query = query.order('stock', { ascending: true });
      } else if (sortBy === 'name-asc') {
        query = query.order('name', { ascending: true });
      } else if (sortBy === 'name-desc') {
        query = query.order('name', { ascending: false });
      } else if (sortBy === 'has-image') {
        query = query.order('image_url', { ascending: false, nullsFirst: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      if (searchQuery) {
        query = query.or(getSearchFilterString(searchQuery));
      }

      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching products:', error);
      } else {
        setProducts(data || []);
        if (count !== null) setTotalProducts(count);
      }
      Query: { count: 'exact' };
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, currentPage, sortBy, ITEMS_PER_PAGE]);

  const isFirstMountScroll = useRef(true);
  useEffect(() => {
    fetchProducts();
    
    if (isFirstMountScroll.current) {
      isFirstMountScroll.current = false;
      const savedScrollY = sessionStorage.getItem(`${stateKey}_scrollY`);
      if (savedScrollY) {
        setTimeout(() => {
          window.scrollTo({ top: parseInt(savedScrollY, 10), behavior: 'instant' });
        }, 100);
      }
      return;
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [fetchProducts]);

  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4">
        {searchQuery ? (
          <div className="animate-in slide-in-from-left-4 duration-500">
            <h2 className="text-2xl font-black text-gray-900 tracking-tighter">Resultados</h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
              Búsqueda: <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded italic">"{searchQuery}"</span> ({totalProducts})
            </p>
            <button onClick={() => navigate('/')} className="text-xs font-black text-blue-600 hover:text-blue-800 mt-2 transition-colors uppercase tracking-widest flex items-center gap-1">
              &larr; Limpiar y ver todo
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {isAuthenticated && canManageProducts && (
              <button
                onClick={() => { setProductToEdit(null); setIsAddModalOpen(true); }}
                className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-black rounded-2xl text-black bg-[#fdc401] hover:bg-[#cc9e01] shadow-xl shadow-[#fdc401]/10 transition-all active:scale-95"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" />
                Nuevo Producto
              </button>
            )}
          </div>
        )}
      </div>

      {showAdvancedFilters && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-[1.5rem] border border-gray-100 shadow-sm animate-in fade-in duration-500">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest mr-2">Vista</span>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-[#fdc401] text-black shadow-md shadow-[#fdc401]/20' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
              title="Cuadrícula"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-[#fdc401] text-black shadow-md shadow-[#fdc401]/20' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
              title="Filas"
            >
              <ListIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Mostrar</span>
              <select
                value={customLimit}
                onChange={(e) => {
                  setCustomLimit(Number(e.target.value));
                }}
                className="bg-gray-50 text-sm font-bold text-gray-900 rounded-xl px-3 py-2 border-none ring-1 ring-gray-200 outline-none focus:ring-2 focus:ring-[#fdc401] min-w-[70px]"
              >
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Ordenar</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  const newParams = new URLSearchParams(searchParams);
                  newParams.set('sort', e.target.value);
                  newParams.set('page', '1');
                  setSearchParams(newParams);
                }}
                className="bg-gray-50 text-sm font-bold text-gray-900 rounded-xl px-3 py-2 border-none ring-1 ring-gray-200 outline-none focus:ring-2 focus:ring-[#fdc401] min-w-[200px]"
              >
                <option value="stock-desc">Stock (Mayor a menor)</option>
                <option value="stock-asc">Stock (Menor a mayor)</option>
                <option value="name-asc">Nombre (A-Z)</option>
                <option value="name-desc">Nombre (Z-A)</option>
                {canManageProducts && (
                  <option value="has-image">Con Imagen Primero</option>
                )}
              </select>
            </div>
          </div>
        </div>
      )}

      {loading && products.length === 0 ? (
        <div className="w-full flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-12 h-12 border-4 border-amber-100 border-t-amber-500 rounded-full animate-spin"></div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">Sincronizando Catálogo...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="w-full flex flex-col items-center justify-center py-24 bg-white rounded-[2.5rem] border border-gray-50 shadow-sm">
          <ShoppingCart className="w-16 h-16 text-gray-100 mb-4" />
          <p className="text-gray-400 font-bold italic">No se encontraron productos en esta sección.</p>
        </div>
      ) : (
        <div className={`transition-opacity duration-300 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          <div className={viewMode === 'grid' ? "grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4" : "flex flex-col gap-4"}>
            {products.map((product) => (
              <ProductSmallCard
                key={product.id}
                product={product}
                isFavorite={favoriteIds.has(product.id)}
                onToggleFavorite={() => toggleFavorite(product.id)}
                onAddToCart={addToCart}
                onNavigate={() => handleNavigateToProduct(product.slug || product.id)}
                onEdit={() => { setProductToEdit(product); setIsAddModalOpen(true); }}
                onDelete={(e: React.MouseEvent) => handleDeleteProduct(product.id, e)}
                canManage={canManageProducts && isAuthenticated}
                canSeePrice={isAuthenticated && (userRole === 'admin' || userRole === 'empleado' || userRole === 'vip')}
                viewMode={viewMode}
              />
            ))}
          </div>
        </div>
      )}

      {!loading && totalPages > 1 && (!limit || showAdvancedFilters) && (
        <div className="flex justify-center items-center mt-12 py-8 gap-6">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-4 rounded-2xl bg-white border border-gray-100 text-gray-400 hover:bg-gray-50 hover:text-amber-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Página</span>
            <span className="w-10 h-10 flex items-center justify-center rounded-xl bg-amber-500 text-amber-950 font-black shadow-lg shadow-amber-100">{currentPage}</span>
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">de {totalPages}</span>
          </div>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-4 rounded-2xl bg-white border border-gray-100 text-gray-400 hover:bg-gray-50 hover:text-amber-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}

      <ProductFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchProducts}
        initialProduct={productToEdit}
      />
    </div>
  );
}
