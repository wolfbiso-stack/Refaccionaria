import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Status = "loading" | "success" | "error";

interface AuthCallbackProps {
  onDone: () => void;
}

export default function AuthCallback({ onDone }: AuthCallbackProps) {
  const [status, setStatus] = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let redirectTimer: ReturnType<typeof setTimeout>;

    // El cliente de Supabase intercambia automáticamente el ?code= al cargar.
    // Escuchamos SIGNED_IN / USER_UPDATED que se disparan al confirmar el email.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        setStatus("success");
        // Limpia el ?code= de la URL sin recargar la página
        window.history.replaceState({}, document.title, window.location.pathname + window.location.hash.split("?")[0]);
        redirectTimer = setTimeout(() => onDone(), 3500);
      }
    });

    // Fallback: si después de 8 segundos no hay sesión → error
    const fallback = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setStatus("success");
        redirectTimer = setTimeout(() => onDone(), 3500);
      } else {
        setStatus("error");
        setErrorMsg("El enlace expiró o ya fue usado. Intenta iniciar sesión directamente.");
      }
    }, 8000);

    return () => {
      subscription.unsubscribe();
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
      background: "#ffffff",
      fontFamily: "'Inter', 'Arial', sans-serif",
      textAlign: "center",
      padding: "2rem",
    }}>

      {status === "loading" && (
        <>
          <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
          `}</style>
          <div style={{
            width: 64, height: 64,
            border: "5px solid #f0f0f0",
            borderTop: "5px solid #fdc401",
            borderRadius: "50%",
            animation: "spin 0.9s linear infinite",
            marginBottom: "1.5rem",
          }} />
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "0.5rem", animation: "fadeIn 0.5s ease" }}>
            Activando tu cuenta...
          </h1>
          <p style={{ color: "#6b7280", fontSize: "1rem" }}>Por favor espera un momento.</p>
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
            background: "linear-gradient(135deg, #fdc401 0%, #f59e0b 100%)",
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: "1.5rem",
            boxShadow: "0 12px 40px rgba(253,196,1,0.4)",
            fontSize: "2.8rem",
            animation: "popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
          }}>✅</div>

          <h1 style={{
            fontSize: "2rem", fontWeight: 800, color: "#111827",
            marginBottom: "0.75rem", lineHeight: 1.2,
            animation: "fadeSlideUp 0.5s ease 0.3s both",
          }}>
            ¡Cuenta activada correctamente!
          </h1>
          <p style={{
            color: "#6b7280", fontSize: "1rem", marginBottom: "2rem",
            animation: "fadeSlideUp 0.5s ease 0.45s both",
          }}>
            Bienvenido/a a Córdoba Refacciones.
          </p>

          <div style={{
            display: "flex", alignItems: "center", gap: "0.6rem",
            background: "#f9fafb", border: "1px solid #e5e7eb",
            borderRadius: "999px", padding: "0.6rem 1.4rem",
            color: "#9ca3af", fontSize: "0.875rem",
            animation: "fadeSlideUp 0.5s ease 0.6s both",
          }}>
            <span style={{
              width: 8, height: 8, background: "#fdc401",
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
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#dc2626", marginBottom: "0.75rem" }}>
            No pudimos verificar tu cuenta
          </h1>
          <p style={{ color: "#6b7280", fontSize: "1rem", marginBottom: "2rem", maxWidth: 380 }}>
            {errorMsg}
          </p>
          <button
            onClick={onDone}
            style={{
              padding: "0.75rem 2.5rem",
              background: "#fdc401", color: "#111827",
              border: "none", borderRadius: "999px",
              fontWeight: 700, fontSize: "1rem", cursor: "pointer",
              boxShadow: "0 4px 16px rgba(253,196,1,0.3)",
            }}
          >
            Ir al inicio →
          </button>
        </>
      )}
    </div>
  );
}
