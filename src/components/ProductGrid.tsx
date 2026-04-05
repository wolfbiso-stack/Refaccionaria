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
  const sortBy = searchParams.get('sort') || 'created_at-desc';
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
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tighter">Catálogo General</h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1 italic">Mostrando {totalProducts} productos</p>
          </div>
        )}

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

// Componente Interno para la nueva tarjeta horizontal compacta
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
      className="bg-white rounded-[1.5rem] border border-gray-100/80 shadow-sm hover:shadow-2xl hover:shadow-gray-300/40 transition-all duration-300 group flex flex-col cursor-pointer overflow-hidden p-1.5"
    >
      <div className="flex p-4 gap-4 min-h-[170px] relative">
        {/* Branding overlay top right */}
        {product.brand && (
          <div className="absolute top-2 right-4 z-10">
            <p className="text-[11px] font-black text-gray-400 tracking-tighter opacity-70">
              {product.brand}
            </p>
          </div>
        )}

        {/* Image side */}
        <div className="w-2/5 min-w-[120px] flex items-center justify-center bg-gray-50/50 rounded-2xl overflow-hidden p-3 group-hover:bg-white transition-colors">
          {product.image_url ? (
            <img 
              src={product.image_url} 
              alt={product.name} 
              className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <ShoppingCart className="w-10 h-10 text-gray-100" />
          )}
        </div>

        {/* Data side */}
        <div className="flex-1 flex flex-col pt-4">
          {product.sku && (
            <p className="text-xs font-black text-[#fdc401] uppercase tracking-tight mb-1" title={product.sku}>
              {product.sku}
            </p>
          )}
          <h3 className="text-sm lg:text-base font-bold text-gray-900 leading-tight line-clamp-3 pr-6 mb-2">
            {product.name}
          </h3>

          <div className="flex items-center gap-2 mb-4">
            <span className={`px-3 py-1 text-sm font-black rounded-lg border uppercase tracking-tighter shadow-md ${
              product.stock > 0 
                ? 'bg-green-100 text-green-700 border-green-200' 
                : 'bg-red-100 text-red-700 border-red-200'
            }`}>
              {product.stock > 0 ? `Stock: ${product.stock}` : 'Agotado'}
            </span>
          </div>

          <div className="mt-auto flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase italic">Cantidad</p>
              <div className="flex items-center border border-gray-100 rounded-lg overflow-hidden bg-gray-50/50 h-8">
                <button 
                  onClick={decrement}
                  className="px-2 h-full hover:bg-gray-100 text-gray-500 transition-colors"
                >
                  -
                </button>
                <div className="w-8 h-full flex items-center justify-center text-xs font-black text-gray-700 bg-white border-x border-gray-100">
                  {qty}
                </div>
                <button 
                  onClick={increment}
                  className="px-2 h-full hover:bg-gray-100 text-gray-500 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-1 pb-1 flex flex-col gap-1">
        <button
          onClick={(e) => { e.stopPropagation(); onAddToCart(product, qty); }}
          className="w-full bg-[#fdc401] hover:bg-amber-400 text-black py-2.5 rounded-xl font-black text-xs transition-all active:scale-95 shadow-sm uppercase tracking-widest"
        >
          Agregar al carrito
        </button>

        {canManage && (
          <div className="flex items-center justify-between px-3 py-1 mb-1">
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="text-[9px] font-black text-amber-700 hover:underline uppercase tracking-widest"
            >
              Editar
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(e); }}
              className="text-[9px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest"
            >
              Eliminar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
