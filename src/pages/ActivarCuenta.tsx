import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function ActivarCuenta() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "error" | "success">("loading");
  const [errMsg, setErrMsg] = useState<string | null>(null);

  useEffect(() => {
    const token = params.get("token") || params.get("token_hash");
    const type = params.get("type");

    if (token && type) {
      // Intentamos verificar la sesión usando el cliente local de Supabase.
      // Esto previene loops de redirección y asegura que inicie sesión al terminar.
      supabase.auth.verifyOtp({ token_hash: token, type: type as any })
        .then(({ data, error }) => {
          if (error) {
            console.error("Error validando la cuenta en el frontend:", error);
            setStatus("error");
            setErrMsg(error.message);
          } else {
            setStatus("success");
            setTimeout(() => window.location.href = "/", 2000);
          }
        })
        .catch(err => {
            setStatus("error");
            setErrMsg("Error de red o conexión fallida.");
        });
    } else {
      setStatus("error");
      setErrMsg("La URL de activación está incompleta o es inválida.");
    }
  }, [params]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      {status === "loading" && (
        <>
          <div className="w-16 h-16 border-4 border-[#fdc401] border-t-transparent rounded-full animate-spin mb-6"></div>
          <h2 className="text-2xl lg:text-3xl font-black text-gray-800 tracking-tight uppercase mb-2">
            Activando cuenta...
          </h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Por favor espera un momento mientras validamos tu información.
          </p>
        </>
      )}

      {status === "error" && (
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl max-w-md w-full border border-red-100 shadow-sm animate-in fade-in zoom-in">
          <h2 className="text-xl font-bold mb-2">Error de activación</h2>
          <p className="mb-6">{errMsg || "Ocurrió un error inesperado."}</p>
          <button 
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      )}

      {status === "success" && (
        <div className="bg-green-50 text-green-600 p-6 rounded-2xl max-w-md w-full border border-green-100 shadow-sm animate-in fade-in zoom-in">
           <svg className="w-16 h-16 mx-auto mb-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
           </svg>
          <h2 className="text-xl font-bold mb-2">¡Cuenta Activada!</h2>
          <p className="mb-2">Tu cuenta ha sido verificada y tu sesión se ha iniciado correctamente.</p>
          <p className="text-sm font-semibold mt-4">Redirigiendo...</p>
        </div>
      )}
    </div>
  );
}
