import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function ActivarCuenta() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = params.get("token"); // Contiene el TokenHash
    const type = params.get("type");

    if (token && type) {
      // Verificamos el token usando el cliente de Supabase (Soporta PKCE nativamente)
      supabase.auth.verifyOtp({
        token_hash: token,
        type: type as any
      }).then(({ error }) => {
        if (error) {
          setError("El enlace ha expirado o es inválido. Por favor solicita uno nuevo.");
          console.error("Error verificando OTP:", error.message);
        } else {
          // Activación exitosa. Supabase automáticamente inicia la sesión.
          // Redirigimos al inicio después de un pequeño retraso para que el usuario pueda ver la pantalla.
          setTimeout(() => {
            window.location.href = "/";
          }, 1500);
        }
      });
    } else {
      setError("Faltan parámetros en el enlace de activación.");
    }
  }, [params]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      {error ? (
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl max-w-md w-full border border-red-100 shadow-sm">
          <h2 className="text-xl font-bold mb-2">Error de activación</h2>
          <p>{error}</p>
          <button 
            onClick={() => navigate("/")}
            className="mt-6 px-6 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      ) : (
        <>
          <div className="w-16 h-16 border-4 border-[#fdc401] border-t-transparent rounded-full animate-spin mb-6"></div>
          <h2 className="text-2xl lg:text-3xl font-black text-gray-800 tracking-tight uppercase mb-2">
            Verificando tu cuenta...
          </h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Estamos validando tu enlace seguro. En un momento serás redirigido.
          </p>
        </>
      )}
    </div>
  );
}
