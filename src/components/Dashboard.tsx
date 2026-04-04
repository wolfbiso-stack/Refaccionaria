import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Package, AlertTriangle, Clock, FileEdit, Users, Bell, Settings, Wrench, ShieldAlert } from 'lucide-react';

interface ProductWithProfiles {
    id: string;
    name: string;
    stock: number;
    created_at: string;
    user_id?: string;
    updated_by?: string;
    creatorEmail: string;
    editorEmail: string;
}

export function Dashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState({
        totalProducts: 0,
        lowStock: 0,
    });
    const [latestAdded, setLatestAdded] = useState<ProductWithProfiles[]>([]);
    const [latestEdited, setLatestEdited] = useState<ProductWithProfiles[]>([]);

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                setLoading(true);
                // Obtener todos los perfiles visuales
                const { data: profilesData } = await supabase.from('user_profiles').select('id, email');
                const profilesMap = new Map(profilesData?.map(p => [p.id, p.email]));

                // Obtener métrica total usando count exacto
                const { count: totalProducts } = await supabase
                    .from('products')
                    .select('*', { count: 'exact', head: true });

                // Obtener métrica de stock bajo usando count exacto
                const { count: lowStock } = await supabase
                    .from('products')
                    .select('*', { count: 'exact', head: true })
                    .lte('stock', 5);

                setMetrics({ 
                    totalProducts: totalProducts || 0, 
                    lowStock: lowStock || 0 
                });

                // Obtener solo los 4 más recientes
                const { data: latestAddedData } = await supabase
                    .from('products')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(4);

                // Obtener solo los 4 recientemente editados
                const { data: latestEditedData } = await supabase
                    .from('products')
                    .select('*')
                    .not('updated_by', 'is', null)
                    .order('created_at', { ascending: false })
                    .limit(4);

                // Mapear perfiles al vuelo
                const mapProfiles = (list: any[]) => (list || []).map(p => ({
                    ...p,
                    creatorEmail: p.user_id ? (profilesMap.get(p.user_id) || 'Desconocido') : 'No registrado',
                    editorEmail: p.updated_by ? (profilesMap.get(p.updated_by) || 'Desconocido') : 'Nunca editado',
                }));

                setLatestAdded(mapProfiles(latestAddedData || []));
                setLatestEdited(mapProfiles(latestEditedData || []));

            } catch (error) {
                console.error("Error loading dashboard data:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="w-full flex flex-col items-center justify-center py-24 space-y-4">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium animate-pulse">Cargando métricas del sistema...</p>
            </div>
        );
    }

    const comingSoonCards = [
        { id: 2, title: "2. Gestión avanzada de inventario", icon: <Package className="w-6 h-6" />, color: "bg-indigo-100 text-indigo-700 hover:border-indigo-300 hover:shadow-indigo-100" },
        { id: 3, title: "3. Gestión de empleados", icon: <Users className="w-6 h-6" />, color: "bg-emerald-100 text-emerald-700 hover:border-emerald-300 hover:shadow-emerald-100" },
        { id: 5, title: "5. Alertas inteligentes", icon: <Bell className="w-6 h-6" />, color: "bg-amber-100 text-amber-700 hover:border-amber-300 hover:shadow-amber-100" },
        { id: 9, title: "9. Configuración del sistema", icon: <Settings className="w-6 h-6" />, color: "bg-gray-100 text-gray-700 hover:border-gray-300 hover:shadow-gray-100" }
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">

            <div className="flex items-center gap-3 mb-8">
                <ShieldAlert className="w-8 h-8 text-blue-600" />
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrativo</h1>
                    <p className="text-gray-500 text-sm">Resumen general y métricas exclusivas del sistema</p>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5">
                    <div className="bg-blue-100 p-4 rounded-full text-blue-600">
                        <Package className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-gray-500 font-medium text-sm">Total de productos</p>
                        <p className="text-3xl font-black text-gray-900">{metrics.totalProducts}</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5">
                    <div className="bg-red-100 p-4 rounded-full text-red-600">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-gray-500 font-medium text-sm">Productos con bajo stock (0-5)</p>
                        <p className="text-3xl font-black text-gray-900">{metrics.lowStock}</p>
                    </div>
                </div>
            </div>

            {/* Tracking Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Latest Added */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="border-b border-gray-100 p-5 bg-gray-50/50 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <h3 className="font-bold text-gray-800">Últimos productos agregados</h3>
                    </div>
                    <div className="p-0 flex-1">
                        {latestAdded.length === 0 ? (
                            <p className="p-5 text-gray-500 text-sm text-center">No hay productos recientes</p>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {latestAdded.map(prod => (
                                    <li key={`add-${prod.id}`} className="p-4 hover:bg-gray-50 transition-colors">
                                        <p className="font-semibold text-gray-900 line-clamp-1">{prod.name}</p>
                                        <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
                                            <span>Agregado por: <strong>{prod.creatorEmail}</strong></span>
                                            <span>Stock: {prod.stock}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Latest Edited */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="border-b border-gray-100 p-5 bg-gray-50/50 flex items-center gap-2">
                        <FileEdit className="w-5 h-5 text-gray-400" />
                        <h3 className="font-bold text-gray-800">Últimas ediciones registradas</h3>
                    </div>
                    <div className="p-0 flex-1">
                        {latestEdited.length === 0 ? (
                            <p className="p-5 text-gray-500 text-sm text-center">Nadie ha editado un producto recientemente</p>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {latestEdited.map(prod => (
                                    <li key={`edit-${prod.id}`} className="p-4 hover:bg-gray-50 transition-colors">
                                        <p className="font-semibold text-gray-900 line-clamp-1">{prod.name}</p>
                                        <p className="mt-1 text-xs text-gray-500">Editado por: <strong>{prod.editorEmail}</strong></p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            {/* Proximamente Cards */}
            <h3 className="font-bold text-gray-800 text-lg mt-8 mb-4 border-b border-gray-200 pb-2">Opciones Avanzadas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {comingSoonCards.map(card => (
                    <div
                        key={card.id}
                        onClick={() => {
                            if (card.id === 3) navigate('/empleados');
                            else if (card.id === 9) navigate('/configuracion');
                            else navigate('/proximamente');
                        }}
                        className={`rounded-2xl p-5 border border-transparent shadow-sm cursor-pointer transition-all hover:-translate-y-1 ${card.color} flex flex-col items-center justify-center text-center`}
                    >
                        <div className="mb-3 bg-white/50 p-3 rounded-full">{card.icon}</div>
                        <p className="font-bold text-sm tracking-tight">{card.title}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
