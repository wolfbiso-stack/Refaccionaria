export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 pt-10 pb-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1 */}
          <div>
            <h3 className="text-yellow-500 font-bold mb-4 text-lg">¿Quiénes somos?</h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              Tu empresa es una empresa de origen Mexicano, líder en la comercialización y distribución de refacciones para maquinaria pesada y equipo en general. Más de 40 años de experiencia nos respaldan como la mejor opción para la industria. Nuestra presencia se extiende por 7 países y más de 120 sucursales en América Latina.
            </p>
          </div>

          {/* Column 2 */}
          <div>
            <h3 className="text-yellow-500 font-bold mb-4 text-lg">Tu empresa</h3>
            <ul className="space-y-3">
              <li><a href="#" className="font-bold text-gray-800 hover:text-blue-600 transition-colors text-sm">Nosotros</a></li>
              <li><a href="#" className="font-bold text-gray-800 hover:text-blue-600 transition-colors text-sm">Aviso de Privacidad</a></li>
              <li><a href="#" className="font-bold text-gray-800 hover:text-blue-600 transition-colors text-sm">Sucursales</a></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h3 className="text-yellow-500 font-bold mb-4 text-lg">Ayuda</h3>
            <ul className="space-y-3">
              <li><a href="#" className="font-bold text-gray-800 hover:text-blue-600 transition-colors text-sm">Contacto</a></li>
              <li><a href="#" className="font-bold text-gray-800 hover:text-blue-600 transition-colors text-sm">Devoluciones</a></li>
              <li><a href="#" className="font-bold text-gray-800 hover:text-blue-600 transition-colors text-sm">Preguntas frecuentes</a></li>
              <li><a href="#" className="font-bold text-gray-800 hover:text-blue-600 transition-colors text-sm">Ayuda y Soporte</a></li>
            </ul>
          </div>

          {/* Column 4 */}
          <div>
            <h3 className="text-yellow-500 font-bold mb-4 text-lg">Redes Sociales</h3>
            <div className="flex flex-col space-y-3">
              <span className="text-gray-500 text-sm italic">Próximamente</span>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 flex justify-center">
          <p className="text-gray-800 font-bold text-sm text-center">
            Copyright 2025, Tu empresa Mx | Powered by Vtex
          </p>
        </div>
      </div>
    </footer>
  );
}
