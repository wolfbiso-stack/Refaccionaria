import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Plus, ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import { ProductFormModal } from './ProductFormModal';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  brand?: string;
  category?: string;
  sku?: string;
  slug?: string;
  description: string;
  stock: number;
  image_url: string;
  images?: string[];
}

import { ProductSmallCard } from './ProductSmallCard';

interface ProductGridProps {
  isAuthenticated?: boolean;
  userRole?: 'admin' | 'empleado' | 'usuario' | null;
  userId?: string;
  onRequireLogin?: () => void;
}

export function ProductGrid({ isAuthenticated = false, userRole = null, userId, onRequireLogin }: ProductGridProps) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const sortBy = searchParams.get('sort') || 'stock-desc';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
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
      fetchFavorites(); // Revert on failure
    }
  };

  const ITEMS_PER_PAGE = 12;

  const canManageProducts = userRole === 'admin' || userRole === 'empleado';

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy]);

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', newSort);
    setSearchParams(params);
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
      } else {
        query = query.order('created_at', { ascending: false });
      }

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,sku.ilike.%${searchQuery}%`);
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
  }, [searchQuery, currentPage, sortBy]);

  useEffect(() => {
    fetchProducts();
    // Scroll to top when page changes
    if (currentPage > 1 || searchQuery || sortBy) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [fetchProducts, currentPage, searchQuery, sortBy]);

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

            <div className="flex items-center gap-2 flex-1 sm:flex-none">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-full sm:w-auto px-4 py-3 border border-gray-100 rounded-2xl text-xs font-black bg-white focus:ring-4 focus:ring-amber-500/10 outline-none shadow-sm cursor-pointer appearance-none text-gray-600 hover:border-amber-200 transition-all uppercase tracking-widest"
              >
                <option value="created_at-desc">Recientes</option>
                <option value="stock-desc">Stock (Max)</option>
                <option value="stock-asc">Stock (Min)</option>
                <option value="name-asc">A-Z</option>
                <option value="name-desc">Z-A</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {loading ? (
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
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {products.map((product) => (
            <ProductSmallCard
              key={product.id}
              product={product}
              isFavorite={favoriteIds.has(product.id)}
              onToggleFavorite={() => toggleFavorite(product.id)}
              onAddToCart={addToCart}
              onNavigate={() => navigate(`/producto/${product.slug || product.id}`)}
              onEdit={() => { setProductToEdit(product); setIsAddModalOpen(true); }}
              onDelete={(e: React.MouseEvent) => handleDeleteProduct(product.id, e)}
              canManage={canManageProducts && isAuthenticated}
            />
          ))}
        </div>
      )}

      {!loading && totalPages > 1 && (
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
