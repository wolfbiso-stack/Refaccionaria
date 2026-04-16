import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export default function ActivarCuenta() {
  const [params] = useSearchParams();

  useEffect(() => {
    // Tomamos el hash que nos manda el template del correo
    const token = params.get("token") || params.get("token_hash");
    const type = params.get("type");
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

    if (token && type && supabaseUrl) {
      // IMPORTANTE: En el nuevo esquema PKCE de Supabase, la API de verificación
      // requiere que el parámetro se llame "token_hash" 
      const verifyUrl = `${supabaseUrl}/auth/v1/verify?token_hash=${token}&type=${type}&redirect_to=${window.location.origin}/`;
      
      // Redirigimos físicamente a Supabase. 
      // Supabase hará la magia de validación y de inmediato redirigirá de vuelto al "redirect_to".
      window.location.href = verifyUrl;
    }
  }, [params]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 border-4 border-[#fdc401] border-t-transparent rounded-full animate-spin mb-6"></div>
      <h2 className="text-2xl lg:text-3xl font-black text-gray-800 tracking-tight uppercase mb-2">
        Activando cuenta...
      </h2>
      <p className="text-gray-500 max-w-md mx-auto">
        Por favor espera un momento mientras validamos tu información con el servidor.
      </p>
    </div>
  );
}
