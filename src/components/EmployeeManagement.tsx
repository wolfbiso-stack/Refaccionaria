import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Users, Plus, ShieldAlert, User, Trash2, Activity } from 'lucide-react';
import { EmployeeFormModal } from './EmployeeFormModal';
import { EmployeeActivityModal } from './EmployeeActivityModal';

export interface UserProfile {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    role: 'admin' | 'empleado';
}

export function EmployeeManagement() {
    const [employees, setEmployees] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<UserProfile | null>(null);
    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
    const [activityEmployee, setActivityEmployee] = useState<UserProfile | null>(null);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .order('role', { ascending: true }) // admins first ideally
                .order('email', { ascending: true });

            if (error) throw error;
            setEmployees(data || []);
        } catch (error) {
            console.error('Error fetching employees:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 p-3 rounded-full text-emerald-600">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Gestión de Empleados</h1>
                        <p className="text-gray-500 text-sm">Administra los accesos y roles de tu personal</p>
                    </div>
                </div>

                <button
                    onClick={() => {
                        setSelectedEmployee(null);
                        setIsModalOpen(true);
                    }}
                    className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Registrar Empleado
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
                                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm uppercase tracking-wider">
                                    <th className="px-6 py-4 font-semibold">Nombre Completo</th>
                                    <th className="px-6 py-4 font-semibold">Correo Electrónico</th>
                                    <th className="px-6 py-4 font-semibold">Rol</th>
                                    <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {employees.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-full ${emp.role === 'admin' ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-500'}`}>
                                                    {emp.role === 'admin' ? <ShieldAlert className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                                </div>
                                                <span className="font-semibold text-gray-900">
                                                    {emp.first_name || emp.last_name ? `${emp.first_name || ''} ${emp.last_name || ''}` : 'Sin nombre registrado'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{emp.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide
                        ${emp.role === 'admin' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}
                      `}>
                                                {emp.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setActivityEmployee(emp);
                                                        setIsActivityModalOpen(true);
                                                    }}
                                                    className="inline-flex items-center text-gray-600 hover:text-gray-900 text-sm font-medium bg-gray-50 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors border border-gray-200"
                                                    title="Ver Actividad"
                                                >
                                                    <Activity className="h-4 w-4 sm:mr-1.5" />
                                                    <span className="hidden sm:inline">Actividad</span>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedEmployee(emp);
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-900 text-sm font-medium bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        if (window.confirm(`¿Estás seguro de eliminar a ${emp.first_name || emp.email}? Esta acción no se puede deshacer.`)) {
                                                            try {
                                                                const { error } = await supabase.rpc('delete_user', { target_user_id: emp.id });
                                                                if (error) throw error;
                                                                fetchEmployees();
                                                            } catch (err) {
                                                                console.error("Error eliminando usuario:", err);
                                                                alert("No se pudo eliminar el usuario. Asegúrate de haber ejecutado el script SQL en Supabase.");
                                                            }
                                                        }
                                                    }}
                                                    className="text-red-600 hover:text-red-900 text-sm font-medium bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {employees.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                            No se encontraron usuarios registrados.
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
                initialEmployee={selectedEmployee}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedEmployee(null);
                }}
                onSuccess={() => {
                    setIsModalOpen(false);
                    setSelectedEmployee(null);
                    fetchEmployees();
                }}
            />

            <EmployeeActivityModal
                isOpen={isActivityModalOpen}
                employee={activityEmployee}
                onClose={() => {
                    setIsActivityModalOpen(false);
                    setActivityEmployee(null);
                }}
            />

        </div>
    );
}
