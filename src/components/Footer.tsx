import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 pt-10 pb-6 mt-auto">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1 */}
          <div>
            <h3 className="text-[#fdc401] font-bold mb-4 text-lg uppercase tracking-wider">¿Quiénes somos?</h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              Cordobesa Refacciones es una empresa de origen Mexicano, líder en la comercialización y distribución de refacciones para maquinaria pesada y equipo en general.
            </p>
          </div>

          {/* Column 2 */}
          <div>
            <h3 className="text-[#fdc401] font-bold mb-4 text-lg uppercase tracking-wider">Cordobesa Refacciones</h3>
            <ul className="space-y-3">
              <li><a href="#" className="font-bold text-gray-800 hover:text-[#fdc401] transition-colors text-sm">Nosotros</a></li>
              <li><a href="#" className="font-bold text-gray-800 hover:text-[#fdc401] transition-colors text-sm">Aviso de Privacidad</a></li>
              <li><Link to="/sucursales" className="font-bold text-gray-800 hover:text-[#fdc401] transition-colors text-sm">Sucursales</Link></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h3 className="text-[#fdc401] font-bold mb-4 text-lg uppercase tracking-wider">Contacto</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/ayuda-contacto" className="font-bold text-gray-800 hover:text-[#fdc401] transition-colors text-sm">
                  Ayuda y Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 */}
          <div>
            <h3 className="text-[#fdc401] font-bold mb-4 text-lg uppercase tracking-wider">Redes Sociales</h3>
            <div className="flex items-center gap-4">
              <a 
                href="https://www.facebook.com/cordobesarefax" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-100 p-3 rounded-full text-[#3b5998] hover:bg-[#3b5998] hover:text-white transition-all shadow-sm group"
                title="Síguenos en Facebook"
              >
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 flex justify-center border-t border-gray-100">
          <p className="text-gray-800 font-black text-[10px] text-center uppercase tracking-widest opacity-60">
            Copyright 2026, Cordobesa Refacciones | Powered by CUBI Servicios
          </p>
        </div>
      </div>
    </footer>
  );
}
