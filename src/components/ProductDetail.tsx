import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { ArrowLeft, Box, AlertTriangle, Trash2, ChevronLeft, ChevronRight, ShieldAlert, Minus, Plus, Heart } from 'lucide-react';
import { ProductFormModal } from './ProductFormModal';
import { useParams, useNavigate } from 'react-router-dom';

interface ProductDetailProps {
  isAuthenticated?: boolean;
  userRole?: 'admin' | 'empleado' | 'usuario' | null;
  userId?: string;
  onRequireLogin?: () => void;
}

interface Product {
  id: string;
  name: string;
  brand?: string;
  description: string;
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

export function ProductDetail({ isAuthenticated = false, userRole = null, userId, onRequireLogin }: ProductDetailProps) {
  const { id: slugOrId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (product?.id && isAuthenticated && userId) {
      supabase.from('user_favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', product.id)
        .then(({data, error}) => {
          if (!error && data && data.length > 0) setIsFavorite(true);
          else setIsFavorite(false);
        });
    } else {
      setIsFavorite(false);
    }
  }, [product?.id, isAuthenticated, userId]);

  const toggleFavorite = async () => {
    if (!isAuthenticated || !userId) {
      if (onRequireLogin) onRequireLogin();
      return;
    }
    if (!product) return;

    const currentlyFavorite = isFavorite;
    setIsFavorite(!currentlyFavorite); // Optimistic

    try {
      if (currentlyFavorite) {
        await supabase.from('user_favorites').delete().eq('user_id', userId).eq('product_id', product.id);
      } else {
        await supabase.from('user_favorites').insert({ user_id: userId, product_id: product.id });
      }
    } catch (err) {
      console.error(err);
      setIsFavorite(currentlyFavorite); // Revert
    }
  };

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
        className="group inline-flex items-center text-sm font-bold text-gray-400 hover:text-amber-700 transition-all tracking-wide"
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
          <div className="p-6 lg:p-8 flex flex-col">
            <div className="flex-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 tracking-tight mb-1.5">
                {product.name} {product.brand ? `- ${product.brand}` : ''}
              </h1>

              <div className="flex items-center gap-6 mb-6 text-sm lg:text-base">
                <p className="font-bold text-gray-700">
                  Número de Parte: <span className="text-[#fdc401]">{sku}</span>
                </p>
                {/* Category display removed */}
              </div>

              <div className="border-t border-gray-50 pt-5 mb-5">
                <p className="text-gray-500 font-medium leading-relaxed text-[13px] opacity-90 max-w-lg">
                  {product.description || `Te ofrecemos ${product.name} marca ${product.brand || ''}, consulta nuestro increíble precio y ¡Compra ahora!.`}
                </p>
              </div>

              {/* Sector de Compra (Cantidad y Carrito) */}
              <div className="mb-4 flex flex-wrap items-end gap-3 sm:gap-4">
                
                {/* Cantidad */}
                <div>
                  <label className="block text-xs font-black text-gray-400 mb-2 tracking-wide">Cantidad</label>
                  <div className="flex items-center w-28 h-12 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm shadow-gray-100">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="flex-[1] h-full flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors border-r border-gray-100"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex-[1.2] h-full flex items-center justify-center font-black text-gray-800 text-[14px]">
                      {quantity}
                    </div>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="flex-[1] h-full flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors border-l border-gray-100"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Agregar al carrito */}
                <button 
                  onClick={() => addToCart(product, quantity)}
                  className="flex-1 min-w-[200px] h-12 flex items-center justify-center gap-3 bg-[#fdc401] hover:bg-[#edb801] text-black px-8 rounded-xl font-bold text-sm tracking-wide shadow-sm transition-all active:scale-95 whitespace-nowrap"
                >
                  Agregar al carrito
                </button>
              </div>

              {/* Agregar a Favoritos */}
              <div className="mb-8">
                <button
                  onClick={toggleFavorite}
                  className={`flex items-center group gap-2 font-bold text-xs tracking-wide transition-colors ${isFavorite ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Heart className={`w-4 h-4 transition-colors ${isFavorite ? 'text-red-500' : 'text-gray-300 group-hover:text-red-400'}`} fill={isFavorite ? 'currentColor' : 'none'} strokeWidth={2.5}/>
                  Agregar a favoritos
                </button>
              </div>
            </div>

            {/* Panel Secundario (Compartir) */}
            <div className="space-y-6">
              <div className="flex flex-col gap-5">
                
                <div className="flex items-center justify-between gap-8">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-gray-400 tracking-wide">Comparte</span>
                    <div className="flex items-center gap-2">
                       <a 
                         href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="w-8 h-8 rounded-full bg-[#3b5998] flex items-center justify-center text-white hover:opacity-90 transition-opacity"
                       >
                         <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                           <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                         </svg>
                       </a>
                       <a 
                         href={`fb-messenger://share?link=${encodeURIComponent(window.location.href)}&app_id=123456789`}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="w-8 h-8 rounded-full bg-[#0084FF] flex items-center justify-center text-white hover:opacity-90 transition-opacity"
                       >
                         <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                           <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.304 2.246.464 3.443.464 6.627 0 12-4.974 12-11.111C24 4.974 18.627 0 12 0zm1.291 14.88l-3.057-3.262-5.96 3.262 6.556-6.958 3.129 3.262 5.89-3.262-6.558 6.958z"/>
                         </svg>
                       </a>
                       <a 
                         href={`https://wa.me/?text=${encodeURIComponent(`Mira esta refacción en CORDOBESA: ${product.name} - ${window.location.href}`)}`}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-90 transition-opacity"
                       >
                         <img src="/whatsapp.png" alt="WhatsApp" className="w-full h-full object-contain" />
                       </a>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-800">¿Necesitas ayuda?</p>
                    <a 
                      href={`https://wa.me/529246886220?text=${encodeURIComponent(`Hola, necesito ayuda respecto al artículo "${product.name}"`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-[#25d366] hover:underline tracking-wide"
                    >
                      Contáctanos
                    </a>
                  </div>
                </div>
              </div>

              {/* Disponibilidad (Más grande por solicitud) */}
              <div className="pt-4 flex items-center gap-3 text-sm font-bold text-gray-800 tracking-wide border-t border-gray-100">
                <div className={`h-2.5 w-2.5 rounded-full shadow-sm ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>{product.stock} unidades disponibles</span>
              </div>

              {isAuthenticated && canManageProducts && (
                <div className="pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="flex items-center justify-center px-4 py-2.5 border border-amber-200 text-xs font-bold rounded-xl text-amber-900 bg-white hover:bg-amber-50 transition-all tracking-wide"
                    >
                      Editar Producto
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex items-center justify-center px-4 py-2.5 border border-red-100 text-xs font-bold rounded-xl text-red-600 bg-white hover:bg-red-50 transition-all tracking-wide"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-2" />
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Auditoría (Solo Admin) */}
            {userRole === 'admin' && (
              <div className="mt-8 bg-gray-900 p-6 rounded-2xl text-white shadow-xl">
                <h4 className="text-sm font-bold tracking-wide mb-4 flex items-center text-amber-500">
                  <ShieldAlert className="h-4 w-4 mr-2" />
                  Panel Administrador
                </h4>
                <div className="space-y-2 text-xs font-mono opacity-80">
                  <p className="flex justify-between">
                    <span>Creador:</span>
                    <span className="text-amber-200">{product.creatorEmail || 'Sistema'}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Última mod:</span>
                    <span className="text-amber-200">{product.editorEmail || 'Original'}</span>
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
