import React, { useState } from 'react';
import { X, LogIn, AlertCircle, UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!email.trim() || !password.trim()) {
            setError('Por favor, ingresa tu correo y contraseña.');
            setLoading(false);
            return;
        }

        if (isSignUp && password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            setLoading(false);
            return;
        }

        try {
            if (isSignUp) {
                // Registrar nuevo usuario
                const { data, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                });

                if (signUpError) throw signUpError;

                if (data.user) {
                    // Crear perfil en la tabla user_profiles con rol de usuario
                    const { error: profileError } = await supabase
                        .from('user_profiles')
                        .insert([
                            {
                                id: data.user.id,
                                email: email,
                                role: 'usuario'
                            }
                        ]);

                    if (profileError) {
                        console.error('Error al crear perfil:', profileError);
                        // No lanzamos error aquí porque el usuario ya se creó en Auth
                    }
                }
                
                // Si llegamos aquí, el registro fue exitoso
                // Dependiendo de la config de Supabase, puede requerir confirmación de email
                setError('¡Cuenta creada! Revisa tu correo o intenta iniciar sesión.');
                setIsSignUp(false);
            } else {
                // Iniciar sesión
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (signInError) throw signInError;

                onSuccess();
                onClose();
            }
        } catch (err: any) {
            console.error('Error en autenticación:', err);
            if (err.message?.includes('already registered')) {
                setError('Este correo ya está registrado.');
            } else if (err.message?.includes('at least 6 characters')) {
                setError('La contraseña debe tener al menos 6 caracteres.');
            } else {
                setError('Credenciales inválidas o error de conexión.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden relative z-10 animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-2 text-gray-800">
                        <LogIn className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-bold">{isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {error && (
                        <div className={`mb-4 p-3 rounded-lg flex items-start gap-2 text-sm ${error.includes('¡Cuenta creada!') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Correo Electrónico
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all shadow-sm"
                                placeholder="usuario@ejemplo.com"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Contraseña
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all shadow-sm"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {isSignUp && (
                            <div className="animate-in slide-in-from-top-2 duration-200">
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                    Verificar Contraseña
                                </label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all shadow-sm"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        )}
                    </div>

                    <div className="mt-6 space-y-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-black text-amber-950 bg-amber-500 border border-transparent rounded-lg hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                        >
                            {loading ? (
                                <>{isSignUp ? 'Creando cuenta...' : 'Iniciando sesión...'}</>
                            ) : (
                                <>
                                    {isSignUp ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
                                    {isSignUp ? 'Registrarse' : 'Entrar'}
                                </>
                            )}
                        </button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsSignUp(!isSignUp);
                                    setError(null);
                                }}
                                className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Crea una'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
