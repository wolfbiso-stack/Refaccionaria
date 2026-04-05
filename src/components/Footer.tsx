import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 pt-10 pb-6 mt-auto">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1 */}
          <div>
            <h3 className="text-amber-600 font-bold mb-4 text-lg">¿Quiénes somos?</h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              Cordobesa Refacciones es una empresa de origen Mexicano, líder en la comercialización y distribución de refacciones para maquinaria pesada y equipo en general. Más de 40 años de experiencia nos respaldan como la mejor opción para la industria.
            </p>
          </div>

          {/* Column 2 */}
          <div>
            <h3 className="text-amber-600 font-bold mb-4 text-lg">Cordobesa Refacciones</h3>
            <ul className="space-y-3">
              <li><a href="#" className="font-bold text-gray-800 hover:text-amber-600 transition-colors text-sm">Nosotros</a></li>
              <li><a href="#" className="font-bold text-gray-800 hover:text-amber-600 transition-colors text-sm">Aviso de Privacidad</a></li>
              <li><Link to="/sucursales" className="font-bold text-gray-800 hover:text-amber-600 transition-colors text-sm">Sucursales</Link></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h3 className="text-amber-600 font-bold mb-4 text-lg">Ayuda / Contacto</h3>
            <ul className="space-y-3">
              <li className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-4 mb-2">Dirección</li>
              <li className="text-sm font-bold text-gray-700 leading-snug">
                C. Altamirano, Zapotal <br />
                96039 Acayucan, Veracruz.
              </li>
              <li className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-4 mb-2">Atención</li>
              <li className="text-sm font-bold text-amber-600">924 688 6220</li>
              <li className="text-sm font-bold text-gray-500 lowercase">ventas@refaccionariacordobesa.com</li>
            </ul>
          </div>

          {/* Column 4 */}
          <div>
            <h3 className="text-amber-600 font-bold mb-4 text-lg">Redes Sociales</h3>
            <div className="flex flex-col space-y-3">
              <span className="text-gray-500 text-sm italic">Próximamente</span>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 flex justify-center border-t border-gray-100">
          <p className="text-gray-800 font-black text-[10px] text-center uppercase tracking-widest">
            Copyright 2026, Cordobesa Refacciones | Powered by CUBI Servicios
          </p>
        </div>
      </div>
    </footer>
  );
}
