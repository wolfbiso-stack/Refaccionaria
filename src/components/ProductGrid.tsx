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
  }, [fetchProducts]);

  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center w-full">
        {searchQuery ? (
          <div>
            <h2 className="text-xl font-bold text-gray-800">Resultados de búsqueda</h2>
            <p className="text-sm text-gray-500 mt-1">Mostrando coincidencias para "<span className="font-semibold text-gray-900">{searchQuery}</span>" ({totalProducts})</p>
            <button onClick={() => navigate('/')} className="text-sm font-medium text-blue-600 hover:text-blue-800 mt-2 transition-colors">
              &larr; Limpiar búsqueda y ver todo
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold text-gray-800">Catálogo General</h2>
            <p className="text-sm text-gray-500 mt-1">Navegando {totalProducts} productos</p>
          </div>
        )}

        {isAuthenticated && canManageProducts && (
          <div className="flex items-center gap-4 shrink-0">
            {userRole === 'admin' && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 font-medium hidden sm:inline">Ordenar:</span>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none shadow-sm cursor-pointer"
                >
                  <option value="created_at-desc">Más recientes</option>
                  <option value="stock-desc">Stock (Mayor a menor)</option>
                  <option value="stock-asc">Stock (Menor a mayor)</option>
                  <option value="name-asc">Nombre (A-Z)</option>
                  <option value="name-desc">Nombre (Z-A)</option>
                </select>
              </div>
            )}
            
            <button
              onClick={() => { setProductToEdit(null); setIsAddModalOpen(true); }}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-black rounded-xl text-amber-950 bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-100 transition-all active:scale-95"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              Agregar <span className="hidden sm:inline">&nbsp;Producto</span>
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="w-full flex justify-center py-12">
          <p className="text-gray-500 font-medium animate-pulse">Conectando a Supabase y cargando productos...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="w-full flex justify-center py-12 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-500 font-medium">No hay productos en tu base de datos todavía. Revisa tus claves de entorno o inserta datos desde SQL.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => navigate(`/producto/${product.slug || product.id}`)}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 transition-all hover:-translate-y-1 flex flex-col cursor-pointer ring-2 ring-transparent hover:ring-amber-500/10 group"
            >
              <div className="h-48 overflow-hidden bg-gray-50/80 relative flex items-center justify-center p-4 group-hover:bg-gray-100 transition-colors">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-sm"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-300">
                    <div className="bg-white p-3 rounded-full shadow-sm">
                      <Plus className="h-6 w-6 rotate-45" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest">Sin Imagen</span>
                  </div>
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-1" title={product.name}>{product.name}</h3>
                    {product.brand && (
                      <p className="text-xs font-black text-amber-600 uppercase tracking-tighter">{product.brand}</p>
                    )}
                  </div>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} shrink-0 ml-2 shadow-sm`}>
                    Stock: {product.stock}
                  </span>
                </div>
                {product.category && (
                  <div className="mb-2">
                    <span className="inline-block px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-gray-100 text-gray-600 rounded">
                      {product.category}
                    </span>
                  </div>
                )}
                <p className="text-sm text-gray-600 line-clamp-2 mt-1 flex-1">
                  {product.description || "Sin descripción."}
                </p>
                <div className="mt-auto pt-6 flex flex-col gap-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-amber-950 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-100 transition-all active:scale-95"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Añadir al Carrito
                  </button>

                  {isAuthenticated && canManageProducts && (
                    <div className="pt-3 border-t border-gray-50 flex justify-between">
                      <button
                        onClick={(e) => { e.stopPropagation(); setProductToEdit(product); setIsAddModalOpen(true); }}
                        className="text-xs font-black text-amber-600 hover:text-amber-700 transition-colors uppercase tracking-widest"
                      >
                        Editar
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteProduct(product.id, e); }}
                        className="text-xs font-black text-red-600 hover:text-red-700 transition-colors uppercase tracking-widest"
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center mt-8 py-4 border-t border-gray-100 gap-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="text-sm font-medium text-gray-700">
            Página {currentPage} de {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
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
