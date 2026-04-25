import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { ProductSmallCard } from './ProductSmallCard';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { HeartCrack } from 'lucide-react';

export function FavoritesView({ isAuthenticated, userId, onRequireLogin }: { isAuthenticated: boolean, userId?: string, onRequireLogin: () => void }) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated || !userId) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Fetch favorites with inner joint products
      const { data, error } = await supabase
        .from('user_favorites')
        .select(`
          product_id,
          products (*)
        `)
        .eq('user_id', userId);

      if (!error && data) {
        // filtrar cualquier producto nulo si se violó alguna restricción
        const populatedProducts = data.map(d => d.products).filter(p => p !== null);
        setProducts(populatedProducts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, userId]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const toggleFavorite = async (productId: string) => {
    if (!isAuthenticated || !userId) {
      onRequireLogin();
      return;
    }
    // IU Optimista: Eliminar de la lista inmediatamente
    setProducts(prev => prev.filter(p => p.id !== productId));
    await supabase.from('user_favorites').delete().eq('user_id', userId).eq('product_id', productId);
  };

  if (!isAuthenticated && !loading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-32 bg-white rounded-[2.5rem] border border-gray-50 shadow-sm text-center px-4">
        <HeartCrack className="w-20 h-20 text-gray-200 mb-6" />
        <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">Acceso Restringido</h2>
        <p className="text-gray-500 mb-8 max-w-md">Inicia sesión o crea una cuenta para poder guardar y gestionar tus propios productos favoritos.</p>
        <button 
          onClick={onRequireLogin}
          className="bg-[#fdc401] text-black font-bold px-8 py-3 rounded-lg hover:bg-[#edb801] shadow-sm uppercase tracking-wide transition-colors"
        >
          Iniciar Sesión
        </button>
      </div>
    );
  }

  return (
    <div className="w-full pb-12">
      <div className="mb-8 border-b border-gray-100 pb-6 flex items-center justify-between mt-6">
        <div>
          <h2 className="text-2xl lg:text-3xl font-black text-gray-900 uppercase tracking-tighter shrink-0 mb-1">
            Mis Favoritos
          </h2>
          <p className="text-sm text-gray-500 font-medium">Tienes {products.length} producto{products.length !== 1 ? 's' : ''} guardados</p>
        </div>
      </div>

      {loading ? (
        <div className="w-full flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-12 h-12 border-4 border-amber-100 border-t-amber-500 rounded-full animate-spin"></div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">Cargando Favoritos...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="w-full flex flex-col items-center justify-center py-24 bg-white rounded-[2.5rem] border border-gray-50 shadow-sm text-center px-4">
          <HeartCrack className="w-16 h-16 text-gray-100 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Tu lista está vacía</h2>
          <p className="text-gray-400 font-medium max-w-sm mb-6">Explora nuestro catálogo y marca los productos que más te gustan con el corazón.</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-[#000] text-white font-bold px-6 py-2.5 rounded-lg hover:bg-gray-800 shadow-sm transition-colors text-sm"
          >
            Explorar Productos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {products.map((product) => (
            <ProductSmallCard
              key={product.id}
              product={product}
              isFavorite={true}
              onToggleFavorite={() => toggleFavorite(product.id)}
              onAddToCart={addToCart}
              onNavigate={() => navigate(`/producto/${product.slug || product.id}`)}
              canManage={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
