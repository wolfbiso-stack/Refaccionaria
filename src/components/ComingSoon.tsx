import { Construction, MessageCircle } from 'lucide-react';

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

            <div className="relative z-10 max-w-6xl w-full flex flex-col items-center px-6">
                
                {/* Logo Section */}
                <div className="mb-10 drop-shadow-2xl">
                    <img 
                        src="/logo.png" 
                        alt="Logo Empresa" 
                        className="h-28 md:h-40 lg:h-52 w-auto object-contain"
                    />
                </div>

                {/* Construction Graphic */}
                <div className="flex items-center justify-center mb-8 relative">
                    <div className="absolute inset-0 bg-[#fdc401]/20 blur-[100px] rounded-full scale-150 animate-pulse"></div>
                    <Construction className="w-24 h-24 md:w-32 md:h-32 text-[#fdc401] drop-shadow-[0_0_20px_rgba(253,196,1,0.5)]" strokeWidth={1} />
                </div>

                {/* Main Heading (Massive) */}
                <div className="text-center space-y-4 mb-12">
                    <h1 className="text-[12vw] md:text-[8vw] lg:text-9xl font-[900] text-[#fdc401] tracking-tighter leading-none uppercase italic border-y-4 border-[#fdc401]/30 py-4 drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
                        PRÓXIMA<span className="text-white">MENTE</span>
                    </h1>
                    <div className="flex items-center justify-center gap-4 mt-6">
                        <div className="h-1 flex-1 bg-gradient-to-r from-transparent to-[#fdc401]"></div>
                        <p className="text-white/60 text-xs md:text-sm font-black uppercase tracking-[0.5em] whitespace-nowrap">
                            Sitio en Remodelación Industrial
                        </p>
                        <div className="h-1 flex-1 bg-gradient-to-l from-transparent to-[#fdc401]"></div>
                    </div>
                </div>

                {/* Subtext */}
                <p className="text-white text-lg md:text-xl font-bold max-w-2xl text-center mb-16 leading-tight uppercase tracking-wide opacity-90">
                    Estamos construyendo la plataforma de refacciones más robusta de México. Prepárate para una nueva experiencia.
                </p>

                {/* WhatsApp Button (Modern/Industrial) */}
                <a 
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-center gap-4 px-12 py-6 bg-[#fdc401] text-black rounded-none clip-path-polygon font-[900] text-xl md:text-2xl shadow-[0_15px_60px_-15px_rgba(253,196,1,0.6)] hover:bg-white hover:text-black transition-all active:scale-95 uppercase tracking-tighter border-l-8 border-black"
                    style={{ clipPath: 'polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%)' }}
                >
                    <MessageCircle className="w-8 h-8 md:w-10 md:h-10 fill-current" />
                    CONTACTAR POR WHATSAPP
                </a>

                {/* Progress Indicator */}
                <div className="mt-20 flex flex-col items-center gap-3">
                    <div className="text-[#fdc401] text-[10px] font-black tracking-[0.4em] uppercase">Estado de Obra</div>
                    <div className="w-64 h-2 bg-white/10 overflow-hidden relative border border-white/5">
                        <div className="absolute top-0 left-0 h-full bg-[#fdc401] w-3/4 animate-pulse"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
