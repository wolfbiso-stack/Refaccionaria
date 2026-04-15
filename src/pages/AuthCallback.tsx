import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Validar sesión automáticamente
    supabase.auth.getSession().then(({ data }) => {
      console.log("Sesión:", data);
    });

    // Espera 3 segundos y redirige
    const timer = setTimeout(() => {
      navigate("/"); // Redirigimos a inicio, ya que el modal de login se maneja desde ahí
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "Arial",
      background: "#fff",
      textAlign: "center"
    }}>
      <div>
        <h1 style={{ color: "#f4c542" }}>
          ✅ Cuenta activada correctamente
        </h1>
        <p>Redirigiendo al inicio de sesión...</p>
      </div>
    </div>
  );
}
