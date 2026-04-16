import React, { useState } from 'react';
import { X, Save, UserPlus, AlertCircle } from 'lucide-react';
import { supabase, supabaseAdminAuth } from '../lib/supabase';

interface EmployeeFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialEmployee?: any | null;
}

export function EmployeeFormModal({ isOpen, onClose, onSuccess, initialEmployee }: EmployeeFormModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role: 'usuario' as 'admin' | 'empleado' | 'usuario'
    });

    React.useEffect(() => {
        if (isOpen) {
            if (initialEmployee) {
                setFormData({
                    email: initialEmployee.email || '',
                    password: '',
                    first_name: initialEmployee.first_name || '',
                    last_name: initialEmployee.last_name || '',
                    role: (initialEmployee.role as 'admin' | 'empleado' | 'usuario') || 'usuario',
                });
            } else {
                setFormData({ email: '', password: '', first_name: '', last_name: '', role: 'usuario' });
            }
            setError(null);
        }
    }, [isOpen, initialEmployee]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (initialEmployee) {
                // Modo Edición: usar la función RPC segura para actualizar perfil
                const { error: profileError } = await supabase.rpc('update_user_profile', {
                    target_id: initialEmployee.id,
                    new_first_name: formData.first_name || '',
                    new_last_name: formData.last_name || '',
                    new_role: formData.role
                });

                if (profileError) throw profileError;
            } else {
                // Modo Creación: Registrar Auth y luego perfil
                // Si el rol es 'usuario', normalmente se registrarían ellos mismos, 
                // pero permitimos al admin crearlos si es necesario.
                const { data: authData, error: authError } = await supabaseAdminAuth.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        emailRedirectTo: window.location.origin,
                        data: {
                            role: formData.role
                        }
                    }
                });

                if (authError) throw authError;

                const newUserId = authData.user?.id;
                if (!newUserId) throw new Error("No se pudo obtener el ID del usuario recién creado.");

                await new Promise(resolve => setTimeout(resolve, 500));

                const { error: profileError } = await supabase.rpc('update_user_profile', {
                    target_id: newUserId,
                    new_first_name: formData.first_name || '',
                    new_last_name: formData.last_name || '',
                    new_role: formData.role
                });

                if (profileError) throw profileError;
            }

            // Limpiar y cerrar
            setFormData({ email: '', password: '', first_name: '', last_name: '', role: 'usuario' });
            onSuccess();
        } catch (err: any) {
            console.error('Error registrando usuario:', err);
            if (err.message && err.message.includes("User already registered")) {
                setError('Ya existe un usuario con este correo electrónico.');
            } else if (err.message && err.message.includes("Password should be at least")) {
                setError('La contraseña es muy débil (debe tener al menos 6 caracteres).');
            } else {
                setError(err.message || 'Ocurrió un error al intentar procesar la solicitud.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative z-10 animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-2 text-gray-800">
                        <UserPlus className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-bold">{initialEmployee ? 'Editar Usuario' : 'Registrar Nuevo'}</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-start gap-2 text-sm">
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre(s) <span className="text-red-500">*</span></label>
                            <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm" placeholder="Ej: Juan" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos <span className="text-red-500">*</span></label>
                            <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm" placeholder="Ej: Pérez" />
                        </div>
                    </div>

                    <div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico <span className="text-red-500">*</span></label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required disabled={!!initialEmployee} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm disabled:bg-gray-100 disabled:text-gray-500" placeholder="usuario@ejemplo.com" />
                            {initialEmployee && <p className="text-xs text-gray-400 mt-1">El correo de acceso no puede ser modificado aquí.</p>}
                        </div>

                        {!initialEmployee && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña de acceso <span className="text-red-500">*</span></label>
                                <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength={6} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm" placeholder="Mínimo 6 caracteres" />
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rol en el Sistema <span className="text-red-500">*</span></label>
                        <select name="role" value={formData.role} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm bg-white">
                            <option value="usuario">Usuario General (Cliente)</option>
                            <option value="empleado">Empleado (Operativo)</option>
                            <option value="admin">Administrador (Control total)</option>
                        </select>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-3">
                        <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading} className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm">
                            {loading ? (initialEmployee ? 'Actualizando...' : 'Creando cuenta...') : <><Save className="h-4 w-4" /> {initialEmployee ? 'Actualizar Perfil' : 'Registrar Usuario'}</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
