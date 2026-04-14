import { Construction } from 'lucide-react';

export function ComingSoon() {
    const whatsappNumber = "529246886220";
    const message = "Hola, me interesa saber más sobre los nuevos servicios que tendrán disponibles.";
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-[#1a1a1a] font-sans">
            {/* Background Image / Texture */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/construccion_bg.png"
                    alt="Industrial Background"
                    className="w-full h-full object-cover opacity-30 grayscale hover:grayscale-0 transition-all duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a]/80 via-transparent to-[#1a1a1a]"></div>
            </div>

            {/* Industrial Accent Lines */}
            <div className="absolute top-0 left-0 w-full h-4 bg-[#fdc401] z-10 shadow-[0_4px_10px_rgba(0,0,0,0.5)]"></div>
            <div className="absolute bottom-0 left-0 w-full h-4 bg-[#fdc401] z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.5)]"></div>

            <div className="relative z-10 max-w-6xl w-full flex flex-col items-center px-4 md:px-6">
                
                {/* Logo Section */}
                <div className="mb-8 md:mb-12 drop-shadow-2xl animate-in fade-in zoom-in duration-1000">
                    <img 
                        src="/logo.png" 
                        alt="Logo Empresa" 
                        className="h-24 sm:h-32 md:h-40 lg:h-52 w-auto object-contain"
                    />
                </div>

                {/* Construction Graphic */}
                <div className="flex items-center justify-center mb-6 md:mb-10 relative">
                    <div className="absolute inset-0 bg-[#fdc401]/20 blur-[80px] md:blur-[120px] rounded-full scale-150 animate-pulse"></div>
                    <Construction className="w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 text-[#fdc401] drop-shadow-[0_0_20px_rgba(253,196,1,0.5)]" strokeWidth={1} />
                </div>

                {/* Main Heading (Massive) */}
                <div className="text-center space-y-3 md:space-y-6 mb-10 md:mb-16 w-full">
                    <h1 className="text-[18vw] sm:text-[14vw] md:text-[10vw] lg:text-9xl font-[950] text-[#fdc401] tracking-tighter leading-none uppercase italic border-y-[6px] md:border-y-8 border-[#fdc401]/40 py-6 md:py-8 drop-shadow-[0_15px_15px_rgba(0,0,0,0.6)] animate-in slide-in-from-top-4 duration-1000">
                        PRÓXIMA<span className="text-white">MENTE</span>
                    </h1>
                    <div className="flex items-center justify-center gap-2 md:gap-6 mt-4 md:mt-8">
                        <div className="h-[2px] md:h-1 flex-1 bg-gradient-to-r from-transparent to-[#fdc401]/50"></div>
                        <p className="text-white/80 text-[10px] sm:text-xs md:text-sm font-black uppercase tracking-[0.3em] md:tracking-[0.6em] whitespace-nowrap px-2">
                            Sitio en Remodelación
                        </p>
                        <div className="h-[2px] md:h-1 flex-1 bg-gradient-to-l from-transparent to-[#fdc401]/50"></div>
                    </div>
                </div>

                {/* Subtext */}
                <p className="text-white text-base sm:text-lg md:text-2xl font-bold max-w-3xl text-center mb-12 md:mb-20 leading-tight uppercase tracking-wide opacity-95 px-2">
                    Estamos construyendo la plataforma de refacciones más robusta de <span className="text-[#fdc401]">Acayucan</span>
                </p>

                {/* WhatsApp Button (Modern/Industrial) - Full width on mobile */}
                <div className="w-full max-w-sm md:max-w-xl px-4 md:px-0 mb-16 md:mb-24 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
                    <a 
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-center gap-3 md:gap-5 px-6 md:px-16 py-5 md:py-8 bg-[#fdc401] text-black rounded-none font-[950] text-lg sm:text-xl md:text-3xl shadow-[0_20px_70px_-15px_rgba(253,196,1,0.7)] hover:bg-white hover:text-black transition-all active:scale-95 uppercase tracking-tighter border-l-[10px] md:border-l-[15px] border-black text-center"
                        style={{ clipPath: 'polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%)' }}
                    >
                        <img src="/whatsapp.png" alt="" className="w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 object-contain group-hover:invert duration-300" />
                        <span className="leading-none">CONTACTAR POR WHATSAPP</span>
                    </a>
                </div>

                {/* Status Indicator (75%) - More integrated and imponent */}
                <div className="flex flex-col items-center gap-4 group">
                    <div className="flex items-end gap-3 md:gap-5">
                        <span className="text-[#fdc401]/40 text-xs md:text-base font-black tracking-widest uppercase">Estado</span>
                        <span className="text-4xl md:text-6xl font-[950] text-white italic leading-none">75%</span>
                        <span className="text-[#fdc401]/40 text-xs md:text-base font-black tracking-widest uppercase">Completo</span>
                    </div>
                    <div className="w-48 sm:w-64 md:w-96 h-2 md:h-3 bg-white/5 overflow-hidden relative border border-white/10">
                        <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-600 to-[#fdc401] w-[75%] shadow-[0_0_20px_rgba(253,196,1,0.5)]"></div>
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
