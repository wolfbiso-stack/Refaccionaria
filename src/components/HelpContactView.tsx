import { useState } from 'react';
import { Phone, Mail, MessageCircle, MapPin, Clock, ShieldCheck, HeartHandshake, Send, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function HelpContactView() {
    const phoneNumber = "9246886220";
    const waNumber = "529246886220";
    const email = "cordobesa_refacciones@hotmail.com";
    const facebookUrl = "https://www.facebook.com/cordobesarefax";

    const address = "C. Altamirano, Zapotal, 96039 Acayucan, Veracruz";
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

    const [showContactForm, setShowContactForm] = useState(false);
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        setError(null);

        try {
            const { error: invokeError } = await supabase.functions.invoke('send-support-email', {
                body: formData
            });

            if (invokeError) throw invokeError;

            setSuccess(true);
            setFormData({ name: '', email: '', subject: '', message: '' });

            // Reset state after 5 seconds
            setTimeout(() => {
                setSuccess(false);
                setShowContactForm(false);
            }, 5000);

        } catch (err: any) {
            console.error('Error sending support email:', err);

            // Check for specific error messages or 404
            let errorMsg = 'Ocurrió un error al enviar tu mensaje. Por favor, intenta de nuevo.';

            if (err.message?.includes('404')) {
                errorMsg = 'El sistema de soporte no ha sido desplegado aún. Por favor, contacta por WhatsApp.';
                console.warn('Edge Function "send-support-email" not found. Need to deploy/serve.');
            } else if (err.message) {
                errorMsg = `Error: ${err.message}. Intenta de nuevo.`;
            }

            setError(errorMsg);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-700 max-w-6xl mx-auto py-10">
            {/* Hero Section */}
            <div className="bg-[#fdc401] rounded-[2.5rem] p-10 lg:p-16 text-center shadow-xl shadow-[#fdc401]/10 border-4 border-white relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <h1 className="text-4xl lg:text-5xl font-black text-amber-950 mb-4 tracking-tighter uppercase relative z-10">¿Cómo podemos ayudarte?</h1>
                <p className="text-amber-900/80 font-bold max-w-2xl mx-auto leading-relaxed relative z-10">
                    En Cordobesa Refacciones, tu maquinaria es nuestra prioridad. Encuentra soporte directo con nuestros especialistas o visítanos en nuestras instalaciones.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Information Column */}
                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                        <h2 className="text-[10px] font-black text-[#fdc401] uppercase tracking-[0.3em] mb-4 flex items-center">
                            <ShieldCheck className="w-5 h-5 mr-3" />
                            Sobre Nosotros
                        </h2>
                        <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Líderes en Refacciones para Maquinaria Pesada</h3>
                        <p className="text-gray-600 font-medium leading-relaxed mb-6">
                            Con más de 10 años de experiencia en el mercado mexicano, Cordobesa Refacciones se ha consolidado como el aliado estratégico para a maquinaria pesada, agrícola e industrial.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center group hover:border-[#fdc401] transition-colors">
                                <span className="text-3xl font-black text-gray-900 group-hover:text-[#fdc401]">10+</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Años de Exp.</span>
                            </div>
                            <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center group hover:border-[#fdc401] transition-colors">
                                <span className="text-3xl font-black text-gray-900 group-hover:text-[#fdc401]">100%</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Garantizado</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#fdc401]/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-[#fdc401]/20 transition-all"></div>
                        <h2 className="text-[10px] font-black text-[#fdc401] uppercase tracking-[0.3em] mb-6 flex items-center">
                            <Clock className="w-5 h-5 mr-3" />
                            Horarios de Atención
                        </h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                <span className="font-bold text-gray-400">Lunes a Viernes:</span>
                                <span className="font-black text-white">9:00 AM - 6:00 PM</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                <span className="font-bold text-gray-400">Sábado:</span>
                                <span className="font-black text-white">9:00 AM - 3:00 PM</span>
                            </div>
                            <div className="flex justify-between items-center text-[#fdc401]">
                                <span className="font-bold">Domingo:</span>
                                <span className="font-black italic">Cerrado</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Cards Column */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <a
                        href={`tel:${phoneNumber}`}
                        className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-[#fdc401]/10 hover:border-[#fdc401]/20 transition-all flex flex-col items-center justify-center gap-4 text-center group"
                    >
                        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                            <Phone className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Teléfono Directo</p>
                            <p className="text-xl font-black text-gray-800 tracking-tighter">924 688 6220</p>
                        </div>
                    </a>

                    <a
                        href={`mailto:${email}`}
                        className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-red-50 hover:border-red-200 transition-all flex flex-col items-center justify-center gap-4 text-center group overflow-hidden"
                    >
                        <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all shadow-sm">
                            <Mail className="w-7 h-7" />
                        </div>
                        <div className="w-full truncate px-3">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email</p>
                            <p className="text-xs font-black text-gray-800 truncate" title={email}>{email}</p>
                        </div>
                    </a>

                    <a
                        href={`https://wa.me/${waNumber}?text=${encodeURIComponent('Hola, necesito ayuda respecto a mi maquinaria.')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-green-100 hover:border-green-200 transition-all flex flex-col items-center justify-center gap-4 text-center group"
                    >
                        <div className="w-14 h-14 bg-green-50 text-green-600 rounded-full flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-all shadow-sm">
                            <MessageCircle className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">WhatsApp Chat</p>
                            <p className="text-xl font-black text-gray-800 tracking-tighter">Enviar Mensaje</p>
                        </div>
                    </a>

                    <a
                        href={facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-50 hover:border-blue-200 transition-all flex flex-col items-center justify-center gap-4 text-center group"
                    >
                        <div className="w-14 h-14 bg-[#3b5998]/5 text-[#3b5998] rounded-full flex items-center justify-center group-hover:bg-[#3b5998] group-hover:text-white transition-all shadow-sm">
                            <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Facebook</p>
                            <p className="text-xl font-black text-gray-800 tracking-tighter">cordobesarefax</p>
                        </div>
                    </a>
                </div>
            </div>

            {/* Location Section */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden p-8 lg:p-12 relative group">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#fdc401]"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-1 space-y-6">
                        <div className="w-16 h-16 bg-[#fdc401]/10 text-[#917101] rounded-3xl flex items-center justify-center border border-[#fdc401]/20">
                            <MapPin className="w-8 h-8" />
                        </div>
                        <h3 className="text-3xl font-black text-gray-900 tracking-tight">Nuestra Ubicación Principal</h3>
                        <p className="text-gray-600 font-medium leading-relaxed">
                            Calle Altamirano en la Colonia Zapotal, Acayucan, Veracruz. Punto estratégico para el servicio en todo el sureste mexicano.
                        </p>
                        <div className="pt-6 border-t border-gray-50">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Dirección Completa</p>
                            <p className="font-bold text-gray-900 leading-tight">
                                {address}
                            </p>
                        </div>
                        <a
                            href={googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all hover:scale-105 active:scale-95 shadow-xl shadow-gray-200"
                        >
                            Ver en Google Maps
                        </a>
                    </div>
                    <div className="lg:col-span-2">
                        <div className="h-[400px] w-full rounded-3xl bg-gray-100 overflow-hidden border-4 border-gray-50 flex items-center justify-center relative shadow-inner">
                            <img src="/logo.png" className="absolute top-8 right-8 h-10 opacity-20 grayscale pointer-events-none" alt="" />
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-gray-200/50 flex flex-col items-center justify-center gap-4 text-center p-8">
                                <div className="bg-white p-4 rounded-full shadow-lg border border-gray-100">
                                    <MapPin className="w-10 h-10 text-red-500 animate-bounce" />
                                </div>
                                <h4 className="text-xl font-black text-gray-800 tracking-tight">Acayucan, Veracruz</h4>
                                <p className="text-sm text-gray-500 font-bold max-w-xs leading-relaxed">Te esperamos con las puertas abiertas para brindarte la mejor asesoría técnica.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section / Contact Form */}
            <div className="bg-white rounded-[2.5rem] p-10 lg:p-16 text-center border-t border-b border-gray-100 shadow-sm relative overflow-hidden transition-all duration-500">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-1 w-32 h-2 bg-[#fdc401] rounded-full"></div>

                {!showContactForm ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <HeartHandshake className="w-16 h-16 text-[#fdc401] mx-auto mb-6" />
                        <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">¿Prefieres atención personalizada?</h2>
                        <p className="text-gray-500 font-bold mb-8 max-w-sm mx-auto leading-relaxed">Déjanos tus datos o mándanos un correo y un ejecutivo se pondrá en contacto contigo a la brevedad.</p>
                        <button
                            onClick={() => setShowContactForm(true)}
                            className="inline-flex items-center justify-center px-12 py-5 bg-[#fdc401] text-black rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-[#fdc401]/20 hover:bg-[#cc9e01] transition-all hover:scale-105 active:scale-95"
                        >
                            Enviar Mensaje
                        </button>
                    </div>
                ) : (
                    <div className="max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-500">
                        <div className="flex justify-between items-center mb-10">
                            <div className="text-left">
                                <h3 className="text-3xl font-black text-gray-900 tracking-tight">¡Déjanos un mensaje!</h3>
                                <p className="text-gray-400 font-bold">Un ejecutivo te responderá pronto.</p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowContactForm(false);
                                    setSuccess(false);
                                    setError(null);
                                }}
                                className="p-3 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {success ? (
                            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in-90">
                                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-2">
                                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                                </div>
                                <h4 className="text-2xl font-black text-gray-900">¡Mensaje Enviado!</h4>
                                <p className="text-gray-500 font-bold max-w-xs">Hemos recibido tu solicitud y te contactaremos en breve. ¡Gracias!</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6 text-left">
                                {error && (
                                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold animate-in shake duration-300">
                                        <AlertCircle className="w-5 h-5" />
                                        {error}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tu Nombre</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-[#fdc401] focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-800"
                                            placeholder="Ej. Juan Pérez"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tu Correo</label>
                                        <input
                                            required
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-[#fdc401] focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-800"
                                            placeholder="correo@ejemplo.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Asunto</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-[#fdc401] focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-800"
                                        placeholder="Ej. Cotización Especial / Problema Técnico"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mensaje</label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-[#fdc401] focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-800 resize-none"
                                        placeholder="Escribe tu mensaje aquí..."
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={sending}
                                    className="w-full py-5 bg-[#fdc401] text-black rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-[#fdc401]/20 hover:bg-[#cc9e01] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {sending ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Enviando mensaje...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            Enviar Mensaje
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
