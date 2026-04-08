import { Heart } from 'lucide-react';

export function ProductSmallCard({ product, isFavorite, onToggleFavorite, onAddToCart, onNavigate, onEdit, onDelete, canManage }: any) {
  const hasStock = product.stock > 0;
  
  return (
    <div
      onClick={onNavigate}
      className="bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer overflow-hidden flex flex-col h-full relative"
    >
      {/* Top Image Box */}
      <div className="relative h-[150px] sm:h-[180px] p-4 flex items-center justify-center bg-white border-b border-gray-50/50">
        
        {/* SKU Badge */}
        {product.sku && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 text-[#fdc401] text-[11px] sm:text-[13px] font-black uppercase z-10 tracking-widest">
            {product.sku}
          </div>
        )}
        {/* Heart Icon */}
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

      {/* Info Box */}
      <div className="p-3 sm:p-4 flex flex-col flex-1">

        {/* Title */}
        <h3 className="text-[12px] sm:text-[13px] font-medium text-gray-900 leading-snug line-clamp-2 h-[34px] sm:h-[38px] capitalize mb-1 mt-2">
          {product.name?.toLowerCase() || ''}
        </h3>

        {/* Progress bar and details */}
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

        {/* Add to Cart Button */}
        <button
          onClick={(e) => { e.stopPropagation(); onAddToCart(product, 1); }}
          className="w-full h-[36px] bg-[#fdc401] hover:bg-[#edb801] text-black text-[12px] sm:text-[13px] font-bold rounded transition-colors relative z-10 flex items-center justify-center mt-3 shadow-sm gap-2"
        >
          Agregar al carrito
        </button>

        {/* Action Buttons for Admins */}
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
