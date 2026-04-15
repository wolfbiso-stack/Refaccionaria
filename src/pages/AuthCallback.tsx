import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

type Status = "loading" | "success" | "error";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("Verificando tu cuenta...");

  useEffect(() => {
    // Supabase maneja el intercambio del token automáticamente con onAuthStateChange.
    // Escuchamos el evento SIGNED_IN que se dispara tras confirmar el correo.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth event:", event, session);

      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        setStatus("success");
        setMessage("Tu cuenta ha sido activada correctamente.");
        // Redirigir después de 3 segundos
        setTimeout(() => navigate("/"), 3000);
      } else if (event === "TOKEN_REFRESHED") {
        setStatus("success");
        setMessage("Tu cuenta ha sido activada correctamente.");
        setTimeout(() => navigate("/"), 3000);
      }
    });

    // También intentar obtener la sesión actual por si el evento ya ocurrió
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setStatus("success");
        setMessage("Tu cuenta ha sido activada correctamente.");
        setTimeout(() => navigate("/"), 3000);
      } else {
        // Si no hay sesión después de 6 segundos, mostrar error
        const fallback = setTimeout(() => {
          setStatus("error");
          setMessage("No pudimos verificar tu cuenta. El enlace puede haber expirado.");
        }, 6000);
        return () => clearTimeout(fallback);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "#ffffff",
        fontFamily: "'Inter', 'Arial', sans-serif",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      {status === "loading" && (
        <>
          {/* Spinner animado */}
          <div
            style={{
              width: 64,
              height: 64,
              border: "5px solid #f0f0f0",
              borderTop: "5px solid #fdc401",
              borderRadius: "50%",
              animation: "spin 0.9s linear infinite",
              marginBottom: "1.5rem",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "0.5rem" }}>
            Verificando tu cuenta...
          </h1>
          <p style={{ color: "#6b7280", fontSize: "1rem" }}>Por favor espera un momento.</p>
        </>
      )}

      {status === "success" && (
        <>
          {/* Ícono de éxito */}
          <div
            style={{
              width: 80,
              height: 80,
              background: "linear-gradient(135deg, #fdc401 0%, #f59e0b 100%)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1.5rem",
              boxShadow: "0 8px 32px rgba(253,196,1,0.35)",
              fontSize: "2.5rem",
            }}
          >
            ✅
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#111827", marginBottom: "0.75rem", lineHeight: 1.2 }}>
            ¡Cuenta activada correctamente!
          </h1>
          <p style={{ color: "#6b7280", fontSize: "1rem", marginBottom: "2rem" }}>
            {message}
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: "999px",
              padding: "0.6rem 1.4rem",
              color: "#9ca3af",
              fontSize: "0.875rem",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                background: "#fdc401",
                borderRadius: "50%",
                display: "inline-block",
                animation: "pulse 1.2s ease-in-out infinite",
              }}
            />
            <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
            Redirigiendo en 3 segundos...
          </div>
        </>
      )}

      {status === "error" && (
        <>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#dc2626", marginBottom: "0.75rem" }}>
            No pudimos verificar tu cuenta
          </h1>
          <p style={{ color: "#6b7280", fontSize: "1rem", marginBottom: "2rem" }}>
            {message}
          </p>
          <button
            onClick={() => navigate("/")}
            style={{
              padding: "0.75rem 2rem",
              background: "#fdc401",
              color: "#111827",
              border: "none",
              borderRadius: "999px",
              fontWeight: 700,
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Ir al inicio
          </button>
        </>
      )}
    </div>
  );
}
