import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Plus, ShoppingCart } from 'lucide-react';
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

interface ProductGridProps {
  isAuthenticated?: boolean;
  userRole?: 'admin' | 'empleado' | 'usuario' | null;
}

export function ProductGrid({ isAuthenticated = false, userRole = null }: ProductGridProps) {
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductSmallCard
              key={product.id}
              product={product}
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

// Componente Interno para la nueva tarjeta vertical basada en el diseño proporcionado
function ProductSmallCard({ product, onAddToCart, onNavigate, onEdit, onDelete, canManage }: any) {
  const [qty, setQty] = useState(1);

  const increment = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQty(prev => prev + 1);
  };

  const decrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (qty > 1) setQty(prev => prev - 1);
  };

  return (
    <div
      onClick={onNavigate}
      className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-gray-200 transition-all duration-300 group flex flex-col cursor-pointer overflow-hidden h-full"
    >
      {/* Top section: Image and SKU */}
      <div className="relative h-40 sm:h-44 p-4 flex items-center justify-center bg-white w-full">
        {/* SKU top right */}
        {product.sku && (
          <div className="absolute top-4 right-4 z-10">
            <p className="text-[11px] sm:text-[12px] font-black text-[#F26522] uppercase tracking-tighter">
              {product.sku}
            </p>
          </div>
        )}

        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-300 h-full w-full bg-gray-50/50 rounded-lg">
             <span className="text-xs font-medium">Sin imagen</span>
          </div>
        )}
      </div>

      {/* Info section */}
      <div className="px-4 pb-1 flex flex-col flex-1">
        <h3 className="text-[13px] sm:text-[14px] font-black text-gray-900 leading-snug line-clamp-2 min-h-[40px] capitalize tracking-wide">
          {product.name?.toLowerCase() || ''}
        </h3>

        <div className="mt-2">
          <span className={`px-2 py-0.5 text-[10px] font-black rounded uppercase tracking-wider ${product.stock > 0
            ? 'bg-[#eBfBF3] text-[#2dB97A]'
            : 'bg-red-50 text-red-600'
            }`}>
            {product.stock > 0 ? `STOCK: ${product.stock}` : 'AGOTADO'}
          </span>
        </div>

        {/* Space filler to push quantity and buttons to bottom */}
        <div className="flex-1"></div>

        {/* Quantity */}
        <div className="mt-4 mb-4 flex items-center justify-between gap-2">
          <p className="text-[12px] font-semibold text-gray-400">Cantidad</p>
          <div className="flex items-center border border-gray-100 rounded overflow-hidden bg-white h-[30px] w-fit shadow-sm">
            <button
              onClick={decrement}
              className="px-3 h-full hover:bg-gray-50 text-gray-600 transition-colors text-sm font-bold border-r border-gray-100"
            >
              -
            </button>
            <div className="w-8 h-full flex items-center justify-center text-[13px] font-black text-gray-900">
              {qty}
            </div>
            <button
              onClick={increment}
              className="px-3 h-full hover:bg-gray-50 text-gray-600 transition-colors text-sm font-bold border-l border-gray-100"
            >
              +
            </button>
          </div>
        </div>

        {canManage && (
          <div className="flex items-center gap-2 mb-3 border-t border-gray-50 pt-3">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="text-[9px] font-black text-amber-600 hover:text-amber-800 uppercase tracking-widest transition-colors flex-1 text-center bg-amber-50 py-1.5 rounded"
            >
              Editar
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(e); }}
              className="text-[9px] font-black text-red-500 hover:text-red-700 uppercase tracking-widest transition-colors flex-1 text-center bg-red-50 py-1.5 rounded"
            >
              Eliminar
            </button>
          </div>
        )}
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onAddToCart(product, qty); }}
        className="w-full bg-[#fdc401] hover:bg-[#edb801] text-black py-3 font-black text-[12px] transition-colors uppercase tracking-wider flex items-center justify-center gap-2 mt-auto"
      >
        <ShoppingCart className="w-4 h-4 text-black/60" strokeWidth={2.5}/>
        AGREGAR AL CARRITO
      </button>
    </div>
  );
}
