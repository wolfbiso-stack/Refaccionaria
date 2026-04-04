import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Box, Tag, Info, AlertTriangle, Trash2 } from 'lucide-react';
import { ProductFormModal } from './ProductFormModal';
import { useParams, useNavigate } from 'react-router-dom';

interface ProductDetailProps {
  isAuthenticated?: boolean;
  userRole?: 'admin' | 'empleado' | null;
}

interface Product {
  id: string;
  name: string;
  description: string;
  category?: string;
  sku?: string;
  slug?: string;
  stock: number;
  image_url: string;
  created_at: string;
  user_id?: string;
  updated_by?: string;
  creatorEmail?: string;
  editorEmail?: string;
}

export function ProductDetail({ isAuthenticated = false, userRole = null }: ProductDetailProps) {
  const { id: slugOrId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);

      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId || '');

      let query = supabase.from('products').select('*');
      if (isUuid) {
        query = query.eq('id', slugOrId);
      } else {
        query = query.eq('slug', slugOrId);
      }

      const { data, error } = await query.single();

      if (error) throw error;

      let creatorEmail = '';
      let editorEmail = '';

      if (userRole === 'admin') {
        if (data.user_id) {
          const creatorData = await supabase.from('user_profiles').select('email').eq('id', data.user_id).single();
          creatorEmail = creatorData.data?.email || 'Desconocido';
        }
        if (data.updated_by) {
          const editorData = await supabase.from('user_profiles').select('email').eq('id', data.updated_by).single();
          editorEmail = editorData.data?.email || 'Desconocido';
        }
      }

      setProduct({ ...data, creatorEmail, editorEmail });
    } catch (err: any) {
      console.error('Error fetching product details:', err);
      setError('No se pudo cargar la información de este artículo. Es posible que haya sido eliminado.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [slugOrId, userRole]);

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        const { error: deleteError } = await supabase.from('products').delete().eq('id', product!.id);
        if (deleteError) throw deleteError;
        navigate('/');
      } catch (err) {
        console.error('Error eliminando producto:', err);
        alert('Ocurrió un error al intentar eliminar el producto.');
      }
    }
  };

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse">Cargando detalles del producto...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 flex flex-col items-center text-center max-w-lg mx-auto mt-12">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Error al cargar</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al Inventario
        </button>
      </div>
    );
  }

  const sku = product.sku || 'N/A';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Barra de Navegación Superior */}
      <button
        onClick={() => navigate(-1)}
        className="group inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
      >
        <div className="bg-white p-1.5 rounded-full shadow-sm border border-gray-100 mr-3 group-hover:border-blue-200 group-hover:bg-blue-50 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </div>
        Volver al Inventario
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">

          {/* Columna Izquierda: Imagen */}
          <div className="bg-gray-50/50 p-6 lg:p-12 border-b lg:border-b-0 lg:border-r border-gray-100 flex items-center justify-center min-h-[300px] lg:min-h-[500px]">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="max-w-full max-h-[400px] object-contain drop-shadow-md rounded-lg transition-transform hover:scale-105 duration-500"
              />
            ) : (
              <div className="flex flex-col items-center text-gray-400">
                <Box className="h-24 w-24 mb-4 opacity-50" />
                <p className="font-medium">Sin imagen disponible</p>
              </div>
            )}
          </div>

          {/* Columna Derecha: Detalles */}
          <div className="p-6 lg:p-10 flex flex-col">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                {product.category && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 tracking-wide uppercase">
                    <Tag className="h-3 w-3 mr-1.5" />
                    {product.category}
                  </span>
                )}
                <span className="text-xs text-gray-400 font-mono">SKU: {sku}</span>
              </div>

              <h1 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tight mb-4">
                {product.name}
              </h1>

              <div className="prose prose-blue text-gray-600 mb-8 max-w-none">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center">
                  <Info className="h-4 w-4 mr-2 text-blue-500" />
                  Descripción del Producto
                </h3>
                <p className="leading-relaxed whitespace-pre-line">
                  {product.description || "Este artículo no cuenta con una descripción detallada en la base de datos."}
                </p>
              </div>
            </div>

            {/* Caja de Stock y Acción */}
            <div className="bg-gray-50 rounded-2xl p-6 mt-8 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Disponibilidad</p>
                  <div className="flex items-center gap-2">
                    <span className={`h-3 w-3 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-xl font-bold text-gray-900">
                      {product.stock} <span className="text-base font-normal text-gray-500">en stock</span>
                    </span>
                  </div>
                </div>

                {isAuthenticated && (
                  <div className="text-right">
                    <p className="text-sm text-gray-500 font-medium mb-1">Alta de Registro</p>
                    <p className="text-gray-900 font-medium">
                      {new Date(product.created_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {isAuthenticated && (
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-all"
                  >
                    Editar Detalles
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full flex items-center justify-center px-6 py-3 border border-red-300 text-base font-medium rounded-xl text-red-600 bg-white hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-sm transition-all"
                  >
                    <Trash2 className="h-5 w-5 mr-2" />
                    Eliminar Producto
                  </button>
                </div>
              )}
            </div>

            {/* Panel de Auditoría para Admin */}
            {userRole === 'admin' && (
              <div className="mt-6 bg-yellow-50/80 border border-yellow-200 rounded-2xl p-5 shadow-sm">
                <h4 className="text-sm font-bold text-yellow-800 uppercase tracking-wider mb-3 flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  Registro de Auditoría (Solo Administradores)
                </h4>
                <div className="space-y-2 text-sm text-yellow-900">
                  <div className="flex justify-between">
                    <span className="font-medium">Creado por:</span>
                    <span>{product.creatorEmail || 'No registrado'}</span>
                  </div>
                  <div className="flex justify-between border-t border-yellow-200/50 pt-2">
                    <span className="font-medium">Última edición:</span>
                    <span>{product.editorEmail || 'Nunca editado'}</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {product && (
        <ProductFormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => {
            setIsEditModalOpen(false);
            fetchProductDetails();
          }}
          initialProduct={product}
        />
      )}
    </div>
  );
}
