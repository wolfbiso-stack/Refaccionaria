import { useState, useEffect, useCallback } from 'react';
import { Plus, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ProductFormModal } from './ProductFormModal';

interface Product {
  id: string;
  name: string;
  category?: string;
  description: string;
  stock: number;
  image_url: string;
}

interface ProductGridProps {
  onProductClick?: (id: string) => void;
}

export function ProductGrid({ onProductClick }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
      } else {
        setProducts(data || []);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Inventario de Productos</h2>
          <p className="text-sm text-gray-500 mt-1">Administra las refracciones disponibles en almacén</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar productos..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors shadow-sm"
            />
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shrink-0"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Agregar Producto
          </button>
        </div>
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
              onClick={() => onProductClick && onProductClick(product.id)}
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
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 shrink-0 ml-2 shadow-sm`}>
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
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
                  <button onClick={(e) => e.stopPropagation()} className="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">Editar</button>
                  <button onClick={(e) => e.stopPropagation()} className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors">Eliminar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ProductFormModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={fetchProducts} 
      />
    </div>
  );
}
