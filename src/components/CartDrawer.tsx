import { X, ShoppingCart, Trash2, Plus, Minus, ArrowRight, ClipboardList } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
    const { cartItems, removeFromCart, updateQuantity, totalItems } = useCart();

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div 
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300" 
                onClick={onClose} 
            />
            
            {/* Drawer */}
            <aside className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[101] shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
                {/* Header */}
                <div className="p-6 bg-[#fdc401] text-black flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <ShoppingCart className="w-6 h-6" />
                            {totalItems > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center ring-2 ring-[#fdc401]">
                                    {totalItems}
                                </span>
                            )}
                        </div>
                        <h2 className="text-xl font-black tracking-tight">Tu Carrito</h2>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-[#cc9e01] rounded-xl transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {cartItems.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 px-10">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                                <ShoppingCart className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900">Tu carrito está vacío</h3>
                            <p className="text-gray-500 font-bold text-sm">Explora el catálogo y agrega las refacciones que necesites cotizar.</p>
                        </div>
                    ) : (
                        cartItems.map((item) => (
                            <div key={item.product.id} className="flex gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100 group hover:border-[#fdc401]/30 hover:bg-[#fdc401]/5 transition-all duration-300">
                                <div className="w-20 h-20 bg-white rounded-xl overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center">
                                    {item.product.image_url ? (
                                        <img src={item.product.image_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-gray-400">Sin img</div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 truncate uppercase tracking-tight group-hover:text-[#917101] transition-colors">
                                        {item.product.name}
                                    </h4>
                                    <p className="text-xs font-mono text-gray-400 mb-4 truncate uppercase tracking-widest">{item.product.sku || 'N/A'}</p>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-gray-100 shadow-sm">
                                            <button 
                                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                className="p-1 hover:bg-gray-50 text-gray-500 hover:text-amber-600 transition-colors"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-8 text-center font-black text-sm">{item.quantity}</span>
                                            <button 
                                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                className="p-1 hover:bg-gray-50 text-gray-500 hover:text-amber-600 transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <button 
                                            onClick={() => removeFromCart(item.product.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                    {cartItems.length > 0 ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-black text-gray-400 uppercase tracking-widest text-xs">Total de Productos:</span>
                                <span className="font-black text-gray-900 bg-[#fdc401]/30 px-3 py-1 rounded-full text-sm">{totalItems}</span>
                            </div>
                            <Link 
                                to="/cotizador"
                                onClick={onClose}
                                className="w-full flex items-center justify-center gap-3 bg-[#fdc401] hover:bg-[#cc9e01] text-black px-8 py-5 rounded-[1.5rem] font-black text-lg shadow-xl shadow-[#fdc401]/20 transition-all active:scale-95 group"
                            >
                                <ClipboardList className="w-6 h-6" />
                                Ir al Cotizador
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <button 
                                onClick={onClose}
                                className="w-full text-center py-2 text-sm font-bold text-gray-400 hover:text-gray-700 transition-colors"
                            >
                                Seguir agregando más refacciones
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={onClose}
                            className="w-full bg-gray-900 text-white px-8 py-5 rounded-[1.5rem] font-black text-lg shadow-xl shadow-gray-200 hover:bg-black transition-all active:scale-95"
                        >
                            Explorar Refacciones
                        </button>
                    )}
                </div>
            </aside>
        </>
    );
}
