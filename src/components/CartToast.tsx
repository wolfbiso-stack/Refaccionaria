import { useCart } from '../context/CartContext';
import { ShoppingCart, CheckCircle2, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CartToast() {
  const { showToast, setShowToast, lastAddedProduct } = useCart();

  if (!showToast) return null;

  return (
    <div className="fixed top-24 right-4 z-[100] animate-in slide-in-from-right-10 fade-in duration-500">
      <div className="bg-white border-2 border-amber-500 rounded-2xl shadow-2xl shadow-amber-200/40 p-4 min-w-[300px] flex items-center gap-4">
        <div className="bg-amber-100 p-2 rounded-xl text-amber-600">
          <ShoppingCart className="w-6 h-6" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-xs font-black text-amber-700 uppercase tracking-widest">¡Añadido con éxito!</span>
          </div>
          <p className="text-sm font-bold text-gray-900 line-clamp-1">{lastAddedProduct}</p>
          <Link 
            to="/cotizador" 
            className="text-[10px] font-black text-amber-600 hover:text-amber-700 underline underline-offset-2 uppercase tracking-tighter mt-2 inline-block"
            onClick={() => setShowToast(false)}
          >
            Ver mi cotización ahora
          </Link>
        </div>

        <button 
          onClick={() => setShowToast(false)}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-400"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
