import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Users, Plus, ShieldAlert, User, Activity } from 'lucide-react';
import { EmployeeFormModal } from './EmployeeFormModal';
import { EmployeeActivityModal } from './EmployeeActivityModal';

export interface UserProfile {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    role: 'admin' | 'empleado' | 'usuario';
}

export function EmployeeManagement() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'personal' | 'clientes'>('personal');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
    const [activityUser, setActivityUser] = useState<UserProfile | null>(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .order('role', { ascending: true })
                .order('email', { ascending: true });

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user => {
        if (activeTab === 'personal') return user.role === 'admin' || user.role === 'empleado';
        return user.role === 'usuario';
    });

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
                        <p className="text-gray-500 text-sm">Administra los accesos y roles de tu plataforma</p>
                    </div>
                </div>

                <button
                    onClick={() => {
                        setSelectedUser(null);
                        setIsModalOpen(true);
                    }}
                    className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-bold rounded-xl text-black bg-[#fdc401] hover:bg-[#cc9e01] shadow-sm transition-all active:scale-95"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Registrar Nuevo
                </button>
            </div>

            {/* Tabs Selector */}
            <div className="flex p-1 bg-gray-100 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('personal')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'personal' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Personal de la Empresa
                </button>
                <button
                    onClick={() => setActiveTab('clientes')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'clientes' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Usuarios Generales
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 flex justify-center">
                        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-[10px] uppercase tracking-[0.2em]">
                                    <th className="px-6 py-4 font-black">Nombre Completo</th>
                                    <th className="px-6 py-4 font-black">Correo Electrónico</th>
                                    <th className="px-6 py-4 font-black">Rol</th>
                                    <th className="px-6 py-4 font-black text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredUsers.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-full ${
                                                    emp.role === 'admin' ? 'bg-yellow-100 text-yellow-600' : 
                                                    emp.role === 'empleado' ? 'bg-blue-100 text-blue-600' : 
                                                    'bg-gray-100 text-gray-500'
                                                }`}>
                                                    {emp.role === 'admin' ? <ShieldAlert className="w-4 h-4" /> : 
                                                     emp.role === 'empleado' ? <Users className="w-4 h-4" /> : 
                                                     <User className="w-4 h-4" />}
                                                </div>
                                                <span className="font-bold text-gray-900">
                                                    {emp.first_name || emp.last_name ? `${emp.first_name || ''} ${emp.last_name || ''}` : 'Sin nombre registrado'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 font-medium">{emp.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border
                                                ${emp.role === 'admin' ? 'bg-yellow-50 text-yellow-800 border-yellow-200' : 
                                                  emp.role === 'empleado' ? 'bg-blue-50 text-blue-800 border-blue-200' : 
                                                  'bg-gray-50 text-gray-600 border-gray-200'}
                                            `}>
                                                {emp.role === 'admin' ? 'ADMINISTRADOR' : 
                                                 emp.role === 'empleado' ? 'EMPLEADO' : 
                                                 'USUARIO'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setActivityUser(emp);
                                                        setIsActivityModalOpen(true);
                                                    }}
                                                    className="inline-flex items-center text-gray-600 hover:text-gray-900 text-xs font-black bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors border border-gray-100"
                                                    title="Ver Actividad"
                                                >
                                                    <Activity className="h-4 w-4 sm:mr-1.5" />
                                                    <span className="hidden sm:inline uppercase">Actividad</span>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(emp);
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-900 text-xs font-black bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors uppercase"
                                                >
                                                    Gestionar
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        if (window.confirm(`¿Estás seguro de eliminar a ${emp.first_name || emp.email}? Esta acción no se puede deshacer.`)) {
                                                            try {
                                                                const { error } = await supabase.rpc('delete_user', { target_user_id: emp.id });
                                                                if (error) throw error;
                                                                fetchUsers();
                                                            } catch (err) {
                                                                console.error("Error eliminando usuario:", err);
                                                                alert("No se pudo eliminar el usuario.");
                                                            }
                                                        }
                                                    }}
                                                    className="text-red-600 hover:text-red-900 text-xs font-black bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors uppercase"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500 font-bold uppercase text-xs tracking-widest">
                                            No se encontraron {activeTab === 'personal' ? 'empleados registrados' : 'usuarios generales'}.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <EmployeeFormModal
                isOpen={isModalOpen}
                initialEmployee={selectedUser}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedUser(null);
                }}
                onSuccess={() => {
                    setIsModalOpen(false);
                    setSelectedUser(null);
                    fetchUsers();
                }}
            />

            <EmployeeActivityModal
                isOpen={isActivityModalOpen}
                employee={activityUser}
                onClose={() => {
                    setIsActivityModalOpen(false);
                    setActivityUser(null);
                }}
            />

        </div>
    );
}
