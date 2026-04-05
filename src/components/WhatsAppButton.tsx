import { MessageCircle } from 'lucide-react';

export function WhatsAppButton() {
  const whatsappNumber = "529246886220";
  const message = "Hola, me gustaría recibir más información sobre sus refacciones.";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-8 left-8 z-50 flex items-center justify-center w-16 h-16 bg-[#25D366] text-white rounded-full shadow-2xl hover:scale-110 hover:bg-[#128C7E] transition-all duration-300 group animate-bounce-subtle"
      title="Contáctanos por WhatsApp"
    >
      <div className="absolute -top-2 -right-1 flex h-5 w-5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-5 w-5 bg-green-500 border-2 border-white"></span>
      </div>
      <MessageCircle className="w-8 h-8 fill-white" />
      
      {/* Tooltip */}
      <span className="absolute left-20 bg-gray-900 text-white text-[10px] font-black px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap uppercase tracking-widest pointer-events-none shadow-xl">
        ¿Necesitas ayuda? Chatea con nosotros
      </span>
    </a>
  );
}
