import { MapPin, Phone, Clock, ExternalLink, Navigation } from 'lucide-react';

export function SucursalesView() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Hero Section - More compact and elegant */}
            <div className="relative mb-8 lg:mb-12 rounded-[2rem] lg:rounded-[3rem] overflow-hidden bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 p-8 lg:p-14 text-amber-950 shadow-xl shadow-amber-900/5">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-900/10 rounded-full -ml-8 -mb-8 blur-2xl"></div>

                <div className="relative z-10 max-w-3xl">
                    <div className="flex items-center gap-3 mb-4 lg:mb-6">
                        <div className="bg-amber-950/10 p-1.5 rounded-lg">
                            <MapPin className="w-5 h-5 lg:w-6 lg:h-6" />
                        </div>
                        <span className="font-black uppercase tracking-[0.2em] text-[10px] lg:text-xs">Nuestras Oficinas</span>
                    </div>
                    <h1 className="text-4xl lg:text-6xl font-black tracking-tighter mb-4 lg:mb-6 leading-none uppercase italic">
                        Visita nuestra <br />
                        <span className="text-amber-950/90">Sucursal</span>
                    </h1>
                    <p className="text-sm lg:text-base font-bold opacity-90 max-w-xl leading-relaxed">
                        Estamos ubicados estratégicamente para brindarte el mejor servicio y las mejores refacciones de la región. ¡Ven a conocernos!
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">

                {/* Branch Details */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-amber-100/50 transition-all duration-500 group">
                        <h2 className="text-2xl font-black text-gray-900 mb-8 border-b border-gray-50 pb-4">Cordobesa Refacciones</h2>

                        <div className="space-y-8">
                            <div className="flex gap-4">
                                <div className="bg-amber-50 p-3 rounded-2xl text-amber-600 shrink-0 group-hover:scale-110 transition-transform">
                                    <Navigation className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Dirección</p>
                                    <p className="font-bold text-gray-700 leading-snug">
                                        C. Altamirano N° 710, Col. Zapotal <br />
                                        96039 Acayucan, Veracruz.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="bg-amber-50 p-3 rounded-2xl text-amber-600 shrink-0 group-hover:scale-110 transition-transform">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Teléfono</p>
                                    <p className="font-bold text-gray-700 text-lg">9246886220</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="bg-amber-50 p-3 rounded-2xl text-amber-600 shrink-0 group-hover:scale-110 transition-transform">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Horario</p>
                                    <p className="font-bold text-gray-700">Lunes - Viernes: 8:00 AM - 6:00 PM</p>
                                    <p className="font-bold text-gray-700">Sábados: 8:00 AM - 2:00 PM</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10">
                            <a
                                href="https://maps.google.com/?cid=8762030591747706602&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAIYASAA&hl=es-419&gl=MX&source=embed"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-3 bg-amber-500 hover:bg-amber-600 text-amber-950 px-6 py-4 rounded-2xl font-black shadow-lg shadow-amber-100 transition-all active:scale-95"
                            >
                                <ExternalLink className="w-5 h-5" />
                                Abrir en Google Maps
                            </a>
                        </div>
                    </div>

                </div>

                {/* Map Section */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-[3rem] shadow-2xl shadow-amber-900/10 border-8 border-white overflow-hidden h-[600px] relative group">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3795.60265926858!2d-94.91237872413386!3d17.950677283035777!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85ea03991f890a95%3A0x7998fc66643a4eea!2sCordobesa%20Refacciones!5e0!3m2!1ses-419!2smx!4v1775369685487!5m2!1ses-419!2smx"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen={true}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Mapa de Sucursal Cordobesa Refacciones"
                            className="grayscale hover:grayscale-0 transition-all duration-700 transition-all duration-1000 ease-out scale-105 group-hover:scale-100"
                        ></iframe>
                    </div>
                </div>
            </div>
        </div>
    );
}
