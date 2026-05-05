import React, { useEffect, useRef } from 'react';

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  action?: string;
  theme?: 'light' | 'dark' | 'auto';
}

declare global {
  interface Window {
    turnstile: any;
  }
}

export function TurnstileWidget({ onVerify, action = 'login', theme = 'light' }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    let timeoutId: number;
    
    const renderWidget = () => {
      if (window.turnstile && containerRef.current) {
        try {
          widgetId.current = window.turnstile.render(containerRef.current, {
            sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
            callback: (token: string) => {
              onVerify(token);
            },
            'error-callback': () => {
              console.error('Turnstile error');
              onVerify('');
            },
            action,
            theme,
          });
        } catch (e) {
          console.error("Error rendering Turnstile", e);
        }
      } else {
        timeoutId = window.setTimeout(renderWidget, 500);
      }
    };

    renderWidget();

    return () => {
      clearTimeout(timeoutId);
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
      }
    };
  }, [onVerify, action, theme]);

  return <div ref={containerRef} className="my-4 flex justify-center" />;
}
