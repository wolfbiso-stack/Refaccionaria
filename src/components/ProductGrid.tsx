import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ProductFormModal } from './ProductFormModal';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  category?: string;
  sku?: string;
  slug?: string;
  description: string;
  stock: number;
  image_url: string;
}

interface ProductGridProps {
  isAuthenticated?: boolean;
}

export function ProductGrid({ isAuthenticated = false }: ProductGridProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

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
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

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
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, currentPage]);

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

        {isAuthenticated && (
          <button
            onClick={() => { setProductToEdit(null); setIsAddModalOpen(true); }}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shrink-0"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Agregar Producto
          </button>
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
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all hover:-translate-y-1 flex flex-col cursor-pointer ring-1 ring-transparent hover:ring-blue-100"
            >
              <div className="h-48 overflow-hidden bg-gray-100 relative">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-sm">Sin Imagen</div>
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-900 line-clamp-1" title={product.name}>{product.name}</h3>
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
                {isAuthenticated && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
                    <button
                      onClick={(e) => { e.stopPropagation(); setProductToEdit(product); setIsAddModalOpen(true); }}
                      className="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={(e) => handleDeleteProduct(product.id, e)}
                      className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                )}
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
