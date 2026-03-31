import { Construction, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ComingSoon() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center max-w-2xl mx-auto">
            <div className="bg-yellow-100 p-6 rounded-full mb-6">
                <Construction className="h-16 w-16 text-yellow-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Módulo en Construcción</h1>
            <p className="text-lg text-gray-600 mb-8">
                Esta función ("Próximamente") está actualmente en desarrollo y será liberada en una futura actualización.
            </p>
            <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
            >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Regresar al Dashboard
            </button>
        </div>
    );
}
