
import { Target, Lightbulb, Users, Award, ShieldCheck, History, CheckCircle2, TrendingUp, Zap } from 'lucide-react';

export function NosotrosView() {
  return (
    <div className="animate-in fade-in duration-700 space-y-16 lg:space-y-24">
      
      {/* Hero Section - Even more compact and professional */}
      <section className="relative h-[180px] lg:h-[280px] rounded-[1.5rem] lg:rounded-[2.5rem] overflow-hidden flex items-center justify-center text-center px-6 shadow-xl shadow-black/5">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a]">
          <div className="absolute inset-0 bg-[#fdc401]/5 mix-blend-overlay"></div>
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fdc401 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        </div>
        <div className="relative z-10 max-w-4xl">
          <h1 className="text-4xl lg:text-7xl font-black text-white tracking-tighter uppercase mb-4 leading-none">
            Nuestra <span className="text-[#fdc401]">Identidad</span>
          </h1>
          <p className="text-gray-400 text-sm lg:text-lg font-bold max-w-xl mx-auto leading-relaxed opacity-80 uppercase tracking-widest">
            Soluciones robustas para la industria y el agro veracruzano desde hace más de una década.
          </p>
        </div>
      </section>

      {/* Quiénes Somos Section - Clean Grid */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="space-y-6 lg:space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-[#fdc401]/5 border border-[#fdc401]/10 rounded-full text-[#fdc401]">
              <History className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Más de 10 años</span>
            </div>
            <h2 className="text-3xl lg:text-5xl font-black text-gray-900 tracking-tight leading-none uppercase">
              ¿Quiénes Somos?
            </h2>
            <div className="w-16 h-1.5 bg-[#fdc401] rounded-full mx-auto lg:mx-0"></div>
            <div className="space-y-4">
              <p className="text-gray-600 text-base lg:text-lg leading-relaxed font-bold italic border-l-4 border-[#fdc401] pl-6 py-2">
                "Una empresa de refacciones para maquinaria pesada al servicio de toda la zona y sus alrededores."
              </p>
              <p className="text-gray-500 text-sm lg:text-base leading-relaxed font-medium">
                En nuestro almacén contamos con un amplio surtido en piezas de alta calidad, diseñadas para brindar confianza absoluta y maximizar el rendimiento de sus máquinas.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-3xl font-black text-[#fdc401] mb-0.5">+10</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Años de Trayectoria</p>
              </div>
              <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-3xl font-black text-[#fdc401] mb-0.5">100%</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Capital Local</p>
              </div>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute -inset-1.5 bg-gradient-to-tr from-[#fdc401] to-amber-200 rounded-[2rem] -z-10 blur-lg opacity-10 group-hover:opacity-20 transition-opacity"></div>
            <div className="bg-[#1a1a1a] rounded-[2rem] min-h-[220px] lg:min-h-[280px] flex items-center justify-center overflow-hidden shadow-xl relative border border-white/5">
               <Users className="w-24 h-24 text-white opacity-[0.02] absolute transform -rotate-12" />
               <div className="p-6 lg:p-8 text-center relative z-10">
                  <div className="w-12 h-12 bg-[#fdc401] rounded-xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-[#fdc401]/20">
                    <Award className="w-6 h-6 text-black" />
                  </div>
                  <h3 className="text-xl lg:text-2xl font-black text-white mb-2 uppercase tracking-tight">Calidad Sin Compromisos</h3>
                  <p className="text-gray-400 text-[10px] lg:text-xs font-bold leading-relaxed max-w-[240px] mx-auto">Cada componente en nuestro stock cumple con los estándares industriales más exigentes.</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Misión, Visión y Valores - Modern Cards */}
      <section className="bg-gray-50/50 py-16 lg:py-24 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            
            {/* Misión */}
            <div className="bg-white p-8 rounded-[2rem] border border-gray-50 shadow-sm hover:border-[#fdc401]/30 transition-all duration-300">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-4 uppercase tracking-tighter">Misión</h3>
              <p className="text-gray-500 text-sm leading-relaxed font-bold">
                Apostamos a enfrentar los retos en la comercialización de refacciones, brindando calidad en productos y servicios para potenciar sus equipos.
              </p>
            </div>

            {/* Visión */}
            <div className="bg-white p-8 rounded-[2rem] border border-gray-50 shadow-sm hover:border-[#fdc401]/30 transition-all duration-300">
              <div className="w-12 h-12 bg-amber-50 text-[#fdc401] rounded-xl flex items-center justify-center mb-6">
                <Lightbulb className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-4 uppercase tracking-tighter">Visión</h3>
              <p className="text-gray-500 text-sm leading-relaxed font-bold">
                Ser la empresa líder e innovadora en suministros industriales de alta calidad, siendo el aliado estratégico de cada cliente.
              </p>
            </div>

            {/* Valores */}
            <div className="bg-white p-8 rounded-[2rem] border border-gray-50 shadow-sm hover:border-[#fdc401]/30 transition-all duration-300">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-4 uppercase tracking-tighter">Nuestros Valores</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-xs font-bold text-gray-500">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Confianza Absoluta
                </li>
                <li className="flex items-center gap-2 text-xs font-bold text-gray-500">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Calidad Industrial
                </li>
                <li className="flex items-center gap-2 text-xs font-bold text-gray-500">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Servicio Ágil
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Compromiso Section - Compact Banner */}
      <section className="max-w-4xl mx-auto px-6 pb-12 lg:pb-20">
         <div className="relative bg-[#fdc401] rounded-[2rem] lg:rounded-[3rem] p-8 lg:p-10 text-center shadow-lg shadow-[#fdc401]/10 overflow-hidden group">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-48 h-48 bg-black/5 rounded-full blur-3xl group-hover:bg-black/10 transition-colors"></div>
            <div className="relative z-10 max-w-xl mx-auto">
              <ShieldCheck className="w-10 h-10 lg:w-12 lg:h-12 text-black mx-auto mb-4 lg:mb-6" />
              <h2 className="text-2xl lg:text-3xl font-black text-black mb-3 uppercase tracking-tight">Compromiso Industrial</h2>
              <p className="text-black/70 text-sm lg:text-base font-bold leading-relaxed">
                "No solo vendemos piezas; entregamos el respaldo necesario para que tu maquinaria nunca se detenga."
              </p>
              <div className="mt-6 pt-6 border-t border-black/5 flex items-center justify-center gap-6">
                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-black/40">
                  <TrendingUp className="w-3.5 h-3.5" /> Rendimiento
                </div>
                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-black/40">
                  <ShieldCheck className="w-3.5 h-3.5" /> Respaldo
                </div>
              </div>
            </div>
         </div>
      </section>

    </div>
  );
}
