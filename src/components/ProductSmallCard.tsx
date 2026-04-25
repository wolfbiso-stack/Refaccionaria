import { Heart } from 'lucide-react';

export function ProductSmallCard({ product, isFavorite, onToggleFavorite, onAddToCart, onNavigate, onEdit, onDelete, canManage, viewMode = 'grid' }: any) {
  const hasStock = product.stock > 0;

  if (viewMode === 'list') {
    return (
      <div
        onClick={onNavigate}
        className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer overflow-hidden flex flex-col sm:flex-row relative group p-4 gap-6"
      >
        {/* Izquierda: Imagen */}
        <div className="relative w-full sm:w-[200px] sm:shrink-0 h-[200px] flex items-center justify-center bg-gray-50/50 rounded-xl border border-gray-100">
          {product.sku && (
            <div className="absolute top-2 left-2 text-[#fdc401] text-[11px] font-black uppercase z-10 tracking-widest bg-white/80 px-1.5 py-0.5 rounded">
              {product.sku}
            </div>
          )}
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="max-w-full max-h-full object-contain p-2"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-300">
               <span className="text-xs font-medium">Sin imagen</span>
            </div>
          )}
        </div>

        {/* Medio y Derecha: Información y Acciones */}
        <div className="flex flex-col flex-1 justify-between py-2">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h3 className="text-lg font-black text-gray-900 leading-snug capitalize mb-2 hover:text-[#fdc401] transition-colors">
                {product.name?.toLowerCase() || ''}
              </h3>
              {product.brand && (
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Marca: {product.brand}</p>
              )}
              {product.description && (
                <p className="text-sm font-medium text-gray-500 line-clamp-2 leading-relaxed max-w-2xl">{product.description}</p>
              )}
            </div>

            <button 
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }} 
              className={`transition-colors shrink-0 p-2 rounded-full border ${isFavorite ? 'text-red-500 bg-red-50 border-red-100/50 hover:bg-red-100' : 'text-gray-400 border-transparent hover:bg-gray-50 hover:border-gray-200 hover:text-red-500'}`}
            >
              <Heart className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} strokeWidth={2} />
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                Disponibilidad
              </span>
              <span className={`px-2.5 py-1 rounded text-xs font-black tracking-widest ${hasStock ? 'bg-[#eBfBF3] text-[#2dB97A]' : 'bg-red-50 text-red-600'}`}>
                {product.stock} EN STOCK
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {canManage && (
                <div className="flex items-center gap-2 mr-4">
                  <button
                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                    className="text-[10px] font-black text-amber-600 hover:text-amber-800 uppercase tracking-widest bg-amber-50 px-3 py-2 rounded transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(e); }}
                    className="text-[10px] font-black text-red-500 hover:text-red-700 uppercase tracking-widest bg-red-50 px-3 py-2 rounded transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); onAddToCart(product, 1); }}
                className="w-full sm:w-auto px-8 py-3 bg-[#fdc401] hover:bg-[#edb801] text-black text-sm font-black uppercase tracking-widest rounded transition-colors"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Diseño de Cuadrícula (Predeterminado)
  return (
    <div
      onClick={onNavigate}
      className="bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer overflow-hidden flex flex-col h-full relative"
    >
      {/* Caja Superior de Imagen */}
      <div className="relative h-[150px] sm:h-[180px] p-4 flex items-center justify-center bg-white border-b border-gray-50/50">
        
        {/* Insignia SKU */}
        {product.sku && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 text-[#fdc401] text-[11px] sm:text-[13px] font-black uppercase z-10 tracking-widest">
            {product.sku}
          </div>
        )}
        {/* Icono de Corazón */}
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }} 
          className={`absolute top-2 right-2 sm:top-3 sm:right-3 z-10 transition-colors ${isFavorite ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-red-500'}`}
        >
          <Heart className="w-[18px] h-[18px]" fill={isFavorite ? 'currentColor' : 'none'} strokeWidth={2} />
        </button>

        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-300 h-full w-full bg-gray-50/50 rounded-lg">
             <span className="text-xs font-medium">Sin imagen</span>
          </div>
        )}
      </div>

      {/* Caja de Información */}
      <div className="p-3 sm:p-4 flex flex-col flex-1">

        {/* Título */}
        <h3 className="text-[12px] sm:text-[13px] font-medium text-gray-900 leading-snug line-clamp-2 h-[34px] sm:h-[38px] capitalize mb-1 mt-2">
          {product.name?.toLowerCase() || ''}
        </h3>

        {/* Barra de progreso y detalles */}
        <div className="mt-auto pt-2 pb-1 border-t border-gray-50">
          <div className="w-full h-[4px] bg-gray-200 overflow-hidden relative rounded-full">
            <div className={`absolute top-0 left-0 h-full ${hasStock ? 'bg-[#f2474f] w-full' : 'bg-gray-400 w-0'}`}></div>
          </div>
          <div className="flex justify-between items-center mt-1.5">
            <span className="text-[10px] sm:text-[11px] text-gray-500 font-bold tracking-tight uppercase flex items-center gap-1.5">
              Stock
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-black tracking-wider ${hasStock ? 'bg-[#eBfBF3] text-[#2dB97A]' : 'bg-red-50 text-red-600'}`}>
                {product.stock}
              </span>
            </span>
          </div>
        </div>

        {/* Botón Agregar al Carrito */}
        <button
          onClick={(e) => { e.stopPropagation(); onAddToCart(product, 1); }}
          className="w-full h-[36px] bg-[#fdc401] hover:bg-[#edb801] text-black text-[12px] sm:text-[13px] font-bold rounded transition-colors relative z-10 flex items-center justify-center mt-3 shadow-sm gap-2"
        >
          Agregar al carrito
        </button>

        {/* Botones de Acción para Administradores */}
        {canManage && (
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
             <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="text-[9px] sm:text-[10px] font-black text-amber-600 hover:text-amber-800 uppercase tracking-widest transition-colors flex-1 text-center bg-amber-50 py-1.5 rounded"
            >
              Editar
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(e); }}
              className="text-[9px] sm:text-[10px] font-black text-red-500 hover:text-red-700 uppercase tracking-widest transition-colors flex-1 text-center bg-red-50 py-1.5 rounded"
            >
              Eliminar
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
