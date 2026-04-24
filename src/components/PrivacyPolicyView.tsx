import { Shield, ArrowLeft, Clock, FileText, Lock, Globe, UserCheck, RefreshCw, Eye, Scale, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SafeEmail } from './SafeEmail';

export function PrivacyPolicyView() {
  const navigate = useNavigate();
  const lastUpdate = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 py-4 lg:py-10">
      
      {/* Header / Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-4">
        <button
          onClick={() => navigate(-1)}
          className="group inline-flex items-center text-sm font-bold text-gray-500 hover:text-gray-900 transition-all"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Regresar
        </button>

        <div className="flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-lg border border-gray-200">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
            Última actualización: {lastUpdate}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Header Section - More Formal */}
        <div className="bg-gray-50 border-b border-gray-200 p-8 lg:p-12 text-center">
            <Scale className="w-12 h-12 text-gray-400 mx-auto mb-6" />
            <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 tracking-tight uppercase mb-4">
              Aviso de Privacidad Integral
            </h1>
            <div className="w-20 h-1 bg-amber-500 mx-auto mb-6"></div>
            <p className="text-gray-500 font-medium max-w-2xl mx-auto text-sm lg:text-base">
              Cordobesa Refacciones se compromete a proteger su privacidad y asegurar que sus datos personales 
              sean tratados con la mayor confidencialidad y conforme a la ley.
            </p>
        </div>

        <div className="p-8 lg:p-16 space-y-12">
          
          {/* Introduction */}
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 font-medium leading-relaxed text-sm lg:text-base border-l-2 border-gray-300 pl-6">
              En cumplimiento con lo dispuesto por la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (en lo sucesivo, la “Ley”), <strong>Cordobesa Refacciones</strong>, con domicilio en Acayucan, Veracruz, México, y portal de internet <strong>cordobesarefacciones.mx</strong>, es responsable del tratamiento de los datos personales que recaba de sus clientes y usuarios (en lo sucesivo, el “Titular”).
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12">
            
            {/* Section 1 */}
            <section className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900 uppercase border-b border-gray-100 pb-2">I. Datos personales recabados</h2>
              <div className="bg-white rounded-lg p-6 border border-gray-100">
                <p className="text-gray-600 text-sm mb-4">Cordobesa Refacciones podrá recabar de manera directa o a través de su sitio web los siguientes datos personales:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {['Nombre completo', 'Correo electrónico', 'Número telefónico', 'Registro Federal de Contribuyentes (RFC)'].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-6 text-xs text-gray-400 font-medium italic italic">El Titular manifiesta que los datos proporcionados son veraces y actualizados.</p>
              </div>
            </section>

            {/* Section 2 */}
            <section className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900 uppercase border-b border-gray-100 pb-2">II. Finalidades del tratamiento</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 underline decoration-amber-500 underline-offset-4 mb-4">Finalidades Primarias</h3>
                  <ul className="space-y-2">
                    {[
                      'Proveer los productos y servicios solicitados',
                      'Dar seguimiento a solicitudes, cotizaciones o pedidos',
                      'Contactar al Titular para fines relacionados con la relación comercial',
                      'Emitir comprobantes fiscales conforme a la normativa aplicable',
                      'Brindar atención y soporte al cliente'
                    ].map((text, i) => (
                      <li key={i} className="flex gap-3 text-sm text-gray-600">
                        <span className="text-gray-300">•</span> {text}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 underline decoration-blue-500 underline-offset-4 mb-4">Finalidades Secundarias</h3>
                  <ul className="space-y-2 mb-4">
                    {[
                      'Envío de información promocional, ofertas o novedades',
                      'Evaluación de la calidad del servicio'
                    ].map((text, i) => (
                      <li key={i} className="flex gap-3 text-sm text-gray-600">
                        <span className="text-gray-300">•</span> {text}
                      </li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-gray-400 leading-relaxed bg-gray-50 p-4 rounded-md">
                    En caso de que el Titular no desee que sus datos personales sean tratados para las finalidades secundarias, podrá manifestarlo mediante los medios de contacto indicados en el presente aviso.
                  </p>
                </div>
              </div>
            </section>

            {/* Sections 3-4-6-7 (Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              <section className="space-y-3">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <Lock className="w-4 h-4 text-gray-400" />
                  III. Opciones para limitar el uso
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Cordobesa Refacciones ha implementado medidas de seguridad administrativas, técnicas y físicas para proteger los datos personales contra daño, pérdida, alteración, destrucción o uso, acceso o tratamiento no autorizado.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-gray-400" />
                  IV. Transferencia de datos
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Cordobesa Refacciones no transferirá los datos personales del Titular a terceros sin su consentimiento, salvo en los casos previstos por la Ley o cuando sea requerido por autoridad competente.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gray-400" />
                  VI. Cookies y Tecnologías
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  El sitio web <strong>cordobesarefacciones.mx</strong> podrá utilizar cookies y otras tecnologías para monitorear el comportamiento del usuario y mejorar la experiencia de navegación. Puede deshabilitarlas desde su navegador.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-gray-400" />
                  VII. Cambios al aviso
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Nos reservamos el derecho de efectuar en cualquier momento modificaciones o actualizaciones al presente aviso de privacidad. Dichas modificaciones estarán disponibles en nuestro sitio web.
                </p>
              </section>
            </div>

            {/* Section 5 - Derechos ARCO */}
            <section className="space-y-6 pt-6">
              <h2 className="text-lg font-bold text-gray-900 uppercase border-b border-gray-100 pb-2">V. Derechos ARCO</h2>
              <div className="bg-gray-50 rounded-lg p-8">
                <p className="text-sm text-gray-700 mb-6 font-medium">
                  El Titular tiene derecho a acceder, rectificar y cancelar sus datos personales, así como oponerse al tratamiento de los mismos o revocar el consentimiento otorgado.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Requisitos de la solicitud:</p>
                    <ul className="space-y-2">
                      {['Nombre del Titular', 'Descripción clara del derecho a ejercer', 'Datos que permitan su identificación'].map((text, i) => (
                        <li key={i} className="flex gap-2 text-xs text-gray-600 font-semibold">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> {text}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-6 bg-white rounded-lg border border-gray-200 text-center">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">Contacto Derechos ARCO</p>
                    <SafeEmail className="text-base font-bold text-gray-900" />
                  </div>
                </div>
              </div>
            </section>

            {/* Section 8 - Final */}
            <section className="pt-10 border-t border-gray-100 text-center space-y-6">
              <h2 className="text-lg font-bold text-gray-900 uppercase">VIII. Consentimiento</h2>
              <p className="text-sm text-gray-500 max-w-2xl mx-auto leading-relaxed">
                El Titular manifiesta que ha leído y acepta los términos del presente aviso de privacidad, otorgando su consentimiento para el tratamiento de sus datos personales conforme a lo aquí establecido.
              </p>
              <div className="pt-10 opacity-30 grayscale pointer-events-none">
                 <img src="/logo.png" alt="Logo" className="h-12 mx-auto" />
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
