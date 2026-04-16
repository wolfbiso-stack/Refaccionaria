import React from 'react';
import { Target, Lightbulb, Users, Award, ShieldCheck, History } from 'lucide-react';

export function NosotrosView() {
  return (
    <div className="animate-in fade-in duration-700 space-y-20">
      
      {/* Hero Section */}
      <section className="relative h-[300px] lg:h-[450px] rounded-[3rem] overflow-hidden flex items-center justify-center text-center px-6">
        <div className="absolute inset-0 bg-[#1a1a1a]">
          <div className="absolute inset-0 bg-[#fdc401]/10 mix-blend-overlay"></div>
          {/* Decorative industrial pattern or dots can be added here with CSS */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fdc401 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        </div>
        <div className="relative z-10 max-w-4xl">
          <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter uppercase mb-6 leading-none">
            Nuestra <span className="text-[#fdc401]">Identidad</span>
          </h1>
          <p className="text-gray-400 text-lg lg:text-xl font-bold max-w-2xl mx-auto leading-relaxed">
            Más de una década brindando soluciones robustas para la industria y el agro veracruzano.
          </p>
        </div>
      </section>

      {/* Quiénes Somos Section */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-[#fdc401]/10 border border-[#fdc401]/20 rounded-full text-[#fdc401]">
              <History className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-widest">Experiencia Comprobada</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-none uppercase">
              ¿Quiénes Somos?
            </h2>
            <div className="w-20 h-2 bg-[#fdc401] rounded-full"></div>
            <p className="text-gray-600 text-lg lg:text-xl leading-relaxed font-medium italic border-l-4 border-gray-100 pl-6">
              Somos una empresa de refacciones para maquinaria pesada con más de 10 años de experiencia, agrícola e industrial, al servicio de toda la zona y sus alrededores.
            </p>
            <p className="text-gray-500 text-lg leading-relaxed">
              En nuestro almacén contamos con un amplio surtido en piezas de buena calidad, para brindar una gran confianza al momento de trabajar y para obtener el mejor rendimiento de sus máquinas.
            </p>
            <div className="grid grid-cols-2 gap-6 pt-6">
              <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-4xl font-black text-gray-900 mb-1">+10</p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Años de trayectoria</p>
              </div>
              <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-4xl font-black text-gray-900 mb-1">100%</p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Capital Veracruzano</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-[#fdc401]/10 rounded-[3rem] -z-10 transform rotate-3"></div>
            <div className="bg-[#1a1a1a] aspect-square lg:aspect-[4/5] rounded-[2.5rem] flex items-center justify-center overflow-hidden shadow-2xl relative">
               {/* Aquí se podría poner una foto del equipo o local */}
               <Users className="w-32 h-32 text-[#fdc401] opacity-20 absolute" />
               <div className="p-12 text-center relative z-10">
                  <div className="w-20 h-20 bg-[#fdc401] rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-[#fdc401]/20">
                    <Award className="w-10 h-10 text-black" />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-4 leading-tight uppercase">Calidad Garantizada</h3>
                  <p className="text-gray-400 font-bold">Cada pieza que sale de nuestro almacén cumple con los más altos estándares de rendimiento.</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Misión y Visión Section */}
      <section className="bg-white py-24 rounded-[4rem] shadow-sm border-y border-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Misión */}
            <div className="group bg-gray-50 p-12 rounded-[3rem] border border-transparent hover:border-[#fdc401] hover:bg-white transition-all duration-500">
              <div className="w-16 h-16 bg-[#fdc401]/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#fdc401] transition-colors">
                <Target className="w-8 h-8 text-[#fdc401] group-hover:text-black transition-colors" />
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-6 uppercase tracking-tighter">Nuestra Misión</h3>
              <p className="text-gray-500 leading-relaxed font-bold text-lg">
                <span className="text-[#fdc401]">CORDOBESA REFACCIONES</span> en tiempos difíciles apuesta a enfrentar los retos en la comercialización y distribución de refacciones, brindando calidad en productos, servicios y abastecimientos para sus equipos.
              </p>
            </div>

            {/* Visión */}
            <div className="group bg-gray-50 p-12 rounded-[3rem] border border-transparent hover:border-[#fdc401] hover:bg-white transition-all duration-500 text-right">
              <div className="w-16 h-16 bg-[#fdc401]/10 rounded-2xl flex items-center justify-center mb-8 ml-auto group-hover:bg-[#fdc401] transition-colors">
                <Lightbulb className="w-8 h-8 text-[#fdc401] group-hover:text-black transition-colors" />
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-6 uppercase tracking-tighter">Nuestra Visión</h3>
              <p className="text-gray-500 leading-relaxed font-bold text-lg">
                Ser una empresa eficiente, líder e innovadora en los suministros de refacciones y productos de alta calidad para todo tipo de industria.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Valores / Confianza Section */}
      <section className="max-w-4xl mx-auto px-6 text-center pb-20">
         <div className="bg-[#fdc401] rounded-[3rem] p-12 lg:p-16 shadow-2xl shadow-[#fdc401]/20">
            <ShieldCheck className="w-16 h-16 text-black mx-auto mb-8" />
            <h2 className="text-4xl font-black text-black mb-6 uppercase tracking-tight">Compromiso Industrial</h2>
            <p className="text-amber-950 text-xl font-bold leading-relaxed opacity-80">
              No solo vendemos piezas; entregamos el respaldo necesario para que tu maquinaria nunca se detenga. Nuestra meta es el mejor rendimiento de sus máquinas.
            </p>
         </div>
      </section>

    </div>
  );
}
