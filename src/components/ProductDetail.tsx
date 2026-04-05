import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { ArrowLeft, Box, Tag, Info, AlertTriangle, Trash2, ChevronLeft, ChevronRight, ShoppingCart, ShieldAlert } from 'lucide-react';
import { ProductFormModal } from './ProductFormModal';
import { useParams, useNavigate } from 'react-router-dom';

interface ProductDetailProps {
  isAuthenticated?: boolean;
  userRole?: 'admin' | 'empleado' | 'usuario' | null;
}

interface Product {
  id: string;
  name: string;
  brand?: string;
  description: string;
  category?: string;
  sku?: string;
  slug?: string;
  stock: number;
  image_url: string;
  images?: string[];
  created_at: string;
  user_id?: string;
  updated_by?: string;
  creatorEmail?: string;
  editorEmail?: string;
}

export function ProductDetail({ isAuthenticated = false, userRole = null }: ProductDetailProps) {
  const { id: slugOrId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const canManageProducts = userRole === 'admin' || userRole === 'empleado';

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      setError(null);

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
    setActiveImageIdx(0);
  }, [slugOrId, userRole]);

  const handleDelete = async () => {
    if (!product) return;
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        const { error: deleteError } = await supabase.from('products').delete().eq('id', product.id);
        if (deleteError) throw deleteError;
        navigate('/');
      } catch (err) {
        console.error('Error eliminando producto:', err);
        alert('Ocurrió un error al intentar eliminar el producto.');
      }
    }
  };

  const nextImage = () => {
    if (!product?.images) return;
    setActiveImageIdx((prev) => (prev + 1) % (product.images?.length || 1));
  };

  const prevImage = () => {
    if (!product?.images) return;
    setActiveImageIdx((prev) => (prev - 1 + (product.images?.length || 1)) % (product.images?.length || 1));
  };

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-10 h-10 border-4 border-amber-100 border-t-amber-500 rounded-full animate-spin"></div>
        <p className="text-amber-900 font-bold animate-pulse uppercase tracking-widest text-[10px]">Cargando...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-white p-10 rounded-2xl shadow-xl border border-red-50 flex flex-col items-center text-center max-w-lg mx-auto mt-12 animate-in zoom-in duration-300">
        <div className="bg-red-50 p-4 rounded-full mb-6">
          <AlertTriangle className="h-10 w-10 text-red-500" />
        </div>
        <h2 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">Error al cargar</h2>
        <p className="text-gray-500 mb-8 font-medium">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-bold transition-all hover:bg-black active:scale-95 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al Catálogo
        </button>
      </div>
    );
  }

  const sku = product.sku || 'N/A';
  const displayImages = (product.images && product.images.length > 0) ? product.images : [product.image_url];
  const currentImage = displayImages[activeImageIdx] || product.image_url;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Barra de Navegación Superior */}
      <button
        onClick={() => navigate(-1)}
        className="group inline-flex items-center text-xs font-bold text-gray-400 hover:text-amber-700 transition-all uppercase tracking-widest"
      >
        <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 mr-3 group-hover:border-amber-200 group-hover:bg-amber-50 transition-all">
          <ArrowLeft className="h-4 w-4" />
        </div>
        Regresar
      </button>

      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          
          {/* Galería de Imágenes */}
          <div className="bg-gray-50/50 p-4 lg:p-8 border-b lg:border-b-0 lg:border-r border-gray-100 flex flex-col lg:flex-row gap-6">
            
            {/* Selector Lateral (Vertical Gallery) - Solo Desktop */}
            {displayImages.length > 1 && (
              <div className="hidden lg:flex flex-col gap-3 shrink-0 scrollbar-hide max-h-[500px] overflow-y-auto pr-2">
                {displayImages.map((img, idx) => (
                  <button
                    key={`${img}-${idx}`}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-white p-1
                      ${activeImageIdx === idx ? 'border-amber-500 shadow-md shadow-amber-100' : 'border-transparent hover:border-amber-200'}
                    `}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}

            <div className="relative flex-1 bg-white rounded-2xl border border-gray-100 overflow-hidden group flex items-center justify-center p-6 min-h-[350px] lg:min-h-[500px]">
              {currentImage ? (
                <img 
                  src={currentImage} 
                  alt={product.name} 
                  className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <Box className="w-16 h-16 text-gray-200" />
              )}

              {displayImages.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    className="absolute left-4 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md text-amber-950 hover:bg-amber-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md text-amber-950 hover:bg-amber-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {/* Miniaturas (Solo Móvil) */}
            {displayImages.length > 1 && (
              <div className="flex lg:hidden gap-3 overflow-x-auto pb-2 no-scrollbar justify-center">
                {displayImages.map((img, idx) => (
                  <button
                    key={`${img}-${idx}-mob`}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 bg-white p-1
                      ${activeImageIdx === idx ? 'border-amber-500' : 'border-transparent'}
                    `}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detalles del Producto */}
          <div className="p-6 lg:p-10 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {product.category && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black bg-gray-100 text-gray-600 tracking-wider uppercase">
                    <Tag className="h-3 w-3 mr-1.5" />
                    {product.category}
                  </span>
                )}
                {product.brand && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black bg-amber-50 text-amber-700 tracking-wider uppercase border border-amber-100/50">
                    {product.brand}
                  </span>
                )}
                <span className="text-[9px] text-gray-400 font-mono font-bold tracking-widest ml-auto">SKU: {sku}</span>
              </div>

              <h1 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tight mb-8">
                {product.name}
              </h1>

              <div className="space-y-4 mb-10">
                <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  Descripción
                </h3>
                <p className="text-gray-600 font-medium leading-relaxed whitespace-pre-line text-base opacity-90">
                  {product.description || "Sin descripción disponible."}
                </p>
              </div>
            </div>

            {/* Panel de Acción */}
            <div className="space-y-6">
              <div className="bg-amber-50/30 rounded-2xl p-6 border border-amber-100 flex items-center justify-between shadow-inner">
                <div>
                  <p className="text-[9px] font-black text-amber-700/60 uppercase tracking-widest mb-2">Disponibilidad</p>
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${product.stock > 0 ? 'bg-green-500 shadow-sm' : 'bg-red-500'}`}></div>
                    <span className="text-2xl font-black text-gray-900 tracking-tight">
                      {product.stock} <span className="text-sm font-bold text-gray-400 uppercase ml-1">unidades</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => addToCart(product)}
                  className="w-full flex items-center justify-center gap-3 bg-amber-500 hover:bg-amber-600 text-amber-950 px-6 py-4 rounded-xl font-black text-lg shadow-lg shadow-amber-100/50 transition-all active:scale-95 group"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Añadir al Cotizador
                </button>
                <button 
                  onClick={() => navigate('/cotizador')}
                  className="w-full text-center py-2 text-[10px] font-black text-amber-700/60 hover:text-amber-700 transition-colors uppercase tracking-[0.2em]"
                >
                  Finalizar Cotización
                </button>
              </div>

              {isAuthenticated && canManageProducts && (
                <div className="pt-6 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="flex items-center justify-center px-4 py-3 border border-amber-200 text-xs font-black rounded-xl text-amber-900 bg-white hover:bg-amber-50 transition-all"
                    >
                      Editar
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex items-center justify-center px-4 py-3 border border-red-100 text-xs font-black rounded-xl text-red-600 bg-white hover:bg-red-50 transition-all"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Auditoría (Solo Admin) */}
            {userRole === 'admin' && (
              <div className="mt-8 bg-gray-900 p-6 rounded-2xl text-white shadow-xl">
                <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center text-amber-500">
                  <ShieldAlert className="h-4 w-4 mr-2" />
                  Admin
                </h4>
                <div className="space-y-2 text-[10px] font-mono opacity-80">
                  <p className="flex justify-between">
                    <span>CREADOR:</span>
                    <span className="text-amber-200">{product.creatorEmail || 'SISTEMA'}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>ULTIMA_MOD:</span>
                    <span className="text-amber-200">{product.editorEmail || 'ORIGINAL'}</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ProductFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => {
          setIsEditModalOpen(false);
          fetchProductDetails();
        }}
        initialProduct={product}
      />
    </div>
  );
}
