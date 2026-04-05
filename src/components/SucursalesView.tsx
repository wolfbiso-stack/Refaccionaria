import { MapPin, Phone, Clock, ExternalLink, Navigation } from 'lucide-react';

export function SucursalesView() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Hero Section */}
            <div className="relative mb-12 rounded-[2.5rem] overflow-hidden bg-amber-500 p-12 lg:p-20 text-amber-950">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400 rounded-full -mr-20 -mt-20 opacity-40 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-600 rounded-full -ml-10 -mb-10 opacity-20 blur-2xl"></div>

                <div className="relative z-10 max-w-3xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-amber-950/10 p-2 rounded-lg">
                            <MapPin className="w-6 h-6" />
                        </div>
                        <span className="font-black uppercase tracking-[0.2em] text-sm">Nuestras Oficinas</span>
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-black tracking-tighter mb-8 leading-none italic">
                        Visita nuestra <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-950 to-amber-800">Sucursal Matriz</span>
                    </h1>
                    <p className="text-lg lg:text-xl font-bold opacity-80 max-w-xl leading-relaxed">
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
                                        C. Altamirano, Zapotal <br />
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
                                href="https://maps.app.goo.gl/93566151-2427-4a12-9935-0807a97be7a0"
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
