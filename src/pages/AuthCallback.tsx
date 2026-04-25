import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Status = "loading" | "success" | "error";

interface AuthCallbackProps {
  onDone: (next?: string) => void;
}

export default function AuthCallback({ onDone }: AuthCallbackProps) {
  const [status, setStatus] = useState<Status>(() => {
    // Verificar parámetro de depuración en URL: ?debug=success | error | loading
    const params = new URLSearchParams(window.location.search);
    const debug = params.get("debug");
    if (debug === "success" || debug === "error" || debug === "loading") {
      return debug as Status;
    }
    return "loading";
  });
  const [errorMsg, setErrorMsg] = useState("El enlace es inválido o ha expirado.");
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("debug")) return; // Omitir lógica si está en modo depuración

    let redirectTimer: ReturnType<typeof setTimeout>;

    // El cliente de Supabase intercambia automáticamente el ?code= al cargar.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
      
      if (event === "SIGNED_IN" || event === "USER_UPDATED" || event === "PASSWORD_RECOVERY") {
        setStatus("success");
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Si hay un parámetro 'next', lo respetamos en App.tsx (vía onDone)
        const next = params.get("next");
        redirectTimer = setTimeout(() => onDone(next || undefined), 2500);
      }
    });

    // Lógica de respaldo
    const fallback = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setStatus("success");
        const next = params.get("next");
        redirectTimer = setTimeout(() => onDone(next || undefined), 2500);
      } else {
        setStatus("error");
        setErrorMsg("El enlace ya no es válido. Por favor, intenta de nuevo.");
      }
    }, 8000);

    return () => {
      subscription?.unsubscribe();
      clearTimeout(fallback);
      clearTimeout(redirectTimer);
    };
  }, [onDone]);

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 99999,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      background: "#fdc401", // Caterpillar Yellow
      fontFamily: "'Inter', 'Arial', sans-serif",
      textAlign: "center",
      padding: "2rem",
      color: "#111827",
    }}>

      {status === "loading" && (
        <>
          <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
          `}</style>
          <div style={{
            width: 64, height: 64,
            border: "5px solid rgba(0,0,0,0.1)",
            borderTop: "5px solid #111827",
            borderRadius: "50%",
            animation: "spin 0.9s linear infinite",
            marginBottom: "1.5rem",
          }} />
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111827", marginBottom: "0.5rem", animation: "fadeIn 0.5s ease" }}>
            Verificando acceso...
          </h1>
          <p style={{ color: "#374151", fontSize: "1rem", fontWeight: 500 }}>Por favor espera un momento.</p>
        </>
      )}

      {status === "success" && (
        <>
          <style>{`
            @keyframes popIn { 0% { transform: scale(0.5); opacity: 0; } 70% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
            @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
          `}</style>
          <div style={{
            width: 90, height: 90,
            background: "#111827",
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: "1.5rem",
            boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
            animation: "popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
          }}>
            <svg width="48" height="48" fill="none" stroke="#fdc401" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>

          <h1 style={{
            fontSize: "2rem", fontWeight: 800, color: "#111827",
            marginBottom: "0.75rem", lineHeight: 1.2,
            animation: "fadeSlideUp 0.5s ease 0.3s both",
          }}>
            {isRecovery ? '¡Acceso verificado!' : '¡Cuenta confirmada!'}
          </h1>
          <p style={{
            color: "#374151", fontSize: "1rem", marginBottom: "2rem", fontWeight: 500,
            animation: "fadeSlideUp 0.5s ease 0.45s both",
          }}>
            {isRecovery ? 'Ahora puedes actualizar tu contraseña.' : 'Bienvenido/a a Cordobesa Refacciones.'}
          </p>

          <div style={{
            display: "flex", alignItems: "center", gap: "0.6rem",
            background: "rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.1)",
            borderRadius: "999px", padding: "0.6rem 1.4rem",
            color: "#111827", fontSize: "0.875rem", fontWeight: 700,
            animation: "fadeSlideUp 0.5s ease 0.6s both",
          }}>
            <span style={{
              width: 8, height: 8, background: "#111827",
              borderRadius: "50%", display: "inline-block",
              animation: "pulse 1.2s ease-in-out infinite",
            }} />
            Redirigiendo en unos segundos...
          </div>
        </>
      )}

      {status === "error" && (
        <>
          <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>⚠️</div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#111827", marginBottom: "0.75rem" }}>
            No pudimos verificar tu cuenta
          </h1>
          <p style={{ color: "#374151", fontSize: "1rem", marginBottom: "2rem", maxWidth: 380, fontWeight: 500 }}>
            {errorMsg}
          </p>
          <button
            onClick={onDone}
            style={{
              padding: "0.75rem 2.5rem",
              background: "#111827", color: "#fdc401",
              border: "none", borderRadius: "999px",
              fontWeight: 800, fontSize: "1rem", cursor: "pointer",
              boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
              transition: "transform 0.2s",
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            Ir al inicio →
          </button>
        </>
      )}
    </div>
  );
}
