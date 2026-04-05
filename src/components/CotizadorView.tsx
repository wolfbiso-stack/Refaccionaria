import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import { FileDown, Send, ArrowLeft, User, Phone as PhoneIcon, Mail, Building2, ClipboardList, Loader2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { generateQuotationPDF } from '../lib/pdfGenerator';

export function CotizadorView() {
    const { cartItems, clearCart } = useCart();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [validationError, setValidationError] = useState<boolean>(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) {
                setLoading(false);
                return;
            }

            const { data } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (data) setProfile(data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching profile:', err);
            setLoading(false);
        }
    };

    const generatePDF = async () => {
        // Validar que exista nombre y teléfono
        const hasName = profile?.is_corporate ? !!profile.corporate_name?.trim() : !!profile?.first_name?.trim();
        const hasPhone = !!profile?.phone?.trim();

        if (!hasName || !hasPhone) {
            setValidationError(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        try {
            setGenerating(true);
            setValidationError(false);
            
            // Generar folio único
            const folioNumber = Math.floor(1000 + Math.random() * 9000);
            const folio = `#COT-${folioNumber}`;

            // 1. Generar y Descargar PDF usando el utilitario
            const pdfItems = cartItems.map(item => ({
                sku: item.product.sku || 'N/A',
                name: item.product.name,
                quantity: item.quantity
            }));

            await generateQuotationPDF(folio, pdfItems, profile);

            // 2. Guardar en Base de Datos
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                // 1. Insertar Cabecera
                const { data: quoteData, error: quoteError } = await supabase
                    .from('cotizaciones')
                    .insert({
                        user_id: session.user.id,
                        folio: folio,
                        total_items: cartItems.length
                    })
                    .select()
                    .single();

                if (quoteError) throw quoteError;

                // 2. Insertar Items
                if (quoteData) {
                    const itemsToInsert = cartItems.map(item => ({
                        cotizacion_id: quoteData.id,
                        product_id: item.product.id,
                        sku: item.product.sku || 'N/A',
                        name: item.product.name,
                        quantity: item.quantity
                    }));

                    const { error: itemsError } = await supabase
                        .from('cotizaciones_items')
                        .insert(itemsToInsert);

                    if (itemsError) throw itemsError;
                }
            }
            
            // Limpiar el carrito tras generar la cotización
            clearCart();
        } catch (err) {
            console.error('Error al generar la cotización:', err);
            alert('Ocurrió un problema al procesar la cotización. Por favor, intenta de nuevo.');
        } finally {
            setGenerating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-4" />
                <p className="text-gray-500 font-bold">Cargando datos de cotización...</p>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="max-w-3xl mx-auto py-20 px-6 text-center bg-white rounded-[2.5rem] shadow-sm border border-gray-100">
                <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ClipboardList className="w-10 h-10 text-amber-500" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Tu cotizador está vacío</h1>
                <p className="text-gray-500 mb-10 max-w-md mx-auto font-bold">Agrega refacciones del catálogo para generar tu presupuesto formal en formato PDF.</p>
                <Link to="/" className="inline-flex items-center gap-2 px-8 py-4 bg-amber-500 text-amber-950 rounded-2xl font-black shadow-lg shadow-amber-100 hover:bg-amber-600 transition-all active:scale-95">
                    <ArrowLeft className="w-5 h-5" />
                    Regresar al Catálogo
                </Link>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto">
            {validationError && (
                <div className="mb-8 p-6 bg-red-50 border-2 border-red-100 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 animate-in zoom-in-95 duration-300 shadow-lg shadow-red-100/50">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                            <AlertCircle className="w-7 h-7 text-red-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-red-900 tracking-tight">¡Perfil Incompleto!</h3>
                            <p className="text-red-600 font-bold">Necesitamos tu nombre y teléfono para procesar tu cotización.</p>
                        </div>
                    </div>
                    <Link 
                        to="/perfil" 
                        className="w-full md:w-auto px-8 py-4 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition-all shadow-md shadow-red-200 active:scale-95"
                    >
                        Completar mi Perfil ahora
                    </Link>
                </div>
            )}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12 border-b border-gray-100 pb-10">
                <div>
                    <h1 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter mb-2">Generar Cotización</h1>
                    <p className="text-gray-400 font-bold flex items-center gap-2 italic">
                        <ClipboardList className="w-5 h-5" />
                        Estás a punto de descargar y recibir por correo un presupuesto formal con {cartItems.length} productos.
                    </p>
                </div>
                <div className="flex items-center gap-4 w-full lg:w-auto">
                    <button 
                        onClick={generatePDF}
                        disabled={generating}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-8 py-5 bg-[#fdc401] text-black rounded-[1.5rem] font-black shadow-xl shadow-[#fdc401]/20 hover:bg-[#cc9e01] transition-all active:scale-95 disabled:opacity-50"
                    >
                        {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <div className="flex items-center gap-2">
                                <Send className="w-5 h-5" />
                                <FileDown className="w-5 h-5" />
                            </div>
                        )}
                        Enviar y Descargar PDF
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                {/* Product List */}
                <div className="xl:col-span-2 space-y-4">
                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Producto</th>
                                        <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Cant.</th>
                                        <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Precio</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {cartItems.map((item) => (
                                        <tr key={item.product.id} className="hover:bg-amber-50/20 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-16 h-16 bg-gray-100 rounded-2xl overflow-hidden shrink-0 border border-gray-200 flex items-center justify-center">
                                                        {item.product.image_url ? (
                                                            <img src={item.product.image_url} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <ClipboardList className="w-6 h-6 text-gray-400" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 group-hover:text-amber-700 transition-colors uppercase tracking-tight">{item.product.name}</p>
                                                        <p className="text-xs font-mono text-gray-400 mt-1 uppercase">SKU: {item.product.sku || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <span className="font-black text-lg bg-gray-50 px-3 py-1 rounded-lg text-gray-700">{item.quantity}</span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <span className="text-xs font-black bg-amber-100 text-amber-700 px-3 py-1 rounded-full uppercase tracking-tighter">A Cotizar</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Profile Data Review */}
                <div className="xl:col-span-1 space-y-6">
                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-8 border-b border-gray-50 pb-6">
                            <div className="bg-amber-50 p-3 rounded-2xl text-amber-600">
                                <User className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-black text-gray-900">Tus Datos Fiscales</h2>
                        </div>

                        {profile ? (
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Nombre / Razón Social</p>
                                    <p className="font-bold text-gray-700">{profile.is_corporate ? profile.corporate_name : `${profile.first_name} ${profile.last_name || ''}`}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">RFC</p>
                                    <p className="font-bold text-gray-700 text-lg uppercase">{profile.rfc || 'No registrado'}</p>
                                </div>
                                <div className="space-y-2 pt-4 border-t border-gray-50">
                                    <div className="flex items-center gap-2 text-gray-500 text-sm font-bold">
                                        <PhoneIcon className="w-4 h-4" /> {profile.phone || 'N/A'}
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-500 text-sm font-bold">
                                        <Mail className="w-4 h-4" /> {profile.email}
                                    </div>
                                </div>
                                
                                <Link to="/perfil" className="w-full flex items-center justify-center gap-2 py-4 text-xs font-black text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-2xl transition-all mt-4 border border-amber-100">
                                    Si tus datos no son correctos, corrígelos aquí
                                </Link>
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <AlertCircle className="w-12 h-12 text-amber-300 mx-auto mb-4" />
                                <p className="text-gray-500 font-bold mb-6">No has completado tu perfil fiscal.</p>
                                <Link to="/perfil" className="inline-block py-4 px-6 bg-amber-500 text-amber-950 font-black rounded-2xl shadow-lg shadow-amber-100 hover:bg-amber-600 transition-all">
                                    Ir a completar perfil
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="bg-amber-950 p-8 rounded-[2rem] text-white">
                        <div className="flex items-center gap-3 mb-4">
                            <Building2 className="w-6 h-6 text-amber-500" />
                            <h3 className="font-black italic">Refaccionaria Cordobesa</h3>
                        </div>
                        <p className="text-xs text-amber-100/60 leading-relaxed font-bold">
                            Esta cotización es una herramienta para tu control interno. Uno de nuestros asesores revisará existencias y precios finales para formalizar tu pedido una vez enviada.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
