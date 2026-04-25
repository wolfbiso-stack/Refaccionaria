import React from 'react';

interface SafeEmailProps {
  className?: string;
  title?: string;
}

/**
 * Componente para mostrar el correo de la empresa mientras lo protege de bots de spam simples.
 * Utiliza concatenación de cadenas y un span oculto para confundir a los scrapers.
 */
export function SafeEmail({ className = "", title }: SafeEmailProps) {
  const u = "cordobesa_refacciones";
  const d = "hotmail.com";
  
  // Construir correo electrónico sobre la marcha para evitar tener la cadena completa en el HTML estático tanto como sea posible
  const getFullEmail = () => `${u}@${d}`;

  return (
    <a 
      href={`mailto:${getFullEmail()}`} 
      className={className}
      title={title || getFullEmail()}
    >
      {u}
      <span className="hidden" aria-hidden="true">
        -antispam-protection-
      </span>
      @{d}
    </a>
  );
}
