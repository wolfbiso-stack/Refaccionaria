import React from 'react';

interface SafeEmailProps {
  className?: string;
  title?: string;
}

/**
 * Component to display the company email while protecting it from simple spam bots.
 * It uses string concatenation and a hidden span to confuse scrapers.
 */
export function SafeEmail({ className = "", title }: SafeEmailProps) {
  const u = "cordobesa_refacciones";
  const d = "hotmail.com";
  
  // Construct email on the fly to avoid having the full string in the static HTML as much as possible
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
